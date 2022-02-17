const db = require('../model/db');
const { getFileName } = require('../lib/apiFunctions');
const { random5 } = require('../lib/functions');
const { Op } = require('sequelize');
const { s3_copy, s3_get, s3_delete_objects } = require('../lib/aws/aws');
const { delFile } = require('../lib/aws/fileupload').ufile;
const { showDetailFileFolderAttributes } = require('../lib/attributes');
const deleteFile = (title, req) => {
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
    const folders = await db.folders.findAll({
      where: { customerFile_idx: req.params.customerFile_idx, root: true },
    });

    const files = await db.files.findAll({
      where: {
        customerFile_idx: req.params.customerFile_idx,
        folder_uuid: null,
      },
    });

    return res.send({ success: 200, folders, files });
  },
  addFolder: async (req, res, next) => {
    const t = await db.sequelize.transaction();
    try {
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
      let findFilesResult = await db.files.findAll({
        where: { folder_uuid: req.body.uuid },
        attributes: [
          'idx',
          'file_url',
          'title',
          'isFolder',
          'folder_uuid',
          'uuid',
          'path',
        ],
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
          { attributes: ['title'] }
        );

        // 파일삭제
        deleteFile(findFileResult.title, req);
        await db.files.destroy({
          where: { uuid },
        });
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
        await db.folders.update(
          { title },
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

        s3_copy(params);

        await db.files.update(
          {
            title: titleAndExtend.join('.'),
            file_url,
          },
          { where: { uuid } }
        );
        // 파일삭제
        deleteFile(findFilesResult.title, req);

        const updatedFileResult = await db.files.findOne({
          where: { uuid },
          raw: true,
        });
        return res.send({ success: 200, updatedFileResult });
      }
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
  searchFileStore: async (req, res, next) => {
    const pureText = req.query.search.replace(
      /[ \{\}\[\]\/?.,;:|\)*~`!^\-_+┼<>@\#$%&\ '\"\\(\=]/gi,
      ''
    );

    const findCustomerResult = await db.customerFile.findAll({
      where: {
        [Op.or]: {
          customer_name: {
            [Op.like]: `%${pureText}%`,
          },
          customer_phoneNumber: {
            [Op.like]: `%${pureText}%`,
          },
        },
      },
    });

    res.send({ findCustomerResult });
  },
  showDetailFileFolder: async (req, res, next) => {
    const { customerFile_idx, uuid, isFolder } = req.params;
    console.log(customerFile_idx);
    console.log(uuid);
    console.log(isFolder);
    // 폴더일때
    if (req.params.isFolder == 1) {
    }
    // 파일일때

    const getFileResult = await db.files.findOne({
      where: { uuid },
      attributes: showDetailFileFolderAttributes,
    });

    const pathArr = getFileResult.path.split('/');

    const findTitleResult = await db.folders.findAll({
      where: { uuid: { [Op.in]: pathArr } },
      attributes: ['title'],
      raw: true,
      nest: true,
    });

    const path = [];
    findTitleResult.forEach((data) => {
      path.push(data.title);
    });
    getFileResult.path = path.join(' | ');
    console.log(getFileResult);
    return res.send({ succes: 200, getFileResult });
  },
};
