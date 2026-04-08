# Smart Ticket Backend API

## Base URL
```
http://localhost:8000/api
```

## Authentication Endpoints

### 1. Signup
**POST** `/signup/`

Create a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "message": "Signup successful. OTP sent to your email.",
  "username": "john_doe"
}
```

**Error Responses:**
- `400` - Email already registered / Username already taken
- `400` - Invalid input (username, email, or password)
- `500` - Server error

---

### 2. Verify OTP
**POST** `/verify-otp/`

Verify the OTP sent to user's email after signup.

**Request Body:**
```json
{
  "username": "john_doe",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "message": "Email verified successfully",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "john_doe"
}
```

**Error Responses:**
- `400` - Invalid or expired OTP
- `400` - User not found
- `500` - Server error

---

### 3. Login
**POST** `/login/`

Login with username and password.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "john_doe"
}
```

**Error Responses:**
- `400` - Username and password are required
- `401` - Invalid username or password
- `401` - Email not verified
- `500` - Server error

---

### 4. Forgot Password
**POST** `/forgot-password/`

Request a password reset OTP.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "message": "OTP sent to your email",
  "email": "john@example.com"
}
```

**Error Responses:**
- `400` - Email is required
- `400` - Email not found
- `500` - Server error

---

### 5. Reset Password
**POST** `/reset-password/`

Reset password using OTP.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "new_password": "newpassword123"
}
```

**Success Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

**Error Responses:**
- `400` - Email, OTP, and new password are required
- `400` - Invalid or expired OTP
- `400` - User not found
- `500` - Server error

---

## Testing with cURL

### Signup
```bash
curl -X POST http://localhost:8000/api/signup/ \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","email":"john@example.com","password":"password123"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:8000/api/verify-otp/ \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","otp":"123456"}'
```

### Login
```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"password123"}'
```

### Forgot Password
```bash
curl -X POST http://localhost:8000/api/forgot-password/ \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'
```

### Reset Password
```bash
curl -X POST http://localhost:8000/api/reset-password/ \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","otp":"123456","new_password":"newpassword123"}'
```

---

## Testing with Postman

1. Open Postman
2. Create a new collection: "Smart Ticket API"
3. Add the following requests:

### Request 1: Signup
- **Method**: POST
- **URL**: `http://localhost:8000/api/signup/`
- **Headers**: `Content-Type: application/json`
- **Body**: 
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

### Request 2: Verify OTP
- **Method**: POST
- **URL**: `http://localhost:8000/api/verify-otp/`
- **Headers**: `Content-Type: application/json`
- **Body**: 
  ```json
  {
    "username": "john_doe",
    "otp": "123456"
  }
  ```
  Note: Check server console for the generated OTP

### Request 3: Login
- **Method**: POST
- **URL**: `http://localhost:8000/api/login/`
- **Headers**: `Content-Type: application/json`
- **Body**: 
  ```json
  {
    "username": "john_doe",
    "password": "password123"
  }
  ```

---

## Authentication Token Usage

After login or OTP verification, you receive an `access` token:

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Use this token in protected routes:**

```bash
curl http://localhost:8000/api/protected-route \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Or:

```bash
curl http://localhost:8000/api/protected-route \
  -H "Authorization: YOUR_ACCESS_TOKEN"
```

**Token Expiry**: 7 days

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication failed |
| 404 | Not Found - Route not found |
| 500 | Internal Server Error |

---

## Notes

- **OTP Validity**: 10 minutes
- **Passwords**: Minimum 6 characters, hashed with bcrypt
- **Usernames**: Minimum 3 characters, must be unique
- **Emails**: Must be valid format and unique
- **JWT Token**: Valid for 7 days
- **OTP in Logs**: For development, OTP is logged to console
