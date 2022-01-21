const nodemailer = require('nodemailer');
const transport = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'rlxo6919@gmail.com',
    pass: 'tnvj79135@',
  },
});
const sendMail = async (company_url, company_name, inviter, target) => {
  let mailOptions = {
    from: 'rlxo6919@gmail.com',
    to: target,
    subject: 'invite Test',
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
                          src="https://ordercheck.s3.ap-northeast-2.amazonaws.com/image/original/mail_logo.png?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEPn%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDmFwLW5vcnRoZWFzdC0yIkcwRQIgP3AcHe%2F9qvcXZKdzIr4isePO7UqzEuB4qWFgCVy%2Bzh0CIQCpDFBgU4srke%2F3%2FmDHSOHCdFJTFfulES0thcoDQEoRTirkAggiEAAaDDYyNDM0NjU4NzU0OSIMCEj4ivJT3StyJ%2FeeKsECkHDJeOCnHLIk6QDEvtrewTBtfOWTSBsfmHvep72rEgCc6aNQvsLNGvqqGlDVu6yPJosrXfTdeCQ5r2%2BHByfCeA7RSZiB4wb3lnC9i%2FhQNa46c5hvkq8MVs%2FY8CiEcXS6cImvZZGiB2i1KA3AXn72BRXvsHcEyhGH6g7p1N7l%2Bugvf0Gdhzss7CPG22%2B%2F%2Boo2fcvYkIKDELPixJTUNmuRkwFmZzJVooj9LPnmd%2FwUvD4SyMdBiorYQiw0WJet3136VeR83loDtIPlNADAyMaxOGr%2Bf5h2tehl%2FpnyKzphTek6QH9p6tMtbBfJQC11igbuRPg2Q2Wf0hGN4lek9A36ldByO5Zp0EsVKO5pcNMcHoeF3lvNTbBQD2HyFR0hkxvdY2S5HU2kETOWUbyT%2B%2FbhB7KaTI7dzHc3a6jmsHfg5e7nMNqOqI8GOrMC8zyYCWfENgjRDZfimP6tAWQz0CnHqr1FXONg85s2jdJSOPxc%2FV30HpKHmC86r90MpRSgiEhnEXWP6EdDRbtEdETL0pHctqtPTDiPINNWFU3cDq%2BKFa1n2qdTZFTsfFKRxXK0kUldQR55iXVM2ckL6pVAU35H1smpxhdJnURju9ZBlDXgQqoYyIV9WypbqdBYZqMtjzecwDBFqyJcga7gv%2B%2FynBN9FiU5ejL8YsK6ceI9oyIlBwc7%2FzkSEsIqd77LBd47PIM04BUz0UN4V6%2BFMmJV1%2Fgbsa3mT0uTqH1taxcXN59xgxeLU4pZW1WgffjVBBXimv2gwqm138RJlkEUxNjtJM4gUSd9Ee0M0iWMESWNRsvqQrF1az41lHR%2F7UoLYVdZu7VWSNhLPT%2BqZ7q5jbyR0Q%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20220121T080534Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZCXPU4GOYCIQQONX%2F20220121%2Fap-northeast-2%2Fs3%2Faws4_request&X-Amz-Signature=5a62b357b81d8c7364fa7b81e272e32ccd2bc2b7fa78dc2b111c08443d99098a"
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
    await transport.sendMail(mailOptions);
    return true;
  } catch (err) {
    return false;
  }
};

module.exports = sendMail;
