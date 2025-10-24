import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ordersAPI } from '../../services/apiService'
import { formatCurrency } from '../../models/productModel'
import { showErrorToast } from '../../services/notificationService'

function Profile() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && activeTab === 'orders') {
      loadOrders()
    }
  }, [user, activeTab])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await ordersAPI.getUserOrders(user.id)
      // Sort by newest first
      const sortedOrders = response.data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )
      setOrders(sortedOrders)
    } catch (error) {
      console.error('Failed to load orders:', error)
      showErrorToast('Không thể tải lịch sử đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
      shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' }
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  const getPaymentStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Chờ thanh toán', color: 'bg-orange-100 text-orange-800' },
      paid: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-800' },
      failed: { label: 'Thất bại', color: 'bg-red-100 text-red-800' }
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Tài khoản của tôi</h1>
            <p className="text-slate-600">Quản lý thông tin và đơn hàng của bạn</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card p-6">
                {/* User Info */}
                <div className="text-center mb-6 pb-6 border-b">
                  <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="font-semibold text-slate-900">{user?.name}</div>
                  <div className="text-sm text-slate-600">{user?.email}</div>
                </div>

                {/* Menu */}
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full text-left px-4 py-2 rounded transition-colors ${
                      activeTab === 'orders'
                        ? 'bg-primary text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    📦 Đơn hàng của tôi
                  </button>
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`w-full text-left px-4 py-2 rounded transition-colors ${
                      activeTab === 'info'
                        ? 'bg-primary text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    👤 Thông tin cá nhân
                  </button>
                  <button
                    onClick={() => setActiveTab('address')}
                    className={`w-full text-left px-4 py-2 rounded transition-colors ${
                      activeTab === 'address'
                        ? 'bg-primary text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    📍 Địa chỉ giao hàng
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Lịch sử đơn hàng</h2>
                    <div className="text-sm text-slate-600">
                      Tổng: {orders.length} đơn hàng
                    </div>
                  </div>

                  {loading ? (
                    <div className="card p-12 text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                      <p className="text-slate-600">Đang tải...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="card p-12 text-center">
                      <div className="text-6xl mb-4">📦</div>
                      <h3 className="text-xl font-semibold mb-2">Chưa có đơn hàng nào</h3>
                      <p className="text-slate-600 mb-6">
                        Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!
                      </p>
                      <Link to="/shop" className="btn btn-primary">
                        Khám phá sản phẩm
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="card hover:shadow-lg transition-shadow">
                          <div className="p-6">
                            {/* Order Header */}
                            <div className="flex flex-wrap items-center justify-between mb-4 pb-4 border-b">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-lg font-bold text-primary">
                                    #{order.id}
                                  </span>
                                  {getStatusBadge(order.status)}
                                </div>
                                <div className="text-sm text-slate-600">
                                  Đặt ngày:{' '}
                                  {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-primary mb-1">
                                  {formatCurrency(order.total)}
                                </div>
                                <div className="text-sm">
                                  {getPaymentStatusBadge(order.paymentStatus)}
                                </div>
                              </div>
                            </div>

                            {/* Order Items Preview */}
                            <div className="mb-4">
                              <div className="text-sm font-medium text-slate-700 mb-2">
                                Sản phẩm ({order.items.length})
                              </div>
                              <div className="flex gap-2 overflow-x-auto pb-2">
                                {order.items.slice(0, 4).map((item, index) => (
                                  <img
                                    key={index}
                                    src={item.image}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded flex-shrink-0"
                                  />
                                ))}
                                {order.items.length > 4 && (
                                  <div className="w-16 h-16 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
                                    <span className="text-sm text-slate-600">
                                      +{order.items.length - 4}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                              <Link
                                to={`/profile/order/${order.id}`}
                                className="btn btn-primary flex-1 text-center"
                              >
                                Xem chi tiết
                              </Link>
                              {order.status === 'pending' && (
                                <button
                                  onClick={() => {
                                    if (window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
                                      // TODO: Implement cancel order
                                      showErrorToast('Chức năng đang phát triển')
                                    }
                                  }}
                                  className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  Hủy đơn
                                </button>
                              )}
                              {order.status === 'completed' && (
                                <button className="btn btn-outline">
                                  Mua lại
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Personal Info Tab */}
              {activeTab === 'info' && (
                <div className="card p-6">
                  <h2 className="text-2xl font-bold mb-6">Thông tin cá nhân</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        className="input"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="input bg-slate-100"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={user?.phone || 'Chưa cập nhật'}
                        className="input"
                        readOnly
                      />
                    </div>
                    <div className="pt-4">
                      <button className="btn btn-primary" disabled>
                        Cập nhật thông tin (Đang phát triển)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Tab */}
              {activeTab === 'address' && (
                <div className="card p-6">
                  <h2 className="text-2xl font-bold mb-6">Địa chỉ giao hàng</h2>
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">📍</div>
                    <p className="text-slate-600 mb-4">
                      Chức năng quản lý địa chỉ đang được phát triển
                    </p>
                    <p className="text-sm text-slate-500">
                      Hiện tại: {user?.address || 'Chưa có địa chỉ'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
