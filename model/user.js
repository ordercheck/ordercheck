module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('user', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    personal_code: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },

    user_phone: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },

    user_email: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    user_name: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    user_password: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(250),
    },
    /*
            0 - email
          */
    regist_type: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER(4),
    },

    last_login: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },

    active: {
      allowNull: false,
      defaultValue: 1,
      type: DataTypes.INTEGER(4),
    },
  });
};
