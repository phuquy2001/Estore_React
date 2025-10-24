import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '../../contexts/AuthContext'

function Layout() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const cartItems = useSelector(state => state.cart.items)
  const cartCount = cartItems.reduce((total, item) => total + item.qty, 0)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-primary">
              Estore
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-slate-700 hover:text-primary transition-colors font-medium">
                Trang chủ
              </Link>
              <Link to="/shop" className="text-slate-700 hover:text-primary transition-colors font-medium">
                Cửa hàng
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="text-sm text-slate-700 hover:text-primary transition-colors font-medium"
                  >
                    👤 Tài khoản
                  </Link>
                  {/* Đã ẩn nút Admin theo yêu cầu */}
                  <button onClick={logout} className="btn btn-outline text-sm">
                    Đăng xuất
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn btn-outline">
                  Đăng nhập
                </Link>
              )}

              {/* Cart Button */}
              <button
                onClick={() => navigate('/cart')}
                className="relative btn btn-outline"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Giỏ hàng</span>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4">Estore</h3>
              <p className="text-slate-400 text-sm">
                Cửa hàng thời trang hiện đại với các sản phẩm chất lượng cao.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Liên kết</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link to="/shop" className="text-slate-400 hover:text-white transition-colors">
                    Cửa hàng
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Chính sách đổi trả</li>
                <li>Hướng dẫn mua hàng</li>
                <li>Thanh toán</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Email: support@estore.com</li>
                <li>Hotline: 1900 1234</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2025 Estore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
