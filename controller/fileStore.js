const db = require('../model/db');

const _f = require('../lib/functions');
module.exports = {
  getUserList: async (req, res) => {
    const findAllCustomers = await db.customer.findAll({
      where: { company_idx: req.company_idx },
      attributes: [['idx', 'customer_idx'], 'customer_name'],
    });

    return res.send({ success: 200, findAllCustomers });
  },
};
