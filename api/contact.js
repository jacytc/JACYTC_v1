import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "error", message: "Method not allowed." });
  }

  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim();
  const subject = (req.body.subject || "").trim();
  const message = (req.body.message || "").trim();

  if (!name || !email || !subject || !message) {
    return res
      .status(400)
      .json({ status: "error", message: "All fields are required." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({
        status: "error",
        message: "Please enter a valid email address.",
      });
  }

  const escapeHtml = (str) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");

  const now = new Date();
  const formattedDate = now.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const htmlBody = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background-color: #51cc82; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
      .content { padding: 20px; background-color: #f9f9f9; border-left: 1px solid #ddd; border-right: 1px solid #ddd; }
      .footer { padding: 15px; text-align: center; font-size: 12px; color: #777; background-color: #f1f1f1; border-radius: 0 0 5px 5px; }
      table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      th { background-color: #f2f2f2; text-align: left; padding: 10px; border: 1px solid #ddd; }
      td { padding: 10px; border: 1px solid #ddd; }
      .message-box { background-color: #fff8e1; padding: 15px; border-radius: 5px; margin-top: 15px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h2>JACY Trading &amp; Consulting</h2>
      <p>New Contact Request</p>
    </div>
    <div class="content">
      <p>Dear JACY Team,</p>
      <p>You have received a new contact request with the following details:</p>
      <table>
        <tr><th style="width:30%;">Field</th><th>Details</th></tr>
        <tr><td><strong>Date</strong></td><td>${formattedDate}</td></tr>
        <tr><td><strong>From</strong></td><td>${safeName}</td></tr>
        <tr><td><strong>Email</strong></td><td>${safeEmail}</td></tr>
        <tr><td><strong>Subject</strong></td><td>${safeSubject}</td></tr>
      </table>
      <div class="message-box">
        <h4>Message:</h4>
        <p>${safeMessage}</p>
      </div>
      <p style="margin-top:20px;">Please respond to this inquiry within 24 hours.</p>
    </div>
    <div class="footer">
      <p>&copy; ${now.getFullYear()} JACY Trading &amp; Consulting LLP. All rights reserved.</p>
      <p>Gudalur, The Nilgiris, TamilNadu - 643212</p>
    </div>
  </body>
  </html>`;

  try {
    await resend.emails.send({
      from: "JACY Trading & Consulting <onboarding@resend.dev>",
      to: ["enquiries@jacytc.com"],
      replyTo: email,
      subject: `New Contact Request: ${subject}`,
      html: htmlBody,
    });

    return res.status(200).json({
      status: "success",
      message:
        "Thank you! Your message has been sent successfully. We will get back to you soon!",
    });
  } catch (err) {
    console.error("Resend error:", err);
    return res.status(500).json({
      status: "error",
      message:
        "Sorry, there was an error sending your message. Please try again later.",
    });
  }
}
