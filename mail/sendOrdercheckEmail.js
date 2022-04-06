const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SEND_EMAIL_ID,
    pass: process.env.SEND_PASSWORD,
  },
});

const sendInviteEmail = async (company_url, company_name, inviter, target) => {
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

const sendJoinEmail = async (invitedPeople, company_name, target) => {
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
                      <b>${invitedPeople}</b> 님,<br />
                      <b>${company_name}</b> 로의 가입이 승인되었습니다.<br />
                      고객님은 앞으로 <b>${company_name}</b> 이(가) 사용하는 워크스페이스에
                      참여하실 수 있습니다.<br />
                      시작할 때 도움이 되는 몇 가지 팁이 제공됩니다.
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
                      href="https://ordercheck.io/ordercheck_info"
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
                      ><font color="#ffffff">오더체크 바로가기</font></a
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
                      margin: 30px 0px 22px 0px;
                    "
                  >
                    <img
                      src="https://ordercheck.s3.ap-northeast-2.amazonaws.com/emailTemp/tip.svg"
                      alt=""
                    />
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
                      text-align: left;
                      width: 600px;
                      margin: auto;
                    "
                  >
                    <img
                    src="https://ordercheck.s3.ap-northeast-2.amazonaws.com/emailTemp/customer.svg"
                      style="margin-right: 22px"
                    />
                    <div>
                      <b>고객관리</b><br />
                      오더체크의 고객관리 페이지에서
                      <a
                      href="https://guide.ordercheck.io/0121d550-c023-4eee-a2f4-797bb57fd41c"
                        style="color: #1c58ff"
                        target="_blank"
                        ><u>담당자를 지정하고 상태를 확인하세요.</u></a
                      ><br />
                    </div>
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
                      text-align: left;
                      width: 600px;
                      margin: 22px auto;
                    "
                  >
                    <img
                    src="https://ordercheck.s3.ap-northeast-2.amazonaws.com/emailTemp/consulting.svg"
                      style="margin-right: 22px"
                    />
                    <div>
                      <b>신청폼 생성</b><br />
                      제공되는 템플릿을 사용하여 간편하게
                      <a
                      href="https://guide.ordercheck.io/f0a28615-bf89-4fe3-a904-0e81276956a4"
                        style="color: #1c58ff"
                        target="_blank"
                        ><u>신청폼을 생성하고 고객에게 공유하세요.</u></a
                      ><br />
                    </div>
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
                      text-align: left;
                      width: 600px;
                      margin: auto;
                    "
                  >
                    <img
                    src="https://ordercheck.s3.ap-northeast-2.amazonaws.com/emailTemp/file.svg"
                      style="margin-right: 22px"
                    />
                    <div>
                      <b>파일 보관함</b><br />
                      오더체크가 제공하는 고객 별 파일 보관함에
                      <a
                      href="https://guide.ordercheck.io/1ff88541-1779-49d5-996a-096979f2b694"
                        style="color: #1c58ff"
                        target="_blank"
                        ><u>파일을 업로드하고 관리하세요.</u></a
                      ><br />
                    </div>
                  </td>
                </tr>
    
                <tr>
                  <td>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td height="55" style="line-height: 55px"></td>
                        <td width="160" height="55" style="line-height: 55px; padding:30px 0px 60px 0px">
                          <a
                            href="https://guide.ordercheck.io"
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
                            ><font color="#ffffff">팁 더보기</font></a
                          >
                        </td>
                        <td height="55" style="line-height: 55px"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
                  <td style="text-align: center;">
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
    </html>`,
  };
  try {
    const result = await transport.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const sendAddFormEmail = async (
  now,
  formTitle,
  customerName,
  customerPhone,
  target
) => {
  let mailOptions = {
    from: process.env.SEND_EMAIL_ID,
    to: target,
    subject: "오더체크",
    html: `[알림] 새로운 상담 신청이 접수되었습니다. 

    ${formTitle}
    
    일시 : ${now}
    
    ▶고객명: ${customerName}
    ▶연락처: ${customerPhone}
    
    접수 내용을 오더체크 페이지에서 확인하세요. 
    <오더체크 바로가기> (버튼)`,
  };
  try {
    const result = await transport.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

module.exports = { sendInviteEmail, sendJoinEmail, sendAddFormEmail };
