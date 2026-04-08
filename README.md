# Email Template Backend API

A Node.js/Express backend server that handles email sending for the email template system. Supports multiple email services and provides RESTful endpoints for sending welcome emails, purchase confirmations, OTP codes, and QR code validation.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env` and update with your email service credentials:

```bash
cp .env .env.local
```

Edit `.env.local` with your actual credentials.

### 3. Start the Server
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

The server will start on `http://localhost:3001`

## 📧 Supported Email Services

### 1. Gmail (Default - Easiest Setup)
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Get App Password:**
1. Enable 2-Factor Authentication on Gmail
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Copy the 16-character password

### 2. Mailtrap (Development/Testing)
```env
EMAIL_SERVICE=mailtrap
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASS=your-mailtrap-password
```

**Setup:**
1. Sign up at https://mailtrap.io
2. Create an inbox
3. Copy SMTP credentials

### 3. SendGrid (Production)
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
```

### 4. Mailgun (Production)
```env
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=key-xxxxxxxxxxxx
MAILGUN_DOMAIN=mg.example.com
```

### 5. AWS SES (High Volume)
```env
EMAIL_SERVICE=aws-ses
AWS_ACCESS_KEY_ID=xxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxx
AWS_SES_REGION=us-east-1
```

## 🔗 API Endpoints

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "message": "Backend server is running",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "emailService": "gmail"
}
```

### Verify Email Service
```http
GET /api/emails/verify
```

**Response:**
```json
{
  "success": true,
  "message": "Email service is connected and ready",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Send Welcome Email
```http
POST /api/emails/send-welcome
```

**Request Body:**
```json
{
  "to": "user@example.com",
  "firstName": "John",
  "subject": "Welcome to Our Platform!",
  "html": "<h1>Welcome!</h1>",
  "text": "Welcome!"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "1234567890@example.com",
  "message": "Welcome email sent successfully",
  "recipient": "user@example.com",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Send Purchase Confirmation Email
```http
POST /api/emails/send-purchase-confirmation
```

**Request Body:**
```json
{
  "to": "customer@example.com",
  "orderId": "ORD-12345",
  "customerName": "John Doe",
  "items": [
    {
      "name": "Wireless Headphones",
      "quantity": 1,
      "price": 129.99
    }
  ],
  "totalAmount": 129.99,
  "qrCode": "optional-qr-data"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "1234567890@example.com",
  "message": "Purchase confirmation email sent successfully",
  "orderId": "ORD-12345",
  "recipient": "customer@example.com",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Send OTP Email
```http
POST /api/emails/send-otp
```

**Request Body:**
```json
{
  "to": "user@example.com",
  "firstName": "John",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "1234567890@example.com",
  "message": "OTP email sent successfully",
  "recipient": "user@example.com",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Validate QR Code
```http
POST /api/qr/validate
```

**Request Body:**
```json
{
  "qrContent": "{\"orderId\":\"ORD-12345\",\"expirationTime\":\"2024-01-01T12:05:00.000Z\"}",
  "orderId": "ORD-12345"
}
```

**Response (Valid):**
```json
{
  "success": true,
  "valid": true,
  "expired": false,
  "message": "QR code is valid",
  "orderId": "ORD-12345",
  "expiresAt": "2024-01-01T12:05:00.000Z",
  "timeRemaining": 180000,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Response (Expired):**
```json
{
  "success": false,
  "valid": false,
  "expired": true,
  "message": "QR code has expired",
  "orderId": "ORD-12345",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## 🧪 Testing

### Test Email Service
```bash
curl http://localhost:3001/api/emails/verify
```

### Send Test Welcome Email
```bash
curl -X POST http://localhost:3001/api/emails/send-welcome \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "firstName": "Test User",
    "subject": "Test Welcome Email",
    "html": "<h1>Welcome to our platform!</h1>",
    "text": "Welcome to our platform!"
  }'
```

### Send Test Purchase Email
```bash
curl -X POST http://localhost:3001/api/emails/send-purchase-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "to": "customer@example.com",
    "orderId": "TEST-123",
    "customerName": "Test Customer",
    "items": [
      {"name": "Test Product", "quantity": 1, "price": 29.99}
    ],
    "totalAmount": 29.99
  }'
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EMAIL_SERVICE` | Email service to use | `gmail` |
| `EMAIL_USER` | SMTP username | - |
| `EMAIL_PASS` | SMTP password | - |
| `EMAIL_HOST` | SMTP host | - |
| `EMAIL_PORT` | SMTP port | - |
| `EMAIL_SECURE` | Use SSL/TLS | `false` |
| `EMAIL_FROM` | From email address | `noreply@example.com` |
| `EMAIL_REPLY_TO` | Reply-to email address | `support@example.com` |
| `PORT` | Server port | `3001` |

### CORS Configuration

The server includes CORS middleware to allow requests from the frontend. In production, you may want to restrict this to your domain:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
```

## 📊 Logging

The server logs all email sending activities:

```
[2024-01-01T12:00:00.000Z] Welcome email sent to user@example.com - Message ID: 1234567890@example.com
[2024-01-01T12:00:00.000Z] Purchase confirmation email sent to customer@example.com - Order: ORD-12345
```

## 🚀 Deployment

### Environment Setup
1. Set all required environment variables
2. Ensure email service credentials are valid
3. Test email sending before deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Email service credentials valid
- [ ] CORS configured for production domain
- [ ] SSL/HTTPS enabled
- [ ] Rate limiting implemented
- [ ] Error monitoring set up
- [ ] Backup email service configured

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Common Issues

**"Invalid Credentials"**
- Verify email service credentials
- For Gmail, ensure you're using an App Password, not your regular password

**"ENOTFOUND smtp.gmail.com"**
- Check internet connection
- Verify SMTP server address

**"Email not being delivered"**
- Check spam/junk folder
- Verify recipient email address
- Check email service dashboard (Mailtrap, SendGrid, etc.)

**CORS Errors**
- Ensure frontend is running on the correct port
- Check CORS configuration in the server

## 📞 Support

For issues with:
- **Email delivery** → Check your email service provider's documentation
- **API endpoints** → Review the endpoint documentation above
- **Configuration** → Verify your `.env` file settings
- **Logs** → Check server console output for error messages

---

**The backend server is now ready to handle all email sending for your frontend application!** 🚀