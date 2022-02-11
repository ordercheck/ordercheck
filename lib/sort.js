module.exports = {
  sortElements: (
    No,
    Name,
    Address,
    Date,
    intPage,
    intlimit,
    countCustomersResultData
  ) => {
    let customerNumber = intPage * intlimit - (intlimit - 1);
    let sortField;
    let sort;
    let addminus;

    if (!No && !Name && !Address && !Date) {
      (sortField = 'createdAt'), (sort = 'DESC'), (addminus = 'plus');
    }
    if (No == 0) {
      (sortField = 'createdAt'),
        (sort = 'ASC'),
        (customerNumber =
          countCustomersResultData - intlimit * intPage + intlimit);
      addminus = 'minus';
    }
    if (No == 1) {
      (sortField = 'createdAt'), (sort = 'DESC'), (addminus = 'plus');
    }

    if (Name == 0) {
      (sortField = 'customer_name'),
        (sort = 'ASC'),
        (customerNumber =
          countCustomersResultData - intlimit * intPage + intlimit);
      addminus = 'minus';
    }

    if (Name == 1) {
      (sortField = 'customer_name'), (sort = 'DESC'), (addminus = 'plus');
    }

    if (Address == 0) {
      (sortField = 'searchingAddress'),
        (sort = 'ASC'),
        (customerNumber =
          countCustomersResultData - intlimit * intPage + intlimit);
      addminus = 'minus';
    }
    if (Address == 1) {
      (sortField = 'searchingAddress'), (sort = 'DESC'), (addminus = 'plus');
    }
    if (Date == 0) {
      (sortField = 'createdAt'),
        (sort = 'ASC'),
        (customerNumber =
          countCustomersResultData - intlimit * intPage + intlimit);
      addminus = 'minus';
    }

    if (Date == 1) {
      (sortField = 'createdAt'), (sort = 'DESC'), (addminus = 'plus');
    }
    return { customerNumber, sortField, sort, addminus };
  },
};
