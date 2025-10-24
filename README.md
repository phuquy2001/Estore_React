<<<<<<< HEAD
# Estore_React
=======
# 🛍️ Estore React - Full-Stack E-commerce Platform

Modern e-commerce platform built with React, Redux Toolkit, and JSON Server.

## 🚀 Features

### ✅ Implemented
- **Product Management**: Browse, search, filter, and sort products
- **Shopping Cart**: Add/remove items, update quantities, localStorage persistence
- **Authentication**: Login/Register system with role-based access
- **Admin Panel**: Manage products, orders, and users (admin only)
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **State Management**: Redux Toolkit for global state
- **API Integration**: RESTful API with JSON Server
- **Protected Routes**: Authentication-based route protection

### 🔜 Ready to Implement
- **Payment Integration**: VNPay, Momo, Stripe
- **Order Management**: Full order lifecycle
- **User Profile**: Order history, address management
- **Product Reviews**: Rating and comment system
- **Email Notifications**: Order confirmations

## 📦 Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Backend**: JSON Server (Mock API)
- **Styling**: TailwindCSS + Custom Components

## 🛠️ Installation

### Prerequisites
- Node.js >= 16.x
- npm or yarn

### Setup

1. **Clone the repository**
```bash
cd C:\Users\phuqu\.qodo\project\estore-react
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
# Run both frontend and backend
npm run dev:all

# Or run separately:
npm run server  # Backend on http://localhost:3001
npm run dev     # Frontend on http://localhost:5173
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

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
├── server/
│   ├── db.json              # JSON database
│   └── server.js            # Express API server
├── src/
│   ├── components/          # Reusable components
│   │   └── ProtectedRoute.jsx
│   ├── contexts/            # React contexts
│   │   └── AuthContext.jsx
│   ├── controllers/         # Redux slices
│   │   ├── store.js
│   │   ├── cartSlice.js
│   │   └── productSlice.js
│   ├── models/              # Business logic
│   │   └── productModel.js
│   ├── services/            # API services
│   │   ├── apiService.js
│   │   └── notificationService.js
│   ├── views/
│   │   ├── layouts/
│   │   │   └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Shop.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       └── AdminProducts.jsx
│   │   └── styles/
│   │       └── index.css
│   ├── App.jsx
│   └── main.jsx
├── .env                     # Environment variables
├── .gitignore
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3001
VITE_MOMO_PARTNER_CODE=your_momo_partner_code
VITE_VNPAY_TMN_CODE=your_vnpay_tmn_code
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key
```

## 🚢 Deployment

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
vercel env add VITE_API_URL
```

### Backend Deployment

For production, replace JSON Server with a real backend:
- **Node.js + Express + MongoDB**
- **Firebase**
- **Supabase**
- **AWS Amplify**

## 🔌 API Endpoints

### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get single product
- `POST /products` - Create product (admin)
- `PUT /products/:id` - Update product (admin)
- `DELETE /products/:id` - Delete product (admin)

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login user

### Orders
- `GET /orders` - Get all orders (admin)
- `GET /orders?userId=:id` - Get user orders
- `POST /orders` - Create order
- `PATCH /orders/:id` - Update order status (admin)

### Users
- `GET /users` - Get all users (admin)
- `GET /users/:id` - Get user details
- `PATCH /users/:id` - Update user

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

## 📝 Next Steps

1. **Implement Payment Gateways**
   - Create payment service in `src/services/paymentService.js`
   - Add payment methods to checkout flow

2. **Complete Admin Features**
   - Order management page
   - User management page
   - Dashboard statistics

3. **Add User Profile**
   - Order history
   - Address book
   - Wishlist

4. **Product Reviews**
   - Rating system
   - Review submission
   - Review moderation (admin)

5. **Email Integration**
   - SendGrid or AWS SES
   - Order confirmations
   - Password reset

## 🤝 Contributing

This is a demo project. Feel free to fork and modify as needed.

## 📄 License

MIT License - feel free to use for learning or commercial projects.

## 🆘 Support

For issues or questions:
1. Check the documentation
2. Review the code comments
3. Check browser console for errors

## 🎯 Performance Tips

- Images are loaded from Picsum (placeholder service)
- Replace with CDN or optimized images for production
- Enable lazy loading for product images
- Use React.memo() for expensive components
- Implement pagination for product lists

---

Built with ❤️ using React + Vite + TailwindCSS
>>>>>>> c390c2c (Firt commit)
