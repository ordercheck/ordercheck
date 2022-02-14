module.exports = function (sequelize, DataTypes) {
  //테이블을 정의
  return sequelize.define('consulting', {
    idx: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },

    customer_name: { allowNull: true, type: DataTypes.STRING(100) },
    customer_phoneNumber: { allowNull: true, type: DataTypes.STRING(100) },
    address: { allowNull: true, type: DataTypes.STRING(100) },
    detail_address: { allowNull: true, type: DataTypes.STRING(100) },

    choice: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },

    room_size: {
      allowNull: true,
      type: DataTypes.INTEGER,
    },

    customer_email: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },
    application_route: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },

    building_type: {
      allowNull: true,

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
      allowNull: true,

      type: DataTypes.STRING(100),
    },
    floor_plan: {
      allowNull: true,

      type: DataTypes.TEXT(),
    },
    hope_Date: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },
    predicted_living: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },
    budget: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },

    destruction: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },

    expand: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },
    window: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },
    carpentry: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },
    paint: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },
    papering: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },
    bathroom: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },

    bathroom_option: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },
    floor: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },
    tile: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },

    electricity_lighting: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },

    kitchen: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },
    kitchen_option: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },

    furniture: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },

    facility: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },
    film: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },
    art_wall: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },
    elv: {
      allowNull: true,
      default: false,
      type: DataTypes.BOOLEAN,
    },
    etc: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    hope_concept: {
      allowNull: true,

      type: DataTypes.TEXT(),
    },

    contact_time: {
      allowNull: true,

      type: DataTypes.STRING(100),
    },
    etc_question: {
      allowNull: true,
      type: DataTypes.STRING(100),
    },
    status: {
      allowNull: false,
      default: 0,
      type: DataTypes.INTEGER,
    },
  });
};
