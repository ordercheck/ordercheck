const db = require('../model/db');
const { getDetailCustomerInfo } = require('../lib/apiFunctions');
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

    detail_address,
    address,
    customer_phoneNumber,
    customer_name,
    memo,
    status,
    next
  ) => {
    const upadateData = async (updateData) => {
      try {
        await db.customer.update(updateData, { where: { idx: customer_idx } });
      } catch (err) {
        next(err);
      }
    };

    if (memo || status) {
      try {
        await upadateData({ status });
        await db.timeLine.create({ memo, status, customer_idx });
      } catch (err) {
        next(err);
      }
    }

    if (customer_name !== undefined) {
      try {
        await upadateData({ customer_name });
      } catch (err) {
        next(err);
      }
    }

    if (customer_phoneNumber !== undefined) {
      try {
        await upadateData({ customer_phoneNumber });
      } catch (err) {
        next(err);
      }
    }

    if (address !== undefined) {
      try {
        await upadateData({ address });
      } catch (err) {
        next(err);
      }
    }
    if (detail_address !== undefined) {
      try {
        await upadateData({ detail_address });
      } catch (err) {
        next(err);
      }
    }

    if (room_size !== undefined) {
      try {
        await upadateData({ room_size });
      } catch (err) {
        next(err);
      }
    }

    if (room_size_kind !== undefined) {
      try {
        await upadateData({ room_size_kind });
      } catch (err) {
        next(err);
      }
    }

    if (contract_possibility !== undefined) {
      try {
        await upadateData({ contract_possibility });
      } catch (err) {
        next(err);
      }
    }

    const consultResult = await getDetailCustomerInfo(
      {
        idx: customer_idx,
      },
      next
    );
    if (!consultResult) {
      return;
    }
    return consultResult;
  },
  fileStoreSort: (sort_field, sort) => {
    if (sort_field == 0) {
      sort_field = 'title';
    }
    if (sort_field == 1) {
      sort_field = 'createdAt';
    }
    if (sort == 0) {
      sort = 'ASC';
    }
    if (sort == 1) {
      sort = 'DESC';
    }

    return { sort_field, sort };
  },
};
