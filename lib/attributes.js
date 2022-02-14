const db = require('../model/db');

module.exports = {
  customerAttributes: [
    ['idx', 'userId'],
    'customer_name',
    'customer_phoneNumber',
    'address',
    'detail_address',
    'status',
    'contract_possibility',
    'contact_person',
    [
      db.sequelize.fn(
        'date_format',
        db.sequelize.col('customer.createdAt'),
        '%Y.%m.%d'
      ),
      'createdAt',
    ],
  ],
  showDetailConsultingAttributes: [
    'choice',
    'customer_email',
    'application_route',
    'building_type',
    'rooms_count',
    'bathrooms_count',
    'completion_year',
    'floor_plan',
    'hope_Date',
    'predicted_living',
    'budget',
    'destruction',
    'expand',
    'window',
    'carpentry',
    'paint',
    'papering',
    'bathroom',
    'bathroom_option',
    'floor',
    'tile',
    'electricity_lighting',
    'kitchen',
    'kitchen_option',
    'furniture',
    'facility',
    'film',
    'art_wall',
    'elv',
    'etc',
    'hope_concept',
    'contact_time',
    'etc_question',
    'room_size',
    'customer_name',
    'customer_phoneNumber',
    'status',
    ['address', 'customer_address'],
    ['detail_address', 'customer_detailAddress'],

    [
      db.sequelize.fn(
        'date_format',
        db.sequelize.col('consultings.createdAt'),
        '%Y.%m.%d'
      ),
      'createdAt',
    ],
  ],
  showDetailJoinConsultingAttributes: [
    'status',
    'memo',

    [
      db.sequelize.fn(
        'date_format',
        db.sequelize.col('consultingTimeLines.createdAt'),
        '%Y.%m.%d'
      ),
      'createdAt',
    ],
  ],
  showDetailMainConsultingAttributes: [
    'idx',
    'customer_name',
    'customer_phoneNumber',
    'address',
    'detail_address',
    'room_size',
    'room_size_kind',
    'contract_possibility',

    'status',
    'contract_possibility',
    'contact_person',
    [
      db.sequelize.fn(
        'date_format',
        db.sequelize.col('customer.createdAt'),
        '%Y.%m.%d'
      ),
      'createdAt',
    ],
  ],
  showIntegratedUserAttributes: [
    'idx',
    'customer_name',
    'customer_phoneNumber',
    'createdAt',
    'address',
    'detail_address',
  ],
  createFormLinkAttributes: [
    ['idx', 'formId'],
    'title',
    'form_link',
    'expression',
    [
      db.sequelize.fn('date_format', db.sequelize.col('createdAt'), '%Y.%m.%d'),
      'createdAt',
    ],
  ],
  searchFormLinkAttributes: [
    ['idx', 'formId'],
    'title',

    [
      db.sequelize.fn('date_format', db.sequelize.col('createdAt'), '%Y.%m.%d'),
      'createdAt',
    ],
  ],
};
