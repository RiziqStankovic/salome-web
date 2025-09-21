# Sistem OTP 6 Digit - Panduan Penggunaan

## Overview

Sistem OTP (One-Time Password) 6 digit telah diimplementasikan untuk verifikasi email, reset password, dan login verification.

## Backend API Endpoints

### 1. Generate OTP

```http
POST /api/v1/otp/generate
Content-Type: application/json

{
  "email": "user@example.com",
  "purpose": "email_verification" // atau "password_reset", "login_verification"
}
```

**Response:**

```json
{
  "message": "OTP generated successfully",
  "otp": {
    "id": "uuid",
    "email": "user@example.com",
    "purpose": "email_verification",
    "expires_at": "2024-01-01T12:05:00Z",
    "created_at": "2024-01-01T12:00:00Z"
  },
  "otp_code": "123456", // Hanya untuk testing, hapus di production
  "expires_in": "5 minutes"
}
```

### 2. Verify OTP

```http
POST /api/v1/otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otp_code": "123456",
  "purpose": "email_verification"
}
```

**Response:**

```json
{
  "valid": true,
  "message": "OTP verified successfully",
  "user_id": "uuid"
}
```

### 3. Resend OTP

```http
POST /api/v1/otp/resend
Content-Type: application/json

{
  "email": "user@example.com",
  "purpose": "email_verification"
}
```

## Frontend Components

### 1. OTPInput Component

```tsx
import OTPInput from "@/components/ui/OTPInput";

<OTPInput
  length={6}
  onComplete={(otp) => console.log("OTP:", otp)}
  onChange={(otp) => console.log("Current OTP:", otp)}
  disabled={false}
  className="custom-class"
/>;
```

### 2. API Calls

```tsx
import { otpAPI } from "@/lib/api";

// Generate OTP
const response = await otpAPI.generate(
  "user@example.com",
  "email_verification"
);

// Verify OTP
const verifyResponse = await otpAPI.verify(
  "user@example.com",
  "123456",
  "email_verification"
);

// Resend OTP
const resendResponse = await otpAPI.resend(
  "user@example.com",
  "email_verification"
);
```

## Database Schema

### Tabel: `otps`

```sql
CREATE TABLE public.otps (
    id varchar(50) NOT NULL,
    user_id uuid NOT NULL,
    email varchar(255) NOT NULL,
    otp_code varchar(6) NOT NULL,
    purpose varchar(50) NOT NULL,
    expires_at timestamp NOT NULL,
    is_used boolean DEFAULT false,
    attempts integer DEFAULT 0,
    created_at timestamp DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT otps_pkey PRIMARY KEY (id),
    CONSTRAINT otps_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
```

## Fitur Keamanan

1. **Expiration**: OTP berlaku selama 5 menit
2. **Attempt Limit**: Maksimal 3 kali percobaan verifikasi
3. **Auto Cleanup**: OTP lama otomatis dihapus
4. **Single Use**: Setiap OTP hanya bisa digunakan sekali
5. **Rate Limiting**: Ada cooldown untuk resend OTP

## Penggunaan di Aplikasi

### 1. Email Verification (Register)

- User register → Generate OTP → Redirect ke `/verify-email`
- User input OTP → Verify → Redirect ke dashboard

### 2. Password Reset

- User request reset → Generate OTP → Redirect ke `/verify-email?purpose=password_reset`
- User input OTP → Verify → Redirect ke halaman reset password

### 3. Login Verification (2FA)

- User login → Generate OTP → Redirect ke `/verify-email?purpose=login_verification`
- User input OTP → Verify → Complete login

## Testing

Untuk testing, OTP code dikembalikan dalam response API. Di production, hapus field `otp_code` dari response dan implementasikan pengiriman email/SMS yang sebenarnya.

## Migration

Jalankan migration untuk membuat tabel OTP:

```bash
# File migration sudah dibuat di: salome-be/migrations/012_create_otp_table.sql
```

## Next Steps

1. Implementasi pengiriman email/SMS yang sebenarnya
2. Tambahkan rate limiting untuk mencegah spam
3. Implementasi 2FA untuk login
4. Tambahkan audit log untuk OTP activities
