# State Machine Implementation

## Overview

Implementasi sistem state machine untuk mengelola lifecycle user dan group di platform Salome sesuai dengan goals yang telah ditetapkan.

## User State Machine

### States

1. **Pending** - User join grup, belum bayar
2. **Paid** - User sudah bayar, tapi grup belum semua bayar
3. **Active** - User bisa pakai aplikasi (subscription berjalan)
4. **Expired** - Langganan habis, tidak perpanjang
5. **Removed** - User sudah tidak dalam grup

### Transitions

- `Pending` → `Paid` (User bayar)
- `Pending` → `Removed` (Timeout/Removed)
- `Paid` → `Active` (All group members paid)
- `Paid` → `Removed` (Leave request)
- `Active` → `Expired` (Period expired)
- `Expired` → `Active` (Pay renewal)
- `Expired` → `Removed` (Did not renew)

## Group State Machine

### States

1. **Open** - Bisa dilihat semua user di marketplace
2. **Private** - Hanya bisa join lewat link invite
3. **Full** - Semua slot sudah terisi user
4. **Paid Group** - Semua user sudah bayar, subscription aktif
5. **Closed** - Grup dihapus atau semua user keluar

### Transitions

- `Open` → `Private` (Admin set private)
- `Open` → `Full` (Slots filled)
- `Private` → `Open` (Admin set public)
- `Private` → `Full` (Slots filled)
- `Full` → `Paid Group` (All paid)
- `Paid Group` → `Open` (Period expired)
- `Paid Group` → `Closed` (Admin close)

## Backend Implementation

### Database Schema

#### Migration: `016_add_state_machine_columns.sql`

```sql
-- User status columns
ALTER TABLE group_members ADD COLUMN user_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE group_members ADD COLUMN payment_deadline TIMESTAMP;
ALTER TABLE group_members ADD COLUMN paid_at TIMESTAMP;
ALTER TABLE group_members ADD COLUMN activated_at TIMESTAMP;
ALTER TABLE group_members ADD COLUMN expired_at TIMESTAMP;
ALTER TABLE group_members ADD COLUMN removed_at TIMESTAMP;
ALTER TABLE group_members ADD COLUMN removed_reason VARCHAR(100);

-- Group status columns
ALTER TABLE groups ADD COLUMN group_status VARCHAR(20) DEFAULT 'open';
ALTER TABLE groups ADD COLUMN all_paid_at TIMESTAMP;

-- Admin privileges
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
```

### Models

#### Group Model

```go
type Group struct {
    // ... existing fields
    GroupStatus    string     `json:"group_status" db:"group_status"`
    AllPaidAt      *time.Time `json:"all_paid_at" db:"all_paid_at"`
}

type GroupMember struct {
    // ... existing fields
    UserStatus             string     `json:"user_status" db:"user_status"`
    PaymentDeadline        *time.Time `json:"payment_deadline" db:"payment_deadline"`
    PaidAt                 *time.Time `json:"paid_at" db:"paid_at"`
    ActivatedAt            *time.Time `json:"activated_at" db:"activated_at"`
    ExpiredAt              *time.Time `json:"expired_at" db:"expired_at"`
    RemovedAt              *time.Time `json:"removed_at" db:"removed_at"`
    RemovedReason          *string    `json:"removed_reason" db:"removed_reason"`
    SubscriptionPeriodStart *time.Time `json:"subscription_period_start" db:"subscription_period_start"`
    SubscriptionPeriodEnd   *time.Time `json:"subscription_period_end" db:"subscription_period_end"`
}
```

### State Machine Service

#### File: `salome-be/internal/services/state_machine.go`

**Key Methods:**

- `UpdateUserStatus()` - Update user status dengan validasi
- `UpdateGroupStatus()` - Update group status dengan validasi
- `AdminUpdateUserStatus()` - Admin dapat update status apapun
- `AdminUpdateGroupStatus()` - Admin dapat update status apapun
- `checkAndActivateGroup()` - Auto-activate group jika semua bayar
- `CheckExpiredPayments()` - Remove users dengan expired payment

**Constants:**

