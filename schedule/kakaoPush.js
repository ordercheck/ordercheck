"use strict";

const schedule = require("node-schedule");
const axios = require("axios");

const db = require("../model/db");
const _f = require("../lib/functions");
var fs = require("fs");
const FileUpload = require("../lib/aws/fileupload.js");
var FileReader = require("filereader"),
  fileReader = new FileReader();
// var CryptoJS = require("crypto-js");
// var SHA256 = require("crypto-js/sha256");
// var Base64 = require("crypto-js/enc-base64");
const { payments } = require("../model/db");

const ks = "rgxK5LbLwpYk3eEzMMx1ck8Db4C3Tobai27jxTIW";
const ka = "G50fFpejsME2zZ1WmzEa";
const run = (sec) => {
  schedule.scheduleJob(`*/${sec} * * * * *`, async () => {
    console.log(`${sec}초마다 실행 테스트: [카카오 알림톡 보내기]`);
    let kakaoPush = await db.sequelize
      .query(`select * from kakaoPushes where active = 0 limit 1`)
      .spread((r) => {
        return _f.makeSpreadArray(r);
      });
    if (kakaoPush.length > 0) {
      console.log(kakaoPush);
      try {
        let t = Date.now().toString();
        let message = "";
        let template_code = kakaoPush[0].templateCode;
        let user_phone01 = kakaoPush[0].receiver;
        let data;
        let template = kakaoPush[0].template;
        message = kakaoPush[0].content;
        let kakaoMessage = kakaoPush[0];

        if (template_code == "pushb02") {
          console.log("[버튼 메시지 발송!!!]");
          data = {
            plusFriendId: "@오더체크",
            templateCode: template_code,
            messages: [
              {
                countryCode: "+82",
                to: user_phone01.substr(1),
                content: template,
                buttons: [
                  {
                    type: kakaoMessage.linkType,
                    name: kakaoMessage.linkTitle,
                    linkMobile: kakaoMessage.link,
                    linkPc: kakaoMessage.link,
                  },
                ],
              },
            ],
          };
        } else {
          data = {
            plusFriendId: "@오더체크",
            templateCode: template_code,
            messages: [
              {
                countryCode: "+82",
                to: user_phone01.substr(1),
                content: template,
              },
            ],
          };
        }

        const date = Date.now().toString();
        var space = " "; // one space
        var newLine = "\n"; // new line
        var method = "POST"; // method
        var url =
          "/alimtalk/v2/services/ncp:kkobizmsg:kr:2763215:ordercheck/messages"; // url (include query string)
        var timestamp = date; // current timestamp (epoch)
        var accessKey = ka; // access key id (from portal or Sub Account)
        var secretKey = ks; // secret key (from portal or Sub Account)

        var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
        hmac.update(method);
        hmac.update(space);
        hmac.update(url);
        hmac.update(newLine);
        hmac.update(timestamp);
        hmac.update(newLine);
        hmac.update(accessKey);

        var hash = hmac.finalize();
        const signature = hash.toString(CryptoJS.enc.Base64);
        await axios({
          url: "https://sens.apigw.ntruss.com" + url,
          method: "POST", // POST method
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "x-ncp-apigw-timestamp": date,
            "x-ncp-iam-access-key": ka,
            "x-ncp-apigw-signature-v2": signature,
          },
          data: data,
        });

        await db.kakaoPush.update(
          { active: 1 },
          { where: { idx: kakaoPush[0].idx } }
        );
      } catch (error) {
        console.log(error);
        await db.kakaoPush.update(
          { active: 1, option: JSON.stringify(error) },
          { where: { idx: kakaoPush[0].idx } }
        );
      }
    }
  });
};
module.exports = {
  run: run,
};
