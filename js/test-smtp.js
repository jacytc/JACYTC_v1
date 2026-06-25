
// js/test-smtp.js

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtppro.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: "contact@jacytc.com",
    pass: "your_app_password_without_spaces", // paste directly here
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Error:", error);
  } else {
    console.log("✅ SMTP Connected! Credentials are correct.");
  }
});
