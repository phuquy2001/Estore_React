import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function AdminRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex justify-center py-12">Đang kiểm tra quyền...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Kiểm tra quyền admin (async → cần xử lý cẩn thận)
  // Cách đơn giản: dùng isAdmin từ context (sau khi đã load role)
  if (user.role !== 'admin' && user.role !== 'super_admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default AdminRoute