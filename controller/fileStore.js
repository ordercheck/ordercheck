const db = require('../model/db');
const { getFileName } = require('../lib/apiFunctions');
const { random5 } = require('../lib/functions');

// 폴더 찾는 함수
const findFolder = async (req) => {
  return await db.folders.findByPk(req.body.folder_idx, {
    attributes: ['idx'],
  });
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

  getFolderPath: async (req, res, next) => {
    const result = await db.folders.findAll({
      where: { customerFile_idx: req.params.customerFile_idx, root: true },
      attributes: [['idx', 'folder_idx'], 'title', 'customerFile_idx', 'uuid'],
    });

    return res.send({ success: 200, result });
  },
  addFolder: async (req, res, next) => {
    try {
      req.body.customerFile_idx = req.params.customerFile_idx;
      req.body.uuid = random5();
      if (req.body.root) {
        req.body.path = req.body.uuid;
        const createFolderResult = await db.folders.create(req.body);
        return res.send({ succes: true, createFolderResult });
      }
      req.body.root = false;

      const findResult = await db.folders.findOne(
        { where: { uuid: req.body.folder_uuid } },
        { attributes: ['path'] }
      );

      req.body.path = `${findResult.path},${req.body.uuid}`;

      const createFolderResult = await db.folders.create(req.body);
      req.body.isFolder = true;
      req.body.title = req.body.title;
      req.body.folder_uuid = req.body.uuid;
      await db.files.create(req.body);
      return res.send({ succes: true, createFolderResult });
    } catch (err) {
      next(err);
    }
  },
  addFile: async (req, res, next) => {
    const data = {};
    const createFile = async (fileData) => {
      data.file_url = fileData.location;
      const [, title] = fileData.key.split('/');
      data.title = title;
      data.folder_uuid = req.body.uuid;
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
      const findFilesResult = await db.files.findAll({
        where: { folder_uuid: req.body.uuid },
      });
      return res.send({ succes: 200, findFilesResult });
    } catch (err) {
      next(err);
    }
  },
  deleteFile: async (req, res, next) => {
    const { uuid, isfolder } = req.body;
    const t = await db.sequelize.transaction();
    try {
      // 폴더가 아닐 때
      if (!isfolder) {
        await db.files.destroy({
          where: { folder_uuid: uuid },
        });
      }
      // 폴더일때

      const findFolderIdx = await db.files.findAll({
        where: { folder_uuid: uuid, isFolder: true },
        raw: true,
        attributes: ['folder_uuid'],
      });
      const deleteArr = [uuid];

      findFolderIdx.forEach((data) => {
        deleteArr.push(data.folder_uuid);
      });

      await db.folders.destroy(
        {
          where: { uuid: deleteArr },
        },
        { transaction: t }
      );

      await db.files.destroy(
        {
          where: { folder_uuid: uuid },
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
        body: { uuid, title, root },
        params: { customerFile_idx },
      } = req;
      const updateFolder = async () => {
        await db.folders.update(
          { title },
          { where: { uuid, customerFile_idx } }
        );
      };
      if (root) {
        await updateFolder();
      } else {
        await updateFolder();
        await db.files.update({ title: title }, { where: { uuid } });
      }
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
};
