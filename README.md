# Campaign Wired Backend

Backend API for Campaign Wired communication platform supporting SMS, voice calls, and email campaigns.

## Features

- **Multi-channel Communication**: Send emails, SMS, and voice messages
- **Custom SMTP Support**: Users can configure their own SMTP servers for email sending
- **Dynamic Email Service**: Supports both system-wide and per-user SMTP configurations
- **Authentication**: Supabase JWT token-based authentication for protected endpoints
- **Email Encryption**: AES-256-GCM encryption for storing SMTP passwords securely

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

   **Required Variables:**
   - `ENCRYPTION_KEY` - Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key from Supabase
   - `SMTP_*` - Default SMTP configuration (fallback)

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Email Endpoints

#### Send Single Email
```http
POST /messages/email
Authorization: Bearer <supabase-jwt-token> (optional)
Content-Type: application/json

{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<p>Email content</p>",
  "text": "Plain text content",
  "from": "sender@example.com",
  "fromName": "Sender Name"
}
```

- If authenticated, uses user's custom SMTP config (if configured)
- Falls back to system SMTP if no custom config

#### Send Bulk Email
```http
POST /messages/email/bulk
Authorization: Bearer <supabase-jwt-token> (optional)
Content-Type: application/json

{
  "recipients": [
    {"email": "user1@example.com", "name": "User 1"},
    {"email": "user2@example.com", "name": "User 2"}
  ],
  "subject": "Bulk Email",
  "html": "<p>Hello {{name}}</p>",
  "substitutionData": {"company": "Acme Inc"}
}
```

### SMTP Testing

#### Test SMTP Connection
```http
POST /api/smtp/test
Content-Type: application/json

{
  "smtp_host": "smtp.gmail.com",
  "smtp_port": 587,
  "smtp_user": "your-email@gmail.com",
  "smtp_pass": "encrypted-password",
  "smtp_secure": false
}
```

Returns `200 OK` if connection successful, `400 Bad Request` if failed.

## Custom SMTP Configuration

Users can configure their own SMTP servers through the frontend application:

1. Navigate to **Settings > Advanced** tab
2. Enable "Use custom SMTP server"
3. Fill in SMTP server details:
   - SMTP Host (e.g., `smtp.gmail.com`)
   - SMTP Port (e.g., `587` for TLS, `465` for SSL)
   - SMTP Username (your email)
   - SMTP Password (encrypted automatically)
   - Enable SSL/TLS if needed
4. Test connection before saving
5. Save configuration

**Gmail Users**: Use [App Passwords](https://support.google.com/accounts/answer/185833) instead of your regular password.

## Security

- **Password Encryption**: All SMTP passwords are encrypted using AES-256-GCM before storage
- **Authentication**: Protected endpoints require valid Supabase JWT tokens
- **Environment Variables**: Sensitive credentials stored in environment variables only
- **CORS Protection**: Configurable allowed origins

## Architecture

### Email Service (`/src/services/emailService.ts`)

- Supports dynamic SMTP configuration per request
- Falls back to system-wide SMTP if no custom config provided
- Automatic password decryption for user-provided SMTP credentials
- Connection pooling for system SMTP (singleton pattern)
- Template substitution with `{{variable}}` syntax

### Authentication Middleware (`/src/middleware/auth.ts`)

- Verifies Supabase JWT tokens
- Extracts user information from tokens
- Fetches user's SMTP configuration from database
- Supports both required and optional authentication

## Development

```bash
# Development with auto-reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Integration with Frontend

The frontend (colla-code-spark2) sends emails through Supabase Edge Functions, which:

1. Check if user has `use_custom_smtp` enabled
2. If yes, call this backend API with encrypted SMTP credentials
3. If no, use Resend API directly

### Environment Variables Required in Edge Functions

```bash
BACKEND_API_URL=https://your-backend-url.com
```

## Troubleshooting

### SMTP Connection Failures

1. **Gmail**: Ensure "Less secure app access" is enabled or use App Passwords
2. **Port Issues**: Try different ports (587, 465, 25)
3. **Firewall**: Check if outbound SMTP ports are blocked
4. **Credentials**: Verify username/password are correct

### Decryption Errors

- Ensure `ENCRYPTION_KEY` matches between frontend and backend
- Regenerate encryption key and re-save SMTP credentials if key changed

### Authentication Errors

- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check if JWT token is properly formatted in Authorization header

## License

Private - All rights reserved
