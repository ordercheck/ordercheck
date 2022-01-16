const async = require('async');
const fs = require('fs');
const _f = require('../functions');
const base64 = require('base64topdf');
const sharp = require('sharp');
// http://sharp.dimens.io/en/stable/api-output/#tobuffer
// Lib
const aws = require('./aws');
const host = 'https://ordercheck.s3.ap-northeast-2.amazonaws.com/';
const bucket = 'ordercheck';

const FileUpload = {
  ////////////////////////////////////
  //////////       Image      ////////
  ////////////////////////////////////
  ufile: {
    resizeUpload: async (query, callback) => {
      try {
        // console.log(query);
        let file = query.file.toString('utf-8');
        let fileBuffer = query.file;
        let fileName = query.fileName;
        let fileType = query.fileType;
        let pre_name = _f.random5();
        let final_name = pre_name + '_' + fileName;
        let final_image = {
          crop_image: '',
          preview_image: '',
        };

        // let image = file.replace(/^data:image\/\w+;base64,/, "")
        buf = Buffer.from(
          file.replace(/^data:image\/\w+;base64,/, ''),
          'base64'
        );

        async.parallel(
          [
            (callback) => {
              sharp(buf)
                .toBuffer()
                .then((resizedImageBuffer) => {
                  console.log('[80808080808080:::crop image upload]');
                  let resizedImageData = resizedImageBuffer.toString('base64');
                  let resizedBuf = Buffer.from(
                    resizedImageData.replace(/^data:image\/\w+;base64,/, ''),
                    'base64'
                  );
                  const params = {
                    Bucket: bucket,
                    Key: 'image/crop/' + final_name,
                    Body: resizedBuf,
                    ContentEncoding: 'base64',
                    ACL: 'public-read',
                    ContentType: fileType,
                  };
                  //console.log("[quality 80]");
                  aws.s3_upload(params, (err, result) => {
                    console.log('p80 에러:' + err);
                    console.log('p80 결과:' + result);
                    console.log(host + 'image/crop/' + final_name);
                    final_image.crop_image = host + 'image/crop/' + final_name;
                    callback(null);
                  });
                })
                .catch((err) => {
                  console.log(err);
                  callback(null);
                });
            },
            (callback) => {
              sharp(buf)
                .resize({
                  width: 500,
                })
                .jpeg({
                  quality: 90,
                  force: true,
                })
                .toBuffer()
                .then((resizedImageBuffer) => {
                  console.log('[80808080808080:::preview image upload]');
                  let resizedImageData = resizedImageBuffer.toString('base64');
                  let resizedBuf = Buffer.from(
                    resizedImageData.replace(/^data:image\/\w+;base64,/, ''),
                    'base64'
                  );
                  const params = {
                    Bucket: bucket,
                    Key: 'image/preview/' + final_name,
                    Body: resizedBuf,
                    ContentEncoding: 'base64',
                    ACL: 'public-read',
                    ContentType: 'image/jpeg',
                  };
                  //console.log("[quality 80]");
                  aws.s3_upload(params, (err, result) => {
                    console.log('p80 에러:' + err);
                    console.log('p80 결과:' + result);
                    console.log(host + 'image/preview/' + final_name);
                    final_image.preview_image =
                      host + 'image/preview/' + final_name;
                    callback(null);
                  });
                })
                .catch((err) => {
                  console.log(err);
                  callback(null);
                });
            },
          ],
          (err) => {
            callback(err, final_image);
          }
        );
      } catch (error) {
        console.log(error);
      }
    },
    blobUpload: async (query, callback) => {
      try {
        // console.log(query);
        let file = query.file.toString('utf-8');
        let fileBuffer = query.file;
        let fileName = query.fileName;
        let fileType = query.fileType;
        let pre_name = _f.random5();
        let final_name = pre_name + '_' + fileName;
        let final_image = {
          original: '',
          original500: '',
        };

        // let image = file.replace(/^data:image\/\w+;base64,/, "")
        buf = Buffer.from(
          file.replace(/^data:image\/\w+;base64,/, ''),
          'base64'
        );

        async.parallel(
          [
            (callback) => {
              // 원본 이미지 저장
              var data = {
                Bucket: bucket,
                Key: 'image/original/' + final_name + '.png',
                Body: buf,
                ContentEncoding: 'base64',
                ACL: 'public-read',
                ContentType: fileType,
              };
              aws.s3_upload(data, (err, result) => {
                console.log('blobImage ERR:' + err);
                console.log('blobImage RESULT:' + result);
                console.log(host + 'image/original/' + final_name);
                final_image.original =
                  host + 'image/original/' + final_name + '.png';
                callback(null);
              });
            },
            (callback) => {
              // 용량 줄이고 저장
              sharp(buf)
                .resize({
                  width: 500,
                })
                .toBuffer()
                .then((resizedImageBuffer) => {
                  console.log('[80808080808080808]');
                  let resizedImageData = resizedImageBuffer.toString('base64');
                  let resizedBuf = Buffer.from(
                    resizedImageData.replace(/^data:image\/\w+;base64,/, ''),
                    'base64'
                  );
                  const params = {
                    Bucket: bucket,
                    Key: 'image/w500/' + final_name + '.png',
                    Body: resizedBuf,
                    ContentEncoding: 'base64',
                    ACL: 'public-read',
                    ContentType: fileType,
                  };
                  //console.log("[quality 80]");
                  aws.s3_upload(params, (err, result) => {
                    console.log('p80 에러:' + err);
                    console.log('p80 결과:' + result);
                    console.log(host + 'image/w500/' + final_name);
                    final_image.original500 =
                      host + 'image/w500/' + final_name + '.png';
                    callback(null);
                  });
                })
                .catch((err) => {
                  console.log(err);
                  callback(null);
                });
            },
          ],
          (err) => {
            callback(err, final_image);
          }
        );
      } catch (error) {
        console.log(error);
      }
    },

    /*
     * @param {File} query.file
     */
    upload: (query, callback) => {
      const fileName =
        new Date().getTime() + Math.floor(Math.random() * 1000) + '.jpg';
      const metadata = aws.getContentTypeByFile(query.file.originalFilename);
      fs.readFile(query.file.path, (err, readStream) => {
        async.parallel(
          [
            (callback) => {
              // 원본 이미지 저장
              const params = {
                Bucket: bucket,
                Key: 'image/original/' + fileName,
                Body: readStream,
                ACL: 'public-read',
                ContentType: metadata,
              };
              //console.log("[원본 이미지 저장]");
              aws.s3_upload(params, (err, result) => {
                //console.log("원본에러:"+err)
                //console.log("원본결과:"+result)
                callback(null);
              });
            },
            (callback) => {
              //console.log("가나연")
              // 용량 줄이고 저장
              const sharp = require('sharp');
              sharp(readStream)
                .jpeg({
                  quality: 80, // Number quality, integer 1-100 (optional, default 80)
                  force: true, // Boolean force JPEG output, otherwise attempt to use input format (optional, default  true
                })
                .toBuffer()
                .then((resizeStream) => {
                  const params = {
                    Bucket: bucket,
                    Key: 'image/q80/' + fileName,
                    Body: resizeStream,
                    ACL: 'public-read',
                    ContentType: metadata,
                  };
                  //console.log("[quality 80]");
                  aws.s3_upload(params, (err, result) => {
                    //console.log("p80 에러:"+err)
                    //console.log("p80 결과:"+result)
                    callback(null);
                  });
                })
                .catch((err) => {
                  callback(null);
                });
            },
          ],
          (err) => {
            callback(null, host + 'image/q80/' + fileName);
          }
        );
      });
    },
    downFile: (query, callback) => {
      aws.s3_get(params, (err, result) => {
        console.log('test');
      });
    },
    pdfUpload: async (query, callback) => {
      let file = query.file.toString('utf-8');

      let fileBuffer = query.file;
      let fileName = query.fileName;
      let fileType = query.fileType;
      let pre_name = _f.random5();
      let final_name = pre_name + '_' + fileName;
      let final_image = {
        crop_image: '',
        preview_image: '',
      };

      // let image = file.replace(/^data:image\/\w+;base64,/, "")
      buf = Buffer.from(file.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      async.parallel(
        [
          (callback) => {
            // 원본 이미지 저장
            var data = {
              Bucket: bucket,
              Key: 'calculate/' + final_name + '.pdf',
              Body: buf,
              ContentEncoding: 'base64',
              ACL: 'public-read',
              ContentType: 'application/pdf',
            };
            aws.s3_upload(data, (err, result) => {
              console.log('blobImage ERR:' + err);
              console.log('blobImage RESULT:' + result);
              console.log(host + 'calculate/' + final_name);
              final_image.original = host + 'calculate/' + final_name + '.pdf';
              callback(null);
            });
          },
        ],
        (err) => {
          callback(err, final_image);
        }
      );
    },
  },
};
module.exports = FileUpload;