```go
const (
    UserStatusPending  = "pending"
    UserStatusPaid     = "paid"
    UserStatusActive   = "active"
    UserStatusExpired  = "expired"
    UserStatusRemoved  = "removed"

    GroupStatusOpen      = "open"
    GroupStatusPrivate   = "private"
    GroupStatusFull      = "full"
    GroupStatusPaidGroup = "paid_group"
    GroupStatusClosed    = "closed"

    PaymentTimeoutHours = 24
)
```

### API Endpoints

#### Admin Endpoints

- `PUT /api/v1/admin/users/status` - Update user status
- `PUT /api/v1/admin/groups/status` - Update group status

#### Group Endpoints

- `GET /api/v1/groups/:group_id/users/:user_id/status` - Get user status
- `GET /api/v1/groups/:group_id/status` - Get group status

### Middleware

#### AdminRequired Middleware

```go
func AdminRequired(db *sql.DB) gin.HandlerFunc {
    // Check authentication
    // Check is_admin flag
    // Allow access if admin
}
```

## Frontend Implementation

### Admin Panel

#### File: `salome-web/app/admin/page.tsx`

**Features:**

- View all groups with status
- View group members with user status
- Update group status (admin only)
- Update user status (admin only)
- Search and filter functionality
- Real-time status updates

**UI Components:**

- Tabs for Groups/Members view
- Status badges with color coding
- Dropdown selectors for status changes
- Search input for filtering
- Refresh button for data updates

### Status Display

#### Join Page Updates

- Group status badge dengan warna yang sesuai
- Subscription status indicator untuk paid groups
- Owner information display
- Dynamic status text dan styling

#### Status Badge Colors

- **Open/Active**: Green
- **Private/Closed**: Gray
- **Full**: Yellow
- **Paid Group**: Blue

### Navigation

#### Admin Link in Navbar

- Hanya muncul untuk user dengan `is_admin: true`
- Desktop dan mobile menu
- Shield icon untuk identifikasi

## Admin Privileges

### Capabilities

- **Full Access**: Admin dapat mengubah status user/group apapun
- **Bypass Validation**: Tidak terikat dengan state machine rules
- **Override Protection**: Dapat mengubah status user yang sudah bayar
- **Bulk Operations**: Dapat mengelola multiple groups/users

### Security

- Admin status checked via `is_admin` field
- Middleware `AdminRequired` untuk proteksi endpoint
- JWT token validation tetap diperlukan
- Database constraint untuk validasi status values

## Payment Flow Integration

### Timeout Mechanism

- 24 jam deadline untuk payment
- Auto-remove expired users
- Grace period untuk renewal
- Notification system (pending implementation)

### Subscription Management

- Auto-activate ketika semua bayar
- Set subscription period (1 month default)
- Track activation/expiration dates
- Handle renewal process

## Error Handling

### Validation

- Status transition validation
- Admin permission checks
- Database constraint enforcement
- Graceful error responses

### Fallbacks

- Default status values
- Error state handling
- User-friendly error messages
- Logging untuk debugging

## Future Enhancements

### Notification System

- Email reminders untuk payment deadline
- In-app notifications untuk status changes
- WhatsApp integration untuk urgent updates
- Push notifications untuk mobile

### Analytics

- Status transition tracking
- Payment success rates
- Group completion metrics
- User engagement stats

### Automation

- Auto-renewal untuk active subscriptions
- Smart timeout based on user behavior
- Predictive status management
- AI-powered group optimization

## Testing Scenarios

### User State Transitions

1. User join → Pending
2. User pay → Paid
3. All pay → Active
4. Period end → Expired
5. No renewal → Removed

### Group State Transitions

1. Create group → Open
2. Fill slots → Full
3. All pay → Paid Group
4. Period end → Open
5. Admin close → Closed

### Admin Operations

1. Force user status change
2. Override group status
3. Bulk status updates
4. Emergency group closure

## Conclusion

State machine implementation memberikan:

- ✅ **Clear user journey** dengan status yang jelas
- ✅ **Automated workflows** untuk payment dan activation
- ✅ **Admin control** untuk management dan troubleshooting
- ✅ **Scalable architecture** untuk future enhancements
- ✅ **Robust error handling** untuk production stability
- ✅ **User-friendly interface** untuk admin operations

Sistem ini memastikan platform Salome dapat mengelola lifecycle user dan group dengan efisien, transparan, dan aman sesuai dengan goals yang telah ditetapkan.
