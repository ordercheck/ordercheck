module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define("planInfo", {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    plan: {
      allowNull: false,
      type: DataTypes.STRING(15),
    },

    monthPrice: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    yearPrice: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },

    monthWhiteLabelPrice: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    yearWhiteLabelPrice: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },

    monthAnalyticsPrice: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    yearAnalyticsPrice: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    monthChatPrice: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    yearChatPrice: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    isCreateCompany: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
    isManageMember: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
    isInviteMember: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
    isFileStorage: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
    isAutoChargeMessage: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
    },
    maxConsultingForm: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    maxConsultingForm: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    maxAddCustomer: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    maxFormCount: {
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    maxFileStorageSize: {
      allowNull: false,
      type: DataTypes.BIGINT,
    },
  });
};
