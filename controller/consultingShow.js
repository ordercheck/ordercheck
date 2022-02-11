const { checkUserCompany, errorFunction } = require('../lib/apiFunctions');
const { changeDate } = require('../lib/apiFunctions');
const db = require('../model/db');
const { Op } = require('sequelize');
module.exports = {
  showTotalConsultingDefault: async (req, res, next) => {
    let {
      params: { limit, page },
      query: { No, Name, Address, Date },
      company_idx,
    } = req;

    limit = parseInt(limit);
    page = parseInt(page);

    const totalData = await db.customer.count({ where: { company_idx } });
    const start = (page - 1) * limit;

    const getCustomerData = async (sortField, sort, NoNumber, addminus) => {
      let customerData = await db.customer.findAll({
        where: { company_idx },
        attributes: [
          ['idx', 'userId'],
          'customer_name',
          'customer_phoneNumber',
          'address',
          'detail_address',
          'active',
          'contract_possibility',
          'contact_person',
          [
            db.sequelize.fn(
              'date_format',
              db.sequelize.col('createdAt'),
              '%Y.%m.%d'
            ),
            'createdAt',
          ],
        ],
        order: [[sortField, sort]],
        offset: start,
        limit,
        raw: true,
      });

      // userId, fullAddress 추가
      let No = NoNumber;

      customerData = customerData.map((data) => {
        data.No = No;
        addminus == 'plus' ? No++ : No--;

        data.customer_phoneNumber = data.customer_phoneNumber.replace(
          /-/g,
          '.'
        );
        data.fullAddress = `${data.address} ${data.detail_address}`;
        return data;
      });
      return customerData;
    };

    try {
      let customerData = '';
      let customerNumber = page * limit - (limit - 1);
      if (!No && !Name && !Address && !Date) {
        customerData = await getCustomerData(
          'createdAt',
          'DESC',
          customerNumber,
          'plus'
        );

        if (customerData.length == 0) {
          return res.send({ success: 400, message: '고객이 없습니다.' });
        }
      }

      // 0이 오름차순,1이 내림차순 (ASC는 오름차순)
      if (No) {
        if (No == 0) {
          customerNumber = await db.customer.count({
            where: { company_idx },
          });
        }

        customerData = await getCustomerData(
          'createdAt',
          No == 0 ? 'ASC' : 'DESC',
          No == 0 ? customerNumber - limit * page + limit : customerNumber,
          No == 0 ? 'minus' : 'plus'
        );

        if (customerData.length == 0) {
          return res.send({ success: 400, message: '고객이 없습니다.' });
        }
      }
      if (Name) {
        if (Name == 0) {
          customerNumber = await db.customer.count({
            where: { company_idx },
          });
        }
        customerData = await getCustomerData(
          'customer_name',
          Name == 0 ? 'ASC' : 'DESC',
          Name == 0 ? customerNumber - limit * page + limit : customerNumber,
          Name == 0 ? 'minus' : 'plus'
        );
        if (customerData.length == 0) {
          return res.send({ success: 400, message: '고객이 없습니다.' });
        }
      }

      if (Address) {
        if (Address == 0) {
          customerNumber = await db.customer.count({
            where: { company_idx },
          });
        }
        customerData = await getCustomerData(
          'searchingAddress',
          Address == 0 ? 'ASC' : 'DESC',
          Address == 0 ? customerNumber - limit * page + limit : customerNumber,
          Address == 0 ? 'minus' : 'plus'
        );
        if (customerData.length == 0) {
          return res.send({ success: 400, message: '고객이 없습니다.' });
        }
      }

      if (Date) {
        if (Date == 0) {
          customerNumber = await db.customer.count({
            where: { company_idx },
          });
        }
        customerData = await getCustomerData(
          'updatedAt',
          Date == 0 ? 'ASC' : 'DESC',
          Date == 0 ? customerNumber - limit * page + limit : customerNumber,
          Date == 0 ? 'minus' : 'plus'
        );
        if (customerData.length == 0) {
          return res.send({ success: 400, message: '고객이 없습니다.' });
        }
      }

      return res.send({
        success: 200,
        customerData,
        totalUser: totalData,
        page,
        totalPage: Math.ceil(totalData / limit),
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

            attributes: [
              'choice',
              'customer_email',
              'application_route',
              'building_type',
              'rooms_count',
              'bathrooms_count',
              'completion_year',
              'floor_plan',
              'hope_Date',
              'predicted_living',
              'budget',
              'destruction',
              'expand',
              'window',
              'carpentry',
              'paint',
              'papering',
              'bathroom',
              'bathroom_option',
              'floor',
              'tile',
              'electricity_lighting',
              'kitchen',
              'kitchen_option',
              'furniture',
              'facility',
              'film',
              'art_wall',
              'elv',
              'etc',
              'hope_concept',
              'contact_time',
              'etc_question',

              [
                db.sequelize.fn(
                  'date_format',
                  db.sequelize.col('consultings.createdAt'),
                  '%Y.%m.%d'
                ),
                'createdAt',
              ],
            ],
          },
          {
            model: db.timeLine,
            attributes: [
              'status',
              'memo',

              [
                db.sequelize.fn(
                  'date_format',
                  db.sequelize.col('consultingTimeLines.createdAt'),
                  '%Y.%m.%d'
                ),
                'createdAt',
              ],
            ],
          },
        ],
        attributes: [
          'idx',
          'customer_name',
          'customer_phoneNumber',
          'address',
          'detail_address',
          'room_size',
          'room_size_kind',
          'contract_possibility',
          'contact_person',
          [
            db.sequelize.fn(
              'date_format',
              db.sequelize.col('customer.createdAt'),
              '%Y.%m.%d'
            ),
            'createdAt',
          ],
        ],
        order: [[db.consulting, 'createdAt', 'DESC']],
      });

      consultResult = JSON.stringify(consultResult, (k, v) =>
        v === null ? undefined : v
      );
      consultResult = JSON.parse(consultResult);
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
            attributes: ['user_name', 'user_name', 'user_profile'],
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
      activeArrResult,
      possibilityArrResult,
      firstDate,
      secondDate
    ) => {
      try {
        const result = await db.customer[type]({
          where: {
            company_idx,
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
      const activeArrResult = req.query.active
        ? req.query.active.split(',')
        : [0, 1, 2];
      const possibilityArrResult = req.query.contract_possibility
        ? req.query.contract_possibility.split(',')
        : [0, 1, 2];
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
      next(err);
    }
  },
};
