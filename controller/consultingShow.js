const {
  checkUserCompany,
  checkPage,
  addUserId,
  changeToJSON,
} = require('../lib/apiFunctions');
const { changeDate } = require('../lib/apiFunctions');
const db = require('../model/db');
const { Op } = require('sequelize');
const {
  showDetailConsultingAttributes,
  showDetailJoinConsultingAttributes,
  showDetailMainConsultingAttributes,
  showIntegratedUserAttributes,
  customerAttributes,
} = require('../lib/attributes');

module.exports = {
  showTotalConsultingDefault: async (req, res, next) => {
    let {
      params: { limit, page },
      query: { No, Name, Address, Date },
      company_idx,
    } = req;

    const totalData = await db.customer.count({ where: { company_idx } });
    const { start, intlimit, intPage } = await checkPage(
      limit,
      page,
      company_idx
    );
    const getCustomerData = async (sortField, sort, No, addminus) => {
      let customerFindAndCount = await db.customer.findAndCountAll({
        where: { company_idx },
        include: [
          {
            model: db.user,
            attributes: ['idx', 'user_name'],
          },
        ],
        attributes: customerAttributes,
        order: [[sortField, sort]],
        offset: start,
        limit: intlimit,
      });
      customerFindAndCount = changeToJSON(customerFindAndCount);
      const customerData = addUserId(customerFindAndCount.rows, addminus, No);
      return { customerFindAndCount, customerData };
    };

    try {
      let getCustomerDataResult = '';
      let customerNumber = intPage * intlimit - (intlimit - 1);
      if (!No && !Name && !Address && !Date) {
        getCustomerDataResult = await getCustomerData(
          'createdAt',
          'DESC',
          customerNumber,
          'plus'
        );

        if (getCustomerDataResult.customerData == 0) {
          return res.send({ success: 400, message: '고객이 없습니다.' });
        }
      }

      // 0이 오름차순,1이 내림차순 (ASC는 오름차순)
      if (No) {
        getCustomerDataResult = await getCustomerData(
          'createdAt',
          No == 0 ? 'ASC' : 'DESC',
          No == 0 ? totalData - intlimit * intPage + intlimit : customerNumber,
          No == 0 ? 'minus' : 'plus'
        );

        if (getCustomerDataResult.customerData == 0) {
          return res.send({ success: 400, message: '고객이 없습니다.' });
        }
      }
      if (Name) {
        getCustomerDataResult = await getCustomerData(
          'customer_name',
          Name == 0 ? 'ASC' : 'DESC',
          Name == 0 ? totalData - limit * page + limit : customerNumber,
          Name == 0 ? 'minus' : 'plus'
        );
        if (getCustomerDataResult.customerData == 0) {
          return res.send({ success: 400, message: '고객이 없습니다.' });
        }
      }

      if (Address) {
        getCustomerDataResult = await getCustomerData(
          'searchingAddress',
          Address == 0 ? 'ASC' : 'DESC',
          Address == 0 ? totalData - limit * page + limit : customerNumber,
          Address == 0 ? 'minus' : 'plus'
        );
        if (getCustomerDataResult.customerData == 0) {
          return res.send({ success: 400, message: '고객이 없습니다.' });
        }
      }

      if (Date) {
        getCustomerDataResult = await getCustomerData(
          'updatedAt',
          Date == 0 ? 'ASC' : 'DESC',
          Date == 0 ? totalData - limit * page + limit : customerNumber,
          Date == 0 ? 'minus' : 'plus'
        );
        if (getCustomerDataResult.customerData == 0) {
          return res.send({ success: 400, message: '고객이 없습니다.' });
        }
      }

      return res.send({
        success: 200,
        customerData: getCustomerDataResult.customerData,
        totalUser: totalData,
        page: intPage,
        totalPage: Math.ceil(
          getCustomerDataResult.customerFindAndCount.count / limit
        ),
      });
    } catch (err) {
      next(err);
    }
  },

  showCustomers: async (req, res, next) => {
    const {
      params: { form_link },
      user_idx,
      company_idx,
    } = req;
    try {
      // 유저회사 정보를 체크
      // const checkResult = await checkUserCompany(company_idx, user_idx);
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }
      const result = await db.customer.findAll({
        where: { form_link },
        group: ['customer_phoneNumber'],
      });
      return res.send({ result });
    } catch (err) {
      next(err);
    }
  },
  showDetailConsulting: async (req, res, next) => {
    const { company_idx } = req;
    const { customer_idx } = req.params;

    try {
      let consultResult = await db.customer.findOne({
        where: {
          idx: customer_idx,
          company_idx,
        },
        include: [
          {
            model: db.consulting,
            attributes: showDetailConsultingAttributes,
            include: [
              {
                model: db.formLink,
                as: 'tempType',
                attributes: ['tempType'],
              },
            ],
          },
          {
            model: db.timeLine,
            attributes: showDetailJoinConsultingAttributes,
          },
          {
            model: db.user,
            attributes: ['idx', 'user_name'],
          },
        ],
        attributes: showDetailMainConsultingAttributes,
        order: [[db.consulting, 'createdAt', 'DESC']],
      });

      //  고객이 없을 때
      if (!consultResult) {
        return next({ message: '고객이 없습니다' });
      }

      // forEach를 위해 JSON형태로 변경
      consultResult = consultResult.toJSON();

      // 상담신청 젤 위로 변경
      consultResult.consultings.forEach((data) => {
        data.tempType = data.tempType.tempType;

        if (data.floor_plan || data.hope_concept) {
          data.floor_plan = JSON.parse(data.floor_plan);
          data.hope_concept = JSON.parse(data.hope_concept);
        }
        consultResult.consultingTimeLines.unshift(data);
      });
      // 변경 후 필드 삭제
      delete consultResult.consultings;

      return res.send({ success: 200, consultResult });
    } catch (err) {
      next(err);
    }
  },
  showCompanyMembers: async (req, res, next) => {
    const { user_idx, company_idx } = req;

    // userId, 프로필사진, 이름
    try {
      // const checkResult = await checkUserCompany(company_idx, user_idx);
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }

      const findAllUser = await db.userCompany.findAll({
        where: { company_idx },
        include: [
          {
            model: db.user,
            attributes: ['user_name', 'user_profile'],
          },
        ],
        attributes: [['user_idx', 'userId']],
        raw: true,
        nest: true,
      });

      // 로그인 한 사람 고정
      for (let i = 0; i < findAllUser.length; i++) {
        if (findAllUser[i].userId == user_idx) {
          findAllUser.unshift(findAllUser[i]);
          findAllUser.splice(i + 1, 1);
          break;
        }
      }
      findAllUser.unshift({
        userId: null,
        user: { user_name: '담당자 없음', user_profile: '' },
      });

      return res.send({ success: 200, findAllUser });
    } catch (err) {
      next(err);
    }
  },
  showCalculate: async (req, res, next) => {
    const {
      params: { customer_idx },
      user_idx,
      company_idx,
    } = req;
    try {
      // const checkResult = await checkUserCompany(company_idx, user_idx);
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }
      const result = await db.calculate.findAll({ where: { customer_idx } });

      return res.send({ success: 200, result });
    } catch (err) {
      next(err);
    }
  },
  showIntegratedUser: async (req, res, next) => {
    const {
      body: { customer_phoneNumber },
      company_idx,
    } = req;
    try {
      // const checkResult = await checkUserCompany(company_idx, user_idx);
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }
      const result = await db.customer.findAll({
        where: { customer_phoneNumber, company_idx },
        attributes: showIntegratedUserAttributes,
      });
      return res.send({ result });
    } catch (err) {
      next(err);
    }
  },
  showFilterResult: async (req, res, next) => {
    let {
      query: { date, limit, page },
      company_idx,
    } = req;
    // const checkResult = await checkUserCompany(company_idx, user_idx);
    // if (checkResult == false) {
    //   return res.send({ success: 400 });
    // }
    // 주어진 조건으로 데이터를 찾기
    const findData = async (
      type,
      offset,
      limit,
      statusArrResult,
      possibilityArrResult,
      firstDate,
      secondDate
    ) => {
      try {
        const result = await db.customer[type]({
          where: {
            company_idx,
            createdAt: { [Op.between]: [firstDate, secondDate] },
            status: { [Op.in]: statusArrResult },
            contract_possibility: { [Op.in]: possibilityArrResult },
          },
          offset,
          limit,
          order: [['createdAt', 'DESC']],
        });
        return result;
      } catch (err) {
        console.log(err);
        const Err = err.message;

        await db.err.create({ err: Err });
      }
    };
    // 페이징을 위한 int처리
    limit = parseInt(limit);
    // 가져올 시작페이지 설정
    const start = (page - 1) * limit;
    try {
      // 날짜변환
      const { firstDate, secondDate } = changeDate(date);
      // 주어진 데이터를 Arr형태로 변경
      const statusArrResult = req.query.status
        ? req.query.status.split(',')
        : [0, 1, 2];
      const possibilityArrResult = req.query.contract_possibility
        ? req.query.contract_possibility.split(',')
        : [0, 1, 2];
      // 총 페이지 수 체크
      const totalPage = await findData(
        'count',
        null,
        null,
        statusArrResult,
        possibilityArrResult,
        firstDate,
        secondDate
      );

      // 요구 만큼 데이터 가져오기
      const result = await findData(
        'findAll',
        start,
        limit,
        statusArrResult,
        possibilityArrResult,
        firstDate,
        secondDate
      );

      return res.send({ result, totalPage: Math.ceil(totalPage / limit) });
    } catch (err) {
      next(err);
    }
  },
};
