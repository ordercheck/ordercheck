module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('consulting', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    choice: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },

    customer_email: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    application_route: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },

    building_type: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },

    rooms_count: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    bathrooms_count: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },
    completion_year: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    floor_plan: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.TEXT(),
    },
    hope_Date: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    predicted_living: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    budget: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },

    destruction: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },

    expand: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    window: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    carpentry: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    paint: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    papering: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    bathroom: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },

    bathroom_option: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    floor: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    tile: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },

    electricity_lighting: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },

    kitchen: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    kitchen_option: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },

    furniture: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },

    facility: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    film: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    art_wall: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    elv: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    etc: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    hope_concept: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.TEXT(),
    },

    contact_time: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    etc_question: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
    form_link: {
      allowNull: false,
      defaultValue: '',
      type: DataTypes.STRING(100),
    },
  });
};
