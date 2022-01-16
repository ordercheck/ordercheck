const nodemailer = require('nodemailer');


exports.sendEmail = async function(send_email,receive_email,template,subject){
    const transporter = nodemailer.createTransport({
        service : 'Gmail',
            auth : {
                user : 'hey@stkypic.com',
                pass : 'bbvonwlpezbfehrf'
            }
    })
    let emailList = [];
    emailList.push(receive_email)

    const mailOptions = {
        from: send_email, // sender address
        to: emailList, // list of receivers
        subject: subject, // Subject line
        html : template
    }
    await transporter.sendMail(mailOptions, function(error, info){                                          
        console.log(info)
        if(error)  {
            console.log(error)
            return error
        }
        return info
    });
}

            


