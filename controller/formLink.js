const _f = require('../lib/functions');
const db = require('../model/db');
const { errorFunction } = require('../lib/apiFunctions');
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
      errorFunction(err);
      return res.send({ success: 500, message: err.message });
    }
  },
  showFormLink: async (req, res) => {
    try {
      let formList = await db.formLink.findAll({
        where: { company_idx: req.company_idx },
        attributes: [
          ['idx', 'formId'],
          'title',
          'form_link',
          'expression',
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
      });

      if (!formList) {
        return res.send({ success: 400, message: '등록된 폼이 없습니다' });
      }

      formList = formList.map((data) => {
        data.urlPath = `${data.form_link}/${data.expression}`;
        return data;
      });

      return res.send({ success: 200, formList });
    } catch (err) {
      errorFunction(err);
      return res.send({ success: 500, message: err.message });
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
      errorFunction(err);
      return res.send({ success: 500, message: err.message });
    }
  },
  duplicateForm: async (req, res) => {
    // copyCount 1증가
    db.formLink
      .increment({ copyCount: 1 }, { where: { idx: req.params.formId } })
      .then(async () => {
        const findFormLink = await db.formLink.findByPk(req.params.formId, {
          attributes: { exclude: ['idx', 'createdAt', 'updatedAt'] },
        });
        // 복사본 제목 생성
        const duplicateTitle = `${findFormLink.title}_${findFormLink.copyCount}`;
        findFormLink.title = duplicateTitle;
        findFormLink.form_link = _f.random5();
        findFormLink.dataValues.copyCount = 0;
        const duplicateForm = await db.formLink.create(findFormLink.dataValues);
        // 시간 형태에 맞게 변형
        const createdAt = duplicateForm.createdAt
          .toISOString()
          .split('T')[0]
          .replace(/-/g, '.');

        const duplicateResult = {
          formId: duplicateForm.dataValues.idx,
          title: duplicateForm.dataValues.title,
          form_link: duplicateForm.dataValues.form_link,
          expression: duplicateForm.dataValues.expression,
          pathUrl: `${duplicateForm.dataValues.form_link}/${duplicateForm.dataValues.expression}`,
          createdAt,
        };

        return res.send({
          success: 200,
          duplicateResult,
        });
      })
      .catch((err) => {
        errorFunction(err);
        return res.send({ success: 500, message: err.message });
      });
  },
  delFormLink: async (req, res) => {
    try {
      await db.formLink.destroy({ where: { idx: req.params.formId } });
      return res.send({ success: 200, message: '삭제 성공' });
    } catch (err) {
      errorFunction(err);
      return res.send({ success: 500, message: err.message });
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

      formDetail.dataValues.urlPath = `${formDetail.form_link}/${formDetail.expression}`;
      formDetail.dataValues.whiteLabelChecked = whiteCheck.whiteLabelChecked;
      // 임의의 값
      formDetail.dataValues.member = ['김기태', 'aaa', 'bbb'];

      return res.send({ success: 200, formDetail });
    } catch (err) {
      errorFunction(err);
      return res.send({ success: 500, message: err.message });
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
      errorFunction(err);
      return res.send({ success: 500, message: err.message });
    }
  },
  updateForm: async (req, res) => {
    const { title, whiteLabelChecked, formId, expression } = req.body;
    try {
      await db.formLink.update(
        {
          title,
          whiteLabelChecked,
          expression,
        },
        { where: { idx: formId } }
      );
      return res.send({ success: 200, message: '업데이트 완료' });
    } catch (err) {
      errorFunction(err);
      return res.send({ success: 500, message: err.message });
    }
  },
};
