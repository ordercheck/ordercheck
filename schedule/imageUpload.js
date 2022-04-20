"use strict";

const schedule = require("node-schedule");
const axios = require("axios");

const db = require("../model/db");
const _f = require("../lib/functions");
var fs = require("fs");
const FileUpload = require("../lib/aws/fileupload.js");
var FileReader = require("filereader"),
  fileReader = new FileReader();

const run = (sec) => {
  schedule.scheduleJob(`*/${sec} * * * * *`, async () => {
    console.log(`${sec}초마다 실행 테스트:[이미지 업로드]`);
    let image = await db.sequelize
      .query(`select * from images where upload = 0 and error = 0 limit 1`)
      .spread((r) => {
        return _f.makeSpreadArray(r);
      });
    if (image.length > 0) {
      console.log("image 존재");
      let i = image[0];
      let image_idx = i.image_idx;
      let file = i.original_image_bi;
      let query = {
        file: file,
        fileName: image[0].image_name,
        fileType: image[0].image_type,
      };

      await FileUpload.ufile.blobUpload(query, async (err, url) => {
        if (err) {
          await db.images.update({ error: 1 }, { where: { image_idx } });
        } else {
          console.log(url);
          await db.images.update(
            {
              upload: 1,
              original_image: url.original,
              original_image_bi: null,
            },
            { where: { image_idx } }
          );
        }
      });
    }
  });
};

module.exports = {
  run: run,
};
