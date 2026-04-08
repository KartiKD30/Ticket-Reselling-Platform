import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import QRCode from 'qrcode'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Email transporter configuration
const createTransporter = () => {
  // Default to Gmail for development
  const service = process.env.EMAIL_SERVICE || 'gmail'

  if (service === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  } else if (service === 'mailtrap') {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  } else {
    // Generic SMTP
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })
  }
}

const transporter = createTransporter()

function setImageSrcForAlt(html, altText, newSrc) {
  if (!html) return html

  return html.replace(/<img\b[^>]*>/gi, (imgTag) => {
    const altPattern = new RegExp(`alt=["']${altText}["']`, 'i')
    if (!altPattern.test(imgTag)) return imgTag

    if (/\ssrc=["'][^"']*["']/i.test(imgTag)) {
      return imgTag.replace(/\ssrc=["'][^"']*["']/i, ` src="${newSrc}"`)
    }

    return imgTag.replace('<img', `<img src="${newSrc}"`)
  })
}

function injectFallbackQrSection(html, qrCid) {
  if (!html) return html

  const fallbackSection = `
  <div style="margin:20px 0;text-align:center;">
    <h3 style="font-family:Arial,sans-serif;color:#333;">Entry QR Code</h3>
    <img src="cid:${qrCid}" alt="Entry QR Code" style="width:240px;height:240px;display:inline-block;background:#fff;border:2px solid #ddd;padding:8px;" />
  </div>
  `

  if (html.includes('</body>')) {
    return html.replace('</body>', `${fallbackSection}</body>`)
  }

  return `${html}${fallbackSection}`
}

function keepOnlyFirstEntryQrImage(html) {
  if (!html) return html

  let seen = false
  return html.replace(/<img\b[^>]*alt=["']Entry QR Code["'][^>]*>/gi, (imgTag) => {
    if (seen) return ''
    seen = true
    return imgTag
  })
}

// Verify transporter on startup
const verifyTransporter = async () => {
  try {
    await transporter.verify()
    console.log('✅ Email transporter verified and ready')
  } catch (error) {
    console.error('❌ Email transporter verification failed:', error.message)
    if (process.env.EMAIL_SERVICE === 'gmail') {
      console.error('   Make sure your Gmail credentials in .env are correct')
      console.error('   For Gmail: Use an "App Password" not your regular password')
    }
  }
}

verifyTransporter()

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    emailService: process.env.EMAIL_SERVICE || 'gmail'
  })
})

