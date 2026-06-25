<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// Set JSON headers for AJAX response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Include PHPMailer
require_once 'vendor/autoload.php';

// ============================================
// GMAIL SMTP CONFIGURATION
// ============================================
$config = [
    'smtp_host' => 'smtp.gmail.com',
    'smtp_port' => 587,
    'smtp_username' => 'devipriyavenkatesan.v@gmail.com', // Your Gmail address
    'smtp_password' => 'jisaotfyudjiqrtg', // Replace with Gmail App Password (no spaces)
    'smtp_secure' => PHPMailer::ENCRYPTION_STARTTLS,
    'from_email' => 'devipriyavenkatesan.v@gmail.com', // Must match Gmail account
    'from_name' => 'JACY Trading & Consulting',
    'to_emails' => [
        'priyavenkatesan41@gmail.com' => 'JACY Team'
    ],
    'debug_mode' => true // Set to false in production
];

function sendJsonResponse($status, $message, $data = null)
{
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

function sanitizeInput($input)
{
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse('error', 'Invalid request method. Please use POST.');
}

// DEBUG: Log all received data
error_log("========== NEW FORM SUBMISSION ==========");
error_log("Raw POST data: " . print_r($_POST, true));

// Get form data
$fname = isset($_POST['fname']) ? sanitizeInput($_POST['fname']) : '';
$lname = isset($_POST['lname']) ? sanitizeInput($_POST['lname']) : '';
$email = isset($_POST['email']) ? sanitizeInput($_POST['email']) : '';
$phone = isset($_POST['phone']) ? sanitizeInput($_POST['phone']) : '';
$message = isset($_POST['message']) ? sanitizeInput($_POST['message']) : '';

// Combine first and last name
$fullName = trim($fname . ' ' . $lname);

// Log extracted values
error_log("Extracted Values:");
error_log("Name: $fullName");
error_log("Email: $email");
error_log("Phone: $phone");
error_log("Message: " . substr($message, 0, 100));

// Validate required fields
$errors = [];

if (empty($fullName) || strlen($fullName) < 2) {
    $errors[] = 'Name is required and should be at least 2 characters long.';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Please enter a valid email address.';
}

if (empty($message) || strlen($message) < 10) {
    $errors[] = 'Message is required and should be at least 10 characters long.';
}

if (!empty($errors)) {
    error_log("Validation Errors: " . implode(', ', $errors));
    sendJsonResponse('error', implode(' ', $errors));
}

try {
    // Create PHPMailer instance
    $mail = new PHPMailer(true);

    // Server settings
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp_username'];
    $mail->Password = $config['smtp_password'];
    $mail->SMTPSecure = $config['smtp_secure'];
    $mail->Port = $config['smtp_port'];

    // Enable debug output if in debug mode
    if ($config['debug_mode']) {
        $mail->SMTPDebug = SMTP::DEBUG_SERVER;
        $mail->Debugoutput = function ($str, $level) {
            error_log("PHPMailer Debug: $str");
        };
    }

    $mail->Timeout = 30;
    $mail->CharSet = 'UTF-8';

    // Recipients
    $mail->setFrom($config['from_email'], $config['from_name']);
    $mail->addReplyTo($email, $fullName);

    foreach ($config['to_emails'] as $email_address => $name) {
        $mail->addAddress($email_address, $name);
    }

    // Content
    $mail->isHTML(true);
    $mail->Subject = 'New Contact Request from ' . $fullName;

    // Build email data
    $emailData = [
        'Date' => date('F j, Y, g:i a'),
        'From' => $fullName,
        'Email' => $email
    ];

    if (!empty($phone)) {
        $emailData['Phone'] = $phone;
    }

    // Build table rows
    $table_rows = '';
    $row_class = '';
    foreach ($emailData as $label => $value) {
        $table_rows .= '<tr class="' . $row_class . '">
            <td><strong>' . htmlspecialchars($label) . '</strong></td>
            <td>' . htmlspecialchars($value) . '</td>
        </tr>';
        $row_class = $row_class === '' ? 'highlight' : '';
    }

    // HTML Email Body
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
            <h2>JACY Trading & Consulting</h2>
            <p>New Contact Request</p>
        </div>
        
        <div class="content">
            <p>Dear JACY Team,</p>
            
            <p>You have received a new contact request with the following details:</p>
            
            <table>
                <tr>
                    <th style="width: 30%;">Field</th>
                    <th>Details</th>
                </tr>
                ' . $table_rows . '
            </table>
            
            <div class="message-box">
                <h4>Message:</h4>
                <p>' . nl2br(htmlspecialchars($message)) . '</p>
            </div>
            
            <p style="margin-top: 20px;">Please respond to this inquiry within 24 hours.</p>
        </div>
        
        <div class="footer">
            <p>&copy; ' . date('Y') . ' JACY Trading & Consulting LLP. All rights reserved.</p>
            <p>Gudalur, The Nilgiris, TamilNadu - 643212</p>
        </div>
    </body>
    </html>';

    // Plain text version
    $plain_text = "New Contact Request\n\n";
    foreach ($emailData as $label => $value) {
        $plain_text .= "$label: $value\n";
    }
    $plain_text .= "\nMessage:\n$message\n\n";
    $plain_text .= "Please respond to this inquiry within 24 hours.\n\n";
    $plain_text .= "---\n";
    $plain_text .= "JACY Trading & Consulting LLP\n";
    $plain_text .= "Gudalur, The Nilgiris, TamilNadu - 643212";

    $mail->AltBody = $plain_text;

    // Send email
    if ($mail->send()) {
        error_log("Email sent successfully to: " . implode(', ', array_keys($config['to_emails'])));
        sendJsonResponse('success', 'Thank you! Your message has been sent successfully. We will respond within 24 hours.');
    } else {
        throw new Exception('Failed to send email: ' . $mail->ErrorInfo);
    }
} catch (Exception $e) {
    error_log("Email sending error: " . $e->getMessage());

    $error_message = 'Sorry, there was an error sending your message. Please try again later or contact us directly.';

    if ($config['debug_mode']) {
        $error_message .= ' Error: ' . $e->getMessage();
    }

    sendJsonResponse('error', $error_message);
}
