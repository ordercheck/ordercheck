module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('files', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },

    file_url: {
      allowNull: true,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    file_name: {
      allowNull: true,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
  });
};
