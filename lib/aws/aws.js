const AWS = require('aws-sdk');
const { accessKeyId, secretAccessKey } = require('./accessKey');
const multerS3 = require('multer-s3');
const multerS3Transform = require('multer-s3-transform');
const sharp = require('sharp');
const multer = require('multer');
const _f = require('../functions');
AWS.config.update({
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
});

const S3 = new AWS.S3();

const SNS = new AWS.SNS({
  apiVersion: '2010-03-31',
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
  //제한이 있으니까 테스트 후 service 용량 늘려서 적용
  endpoint: 'sns.ap-northeast-1.amazonaws.com',
  region: 'ap-northeast-1',
});

const extTypes = {
  '3gp': 'video/3gpp',
  a: 'application/octet-stream',
  ai: 'application/postscript',
  aif: 'audio/x-aiff',
  aiff: 'audio/x-aiff',
  asc: 'application/pgp-signature',
  asf: 'video/x-ms-asf',
  asm: 'text/x-asm',
  asx: 'video/x-ms-asf',
  atom: 'application/atom+xml',
  au: 'audio/basic',
  avi: 'video/x-msvideo',
  bat: 'application/x-msdownload',
  bin: 'application/octet-stream',
  bmp: 'image/bmp',
  bz2: 'application/x-bzip2',
  c: 'text/x-c',
  cab: 'application/vnd.ms-cab-compressed',
  cc: 'text/x-c',
  chm: 'application/vnd.ms-htmlhelp',
  class: 'application/octet-stream',
  com: 'application/x-msdownload',
  conf: 'text/plain',
  cpp: 'text/x-c',
  crt: 'application/x-x509-ca-cert',
  css: 'text/css',
  csv: 'text/csv',
  cxx: 'text/x-c',
  deb: 'application/x-debian-package',
  der: 'application/x-x509-ca-cert',
  diff: 'text/x-diff',
  djv: 'image/vnd.djvu',
  djvu: 'image/vnd.djvu',
  dll: 'application/x-msdownload',
  dmg: 'application/octet-stream',
  doc: 'application/msword',
  dot: 'application/msword',
  dtd: 'application/xml-dtd',
  dvi: 'application/x-dvi',
  ear: 'application/java-archive',
  eml: 'message/rfc822',
  eps: 'application/postscript',
  exe: 'application/x-msdownload',
  f: 'text/x-fortran',
  f77: 'text/x-fortran',
  f90: 'text/x-fortran',
  flv: 'video/x-flv',
  for: 'text/x-fortran',
  gem: 'application/octet-stream',
  gemspec: 'text/x-script.ruby',
  gif: 'image/gif',
  gz: 'application/x-gzip',
  h: 'text/x-c',
  hh: 'text/x-c',
  htm: 'text/html',
  html: 'text/html',
  ico: 'image/vnd.microsoft.icon',
  ics: 'text/calendar',
  ifb: 'text/calendar',
  iso: 'application/octet-stream',
  jar: 'application/java-archive',
  java: 'text/x-java-source',
  jnlp: 'application/x-java-jnlp-file',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'application/javascript',
  json: 'application/json',
  log: 'text/plain',
  m3u: 'audio/x-mpegurl',
  m4v: 'video/mp4',
  man: 'text/troff',
  mathml: 'application/mathml+xml',
  mbox: 'application/mbox',
  mdoc: 'text/troff',
  me: 'text/troff',
  mid: 'audio/midi',
  midi: 'audio/midi',
  mime: 'message/rfc822',
  mml: 'application/mathml+xml',
  mng: 'video/x-mng',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  mp4v: 'video/mp4',
  mpeg: 'video/mpeg',
  mpg: 'video/mpeg',
  ms: 'text/troff',
  msi: 'application/x-msdownload',
  odp: 'application/vnd.oasis.opendocument.presentation',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  odt: 'application/vnd.oasis.opendocument.text',
  ogg: 'application/ogg',
  p: 'text/x-pascal',
  pas: 'text/x-pascal',
  pbm: 'image/x-portable-bitmap',
  pdf: 'application/pdf',
  pem: 'application/x-x509-ca-cert',
  pgm: 'image/x-portable-graymap',
  pgp: 'application/pgp-encrypted',
  pkg: 'application/octet-stream',
  pl: 'text/x-script.perl',
  pm: 'text/x-script.perl-module',
  png: 'image/png',
  pnm: 'image/x-portable-anymap',
  ppm: 'image/x-portable-pixmap',
  pps: 'application/vnd.ms-powerpoint',
  ppt: 'application/vnd.ms-powerpoint',
  ps: 'application/postscript',
  psd: 'image/vnd.adobe.photoshop',
  py: 'text/x-script.python',
  qt: 'video/quicktime',
  ra: 'audio/x-pn-realaudio',
  rake: 'text/x-script.ruby',
  ram: 'audio/x-pn-realaudio',
  rar: 'application/x-rar-compressed',
  rb: 'text/x-script.ruby',
  rdf: 'application/rdf+xml',
  roff: 'text/troff',
  rpm: 'application/x-redhat-package-manager',
  rss: 'application/rss+xml',
  rtf: 'application/rtf',
  ru: 'text/x-script.ruby',
  s: 'text/x-asm',
  sgm: 'text/sgml',
  sgml: 'text/sgml',
  sh: 'application/x-sh',
  sig: 'application/pgp-signature',
  snd: 'audio/basic',
  so: 'application/octet-stream',
  svg: 'image/svg+xml',
  svgz: 'image/svg+xml',
  swf: 'application/x-shockwave-flash',
  t: 'text/troff',
  tar: 'application/x-tar',
  tbz: 'application/x-bzip-compressed-tar',
  tcl: 'application/x-tcl',
  tex: 'application/x-tex',
  texi: 'application/x-texinfo',
  texinfo: 'application/x-texinfo',
  text: 'text/plain',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  torrent: 'application/x-bittorrent',
  tr: 'text/troff',
  txt: 'text/plain',
  vcf: 'text/x-vcard',
  vcs: 'text/x-vcalendar',
  vrml: 'model/vrml',
  war: 'application/java-archive',
  wav: 'audio/x-wav',
  wma: 'audio/x-ms-wma',
  wmv: 'video/x-ms-wmv',
  wmx: 'video/x-ms-wmx',
  wrl: 'model/vrml',
  wsdl: 'application/wsdl+xml',
  xbm: 'image/x-xbitmap',
  xhtml: 'application/xhtml+xml',
  xls: 'application/vnd.ms-excel',
  xml: 'application/xml',
  xpm: 'image/x-xpixmap',
  xsl: 'application/xml',
  xslt: 'application/xslt+xml',
  yaml: 'text/yaml',
  yml: 'text/yaml',
  zip: 'application/zip',
};

