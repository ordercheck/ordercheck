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

    user_profile: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.TEXT(),
    },

    user_phone: {
      allowNull: false,
      unique: true,
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

    deleted: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },

    use_agree: {
      allowNull: true,
      type: DataTypes.BOOLEAN,
    },
    private_agree: {
      allowNull: true,
      type: DataTypes.BOOLEAN,
    },
    marketing_agree: {
      allowNull: true,
      type: DataTypes.BOOLEAN,
    },
  });
};
