const _f = require('../lib/functions');
const db = require('../model/db');

const {
  findWhiteFormDetail,
  getFileName,
  makePureText,
  searchingByTitle,
  checkTitle,
  sendCompanyAlarm,
  createExpireDate,
  findMemberExceptMe,
} = require('../lib/apiFunctions');

const { createFormLinkAttributes } = require('../lib/attributes');
module.exports = {
  createFormLink: async (req, res, next) => {
    const {
      body: { title },
      company_idx,
      user_idx,
    } = req;
    try {
      const insertData = await checkTitle(
        db.formLink,
        { title, company_idx },
        title,
        req.body
      );

      const findUserNameResult = await db.user.findByPk(user_idx, {
        attributes: ['user_name'],
      });

      const pureText = makePureText(insertData.title);
      insertData.form_link = _f.random5();
      insertData.company_idx = company_idx;
      insertData.searchingTitle = pureText;
      insertData.create_people = findUserNameResult.user_name;
      const createResult = await db.formLink.create(insertData);
      res.send({
        success: 200,
        formId: createResult.idx,
        message: '폼 생성 ',
      });
      // 팀원들에게 알람 보내기

      const io = req.app.get('io');
      const findMembers = await findMemberExceptMe(company_idx, user_idx);
      const message = `${findUserNameResult.user_name}님이 새로운 신청폼 [${title}]을 등록하였습니다.`;
      const expiry_date = createExpireDate();
      const data = {
        form_idx: createResult.idx,
        message,
        company_idx,
        alarm_type: 7,
        expiry_date,
      };

      await sendCompanyAlarm(data, findMembers, io);
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

      const { formDetail } = await findWhiteFormDetail(formId);
      res.send({ success: 200, formDetail });

      // 팀원들에게 알람 보내기
      const findUser = await db.user.findByPk(user_idx, {
        attributes: ['user_name'],
      });

      const io = req.app.get('io');
      const findMembers = await findMemberExceptMe(company_idx, user_idx);

      const message = `${findUser.user_name}님이 [${formDetail.title}] 신청폼을 수정하였습니다.`;

      const expiry_date = createExpireDate();
      const data = {
        form_idx: formId,
        message,
        company_idx,
        alarm_type: 5,
        expiry_date,
      };

      await sendCompanyAlarm(data, findMembers, io);
      return;
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
    const {
      params: { formId },
      user_idx,
      company_idx,
    } = req;
    try {
      const formTitle = await db.formLink.findByPk(formId, {
        attributes: ['title'],
      });
      await db.formLink.destroy({ where: { idx: formId } });
      res.send({ success: 200, message: '삭제 성공' });

      // 팀원들에게 알람 보내기
      const findUser = await db.user.findByPk(user_idx, {
        attributes: ['user_name'],
      });
      //
      const io = req.app.get('io');
      const findMembers = await findMemberExceptMe(company_idx, user_idx);
      const message = `${findUser.user_name}님이 [${formTitle.title}] 신청폼을 삭제하였습니다.`;

      const expiry_date = createExpireDate();
      const data = {
        form_idx: formId,
        message,
        company_idx,
        alarm_type: 8,
        expiry_date,
      };

      await sendCompanyAlarm(data, findMembers, io);
      return;
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
    const {
      body: { title, whiteLabelChecked, formId, expression },
      company_idx,
      user_idx,
    } = req;
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

      res.send({ success: 200, formDetail });

      // 팀원들에게 알람 보내기
      const findUser = await db.user.findByPk(user_idx, {
        attributes: ['user_name'],
      });

      const io = req.app.get('io');
      const findMembers = await findMemberExceptMe(company_idx, user_idx);

      const message = `${findUser.user_name}님이 [${title}] 신청폼을 수정하였습니다.`;
      const expiry_date = createExpireDate();
      const data = {
        form_idx: formId,
        message,
        company_idx,
        alarm_type: 5,
        expiry_date,
      };

      await sendCompanyAlarm(data, findMembers, io);
      return;
    } catch (err) {
      next(err);
    }
  },
  deleteThumbNail: async (req, res, next) => {
    try {
      const {
        params: { formId },
        user_idx,
        company_idx,
      } = req;
      // formLink thumbNail, thumbNail_title 초기화
      await db.formLink.update(
        { thumbNail: '', thumbNail_title: null },
        { where: { idx: formId } }
      );

      res.send({ success: 200, message: '썸네일 삭제 ' });

      // 팀원들에게 알람 보내기
      const findUser = await db.user.findByPk(user_idx, {
        attributes: ['user_name'],
      });

      const formTitle = await db.formLink.findByPk(formId, {
        attributes: ['title'],
      });

      const io = req.app.get('io');
      const findMembers = await findMemberExceptMe(company_idx, user_idx);

      const message = `${findUser.user_name}님이 [${formTitle.title}] 신청폼을 수정하였습니다.`;

      const expiry_date = createExpireDate();
      const data = {
        form_idx: formId,
        message,
        company_idx,
        alarm_type: 5,
        expiry_date,
      };

      await sendCompanyAlarm(data, findMembers, io);
      return;
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
