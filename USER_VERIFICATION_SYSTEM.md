# Sistem Verifikasi User - Panduan Lengkap

## Overview

Sistem verifikasi user telah diimplementasikan dengan status tracking untuk memastikan hanya user yang sudah terverifikasi yang dapat mengakses fitur-fitur penting seperti membuat grup, bergabung grup, dan transaksi.

## Status User

### 1. Status yang Tersedia

- **`pending_verification`**: User baru mendaftar, belum verifikasi email
- **`active`**: User sudah terverifikasi dan dapat mengakses semua fitur
- **`suspended`**: User ditangguhkan (untuk keperluan admin)
- **`deleted`**: User dihapus (soft delete)

### 2. Flow Verifikasi

```
User Register → Status: pending_verification → Generate OTP → Verify OTP → Status: active
```

## Backend Implementation

### 1. Database Schema

```sql
-- Migration: 013_add_user_status_column.sql
ALTER TABLE public.users
ADD COLUMN status varchar(20) DEFAULT 'pending_verification' NOT NULL;

ALTER TABLE public.users
ADD CONSTRAINT users_status_check CHECK (
    status IN ('pending_verification', 'active', 'suspended', 'deleted')
);
```

### 2. Model Updates

```go
// salome-be/internal/models/user.go
type User struct {
    ID           uuid.UUID `json:"id" db:"id"`
    Email        string    `json:"email" db:"email"`
    PasswordHash string    `json:"-" db:"password_hash"`
    FullName     string    `json:"full_name" db:"full_name"`
    AvatarURL    *string   `json:"avatar_url" db:"avatar_url"`
    Status       string    `json:"status" db:"status"` // Added
    Balance      float64   `json:"balance" db:"balance"`
    TotalSpent   float64   `json:"total_spent" db:"total_spent"`
    CreatedAt    time.Time `json:"created_at" db:"created_at"`
    UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}
```

### 3. Register Logic

```go
// User register dengan status pending_verification
_, err = h.db.Exec(`
    INSERT INTO users (id, email, password_hash, full_name, status, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
`, userID, req.Email, string(hashedPassword), req.FullName, "pending_verification", time.Now(), time.Now())
```

### 4. OTP Verification Logic

```go
// Update user status to active setelah OTP berhasil diverifikasi
if req.Purpose == "email_verification" {
    _, err = h.db.Exec(`
        UPDATE users SET status = 'active', updated_at = $1 WHERE id = $2
    `, time.Now(), otp.UserID)
}
```

### 5. Middleware Protection

```go
// AuthRequiredWithStatus - middleware yang mengecek status user
func AuthRequiredWithStatus(db *sql.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // ... auth logic ...

        // Check user status
        var userStatus string
        err = db.QueryRow("SELECT status FROM users WHERE id = $1", claims.UserID).Scan(&userStatus)

        // Check if user is active
        if userStatus != "active" {
            c.JSON(http.StatusForbidden, gin.H{
                "error": "Account not verified",
                "status": userStatus,
                "message": "Please verify your email to access this feature",
            })
            c.Abort()
            return
        }

        c.Next()
    }
}
```

## Frontend Implementation

### 1. User Interface Update

```typescript
// salome-web/contexts/AuthContext.tsx
interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  status: string; // Added
  balance?: number;
  total_spent?: number;
  created_at: string;
  is_verified?: boolean;
}
```

### 2. Verification Guard Component

```tsx
// salome-web/components/VerificationGuard.tsx
export default function VerificationGuard({
  children,
  fallback,
}: VerificationGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && user.status !== "active") {
      // Redirect to verification page
      router.push(
        `/verify-email?email=${encodeURIComponent(
          user.email
        )}&purpose=email_verification`
      );
    }
  }, [user, loading, router]);

  // Show verification UI if user not active
  if (user && user.status !== "active") {
    return <VerificationUI />;
  }

  return <>{children}</>;
}
```

### 3. Dashboard Status Display

```tsx
// salome-web/app/dashboard/page.tsx
<span
  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    user.status === "active"
      ? "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200"
      : user.status === "pending_verification"
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }`}
>
  {user.status === "active"
    ? "Aktif"
    : user.status === "pending_verification"
    ? "Menunggu Verifikasi"
    : user.status === "suspended"
    ? "Ditangguhkan"
    : "Tidak Diketahui"}
