const nodeMailer = require('nodemailer');

const sendOTP = async (otp, email) => {
    let transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth:{
            user: 'qa80986@gmail.com',
            pass: 'elvnxcogxeyykipz'
        }
    });

    const mailOptions = {
        from: 'qa80986@gmail.com',
        to: email,
        subject: 'OTP Verification',
        text: 'Verify Your OTP',
        html: `${otp}`
    };

    transporter.sendMail(mailOptions, (err, info)=> {
        if(err){
            return console.log(err);
        }
        console.log(info);
    })
}

module.exports = sendOTP;