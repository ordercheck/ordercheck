class ETC {

  createCustomerData = (address, phoneNumeber) => {
    this.bodyData.searchingAddress = address;
    this.bodyData.searchingPhoneNumber = phoneNumeber;
    return this.bodyData;
  }

  fileStoreData = (
    customer_phoneNumber,
    customer_name,
    idx,
    searchingPhoneNumber
  ) => {
    this.bodyData.customer_phoneNumber = customer_phoneNumber;
    this.bodyData.customer_name = customer_name;
    this.bodyData.customer_idx = idx;
    this.bodyData.searchingPhoneNumber = searchingPhoneNumber;
    return this.bodyData;
  }
}

module.exports = { ETC };
