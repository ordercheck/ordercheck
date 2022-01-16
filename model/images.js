module.exports = function (sequelize, DataTypes) {
  //테이블을 정의

  return sequelize.define('images', {
    idx: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    cidx: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    uidx: {
      type: DataTypes.INTEGER(11),
      defaultValue: 0,
      allowNull: true,
    },
    tidx: {
      type: DataTypes.INTEGER(11),
      defaultValue: 0,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(250),
      defaultValue: '',
      allowNull: true,
    },
    /*
         0 - 일반
      */
    type: {
      type: DataTypes.INTEGER(4),
      defaultValue: 0,
      allowNull: true,
    },
  });
};
