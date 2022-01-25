module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('config', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    //host uidx
    // huidx: {
    //   allowNull: true,
    //   unique: true,
    //   type: DataTypes.INTEGER,
    // },
    change_company_info: {
      allowNull: false,
      defaultValue: 'false',
      type: DataTypes.STRING(100),
    },
    member_approval: {
      allowNull: false,
      defaultValue: 'false',
      type: DataTypes.STRING(100),
    },
    member_del: {
      allowNull: false,
      defaultValue: 'false',
      type: DataTypes.STRING(100),
    },
    member_detail_edit: {
      allowNull: false,
      defaultValue: 'false',
      type: DataTypes.STRING(100),
    },
    member_invite: {
      allowNull: false,
      defaultValue: 'false',
      type: DataTypes.STRING(100),
    },
    create_auth_template: {
      allowNull: false,
      defaultValue: 'false',
      type: DataTypes.STRING(100),
    },
    edit_auth_template: {
      allowNull: false,
      defaultValue: 'false',
      type: DataTypes.STRING(100),
    },
    del_auth_template: {
      allowNull: false,
      defaultValue: 'false',
      type: DataTypes.STRING(100),
    },
    add_new_customer: {
      allowNull: false,
      defaultValue: 'true',
      type: DataTypes.STRING(100),
    },
    customer_info_edit: {
      allowNull: false,
      defaultValue: 'true',
      type: DataTypes.STRING(100),
    },
    integrate_customer: {
      allowNull: false,
      defaultValue: 'true',
      type: DataTypes.STRING(100),
    },
    customer_del: {
      allowNull: false,
      defaultValue: 'false',
      type: DataTypes.STRING(100),
    },
    calculate_upload_share: {
      allowNull: false,
      defaultValue: 'true',
      type: DataTypes.STRING(100),
    },
    calculate_down_: {
      allowNull: false,
      defaultValue: 'true',
      type: DataTypes.STRING(100),
    },
    calculate_del: {
      allowNull: false,
      defaultValue: 'false',
      type: DataTypes.STRING(100),
    },
    file_upload: {
      allowNull: false,
      defaultValue: 'true',
      type: DataTypes.STRING(100),
    },
    file_down: {
      allowNull: false,
      defaultValue: 'true',
      type: DataTypes.STRING(100),
    },
    file_del: {
      allowNull: false,
      defaultValue: 'false',
      type: DataTypes.STRING(100),
    },
    create_form: {
      allowNull: false,
      defaultValue: 'true',
      type: DataTypes.STRING(100),
    },
    edit_form: {
      allowNull: false,
      defaultValue: 'true',
      type: DataTypes.STRING(100),
    },
    del_form: {
      allowNull: false,
      defaultValue: 'false',
      type: DataTypes.STRING(100),
    },
    change_auth_open: {
      allowNull: false,
      defaultValue: 'false',
      type: DataTypes.STRING(100),
    },
    change_whilte_label: {
      allowNull: false,
      defaultValue: 'false',
      type: DataTypes.STRING(100),
    },
    send_message: {
      allowNull: false,
      defaultValue: 'true',
      type: DataTypes.STRING(100),
    },
    create_chat_room: {
      allowNull: false,
      defaultValue: 'true',
      type: DataTypes.STRING(100),
    },
    del_chat_room: {
      allowNull: false,
      defaultValue: 'false',
      type: DataTypes.STRING(100),
    },

    set_comment_template: {
      allowNull: false,
      defaultValue: 'true',
      type: DataTypes.STRING(100),
    },
    set_chat: {
      allowNull: false,
      defaultValue: 'true',
      type: DataTypes.STRING(100),
    },
    stat_access: {
      allowNull: false,
      defaultValue: 'false',
      type: DataTypes.STRING(100),
    },
    user_idx: {
      unique: true,
      type: DataTypes.INTEGER,
    },
  });
};
