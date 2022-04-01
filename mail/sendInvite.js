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
    subject: "invite Test",
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
              <tr>
                <td style="padding: 25px 30px 25px 30px">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td width="116" height="20" style="line-height: 20px">
                        <img
                          src="https://ordercheck.s3.ap-northeast-2.amazonaws.com/thumb/mail_logo.png"
                          alt=""
                          width="116"
                          height="20"
                        />
                      </td>
                      <td height="20" style="line-height: 20px"></td>
                      <td height="20" style="line-height: 20px"></td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 30px 30px 30px">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td
                        style="
                          font-family: Noto Sans KR;
                          font-size: 15px;
                          line-height: 150%;
                          color: #41495d;
                        "
                      >
                        안녕하세요!<br /><br />
                        ‘${inviter}’님이 ‘${company_name}’ 회사에 초대합니다:)<br />
                        아래 버튼을 눌러 함께하세요!
                      </td>
                      <td></td>
                      <td></td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 0px 30px 30px 20px">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
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
                      <td height="55" style="line-height: 55px"></td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding: 0px 30px 30px 20px">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="font-size: 13px; line-height: 150%; color: #9a9a9a">
                        본 메일은 정보통신망 이용촉진 및 정보보호 등에 관한 법률
                        시행규칙 제11조 제3항에 의거 회원님의 메일수신 동의를 확인한
                        결과 동의하셨기에 발송되었습니다.<br /><br />
                        본 메일은 발신전용으로 회신되지 않습니다.<br />
                        메일수신을 원치 않으시는 분은 로그인 후 회원정보를 변경해주시기
                        바랍니다.<br />
                        If you do not wish to receive e-mails from us, Please log-in and
                        update your membership information. <br />
                        본 메일에 관한 문의사항은 서비스 내에 있는 고객센터를
                        이용해주시기 바랍니다. <br /><br />
        
                        © 오더체크. ALL RIGHTS RESERVED.
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
