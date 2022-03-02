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
  showCalculateAttributes: [
    'idx',
    'title',
    'file_url',
    'file_name',
    'predicted_price',
    'sharedDate',
    'status',
    'isMain',
    'calculateNumber',
    [
      db.sequelize.fn('date_format', db.sequelize.col('createdAt'), '%Y.%m.%d'),
      'createdAt',
    ],
  ],
  patchCalculateAttributes: [
    'idx',
    'title',
    'file_url',
    'file_name',
    'predicted_price',
    'sharedDate',
    'calculateNumber',
    'isMain',
    'status',
    [
      db.sequelize.fn('date_format', db.sequelize.col('createdAt'), '%Y.%m.%d'),
      'createdAt',
    ],
  ],
  findSameUserAttributes: [
    'idx',
    'customer_name',
    'customer_phoneNumber',
    'address',
    'detail_address',
    [
      db.sequelize.fn(
        'date_format',
        db.sequelize.col('customer.createdAt'),
        '%Y.%m.%d'
      ),
      'createdAt',
    ],
  ],
  showFilesAttributes: [
    'idx',
    'file_url',
    'title',
    'isFolder',
    'folder_uuid',
    'uuid',
    'path',
  ],
  showDetailFileFolderAttributes: [
    'title',
    'upload_people',
    'file_size',
    'path',
    [
      db.sequelize.fn('date_format', db.sequelize.col('createdAt'), '%Y.%m.%d'),
      'createdAt',
    ],
  ],

  searchFileStoreFilesAttributes: [
    'customerFile_idx',
    'title',
    'path',
    'customerFile_idx',
    ['path', 'uuidPath'],
    'file_url',
    [
      db.sequelize.fn(
        'date_format',
        db.sequelize.col('files.createdAt'),
        '%Y.%m.%d'
      ),
      'createdAt',
    ],
  ],
  searchFileStoreFoldersAttributes: [
    'customerFile_idx',
    'title',
    'path',
    'customerFile_idx',
    ['path', 'uuidPath'],

    [
      db.sequelize.fn(
        'date_format',
        db.sequelize.col('folders.createdAt'),
        '%Y.%m.%d'
      ),
      'createdAt',
    ],
  ],
  searchCustomersAttributes: [
    'idx',
    'customer_name',
    'customer_phoneNumber',
    [
      db.sequelize.fn('date_format', db.sequelize.col('createdAt'), '%Y.%m.%d'),
      'createdAt',
    ],
  ],
  getCompanyProfileMemberUserAttributes: [
    'user_name',
    'user_phone',
    'user_email',
    'personal_code',
  ],
  getCompanyProfileMemberMainAttributes: [
    ['idx', 'memberId'],
    [
      db.sequelize.fn(
        'date_format',
        db.sequelize.col('userCompany.createdAt'),
        '%Y.%m.%d %H:%i'
      ),
      'createdAt',
    ],
  ],
  showTemplateListAttributes: [
    ['idx', 'templateId'],
    'template_name',
    'create_people',
    'update_people',
    [
      db.sequelize.fn('date_format', db.sequelize.col('createdAt'), '%Y.%m.%d'),
      'createdAt',
    ],
  ],
  showPlanAttributes: [
    'plan',
    'start_plan',
    'expire_plan',
    'plan_price',
    'whiteLabel_price',
    'chat_price',
    'analystic_price',
    'pay_type',
  ],
  showPlanHistoryAttributes: [
    ['merchant_uid', 'planId'],
    'plan',
    'start_plan',
    'expire_plan',
    'active',
  ],
  showDetailPlanAttributes: [
    'active',
    'start_plan',
    'expire_plan',
    'plan',
    'plan_price',
    'result_price',
    'whiteLabel_price',
    'chat_price',
    'analystic_price',
  ],
  showSmsHistoryAttributes: [
    'sender_phoneNumber',
    'receiver_phoneNumber',
    'type',
    'text',
    'price',
    [
      db.sequelize.fn(
        'date_format',
        db.sequelize.col('createdAt'),
        '%Y.%m.%d %H:%i'
      ),
      'createdAt',
    ],
  ],
  showCardsInfoAttributes: [
    ['idx', 'cardId'],
    'card_name',
    'card_number',
    'expiry',
    'active',
    'card_email',
    'main',
  ],
  showCardDetailAttributes: [
    ['idx', 'cardId'],
    'card_name',
    'card_number',
    'expiry',
    'main',
  ],
  showDetailTemplateConfig: [
    'createdAt',
    'updatedAt',
    'company_idx',
    'update_people',
    'create_people',
  ],
  getReceiptListAttributes: [
    'receiptId',
    'receipt_kind',
    'status',
    'result_price_levy',
    [
      db.sequelize.fn('date_format', db.sequelize.col('createdAt'), '%Y.%m.%d'),
      'createdAt',
    ],
  ],
  showFormListAttributes: [
    ['idx', 'formId'],
    'title',
    'create_people',
    [
      db.sequelize.fn(
        'date_format',
        db.sequelize.col('formLink.createdAt'),
        '%Y.%m.%d'
      ),
      'createdAt',
    ],
  ],
  alarmAttributes: [
    ['idx', 'alarmId'],
    'message',
    'createdAt',
    'alarm_type',
    'confirm',
  ],
};
