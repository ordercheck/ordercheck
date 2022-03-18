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
      const pureText = search
        .replace(/[. ]/g, "")
        .replace(
          /[\{\}\[\]\/?,;:|\)*~`!^\-_+┼<>@\#$%&\'\"\\(\=]/gi,
          "11342342143"
        );

      console.log(pureText);
      if (pureText == "") {
        return res.send({
          success: 200,
          searchCustomer: [],
          searchFileStore: [],
          searchForm: [],
        });
      }

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
        order: [["createdAt", "DESC"]],
        attributes: customerAttributes,
      });
      // fileStore search
      let searchFileStore = await searchFileandFolder(req, pureText);
      // 배열 날짜순으로 sort
      searchFileStore = searchFileStore.sort(function date_descending(a, b) {
        var dateA = new Date(a["날짜"]).getTime();
        var dateB = new Date(b["날짜"]).getTime();
        return dateA < dateB ? 1 : -1;
      });

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
