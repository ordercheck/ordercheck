module.exports = function (sequelize, DataTypes) {
  //테이블을 정의

  // 이메일 0, 알림톡,1, 둘다x 3, 둘다ㅇ 4

  return sequelize.define('userConfig', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },

    calculateReload: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    productServiceAlarm: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    promotionAlarm: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    customerStatusAlarm: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    addConsultingAlarm: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
  });
};
