const {
  checkUserCompany,
  getFileName,
  createFileStore,
} = require('../lib/apiFunctions');
const db = require('../model/db');
const { downFile } = require('../lib/aws/fileupload').ufile;

const changeToSearch = (body) => {
  const searchingPhoneNumber = body.customer_phoneNumber.replace(/-/g, '');

  const searchingAddress = `${body.address.replace(
    / /g,
    ''
  )}${body.detail_address.replace(/ /g, '')}`;
  return {
    searchingPhoneNumber,
    searchingAddress,
  };
};

module.exports = {
  addConsultingForm: async (req, res, next) => {
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
    const formLinkCompany = await db.formLink.findOne({
      where: { form_link: body.form_link },
    });

    if (!files.img && !files.concept) {
      try {
        const { searchingAddress, searchingPhoneNumber } = changeToSearch(body);
        body.company_idx = formLinkCompany.company_idx;
        body.searchingAddress = searchingAddress;
        body.searchingPhoneNumber = searchingPhoneNumber;
        const createCustomerResult = await db.customer.create(body, {
          transaction: t,
        });
        body.customer_phoneNumber = createCustomerResult.customer_phoneNumber;
        body.customer_name = createCustomerResult.customer_name;
        body.customer_idx = createCustomerResult.idx;
        // 파일 보관함 db 생성
        const createFileStoreResult = await createFileStore(body, t);

        if (!createFileStoreResult.success) {
          next(createFileStoreResult.err);
          return;
        }

        await db.consulting.create(body, { transaction: t });

        await t.commit();

        db.company.increment(
          { form_link_count: 1, customer_count: 1 },
          { where: { idx: formLinkCompany.company_idx } }
        );

        return res.send({ success: 200 });
      } catch (err) {
        await t.rollback();
        next(err);
      }
    }
    const imgUrlString = selectUrl(files.img);
    const conceptUrlString = selectUrl(files.concept);
    body.floor_plan = JSON.stringify(imgUrlString);
    body.hope_concept = JSON.stringify(conceptUrlString);
    try {
      body.company_idx = formLinkCompany.company_idx;
      const createCustomerResult = await db.customer.create(body, {
        transaction: t,
      });
      body.customer_idx = createCustomerResult.idx;
      body.customer_phoneNumber = createCustomerResult.customer_phoneNumber;
      body.customer_name = createCustomerResult.customer_name;

      // 파일 보관함 db 생성
      const createFileStoreResult = await createFileStore(body, {
        transaction: t,
      });

      if (!createFileStoreResult.success) {
        next(createFileStoreResult.err);
        return;
      }

      await db.consulting.create(body, { transaction: t });
      await t.commit();
      return res.send({ success: 200 });
    } catch (err) {
      console.log(err);
      await t.rollback();
      next(err);
    }
  },

  setConsultingContactMember: async (req, res, next) => {
    const {
      body: { idx, contact_person },
      user_idx,
      company_idx,
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
      next(err);
      return res.send({ success: 500, message: err.message });
    }
  },

  delConsulting: async (req, res, next) => {
    const {
      body: { idx },
      user_idx,
      company_idx,
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
      next(err);
      return res.send({ success: 500, message: err.message });
    }
  },
  addCompanyCustomer: async (req, res, next) => {
    const { body, user_idx, company_idx } = req;
    const t = await db.sequelize.transaction();
    try {
      // 관리자가 회사소속인지 체크
      // const checkResult = await checkUserCompany(
      //   customerData.company_idx,
      //   user_idx
      // );
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }

      // 검색용으로 변경
      const { searchingPhoneNumber, searchingAddress } = changeToSearch(body);

      body.user_idx = user_idx;
      body.company_idx = company_idx;
      body.searchingAddress = searchingAddress;
      body.searchingPhoneNumber = searchingPhoneNumber;
      const createCustomerResult = await db.customer.create(body, {
        transaction: t,
      });
      body.customer_phoneNumber = createCustomerResult.customer_phoneNumber;
      body.customer_name = createCustomerResult.customer_name;
      const { success, err } = await createFileStore(body, {
        transaction: t,
      });
      if (!success) {
        next(err);
      }
      db.company.increment({ customer_count: 1 }, { where: { idx: user_idx } });
      await t.commit();

      return res.send({ success: 200 });
    } catch (err) {
      await t.rollback();
      next(err);
      return res.send({ success: 500, message: err.message });
    }
  },
  patchConsultingStatus: async (req, res, next) => {
    const { body, user_idx, company_idx } = req;
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
      next(err);
      return res.send({ success: 500, message: err.message });
    }
  },

  addCalculate: async (req, res, next) => {
    const { body, file, user_idx, company_idx } = req;
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
        next(err);
      }
    }
    try {
      // 관리자가 회사소속인지 체크
      // const checkResult = await checkUserCompany(body.company_idx, user_idx);
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }
      // pdf s3 저장
      getFileName(file.key);
      body.pdf_name = file_name;
      body.pdf_data = req.file.location;
      const result = await db.calculate.create(body);
      return res.send({ success: 200, url_Idx: result.idx });
    } catch (err) {
      next(err);
      return res.send({ success: 500, message: err.message });
    }
  },
  downCalculate: async (req, res, next) => {
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
  doIntegratedUser: async (req, res, next) => {
    const { body } = req;

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
      next(err);
      return res.send({ success: 500, message: err.message });
    }
  },
};
