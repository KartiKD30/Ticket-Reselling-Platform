# Backend Setup Guide

## Prerequisites

### 1. Install MongoDB

#### Windows
- **Community Edition**: Download from https://www.mongodb.com/try/download/community
- **Chocolatey**: Run `choco install mongodb-community` (if you have Chocolatey installed)
- **MongoDB Atlas (Cloud)**: Create a free cluster at https://www.mongodb.com/cloud/atlas

#### macOS
- **Homebrew**: Run `brew install mongodb-community`
- **MongoDB Atlas**: Create a free cluster at https://www.mongodb.com/cloud/atlas

#### Linux (Ubuntu)
```bash
sudo apt-get install -y mongodb
```

### 2. Start MongoDB (Local)

#### Windows
```bash
# Run MongoDB service (if installed as service)
net start MongoDB

# Or run mongod directly
mongod --dbpath "C:\data\db"
```

#### macOS/Linux
```bash
mongod
```

### 3. MongoDB Atlas (Cloud Alternative)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `.env` with our connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartticket?retryWrites=true&w=majority
   ```

## Environment Variables

Edit `.env`:
```
MONGODB_URI=mongodb://localhost:27017/smartticket
JWT_SECRET=your_jwt_secret_key_change_this_in_production
OTP_EXPIRY=600000
PORT=8000
NODE_ENV=development
```

## Running the Backend

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### Public Routes
- `POST /api/signup/` - Register a new user
- `POST /api/verify-otp/` - Verify OTP after signup
- `POST /api/login/` - Login with username and password
- `POST /api/forgot-password/` - Request password reset OTP
- `POST /api/reset-password/` - Reset password with OTP

### Testing
- `GET /health` - Check if server is running

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, min 3 chars),
  email: String (unique, valid email),
  password: String (hashed with bcrypt, min 6 chars),
  isVerified: Boolean (default: false),
  otp: {
    code: String,
    expiresAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Project Structure
```
backend/
├── config/
│   └── db.js           # MongoDB connection
├── controllers/
│   └── authController.js # Auth logic
├── middleware/
│   ├── auth.js         # Token verification
│   └── validation.js   # Input validation
├── models/
│   └── User.js         # User schema
├── routes/
│   └── auth.js         # Auth routes
├── utils/
│   ├── otp.js          # OTP generation
│   └── token.js        # JWT generation
├── .env                # Environment variables
├── package.json
└── server.js           # Main server file
```

## Notes

- OTP is valid for 10 minutes
- JWT tokens expire after 7 days
- All passwords are hashed with bcrypt (10 salt rounds)
- Email notifications are implemented (implement Nodemailer for real emails)
