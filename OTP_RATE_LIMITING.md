# OTP Rate Limiting System

## Overview

Sistem rate limiting telah diimplementasikan untuk mencegah spam dan abuse pada OTP generation dan verification. User yang mencoba generate OTP lebih dari 6 kali akan diblokir selama 6 jam.

## Database Schema

### Migration: 014_add_otp_rate_limiting.sql

```sql
-- Add rate limiting columns to otps table
ALTER TABLE public.otps
ADD COLUMN IF NOT EXISTS rate_limit_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rate_limit_reset_at TIMESTAMP NULL;

-- Create index for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_otps_rate_limit ON public.otps (email, rate_limit_reset_at);
CREATE INDEX IF NOT EXISTS idx_otps_user_rate_limit ON public.otps (user_id, rate_limit_reset_at);
```

### Updated OTP Model

```go
type OTP struct {
    ID               string     `json:"id" db:"id"`
    UserID           uuid.UUID  `json:"user_id" db:"user_id"`
    Email            string     `json:"email" db:"email"`
    OTPCode          string     `json:"otp_code" db:"otp_code"`
    Purpose          string     `json:"purpose" db:"purpose"`
    ExpiresAt        time.Time  `json:"expires_at" db:"expires_at"`
    IsUsed           bool       `json:"is_used" db:"is_used"`
    Attempts         int        `json:"attempts" db:"attempts"`
    RateLimitCount   int        `json:"rate_limit_count" db:"rate_limit_count"`     // NEW
    RateLimitResetAt *time.Time `json:"rate_limit_reset_at" db:"rate_limit_reset_at"` // NEW
    CreatedAt        time.Time  `json:"created_at" db:"created_at"`
}
```

## Rate Limiting Rules

### 1. OTP Generation Rate Limiting

- **Limit**: 6 attempts per email
- **Window**: 6 hours
- **Action**: Block user for 6 hours after 6th attempt
- **Reset**: Automatic after 6 hours

### 2. OTP Verification Rate Limiting

- **Limit**: 5 attempts per OTP code
- **Window**: 5 minutes (OTP expiry)
- **Action**: Mark OTP as invalid after 5 failed attempts
- **Reset**: New OTP generation

## Implementation Details

### 1. Middleware

#### OTPRateLimit Middleware

```go
func OTPRateLimit(db *sql.DB) gin.HandlerFunc {
    // Checks rate limit before OTP generation
    // Returns 429 Too Many Requests if limit exceeded
}
```

#### OTPVerifyRateLimit Middleware

```go
func OTPVerifyRateLimit(db *sql.DB) gin.HandlerFunc {
    // Checks rate limit before OTP verification
    // Returns 429 Too Many Requests if limit exceeded
}
```

### 2. Handler Updates

#### GenerateOTP Function

```go
// Check current rate limit status
var rateLimitCount int
var rateLimitResetAt *time.Time

err = h.db.QueryRow(`
    SELECT COALESCE(rate_limit_count, 0), rate_limit_reset_at
    FROM otps
    WHERE email = $1
    ORDER BY created_at DESC
    LIMIT 1
`, req.Email).Scan(&rateLimitCount, &rateLimitResetAt)

// Check if rate limit is active
if rateLimitResetAt != nil && time.Now().Before(*rateLimitResetAt) {
    // Return rate limit error
}

// Check if user has exceeded 6 attempts
if rateLimitCount >= 6 {
    // Set rate limit for 6 hours
    resetAt := time.Now().Add(6 * time.Hour)
    // Update all OTPs for this email with rate limit
    // Return rate limit error
}
```

### 3. Route Configuration

```go
// OTP routes with rate limiting
otp := v1.Group("/otp")
{
    otp.POST("/generate", middleware.OTPRateLimit(db), otpHandler.GenerateOTP)
    otp.POST("/verify", middleware.OTPVerifyRateLimit(db), otpHandler.VerifyOTP)
    otp.POST("/resend", middleware.OTPRateLimit(db), otpHandler.ResendOTP)
}
```

## Error Responses

### Rate Limit Exceeded (429)

```json
{
  "error": "Rate limit exceeded",
  "message": "Terlalu banyak permintaan OTP. Silakan coba lagi dalam 6 jam",
  "retry_after": 21600,
  "reset_at": "2024-01-01T12:00:00Z"
}
```

### Active Rate Limit (429)

```json
{
  "error": "Rate limit exceeded",
  "message": "Terlalu banyak permintaan OTP. Silakan coba lagi dalam 2 jam 30 menit",
  "retry_after": 9000,
  "reset_at": "2024-01-01T10:30:00Z"
}
```

## Frontend Handling

### 1. Error Handling

```typescript
try {
  await otpAPI.generate(email, purpose);
} catch (error: any) {
  if (error.response?.status === 429) {
    const retryAfter = error.response.data.retry_after;
    const resetAt = error.response.data.reset_at;

    // Show rate limit message
    toast.error(error.response.data.message);

    // Disable OTP generation for retry_after seconds
    setDisabled(true);
    setTimeout(() => setDisabled(false), retryAfter * 1000);
  }
}
```

### 2. UI Updates

- Disable OTP generation button when rate limited
- Show countdown timer for retry
- Display clear error messages
- Prevent multiple simultaneous requests

## Security Features

### 1. Per-Email Rate Limiting

- Each email address has independent rate limits
- Prevents abuse from single user with multiple accounts

### 2. Time-Based Reset

- Rate limits automatically reset after 6 hours
- No manual intervention required

### 3. Database Indexing

- Optimized queries for rate limit checks
- Fast lookups even with large datasets

### 4. Atomic Operations

- Rate limit updates are atomic
- Prevents race conditions

## Monitoring

### 1. Metrics to Track

- Number of rate limit hits per hour
- Most frequently rate-limited emails
- Average time between rate limit resets

### 2. Alerts

- High rate limit hit rate
- Suspicious patterns (same IP, multiple emails)
- System abuse detection

## Testing

### 1. Unit Tests

```go
func TestOTPRateLimit(t *testing.T) {
    // Test rate limit enforcement
    // Test rate limit reset
    // Test edge cases
}
```

### 2. Integration Tests

```go
func TestOTPGenerationRateLimit(t *testing.T) {
    // Test full flow with rate limiting
    // Test error responses
    // Test retry after rate limit
}
```

## Configuration

### 1. Rate Limit Constants

```go
const (
    MaxOTPAttempts = 6
    RateLimitHours = 6
    OTPExpiryMinutes = 5
    MaxVerificationAttempts = 5
)
```

### 2. Environment Variables

```bash
OTP_RATE_LIMIT_ATTEMPTS=6
OTP_RATE_LIMIT_HOURS=6
OTP_VERIFICATION_ATTEMPTS=5
```

## Migration Guide

### 1. Database Migration

```bash
# Run the migration
psql -d salome_db -f migrations/014_add_otp_rate_limiting.sql
```

### 2. Deploy Backend

- Deploy with new middleware
- Update routes with rate limiting
- Test rate limiting functionality

### 3. Deploy Frontend

- Update error handling for 429 responses
- Add rate limit UI components
- Test user experience

## Future Enhancements

### 1. Advanced Rate Limiting

- IP-based rate limiting
- Device fingerprinting
- Behavioral analysis

### 2. Dynamic Rate Limits

- Adjust limits based on user behavior
- Whitelist trusted users
- Blacklist suspicious patterns

### 3. Analytics Dashboard

- Real-time rate limit monitoring
- User behavior analytics
- Abuse detection alerts
