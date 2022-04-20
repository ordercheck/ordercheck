"use strict";

const schedule = require("node-schedule");
const axios = require("axios");

const db = require("../model/db");
const _f = require("../lib/functions");
var fs = require("fs");
const FileUpload = require("../lib/aws/fileupload.js");
const { sendEmail } = require("../mail/sendEmail");
var FileReader = require("filereader"),
  fileReader = new FileReader();

const run = (sec) => {
  schedule.scheduleJob(`*/${sec} * * * * *`, async () => {
    console.log(
      `${sec}초마다 실행 테스트: [이메일 보내기] => 이메일 발송 스케줄링`
    );
    let email = await db.sequelize
      .query(`select * from emails where send = 0 order by idx limit 1`)
      .spread((r) => {
        return _f.makeSpreadArray(r);
      });
    if (email.length > 0) {
      console.log("이메일 발송:::" + email[0].subject);
      console.log(email[0]);
      let send_email = email[0].send_email;
      let receive_email = email[0].receive_email;
      let template = email[0].template;
      let subject = email[0].subject;
      sendEmail(send_email, receive_email, template, subject);
      await db.emails.update({ send: 1 }, { where: { idx: email[0].idx } });
    }
  });
};

module.exports = {
  run: run,
};
