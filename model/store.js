module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define("store", {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    bread: {
      allowNull: false,
      type: DataTypes.STRING,
    },

    link: {
      allowNull: true,
      type: DataTypes.STRING,
    },
  });
};
