const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SEND_EMAIL_ID,
    pass: process.env.SEND_PASSWORD,
  },
});

const sendMail = async (company_url, company_name, inviter, target) => {
  let mailOptions = {
    from: process.env.SEND_EMAIL_ID,
    to: target,
    subject: "오더체크",
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Login Email Template</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style type="text/css">
          /* GENERAL STYLE RESETS */
          body,
          #bodyTable {
            width: 100% !important;
            height: 100% !important;
            margin: 0;
            padding: 0;
            text-align: center;
          }
          #bodyTable {
            padding: 20px 0 30px 0;
            background-color: #ffffff;
          }
          img,
          a img {
            border: 0;
            outline: none;
            text-decoration: none;
          }
          .imageFix {
            display: block;
          }
          table,
          td {
            border-collapse: collapse;
            border: none;
          }
    
          /* Outlook.com(Hotmail)의 전체 너비 및 적절한 줄 높이를 허용 */
          .ReadMsgBody {
            width: 100%;
          }
          .ExternalClass {
            width: 100%;
          }
          .ExternalClass,
          .ExternalClass p,
          .ExternalClass span,
          .ExternalClass font,
          .ExternalClass td,
          .ExternalClass div {
            line-height: 100%;
          }
    
          .button {
          }
          /* Outlook 2007 이상에서 Outlook이 추가하는 테이블 주위의 간격을 제거 */
          table,
          td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
          }
          /* Internet Explorer에서 크기가 조정된 이미지를 렌더링하는 방식을 수정 */
          img {
            -ms-interpolation-mode: bicubic;
          }
          /* Webkit 및 Windows 기반 클라이언트가 텍스트 크기를 자동으로 조정하지 않도록 수정 */
          body,
          table,
          td,
          p,
          a,
          li,
          blockquote {
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
          }
        </style>
      </head>
      <body>
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr class="header">
            <td>
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tbody style="display: flex; justify-content: center">
                  <tr>
                    <td width="116" height="20" style="line-height: 20px">
                      <img
                        src="https://ordercheck.s3.ap-northeast-2.amazonaws.com/emailTemp/header.png"
                        alt=""
                        width="900"
                        height="89"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td
                    style="
                      font-family: Noto Sans KR;
                      font-size: 15px;
                      line-height: 150%;
                      color: #41495d;
                      display: flex;
                      justify-content: center;
                      text-align: left;
                      margin: 30px 0px;
                    "
                  >
                    <div>
                      안녕하세요!<br />
                      <b>‘${inviter}’</b>님이 <b>‘${company_name}’</b> 회사에
                      고객님을 초대합니다.<br /><br />
                      아래 버튼을 눌러 함께하세요!
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td height="55" style="line-height: 55px"></td>
                  <td width="160" height="55" style="line-height: 55px">
                    <a
                      href="${company_url}"
                      style="
                        display: block;
                        font-family: Noto Sans KR;
                        width: 160px;
                        height: 55px;
                        line-height: 55px;
                        text-align: center;
                        text-decoration: none;
                        font-size: 16px;
                        font-weight: bold;
                        background: #02164f;
                        border-radius: 6px;
                        color: #ffffff;
                      "
                      ><font color="#ffffff">참여하기</font></a
                    >
                  </td>
                  <td height="55" style="line-height: 55px"></td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td
                    class="info"
                    style="text-align: center; padding: 56px 0px 0px 0px"
                  >
                    <hr
                      style="
                        width: 860px;
                        border: 0px;
                        height: 1px;
                        background-color: #eff0fa;
                        margin: 0px auto 21px auto;
                      "
                    />
                    <hr
                      style="
                        width: 860px;
                        border: 0px;
                        height: 1px;
                        background-color: #eff0fa;
                        margin: 0px auto;
                      "
                    />
                  </td>
                </tr>
                <tr>
                  <td
                    style="
                      font-family: Noto Sans KR;
                      font-size: 24px;
                      line-height: 150%;
                      color: #02164f;
                      display: flex;
                      font-weight: 400;
                      justify-content: center;
                      text-align: left;
                      margin: 22px 0px;
                    "
                  >
                    <div><b>오더체크</b>를 소개합니다!</div>
                  </td>
                </tr>
                <tr>
                  <td
                    style="
                      font-family: Noto Sans KR;
                      font-size: 16px;
                      line-height: 26px;
                      color: #02164f;
                      display: flex;
                      font-weight: 400;
                      justify-content: center;
                      text-align: center;
                    "
                  >
                    <div>
                      오더체크는 인테리어 업체를 위한 온라인 고객 응대 관리
                      솔루션입니다.<br />
                      손쉬운 고객 응대의 시작으로 인테리어도 이제 온라인에서
                      편리하게 관리하세요. 😊<br />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <a
                      style="
                        font-family: Noto Sans KR;
                        font-size: 14px;
                        line-height: 24px;
                        color: #8f98b0;
                        display: flex;
                        font-weight: 400;
                        justify-content: center;
                        text-align: center;
                      "
                      ><u>오더체크 더 자세히 알아보기</u></a
                    >
                  </td>
                </tr>
                <tr>
                  <td style="padding: 50px 0px 0px 0px; text-align: center">
                    <img
                      src="https://ordercheck.s3.ap-northeast-2.amazonaws.com/emailTemp/ordercheck_info.png"
                      width="721"
                      height="247"
                    />
                  </td>
                </tr>
                <tr>
                  <td style="padding: 60px 0px 0px 0px; text-align: center">
                    <img
                      src="https://ordercheck.s3.ap-northeast-2.amazonaws.com/emailTemp/footer_other.png"
                      alt=""
                      width="900"
                      height="116"
                    />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    
    `,
  };
  try {
    const result = await transport.sendMail(mailOptions);

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

module.exports = sendMail;
