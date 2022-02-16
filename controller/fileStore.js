const db = require('../model/db');
const { getFileName } = require('../lib/apiFunctions');
const { random5 } = require('../lib/functions');
const { Op } = require('sequelize');
const { s3_copy } = require('../lib/aws/aws');
const { delFile } = require('../lib/aws/fileupload').ufile;
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

  getFolderPath: async (req, res, next) => {
    const result = await db.folders.findAll({
      where: { customerFile_idx: req.params.customerFile_idx, root: true },
      attributes: [['idx', 'folder_idx'], 'title', 'customerFile_idx', 'uuid'],
    });

    return res.send({ success: 200, result });
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
    const data = {};

    const createFile = async (fileData) => {
      const findUserResult = await db.user.findByPk(req.user_idx, {
        attributes: ['user_name'],
      });
      data.upload_people = findUserResult.user_name;
      data.file_url = fileData.location;
      const title = getFileName(fileData.key);
      data.title = title;
      data.file_size = fileData.size / 1e6;
      data.folder_uuid = req.body.uuid;
      data.uuid = random5();
      return await db.files.create(data);
    };
    try {
      const createFileResult = req.file.transforms
        ? await createFile(req.file.transforms[0])
        : await createFile(req.file);

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
        await db.files.destroy({
          where: { uuid },
        });
      }
      // 폴더일때

      const findFolderUuid = await db.folders.findAll({
        where: { path: { [Op.like]: `%${uuid}%` } },
        attributes: ['idx'],
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
      return res.send({ success: 200, message: '삭제 완료' });
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },
  changeFileTitle: async (req, res, next) => {
    try {
      const {
        body: { uuid, title, isFile },
        params: { customerFile_idx },
      } = req;

      // 폴더일 경우
      if (isFile) {
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
          CopySource: `ordercheck/fileStore/${findFilesResult.title}`,
          Key: `fileStore/${title}`,
          ACL: 'public-read',
        };

        const file_url = findFilesResult.file_url.replace(
          `${findFilesResult.title}`,
          `${title}`
        );

        s3_copy(params);

        await db.files.update(
          {
            title,
            file_url,
          },
          { where: { uuid } }
        );

        delFile(findFilesResult.title, 'ordercheck/fileStore');
      }
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
  searchFileStore: async (req, res, next) => {},
};
