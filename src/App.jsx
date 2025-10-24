import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { lazy, Suspense } from 'react'
import store from './controllers/store'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './views/layouts/Layout'

// Lazy load pages for better performance (code splitting)
const Home = lazy(() => import('./views/pages/Home'))
const Shop = lazy(() => import('./views/pages/Shop'))
const ProductDetail = lazy(() => import('./views/pages/ProductDetail'))
const Cart = lazy(() => import('./views/pages/Cart'))
const Checkout = lazy(() => import('./views/pages/Checkout'))
const OrderSuccess = lazy(() => import('./views/pages/OrderSuccess'))
const Profile = lazy(() => import('./views/pages/Profile'))
const OrderDetail = lazy(() => import('./views/pages/OrderDetail'))
const Login = lazy(() => import('./views/pages/Login'))
const Register = lazy(() => import('./views/pages/Register'))
const ForgotPassword = lazy(() => import('./components/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./components/auth/ResetPassword'))
const AdminDashboard = lazy(() => import('./views/pages/admin/AdminDashboard'))
const AdminDashboardHome = lazy(() => import('./views/pages/admin/AdminDashboardHome'))
const AdminProducts = lazy(() => import('./views/pages/admin/AdminProducts'))
const AdminOrders = lazy(() => import('./views/pages/admin/AdminOrders'))
const AdminOrderDetail = lazy(() => import('./views/pages/admin/AdminOrderDetail'))
const AdminUsers = lazy(() => import('./views/pages/admin/AdminUsers'))
const AdminLogs = lazy(() => import('./views/pages/admin/AdminLogs'))
const AdminSettings = lazy(() => import('./views/pages/admin/AdminSettings'))
const AdminSecuritySettings = lazy(() => import('./views/pages/admin/AdminSecuritySettings'))
const AdvancedAnalytics = lazy(() => import('./components/admin/AdvancedAnalytics'))
const AdminSecurityWrapper = lazy(() => import('./components/admin/AdminSecurityWrapper'))

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-600">Đang tải...</p>
    </div>
  </div>
)

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
            {/* Public Routes */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
            </Route>

            {/* Checkout Routes - No layout */}
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />

            {/* Profile Routes - No layout */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/order/:orderId"
              element={
                <ProtectedRoute>
                  <OrderDetail />
                </ProtectedRoute>
              }
            />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Admin Routes - Protected */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminSecurityWrapper>
                    <AdminDashboard />
                  </AdminSecurityWrapper>
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardHome />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:orderId" element={<AdminOrderDetail />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="logs" element={<AdminLogs />} />
              <Route path="analytics" element={<AdvancedAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="settings/security" element={<AdminSecuritySettings />} />
            </Route>
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </Provider>
  )
}

export default App