</span>
```

## Protected Routes

### 1. Routes yang Memerlukan Verifikasi

- `/groups` - Semua operasi grup
- `/subscriptions` - Manajemen subscription
- `/payments` - Transaksi pembayaran
- `/messages` - Chat dalam grup
- `/transactions` - History transaksi

### 2. Routes yang Tidak Memerlukan Verifikasi

- `/auth/*` - Login, register
- `/otp/*` - Generate, verify, resend OTP
- `/public-groups` - Browse grup publik
- `/apps` - Browse aplikasi

## User Experience Flow

### 1. Register Flow

1. User mendaftar → Status: `pending_verification`
2. Redirect ke halaman verifikasi email
3. User input OTP 6 digit
4. Verifikasi berhasil → Status: `active`
5. Redirect ke dashboard

### 2. Login Flow

1. User login dengan email/password
2. Jika status `pending_verification` → Redirect ke verifikasi
3. Jika status `active` → Akses dashboard normal
4. Jika status `suspended` → Tampilkan pesan error

### 3. Access Control

1. User dengan status `pending_verification` tidak bisa:

   - Membuat grup
   - Bergabung grup
   - Melakukan transaksi
   - Mengirim pesan dalam grup

2. User dengan status `active` dapat:
   - Mengakses semua fitur
   - Melakukan semua operasi

## Error Handling

### 1. Backend Errors

```json
{
  "error": "Account not verified",
  "status": "pending_verification",
  "message": "Please verify your email to access this feature"
}
```

### 2. Frontend Handling

- Automatic redirect ke halaman verifikasi
- Clear error messages
- Status indicator di dashboard
- Verification guard untuk protected routes

## Testing

### 1. Test Cases

1. **Register Test**:

   - User register → Status harus `pending_verification`
   - Redirect ke verifikasi email

2. **Verification Test**:

   - Input OTP valid → Status berubah ke `active`
   - Input OTP invalid → Status tetap `pending_verification`

3. **Access Control Test**:

   - User `pending_verification` → Tidak bisa akses protected routes
   - User `active` → Bisa akses semua routes

4. **UI Test**:
   - Status indicator menampilkan status yang benar
   - Verification guard berfungsi dengan baik

## Security Considerations

1. **OTP Security**:

   - OTP expires dalam 5 menit
   - Maksimal 3 percobaan
   - Single use only

2. **Status Validation**:

   - Server-side validation di setiap protected route
   - Middleware check sebelum akses fitur

3. **Data Protection**:
   - User data tidak bisa diakses sebelum verifikasi
   - Sensitive operations memerlukan status `active`

## Migration Guide

1. **Database Migration**:

   ```bash
   # Jalankan migration untuk menambahkan kolom status
   psql -d salome_db -f migrations/013_add_user_status_column.sql
   ```

2. **Update Existing Users**:

   ```sql
   -- Update existing users to active status
   UPDATE users SET status = 'active' WHERE is_verified = true;
   ```

3. **Deploy Backend**:

   - Deploy dengan middleware baru
   - Update routes dengan status check

4. **Deploy Frontend**:
   - Deploy dengan VerificationGuard
   - Update UI untuk menampilkan status

## Monitoring

1. **Metrics to Track**:

   - Jumlah user `pending_verification`
   - Conversion rate dari `pending_verification` ke `active`
   - Failed verification attempts

2. **Alerts**:
   - High number of pending verifications
   - Low conversion rate
   - Multiple failed attempts

## Future Enhancements

1. **Email Templates**:

   - Professional email templates untuk OTP
   - Multi-language support

2. **Advanced Verification**:

   - SMS verification
   - 2FA support
   - Social login integration

3. **Admin Tools**:
   - Admin dashboard untuk manage user status
   - Bulk verification tools
   - User status analytics
