module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define("userCompany", {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    active: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    standBy: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },

    searchingName: {
      allowNull: false,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },
  });
};
