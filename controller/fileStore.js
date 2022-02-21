const db = require('../model/db');
const { getFileName, makePureText } = require('../lib/apiFunctions');
const { random5 } = require('../lib/functions');
const { Op } = require('sequelize');
const { copyAndDelete, s3_get, s3_delete_objects } = require('../lib/aws/aws');
const { delFile } = require('../lib/aws/fileupload').ufile;
const {
  showDetailFileFolderAttributes,
  showFilesAttributes,
  searchCustomersAttributes,
  searchFileStoreFoldersAttributes,
  searchFileStoreFilesAttributes,
} = require('../lib/attributes');
const { customerFile } = require('../model/db');
const { fileStoreSort } = require('../lib/checkData');
const searchUserFoldersFilesPath = async (findFilesResult) => {
  const newPathResult = await Promise.all(
    findFilesResult.map(async (data) => {
      if (!data.path) {
        data.path = data.customerFile.customer_name;
      } else {
        const newFormUrl = await getFolderPath(
          data.path,
          data.customerFile_idx,
          ' > '
        );
        data.path = `${data.customerFile.customer_name} > ${newFormUrl}`;
      }

      delete data.customerFile;

      return data;
    })
  );
  return newPathResult;
};

const deleteFileToS3 = async (title, req) => {
  if (req.query.path) {
    delFile(
      title,
      `ordercheck/fileStore/${req.params.customerFile_idx}/${req.query.path}`
    );
  } else {
    delFile(title, `ordercheck/fileStore/${req.params.customerFile_idx}`);
  }
};

