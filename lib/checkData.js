const db = require('../model/db');
module.exports = {
  sortElements: (No, Name, Address, Date) => {
    let sortField;
    let sort;
    let addminus;

    if (!No && !Name && !Address && !Date) {
      (sortField = 'createdAt'), (sort = 'DESC'), (addminus = 'plus');
    }
    if (No == 0) {
      (sortField = 'createdAt'), (sort = 'ASC');
    }
    if (No == 1) {
      (sortField = 'createdAt'), (sort = 'DESC'), (addminus = 'plus');
    }

    if (Name == 0) {
      (sortField = 'customer_name'), (sort = 'ASC');
    }

    if (Name == 1) {
      (sortField = 'customer_name'), (sort = 'DESC'), (addminus = 'plus');
    }

    if (Address == 0) {
      (sortField = 'searchingAddress'), (sort = 'ASC');
    }
    if (Address == 1) {
      (sortField = 'searchingAddress'), (sort = 'DESC'), (addminus = 'plus');
    }
    if (Date == 0) {
      (sortField = 'createdAt'), (sort = 'ASC');
    }

    if (Date == 1) {
      (sortField = 'createdAt'), (sort = 'DESC'), (addminus = 'plus');
    }
    return { sortField, sort, addminus };
  },

  giveNumbering: (
    countCustomersResultData,
    intPage,
    intlimit,
    No,
    Name,
    Address,
    Date
  ) => {
    let customerNumber = intPage * intlimit - (intlimit - 1);

    if (No == 0) {
      customerNumber = countCustomersResultData - intlimit * intPage + intlimit;
    }

    if (Name == 0) {
      customerNumber = countCustomersResultData - intlimit * intPage + intlimit;
    }

    if (Address == 0) {
      customerNumber = countCustomersResultData - intlimit * intPage + intlimit;
    }

    if (Date == 0) {
      customerNumber = countCustomersResultData - intlimit * intPage + intlimit;
    }
    return { customerNumber };
  },
  checkDetailCustomerUpdateField: async (
    customer_idx,
    room_size_kind,
    room_size,
    contract_possibility,
    contact_person,
    detail_address,
    address,
    customer_phoneNumber,
    customer_name,
    memo,
    status,
    next
  ) => {
    const t = await db.sequelize.transaction();
    const upadateData = async (updateData) => {
      try {
        await db.customer.update(
          updateData,
          { where: { idx: customer_idx } },
          { transaction: t }
        );
      } catch (err) {
        next(err);
      }
    };

    if (memo || status) {
      try {
        upadateData({ status });
        await db.timeLine.create({ memo, status, customer_idx });
        await t.commit();
        return;
      } catch (err) {
        await t.rollback();
        next(err);
      }
    }

    if (customer_name) {
      try {
        upadateData({ customer_name });
        await t.commit();
        return;
      } catch (err) {
        await t.rollback();
        next(err);
      }
    }

    if (customer_phoneNumber) {
      try {
        upadateData({ customer_phoneNumber });
        await t.commit();
        return;
      } catch (err) {
        await t.rollback();
        next(err);
      }
    }

    if (address) {
      try {
        upadateData({ address });
        await t.commit();
        return;
      } catch (err) {
        await t.rollback();
        next(err);
      }
    }
    if (detail_address) {
      try {
        upadateData({ detail_address });
        await t.commit();
        return;
      } catch (err) {
        await t.rollback();
        next(err);
      }
    }

    if (room_size) {
      try {
        upadateData({ room_size });
        await t.commit();
        return;
      } catch (err) {
        await t.rollback();
        next(err);
      }
    }
    if (room_size_kind) {
      try {
        upadateData({ room_size_kind });
        await t.commit();
        return;
      } catch (err) {
        await t.rollback();
        next(err);
      }
    }

    if (contract_possibility) {
      try {
        upadateData({ room_size_kind });
        await t.commit();
        return;
      } catch (err) {
        await t.rollback();
        next(err);
      }
    }

    if (contact_person) {
      try {
        upadateData({ room_size_kind });
        await t.commit();
        return;
      } catch (err) {
        await t.rollback();
        next(err);
      }
    }
  },
};
