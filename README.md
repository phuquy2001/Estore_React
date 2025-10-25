<<<<<<< HEAD
# Estore_React
=======
# 🛍️ Estore React - Full-Stack E-commerce Platform

Modern, secure e-commerce platform built with React, Firebase, and Redux Toolkit. Features advanced admin panel with role-based access control, real-time analytics, and comprehensive product management.

## 🚀 Features

### ✅ Fully Implemented
- **🔐 Advanced Authentication**: Firebase Auth with Google login, email/password
- **👤 User Management**: Profile management, order history, address book
- **🛒 Shopping Cart**: Add/remove items, quantity updates, localStorage persistence
- **📦 Product Management**: CRUD operations, categories, inventory tracking
- **⭐ Product Reviews**: Rating system, user reviews with moderation
- **📊 Advanced Analytics**: Real-time dashboard, sales reports, customer insights
- **👨‍💼 Admin Panel**: Comprehensive admin interface with role-based permissions
- **🔒 Security Features**: 2FA, session management, IP restrictions, audit logging
- **📱 Responsive Design**: Mobile-first approach with TailwindCSS
- **🔄 State Management**: Redux Toolkit for global state
- **📥 Import/Export**: Bulk product import via CSV/JSON, data export
- **⚡ Performance**: Query caching, optimized Firebase operations

### 🔜 Future Enhancements
- **💳 Payment Integration**: VNPay, Momo, Stripe gateways
- **📧 Email Notifications**: Order confirmations, marketing campaigns
- **📱 Mobile App**: React Native companion app
- **🌐 Multi-language**: Internationalization support

## 📦 Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS
- **Backend**: Firebase (Firestore, Auth, Storage, Hosting)
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Database**: Firestore (NoSQL)
- **Authentication**: Firebase Auth
- **File Storage**: Firebase Storage
- **Testing**: Vitest + Testing Library
- **Build Tool**: Vite
- **Deployment**: Vercel/Netlify/Firebase Hosting

## 🛠️ Installation

### Prerequisites
- Node.js >= 16.x
- npm or yarn
- Firebase project (for full functionality)

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd estore-react
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore, Authentication, and Storage
   - Copy your Firebase config to `.env` file

4. **Environment Variables**
   Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. **Start the development server**
```bash
npm run dev
```

6. **Access the application**
   - Frontend: http://localhost:5173

## 👤 Demo Accounts

### Admin Account
- Email: `admin@estore.com`
- Password: `admin123`
- Access: Full admin panel access

### Customer Account
- Email: `user@example.com`
- Password: `user123`
- Access: Regular user features

## 📁 Project Structure

```
estore-react/
├── src/
│   ├── components/          # Reusable components
│   │   ├── admin/          # Admin-specific components
│   │   │   ├── ProductForm.jsx
│   │   │   ├── ProductImporter.jsx
│   │   │   └── AdvancedAnalytics.jsx
│   │   ├── auth/           # Authentication components
│   │   ├── ProductCard.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── ReviewForm.jsx
│   │   ├── ReviewList.jsx
│   │   ├── StarRating.jsx
│   │   └── utils/          # Utility components
│   ├── config/             # Configuration files
│   │   └── firebase.js     # Firebase configuration
│   ├── contexts/           # React contexts
│   │   └── AuthContext.jsx # Authentication context
│   ├── controllers/        # Redux slices
│   │   ├── store.js        # Redux store
│   │   ├── cartSlice.js    # Cart state
│   │   └── productSlice.js # Product state
│   ├── models/             # Business logic
│   │   └── productModel.js # Product utilities
│   ├── services/           # API services
│   │   ├── apiService.js   # Main API service
│   │   ├── firebaseService.js # Firebase operations
│   │   ├── firebaseAuthService.js # Auth operations
│   │   ├── adminSecurityService.js # Admin security
│   │   ├── enhancedRBACService.js # Role-based access
│   │   └── notificationService.js # Toast notifications
│   ├── styles/             # Global styles
│   ├── utils/              # Utility functions
│   │   ├── cache.js        # Caching utilities
│   │   └── passwordValidator.js # Password validation
│   ├── views/              # Page components
│   │   ├── layouts/        # Layout components
│   │   │   └── Layout.jsx
│   │   ├── pages/          # Main pages
│   │   │   ├── Home.jsx
│   │   │   ├── Shop.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── OrderSuccess.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── OrderDetail.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── admin/      # Admin pages
│   │   │       ├── AdminDashboard.jsx
│   │   │       ├── AdminDashboardHome.jsx
│   │   │       ├── AdminProducts.jsx
│   │   │       ├── AdminOrders.jsx
│   │   │       ├── AdminOrderDetail.jsx
│   │   │       ├── AdminUsers.jsx
│   │   │       ├── AdminLogs.jsx
│   │   │       ├── AdminSettings.jsx
│   │   │       └── AdminSecuritySettings.jsx
│   │   └── styles/         # Page-specific styles
│   ├── App.jsx
│   └── main.jsx
├── .env                    # Environment variables
├── .gitignore
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Optional: Payment gateways (for future implementation)
VITE_VNPAY_TMN_CODE=your_vnpay_tmn_code
VITE_MOMO_PARTNER_CODE=your_momo_partner_code
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key
```

