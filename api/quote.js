import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ status: "error", message: "Method not allowed." });
  }

  const first_name = (req.body.first_name || "").trim();
  const last_name = (req.body.last_name || "").trim();
  const email = (req.body.email || "").trim();
  const mobile = (req.body.mobile || "").trim();
  const special_note = (req.body.special_note || "").trim();

  if (!first_name || !last_name || !email || !mobile) {
    return res.status(400).json({
      status: "error",
      message: "All required fields must be filled.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      status: "error",
      message: "Please enter a valid email address.",
    });
  }

  const mobileRegex = /^[0-9+\-\s]{7,15}$/;
  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({
      status: "error",
      message: "Please enter a valid mobile number.",
    });
  }

  const escapeHtml = (str) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const safeName = escapeHtml(`${first_name} ${last_name}`);
  const safeEmail = escapeHtml(email);
  const safeMobile = escapeHtml(mobile);
  const safeNote = escapeHtml(special_note).replace(/\n/g, "<br>");

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
      .note-box { background-color: #fff8e1; padding: 15px; border-radius: 5px; margin-top: 15px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h2>JACY Trading &amp; Consulting</h2>
      <p>New Quote Request</p>
    </div>
    <div class="content">
      <p>Dear JACY Team,</p>
      <p>You have received a new quote request with the following details:</p>
      <table>
        <tr><th style="width:30%;">Field</th><th>Details</th></tr>
        <tr><td><strong>Date</strong></td><td>${formattedDate}</td></tr>
        <tr><td><strong>Name</strong></td><td>${safeName}</td></tr>
        <tr><td><strong>Email</strong></td><td>${safeEmail}</td></tr>
        <tr><td><strong>Mobile</strong></td><td>${safeMobile}</td></tr>
      </table>
      ${
        special_note
          ? `
      <div class="note-box">
        <h4>Special Note:</h4>
        <p>${safeNote}</p>
      </div>`
          : "<p><em>No special note provided.</em></p>"
      }
      <p style="margin-top:20px;">Please respond to this quote request within 24 hours.</p>
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
      subject: `New Quote Request from ${first_name} ${last_name}`,
      html: htmlBody,
    });

    return res.status(200).json({
      status: "success",
      message:
        "Thank you! Your quote request has been submitted. We will get back to you soon!",
    });
  } catch (err) {
    console.error("Resend error:", err);
    return res.status(500).json({
      status: "error",
      message: "Sorry, failed to submit your request. Please try again later.",
    });
  }
}
