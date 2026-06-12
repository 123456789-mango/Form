# Security Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
npm run prepare  # Initialize Husky hooks
```

### 2. Environment Configuration
Create a `.env` file in the root directory:
```env
MONGO_URI=mongodb://your_connection_string
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
REFRESH_SECRET=your_super_secret_refresh_key_min_32_chars
ADMIN_API_KEY=your_admin_api_key_for_user_registration
NODE_ENV=development
```

### 3. Create Initial Admin User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "x-admin-key: your_admin_api_key_for_user_registration" \
  -d '{
    "username": "admin",
    "password": "SecurePassword123",
    "role": "admin"
  }'
```

### 4. Start Development
```bash
npm start
# Or separately:
npm run server  # Backend
npm run dev     # Frontend
```

## Security Features Checklist

### ✅ Authentication
- [x] JWT access tokens (1-hour expiry)
- [x] Refresh tokens (7-day expiry)
- [x] Password hashing with bcryptjs
- [x] Secure login endpoint
- [x] Logout endpoint

### ✅ Authorization
- [x] Role-Based Access Control (RBAC)
- [x] Admin-only endpoints
- [x] Permission management per role
- [x] User activity tracking
- [x] Account active/inactive status

### ✅ Session Management
- [x] 15-minute inactivity auto-logout
- [x] Last activity tracking
- [x] Automatic token refresh
- [x] Session invalidation on logout
- [x] Inactivity warning

### ✅ Code Quality
- [x] Husky pre-commit hooks
- [x] ESLint configuration
- [x] Lint-staged for staged files
- [x] Error code prevention
- [x] Code standards enforcement

### ✅ Data Protection
- [x] No passwords in API responses
- [x] No refresh tokens exposed
- [x] Sanitized error messages
- [x] Secure token storage
- [x] CORS configuration

## File Structure

### Backend Security Files
```
routes/
  ├── auth.js           # Login, refresh, logout
  ├── users.js          # User management with auth
  └── roles.js          # Role management with RBAC

models/
  ├── User.js           # User schema with session fields
  └── Role.js           # Role schema with permissions

middleware/
  └── auth.js           # JWT verification middleware

.husky/
  └── pre-commit        # Git hook for code quality
```

### Frontend Security Files
```
src/
  ├── hooks/
  │   └── useSessionManagement.js  # Session & inactivity management
  ├── pages/
  │   ├── Login.jsx                 # Enhanced login with session messaging
  │   ├── UserManagement.jsx        # User CRUD
  │   └── RoleManagement.jsx        # Role CRUD
  └── App.jsx                       # Session integration
```

### Configuration Files
```
.eslintrc.json          # Code quality rules
.husky/                 # Git hooks
package.json            # Dependencies and scripts
```

## Role Permissions Model

Each role can have permissions for:
- **Posts**: Create, Read, Update, Delete
- **Clients**: Create, Read, Update, Delete
- **Users**: Create, Read, Update, Delete
- **Roles**: Create, Read, Update, Delete

### Default Roles
- **Admin**: Full access to all features
- **User**: Limited read access

### Create Custom Role
1. Go to Admin → Roles
2. Click "Add New Role"
3. Set permissions per feature
4. Assign role to users

## Token Lifecycle

```
Login
  ↓
Generate Access Token (1h) + Refresh Token (7d)
  ↓
Store tokens in localStorage
  ↓
Activity tracking enabled
  ↓
Token auto-refresh at 55 minutes
  ↓
If inactive > 15 min: Auto-logout
  ↓
If 7 days passed: Full re-login required
```

## API Usage Examples

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'
```

Response:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { "id": "...", "username": "admin", "role": "admin" }
}
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "eyJhbGc..."}'
```

### Protected Request
```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer eyJhbGc..."
```

### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGc..."
```

## Monitoring & Debugging

### Check Activity Log
- Admin can see `lastActivityAt` field in user details
- Useful for identifying inactive users

### Verify Permissions
- Each user has a `role` field
- Roles contain permission matrix
- API enforces permissions on each request

### Debug Token Issues
- Check token expiry: `jwt.decode(token)`
- Verify refresh token in database
- Check `isActive` flag on user account

## Common Issues & Solutions

### Issue: Session expires immediately
**Solution**: Check `INACTIVITY_TIME` in `useSessionManagement.js`

### Issue: Token refresh fails
**Solution**: Verify `REFRESH_SECRET` matches in backend

### Issue: Husky hooks not working
**Solution**: Run `npm run prepare` after npm install

### Issue: Can't create users as admin
**Solution**: Ensure user has `role: 'admin'`

### Issue: Role permissions not working
**Solution**: Check user's role exists and has proper permissions

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Setup environment variables
3. ✅ Initialize Husky: `npm run prepare`
4. ✅ Create admin user
5. ✅ Start development: `npm start`
6. ✅ Test login & session management
7. ✅ Create roles and users in admin panel

## Support & Security

- Report security issues to: security@example.com
- Keep dependencies updated: `npm update`
- Review logs regularly
- Test security features in development first
- Never commit sensitive data to git

---

**Last Updated**: 2026-06-12
**Security Level**: High
**Maintenance**: Regular updates recommended
