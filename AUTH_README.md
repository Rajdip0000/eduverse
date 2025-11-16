# EduVerse Authentication System

## Overview
Complete authentication backend implementation using Better Auth, Prisma, and PostgreSQL.

## Features Implemented

### ✅ Core Authentication
- **Email/Password Authentication**
  - User registration with email and password
  - Secure password hashing with bcrypt
  - User login with session management
  - Auto-generated user IDs and timestamps

### ✅ Session Management
- 7-day session expiration
- Session refresh every 24 hours
- Cookie-based session storage
- Secure cookies in production
- IP address and user agent tracking

### ✅ Password Reset Flow
- Forgot password functionality
- Token-based password reset
- 1-hour token expiration
- Secure token generation and validation

### ✅ Social Authentication (OAuth)
- Google OAuth ready (requires client credentials)
- GitHub OAuth ready (requires client credentials)
- Easy to add more providers

### ✅ User Profiles
- User roles (student by default)
- Additional fields: phoneNumber, dateOfBirth
- Profile update API
- Image upload support

### ✅ Route Protection
- Middleware for protected routes
- Automatic redirect to sign-in
- Session-based authentication check
- Role-based access control helpers

### ✅ Security Features
- Rate limiting (10 requests per minute)
- CSRF protection
- Secure password requirements (min 8 characters)
- Email verification support (configurable)
- Trusted origins configuration

## API Routes

### Authentication Routes (Better Auth)
- `POST /api/auth/sign-up/email` - Register with email/password
- `POST /api/auth/sign-in/email` - Login with email/password
- `POST /api/auth/sign-out` - Logout user
- `GET /api/auth/get-session` - Get current session
- `POST /api/auth/refresh-session` - Refresh session

### Custom Auth Routes
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `GET /api/auth/user` - Get current user
- `PATCH /api/auth/profile` - Update user profile

## Pages

### Auth Pages
- `/sign-in` - Sign in page with email/password and social auth
- `/sign-up` - Sign up page with email/password and social auth
- `/forgot-password` - Request password reset
- `/reset-password` - Reset password with token

### Protected Pages
- `/students` - Student dashboard (requires authentication)
- `/student/*` - All student pages (requires authentication)

## Database Schema

### User Model
```prisma
model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  role          String    @default("student")
  phoneNumber   String?
  dateOfBirth   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  accounts      Account[]
}
```

### Session Model
```prisma
model Session {
  id        String   @id @default(uuid())
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### Account Model
```prisma
model Account {
  id                    String    @id @default(uuid())
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

### Verification Model
```prisma
model Verification {
  id         String    @id @default(uuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime? @default(now())
  updatedAt  DateTime? @updatedAt

  @@unique([identifier, value])
}
```

## Helper Functions

### `lib/auth-helpers.ts`
```typescript
- getSession() - Get current session
- getCurrentUser() - Get current user
- isAuthenticated() - Check if authenticated
- requireAuth() - Require authentication (throws if not)
- hasRole(role) - Check if user has specific role
- requireRole(role) - Require specific role (throws if not)
```

## Environment Variables

### Required
```env
DATABASE_URL="postgresql://..." # PostgreSQL connection string
BETTER_AUTH_SECRET="..." # Generate with: openssl rand -base64 32
BETTER_AUTH_URL="http://localhost:3000" # Your app URL
```

### Optional (for OAuth)
```env
# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# GitHub OAuth
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Update `.env` with your PostgreSQL connection string

### 3. Run Migrations
```bash
npx prisma migrate dev --name init
```

### 4. Generate Prisma Client
```bash
npx prisma generate
```

### 5. Run Development Server
```bash
npm run dev
```

## OAuth Setup (Optional)

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env`

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env`

## Usage Examples

### Server Component (App Router)
```typescript
import { getCurrentUser, requireAuth } from '@/lib/auth-helpers'

export default async function ProtectedPage() {
  // Option 1: Get user (returns null if not authenticated)
  const user = await getCurrentUser()
  if (!user) redirect('/sign-in')

  // Option 2: Require auth (throws error if not authenticated)
  const session = await requireAuth()

  return <div>Welcome, {user.name}!</div>
}
```

### Client Component
```typescript
'use client'
import { useSession, signOut } from '@/lib/auth-client'

export default function ProfileButton() {
  const { data: session, isPending } = useSession()

  if (isPending) return <div>Loading...</div>
  if (!session) return <a href="/sign-in">Sign In</a>

  return (
    <button onClick={() => signOut()}>
      Sign Out
    </button>
  )
}
```

### API Route
```typescript
import { getCurrentUser } from '@/lib/auth-helpers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return NextResponse.json({ data: 'protected data' })
}
```

## Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use strong secrets** - Generate with `openssl rand -base64 32`
3. **Enable HTTPS in production** - Better Auth auto-detects and enables secure cookies
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Rate limit sensitive endpoints** - Already configured for auth routes
6. **Validate user input** - All forms have client and server-side validation
7. **Use environment-specific configs** - Different settings for dev/prod

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
npx prisma db push

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset --force
```

### Session Issues
- Clear browser cookies
- Check BETTER_AUTH_SECRET is set
- Verify DATABASE_URL is correct

### OAuth Issues
- Verify redirect URIs match exactly
- Check client credentials are correct
- Ensure OAuth apps are not in development mode (for production)

## Production Deployment

### Environment Variables
```env
# Production URLs
BETTER_AUTH_URL="https://yourdomain.com"
DATABASE_URL="postgresql://..." # Production database

# Required for OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
```

### Database Migration
```bash
# Apply migrations to production database
npx prisma migrate deploy
```

### Security Checklist
- [ ] HTTPS enabled
- [ ] Secure cookies enabled (automatic in production)
- [ ] Strong BETTER_AUTH_SECRET
- [ ] Rate limiting configured
- [ ] Database backups enabled
- [ ] Error logging configured
- [ ] CORS properly configured
- [ ] OAuth apps in production mode

## Next Steps

### Email Verification (Optional)
1. Configure email service (SendGrid, Resend, etc.)
2. Set `requireEmailVerification: true` in `lib/auth.ts`
3. Implement email sending in verification flows

### Two-Factor Authentication (Optional)
1. Install `better-auth/plugins`
2. Add TOTP plugin to auth config
3. Create 2FA setup flow

### Additional Features
- Password strength requirements
- Account deletion
- Email change with verification
- Session management UI
- Activity logs
- IP-based security

## Support

For issues or questions:
- Better Auth Docs: https://better-auth.com
- Prisma Docs: https://prisma.io/docs
- GitHub Issues: [Your repo]

## License

[Your License]
