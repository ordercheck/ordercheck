module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define("alarm", {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    message: {
      allowNull: false,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },

    alarm_type: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },

    confirm: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },

    repeat_time: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },

    expiry_date: {
      type: DataTypes.DATE(),
    },

    path: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
  });
};
