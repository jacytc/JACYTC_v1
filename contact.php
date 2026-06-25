<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
    exit;
}

header('Content-Type: application/json');

// -------------------------------------------------------
// 1. Collect & sanitize form data
//    HTML field names: name, email, subject, message
// -------------------------------------------------------
$name    = trim($_POST['name']    ?? '');
$email   = trim($_POST['email']   ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');

// -------------------------------------------------------
// 2. Server-side validation
// -------------------------------------------------------
if (empty($name) || empty($email) || empty($subject) || empty($message)) {
    echo json_encode(['status' => 'error', 'message' => 'All fields are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'Please enter a valid email address.']);
    exit;
}

if (strlen($name) < 2) {
    echo json_encode(['status' => 'error', 'message' => 'Name should be at least 2 characters long.']);
    exit;
}

if (strlen($message) < 10) {
    echo json_encode(['status' => 'error', 'message' => 'Message should be at least 10 characters long.']);
    exit;
}

// -------------------------------------------------------
// 3. PHPMailer — Zoho SMTP configuration
//    SMTP Host : smtppro.zoho.in
//    Port      : 465 (SSL)  — confirmed from your screenshot
//    From      : contact@jacytc.com  (must match Zoho login)
//    To        : contact@jacytc.com  (recipient as requested)
// -------------------------------------------------------
$mail = new PHPMailer(true);

try {
    // --- SMTP ---
    $mail->isSMTP();
    $mail->Host       = 'smtppro.zoho.in';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'contact@jacytc.com';   
    $mail->Password   = 'Jonson@153'; 
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; 
    $mail->Port       = 465;
    $mail->CharSet    = 'UTF-8';

    // Uncomment the line below ONLY for debugging — remove in production
    // $mail->SMTPDebug = 2;

    // --- Addresses ---
    $mail->setFrom('contact@jacytc.com', 'JACY Trading & Consulting');
    $mail->addAddress('contact@jacytc.com', 'JACY Team');   // Sends TO contact@jacytc.com
    $mail->addReplyTo($email, $name);                        // Reply goes back to website visitor

    // --- Content ---
    $mail->isHTML(true);
    $mail->Subject = 'New Contact Request: ' . htmlspecialchars($subject);

    $mail->Body = '
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
            .highlight { background-color: #ffffff; }
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
                <tr>
                    <th style="width:30%;">Field</th>
                    <th>Details</th>
                </tr>
                <tr>
                    <td><strong>Date</strong></td>
                    <td>' . date('F j, Y, g:i a') . '</td>
                </tr>
                <tr class="highlight">
                    <td><strong>From</strong></td>
                    <td>' . htmlspecialchars($name) . '</td>
                </tr>
                <tr>
                    <td><strong>Email</strong></td>
                    <td>' . htmlspecialchars($email) . '</td>
                </tr>
                <tr class="highlight">
                    <td><strong>Subject</strong></td>
                    <td>' . htmlspecialchars($subject) . '</td>
                </tr>
            </table>
            <div class="message-box">
                <h4>Message:</h4>
                <p>' . nl2br(htmlspecialchars($message)) . '</p>
            </div>
            <p style="margin-top:20px;">Please respond to this inquiry within 24 hours.</p>
        </div>
        <div class="footer">
            <p>&copy; ' . date('Y') . ' JACY Trading &amp; Consulting LLP. All rights reserved.</p>
            <p>Gudalur, The Nilgiris, TamilNadu - 643212</p>
        </div>
    </body>
    </html>';

    $mail->AltBody =
        "New Contact Request\n\n" .
        "From    : $name\n" .
        "Email   : $email\n" .
        "Subject : $subject\n\n" .
        "Message :\n$message\n\n" .
        "Date    : " . date('F j, Y, g:i a') . "\n\n" .
        "Please respond within 24 hours.\n\n" .
        "JACY Trading & Consulting — Gudalur, The Nilgiris, TamilNadu - 643212";

    $mail->send();

    echo json_encode([
        'status'  => 'success',
        'message' => 'Thank you! Your message has been sent successfully. We will get back to you soon!'
    ]);
} catch (Exception $e) {
    // Log the real error server-side, return a safe message to the client
    error_log('PHPMailer Error: ' . $mail->ErrorInfo);

    echo json_encode([
        'status'  => 'error',
        'message' => 'Sorry, there was an error sending your message. Please try again later or call us directly.'
    ]);
}
