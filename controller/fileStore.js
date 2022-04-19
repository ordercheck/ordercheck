const db = require("../model/db");
const {
  getFileName,
  makePureText,
  checkTitle,
  searchFileandFolder,
} = require("../lib/apiFunctions");
const { random5 } = require("../lib/functions");
const { Op } = require("sequelize");

const {
  showDetailFileAttributes,
  showDetailFolderAttributes,
  showFilesAttributes,
  getUserListAttributes,
} = require("../lib/attributes");

const { fileStoreSort } = require("../lib/checkData");

const getFolderPath = async (pathData, customerFile_idx, joinData) => {
  const pathArr = pathData.split("/");

  const findTitleResult = await db.folders.findAll({
    where: { uuid: { [Op.in]: pathArr }, customerFile_idx },
    attributes: ["title"],
    order: [["createdAt", "ASC"]],
    raw: true,
    nest: true,
  });

  const path = [];
  findTitleResult.forEach((data) => {
    path.push(data.title);
  });

  pathData = path.join(joinData);

  return pathData;
};
module.exports = {
  getUserList: async (req, res, next) => {
    const { company_idx, user_idx } = req;
    try {
      // 소유주 체크
      const check = await db.company.findByPk(company_idx, {
        attributes: ["huidx"],
      });

      if (check.huidx == user_idx) {
        console.log("이거 타라");
        const findAllCustomers = await db.customerFile.findAll({
          where: { company_idx },
          attributes: getUserListAttributes,
          order: [["customer_name", "ASC"]],
        });
        return res.send({ success: 200, findAllCustomers });
      }

      // 파일저장소 고객찾기
      let findCustomer = await db.customer.findAll({
        where: { company_idx, contact_person: user_idx, deleted: null },
        group: ["customer_phoneNumber"],
        attributes: ["customer_phoneNumber"],
        raw: true,
      });

      const findCustomerArr = [];
      findCustomer = findCustomer.forEach((data) => {
        findCustomerArr.push(data.customer_phoneNumber);
      });

      const findAllCustomers = await db.customerFile.findAll({
        where: {
          customer_phoneNumber: { [Op.in]: findCustomerArr },
          company_idx,
        },
        attributes: getUserListAttributes,
        order: [["customer_name", "ASC"]],
      });

      return res.send({ success: 200, findAllCustomers });
    } catch (err) {
      next(err);
    }
  },

  showRootFoldersAndFiles: async (req, res, next) => {
    let { customerFile_idx, sort_field, sort } = req.params;

    const checkResult = fileStoreSort(sort_field, sort);

    sort_field = checkResult.sort_field;
    sort = checkResult.sort;

    const folders = await db.folders.findAll({
      where: { customerFile_idx, root: true },
      order: [[sort_field, sort]],
    });

    const files = await db.files.findAll({
      where: {
        customerFile_idx,
        folder_uuid: null,
      },
      order: [[sort_field, sort]],
    });

    return res.send({ success: 200, folders, files });
  },
  addFolder: async (req, res, next) => {
    const {
      body: { title },
      params: { customerFile_idx },
      company_idx,
      user_idx,
    } = req;

    // 그냥 text로 변환

    const t = await db.sequelize.transaction();
    try {
      const findUserResult = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      const newUuid = random5();
      if (req.body.root) {
        const insertData = await checkTitle(
          db.folders,
          { root: true, title, customerFile_idx, company_idx },
          title,
          req.body
        );

        const pureText = makePureText(insertData.title);
        insertData.searchingTitle = pureText;
        insertData.company_idx = company_idx;
        insertData.upload_people = findUserResult.user_name;
        insertData.customerFile_idx = customerFile_idx;
        insertData.uuid = newUuid;
        insertData.path = newUuid;
        const createFolderResult = await db.folders.create(insertData);
        return res.send({ succes: true, createFolderResult });
      }

      const findResult = await db.folders.findOne(
        { where: { uuid: req.body.uuid } },
        { attributes: ["path", "uuid"] }
      );

      const insertData = await checkTitle(
        db.folders,
        {
          root: false,
          upperFolder: findResult.uuid,
          title,
          customerFile_idx,
          company_idx,
        },
        title,
        req.body
      );

      const pureText = makePureText(insertData.title);
      insertData.upperFolder = insertData.uuid;
      insertData.searchingTitle = pureText;
      insertData.company_idx = company_idx;
      insertData.upload_people = findUserResult.user_name;
      insertData.customerFile_idx = customerFile_idx;
      insertData.root = false;
      insertData.path = `${findResult.path}/${newUuid}`;
      insertData.folder_uuid = insertData.uuid;
      insertData.uuid = newUuid;
      const createFolderResult = await db.folders.create(insertData, {
        transaction: t,
      });

      insertData.isFolder = true;
      insertData.title = insertData.title;

      await db.files.create(insertData, { transaction: t });
      await t.commit();
      return res.send({ succes: true, createFolderResult });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  addFile: async (req, res, next) => {
    const { files, company_idx } = req;
    console.log(files);
    try {
      if (req.body.uuid) {
        req.body.folder_uuid = req.body.uuid;
      }
      const createFileResult = [];
      for (let i = 0; i < files.length; i++) {
        // 회사 인덱스 저장
        req.body.company_idx = company_idx;

        req.body.customerFile_idx = req.params.customerFile_idx;
        const findUserResult = await db.user.findByPk(req.user_idx, {
          attributes: ["user_name"],
        });

        req.body.path = req.query.path;
        req.body.upload_people = findUserResult.user_name;
        req.body.file_url = files[i].location;
        let title = files[i].originalname;

        const getLastUrl = getFileName(files[i].key);

        const uniqueKey = getLastUrl.substr(0, 5);

        // 그냥 text로 변환
        const pureText = makePureText(title.normalize("NFC"));

        req.body.searchingTitle = pureText;
        req.body.uniqueKey = uniqueKey;
        req.body.title = title;

        req.body.file_size = files[i].size;

        req.body.uuid = random5();

        const createResult = await db.files.create(req.body);

        createFileResult.push(createResult.toJSON());
      }

      res.send({ success: 200, createFileResult });
      next();
    } catch (err) {
      next(err);
    }
  },
  showFiles: async (req, res, next) => {
    try {
      let { sort_field, sort } = req.params;

      const checkResult = fileStoreSort(sort_field, sort);

      sort_field = checkResult.sort_field;
      sort = checkResult.sort;

      let findFilesResult = await db.files.findAll({
        where: { folder_uuid: req.body.uuid },
        attributes: showFilesAttributes,
        order: [[sort_field, sort]],
      });

      findFilesResult = JSON.parse(
        JSON.stringify(findFilesResult, (key, value) => {
          if (value !== null) return value;
        })
      );

      return res.send({ succes: 200, findFilesResult });
    } catch (err) {
      next(err);
    }
  },
  deleteFile: async (req, res, next) => {
    const { uuid, isfolder } = req.params;

    const t = await db.sequelize.transaction();
    try {
      // 폴더가 아닐 때
      if (isfolder == 0) {
        await db.files.destroy({
          where: { uuid },
        });

        return res.send({ success: 200, message: "삭제 완료" });
      }
      // 폴더일때
      const findFolderUuid = await db.folders.findAll({
        where: { path: { [Op.like]: `%${uuid}%` } },
        attributes: ["idx", "path"],
        raw: true,
      });

      const deleteArr = [];
      findFolderUuid.forEach((data) => {
        deleteArr.push(data.idx);
      });

      await db.folders.destroy(
        {
          where: { idx: deleteArr },
        },
        { transaction: t }
      );

      await db.files.destroy(
        {
          where: { uuid },
        },
        { transaction: t }
      );
      await t.commit();
      res.send({ success: 200, message: "삭제 완료" });

      return;
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  changeFileTitle: async (req, res, next) => {
    try {
      let {
        body: { uuid, title, isFolder },
        params: { customerFile_idx },
      } = req;

      // 폴더일 경우
      if (isFolder) {
        // 이전에 같은 이름의 폴더를 찾음
        const findFoldersResult = await db.folders.findOne({
          where: { uuid, customerFile_idx },
          attributes: ["root", "upperFolder"],
        });
        if (findFoldersResult.upperFolder == undefined) {
          findFoldersResult.upperFolder = null;
        }

        const findFolderResult = await db.folders.findOne({
          where: { title, upperFolder: findFoldersResult.upperFolder },
          attributes: ["duplicateCount", "idx"],
        });

        // 이미 같은 이름의 폴더가 없을 때
        if (!findFolderResult) {
          const pureTitle = makePureText(title);
          await db.folders.update(
            { title, searchingTitle: pureTitle, duplicateCount: 1 },
            { where: { uuid, customerFile_idx } }
          );

          // 루트폴더 아닐 때
          if (!findFoldersResult.root) {
            await db.files.update({ title: title }, { where: { uuid } });
          }
        } else {
          title = `${title}_${findFolderResult.duplicateCount + 1}`;
          const pureTitle = makePureText(title);
          await db.folders.update(
            {
              title,
              searchingTitle: pureTitle,
              duplicateCount: findFolderResult.duplicateCount + 1,
            },
            { where: { uuid, customerFile_idx } }
          );

          db.folders.increment(
            { duplicateCount: 1 },
            { where: { idx: findFolderResult.idx } }
          );

          const findFoldersResult = await db.folders.findOne({
            where: { uuid, customerFile_idx },
            attributes: ["root"],
          });
          // 루트폴더 아닐 때
          if (!findFoldersResult.root) {
            await db.files.update({ title: title }, { where: { uuid } });
          }
        }
        return res.send({ success: 200, newTitle: title });
      } else {
        const findFilesResult = await db.files.findOne({
          where: { uuid },
          raw: true,
        });

        const titleExtend = findFilesResult.title.split(".");

        const newTitle = `${title}.${titleExtend[titleExtend.length - 1]}`;

        const pureText = makePureText(newTitle);

        await db.files.update(
          {
            title: newTitle,
            searchingTitle: pureText,
          },
          { where: { uuid } }
        );

        const updatedFileResult = await db.files.findOne({
          where: { uuid },
          raw: true,
        });

        return res.send({ success: 200, updatedFileResult });
      }
    } catch (err) {
      next(err);
    }
  },
  searchFileStore: async (req, res, next) => {
    const pureText = req.query.search
      .replace(/[. ]/g, "")
      .replace(/[\{\}\[\]\/?,;:|\*~`!^\-_+┼<>@\#$%&\'\"\\\=]/gi, "disjcn");
    if (pureText == "") {
      return res.send([]);
    }
    const totalFindResult = await searchFileandFolder(req, pureText);

    return res.send(totalFindResult);
  },
  showDetailFileFolder: async (req, res, next) => {
    const {
      params: { customerFile_idx, uuid, isFolder },
      query: { path },
    } = req;

    try {
      // 폴더일때
      if (isFolder == 1) {
        // 폴더 용량 구하기
        const findTitleResult = await db.files.findAll({
          where: { folder_uuid: uuid, customerFile_idx, isFolder: false },
          attributes: ["file_size"],
          raw: true,
          nest: true,
        });

        const findFolderResult = await db.folders.findOne({
          where: { uuid, customerFile_idx },
          attributes: showDetailFolderAttributes,
          raw: true,
          nest: true,
        });

        let addFileSize = 0;
        findTitleResult.forEach((data) => {
          addFileSize += data.file_size;
        });
        addFileSize = addFileSize / 1e-6;
        const getDetailResult = await getFolderPath(
          path,
          customerFile_idx,
          " | "
        );

        findFolderResult.path = getDetailResult;
        findFolderResult.folder_size = addFileSize;

        return res.send({ succes: 200, findFolderResult });
      }

      // 파일일때
      const getFileResult = await db.files.findOne({
        where: { uuid, customerFile_idx },
        attributes: showDetailFileAttributes,
      });
      // 파일이 폴더 밖에 있을때
      if (!path) {
        return res.send({ succes: 200, getFileResult });
      }
      const getTitleRootResult = await getFolderPath(
        path,
        customerFile_idx,
        " | "
      );
      getFileResult.path = getTitleRootResult;
      getFileResult.file_size = getFileResult.file_size / 1e-6;
      return res.send({ succes: 200, getFileResult });
    } catch (err) {
      next(err);
    }
  },
  getAllFolders: async (req, res, next) => {
    const {
      body: { uuid },
      params: { customerFile_idx },
    } = req;
    const findResult = await db.files.findAll({
      where: { path: { [Op.like]: `%${uuid}%` }, isFolder: false },
      attributes: ["file_url", "title", "path"],
      raw: true,
      nest: true,
    });
    await Promise.all(
      findResult.map(async (data) => {
        const findPath = await getFolderPath(data.path, customerFile_idx, "/");
        data.path = findPath;
      })
    );

    return res.send(findResult);
  },
  findUserFolders: async (req, res, next) => {
    const { customerFile_idx } = req.params;
    try {
      let findFolders = await db.folders.findAll({
        where: { customerFile_idx, root: true },
        include: [
          {
            model: db.files,
            where: { isfolder: true },
            required: false,
            attributes: ["uuid"],
          },
        ],
        attributes: ["uuid", "title", "path"],
        order: [["title", "ASC"]],
      });

      findFolders = JSON.parse(JSON.stringify(findFolders));

      findFolders.map((data) => {
        if (data.files.length == 0) {
          data.underFolders = false;
          delete data.files;
          return data;
        } else {
          data.underFolders = true;
          delete data.files;
          return data;
        }
      });

      return res.send({ success: 200, findFolders });
    } catch (err) {
      next(err);
    }
  },
  findIncludeFolders: async (req, res, next) => {
    const {
      params: { uuid },
    } = req;

    try {
      const findFolders = await db.folders.findAll({
        where: { uuid },
        include: [
          {
            model: db.files,
            where: { isfolder: true },
            required: false,
            attributes: ["uuid", "title", "path"],
          },
        ],
        attributes: ["title"],
        raw: true,
        nest: true,
        order: [["title", "ASC"]],
      });

      const checkResult = await Promise.all(
        findFolders.map(async (data) => {
          const result = await db.files.findOne({
            where: {
              folder_uuid: data.files.uuid,
              isFolder: true,
            },
            attributes: ["uuid", "title", "path"],
            raw: true,
          });
          data = { ...data.files };

          result ? (data.underFolders = true) : (data.underFolders = false);

          return data;
        })
      );

      return res.send({ success: 200, checkResult });
    } catch (err) {
      next(err);
    }
  },
  moveFile: async (req, res, next) => {
    const {
      params: { fileUuid, folderUuid },
      query: { path },
    } = req;

    try {
      // path가 있을 때
      let newPath = path;
      if (newPath == undefined) {
        newPath = null;
      }

      db.files.update(
        {
          folder_uuid: folderUuid,
          path: newPath,
        },
        { where: { uuid: fileUuid } }
      );
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
};