module.exports = {
  s3_upload: (params, callback) => {
    S3.putObject(params, (err, data) => {
      callback(err, data);
    });
  },
  s3_delete: (params) => {
    S3.deleteObject(params, (err, data) => {
      console.log(err);
      console.log(data);
    });
  },
  s3_delete_objects: (params) => {
    S3.deleteObjects(params, (err, data) => {
      console.log(err);
      console.log(data);
    });
  },
  s3_get: (params, callback) => {
    S3.listObjectsV2(params, (err, data) => {
      callback(err, data);
    });
  },
  copyAndDelete: (params, Bucket, Key) => {
    return new Promise((resolve, reject) => {
      S3.copyObject(params, (err, data) => {
        if (err) {
          console.log(err);
        }
        if (data) {
          const delData = {
            Bucket,
            Key,
          };

          S3.deleteObject(delData, (err, result) => {
            if (err) {
              console.log(err);
            }
            resolve(true);
          });
        }
      });
    });
  },
  down_one_file: (params, callback) => {
    S3.getObject(params, (err, data) => {
      callback(err, data);
    });
  },

  multer_calculate_upload: () => {
    const calculateUpload = multer({
      storage: multerS3({
        s3: S3,
        acl: 'public-read',
        bucket: 'ordercheck',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key(req, file, cb) {
          cb(null, `calculate/${req.params.customer_idx}/${file.originalname}`);
        },
      }),
    });
    return calculateUpload;
  },
  multer_company_Enrollment_upload: () => {
    const calculateUpload = multer({
      storage: multerS3({
        s3: S3,
        acl: 'public-read',
        bucket: 'ordercheck',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key(req, file, cb) {
          cb(null, `enrollment/${req.query.company_idx}/${file.originalname}`);
        },
      }),
    });
    return calculateUpload;
  },
  multer_company_logo_upload: () => {
    const companyLogo = multer({
      storage: multerS3Transform({
        s3: S3,
        acl: 'public-read',
        bucket: 'ordercheck',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        shouldTransform: function (req, file, cb) {
          cb(null, /^image/i.test(file.mimetype));
        },
        transforms: [
          {
            id: 'logo',
            key: function (req, file, cb) {
              cb(null, `logo/${req.company_idx}/${file.originalname}`); //use Date.now() for unique file keys
            },
            transform: function (req, file, cb) {
              //Perform desired transformations
              cb(null, sharp().resize({ width: 200 }).withMetadata());
            },
          },
        ],
      }),
    });
    return companyLogo;
  },
  multer_form_upload: () => {
    const form2Upload = multer({
      storage: multerS3({
        s3: S3,
        acl: 'public-read',
        bucket: 'ordercheck',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key(req, file, cb) {
          console.log(file);
          cb(null, `form2/${_f.random5()}${file.originalname}`);
        },
      }),
    });
    return form2Upload;
  },
  multer_form_thumbNail_upload: () => {
    const thumbNailUpload = multer({
      storage: multerS3Transform({
        s3: S3,
        acl: 'public-read',
        bucket: 'ordercheck',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        shouldTransform: function (req, file, cb) {
          cb(null, /^image/i.test(file.mimetype));
        },
        transforms: [
          {
            id: 'thumbNail',
            key: function (req, file, cb) {
              cb(null, `formThumbNail/${_f.random5()}${file.originalname}`); //use Date.now() for unique file keys
            },
            transform: function (req, file, cb) {
              //Perform desired transformations
              cb(null, sharp().resize({ width: 200 }).withMetadata());
            },
          },
        ],
      }),
    });
    return thumbNailUpload;
  },
  multer_file_store_upload: () => {
    const thumbNailUpload = multer({
      storage: multerS3({
        s3: S3,
        acl: 'public-read',
        bucket: 'ordercheck',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key(req, file, cb) {
          console.log(req);
          console.log(file);
          if (!req.query.path) {
            cb(
              null,
              `fileStore/${req.params.customerFile_idx}/${_f.random5()}${
                file.originalname
              }`
            );
          } else {
            cb(
              null,
              `fileStore/${req.params.customerFile_idx}/${
                req.query.path
              }/${_f.random5()}${file.originalname}`
            );
          }
        },
      }),
    });
    return thumbNailUpload;
  },
  getExt: function (path) {
    var i = path.lastIndexOf('.');
    return i < 0 ? '' : path.substr(i);
  },
  getContentType: function (ext) {
    return extTypes[ext.toLowerCase()] || 'application/octet-stream';
  },
  getContentTypeByFileType: (fileName) => {
    let fn = fileName.toLowerCase();
    let fnArray = fn.split('.');
    let fileType = fnArray[fnArray.length - 1];
    return fileType;
  },
  getContentTypeByFile: (fileName) => {
    let rc = 'application/octet-stream';
    let fn = fileName.toLowerCase();
    let fnArray = fn.split('.');
    let fileType = fnArray[fnArray.length - 1];
    console.log(fileType);
    return extTypes[fileType] || 'application/octet-stream';
  },
  // // SMS
  sns: {
    /*
     * @param {Strinb} query.fullPhoneNumber **required
     * @param {Strinb} query.message **required
     */
    sendSMS: (query, callback) => {
      SNS.publish(
        {
          PhoneNumber: query.fullPhoneNumber,
          Message: query.message,
        },
        (err, data) => {
          console.log(err);
          if (!err && data) {
            callback(null, data);
          }
          callback(err, data);
        }
      );
    },
  },
};