// Verify email service endpoint
app.get('/api/emails/verify', async (req, res) => {
  try {
    await transporter.verify()
    res.json({
      success: true,
      message: 'Email service is connected and ready',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Email service verification failed:', error.message)
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

// Send welcome email endpoint
app.post('/api/emails/send-welcome', async (req, res) => {
  const { to, firstName, subject, html, text } = req.body

  // Validation
  if (!to || !firstName || !subject || !html) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: to, firstName, subject, html',
      timestamp: new Date().toISOString()
    })
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(to)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email address',
      timestamp: new Date().toISOString()
    })
  }

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      replyTo: process.env.EMAIL_REPLY_TO || 'support@example.com'
    }

    const info = await transporter.sendMail(mailOptions)

    console.log(`[${new Date().toISOString()}] Welcome email sent to ${to} - Message ID: ${info.messageId}`)

    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Welcome email sent successfully',
      recipient: to,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to send welcome email to ${to}:`, error.message)

    res.status(500).json({
      success: false,
      error: error.message,
      recipient: to,
      timestamp: new Date().toISOString()
    })
  }
})

// Send purchase confirmation email endpoint
app.post('/api/emails/send-purchase-confirmation', async (req, res) => {
  const {
    to,
    orderId,
    customerName,
    customerEmail,
    orderDate,
    items,
    totalAmount,
    qrCode,
    qrCodeDataURL,
    qrCodeContent,
    subject,
    html,
    text
  } = req.body

  const effectiveQRCode = qrCodeDataURL || qrCode

  // Validation
  if (!to || !orderId || !customerName || !items || !totalAmount) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: to, orderId, customerName, items, totalAmount',
      timestamp: new Date().toISOString()
    })
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(to)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email address',
      timestamp: new Date().toISOString()
    })
  }

  try {
    let finalHtml = html || generatePurchaseEmailHTML(customerEmail || to, customerName, orderId, orderDate, items, totalAmount, effectiveQRCode)
    let attachments = []

    // Use the exact QR image produced on frontend (same as preview/PDF) when available.
    // Only generate on backend as a fallback if image data is missing.
    let qrImageForEmail = effectiveQRCode
    if ((!qrImageForEmail || typeof qrImageForEmail !== 'string') && qrCodeContent && typeof qrCodeContent === 'string') {
      qrImageForEmail = await QRCode.toDataURL(qrCodeContent, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 768,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      if (effectiveQRCode && finalHtml.includes(effectiveQRCode)) {
        finalHtml = finalHtml.replaceAll(effectiveQRCode, qrImageForEmail)
      }
    }

    // Many email clients do not reliably render large data-URL images.
    // Convert QR data URL to an inline CID attachment for consistent display.
    if (qrImageForEmail && typeof qrImageForEmail === 'string' && qrImageForEmail.startsWith('data:image/')) {
      const dataUrlMatch = qrImageForEmail.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)

      if (dataUrlMatch) {
        const mimeType = dataUrlMatch[1]
        const base64Data = dataUrlMatch[2]
        const extension = mimeType.split('/')[1] || 'png'
        const qrCid = `ticket-qr-${Date.now()}@mail`

        attachments.push({
          filename: `ticket-qr.${extension}`,
          content: base64Data,
          encoding: 'base64',
          contentType: mimeType,
          cid: qrCid,
          contentDisposition: 'inline'
        })

        // 1) Replace exact data URL if present
        finalHtml = finalHtml.replaceAll(qrImageForEmail, `cid:${qrCid}`)

        // 2) Replace common data URL img sources
        finalHtml = finalHtml.replace(/src=["']data:image\/[a-zA-Z0-9.+-]+;base64,[^"']+["']/gi, `src="cid:${qrCid}"`)

        // 3) Force QR img by known alt text to use cid source
        finalHtml = setImageSrcForAlt(finalHtml, 'Entry QR Code', `cid:${qrCid}`)

        // 4) Ensure at least one QR image exists in final HTML.
        if (!finalHtml.includes(`cid:${qrCid}`)) {
          finalHtml = injectFallbackQrSection(finalHtml, qrCid)
        }

        // 5) Keep only a single visible Entry QR image.
        finalHtml = keepOnlyFirstEntryQrImage(finalHtml)
      }
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'orders@example.com',
      to,
      subject: subject || `Order Confirmed! 🛍️ Order #${orderId}`,
      html: finalHtml,
      text: text || generatePurchaseEmailText(customerEmail || to, customerName, orderId, orderDate, items, totalAmount),
      replyTo: process.env.EMAIL_REPLY_TO || 'orders@example.com',
      attachments
    }

    const info = await transporter.sendMail(mailOptions)

    console.log(`[${new Date().toISOString()}] Purchase confirmation email sent to ${to} - Order: ${orderId} - Message ID: ${info.messageId}`)

    res.json({
      success: true,
      messageId: info.messageId,
      message: 'Purchase confirmation email sent successfully',
      orderId,
      recipient: to,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to send purchase confirmation email to ${to} for order ${orderId}:`, error.message)

    res.status(500).json({
      success: false,
      error: error.message,
      orderId,
      recipient: to,
      timestamp: new Date().toISOString()
    })
  }
})

// Send OTP email endpoint
app.post('/api/emails/send-otp', async (req, res) => {
  const { to, otp, firstName } = req.body

  // Validation
  if (!to || !otp) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: to, otp',
      timestamp: new Date().toISOString()
    })
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(to)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email address',
      timestamp: new Date().toISOString()
    })
  }

  // OTP validation (should be 6 digits)
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      error: 'OTP must be 6 digits',
      timestamp: new Date().toISOString()
    })
  }

  try {
    const subject = 'Your Verification Code - Complete Registration'
    const html = generateOTPEmailHTML(firstName || 'there', otp)
    const text = generateOTPEmailText(firstName || 'there', otp)

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@example.com',
      to,
      subject,
      html,
      text,
      replyTo: process.env.EMAIL_REPLY_TO || 'support@example.com'
    }

    const info = await transporter.sendMail(mailOptions)

    console.log(`[${new Date().toISOString()}] OTP email sent to ${to} - Message ID: ${info.messageId}`)

    res.json({
      success: true,
      messageId: info.messageId,
      message: 'OTP email sent successfully',
      recipient: to,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Failed to send OTP email to ${to}:`, error.message)
    
    // More detailed error logging for debugging
    if (error.message.includes('PLAIN')) {
      console.error('   ⚠️  Authentication error - check EMAIL_USER and EMAIL_PASS in .env')
      console.error('   For Gmail: Make sure you\'re using an App Password, not your regular password')
    }

    res.status(500).json({
      success: false,
      error: error.message,
      recipient: to,
      timestamp: new Date().toISOString()
    })
  }
})

// QR Code validation endpoint
app.post('/api/qr/validate', async (req, res) => {
  const { qrContent, orderId } = req.body

  // Validation
  if (!qrContent || !orderId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: qrContent, orderId',
      timestamp: new Date().toISOString()
    })
  }

  try {
    // Parse QR content (assuming it's JSON)
    let qrData
    try {
      qrData = JSON.parse(qrContent)
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid QR code content format',
        timestamp: new Date().toISOString()
      })
    }

    // Validate QR data
    if (qrData.orderId !== orderId) {
      return res.status(400).json({
        success: false,
        error: 'QR code does not match order',
        timestamp: new Date().toISOString()
      })
    }

    // Check expiration
    const expirationTime = new Date(qrData.expirationTime)
    const now = new Date()

    if (now > expirationTime) {
      return res.json({
        success: false,
        valid: false,
        expired: true,
        message: 'QR code has expired',
        orderId,
        timestamp: new Date().toISOString()
      })
    }

    // QR is valid
    res.json({
      success: true,
      valid: true,
      expired: false,
      message: 'QR code is valid',
      orderId,
      expiresAt: qrData.expirationTime,
      timeRemaining: Math.max(0, expirationTime - now),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error(`[${new Date().toISOString()}] QR validation error for order ${orderId}:`, error.message)

    res.status(500).json({
      success: false,
      error: error.message,
      orderId,
      timestamp: new Date().toISOString()
    })
  }
})

