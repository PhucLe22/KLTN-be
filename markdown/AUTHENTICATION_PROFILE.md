# Authentication System

## Overview
This document describes the authentication system implemented in the food application. The system uses JWT-based authentication for secure user access.

## Architecture Components

### 1. JWT Configuration (`config/jwt.config.js`)

#### Token Payload Structure
```javascript
{
  sub: user.id,      // User ID (JWT standard claim)
  email: user.email, // User email
  iss: "foodapp-api" // Issuer identifier
}
```

#### Token Types
- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (30 days) for token renewal

#### Security Features
- Separate secret keys for access and refresh tokens
- Configurable expiration times via environment variables
- Automatic token verification and decoding

#### Environment Variables Required
```
JWT_SECRET=your_super_secret_access_key_here
JWT_REFRESH_SECRET=your_different_super_secret_refresh_key_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
```

### 2. Authentication Middleware (`middlewares/authentication.middleware.js`)

#### Purpose
Verifies JWT tokens and extracts user payload for authenticated routes.

#### Usage
```javascript
import { authenticationMiddleware } from "../middlewares/authentication.middleware.js";

router.get("/protected", authenticationMiddleware, controllerMethod);
```

#### Process Flow
1. Extracts `Authorization: Bearer <token>` header
2. Verifies token using `verifyAccessToken()`
3. Sets `req.user` with decoded payload
4. Calls `next()` if successful, throws error if invalid

#### Error Handling
- Missing/invalid token format → `UnauthorizedException`
- Expired token → `UnauthorizedException` with specific message
- Invalid signature → `UnauthorizedException`

## Current Implementation Features

### Authentication Endpoints

#### 1. Register (`POST /auth/register`)
**Purpose**: Create new user account

**Request Body**:
```javascript
{
  email: string,
  phone: string,
  password: string,
  // Additional registration fields
}
```

**Response**:
```javascript
{
  id: string,
  email: string,
  phone: string,
  isActive: boolean,
  createdAt: string,
  updatedAt: string,
  // Additional user fields (excluding password)
}
```

#### 2. Login (`POST /auth/login`)
**Purpose**: Authenticate user and return tokens

**Request Body**:
```javascript
{
  email: string,    // Optional - either email or phone required
  phone: string,    // Optional - either email or phone required
  password: string
}
```

**Response**:
```javascript
{
  user: {
    id: string,
    email: string,
    name: string    // From customer profile
  },
  accessToken: string,
  refreshToken: string
}
```

#### 3. Get Profile (`GET /auth/me`)
**Purpose**: Retrieve current user profile

**Headers**: `Authorization: Bearer <access_token>`

**Response**:
```javascript
{
  id: string,
  email: string,
  phone: string,
  isActive: boolean,
  createdAt: string,
  updatedAt: string,
  // Additional user fields (excluding password)
}
```

## Implementation Examples

### Basic Authentication Setup
```javascript
import { authenticationMiddleware } from "../middlewares/authentication.middleware.js";

router.get("/profile", authenticationMiddleware, authController.getProfile);
```

### Service Layer Integration

#### Login with Token Generation
```javascript
async login({ email, phone, password }) {
  const user = await this.userRepo.findOne({
    where: { OR: [{ email }, { phone }].filter(Boolean) },
    include: { customer: true }
  });

  if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) {
    throw new BadRequestException("Invalid credentials or account deactivated");
  }

  const tokens = await this.generateTokens(user);
  return {
    user: { id: user.id, email: user.email, name: user.customer?.name },
    ...tokens
  };
}
```

#### Token Generation
```javascript
async generateTokens(user) {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
  };
}
```

#### Profile Access
```javascript
async getProfile(payload) {
  const user = await this.userRepo.findById(payload.userId);
  if (!user || !user.isActive) {
    throw new BadRequestException("User not found");
  }
  const { password, ...result } = user;
  return result;
}
```

## Security Best Practices

### 1. Token Management
- Use HTTPS for all API endpoints
- Implement token refresh mechanism
- Store refresh tokens securely (HTTP-only cookies recommended)
- Implement token revocation for logout scenarios

### 2. Error Handling
- Never expose internal error details to clients
- Use consistent error response format
- Log authentication failures for security monitoring

### 3. Database Security
- Store passwords with bcrypt (minimum 10 rounds)
- Implement account lockout after failed attempts
- Validate user status (`isActive`) on each request

## Common Issues and Solutions

### 1. Token Expired Errors
**Cause**: Access token exceeded 15-minute lifetime
**Solution**: Implement automatic token refresh using refresh token

### 2. Invalid Token Format
**Cause**: Missing or incorrect Authorization header
**Solution**: Ensure `Authorization: Bearer <token>` format is used

### 3. User Not Found
**Cause**: User was deleted from database but token is still valid
**Solution**: Implement proper token revocation or user status checking

## Testing Considerations

### Authentication Testing
- Test valid token scenarios
- Test expired token handling
- Test invalid token format
- Test missing token scenarios
- Test user existence validation
- Test inactive user scenarios

## Future Enhancements

### 1. Token Refresh Endpoint
Implement `/refresh-token` endpoint to exchange refresh tokens for new access tokens.

### 2. Logout/Token Revocation
Implement token blacklist or revocation mechanism for secure logout.

### 3. Multi-Factor Authentication
Add 2FA support for enhanced security.

### 4. API Rate Limiting
Implement rate limiting based on authentication status.

## Route Configuration

### Current Auth Routes
```javascript
// Public routes (no authentication required)
POST /auth/register  - Register new user
POST /auth/login     - Login user

// Protected routes (authentication required)
GET /auth/me         - Get current user profile
```

### Example Protected Routes
```javascript
// Authentication required
GET /profile         - View user profile
PUT /profile         - Update user profile
GET /orders          - View user orders
POST /orders         - Create new order
```

## Error Responses

### Authentication Errors
```javascript
// 401 Unauthorized
{
  "error": "You need to login to access this feature!"
}

// 401 Unauthorized (expired token)
{
  "error": "Your session has expired, please login again."
}

// 401 Unauthorized (invalid token)

// 400 Bad Request
{
  "error": "User not found"
}
```
