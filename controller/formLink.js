const _f = require('../lib/functions');
const db = require('../model/db');

module.exports = {
  createFormLink: async (req, res) => {
    try {
      req.body.form_link = _f.random5();
      req.body.company_idx = req.company_idx;
      const createResult = await db.formLink.create(req.body);
      const whiteCheck = await db.plan.findOne({
        where: { company_idx: req.body.company_idx },
        attributes: ['whiteLabelChecked'],
      });

      return res.send({
        success: 200,
        idx: createResult.idx,
        title: createResult.title,
        shareUrl: createResult.form_link,
        isWhiteLabel: whiteCheck.whiteLabelChecked,
        message: '폼 생성 ',
      });
    } catch (err) {
      console.log(err);
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
  showFormLink: async (req, res) => {
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
  },
  createThumbNail: async (req, res) => {
    await db.formLink.update(
      { thumbNail: req.file.location },
      { where: { idx: req.body.idx } }
    );
    return res.send({ success: 200, message: 'thumbNail 업로드 완료' });
  },
  duplicateForm: async (req, res) => {
    try {
      const findFormLink = await db.formLink.findByPk(req.body.formId, {
        attributes: { exclude: ['idx', 'createdAt', 'updatedAt'] },
      });
      const duplicateTitle = `${findFormLink.title}.copy`;
      findFormLink.title = duplicateTitle;
      findFormLink.form_link = _f.random5();
      const duplicateForm = await db.formLink.create(findFormLink.dataValues);

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
    } catch (err) {
      console.log(err);
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
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
};
