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
          body {
            font-family: Noto Sans KR;
            font-size: 15px;
            line-height: 23px;
          }
    
          .wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
    
          .content-text {
            margin: 30px 0px;
          }
    
          .info {
            margin-top: 30px;
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
        <div class="wrap">
          <div class="header">
            <img
              src="https://ordercheck.s3.ap-northeast-2.amazonaws.com/emailTemp/header.png"
              alt=""
              width="900px"
              height="89px"
            />
          </div>
          <div class="content-text">
            안녕하세요!<br />
            <b>‘${inviter}’</b>님이 <b>‘${company_name}’</b> 회사에 고객님을
            초대합니다.<br /><br />
            아래 버튼을 눌러 함께하세요!
          </div>
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
          <div class="info">
            <img
              src="https://ordercheck.s3.ap-northeast-2.amazonaws.com/emailTemp/ordercheck_info_B.png"
              width="900px"
              height="555px"
            />
          </div>
          <div class="footer">
            <img
              src="https://ordercheck.s3.ap-northeast-2.amazonaws.com/emailTemp/footer_other.png"
              width="900px"
              height="116px"
            />
          </div>
        </div>
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
