module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('folders', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },

    folder_name: {
      allowNull: true,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
  });
};
