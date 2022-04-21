module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define("folders", {
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
    upload_people: {
      allowNull: true,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },
    title: {
      allowNull: true,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },
    path: {
      allowNull: true,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },
    root: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    searchingTitle: {
      allowNull: true,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },
    upperFolder: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },

    duplicateCount: {
      defaultValue: 1,
      type: DataTypes.INTEGER,
    },

    deleted: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
  });
};
