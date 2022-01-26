module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('userCompany', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
  });
};
