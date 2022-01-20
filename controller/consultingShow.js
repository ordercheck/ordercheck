const { checkUserCompany } = require('../lib/apiFunctions');
const { changeDate } = require('../lib/apiFunctions');
const db = require('../model/db');
const { Op } = require('sequelize');
module.exports = {
  showTotalConsultingDefault: async (req, res) => {
    let {
      params: { form_link, limit, page },
      loginUser: user_idx,
    } = req;
    limit = parseInt(limit);

    try {
      // const checkResult = await checkUserCompany(company_idx, user_idx);
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }
      const totalData = await db.customer.count({ where: { form_link } });
      const start = (page - 1) * limit;
      const result = await db.customer.findAll({
        where: { form_link },
        offset: start,
        limit,
      });

      if (result.length == 0) {
        return res.send({ success: 400 });
      }
      return res.send({
        success: 200,
        result,
        totalPage: Math.ceil(totalData / limit),
      });
    } catch (err) {
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },

  showCustomers: async (req, res) => {
    const {
      params: { form_link },
      loginUser: user_idx,
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
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
  showDetailConsulting: async (req, res) => {
    const { idx } = req.params;
    try {
      const result = await db.customer.findAll({
        where: {
          idx,
        },
        include: [
          {
            model: db.consulting,
            include: [
              {
                model: db.timeLine,
              },
            ],
          },
        ],
      });

      return res.send({ result });
    } catch (err) {
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
  showCompanyMembers: async (req, res) => {
    const {
      params: { company_idx },
      loginUser: user_idx,
    } = req;
    try {
      // const checkResult = await checkUserCompany(company_idx, user_idx);
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }

      const findAllUser = await db.userCompany.findAll({
        where: { company_idx },
        attributes: ['user_idx'],
      });

      return res.send({ success: 200, findAllUser });
    } catch (err) {
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
  showCalculate: async (req, res) => {
    const {
      params: { company_idx, consulting_idx },
      loginUser: user_idx,
    } = req;
    try {
      // const checkResult = await checkUserCompany(company_idx, user_idx);
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }
      const result = await db.consulting.findByPk(consulting_idx, {
        include: [
          {
            model: db.calculate,
          },
        ],
      });
      return res.send({ success: 200, result });
    } catch (err) {
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
  showIntegratedUser: async (req, res) => {
    const {
      body: { customer_phoneNumber },
      loginUser: user_idx,
    } = req;
    try {
      // const checkResult = await checkUserCompany(company_idx, user_idx);
      // if (checkResult == false) {
      //   return res.send({ success: 400 });
      // }
      const result = await db.customer.findAll({
        where: { customer_phoneNumber },
        attributes: [
          'idx',
          'customer_name',
          'customer_phoneNumber',
          'createdAt',
          'address',
          'detail_address',
        ],
      });
      return res.send({ result });
    } catch (err) {
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
  showFilterResult: async (req, res) => {
    let {
      query: { form_link, date, limit, page },
      loginUser: user_idx,
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
      activeArrResult,
      possibilityArrResult,
      firstDate,
      secondDate
    ) => {
      try {
        const result = await db.customer[type]({
          where: {
            form_link,
            createdAt: { [Op.between]: [firstDate, secondDate] },
            active: { [Op.in]: activeArrResult },
            contract_possibility: { [Op.in]: possibilityArrResult },
          },
          offset,
          limit,
          order: [['createdAt', 'DESC']],
        });
        return result;
      } catch (err) {
        console.log(err);
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
      const activeArrResult = req.query.active
        ? req.query.active.split(',')
        : ['상담 신청', '상담완료', '이슈'];
      const possibilityArrResult = req.query.contract_possibility
        ? req.query.contract_possibility.split(',')
        : ['없음', '50%이상', '50%미만'];
      // 총 페이지 수 체크
      const totalPage = await findData(
        'count',
        null,
        null,
        activeArrResult,
        possibilityArrResult,
        firstDate,
        secondDate
      );

      // 요구 만큼 데이터 가져오기
      const result = await findData(
        'findAll',
        start,
        limit,
        activeArrResult,
        possibilityArrResult,
        firstDate,
        secondDate
      );

      return res.send({ result, totalPage: Math.ceil(totalPage / limit) });
    } catch (err) {
      const Err = err.message;
      return res.send({ success: 500, Err });
    }
  },
};
