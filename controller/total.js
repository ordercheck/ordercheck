const db = require("../model/db");
const { Op } = require("sequelize");
const {
  makePureText,
  searchFileandFolder,
  searchingByTitle,
} = require("../lib/apiFunctions");
const { customerAttributes } = require("../lib/attributes");
module.exports = {
  totalSearch: async (req, res, next) => {
    const {
      company_idx,
      query: { search },
    } = req;

    try {
      const pureText = search.replace(/[. ]/g, "").replace(/%/g, "1010");

      // customer search
      let searchCustomer = await db.customer.findAll({
        where: {
          deleted: null,
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
            attributes: ["idx", "user_name"],
          },
        ],
        attributes: customerAttributes,
      });
      // fileStore search

      const searchFileStore = await searchFileandFolder(req, pureText);

      const searchForm = await searchingByTitle(pureText, company_idx);
      return res.send({
        success: 200,
        searchCustomer,
        searchFileStore,
        searchForm,
      });
    } catch (err) {
      next(err);
    }
  },
};
