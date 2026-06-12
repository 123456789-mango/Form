# Security Features Documentation

## Overview
This application includes comprehensive security features to protect user data and maintain system integrity.

## Security Features Implemented

### 1. **Authentication & Authorization**
- **JWT Tokens**: 
  - Access tokens (1-hour expiry)
  - Refresh tokens (7-day expiry)
- **Role-Based Access Control (RBAC)**:
  - Admin role with full access
  - User role with limited access
  - Custom roles with granular permissions
- **Password Security**:
  - Bcryptjs hashing with salt rounds
  - Minimum password requirements enforced
  - Secure password change endpoint

### 2. **Session Management**
- **Inactivity Logout**: Auto-logout after 15 minutes of inactivity
- **Activity Tracking**: Last activity timestamp recorded
- **Token Refresh**: Automatic token refresh before expiry
- **Session Invalidation**: Clear refresh token on logout

### 3. **Data Protection**
- **Password Hashing**: Never stored in plain text
- **Refresh Tokens**: Stored securely in database
- **Sensitive Data Exclusion**: Passwords and tokens never exposed in API responses

### 4. **Code Quality & Integrity**
- **Husky Pre-commit Hooks**: Prevent error code from being committed
- **ESLint Configuration**: Enforces code standards
- **Lint-staged**: Only lint staged files before commit

### 5. **API Security**
- **Authentication Middleware**: All protected routes require valid JWT
- **Admin-Only Endpoints**: Sensitive operations require admin role
- **CORS Configuration**: Cross-origin requests properly handled
- **Error Handling**: Sanitized error messages (no sensitive info leaked)

### 6. **Database Security**
- **Model-Level Validation**: Mongoose schema validation
- **Unique Constraints**: Prevent duplicate usernames
- **Active User Checks**: Disabled accounts cannot log in

## Setup Instructions

### 1. Install Husky
```bash
npm install
npm run prepare
```

### 2. Environment Variables
Create `.env` file with:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
REFRESH_SECRET=your_refresh_secret
ADMIN_API_KEY=your_admin_api_key
```

### 3. Pre-commit Hooks
Husky automatically hooks into git commits. Files with errors will be blocked:
```bash
git add .
git commit -m "Your message"  # Will run lint checks automatically
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and invalidate session
- `POST /api/auth/register` - Create new user (admin key required)

### Users
- `GET /api/users/me` - Get current user profile
- `GET /api/users` - List all users (admin only)
- `POST /api/users` - Create new user (admin only)
- `PUT /api/users/me` - Update own profile
- `PUT /api/users/me/password` - Change password
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Roles
- `GET /api/roles` - List all roles (admin only)
- `POST /api/roles` - Create role (admin only)
- `PUT /api/roles/:id` - Update role (admin only)
- `DELETE /api/roles/:id` - Delete role (admin only)

## Session Management Features

### Automatic Token Refresh
- Tokens are automatically refreshed before expiry
- Users stay logged in during active usage
- Refresh tokens stored in database for security

### Inactivity Logout
- Auto-logout after 15 minutes of inactivity
- User notified with inactivity message
- Tracks: mouse, keyboard, scroll, touch events

### Activity Tracking
- Last activity timestamp updated on every request
- Admin can see user activity data
- Helps identify inactive accounts

## Best Practices

### For Users
- Never share your refresh token
- Change passwords regularly
- Log out when leaving the computer
- Be cautious with inactivity warnings

### For Admins
- Review user activity logs regularly
- Deactivate unused accounts
- Manage roles and permissions carefully
- Monitor API error logs for security issues

## Frontend Session Hook

The `useSessionManagement` hook provides:
- Automatic token refresh
- Inactivity detection
- Session expiry handling
- Logout on inactive

### Usage
```jsx
import { useSessionManagement } from './hooks/useSessionManagement';

function MyComponent() {
  useSessionManagement(() => {
    console.log('Session expired');
  });
  
  return <div>Protected Content</div>;
}
```

## Testing Security

### Test Inactivity Logout
1. Login to the application
2. Wait 15 minutes without any activity
3. You should be automatically logged out

### Test Token Refresh
1. Login and monitor network requests
2. After 55 minutes, refresh token is automatically called
3. New tokens issued without requiring re-login

### Test Code Quality
```bash
# Test ESLint rules
npm run lint

# Try committing code with issues
git commit -m "test"  # Will be blocked by husky
```

## Error Codes

- `401 Unauthorized` - Invalid/expired credentials
- `403 Forbidden` - Access denied (insufficient permissions)
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

## Future Enhancements

- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration
- [ ] API rate limiting
- [ ] Request logging and monitoring
- [ ] Encryption for sensitive data
- [ ] Certificate pinning
- [ ] Security audit logging

## Support

For security issues, please contact the development team immediately.
