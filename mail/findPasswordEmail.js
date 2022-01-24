const nodemailer = require('nodemailer');

exports.findPasswordEmail = async function (email, message, type, url, button) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'hey@stkypic.com',
      pass: 'bbvonwlpezbfehrf',
    },
  });
  let emailList = [];
  emailList.push(email);

  const mailOptions = {
    from: 'hey@stkypic.com', // sender address
    to: emailList, // list of receivers
    subject: '[스티키픽]비밀번호 재설정 URL', // Subject line
    html: `
        <!DOCTYPE html>
        <html>
        <head>
            <link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
        </head>
        <style type="text/css">
        body{background-color: #88BDBF;margin: 0px;}
        </style>
        <body>
            <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #FF7A5A;">
                <tr>
                    <td>
                        <table border="0" width="100%">
                            <tr>
                                <td>
                                    <img src="https://www.stkypic.com/public/img/logo/logo8X2.png" style="width:150px"/>
                                </td>
                                <td>
                                   
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td>
                        <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
                            <tr>
                                <td style="background-color:#FF7A5A;height:100px;font-size:50px;color:#fff;"><i class="fa fa-envelope-o" aria-hidden="true"></i></td>
                            </tr>
                            <tr>
                                <td>
                                    <h1 style="padding-top:25px;">비밀번호 재설정</h1>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p style="padding:0px 100px;">
                                        ${message}
                                    </p>
                                    <br/><br/>
                                    ${button}
                                </td>
                            </tr>
                          
                        </table>
                    </td>
                </tr>
                <tr>
                    <td>
                        <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
                            <tr>
                                <td>
                                    <h3 style="margin-top:10px;">추억을 붙이는 가장 간편한 방법</h3>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div style="margin-top: 20px;">
                                        <span style="font-size:12px;">스티키픽</span><br>
                                        <span style="font-size:12px;">Copyright © 2020 STKYPIC</span>
                                    </div>
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
  await transporter.sendMail(mailOptions, function (error, info) {
    console.log(info);
    if (error) {
      console.log(error);
      return error;
    }
    return info;
  });
};
