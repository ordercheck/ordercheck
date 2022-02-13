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
};
