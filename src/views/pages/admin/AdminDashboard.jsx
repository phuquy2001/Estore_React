import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'

function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
              <p className="text-sm text-slate-600">Xin chào, {user?.name}</p>
            </div>
            <div className="flex gap-4">
              <Link to="/" className="btn btn-outline">
                Về trang chủ
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-3">
            <nav className="card p-4 space-y-2">
              <Link
                to="/admin"
                className="block px-4 py-2 rounded hover:bg-slate-100 transition-colors"
              >
                📊 Dashboard
              </Link>
              <Link
                to="/admin/products"
                className="block px-4 py-2 rounded hover:bg-slate-100 transition-colors"
              >
                📦 Quản lý sản phẩm
              </Link>
              <Link
                to="/admin/orders"
                className="block px-4 py-2 rounded hover:bg-slate-100 transition-colors"
              >
                🛒 Quản lý đơn hàng
              </Link>
              <Link
                to="/admin/users"
                className="block px-4 py-2 rounded hover:bg-slate-100 transition-colors"
              >
                👥 Quản lý người dùng
              </Link>
              <Link
                to="/admin/analytics"
                className="block px-4 py-2 rounded hover:bg-slate-100 transition-colors bg-blue-50 border border-blue-200"
              >
                📊 Advanced Analytics
              </Link>
              <Link
                to="/admin/logs"
                className="block px-4 py-2 rounded hover:bg-slate-100 transition-colors bg-red-50 border border-red-200"
              >
                📋 Admin Logs
              </Link>
              <Link
                to="/admin/settings"
                className="block px-4 py-2 rounded hover:bg-slate-100 transition-colors bg-gray-50 border border-gray-200"
              >
                ⚙️ Cài đặt hệ thống
              </Link>
              <Link
                to="/admin/settings/security"
                className="block px-4 py-2 rounded hover:bg-slate-100 transition-colors bg-orange-50 border border-orange-200"
              >
                🔒 Cài đặt bảo mật
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="col-span-9">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
