# Aegis+ Safety API Backend

A comprehensive safety and emergency response API built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **User Authentication**: JWT-based authentication with refresh tokens
- **Email Verification**: Secure email verification using Nodemailer
- **Device Management**: Register and manage push notification devices
- **Push Notifications**: Firebase Cloud Messaging (FCM) integration for real-time alerts
- **Safety Circle**: Manage trusted contacts for emergency situations
- **SOS Alerts**: Trigger and manage emergency SOS alerts with location tracking
- **Incident Reporting**: Report and track safety incidents with geospatial queries
- **Activity Logging**: Comprehensive audit trail of user activities
- **Pagination**: Efficient pagination for all list endpoints

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Firebase project (for push notifications)
- SMTP server (for email verification)

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=8089
NODE_ENV=development

# Database
MONGODB_URL=mongodb://localhost:27017/aegis

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=15m
JWT_COOKIE_EXPIRE=30

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Rate Limiting
DISABLE_RATE_LIMIT=false

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@aegis.com
FRONTEND_URL=http://localhost:3000

# Firebase Configuration (for Push Notifications)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id",...}
```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Cloud Messaging API
3. Generate a service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file
4. Copy the JSON content and set it as `FIREBASE_SERVICE_ACCOUNT_KEY` in your `.env` file

### Email Setup

For Gmail:
1. Enable 2-Factor Authentication
2. Generate an App Password:
   - Go to Google Account > Security
   - Select "App Passwords"
   - Generate a new password for "Mail"
3. Use the app password as `SMTP_PASS`

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

The API will be available at `http://localhost:8089`

## API Endpoints

### Authentication

- `POST /api/v1/users` - Register a new user
- `POST /api/v1/users/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/send-verification` - Send email verification
- `POST /api/v1/auth/verify-email` - Verify email address

### Users

- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update user profile
- `POST /api/v1/users/change-password` - Change password

### Contacts

- `POST /api/v1/contacts` - Add a contact
- `GET /api/v1/contacts` - Get user contacts (paginated)
- `PUT /api/v1/contacts/:id` - Update contact
- `DELETE /api/v1/contacts/:id` - Delete contact

### Safety Circle

- `POST /api/v1/safety-circle` - Add contact to safety circle
- `GET /api/v1/safety-circle` - Get safety circle members
- `PUT /api/v1/safety-circle/:id/status` - Update member status
- `PUT /api/v1/safety-circle/:id/location` - Update member location
- `DELETE /api/v1/safety-circle/:id` - Remove from safety circle

### Alerts (SOS)

- `POST /api/v1/alerts/trigger` - Trigger SOS alert
- `GET /api/v1/alerts` - Get user alerts (paginated)
- `PUT /api/v1/alerts/:id/resolve` - Resolve alert

### Incidents

- `POST /api/v1/incidents` - Report an incident
- `GET /api/v1/incidents` - Get user incidents (paginated)
- `GET /api/v1/incidents/public` - Get public incidents (paginated)
- `GET /api/v1/incidents/nearby` - Get nearby incidents (geospatial)
- `GET /api/v1/incidents/risk-zones` - Get risk zones (geospatial aggregation)
- `PUT /api/v1/incidents/:id` - Update incident
- `DELETE /api/v1/incidents/:id` - Delete incident

### Notifications

- `GET /api/v1/notifications` - Get user notifications (paginated)
- `PUT /api/v1/notifications/:id/read` - Mark notification as read

### Activities

- `GET /api/v1/activities` - Get user activities (paginated)

### Devices (Push Notifications)

- `POST /api/v1/devices/register` - Register device for push notifications
- `GET /api/v1/devices` - Get user devices
- `DELETE /api/v1/devices/remove` - Remove device

### Admin

- `GET /api/v1/admin/users` - Get all users (admin only)
- `GET /api/v1/admin/activities` - Get all activities (admin only)

## Pagination

All list endpoints support pagination:

```
GET /api/v1/contacts?page=1&limit=10
```

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response includes metadata:
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "totalPages": 10,
    "page": 1,
    "limit": 10
  }
}
```

## Push Notifications

### Registering a Device

```bash
POST /api/v1/devices/register
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "token": "device_fcm_token",
  "platform": "ios",
  "deviceName": "iPhone 13"
}
```

### Notification Types

The system sends push notifications for:

1. **SOS Alerts**: When a safety circle member triggers an SOS
2. **Safety Circle Updates**: When contacts are added/removed
3. **Incident Reports**: When new incidents are reported nearby

## Geospatial Queries

### Nearby Incidents

Find incidents within a specified radius:

```
GET /api/v1/incidents/nearby?latitude=40.7128&longitude=-74.0060&radius=5000
```

- `latitude`: Center latitude
- `longitude`: Center longitude
- `radius`: Radius in meters (default: 5000)

### Risk Zones

Get aggregated incident data by category:

```
GET /api/v1/incidents/risk-zones?latitude=40.7128&longitude=-74.0060&radius=10000
```

## Email Verification

Users must verify their email before accessing protected resources (in production mode).

1. Send verification email:
```bash
POST /api/v1/auth/send-verification
{
  "email": "user@example.com"
}
```

2. Verify email:
```bash
POST /api/v1/auth/verify-email
{
  "token": "verification_token_from_email"
}
```

## Security Features

- JWT token authentication
- Refresh token rotation
- Rate limiting
- CORS protection
- XSS protection
- Email verification enforcement
- Activity logging
- Password hashing with bcrypt

## Database IndexesThe application automatically creates MongoDB indexes on startup:
- User: email, username
- Contact: userId + phoneNumber (unique)
- Incident: location (2dsphere), userId, status
- Device: userId + isActive, token (unique)
- And more...

## Testing

```bash
npm test
```

## Project Structure

```
src/
├── configs/          # Configuration files
├── controllers/      # Request handlers
├── dtos/            # Data Transfer Objects with validation
├── exceptions/      # Custom exceptions
├── middlewares/     # Express middlewares
├── models/          # Mongoose models
├── repositories/     # Data access layer
├── routes/          # API routes
├── services/        # Business logic
├── templates/      # Email templates
├── utils/          # Utility functions
└── database/       # Database connection
```

## License

MIT
