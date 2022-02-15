module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('kakaoPush', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    templateCode: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    subject: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(250),
    },
    receiver: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    template: {
      allowNull: false,
      type: DataTypes.TEXT(),
    },
    active: {
      allowNull: false,
      defaultValue: 0,
      type: DataTypes.INTEGER,
    },
    link: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(250),
    },
    linkTitle: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(250),
    },
    linkType: {
      allowNull: false,
      defaultValue: 'WL',
      type: DataTypes.STRING(250),
    },
  });
};