## 🚢 Deployment

### Deploy to Firebase Hosting

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**
```bash
firebase login
```

3. **Initialize Firebase Hosting**
```bash
firebase init hosting
```

4. **Build the project**
```bash
npm run build
```

5. **Deploy**
```bash
firebase deploy
```

### Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Set environment variables**
```bash
vercel env add VITE_FIREBASE_API_KEY
# Add all other VITE_* variables
```

### Deploy to Netlify

1. **Build the project**
```bash
npm run build
```

2. **Deploy to Netlify**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

3. **Configure environment variables in Netlify**
- Go to Site Settings → Environment Variables
- Add all VITE_* variables

## 🔌 Firebase Services

### Firestore Collections
- **products**: Product catalog with categories, pricing, inventory
- **orders**: Order management with status tracking
- **users**: User profiles and roles
- **reviews**: Product reviews and ratings
- **adminLogs**: Security audit logs

### Authentication
- Email/Password authentication
- Google OAuth integration
- Role-based access control (Customer, Admin, Manager, Staff, Viewer)

### Storage
- Product images
- User avatars
- Static assets

## 💳 Payment Integration Guide

### VNPay Integration (Vietnam)

1. Register at [VNPay](https://vnpay.vn/)
2. Get TMN Code and Hash Secret
3. Add to `.env`:
```env
VITE_VNPAY_TMN_CODE=your_tmn_code
VITE_VNPAY_HASH_SECRET=your_hash_secret
```

### Momo Integration (Vietnam)

1. Register at [Momo Business](https://business.momo.vn/)
2. Get Partner Code and Access Key
3. Add to `.env`:
```env
VITE_MOMO_PARTNER_CODE=your_partner_code
VITE_MOMO_ACCESS_KEY=your_access_key
```

### Stripe Integration (International)

1. Create account at [Stripe](https://stripe.com/)
2. Get API keys from Dashboard
3. Add to `.env`:
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## 📝 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run tests
npm run test:ui      # Run tests with UI
```

## 💳 Payment Integration (Planned)

### VNPay Integration (Vietnam)

1. Register at [VNPay](https://vnpay.vn/)
2. Get TMN Code and Hash Secret
3. Add to `.env`:
```env
VITE_VNPAY_TMN_CODE=your_tmn_code
VITE_VNPAY_HASH_SECRET=your_hash_secret
```

### Momo Integration (Vietnam)

1. Register at [Momo Business](https://business.momo.vn/)
2. Get Partner Code and Access Key
3. Add to `.env`:
```env
VITE_MOMO_PARTNER_CODE=your_partner_code
VITE_MOMO_ACCESS_KEY=your_access_key
```

### Stripe Integration (International)

1. Create account at [Stripe](https://stripe.com/)
2. Get API keys from Dashboard
3. Add to `.env`:
```env
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

## 🔒 Security Features

- **2FA Support**: Two-factor authentication for admins
- **Session Management**: Configurable session timeouts
- **IP Restrictions**: Whitelist IPs for admin access
- **Audit Logging**: Track all admin activities
- **Role-Based Access**: Granular permissions system
- **Security Headers**: Firebase security rules

## 📊 Admin Features

- **Dashboard**: Analytics and key metrics
- **Product Management**: CRUD operations with bulk actions
- **Order Management**: Status updates and tracking
- **User Management**: Role assignment and account control
- **Security Settings**: Configure security policies
- **Audit Logs**: Monitor admin activities
- **Analytics**: Revenue and user behavior insights

## 🎯 Performance Optimizations

- **Firebase Caching**: Custom query cache system
- **Lazy Loading**: Components and images
- **Code Splitting**: Route-based code splitting
- **Bundle Analysis**: Vite build optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use for learning or commercial projects.

## 🆘 Support

For issues or questions:
1. Check the documentation
2. Review the code comments
3. Check browser console for errors
4. Create an issue on GitHub

## 🎯 Roadmap

- [ ] Payment gateway integration
- [ ] Email notification system
- [ ] Advanced inventory management
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] API rate limiting
- [ ] Backup and restore system

---

Built with ❤️ using React + Firebase + TailwindCSS
>>>>>>> c390c2c (Firt commit)
