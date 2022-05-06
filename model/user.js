module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define("user", {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },

    personal_code: {
      allowNull: false,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },

    user_profile: {
      allowNull: false,
      defaultValue: "",
      type: DataTypes.TEXT(),
    },

    user_phone: {
      allowNull: false,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },

    user_email: {
      allowNull: false,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },
    user_name: {
      allowNull: false,
      defaultValue: "",
      type: DataTypes.STRING(100),
    },

    user_password: {
      allowNull: false,
      defaultValue: "",
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

    stopped: {
      allowNull: true,
      type: DataTypes.DATE(),
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

    last_login: {
      allowNull: true,
      type: DataTypes.DATE(),
    },

    login_access: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },

    regist_region: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },

    calculateReload: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    emailProductServiceAlarm: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    emailPromotionAlarm: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    emailCustomerStatusAlarm: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    emailAddConsultingAlarm: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },

    kakaoProductServiceAlarm: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    kakaoPromotionAlarm: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    kakaoCustomerStatusAlarm: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    kakaoAddConsultingAlarm: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },

    tutorialReload: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },

    deleted: {
      allowNull: true,
      type: DataTypes.DATE(),
    },
  });
};
