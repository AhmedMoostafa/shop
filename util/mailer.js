const sgMail = require("@sendgrid/mail");
const key = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(key);

const sendEmail = (email, subject, content) => {
  sgMail.send({
    to: email,
    from: {
      name: "shop",
      email: "ahmed.moahmed442@gmail.com",
    },
    subject: subject,
    html: content,
  });
};

module.exports = {
  sendEmail,
};
