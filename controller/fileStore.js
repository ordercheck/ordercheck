const db = require('../model/db');
const { getFileName } = require('../lib/apiFunctions');
const _f = require('../lib/functions');

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
      attributes: [['idx', 'folder_idx'], 'folder_name', 'customerFile_idx'],
    });

    return res.send({ success: 200, result });
  },
  addFolder: async (req, res, next) => {
    try {
      req.body.customerFile_idx = req.params.customerFile_idx;
      if (req.body.folder_idx == 0) {
        const createFolderResult = await db.folders.create(req.body);
        return res.send({ succes: true, createFolderResult });
      }
      req.body.root = false;
      const createFolderResult = await db.folders.create(req.body);
      req.body.idx = createFolderResult.idx;
      req.body.isFolder = true;

      req.body.file_name = req.body.folder_name;
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
      const [, file_name] = fileData.key.split('/');
      data.file_name = file_name;
      return await db.files.create(data);
    };
    try {
      const findFolderResult = await findFolder(req);
      data.folder_idx = findFolderResult.idx;
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
      const findFolderResult = await findFolder(req);
      const findFilesResult = await db.files.findAll({
        where: { folder_idx: findFolderResult.idx },
      });
      return res.send({ succes: 200, findFilesResult });
    } catch (err) {
      next(err);
    }
  },
  deleteFile: async (req, res, next) => {
    const { folder_idx, isfolder } = req.body;
    const t = await db.sequelize.transaction();
    try {
      // 폴더가 아닐 때
      if (!isfolder) {
        await db.files.destroy({
          where: { idx },
        });
      }
      // 폴더일때

      const findFolderIdx = await db.files.findAll({
        where: { folder_idx, isFolder: true },
        raw: true,
        attributes: ['idx'],
      });
      const deleteArr = [folder_idx];
      findFolderIdx.forEach((data) => {
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
          where: { idx: folder_idx },
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
        body: { folder_idx, title, root },
        params: { customerFile_idx },
      } = req;
      const updateFolder = async () => {
        await db.folders.update(
          { folder_name: title },
          { where: { idx: folder_idx, customerFile_idx } }
        );
      };
      if (root) {
        await updateFolder();
      } else {
        await updateFolder();
        await db.files.update(
          { file_name: title },
          { where: { idx: folder_idx } }
        );
      }
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
};
