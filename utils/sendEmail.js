const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const sendEmail = async ({ to, subject, templateName, data }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    // load template dynamically
    const templatePath = path.join(__dirname, `../templates/${templateName}.html`);
    let html = fs.readFileSync(templatePath, "utf-8");

    // replace dynamic values
    Object.keys(data).forEach((key) => {
      html = html.replace(new RegExp(`{{${key}}}`, "g"), data[key]);
    });

    await transporter.sendMail({
      from: `"Ticket Platform" <${process.env.EMAIL}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ ${templateName} email sent`);
  } catch (error) {
    console.error("❌ Email Error:", error.message);
  }
};

module.exports = sendEmail;