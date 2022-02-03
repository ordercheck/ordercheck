const _f = require('../lib/functions');
const db = require('../model/db');
const { Op } = require('sequelize');
module.exports = {
  createFormLink: async (req, res) => {
    try {
      req.body.form_link = _f.random5();
      req.body.company_idx = req.company_idx;
      const createResult = await db.formLink.create(req.body);
      return res.send({
        success: 200,
        formId: createResult.idx,
        message: '폼 생성 ',
      });
    } catch (err) {
      console.log(err);
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
  showFormLink: async (req, res) => {
    try {
      const formList = await db.formLink.findAll({
        where: { company_idx: req.company_idx },
        attributes: [
          ['idx', 'formId'],
          'title',
          [
            db.sequelize.fn(
              'date_format',
              db.sequelize.col('createdAt'),
              '%Y.%m.%d'
            ),
            'createdAt',
          ],
        ],
      });
      return res.send({ success: 200, formList });
    } catch (err) {
      console.log(err);
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
  createThumbNail: async (req, res) => {
    try {
      await db.formLink.update(
        { thumbNail: req.file.location },
        { where: { idx: req.body.idx } }
      );
      return res.send({ success: 200, message: 'thumbNail 업로드 완료' });
    } catch (err) {
      console.log(err);
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
  duplicateForm: async (req, res) => {
    // copyCount 1증가
    db.formLink
      .increment({ copyCount: 1 }, { where: { idx: req.body.formId } })
      .then(async () => {
        const findFormLink = await db.formLink.findByPk(req.body.formId, {
          attributes: { exclude: ['idx', 'createdAt', 'updatedAt'] },
        });
        // 복사본 제목 생성
        const duplicateTitle = `${findFormLink.title}_${findFormLink.copyCount}`;
        findFormLink.title = duplicateTitle;
        findFormLink.form_link = _f.random5();
        const duplicateForm = await db.formLink.create(findFormLink.dataValues);
        // 시간 형태에 맞게 변형
        const createdAt = duplicateForm.createdAt
          .toISOString()
          .split('T')[0]
          .replace(/-/g, '.');
        return res.send({
          success: 200,
          formId: duplicateForm.idx,
          title: duplicateForm.title,
          createdAt,
        });
      })
      .catch((err) => {
        console.log(err);
        const Err = err.message;
        return res.send({ success: 500, Err });
      });
  },
  delFormLink: async (req, res) => {
    try {
      await db.formLink.destroy({ where: { idx: req.body.formId } });
      return res.send({ success: 200, message: '삭제 성공' });
    } catch (err) {
      console.log(err);
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
  showFormDetail: async (req, res) => {
    try {
      const whiteCheck = await db.plan.findOne({
        where: { company_idx: req.company_idx },
        attributes: ['whiteLabelChecked'],
      });
      const formDetail = await db.formLink.findOne({
        where: { idx: req.params.formId },
        attributes: [
          'title',
          'thumbNail',
          'form_link',
          'tempType',
          'expression',
        ],
      });
      formDetail.dataValues.whiteLabelChecked = whiteCheck.whiteLabelChecked;
      formDetail.member = [1, 2, 3];
      return res.send({ success: 200, formDetail });
    } catch (err) {
      console.log(err);
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
  searchFormLink: async (req, res) => {
    try {
      const searchResult = await db.formLink.findAll({
        where: {
          title: {
            [Op.like]: `%${req.query.title}%`,
          },
        },
        attributes: [
          ['idx', 'formId'],
          'title',
          [
            db.sequelize.fn(
              'date_format',
              db.sequelize.col('createdAt'),
              '%Y.%m.%d'
            ),
            'createdAt',
          ],
        ],
      });
      return res.send({ success: 200, searchResult });
    } catch (err) {
      console.log(err);
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
};
