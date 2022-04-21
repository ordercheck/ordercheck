module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define("files", {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    uuid: {
      allowNull: true,
      defaultValue: "",
      unique: true,
      type: DataTypes.STRING(100),
    },
    file_url: {
      allowNull: true,
      type: DataTypes.TEXT(),
    },
    title: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    isFolder: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    upload_people: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    file_size: {
      allowNull: true,
      type: DataTypes.DOUBLE,
    },
    path: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    searchingTitle: {
      allowNull: true,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },

    deleted: {
      paranoid: true,
      allowNull: false,
      defaultValue: false,
      type: DataTypes.DOUBLE,
    },
  });
};
