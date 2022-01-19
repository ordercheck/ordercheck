const { checkUserCompany } = require('../lib/apiFunctions');
const db = require('../model/db');
const { Op } = require('sequelize');
module.exports = {
  showTotalConsultingDefault: async (req, res) => {
    let {
      params: { company_idx, limit, page },
      loginUser: user_idx,
    } = req;
    limit = parseInt(limit);
    try {
      const checkResult = await checkUserCompany(company_idx, user_idx);
      if (checkResult == false) {
        return res.send({ success: 400 });
      }
      const totalData = await db.customer.count();
      const start = (page - 1) * limit;
      const result = await db.customer.findAll({
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

  showCompanyCustomers: async (req, res) => {
    const {
      params: { company_idx },
      loginUser: user_idx,
    } = req;
    try {
      // 유저회사 정보를 체크
      const checkResult = await checkUserCompany(company_idx, user_idx);
      if (checkResult == false) {
        return res.send({ success: 400 });
      }
      const result = await db.consulting.findAll({
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
      const checkResult = await checkUserCompany(company_idx, user_idx);
      if (checkResult == false) {
        return res.send({ success: 400 });
      }

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
      const checkResult = await checkUserCompany(company_idx, user_idx);
      if (checkResult == false) {
        return res.send({ success: 400 });
      }
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
      body: { company_idx, customer_phoneNumber },
      loginUser: user_idx,
    } = req;
    try {
      const checkResult = await checkUserCompany(company_idx, user_idx);
      if (checkResult == false) {
        return res.send({ success: 400 });
      }
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
    const { company_idx } = req.query;
    try {
      const makeArrforFilter = (data, status) => {
        try {
          let countArr = data.split(',');
          countArr = countArr.map((el) => {
            el = { [status]: el };
            return el;
          });
          return countArr;
        } catch (err) {
          return;
        }
      };
      const activeArrResult = makeArrforFilter(
        req.query.active,
        (status = 'active')
      );

      const possibilityArrResult = makeArrforFilter(
        req.query.contract_possibility,
        (status = 'contract_possibility')
      );
      console.log(activeArrResult);
      console.log(possibilityArrResult);
      const totalArr = activeArrResult.concat(possibilityArrResult);

      const result = await db.customer.findAll({
        where: {
          company_idx,
          [Op.or]: totalArr,
        },
        order: [['createdAt', 'DESC']],
      });
      return res.send({ result });
    } catch (err) {
      console.log('bye');
    }
  },
};
