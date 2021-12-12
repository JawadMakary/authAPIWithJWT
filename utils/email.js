// implement a transporter : fct that let us transport our mail using mailtrap(dummy sandbox)
const nodemailer = require("nodemailer");

exports.sendMail = async function (options) {
  // create transporter instance
  const transporter = nodemailer.createTransport({
    // we need to make sure that varNames are right
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  //   define email options
  const mailOptions = {
    from: "Progresss Click <info@progressClick.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //send the mail
  await transporter.sendMail(mailOptions)
};
