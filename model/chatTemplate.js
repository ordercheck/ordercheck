module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('chatTemplate', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    title: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    contents: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.TEXT,
    },
    edit: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },

    link_text: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    link_url: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.TEXT,
    },
  });
};
