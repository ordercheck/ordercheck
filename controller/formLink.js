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
  findMembers,
} = require("../lib/apiFunctions");
const { Op } = require("sequelize");
const {
  createFormLinkAttributes,
  getFormLinkInfoAttributes,
} = require("../lib/attributes");
const { company } = require("../model/db");
const { Alarm } = require("../lib/classes/AlarmClass");
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

      if (findCompanyOwner.user.idx !== user_idx) {
        const alarm = new Alarm({});

        const message = alarm.createFormAlarm(
          findUserNameResult.user_name,
          insertData.title
        );

        const data = {
          form_idx: createResult.idx,
          message,
          company_idx,
          alarm_type: 25,
        };
        const io = req.app.get("io");
        const findMembers = [findCompanyOwner.user.idx];
        alarm.sendMultiAlarm(data, findMembers, io);
      }
      return;
    } catch (err) {
      next(err);
    }
  },

  showFormLink: async (req, res, next) => {
    const { user_idx, company_idx } = req;
    const form = new Form({});
    try {
      const formList = await form.findAllLink(
        { company_idx, user_idx },
        createFormLinkAttributes
      );

      if (!formList) {
        return res.send({ success: 400, message: "등록된 폼이 없습니다" });
      }

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
        user_idx,
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
      const alarm = new Alarm({});
      // 팀원들에게 알람 보내기
      const findUser = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      const message = alarm.changeFormAlarm(
        findUser.user_name,
        formDetail.title
      );

      const data = {
        form_idx: formId,
        message,
        company_idx,
        alarm_type: 20,
      };
      const findOpenMemberResult = await db.formOpen.findAll({
        where: { formLink_idx: formId, user_idx: { [Op.ne]: user_idx } },
        attributes: ["user_idx"],
        raw: true,
      });
      const findMembers = [];
      findOpenMemberResult.forEach((data) => {
        findMembers.push(data.user_idx);
      });

      const io = req.app.get("io");
      alarm.sendMultiAlarm(data, findMembers, io);

      return;
    } catch (err) {
      next(err);
    }
  },
  duplicateForm: async (req, res, next) => {
    const {
      params: { formId },
      company_idx,
      user_idx,
    } = req;

    // 열람 권한자 찾기
    const findFormOpenMember = await db.formOpen.findAll({
      where: { formLink_idx: formId },
      raw: true,
    });

    // copyCount 1증가
    const findFormLink = await db.formLink.findByPk(formId, {
      attributes: { exclude: ["idx", "createdAt", "updatedAt"] },
    });
    // 복사본 제목 생성
    const duplicateTitle = `${findFormLink.title}_copy`;
    findFormLink.title = duplicateTitle;
    findFormLink.form_link = _f.random5();

    const duplicateForm = await db.formLink.create(findFormLink.dataValues);

    findFormOpenMember.forEach(async (data) => {
      await db.formOpen.create({
        user_name: data.user_name,
        formLink_idx: duplicateForm.idx,
        user_idx: data.user_idx,
      });
    });

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

    res.send({
      success: 200,
      duplicateResult,
    });

    // 웹 알림 소유주 체크
    const checkHuidx = await db.company.findByPk(company_idx, {
      attributes: ["huidx"],
    });

    if (checkHuidx.huidx !== user_idx) {
      const alarm = new Alarm({});

      const findUser = await db.user.findByPk(user_idx, {
        attributes: ["use_name"],
      });
      const message = alarm.createFormAlarm(findUser.user_name, duplicateTitle);

      const data = {
        form_idx: createResult.idx,
        message,
        company_idx,
        alarm_type: 25,
      };
      const io = req.app.get("io");
      const findMembers = [checkHuidx.huidx];
      alarm.sendMultiAlarm(data, findMembers, io);
    }
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
      const findOpenMemberResult = await db.formOpen.findAll({
        where: { formLink_idx: formId, user_idx: { [Op.ne]: user_idx } },
        attributes: ["user_idx"],
        raw: true,
      });
      await db.formLink.destroy({ where: { idx: formId } });

      res.send({ success: 200, message: "삭제 성공" });

      const alarm = new Alarm({});

      // 팀원들에게 알람 보내기
      const findUser = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      const message = alarm.delFormAlarm(findUser.user_name, formTitle.title);

      const data = {
        message,
        company_idx,
        alarm_type: 26,
      };

      const findMembers = [];
      findOpenMemberResult.forEach((data) => {
        findMembers.push(data.user_idx);
      });

      const io = req.app.get("io");
      alarm.sendMultiAlarm(data, findMembers, io);

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

      const alarm = new Alarm({});

      // 팀원들에게 알람 보내기
      const findUser = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      const message = alarm.changeFormAlarm(findUser.user_name, title);

      const data = {
        form_idx: formId,
        message,
        company_idx,
        alarm_type: 20,
      };

      const findOpenMemberResult = await db.formOpen.findAll({
        where: { formLink_idx: formId, user_idx: { [Op.ne]: user_idx } },
        attributes: ["user_idx"],
        raw: true,
      });

      const findMembers = [];
      findOpenMemberResult.forEach((data) => {
        findMembers.push(data.user_idx);
      });

      const io = req.app.get("io");
      alarm.sendMultiAlarm(data, findMembers, io);

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
      const alarm = new Alarm({});
      // 팀원들에게 알람 보내기
      const findUser = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      const formTitle = await db.formLink.findByPk(formId, {
        attributes: ["title"],
      });

      const message = alarm.changeFormAlarm(findUser.user_name, formTitle);

      const data = {
        form_idx: formId,
        message,
        company_idx,
        alarm_type: 20,
      };
      const findOpenMemberResult = await db.formOpen.findAll({
        where: { formLink_idx: formId, user_idx: { [Op.ne]: user_idx } },
        attributes: ["user_idx"],
        raw: true,
      });
      const findMembers = [];
      findOpenMemberResult.forEach((data) => {
        findMembers.push(data.user_idx);
      });

      const io = req.app.get("io");
      alarm.sendMultiAlarm(data, findMembers, io);
      return;
    } catch (err) {
      next(err);
    }
  },

  updateFormTitle: async (req, res, next) => {
    const {
      body: { formId, title },
      user_idx,
      company_idx,
    } = req;
    try {
      const beforeFormLink = await db.formLink.findByPk(formId, {
        attributes: ["title"],
      });

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

      res.send({ success: 200, formDetail });

      const alarm = new Alarm({});

      const findUser = await db.user.findByPk(user_idx, {
        attributes: ["user_name"],
      });

      const message = alarm.changeFormTitleAlarm(
        findUser.user_name,
        beforeFormLink.title,
        formDetail.title
      );

      const data = {
        form_idx: formId,
        message,
        company_idx,
        alarm_type: 21,
      };

      const findOpenMemberResult = await db.formOpen.findAll({
        where: { formLink_idx: formId, user_idx: { [Op.ne]: user_idx } },
        attributes: ["user_idx"],
        raw: true,
      });

      const findMembers = [];
      findOpenMemberResult.forEach((data) => {
        findMembers.push(data.user_idx);
      });

      const io = req.app.get("io");
      alarm.sendMultiAlarm(data, findMembers, io);
      return;
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
