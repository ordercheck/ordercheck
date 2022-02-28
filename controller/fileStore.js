const db = require('../model/db');
const {
  getFileName,
  makePureText,
  checkTitle,
  searchFileandFolder,
} = require('../lib/apiFunctions');
const { random5 } = require('../lib/functions');
const { Op } = require('sequelize');
const { copyAndDelete, s3_get, s3_delete_objects } = require('../lib/aws/aws');
const { delFile } = require('../lib/aws/fileupload').ufile;
const url = require('url');
const {
  showDetailFileFolderAttributes,
  showFilesAttributes,
  searchCustomersAttributes,
  searchFileStoreFoldersAttributes,
  searchFileStoreFilesAttributes,
} = require('../lib/attributes');
const { customerFile } = require('../model/db');
const { fileStoreSort } = require('../lib/checkData');

const deleteFileToS3 = async (title, req) => {
  if (req.query.path !== 'null') {
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
        order: [['customer_name', 'ASC']],
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
        attributes: ['user_name'],
      });
      req.body.searchingTitle = pureText;
      req.body.company_idx = company_idx;
      req.body.upload_people = findUserResult.user_name;
      req.body.customerFile_idx = customerFile_idx;
      const newUuid = random5();
      if (req.body.root) {
        const insertData = checkTitle(
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
    const { files } = req;
    console.log(req.body);
    try {
      if (req.body.uuid) {
        req.body.folder_uuid = req.body.uuid;
      }
      const createFileResult = [];
      for (let i = 0; i < files.length; i++) {
        // 회사 인덱스 저장
        req.body.company_idx = req.company_idx;

        req.body.customerFile_idx = req.params.customerFile_idx;
        const findUserResult = await db.user.findByPk(req.user_idx, {
          attributes: ['user_name'],
        });
        req.body.path = req.query.path;
        req.body.upload_people = findUserResult.user_name;
        req.body.file_url = files[i].location;
        let title = files[i].originalname;

        const getLastUrl = getFileName(files[i].key);

        const uniqueKey = getLastUrl.substr(0, 5);

        // 그냥 text로 변환
        const pureText = makePureText(title.normalize('NFC'));

        req.body.searchingTitle = pureText;
        req.body.uniqueKey = uniqueKey;
        req.body.title = title;
        req.body.file_size = files[i].size / 1e6;

        req.body.uuid = random5();

        const createResult = await db.files.create(req.body);

        createFileResult.push(createResult.toJSON());
      }

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
    const { uuid, isfolder } = req.params;

    const t = await db.sequelize.transaction();
    try {
      // 폴더가 아닐 때
      if (isfolder == 0) {
        const findFileResult = await db.files.findOne(
          { where: { uuid } },
          { attributes: ['title', 'path', 'uniqueKey'] }
        );
        // 폴더 안에 없을 때
        const delTarget = `${findFileResult.uniqueKey}${findFileResult.title}`;
        deleteFileToS3(delTarget, req);
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
        query: { path },
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

        const titleExtend = findFilesResult.title.split('.');

        const newTitle = `${title}.${titleExtend[titleExtend.length - 1]}`;

        let file_url = '';
        //  params만들기
        params = checkFile(
          req,
          params,
          `${findFilesResult.uniqueKey}${findFilesResult.title}`,
          `${findFilesResult.uniqueKey}${newTitle}`
        );

        // 파일삭제
        let Bucket = '';
        if (path) {
          file_url = `https://ordercheck.s3.ap-northeast-2.amazonaws.com/fileStore/${customerFile_idx}/${path}/${findFilesResult.uniqueKey}${newTitle}`;
          Bucket = encodeURI(
            `ordercheck/fileStore/${customerFile_idx}/${path}`
          );
        } else {
          file_url = `https://ordercheck.s3.ap-northeast-2.amazonaws.com/fileStore/${customerFile_idx}/${findFilesResult.uniqueKey}${newTitle}`;
          Bucket = encodeURI(`ordercheck/fileStore/${customerFile_idx}`);
        }

        const copyResult = await copyAndDelete(
          params,
          Bucket,
          `${findFilesResult.uniqueKey}${findFilesResult.title}`
        );
        if (copyResult) {
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
    const pureText = makePureText(req.query.search);
    const totalFindResult = await searchFileandFolder(req, pureText);
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
        where: { folder_uuid: uuid, customerFile_idx, isFolder: false },
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
        addFileSize += data.file_size;
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
  getAllFolders: async (req, res, next) => {
    const {
      body: { uuid, path },
      params: { customerFile_idx },
    } = req;
    const findResult = await db.files.findAll({
      where: { path: { [Op.like]: `%${uuid}%` }, isFolder: false },
      attributes: ['file_url', 'title', 'path'],
      raw: true,
      nest: true,
    });
    await Promise.all(
      findResult.map(async (data) => {
        const findPath = await getFolderPath(data.path, customerFile_idx, '/');
        data.path = findPath;
      })
    );

    return res.send(findResult);
  },
};
