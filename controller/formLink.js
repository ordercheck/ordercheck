const _f = require('../lib/functions');
const db = require('../model/db');
const { delFile } = require('../lib/aws/fileupload').ufile;
const {
  errorFunction,
  findWhiteFormDetail,
  getFileName,
  makePureText,
  searchingByTitle,
  checkTitle,
} = require('../lib/apiFunctions');

const { createFormLinkAttributes } = require('../lib/attributes');
module.exports = {
  createFormLink: async (req, res, next) => {
    const {
      body: { title },
      company_idx,
    } = req;
    try {
      const insertData = await checkTitle(
        db.formLink,
        { title, company_idx },
        title,
        req
      );

      const pureText = makePureText(insertData.body.title);
      insertData.body.form_link = _f.random5();
      insertData.body.company_idx = insertData.company_idx;
      insertData.body.searchingTitle = pureText;
      const createResult = await db.formLink.create(insertData.body);
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
    const { company_idx } = req;
    try {
      let formList = await db.formLink.findAll({
        where: { company_idx },
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
        const originalUrl = req.file.location;
        const thumbNail_title = getFileName(originalUrl);
        const thumbNail = originalUrl.replace(/\/original\//, '/thumb/');

        await db.formLink.update(
          {
            thumbNail,
            thumbNail_title,
          },
          { where: { idx: formId } }
        );
      };
      const findFormLinkResult = await db.formLink.findByPk(formId, {
        attributes: ['thumbNail_title'],
      });
      if (findFormLinkResult.thumbNail_title) {
        delFile(findFormLinkResult.thumbNail_title, 'ordercheck/thumb');
        changeFormLinkUrl();
      } else {
        changeFormLinkUrl();
      }

      const { formDetail } = await findWhiteFormDetail(formId);
      return res.send({ success: 200, formDetail });
    } catch (err) {
      next(err);
    }
  },
  duplicateForm: async (req, res, next) => {
    // copyCount 1증가

    const findFormLink = await db.formLink.findByPk(req.params.formId, {
      attributes: { exclude: ['idx', 'createdAt', 'updatedAt'] },
    });
    // 복사본 제목 생성
    const duplicateTitle = `${findFormLink.title}_copy`;
    findFormLink.title = duplicateTitle;
    findFormLink.form_link = _f.random5();

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
      const { formDetail } = await findWhiteFormDetail(req.params.formId);

      return res.send({ success: 200, formDetail });
    } catch (err) {
      next(err);
    }
  },
  searchFormLink: async (req, res, next) => {
    try {
      const pureText = makePureText(req.params.title);
      const searchResult = await searchingByTitle(pureText);
      return res.send({ success: 200, searchResult });
    } catch (err) {
      next(err);
    }
  },
  updateForm: async (req, res, next) => {
    const { title, whiteLabelChecked, formId, expression } = req.body;
    try {
      // 프런트에서 준 최신 업데이트 정보로 formLink 수정
      const searchingTitle = makePureText(title);

      await db.formLink.update(
        {
          title,
          expression,
          searchingTitle,
          whiteLabelChecked,
        },
        { where: { idx: formId } }
      );

      // 수정된 정보를 찾기
      const { formDetail } = await findWhiteFormDetail(formId);
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
    } = req;
    try {
      const searchingTitle = makePureText(title);
      await db.formLink.update(
        {
          title,
          searchingTitle,
        },
        { where: { idx: formId } }
      );

      const formDetail = await db.formLink.findByPk(formId, {
        attributes: createFormLinkAttributes,
      });
      formDetail.urlPath = `${formDetail.form_link}/${formDetail.expression}`;

      return res.send({ success: 200, formDetail });
    } catch (err) {
      next(err);
    }
  },
  getFormLinkInfo: async (req, res, next) => {
    const { form_link } = req.params;
    try {
      const findResult = await db.formLink.findOne({
        where: { form_link },
        attributes: ['whiteLabelChecked', 'expression', 'tempType'],
      });

      if (!findResult) {
        next({ message: '없는 링크입니다.' });
      }

      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },
};
