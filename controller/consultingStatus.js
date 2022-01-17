const bodyParser = require('body-parser');
const { checkUserCompany } = require('../lib/apiFunctions');
const verify_data = require('../lib/jwtfunctions');

const db = require('../model/db');
const { pdfUpload, downFile } = require('../lib/aws/fileupload').ufile;
module.exports = {
  addConsultingForm: async (req, res) => {
    let {
      first,
      second,
      third,
      fourth,
      customer_name,
      customer_phoneNumber,
      company_idx,
    } = req.body;

    first = await verify_data(first);
    second = await verify_data(second);
    third = await verify_data(third);
    fourth = await verify_data(fourth);

    addElement = {
      ...first,
      ...second,
      ...third,
      ...fourth,
      customer_name,
      customer_phoneNumber,
      company_idx,
    };
    try {
      await db.consulting.create(addElement);
      return res.send({ success: 200 });
    } catch (err) {
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
      const checkResult = await checkUserCompany(company_idx, user_idx);
      if (checkResult == false) {
        return res.send({ success: 400 });
      }
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
      const checkResult = await checkUserCompany(company_idx, user_idx);
      if (checkResult == false) {
        return res.send({ success: 400 });
      }
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
      const checkResult = await checkUserCompany(
        customerData.company_idx,
        user_idx
      );
      if (checkResult == false) {
        return res.send({ success: 400 });
      }
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
      const checkResult = await checkUserCompany(body.company_idx, user_idx);
      if (checkResult == false) {
        return res.send({ success: 400 });
      }

      await db.consulting.update(
        { active: body.status },
        { where: { idx: body.consulting_idx } },
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
    const { body, loginUser: user_idx } = req;
    try {
      // 관리자가 회사소속인지 체크
      const checkResult = await checkUserCompany(body.company_idx, user_idx);
      if (checkResult == false) {
        return res.send({ success: 400 });
      }
      // pdf s3 저장
      let file = body.pdf_data;
      let query = {
        file: file,
        fileName: body.pdf_name,
        fileType: 'pdf',
      };
      pdfUpload(query, async (err, url, final_name) => {
        if (err) {
          res.send({ success: 400, message: err });
        } else {
          body.pdf_data = url.original;
          body.pdf_name = final_name;
          const result = await db.calculate.create(body);
          return res.send({ success: 200, url_Idx: result.idx });
        }
      });
    } catch (err) {
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
  downCalculate: async (req, res) => {
    const result = await db.calculate.findByPk(req.body.url_idx);
    result.pdf_name += '.pdf';
    downFile(result.pdf_name, (err, url) => {
      if (err) {
        console.log('실패', err);
        res.send({ success: 400, message: err });
      } else {
        res.attachment(result.pdf_name); // or whatever your logic needs
        res.send(url.Body);
      }
    });
  },
};
