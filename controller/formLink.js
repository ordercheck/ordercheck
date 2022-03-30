const _f = require("../lib/functions");
const db = require("../model/db");
const { Form } = require("../lib/classes/FormClass");
const {
  findWhiteFormDetail,
  getFileName,
  makePureText,
  searchingByTitle,
  checkTitle,
  sendCompanyAlarm,
  findMemberExceptMe,
} = require("../lib/apiFunctions");

const {
  createFormLinkAttributes,
  getFormLinkInfoAttributes,
} = require("../lib/attributes");
const { company } = require("../model/db");
module.exports = {
  createFormLink: async (req, res, next) => {
    const form = new Form({});
    const {
      body: { title, tempType },
      company_idx,
      user_idx,
    } = req;
    try {
      const insertData = await form.checkTitle({ title, company_idx });

      const findUserNameResult = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      const pureText = makePureText(insertData.title);
      insertData.form_link = _f.random5();
      insertData.company_idx = company_idx;
      insertData.searchingTitle = pureText;
      insertData.create_people = findUserNameResult.user_name;
      insertData.tempType = tempType;
      insertData.user_idx = user_idx;

      const createResult = await form.createFormLink(insertData);

      const findCompanyOwner = await db.company.findByPk(
        company_idx,
        {
          include: [
            {
              model: db.user,
              attributes: ["user_name", "idx"],
            },
          ],
        },
        {
          attributes: ["idx"],
        }
      );

      // 소유주인지 체크
      if (user_idx !== findCompanyOwner.user.idx) {
        // 폼 만든사람 데이터
        const formOpenData = {
          formLink_idx: createResult.idx,
          user_name: createResult.create_people,
          user_idx,
        };
        await form.createOpenMember(formOpenData);
      }

      // 소유주 데이터
      const formOpenOwnerData = {
        formLink_idx: createResult.idx,
        user_name: findCompanyOwner.user.user_name,
        user_idx: findCompanyOwner.user.idx,
      };

      await form.createOpenMember(formOpenOwnerData);

      res.send({
        success: 200,
        formId: createResult.idx,
        message: "폼 생성 ",
      });
      // 팀원들에게 알람 보내기
      const io = req.app.get("io");
      const findMembers = await findMemberExceptMe(company_idx, user_idx);
      const message = `${findUserNameResult.user_name}님이 새로운 신청폼 [${title}]을 등록하였습니다.`;

      const data = {
        form_idx: createResult.idx,
        message,
        company_idx,
        alarm_type: 7,
      };

      await sendCompanyAlarm(data, findMembers, io);
    } catch (err) {
      next(err);
    }
  },

  showFormLink: async (req, res, next) => {
    const { company_idx, user_idx } = req;
    const form = new Form({});
    try {
      let formList = await form.findAllLink(
        { company_idx, user_idx },
        createFormLinkAttributes
      );

      if (!formList) {
        return res.send({ success: 400, message: "등록된 폼이 없습니다" });
      }

      formList = formList.map((data) => {
        data.urlPath = data.form_link;
        return data;
      });

      return res.send({ success: 200, formList });
    } catch (err) {
      next(err);
    }
  },
  createThumbNail: async (req, res, next) => {
    try {
      const {
        params: { formId },
        company_idx,
      } = req;

      const originalUrl = req.file.location;
      const thumbNail_title = getFileName(originalUrl);
      const thumbNail = originalUrl.replace(/\/original\//, "/thumb/");

      await db.formLink.update(
        {
          thumbNail,
          thumbNail_title,
        },
        { where: { idx: formId } }
      );

      const { formDetail } = await findWhiteFormDetail(formId, company_idx);
      res.send({ success: 200, formDetail });

      // 팀원들에게 알람 보내기
      const findUser = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      const io = req.app.get("io");
      const findMembers = await findMemberExceptMe(company_idx, user_idx);

      const message = `${findUser.user_name}님이 [${formDetail.title}] 신청폼을 수정하였습니다.`;

      const data = {
        form_idx: formId,
        message,
        company_idx,
        alarm_type: 5,
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
      attributes: { exclude: ["idx", "createdAt", "updatedAt"] },
    });
    // 복사본 제목 생성
    const duplicateTitle = `${findFormLink.title}_copy`;
    findFormLink.title = duplicateTitle;
    findFormLink.form_link = _f.random5();

    const duplicateForm = await db.formLink.create(findFormLink.dataValues);
    // 시간 형태에 맞게 변형
    const createdAt = duplicateForm.createdAt
      .toISOString()
      .split("T")[0]
      .replace(/-/g, ".");

    const duplicateResult = {
      formId: duplicateForm.idx,
      title: duplicateForm.title,
      form_link: duplicateForm.form_link,
      expression: duplicateForm.expression,
      urlPath: duplicateForm.form_link,
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
        attributes: ["title"],
      });
      await db.formLink.destroy({ where: { idx: formId } });

      res.send({ success: 200, message: "삭제 성공" });

      // 팀원들에게 알람 보내기
      const findUser = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      const io = req.app.get("io");
      const findMembers = await findMemberExceptMe(company_idx, user_idx);
      const message = `${findUser.user_name}님이 [${formTitle.title}] 신청폼을 삭제하였습니다.`;

      const data = {
        form_idx: formId,
        message,
        company_idx,
        alarm_type: 8,
      };

      await sendCompanyAlarm(data, findMembers, io);
      return;
    } catch (err) {
      next(err);
    }
  },

  showFormDetail: async (req, res, next) => {
    const {
      params: { formId },
      company_idx,
    } = req;
    try {
      const { formDetail } = await findWhiteFormDetail(formId, company_idx);
      return res.send({ success: 200, formDetail });
    } catch (err) {
      next(err);
    }
  },

  searchFormLink: async (req, res, next) => {
    try {
      const pureText = makePureText(req.params.title);
      const searchResult = await searchingByTitle(pureText, req.company_idx);
      return res.send({ success: 200, searchResult });
    } catch (err) {
      next(err);
    }
  },

  updateForm: async (req, res, next) => {
    const {
      body: { title, formId, expression },
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
        },
        { where: { idx: formId } }
      );

      // 수정된 정보를 찾기
      const { formDetail } = await findWhiteFormDetail(formId, company_idx);

      res.send({ success: 200, formDetail });

      // 팀원들에게 알람 보내기
      const findUser = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      const io = req.app.get("io");
      const findMembers = await findMemberExceptMe(company_idx, user_idx);

      const message = `${findUser.user_name}님이 [${title}] 신청폼을 수정하였습니다.`;

      const data = {
        form_idx: formId,
        message,
        company_idx,
        alarm_type: 5,
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
        { thumbNail: "", thumbNail_title: null },
        { where: { idx: formId } }
      );

      res.send({ success: 200, message: "썸네일 삭제 " });

      // 팀원들에게 알람 보내기
      const findUser = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      const formTitle = await db.formLink.findByPk(formId, {
        attributes: ["title"],
      });

      const io = req.app.get("io");
      const findMembers = await findMemberExceptMe(company_idx, user_idx);

      const message = `${findUser.user_name}님이 [${formTitle.title}] 신청폼을 수정하였습니다.`;

      const data = {
        form_idx: formId,
        message,
        company_idx,
        alarm_type: 5,
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
      formDetail.urlPath = formDetail.form_link;

      return res.send({ success: 200, formDetail });
    } catch (err) {
      next(err);
    }
  },

  getFormLinkInfo: async (req, res, next) => {
    const {
      params: { form_link },
      formClose,
    } = req;

    try {
      const findResult = await db.formLink.findOne({
        where: { form_link },
        attributes: getFormLinkInfoAttributes,
      });

      if (!findResult) {
        next({ message: "없는 링크입니다." });
      }
      findResult.dataValues.formClose = formClose;

      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },
};
