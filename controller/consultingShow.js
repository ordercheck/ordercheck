const {
  checkPage,
  addUserId,
  getDetailCustomerInfo,
} = require('../lib/apiFunctions');

const db = require('../model/db');

const {
  showIntegratedUserAttributes,
  customerAttributes,
  showCalculateAttributes,
} = require('../lib/attributes');

module.exports = {
  showTotalConsultingDefault: async (req, res, next) => {
    let {
      params: { limit, page },
      query: { No, Name, Address, Date },
      company_idx,
    } = req;

    const totalData = await db.customer.count({
      where: { company_idx, deleted: null },
    });
    const { start, intlimit, intPage } = await checkPage(
      limit,
      page,
      company_idx
    );
    const getCustomerData = async (sortField, sort, No, addminus) => {
      let customerFindAndCount = await db.customer.findAndCountAll({
        where: { company_idx, deleted: null },
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
        raw: true,
        nest: true,
      });

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
          return next({ message: '고객이 없습니다.' });
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
          return next({ message: '고객이 없습니다.' });
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
          return next({ message: '고객이 없습니다.' });
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
          return next({ message: '고객이 없습니다.' });
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
          return next({ message: '고객이 없습니다.' });
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
    } = req;
    try {
      const result = await db.customer.findAll({
        where: { form_link, deleted: null },
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
      const consultResult = await getDetailCustomerInfo(
        {
          idx: customer_idx,
          company_idx,
        },
        next
      );
      if (!consultResult) {
        return;
      }

      return res.send({ success: 200, consultResult });
    } catch (err) {
      next(err);
    }
  },
  showCompanyMembers: async (req, res, next) => {
    const { user_idx, company_idx } = req;

    try {
      const findAllUser = await db.userCompany.findAll({
        where: { company_idx },
        include: [
          {
            model: db.user,
            attributes: ['user_name', 'user_profile'],
          },
        ],
        attributes: [['user_idx', 'userId']],
        order: [['searchingName', 'ASC']],
        raw: true,
        nest: true,
      });

      // 로그인 한 사람 고정
      for (let i = 0; i < findAllUser.length; i++) {
        findAllUser[i].user_name = findAllUser[i].user.user_name;
        findAllUser[i].user_profile = findAllUser[i].user.user_profile;
        delete findAllUser[i].user;
        if (findAllUser[i].userId == user_idx) {
          findAllUser.unshift(findAllUser[i]);
          findAllUser.splice(i + 1, 1);
        }
      }
      findAllUser.unshift({
        userId: null,
        user_name: '담당자 없음',
        user_profile: '',
      });

      return res.send({ success: 200, findAllUser });
    } catch (err) {
      next(err);
    }
  },
  showCalculate: async (req, res, next) => {
    const {
      params: { customer_idx },
    } = req;
    try {
      let findResult = await db.calculate.findAll({
        where: { customer_idx },
        order: [['createdAt', 'DESC']],
        attributes: showCalculateAttributes,
      });

      findResult = JSON.parse(JSON.stringify(findResult));

      return res.send({ success: 200, findResult });
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
      const result = await db.customer.findAll({
        where: { customer_phoneNumber, company_idx, deleted: null },
        attributes: showIntegratedUserAttributes,
      });
      return res.send({ result });
    } catch (err) {
      next(err);
    }
  },
};
