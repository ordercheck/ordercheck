const _f = require('../lib/functions');
const db = require('../model/db');
const { delFile } = require('../lib/aws/fileupload').ufile;
const {
  errorFunction,
  findWhiteFormDetail,
  getFileName,
} = require('../lib/apiFunctions');
const { Op } = require('sequelize');
const {
  createFormLinkAttributes,
  searchFormLinkAttributes,
} = require('../lib/attributes');
module.exports = {
  createFormLink: async (req, res, next) => {
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
      next(err);
    }
  },
  showFormLink: async (req, res, next) => {
    try {
      let formList = await db.formLink.findAll({
        where: { company_idx: req.company_idx },
        attributes: createFormLinkAttributes,

        order: [['createdAt', 'DESC']],
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
      next(err);
    }
  },
  createThumbNail: async (req, res, next) => {
    try {
      const { formId } = req.params;

      const changeFormLinkUrl = async () => {
        const file_name = getFileName(req.file.transforms[0].key);
        await db.formLink.update(
          {
            thumbNail: req.file.transforms[0].location,
            thumbNail_title: file_name,
          },
          { where: { idx: formId } }
        );
      };
      const findFormLinkResult = await db.formLink.findByPk(formId, {
        attributes: ['thumbNail_title'],
      });
      if (findFormLinkResult.thumbNail_title) {
        delFile(findFormLinkResult.thumbNail_title, 'ordercheck/formThumbNail');
        changeFormLinkUrl();
      } else {
        changeFormLinkUrl();
      }

      const { formDetail } = await findWhiteFormDetail(req.company_idx, formId);
      return res.send({ success: 200, formDetail });
    } catch (err) {
      next(err);
    }
  },
  duplicateForm: async (req, res, next) => {
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
        findFormLink.copyCount = 0;

        const duplicateForm = await db.formLink.create(findFormLink.dataValues);
        // 시간 형태에 맞게 변형
        const createdAt = duplicateForm.createdAt
          .toISOString()
          .split('T')[0]
          .replace(/-/g, '.');

        const duplicateResult = {
          formId: duplicateForm.idx,
          title: duplicateForm.title,
          form_link: duplicateForm.form_link,
          expression: duplicateForm.expression,
          pathUrl: `${duplicateForm.form_link}/${duplicateForm.expression}`,
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
  delFormLink: async (req, res, next) => {
    try {
      const findFormLinkResult = await db.formLink.findByPk(req.params.formId, {
        attributes: ['thumbNail_title'],
      });
      delFile(findFormLinkResult.thumbNail_title, 'ordercheck/formThumbNail');
      await db.formLink.destroy({ where: { idx: req.params.formId } });
      return res.send({ success: 200, message: '삭제 성공' });
    } catch (err) {
      next(err);
    }
  },
  showFormDetail: async (req, res, next) => {
    try {
      const { formDetail } = await findWhiteFormDetail(
        req.company_idx,
        req.params.formId
      );

      return res.send({ success: 200, formDetail });
    } catch (err) {
      next(err);
    }
  },
  searchFormLink: async (req, res, next) => {
    try {
      const searchResult = await db.formLink.findAll({
        where: {
          title: {
            [Op.like]: `%${req.params.title}%`,
          },
        },
        attributes: searchFormLinkAttributes,
        order: [['createdAt', 'DESC']],
      });

      return res.send({ success: 200, searchResult });
    } catch (err) {
      next(err);
    }
  },
  updateForm: async (req, res, next) => {
    const { title, whiteLabelChecked, formId, expression } = req.body;
    try {
      // 프런트에서 준 최신 업데이트 정보로 formLink 수정
      await db.formLink.update(
        {
          title,
          expression,
        },
        { where: { idx: formId } }
      );

      // 프런트에서 준 최신 업데이트 정보로 whiteLabel 수정
      await db.plan.update(
        {
          whiteLabelChecked,
        },
        { where: { idx: req.company_idx } }
      );
      // 수정된 정보를 찾기
      const { formDetail } = await findWhiteFormDetail(req.company_idx, formId);
      return res.send({ success: 200, formDetail });
    } catch (err) {
      next(err);
    }
  },
  deleteThumbNail: async (req, res, next) => {
    try {
      // formLink title 찾기
      const findThumbNailTitle = await db.formLink.findByPk(req.params.formId, {
        attributes: ['thumbNail_title'],
      });

      // formLink thumbNail, thumbNail_title 초기화
      const updateResult = await db.formLink.update(
        { thumbNail: '', thumbNail_title: null },
        { where: { idx: req.params.formId } }
      );
      // 업데이트 결과가 0일때 (실패)
      if (updateResult[0] == 0) {
        return res.send({ success: 400, message: '썸네일 삭제 실패' });
      }

      // s3에서 file이름으로 이미지 삭제 진행
      delFile(findThumbNailTitle.thumbNail_title, 'ordercheck/formThumbNail');

      return res.send({ success: 200, message: '썸네일 삭제 ' });
    } catch (err) {
      next(err);
    }
  },
  updateFormTitle: async (req, res, next) => {
    const {
      body: { formId, title },
      company_idx,
    } = req;
    try {
      await db.formLink.update(
        {
          title,
        },
        { where: { idx: formId } }
      );
      const { formDetail } = await findWhiteFormDetail(company_idx, formId);
      return res.send({ success: 200, formDetail });
    } catch (err) {
      next(err);
    }
  },
};
