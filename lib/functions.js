const crypto = require('crypto');
const STKYPIC_KEY = 'asldkhjflkj12309u0!@#!slkjasld';
const request = require('request');
const axios = require('axios');
var CryptoJS = require('crypto-js');
const https = require('https');
const popbill = require('popbill');
const sec = '오더체크2022';
popbill.config({
  LinkID: '',
  SecretKey: '+0=',
  IsTest: true,
  defaultErrorHandler: function (Error) {
    console.log('Error Occur : [' + Error.code + '] ' + Error.message);
  },
});
const ks = 'rgxK5LbLwpYk3eEzMMx1ck8Db4C3Tobai27jxTIW';
const ka = 'G50fFpejsME2zZ1WmzEa';
const si = 'ncp:sms:kr:276321532401:ordercheck';
const faxService = popbill.FaxService();
module.exports = {
  cryptFunction: (type, encodeTarget, decodeTarget) => {
    if (type == 0) {
      let ciphertext = CryptoJS.AES.encrypt(encodeTarget, sec).toString();
      result = ciphertext;
      console.log(ciphertext);
    } else {
      let bytes = CryptoJS.AES.decrypt(decodeTarget, sec);
      let originalText = bytes.toString(CryptoJS.enc.Utf8);
      result = originalText;
    }

    return result;
  },
  getFaxSendNumber: async () => {
    return await faxService.getSenderNumberMgtURL(
      '8228602246',
      function (response) {
        console.log('요기');
        console.log(response);
        return response;
      },
      function (error) {
        console.log(error);
        return error;
      }
    );
  },
  kakaoPush: async (up, templateCode, message, buttonUrl) => {
    let user_phone = up;

    let data = {
      plusFriendId: '@오더체크',
      templateCode,
      messages: [
        {
          countryCode: '+82',
          to: user_phone.substr(1),
          content: message,
          buttons: [
            {
              type: 'WL',
              name: '확인하기',
              linkMobile: `http://${buttonUrl}`,
              linkPc: `http://${buttonUrl}`,
            },
          ],
        },
      ],
    };
    const date = Date.now().toString();
    var space = ' '; // one space
    var newLine = '\n'; // new line
    var method = 'POST'; // method
    var url =
      '/alimtalk/v2/services/ncp:kkobizmsg:kr:2763215:ordercheck/messages'; // url (include query string)
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
    try {
      const axiosResult = await axios({
        url: 'https://sens.apigw.ntruss.com/alimtalk/v2/services/ncp:kkobizmsg:kr:2763215:ordercheck/messages',
        method: 'POST', // POST method
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-ncp-apigw-timestamp': date,
          'x-ncp-iam-access-key': ka,
          'x-ncp-apigw-signature-v2': signature,
        },
        data,
      });
    } catch (err) {
      console.log(err);
    }
  },
  smsPush: async (user_phone, message) => {
    return new Promise((resolve, reject) => {
      let _user_phone = user_phone;
      if (_user_phone.indexOf('-') > -1) {
        _user_phone = _user_phone.split('-').join('');
      }
      var user_phone_number = _user_phone; //수신 전화번호 기입
      const date = Date.now().toString();
      const uri = si; //서비스 ID
      const secretKey = ks; // Secret Key
      const accessKey = ka; //Access Key
      const method = 'POST';
      const space = ' ';
      const newLine = '\n';
      const url = `https://sens.apigw.ntruss.com/sms/v2/services/${uri}/messages`;
      const url2 = `/sms/v2/services/${uri}/messages`;
      const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
      hmac.update(method);
      hmac.update(space);
      hmac.update(url2);
      hmac.update(newLine);
      hmac.update(date);
      hmac.update(newLine);
      hmac.update(accessKey);
      const hash = hmac.finalize();
      const signature = hash.toString(CryptoJS.enc.Base64);
      request(
        {
          method: method,
          json: true,
          uri: url,
          headers: {
            'Contenc-type': 'application/json; charset=utf-8',
            'x-ncp-iam-access-key': accessKey,
            'x-ncp-apigw-timestamp': date,
            'x-ncp-apigw-signature-v2': signature,
          },
          body: {
            type: 'LMS',
            countryCode: '82',
            from: '16700310', //"발신번호기입",
            content: message, //문자내용 기입,
            messages: [{ to: `${user_phone_number}` }],
          },
        },
        (err, res, html) => {
          if (err) {
            resolve({ success: 400, type: 'code', error: err });
          } else {
            resolve({ success: 200, type: 'code' });
          }
        }
      );
    });
  },
  instaToken: () => {
    return 'IGQVJXeGlxdm1ITzBHbVVFcG1rbWdGQ1luajJMdzgybmppb1otU3lmU3d3RnVXaUsxUjEtVGh3U2xoSm1NanZAsWDk3VlpKV0tBYXJURUV4N3EwWU5zRFUxYkc1T1VWQmZASN1ZAlVngzY2EzQWlGaUk3UAZDZD';
  },
  upgradeBase64crypto: (password) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(64, (err, buf) => {
        const salt = STKYPIC_KEY;
        crypto.pbkdf2(password, salt, 100, 64, 'sha512', (err, key) => {
          console.log(key.toString('base64'));
          return resolve(key.toString('base64'));
        });
      });
    });
  },
  randomString: () => {
    var chars =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghijklmnopqrstuvwxyz';
    var string_length = 7;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    //document.randform.randomfield.value = randomstring;
    return randomstring;
  },
  randomString9: () => {
    var chars = '123456789';
    var string_length = 9;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    //document.randform.randomfield.value = randomstring;
    return randomstring;
  },
  randomString4: () => {
    var chars = '123456789';
    var string_length = 4;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    //document.randform.randomfield.value = randomstring;
    return randomstring;
  },
  randomString20: () => {
    var chars =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghijklmnopqrstuvwxyz';
    var string_length = 20;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    //document.randform.randomfield.value = randomstring;
    return randomstring;
  },
  customerIdRandomString: () => {
    var chars =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghijklmnopqrstuvwxyz';
    var string_length = 15;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    //document.randform.randomfield.value = randomstring;
    return randomstring;
  },
  productRandomString: () => {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ';
    var string_length = 5;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    //document.randform.randomfield.value = randomstring;
    return randomstring;
  },
  random5: () => {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ';
    var string_length = 5;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    //document.randform.randomfield.value = randomstring;
    return randomstring;
  },
  randomNumber4: () => {
    var chars = '0123456789';
    var string_length = 4;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    //document.randform.randomfield.value = randomstring;
    return randomstring;
  },
  randomF: () => {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXTZ';
    var string_length = 4;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
      var rnum = Math.floor(Math.random() * chars.length);
      randomstring += chars.substring(rnum, rnum + 1);
    }
    //document.randform.randomfield.value = randomstring;
    return randomstring;
  },
  getNowTimeJoin: () => {
    let today = new Date();
    let mo =
      Number(today.getMonth() + 1) > 9
        ? Number(today.getMonth() + 1)
        : '0' + Number(today.getMonth() + 1);
    let d =
      Number(today.getDate()) > 9
        ? Number(today.getDate())
        : '0' + Number(today.getDate());
    let h =
      Number(today.getHours()) > 9
        ? Number(today.getHours())
        : '0' + Number(today.getHours());
    let mi =
      Number(today.getMinutes()) > 9
        ? Number(today.getMinutes())
        : '0' + Number(today.getMinutes());

    return Number(today.getFullYear()) + '' + mo + '' + d + '' + h + '' + mi;
  },
  getMerchantNowTimeJoin: () => {
    let today = new Date();
    let mo =
      Number(today.getMonth() + 1) > 9
        ? Number(today.getMonth() + 1)
        : '0' + Number(today.getMonth() + 1);
    let d =
      Number(today.getDate()) > 9
        ? Number(today.getDate())
        : '0' + Number(today.getDate());
    let h =
      Number(today.getHours()) > 9
        ? Number(today.getHours())
        : '0' + Number(today.getHours());
    let mi =
      Number(today.getMinutes()) > 9
        ? Number(today.getMinutes())
        : '0' + Number(today.getMinutes());

    return '20' + mo + '' + d + '' + h + '' + mi;
  },
  getNowTimeFormat: (d) => {
    let today = new Date(d);
    return (
      Number(today.getFullYear()) +
      '-' +
      Number(today.getMonth() + 1) +
      '-' +
      Number(today.getDate()) +
      ' ' +
      Number(today.getHours()) +
      ':' +
      Number(today.getMinutes())
    );
  },
  getNowTimeFormatNow: () => {
    let today = new Date();
    return (
      Number(today.getFullYear()) +
      '-' +
      Number(today.getMonth() + 1) +
      '-' +
      Number(today.getDate()) +
      ' ' +
      Number(today.getHours()) +
      ':' +
      Number(today.getMinutes())
    );
  },
  getNowTime: () => {
    let today = new Date();
    return (
      Number(today.getFullYear()) +
      '-' +
      Number(today.getMonth() + 1) +
      '-' +
      Number(today.getDate()) +
      ' ' +
      Number(today.getHours()) +
      ':' +
      Number(today.getMinutes())
    );
  },
  getNowDate: () => {
    let today = new Date();
    return (
      Number(today.getFullYear()) +
      '-' +
      Number(today.getMonth() + 1) +
      '-' +
      Number(today.getDate())
    );
  },
  getNowTimeFormatKaokao: (d) => {
    let today = new Date(d);
    return (
      Number(today.getFullYear()) +
      '/' +
      Number(today.getMonth() + 1) +
      '/' +
      Number(today.getDate())
    );
  },
  makeArray: (data) => {
    let resultArray = [];
    for (var rs in data) {
      if (data.hasOwnProperty(rs)) {
        //console.log(data[rs].dataValues)
        resultArray.push(data[rs].dataValues);
      }
    }
    return resultArray;
  },
  makeSpreadArray: (data) => {
    let resultArray = [];
    for (var rs in data) {
      if (data.hasOwnProperty(rs)) {
        resultArray.push(data[rs]);
      }
    }
    return resultArray;
  },
  convertNumber2Won: (price) => {
    // console.log(price)
    // console.log(price)
    price = price.toString();
    let result = '';
    if (price.length > 4) {
      for (let i = 4; i < price.length; i++) {
        let str = price.substring(price.length - i - 1, price.length - i);
        if (i == 4) str += '만';
        if (i == 7) str += ',';
        if (i == 8) str += '억 ';
        if (i == 11) str += '억 ';
        if (i == 12) str += '조 ';
        result = str + result;
      }
      result = result.replace(' 0,000억', '');
      result = result.replace(' 0,000만', '');
      result = result.replace('0,00', '');
      result = result.replace('0,0', '');
      result = result.replace('0,', '');
      return result;
    } else {
      result = price + '원';
      return result;
    }
  },
  refundText: () => {
    let text = `<p><span style="color: #e94557;">스티키픽은 실크벽지에 적합하도록 개발되었습니다. PVC 코팅이 되지 않은 종이(합지) 벽지에는 적합하지 않습니다.</span><br/><br/>

        <span style="color: #e94557;">내구성이 떨어진 일부 벽지 혹은 페인트 벽에는 손상이 갈 수도 있습니다.</span>
            <p>내구성이 약한 일부 벽지에는 손상이 갈 수도 있습니다.<br/>
            하나의 스티키픽으로 눈에 띄지않는 벽면에 조심히 테스트를 거친 후 사용해주세요. <br/><br/>
            *혹시나 있을 벽면 손상에 대한 보상은 불가합니다.
            </p>

            <br/>
        
            <h3>교환 및 반품/환불이 가능한 경우</h3>

            
        <p>
            1. 주문한 제품과 상이한 제품이 배송되었을 경우<br/>
            2. 벽면에 잘 붙지 않거나 벽면 특성으로 인해 제품 사용이 불가한 경우
            <br/><br/>
            배송일로부터 7일 이내에 반품이 가능하며 반송비는 모두 스티키픽이 부담합니다. 제품 하자 확인을 위해 1차 사진 첨부, 2차 실물 검수가 필요합니다.<br/>
        </p>
            <br/>
            <h3>반품 환불 방법</h3>
        <p>
            1. 스티키픽 카카오톡 채널을 통해 반품/환불 신청을 해주세요.<br/>
            2. 문제가 되는 제품의 사진을 첨부해주세요.<br/>
            3. 배송된 제품의 80% 이상을 원상태로 반송해주세요.<br/>
        </p>
        <br/>
            <h3>교환 및 반품이 불가능한 경우</h3>
        <p>
            1. 파일이 정상적으로 접수되어 조판이 진행되었을 경우<br/>
            2. 사진,액자와 접착제에 문제가 없을 경우<br/>
        </p>
        </p>`;

    return text;
  },
  sitemap: () => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<!--	created with www.mysitemapgenerator.com	-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url>
	<loc>https://stkypic.com/</loc>
	<lastmod>2020-11-12T16:49:20+01:00</lastmod>
	<priority>1.0</priority>
</url>
<url>
	<loc>https://stkypic.com/forwho</loc>
	<lastmod>2020-11-12T16:49:20+01:00</lastmod>
	<priority>1.0</priority>
</url>
<url>
	<loc>https://stkypic.com/stepone</loc>
	<lastmod>2020-11-12T16:49:20+01:00</lastmod>
	<priority>1.0</priority>
</url>
<url>
	<loc>https://stkypic.com/user/login</loc>
	<lastmod>2020-11-12T16:49:20+01:00</lastmod>
	<priority>1.0</priority>
</url>
<url>
	<loc>https://stkypic.com/refund</loc>
	<lastmod>2020-11-12T16:49:20+01:00</lastmod>
	<priority>1.0</priority>
</url>
<url>
	<loc>https://stkypic.com/usage</loc>
	<lastmod>2020-11-12T16:49:23+01:00</lastmod>
	<priority>1.0</priority>
</url>
<url>
	<loc>https://stkypic.com/private</loc>
	<lastmod>2020-11-12T16:49:24+01:00</lastmod>
	<priority>1.0</priority>
</url>
</urlset>`;
  },
};
