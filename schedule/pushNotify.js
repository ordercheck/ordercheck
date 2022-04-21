"use strict";

const schedule = require("node-schedule");
const axios = require("axios");

const db = require("../model/db");
const _f = require("../lib/functions");
var fs = require("fs");
const FileUpload = require("../lib/aws/fileupload.js");
const { sendEmail } = require("../mail/sendEmail");
const { makeArray } = require("../lib/functions");
// var FileReader = require("filereader"),
//   fileReader = new FileReader();

const run = (sec) => {
  schedule.scheduleJob(`*/${sec} * * * * *`, async () => {
    try {
      // console.log(`${sec}초마다 실행 테스트: [푸시 알람 보내기] => 푸시 알람 발송 스케줄링`);
      let push = await db.sequelize
        .query(
          `select * from pushNotifies where status = 0 order by idx limit 1`
        )
        .spread((r) => {
          return _f.makeSpreadArray(r);
        });
      if (push.length > 0) {
        let p = push[0];
        if (p.category == 3) {
          let user = await db.users
            .findAll({ where: { idx: p.uidx } })
            .then((r) => {
              return makeArray(r)[0];
            });

          if (user.pushActive == 0) {
            await db.pushNotifies.update(
              { status: 1 },
              { where: { idx: push[0].idx } }
            );
          } else {
            await axios({
              url: `/api/push/gonggu/ad`,
              method: "post",
              data: {
                token: user.token,
                title: p.title,
                message: p.message,
                bidx: p.bidx,
                cidx: p.cidx,
                targetIdx: p.targetIdx,
                images: p.image,
              },
              headers: { "Content-Type": "application/json" },
            })
              .then(async (response) => {
                // console.log(response)
                await db.pushNotifies.update(
                  { status: 1 },
                  { where: { idx: push[0].idx } }
                );
              })
              .catch(async (error) => {
                console.log(error);
                await db.pushNotifies.update(
                  { status: 1 },
                  { where: { idx: push[0].idx } }
                );
              });
          }
        } else {
          let user = await db.users
            .findAll({ where: { idx: p.uidx } })
            .then((r) => {
              return makeArray(r)[0];
            });

          if (user.pushActive == 0) {
            await db.pushNotifies.update(
              { status: 1 },
              { where: { idx: push[0].idx } }
            );
          } else {
            await axios({
              url: `/api/push/test`,
              method: "post",
              data: {
                token: user.token,
                title: p.title,
                message: p.message,
                bidx: p.bidx,
                cidx: p.cidx,
                targetIdx: p.targetIdx,
              },
              headers: { "Content-Type": "application/json" },
            })
              .then(async (response) => {
                // console.log(response)
                await db.pushNotifies.update(
                  { status: 1 },
                  { where: { idx: push[0].idx } }
                );
              })
              .catch(async (error) => {
                console.log(error);
                await db.pushNotifies.update(
                  { status: 1 },
                  { where: { idx: push[0].idx } }
                );
              });
          }
        }
      }
    } catch (error) {
      console.log("푸시 서버 에러 =====>");
      console.log(error);
    }
  });
};

module.exports = {
  run: run,
};
