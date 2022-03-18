module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define("card", {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    card_code: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },

    card_name: {
      allowNull: false,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },
    card_number: {
      allowNull: false,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },
    expiry: {
      allowNull: false,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },
    pwd_2digit: {
      allowNull: false,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },
    birth: {
      allowNull: false,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },
    card_email: {
      allowNull: false,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },
    business_number: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    customer_uid: {
      allowNull: true,
      unique: true,
      type: DataTypes.STRING(100),
    },
    customer_uid: {
      allowNull: true,
      unique: true,
      type: DataTypes.STRING(100),
    },

    corporation_yn: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    active: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    main: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
  });
};
