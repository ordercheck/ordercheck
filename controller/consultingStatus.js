const {
  checkUserCompany,
  getFileName,
  createFileStore,
  getDetailCustomerInfo,

  check,
} = require('../lib/apiFunctions');
const db = require('../model/db');
const { checkDetailCustomerUpdateField } = require('../lib/checkData');
const { downFile } = require('../lib/aws/fileupload').ufile;
const {
  TeamkakaoPushNewForm,
  customerkakaoPushNewForm,
  customerkakaoPushNewCal,
} = require('../lib/kakaoPush');
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
    const t = await db.sequelize.transaction();
    try {
      // url을 string으로 연결
      const { body, files } = req;

      const selectUrl = (fileData) => {
        try {
          return (result = fileData.map((element) => {
            return element.location;
          }));
        } catch (err) {
          return;
        }
      };

      const createConsultingAndIncrement = async (bodyData) => {
        try {
          await db.consulting.create(bodyData, { transaction: t });
          await t.commit();

          db.company.increment(
            { form_link_count: 1, customer_count: 1 },
            { where: { idx: formLinkCompany.company_idx } }
          );
          res.send({ success: 200 });

          // 고객 카카오 푸쉬 보내기
          // await customerkakaoPushNewForm(
          //   bodyData.customer_phoneNumber,
          //   bodyData.company_name,
          //   bodyData.customer_name,
          //   '접수 내용 확인',
          //   bodyData.title
          // );

          // 팀원 카카오 푸쉬 보내기
          // const getMembers = await db.userCompany.findAll({
          //   where: { company_idx: bodyData.company_idx },
          //   include: [
          //     {
          //       model: db.user,
          //       attributes: ['user_phone'],
          //     },
          //   ],
          //   attributes: ['user_idx'],
          // });
          // getMembers.forEach(async (data) => {
          //   await TeamkakaoPushNewForm(
          //     data.user.user_phone,
          //     bodyData.title,
          //     bodyData.customer_name,
          //     '확인하기',
          //     bodyData.customer_phoneNumber
          //   );
          // });
        } catch (err) {
          await t.rollback();
          next(err);
        }
      };

      const formLinkCompany = await db.formLink.findOne({
        where: { form_link: body.form_link },
        include: [
          {
            model: db.company,
            attributes: ['company_name'],
          },
        ],
        attributes: ['company_idx', 'title'],
      });

      const { searchingAddress, searchingPhoneNumber } = changeToSearch(body);
      body.searchingAddress = searchingAddress;
      body.searchingPhoneNumber = searchingPhoneNumber;
      body.company_idx = formLinkCompany.company_idx;
      body.company_name = formLinkCompany.company.company_name;
      body.title = formLinkCompany.title;

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

      // 이미지나 파일이 없을 때  간편 Form
      if (!files.img && !files.concept) {
        // body.choice = JSON.stringify(body.choice);

        body.choice = JSON.parse(body.choice).join(', ');
        createConsultingAndIncrement(body);

        return;
      }
      // 이미지나 파일이 있을 때

      const imgUrlString = selectUrl(files.img);
      const conceptUrlString = selectUrl(files.concept);
      body.floor_plan = JSON.stringify(imgUrlString);
      body.hope_concept = JSON.stringify(conceptUrlString);
      body.choice = JSON.parse(body.choice).join(', ');
      body.expand = JSON.parse(body.expand).join(', ');
      body.carpentry = JSON.parse(body.carpentry).join(', ');
      body.paint = JSON.parse(body.paint).join(', ');
      body.bathroom_option = JSON.parse(body.bathroom_option).join(', ');
      body.floor = JSON.parse(body.floor).join(', ');
      body.tile = JSON.parse(body.tile).join(', ');
      body.electricity_lighting = JSON.parse(body.electricity_lighting).join(
        ', '
      );
      body.kitchen_option = JSON.parse(body.kitchen_option).join(', ');
      body.furniture = JSON.parse(body.furniture).join(', ');
      body.facility = JSON.parse(body.facility).join(', ');
      body.film = JSON.parse(body.film).join(', ');
      body.etc = JSON.parse(body.etc).join(', ');

      await createConsultingAndIncrement(body);

      return;
    } catch (err) {
      await t.rollback();
      next(err);
    }
  },

  setConsultingContactMember: async (req, res, next) => {
    const {
      params: { customer_idx, contract_person },
    } = req;
    try {
      await db.consulting.update(
        { contact_person: contract_person },
        { where: { idx: customer_idx } }
      );

      const consultResult = await getDetailCustomerInfo(
        { idx: customer_idx, company_idx: req.company_idx },
        next
      );

      return res.send({ success: 200, consultResult });
    } catch (err) {
      next(err);
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

      await db.consulting.destroy({ where: { idx } });
      return res.send({ success: 200 });
    } catch (err) {
      next(err);
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
    }
  },
  patchConsultingStatus: async (req, res, next) => {
    const {
      body: {
        room_size_kind,
        room_size,
        contract_possibility,

        detail_address,
        address,
        customer_phoneNumber,
        customer_name,
        memo,
        status,
      },
      params: { customer_idx },
    } = req;
    console.log('들어오자마자', contract_possibility);
    const consultResult = await checkDetailCustomerUpdateField(
      customer_idx,
      room_size_kind,
      room_size,
      contract_possibility,

      detail_address,
      address,
      customer_phoneNumber,
      customer_name,
      memo,
      status,
      next
    );

    return res.send({ success: 200, consultResult });
  },

  addCalculate: async (req, res, next) => {
    const { body, file } = req;

    try {
      // 몇차 인지 체크
      const findCalculate = await db.calculate.count({
        where: { customer_idx: body.customer_idx },
      });

      // 견적서 차수 +1씩 올리기
      if (findCalculate !== 0) {
        body.calculateNumber = `${findCalculate}차 견적서`;
      }

      const file_name = getFileName(file.key);
      body.file_name = file_name;
      body.file_url = req.file.location;

      const calculateCreateResult = await db.calculate.create(body);

      const findResult = {
        idx: calculateCreateResult.idx,
        title: calculateCreateResult.title,
        file_url: calculateCreateResult.file_url,
        file_name: calculateCreateResult.file_name,
        predicted_price: calculateCreateResult.predicted_price,
        sharedDate: calculateCreateResult.sharedDate,
        status: calculateCreateResult.status,
        createdAt: new Date(calculateCreateResult.createdAt)
          .toISOString()
          .split('T')[0]
          .replace(/-/g, '.'),
      };
      res.send({ success: 200, findResult });

      const findUser = await db.customer.findByPk(body.customer_idx, {
        include: [
          {
            model: db.company,
            attributes: ['company_name'],
          },
        ],
      });

      // await customerkakaoPushNewCal(
      //   findUser.customer_phoneNumber,
      //   findUser.company.company_name,
      //   findUser.customer_name,
      //   findCalculate,
      //   '견적서 확인'
      // );
      return;
    } catch (err) {
      next(err);
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
    }
  },
};
