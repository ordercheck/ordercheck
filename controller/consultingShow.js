const { checkUserCompany } = require('../lib/apiFunctions');
const db = require('../model/db');
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
      const totalData = await db.consulting.count();
      const start = (page - 1) * limit;
      const result = await db.consulting.findAll({
        offset: start,
        limit,
        where: { company_idx },
        attributes: [
          'idx',
          'choice',
          'address',
          'building_type',
          'size',
          'elv',
          'hope_Date',
          'predicted_living',
          'budget',
          'customer_name',
          'customer_phoneNumber',
          'active',
        ],
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
      const result = await db.consulting.findOne({
        where: {
          idx,
        },
        attributes: [
          'idx',
          'choice',
          'address',
          'detail_address',
          'building_type',
          'size',
          'elv',
          'hope_Date',
          'predicted_living',
          'budget',
          'customer_name',
          'customer_phoneNumber',
          'active',
          'contract_possibility',
          'createdAt',
        ],
        include: [
          {
            model: db.timeLine,
            attributes: ['status', 'memo'],
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
  showDetailTimeLine: (req, res) => {
    return res.send({ success: 200 });
  },
};
