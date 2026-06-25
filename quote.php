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

// Get form data
$first_name = trim($_POST['first_name'] ?? '');
$last_name = trim($_POST['last_name'] ?? '');
$email = trim($_POST['email'] ?? '');
$mobile = trim($_POST['mobile'] ?? '');
$special_note = trim($_POST['special_note'] ?? '');

// Validate required fields
if (empty($first_name) || empty($last_name) || empty($email) || empty($mobile)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'All required fields must be filled.'
    ]);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Please enter a valid email address.'
    ]);
    exit;
}

// Validate mobile (minimum 10 digits)
if (strlen($mobile) < 10) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Please enter a valid mobile number (minimum 10 digits).'
    ]);
    exit;
}

$mail = new PHPMailer(true);

try {
    // SMTP Configuration for Zoho Mail
    $mail->isSMTP();
    $mail->Host = 'smtppro.zoho.in';
    $mail->SMTPAuth = true;
    $mail->Username = 'contact@jacytc.com';
    $mail->Password = 'Jonson@153';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port = 465;
    $mail->CharSet = 'UTF-8';

    // Uncomment below ONLY for debugging
    // $mail->SMTPDebug = 2;

    // Recipients
    $full_name = $first_name . ' ' . $last_name;
    $mail->setFrom('contact@jacytc.com', 'JACY Trading & Consulting');
    $mail->addAddress('contact@jacytc.com', 'JACY Team');
    $mail->addReplyTo($email, $full_name);

    // Email content
    $mail->isHTML(true);
    $mail->Subject = 'New Quote Request from ' . $full_name;

    // Build HTML Email Body
    $htmlBody = '
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
            th { background-color: #51cc82; color: white; text-align: left; padding: 10px; border: 1px solid #ddd; }
            td { padding: 10px; border: 1px solid #ddd; }
            .message-box { background-color: #fff8e1; padding: 15px; border-radius: 5px; margin-top: 15px; }
            .highlight { background-color: #ffffff; }
            .price { font-size: 24px; color: #51cc82; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>JACY Trading & Consulting</h2>
            <p>New Quote Request</p>
        </div>
        
        <div class="content">
            <p>Dear JACY Team,</p>
            
            <p>You have received a new quote request with the following details:</p>
            
            <table>
                <tr>
                    <th style="width: 30%;">Field</th>
                    <th>Details</th>
                </tr>
                <tr>
                    <td><strong>Date</strong></td>
                    <td>' . date('F j, Y, g:i a') . '</td>
                </tr>
                <tr class="highlight">
                    <td><strong>From</strong></td>
                    <td>' . htmlspecialchars($full_name) . '</td>
                </tr>
                <tr>
                    <td><strong>Email</strong></td>
                    <td>' . htmlspecialchars($email) . '</td>
                </tr>
                <tr class="highlight">
                    <td><strong>Mobile</strong></td>
                    <td>' . htmlspecialchars($mobile) . '</td>
                </tr>';

    if (!empty($special_note)) {
        $htmlBody .= '
                <tr>
                    <td><strong>Special Note</strong></td>
                    <td>' . nl2br(htmlspecialchars($special_note)) . '</td>
                </tr>';
    }

    $htmlBody .= '
            </table>
            
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin-top: 20px; text-align: center;">
                <p style="margin: 0;">Please review this request and respond within <strong>24 hours</strong>.</p>
            </div>
            
            <p style="margin-top: 20px;">Best regards,<br><strong>JACY Trading & Consulting Team</strong></p>
        </div>
        
        <div class="footer">
            <p>&copy; ' . date('Y') . ' JACY Trading & Consulting LLP. All rights reserved.</p>
            <p>Gudalur, The Nilgiris, TamilNadu - 643212</p>
        </div>
    </body>
    </html>';

    // Plain text version for non-HTML email clients
    $plainTextBody = "New Quote Request\n\n" .
        "=" . str_repeat("=", 50) . "=\n\n" .
        "Date: " . date('F j, Y, g:i a') . "\n" .
        "From: " . $full_name . "\n" .
        "Email: " . $email . "\n" .
        "Mobile: " . $mobile . "\n";

    if (!empty($special_note)) {
        $plainTextBody .= "\nSpecial Note:\n" . str_repeat("-", 30) . "\n" . $special_note . "\n";
    }

    $plainTextBody .= "\n" . str_repeat("=", 50) . "\n\n" .
        "Please respond to this inquiry within 24 hours.\n\n" .
        "Best regards,\n" .
        "JACY Trading & Consulting\n" .
        "Gudalur, The Nilgiris, TamilNadu - 643212\n" .
        "© " . date('Y') . " JACY Trading & Consulting LLP. All rights reserved.";

    $mail->Body = $htmlBody;
    $mail->AltBody = $plainTextBody;

    $mail->send();

    // Return JSON response for AJAX handling
    echo json_encode([
        'status' => 'success',
        'message' => 'Thank you! Your quote request has been submitted successfully. We will contact you shortly.'
    ]);
} catch (Exception $e) {
    // Log the error server-side
    error_log('PHPMailer Error: ' . $mail->ErrorInfo);

    // Return JSON error response
    echo json_encode([
        'status' => 'error',
        'message' => 'Sorry, there was an error sending your quote request. Please try again later or call us directly at +91 741-888-0930.'
    ]);
}
