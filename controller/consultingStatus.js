const { checkUserCompany } = require('../lib/apiFunctions');
const db = require('../model/db');
const { downFile } = require('../lib/aws/fileupload').ufile;
const _f = require('../lib/functions');
module.exports = {
  addConsultingForm: async (req, res) => {
    // url을 string으로 연결
    let { body, files } = req;
    // 트랜젝션 시작
    const t = await db.sequelize.transaction();
    selectUrl = (files) => {
      try {
        return (result = files.map((element) => {
          return element.location;
        }));
      } catch (err) {
        return;
      }
    };
    const formLinkUser = await db.formLink.findOne({
      where: { form_link: body.form_link },
    });

    if (!files.img && !files.concept) {
      try {
        body.user_idx = formLinkUser.user_idx;
        const result = await db.customer.create(body, { transaction: t });
        body.customer_idx = result.idx;
        await db.consulting.create(body, { transaction: t });
        t.commit();
        return res.send({ success: 200 });
      } catch (err) {
        t.rollback();
        const Err = err.message;
        return res.send({ success: 500, Err });
      }
    }
    const imgUrlString = selectUrl(files.img);
    const conceptUrlString = selectUrl(files.concept);
    body.floor_plan = JSON.stringify(imgUrlString);
    body.hope_concept = JSON.stringify(conceptUrlString);
    try {
      body.user_idx = formLinkUser.user_idx;
      const result = await db.customer.create(body, { transaction: t });
      body.customer_idx = result.idx;
      await db.consulting.create(body, { transaction: t });
      t.commit();
      return res.send({ success: 200 });
    } catch (err) {
      t.rollback();
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },

  setConsultingContactMember: async (req, res) => {
    const {
      body: { idx, company_idx, contact_person },
      loginUser: user_idx,
    } = req;
    try {
      // 관리자가 회사소속인지 체크
      // const checkResult = await checkUserCompany(company_idx, user_idx);
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }
      // 유저의 권환을 체크
      if (checkResult.authority == 1) {
        await db.consulting.update({ contact_person }, { where: { idx } });
        return res.send({ success: 200 });
      }
      return res.send({ success: 400 });
    } catch (err) {
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },

  delConsulting: async (req, res) => {
    const {
      body: { idx, company_idx },
      loginUser: user_idx,
    } = req;
    try {
      // 관리자가 회사소속인지 체크
      // const checkResult = await checkUserCompany(company_idx, user_idx);
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }
      // 유저의 권환을 체크
      if (checkResult.authority == 1) {
        await db.consulting.destroy({ where: { idx } });
        return res.send({ success: 200 });
      }
      return res.send({ success: 400 });
    } catch (err) {
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
  addCompanyCustomer: async (req, res) => {
    const { body: customerData, loginUser: user_idx } = req;
    try {
      // 관리자가 회사소속인지 체크
      // const checkResult = await checkUserCompany(
      //   customerData.company_idx,
      //   user_idx
      // );
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }
      await db.consulting.create(customerData);
      return res.send({ success: 200 });
    } catch (err) {
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
  patchConsultingStatus: async (req, res) => {
    const { body, loginUser: user_idx } = req;
    const t = await db.sequelize.transaction();

    try {
      // 관리자가 회사소속인지 체크
      // const checkResult = await checkUserCompany(body.company_idx, user_idx);
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }

      await db.customer.update(
        { active: body.status },
        { where: { idx: body.customer_idx } },
        { transaction: t }
      );
      await db.timeLine.create(body, { transaction: t });
      await t.commit();
      return res.send({ success: 200 });
    } catch (err) {
      await t.rollback();
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },

  addCalculate: async (req, res) => {
    const { body, file, loginUser: user_idx } = req;
    if (!file) {
      try {
        // 관리자가 회사소속인지 체크
        // const checkResult = await checkUserCompany(body.company_idx, user_idx);
        // if (checkResult == false) {
        //   return res.send({ success: 400 });
        // }

        body.pdf_name = file.originalname;
        const result = await db.calculate.create(body);
        return res.send({ success: 200, url_Idx: result.idx });
      } catch (err) {
        const Err = err.message;
        return res.send({ success: 500, Err });
      }
    }
    try {
      // 관리자가 회사소속인지 체크
      // const checkResult = await checkUserCompany(body.company_idx, user_idx);
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }
      // pdf s3 저장
      const [, file_name] = file.key.split('/');
      body.pdf_name = file_name;
      body.pdf_data = req.file.location;
      const result = await db.calculate.create(body);
      return res.send({ success: 200, url_Idx: result.idx });
    } catch (err) {
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
  downCalculate: async (req, res) => {
    const result = await db.calculate.findByPk(req.body.url_idx);
    downFile(result.pdf_name, (err, url) => {
      if (err) {
        res.send({ success: 400, message: err });
      } else {
        res.attachment(result.pdf_name);
        return res.send(url.Body);
      }
    });
  },
  doIntegratedUser: async (req, res) => {
    const { body, loginUser: user_idx } = req;

    try {
      // const checkResult = await checkUserCompany(body.company_idx, user_idx);
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }
      // 대표 상담폼과 병합

      body.target_idx.forEach(async (data) => {
        try {
          await db.consulting.update(
            {
              customer_idx: body.main_idx,
            },
            {
              where: { customer_idx: data },
            }
          );
          await db.timeLine.update(
            {
              customer_idx: body.main_idx,
            },
            {
              where: { customer_idx: data },
            }
          );
          await db.customer.destroy({
            where: { idx: data },
          });
        } catch (err) {
          console.log(err);
        }
      });
      return res.send({ success: 200 });
    } catch (err) {
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
  createFromLink: async (req, res) => {
    try {
      req.body.form_link = _f.random5();
      req.body.user_idx = req.loginUser;

      await db.formLink.create(req.body);
      return res.send({ success: 200, message: '폼 링크 생성' });
    } catch (err) {
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
};
