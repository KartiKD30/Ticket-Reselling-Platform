const nodemailer = require('nodemailer');

const env = (key, fallback = '') => (process.env[key] || fallback).trim();

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: env('MAIL_CURRENCY', 'INR'),
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (value) => {
  if (!value) return 'Not specified';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('en-IN');
};

const getSmtpConfig = () => {
  const host = env('SMTP_HOST') || env('EMAIL_HOST');
  const port = Number(env('SMTP_PORT') || env('EMAIL_PORT') || 587);
  const secure = (env('SMTP_SECURE') || env('EMAIL_SECURE') || 'false') === 'true';
  const user = env('SMTP_USER') || env('EMAIL_USER');
  const pass = env('SMTP_PASS') || env('EMAIL_PASS');
  const service = env('EMAIL_SERVICE');

  return { host, port, secure, user, pass, service };
};

let transporter;

const isEmailConfigured = () => {
  const { host, user, pass, service } = getSmtpConfig();
  return Boolean((host || service) && user && pass);
};

const getTransporter = () => {
  if (transporter) return transporter;

  const { host, port, secure, user, pass, service } = getSmtpConfig();
  const auth = { user, pass };

  transporter = service
    ? nodemailer.createTransport({ service, auth })
    : nodemailer.createTransport({ host, port, secure, auth });

  return transporter;
};

const getMailFrom = () => env('MAIL_FROM') || env('EMAIL_FROM') || env('SMTP_USER') || env('EMAIL_USER');

const sendMail = async (mailOptions) => {
  if (!isEmailConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('SMTP is not configured. Email skipped in development.');
      console.log(`Email preview: ${mailOptions.subject} -> ${mailOptions.to}`);
      return { skipped: true };
    }

    throw new Error('SMTP credentials are missing. Configure SMTP_HOST, SMTP_USER, and SMTP_PASS.');
  }

  return getTransporter().sendMail({
    from: getMailFrom(),
    replyTo: env('MAIL_REPLY_TO') || undefined,
    ...mailOptions,
  });
};

const generateOTPEmailHTML = (firstName, otp) => {
  const safeName = escapeHtml(firstName || 'there');
  const safeOtp = escapeHtml(otp);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; color: #222; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #c92a2a 0%, #ff4757 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 30px 20px; text-align: center; }
    .otp-code { font-size: 32px; font-weight: bold; color: #c92a2a; letter-spacing: 8px; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Verification Code</h1>
    </div>
    <div class="content">
      <p>Hi ${safeName},</p>
      <p>Use this code to complete your verification:</p>
      <div class="otp-code">${safeOtp}</div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Smart Ticket. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
};

const generateOTPEmailText = (firstName, otp) => `
YOUR VERIFICATION CODE

Hi ${firstName || 'there'},

Use this code to complete your verification: ${otp}

This code will expire in 10 minutes.

If you did not request this, you can ignore this email.
`.trim();

const generateBookingEmailHTML = ({ customerName, orderId, booking }) => {
  const eventName = escapeHtml(booking.event?.name || 'Event');
  const venue = escapeHtml(booking.event?.venue || booking.event?.city || 'Venue not specified');
  const seats = Array.isArray(booking.seats) ? booking.seats : [];
  const seatList = seats.map(escapeHtml).join(', ') || 'General admission';
  const total = formatCurrency(booking.total);
  const safeOrderId = escapeHtml(orderId);
  const safeName = escapeHtml(customerName || 'there');
  const method = escapeHtml(booking.method || 'Payment');
  const status = escapeHtml(booking.status || 'Confirmed');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; color: #222; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #c92a2a 0%, #ff4757 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 30px 20px; }
    .status { background: #e8f5e9; padding: 15px; text-align: center; color: #2e7d32; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; vertical-align: top; }
    .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You for Your Booking</h1>
    </div>
    <div class="status">BOOKING ${status.toUpperCase()} - #${safeOrderId}</div>
    <div class="content">
      <p>Hi ${safeName},</p>
      <p>Your booking has been confirmed.</p>
      <h3>Booking Details</h3>
      <table>
        <tbody>
          <tr><th>Event</th><td>${eventName}</td></tr>
          <tr><th>Venue</th><td>${venue}</td></tr>
          <tr><th>Date</th><td>${escapeHtml(formatDate(booking.date))}</td></tr>
          <tr><th>Time</th><td>${escapeHtml(booking.time || 'Not specified')}</td></tr>
          <tr><th>Seats</th><td>${seatList}</td></tr>
          <tr><th>Payment</th><td>${method}</td></tr>
        </tbody>
      </table>
      <div class="total">Total: ${escapeHtml(total)}</div>
      <p>Please keep this email for entry and support reference.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Smart Ticket. All rights reserved.
    </div>
  </div>
</body>
</html>
  `;
};

const generateBookingEmailText = ({ customerName, orderId, booking }) => `
BOOKING CONFIRMATION - #${orderId}

Hi ${customerName || 'there'},

Your booking has been confirmed.

Event: ${booking.event?.name || 'Event'}
Venue: ${booking.event?.venue || booking.event?.city || 'Venue not specified'}
Date: ${formatDate(booking.date)}
Time: ${booking.time || 'Not specified'}
Seats: ${Array.isArray(booking.seats) && booking.seats.length ? booking.seats.join(', ') : 'General admission'}
Payment: ${booking.method || 'Payment'}
Status: ${booking.status || 'Confirmed'}
Total: ${formatCurrency(booking.total)}

Please keep this email for entry and support reference.
`.trim();

const sendOTPEmail = async (email, otp, firstName = 'there') => {
  const info = await sendMail({
    to: email,
    subject: 'Smart Ticket OTP Verification',
    html: generateOTPEmailHTML(firstName, otp),
    text: generateOTPEmailText(firstName, otp),
  });

  if (info.skipped) {
    console.log(`Development OTP for ${email}: ${otp}`);
  }

  console.log(`OTP email ${info.skipped ? 'skipped' : 'delivered'} for ${email}`);
  return info;
};

const sendBookingConfirmationEmail = async (user, booking) => {
  const orderId = booking.receiptId || booking._id?.toString?.() || booking.id;
  const customerName = user.name || user.profile?.firstName || user.username || 'there';

  const info = await sendMail({
    to: user.email,
    subject: `Booking Confirmed - ${booking.event?.name || 'Smart Ticket'}`,
    html: generateBookingEmailHTML({ customerName, orderId, booking }),
    text: generateBookingEmailText({ customerName, orderId, booking }),
  });

  console.log(`Booking email ${info.skipped ? 'skipped' : 'delivered'} for ${user.email} - Booking: ${orderId}`);
  return info;
};

module.exports = {
  sendOTPEmail,
  sendBookingConfirmationEmail,
  generateOTPEmailHTML,
  generateOTPEmailText,
  generateBookingEmailHTML,
  generateBookingEmailText,
};
