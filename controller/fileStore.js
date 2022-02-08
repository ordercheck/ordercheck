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
    const result = await db.folders.findOne({
      where: { customerFile_idx: req.params.customerFile_idx },
      attributes: [['idx', 'folder_idx'], 'folder_path', 'customerFile_idx'],
      order: [['createdAt', 'DESC']],
    });
    return res.send({ success: 200, result });
  },
  addFolder: async (req, res, next) => {
    try {
      const findFolderResult = await findFolder(req);

      if (!findFolderResult) {
        req.body.customerFile_idx = req.params.customerFile_idx;
        await db.folders.create(req.body);
        return res.send({ succes: true, message: '폴더 생성 완료' });
      }
      next((err = { message: '이미 폴더가 존재합니다' }));
    } catch (err) {
      next(err);
    }
  },
  addFile: async (req, res, next) => {
    const createFile = async (fileData) => {
      data.file_url = fileData.location;
      data.file_name = getFileName(fileData.key);
      return await db.files.create(data);
    };
    try {
      const data = {};

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
};
