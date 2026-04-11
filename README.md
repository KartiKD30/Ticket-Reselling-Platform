# Unified Ticket Reselling Platform

A comprehensive ticket reselling platform that brings together event organizers, administrators, and users with separate dashboards while sharing a unified backend.

## Architecture

This platform consists of **four separate applications** that work together:

1. **Backend Server** (Port 5000) - Unified API for all modules
2. **User Dashboard** (Port 5173) - Customer ticket booking interface
3. **Admin Dashboard** (Port 3001) - Administrative control panel
4. **Organizer Dashboard** (Port 3002) - Event management interface

## Features

### For Users (Port 5173)
- Browse and search events
- Secure ticket purchasing
- Digital ticket delivery
- Wallet management
- Profile management
- Booking history
- Original UI preserved exactly as before

### For Organizers (Port 3002)
- Create and manage events
- Track ticket sales
- Analytics and reporting
- Payout management
- Promotional codes
- Original UI preserved exactly as before

### For Administrators (Port 3001)
- User management
- Event oversight
- Financial reporting
- System monitoring
- Security settings
- Original admin portal login preserved

## Tech Stack

### Backend (Shared)
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **nodemailer** for email notifications

### Frontend (Separate Apps)
- **React.js** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hot Toast** for notifications

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd unified-ticket-platform
   ```

2. **Install all dependencies**
   ```bash
   # Install backend dependencies
   npm install

   # Install user dashboard dependencies
   cd client && npm install && cd ..

   # Install admin dashboard dependencies  
   cd admin-app && npm install && cd ..

   # Install organizer dashboard dependencies
   cd organizer-app && npm install && cd ..
   ```

3. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit .env with your configuration
   nano .env
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run all applications**
   
   **Option A: Use startup script (Recommended)**
   ```bash
   # Windows
   start-all.bat

   # Linux/Mac
   chmod +x start-all.sh
   ./start-all.sh
   ```

   **Option B: Start manually**
   ```bash
   # Terminal 1: Start backend
   node server.js

   # Terminal 2: Start user dashboard
   cd client && npm run dev

   # Terminal 3: Start admin dashboard  
   cd admin-app && npm run dev

   # Terminal 4: Start organizer dashboard
   cd organizer-app && npm run dev
   ```

6. **Access the applications**
   - **User Dashboard**: http://localhost:5173
   - **Admin Dashboard**: http://localhost:3001
   - **Organizer Dashboard**: http://localhost:3002
   - **Backend API**: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/signup/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/verify-otp/` - Email verification

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event (organizer)
- `GET /api/events/:id` - Get event details

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics` - Get system analytics
- `PUT /api/admin/users/:id` - Update user

## Project Structure

```
unified-ticket-platform/
├── server.js                 # Main server file
├── package.json              # Backend dependencies
├── .env.example             # Environment template
├── models/                  # MongoDB models
│   ├── User.js
│   ├── Event.js
│   ├── Booking.js
│   └── ...
├── routes/                  # API routes
│   ├── auth.js
│   ├── events.js
│   ├── bookings.js
│   └── ...
├── controllers/             # Route controllers
│   ├── authController.js
│   ├── bookingController.js
│   └── ...
├── middleware/              # Custom middleware
│   ├── auth.js
│   └── validation.js
├── utils/                   # Utility functions
│   ├── token.js
│   └── otp.js
└── client/                  # React frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ticket_resale_unified

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Server
PORT=5000
NODE_ENV=development

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run client` - Start frontend development server
- `npm run client:build` - Build frontend for production
- `npm run install-all` - Install all dependencies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository.
