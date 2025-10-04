# SALOME Frontend

Platform patungan SaaS yang aman dan terpercaya - Frontend Application

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm atau yarn
- Backend server running di port 8080

### Setup Environment

1. **Setup environment variables:**

   ```bash
   npm run setup-env
   ```

   Ini akan membuat file `.env.local` dengan konfigurasi default.

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

   atau

   ```bash
   # Windows
   start-dev.bat

   # Linux/Mac
   chmod +x start-dev.sh
   ./start-dev.sh
   ```

4. **Buka browser:**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
salome-web/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # UI components
│   ├── LandingPage.tsx   # Landing page
│   ├── AppGrid.tsx       # Apps grid
│   └── ...
├── contexts/             # React contexts
│   ├── AuthContext.tsx   # Authentication
│   ├── ThemeContext.tsx  # Dark mode
│   └── ConfettiContext.tsx
├── lib/                  # Utilities
│   ├── api.ts           # API client
│   ├── currency.ts      # Currency utilities
│   └── utils.ts         # General utilities
├── .env.local           # Environment variables (auto-generated)
├── .env.example         # Environment template
├── setup-env.js         # Environment setup script
└── package.json
```

## 🔧 Environment Variables

File `.env.local` berisi konfigurasi untuk:

- **API Configuration**: URL backend API
- **App Configuration**: Nama app, version, environment
- **Feature Flags**: Enable/disable features
- **Currency**: Currency symbol dan code
- **Theme**: Default theme dan dark mode
- **Analytics**: Optional analytics IDs
- **Social Media**: Social media links
- **Support**: Support contact info

## 🎨 Features

### ✅ Implemented

- **Dark Mode**: Toggle light/dark theme
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Tailwind CSS + Framer Motion
- **Authentication**: Login, register, OTP verification
- **Currency**: Indonesian Rupiah (IDR) support
- **API Integration**: Axios client dengan interceptors
- **Error Handling**: Global error handling
- **Loading States**: Loading indicators
- **Animations**: Smooth transitions dan hover effects

### 🚧 In Progress

- Group management
- Subscription management
- Payment integration
- Real-time notifications

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run setup-env    # Setup environment variables
npm run setup        # Setup environment + install deps
```

### API Integration

Frontend menggunakan `lib/api.ts` untuk komunikasi dengan backend:

```typescript
import { authAPI, groupAPI, subscriptionAPI, paymentAPI } from "@/lib/api";

// Login
await authAPI.login(email, password);

// Create group
await groupAPI.createGroup({ name, description, max_members });

// Get subscriptions
await subscriptionAPI.getGroupSubscriptions(groupId);
```

### Theme System

Dark mode menggunakan `ThemeContext`:

```typescript
import { useTheme } from "@/contexts/ThemeContext";

const { theme, toggleTheme } = useTheme();
```

### Currency System

Currency utilities di `lib/currency.ts`:

```typescript
import { formatCurrency, calculateSplitAmount } from "@/lib/currency";

const price = formatCurrency(50000); // "Rp 50.000"
const split = calculateSplitAmount(100000, 4); // 25000
```

## 🔗 Backend Integration

Frontend terintegrasi dengan backend Go di:

- **API Base URL**: `http://localhost:8080/api/v1`
- **WebSocket**: `ws://localhost:8080` (untuk real-time)
- **CORS**: Configured untuk `http://localhost:3000`

## 📱 Mobile Support

- Responsive design untuk semua screen sizes
- Touch-friendly interactions
- Mobile-optimized forms
- Swipe gestures (planned)

## 🎯 Performance

- **Code Splitting**: Automatic dengan Next.js
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: `npm run build` untuk analyze
- **Lazy Loading**: Components dan routes
- **Caching**: API response caching

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables for Production

Update `.env.local` untuk production:

```env
NEXT_PUBLIC_API_URL=https://api.salome.cloudfren.id/api/v1
NEXT_PUBLIC_APP_URL=https://salome.cloudfren.id
NEXT_PUBLIC_ENVIRONMENT=production
```

## 🐛 Troubleshooting

### Common Issues

1. **Environment variables not loading**

   ```bash
   npm run setup-env
   ```

2. **API connection failed**

   - Pastikan backend running di port 8080
   - Check CORS configuration

3. **Dark mode not working**

   - Check `tailwind.config.js` untuk `darkMode: 'class'`
   - Pastikan `ThemeProvider` di layout

4. **Build errors**
   ```bash
   npm run lint
   npm run build
   ```

## 📞 Support

- **Email**: support@salome.cloudfren.id
- **Documentation**: [docs.salome.cloudfren.id](https://docs.salome.cloudfren.id)
- **Issues**: [GitHub Issues](https://github.com/salome/issues)

---

**Status**: ✅ **READY** - Frontend siap untuk development dan testing!
