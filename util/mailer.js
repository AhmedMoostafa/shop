const sgMail = require("@sendgrid/mail");
const key =
  "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";
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
