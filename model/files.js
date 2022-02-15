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
      type: DataTypes.TEXT(),
    },
    title: {
      allowNull: true,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    isFolder: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
  });
};
