const db = require('../model/db');
const axios = require('axios');
const _f = require('../lib/functions');
const { makePureText, searchFileandFolder } = require('../lib/apiFunctions');
const { customerAttributes } = require('../lib/attributes');
module.exports = {
  totalSearch: async (req, res, next) => {
    const {
      company_idx,
      query: { search },
    } = req;

    const pureText = makePureText(search);

    // customer search
    let searchCustomer = await db.customer.findAll({
      where: {
        company_idx,
        [Op.or]: {
          customer_name: {
            [Op.like]: `%${pureText}%`,
          },
          searchingPhoneNumber: {
            [Op.like]: `%${pureText}%`,
          },
          searchingAddress: {
            [Op.like]: `%${pureText}%`,
          },
        },
      },
      include: [
        {
          model: db.user,
          attributes: ['idx', 'user_name'],
        },
      ],
      attributes: customerAttributes,
    });
    // fileStore search

    const searchFileStore = await searchFileandFolder(req, pureText);
  },
};
