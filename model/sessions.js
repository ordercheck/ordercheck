module.exports = function (sequelize, DataTypes) {
  //테이블을 정의

  return sequelize.define('sessions', {
    idx: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    uidx: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    user_phone: {
      type: DataTypes.STRING(100),
      defaultValue: '',
      allowNull: true,
    },
    token: {
      type: DataTypes.STRING(250),
      defaultValue: '',
      allowNull: true,
    },
  });
};