const checkFile = (req, params, beforeTitle, newTitle) => {
  // 파일 안일 경우
  if (req.query.path) {
    (params.CopySource = encodeURI(
      `ordercheck/fileStore/${req.params.customerFile_idx}/${req.query.path}/${beforeTitle}`
    )),
      (params.Key = `fileStore/${req.params.customerFile_idx}/${req.query.path}/${newTitle}`);
  } else {
    (params.CopySource = encodeURI(
      `ordercheck/fileStore/${req.params.customerFile_idx}/${beforeTitle}`
    )),
      (params.Key = `fileStore/${req.params.customerFile_idx}/${newTitle}`);
  }
  return params;
};
const getFolderPath = async (pathData, customerFile_idx, joinData) => {
  const pathArr = pathData.split('/');

  const findTitleResult = await db.folders.findAll({
    where: { uuid: { [Op.in]: pathArr }, customerFile_idx },
    attributes: ['title'],
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
    try {
      // 파일저장소 고객찾기
      const findAllCustomers = await db.customerFile.findAll({
        where: { company_idx: req.company_idx },
        attributes: [
          ['idx', 'customerFile_idx'],
          'customer_phoneNumber',
          'customer_name',
        ],
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
    // 그냥 text로 변환
    const pureText = makePureText(req.body.title);

    const t = await db.sequelize.transaction();
    try {
      const findUserResult = await db.user.findByPk(req.user_idx, {
        attributes: ['user_name'],
      });
      req.body.searchingTitle = pureText;
      req.body.company_idx = req.company_idx;
      req.body.upload_people = findUserResult.user_name;
      req.body.customerFile_idx = req.params.customerFile_idx;
      const newUuid = random5();
      if (req.body.root) {
        req.body.uuid = newUuid;
        req.body.path = newUuid;
        const createFolderResult = await db.folders.create(req.body);
        return res.send({ succes: true, createFolderResult });
      }
      req.body.root = false;
      const findResult = await db.folders.findOne(
        { where: { uuid: req.body.uuid } },
        { attributes: ['path'] }
      );

      req.body.path = `${findResult.path}/${newUuid}`;

      req.body.folder_uuid = req.body.uuid;
      req.body.uuid = newUuid;
      const createFolderResult = await db.folders.create(req.body, {
        transaction: t,
      });

      req.body.isFolder = true;
      req.body.title = req.body.title;

      await db.files.create(req.body, { transaction: t });
      await t.commit();
      return res.send({ succes: true, createFolderResult });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  addFile: async (req, res, next) => {
    try {
      // 회사 인덱스 저장
      req.body.company_idx = req.company_idx;
      if (req.body.uuid) {
        req.body.folder_uuid = req.body.uuid;
      }
      req.body.customerFile_idx = req.params.customerFile_idx;
      const findUserResult = await db.user.findByPk(req.user_idx, {
        attributes: ['user_name'],
      });
      req.body.path = req.query.path;
      req.body.upload_people = findUserResult.user_name;
      req.body.file_url = req.file.location;
      const title = getFileName(req.file.key);
      // 그냥 text로 변환
      const pureText = makePureText(title);

      req.body.searchingTitle = pureText;

      req.body.title = title;
      req.body.file_size = req.file.size / 1e6;

      req.body.uuid = random5();

      const createFileResult = await db.files.create(req.body);

      return res.send({ success: 200, createFileResult });
    } catch (err) {
      next(err);
    }
  },
  showFiles: async (req, res, next) => {
    try {
      let { customerFile_idx, sort_field, sort } = req.params;

      const checkResult = fileStoreSort(sort_field, sort);

      sort_field = checkResult.sort_field;
      sort = checkResult.sort;

      let findFilesResult = await db.files.findAll({
        where: { folder_uuid: req.body.uuid },
        attributes: showFilesAttributes,
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
    const { uuid, isfolder, customerFile_idx } = req.params;

    const t = await db.sequelize.transaction();
    try {
      // 폴더가 아닐 때
      if (isfolder == 0) {
        const findFileResult = await db.files.findOne(
          { where: { uuid } },
          { attributes: ['title', 'path'] }
        );
        // 폴더 안에 없을 때

        deleteFileToS3(findFileResult.title, req);
        await db.files.destroy({
          where: { uuid },
        });

        return res.send({ success: 200, message: '삭제 완료' });
      }
      // 폴더일때
      const findFolderUuid = await db.folders.findAll({
        where: { path: { [Op.like]: `%${uuid}%` } },
        attributes: ['idx', 'path'],
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
      res.send({ success: 200, message: '삭제 완료' });

      // db정보 삭제 후 s3 삭제
      var params = {
        Bucket: 'ordercheck',
        Prefix: `fileStore/${req.params.customerFile_idx}/${req.query.path}/`,
      };
      const deleteParams = {
        Bucket: 'ordercheck',
        Delete: { Objects: [] },
      };
      s3_get(params, (err, data) => {
        if (data.Contents.length == 0) {
          return;
        }
        data.Contents.forEach((data) => {
          deleteParams.Delete.Objects.push({ Key: data.Key });
        });
        s3_delete_objects(deleteParams);
      });
      return;
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  changeFileTitle: async (req, res, next) => {
    try {
      const {
        body: { uuid, title, isFolder },
        params: { customerFile_idx },
      } = req;

      // 폴더일 경우
      if (isFolder) {
        const pureTitle = makePureText(title);

        await db.folders.update(
          { title, searchingTitle: pureTitle },
          { where: { uuid, customerFile_idx } }
        );

        const findFoldersResult = await db.folders.findOne({
          where: { uuid, customerFile_idx },
          attributes: ['root'],
        });
        if (!findFoldersResult.root) {
          await db.files.update({ title: title }, { where: { uuid } });
        }
      } else {
        const findFilesResult = await db.files.findOne({
          where: { uuid },
          raw: true,
        });

        let params = {
          Bucket: 'ordercheck',
          ACL: 'public-read',
        };

        let urlArr = findFilesResult.file_url.split('/');
        const titleAndExtend = urlArr[urlArr.length - 1].split('.');
        titleAndExtend[0] = title;
        urlArr[urlArr.length - 1] = titleAndExtend.join('.');
        const file_url = urlArr.join('/');

        //  params만들기
        params = checkFile(
          req,
          params,
          findFilesResult.title,
          titleAndExtend.join('.')
        );

        // 파일삭제
        let Bucket = '';
        if (req.query.path) {
          Bucket = encodeURI(
            `ordercheck/fileStore/${req.params.customerFile_idx}/${req.query.path}`
          );
        } else {
          Bucket = encodeURI(
            `ordercheck/fileStore/${req.params.customerFile_idx}`
          );
        }

        const copyResult = await copyAndDelete(
          params,
          Bucket,
          findFilesResult.title
        );
        if (copyResult) {
          const newTitle = titleAndExtend.join('.');

          const pureText = makePureText(newTitle);

          await db.files.update(
            {
              title: newTitle,
              searchingTitle: pureText,
              file_url,
            },
            { where: { uuid } }
          );

          const updatedFileResult = await db.files.findOne({
            where: { uuid },
            raw: true,
          });

          return res.send({ success: 200, updatedFileResult });
        }
      }
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
  searchFileStore: async (req, res, next) => {
    // 파일 또는 폴더 찾기
    const findFilesAndFolders = async (
      fileOrFolder,
      attributesData,
      whereData
    ) => {
      const findFoldersResult = await fileOrFolder.findAll({
        where: whereData,
        include: [
          {
            model: db.customerFile,
            attributes: ['customer_name'],
          },
        ],
        attributes: attributesData,
        raw: true,
        nest: true,
      });
      return findFoldersResult;
    };
    // 그냥 text로 변환
    const pureText = makePureText(req.query.search);

    const findCustomerResult = await db.customerFile.findAll({
      where: {
        company_idx: req.company_idx,
        [Op.or]: {
          customer_name: {
            [Op.like]: `%${pureText}%`,
          },
          searchingPhoneNumber: {
            [Op.like]: `%${pureText}%`,
          },
        },
      },
      attributes: searchCustomersAttributes,
      raw: true,
      nest: true,
    });

    let findFoldersResult = await findFilesAndFolders(
      db.folders,
      searchFileStoreFoldersAttributes,
      {
        company_idx: req.company_idx,
        searchingTitle: {
          [Op.like]: `%${pureText}%`,
        },
      }
    );

    let findFilesResult = await findFilesAndFolders(
      db.files,

      searchFileStoreFilesAttributes,
      {
        company_idx: req.company_idx,
        isFolder: false,
        searchingTitle: {
          [Op.like]: `%${pureText}%`,
        },
      }
    );
    // path재설정
    if (findFoldersResult.length !== 0) {
      findFoldersResult = await searchUserFoldersFilesPath(findFoldersResult);
    }

    if (findFilesResult.length !== 0) {
      findFilesResult = await searchUserFoldersFilesPath(findFilesResult);
    }

    // 배열로 하나로 묶기
    const totalFindResult = [];
    findCustomerResult.forEach((data) => {
      data.Type = 'Customer';
      totalFindResult.push(data);
    });

    findFoldersResult.forEach((data) => {
      data.Type = 'Folder';
      totalFindResult.push(data);
    });
    findFilesResult.forEach((data) => {
      data.Type = 'File';
      totalFindResult.push(data);
    });
    res.send(totalFindResult);
  },
  showDetailFileFolder: async (req, res, next) => {
    const {
      params: { customerFile_idx, uuid, isFolder },
      query: { path },
    } = req;

    // 폴더일때
    if (isFolder == 1) {
      // 폴더 용량 구하기
      const findTitleResult = await db.files.findAll({
        where: { folder_uuid: uuid, customerFile_idx },
        attributes: ['file_size'],
        raw: true,
        nest: true,
      });

      const findFolderResult = await db.folders.findOne({
        where: { uuid, customerFile_idx },
        attributes: [
          'title',
          'upload_people',
          [
            db.sequelize.fn(
              'date_format',
              db.sequelize.col('createdAt'),
              '%Y.%m.%d'
            ),
            'createdAt',
          ],
        ],

        raw: true,
        nest: true,
      });

      let addFileSize = 0;
      findTitleResult.forEach((data) => {
        addFileSize += Number(data.file_size);
      });

      const getDetailResult = await getFolderPath(
        path,
        customerFile_idx,
        ' | '
      );

      findFolderResult.path = getDetailResult;
      findFolderResult.folder_size = addFileSize;

      return res.send({ succes: 200, findFolderResult });
    }
    // 파일일때
    const getFileResult = await db.files.findOne({
      where: { uuid, customerFile_idx },
      attributes: showDetailFileFolderAttributes,
    });
    // 파일이 폴더 밖에 있을때
    if (!path) {
      return res.send({ succes: 200, getFileResult });
    }
    const getTitleRootResult = await getFolderPath(
      path,
      customerFile_idx,
      ' | '
    );
    getFileResult.path = getTitleRootResult;

    return res.send({ succes: 200, getFileResult });
  },
};
