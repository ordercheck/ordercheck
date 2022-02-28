module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('config', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    template_name: {
      allowNull: true,
      defaultValue: '팀원',
      type: DataTypes.STRING(100),
    },

    company_total: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },

    change_company_info: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },

    member_total: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },

    member_approval: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    member_del: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    member_detail_edit: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },

    member_invite_total: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },

    member_invite: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },

    auth_total: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },

    create_auth_template: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    edit_auth_template: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    del_auth_template: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },

    customer_total: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },

    add_new_customer: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    customer_info_edit: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    integrate_customer: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    customer_del: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },

    calculate_total: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    calculate_upload_share: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    calculate_down: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    calculate_del: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    file_total: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    file_upload: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    file_down: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    file_del: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    form_total: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    create_form: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    edit_form: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    del_form: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    change_auth_open: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    change_whilte_label: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },
    chat_total: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    send_message: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    create_chat_room: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    del_chat_room: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },

    set_comment_template: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    set_chat: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },

    analytics_total: {
      allowNull: false,
      defaultValue: true,
      type: DataTypes.BOOLEAN,
    },
    stat_access: {
      allowNull: false,
      defaultValue: false,
      type: DataTypes.BOOLEAN,
    },

    create_people: {
      allowNull: true,
      defaultValue: '오더체크',
      type: DataTypes.STRING(100),
    },
    update_people: { allowNull: true, type: DataTypes.STRING(100) },
  });
};