// Verify OTP endpoint
app.post('/api/otp/verify', async (req, res) => {
  const { email, otp } = req.body

  // Validation
  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: email, otp',
      timestamp: new Date().toISOString()
    })
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email address',
      timestamp: new Date().toISOString()
    })
  }

  // OTP validation
  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      error: 'OTP must be 6 digits',
      timestamp: new Date().toISOString()
    })
  }

  try {
    // For demo purposes, accept '123456' as valid OTP
    // In production, you would check against a database or cache
    const isValid = otp === '123456'

    if (isValid) {
      res.json({
        success: true,
        valid: true,
        message: 'OTP verified successfully',
        email,
        timestamp: new Date().toISOString()
      })
    } else {
      res.status(400).json({
        success: false,
        valid: false,
        message: 'Invalid OTP',
        email,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error(`[${new Date().toISOString()}] OTP verification error for ${email}:`, error.message)

    res.status(500).json({
      success: false,
      error: error.message,
      email,
      timestamp: new Date().toISOString()
    })
  }
})

// Helper functions for email templates

function generatePurchaseEmailHTML(userEmail, customerName, orderId, orderDate, items, totalAmount, qrCode) {
  const itemsHTML = items.map(item =>
    `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`
  ).join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #c92a2a 0%, #ff4757 100%); color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 30px 20px; }
    .status { background: #e8f5e9; padding: 15px; text-align: center; color: #2e7d32; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
    .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
    .qr-section { text-align: center; margin: 30px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🛍️ Thank You for Your Purchase!</h1>
    </div>

    <div class="status">✓ ORDER CONFIRMED - #${orderId}</div>

    <div class="content">
      <p>Hi ${customerName},</p>
      <p>Your order has been confirmed and is being processed.</p>

      <h3>Order Details:</h3>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align: center;">Quantity</th>
            <th style="text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <div class="total">
        Total: $${totalAmount.toFixed(2)}
      </div>

      ${qrCode ? `
      <div class="qr-section">
        <h3>📱 Your Verification QR Code</h3>
        <p>This QR code is valid for 3 minutes only</p>
        <div style="background: #f0f0f0; padding: 20px; display: inline-block; border-radius: 8px;">
          ${qrCode.startsWith('data:') ? `<img src="${qrCode}" alt="Order QR Code" style="max-width: 240px; width: 100%; height: auto; display: block; border-radius: 8px;" />` : `<pre style="white-space: pre-wrap; word-break: break-word; padding: 12px; background: #fff; border-radius: 8px;">${qrCode}</pre>`}
        </div>
      </div>
      ` : ''}

      <p>Thank you for shopping with us!</p>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} Your Shop. All rights reserved.
    </div>
  </div>
</body>
</html>
  `
}

function generatePurchaseEmailText(userEmail, customerName, orderId, orderDate, items, totalAmount) {
  const itemsText = items.map(item =>
    `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`
  ).join('\n')

  return `
ORDER CONFIRMATION - #${orderId}

Hi ${customerName},

Your order has been confirmed and is being processed.

ORDER DETAILS:
Order Number: #${orderId}
Order Date: ${new Date(orderDate).toLocaleDateString()}
Email: ${userEmail}
Status: Confirmed ✓

${itemsText}

TOTAL: $${totalAmount.toFixed(2)}

A verification QR code is included with your order confirmation.

Thank you for shopping with us!

© ${new Date().getFullYear()} Your Shop. All rights reserved.
  `.trim()
}

function generateOTPEmailHTML(firstName, otp) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
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
      <h1>🔐 Your Verification Code</h1>
    </div>

    <div class="content">
      <p>Hi ${firstName},</p>
      <p>Use this code to complete your registration:</p>
      <div class="otp-code">${otp}</div>
      <p>This code will expire in 5 minutes.</p>
    </div>

    <div class="footer">
      © ${new Date().getFullYear()} Your Platform. All rights reserved.
    </div>
  </div>
</body>
</html>
  `
}

function generateOTPEmailText(firstName, otp) {
  return `
YOUR VERIFICATION CODE

Hi ${firstName},

Use this code to complete your registration: ${otp}

This code will expire in 5 minutes.

© ${new Date().getFullYear()} Your Platform. All rights reserved.
  `.trim()
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Server error:`, error)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`)
})