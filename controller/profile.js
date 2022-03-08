const db = require('../model/db');
const { makeSpreadArray } = require('../lib/functions');
const bcrypt = require('bcrypt');
const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault('Asia/Seoul');
const _f = require('../lib/functions');
module.exports = {
  getUserProfile: async (req, res, next) => {
    try {
      let userProfile = await db.sequelize
        .query(
          `SELECT user.idx, personal_code, user_phone, userCompany.company_idx, user_profile, 
              user_email, user_name, plan, calculateReload, config_idx,
              date_format(user.createdAt, '%Y.%m.%d') as createdAt
              FROM user 
              LEFT JOIN userCompany ON user.idx = userCompany.user_idx 
              LEFT JOIN userConfig ON user.idx = userConfig.user_idx
              LEFT JOIN plan ON userCompany.company_idx = plan.company_idx and plan.active = 1     
              WHERE user.idx = ${req.user_idx}`
        )
        .spread((r) => {
          return makeSpreadArray(r);
        });

      const findFilesResult = await db.files.findAll({
        where: {
          company_idx: userProfile[0].company_idx,
          isFolder: false,
        },
        attributes: ['file_size'],
        raw: true,
      });

      let fileStoreSize = 0;
      findFilesResult.forEach((data) => {
        fileStoreSize += data.file_size;
      });

      const findConfig = await db.config.findByPk(userProfile[0].config_idx, {
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'company_idx', 'duplicateCount'],
        },
      });
      userProfile[0].fileStoreSize = fileStoreSize;
      userProfile[0].authList = findConfig;
      return res.send({ success: 200, userProfile: userProfile[0] });
    } catch (err) {
      next(err);
    }
  },
  checkUserCompany: async (req, res, next) => {
    const { company_idx } = req;
    try {
      const findResult = await db.plan.findOne({
        where: { company_idx },
        attributes: ['plan'],
      });
      return res.send({ success: 200, findResult });
    } catch (err) {
      next(err);
    }
  },
  delUser: async (req, res, next) => {
    const {
      body: { user_password, reason },
      user_idx,
      company_idx,
    } = req;

    try {
      // 유저 전화번호 먼저 찾기
      const findUser = await db.user.findByPk(user_idx, {
        attributes: ['user_password'],
      });

      const compareResult = await bcrypt.compare(
        user_password,
        findUser.user_password
      );

      //   비밀번호가 일치하지 않을 때
      if (!compareResult) {
        return res.send({
          success: 400,
          message: '비밀번호가 일치하지 않습니다.',
        });
      }

      // 탈퇴사유 생성
      await db.delReason.create({ reason, user_idx });

      // 계정 delete처리

      const deletedTime = moment().format('YYYY.MM.DD');

      await db.user.update(
        {
          deleted: deletedTime,
        },
        {
          where: {
            idx: user_idx,
          },
        }
      );

      return res.send({ success: 200 });
    } catch (err) {
      next(err);
    }
  },
};
