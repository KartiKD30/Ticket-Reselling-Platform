Auth

POST /api/signup/
POST /api/verify-otp/
POST /api/login/
POST /api/forgot-password/
POST /api/reset-password/
GET /api/wallet/ (requires token)

Bookings

POST /api/bookings (requires token)
GET /api/bookings (requires token)
GET /api/bookings/:id (requires token)
GET /api/bookings/occupied (requires token)
PUT /api/bookings/:id/cancel (requires token)

Resale (under bookings)

GET /api/bookings/resale/my (requires token)
POST /api/bookings/:id/resale (requires token)
DELETE /api/bookings/resale/:id (requires token)
GET /api/bookings/resale/pending (admin only)
PUT /api/bookings/resale/:id/approve (admin only)
PUT /api/bookings/resale/:id/reject (admin only)

Support

POST /api/support/tickets (requires token)
GET /api/support/tickets/my (requires token)
GET /api/support/tickets/pending (admin only)
