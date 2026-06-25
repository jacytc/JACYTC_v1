import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_PASSWORD,
  },
});

export async function sendEmail({ to, subject, html, replyTo }) {
  return await transporter.sendMail({
    from: `"JACY Trading & Consulting" <${process.env.ZOHO_EMAIL}>`,
    to,
    subject,
    html,
    replyTo,
  });
}
