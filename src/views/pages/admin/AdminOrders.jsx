import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ordersAPI } from '../../../services/apiService'
import { formatCurrency } from '../../../models/productModel'
import { showSuccessToast, showErrorToast } from '../../../services/notificationService'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await ordersAPI.getAll()
      // Sort by newest first
      const sortedOrders = response.data.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      )
      setOrders(sortedOrders)
    } catch (error) {
      console.error('Failed to load orders:', error)
      showErrorToast('Không thể tải danh sách đơn hàng')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus)
      showSuccessToast('Cập nhật trạng thái thành công')
      loadOrders() // Reload to see changes
    } catch (error) {
      console.error('Failed to update status:', error)
      showErrorToast('Cập nhật trạng thái thất bại')
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
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  // Export functions
  const exportToCSV = () => {
    const csvContent = [
      ['Mã đơn', 'Khách hàng', 'SĐT', 'Ngày đặt', 'Tổng tiền', 'Trạng thái', 'Phương thức thanh toán'],
      ...filteredOrders.map(order => [
        order.id,
        order.shippingAddress?.fullName || 'N/A',
        order.shippingAddress?.phone || 'N/A',
        new Date(order.createdAt).toLocaleDateString('vi-VN'),
        order.total,
        order.status,
        order.paymentMethod || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showSuccessToast('Đã xuất file CSV')
  }

  const printOrders = () => {
    const printWindow = window.open('', '_blank')
    const ordersHTML = filteredOrders.map(order => `
      <div style="border: 1px solid #ccc; margin: 10px; padding: 10px;">
        <h3>Đơn hàng #${order.id}</h3>
        <p><strong>Khách hàng:</strong> ${order.shippingAddress?.fullName || 'N/A'}</p>
        <p><strong>SĐT:</strong> ${order.shippingAddress?.phone || 'N/A'}</p>
        <p><strong>Ngày đặt:</strong> ${new Date(order.createdAt).toLocaleString('vi-VN')}</p>
        <p><strong>Tổng tiền:</strong> ${formatCurrency(order.total)}</p>
        <p><strong>Trạng thái:</strong> ${order.status}</p>
      </div>
    `).join('')
    
    printWindow.document.write(`
      <html>
        <head><title>Danh sách đơn hàng</title></head>
        <body>
          <h1>Danh sách đơn hàng</h1>
          ${ordersHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.phone?.includes(searchTerm)
    
    const matchesDate = !dateRange.start || !dateRange.end || (
      new Date(order.createdAt) >= new Date(dateRange.start) &&
      new Date(order.createdAt) <= new Date(dateRange.end)
    )
    
    return matchesStatus && matchesSearch && matchesDate
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt)
      case 'total_high':
        return b.total - a.total
      case 'total_low':
        return a.total - b.total
      default:
        return 0
    }
  })

  // Statistics
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipping: orders.filter(o => o.status === 'shipping').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    revenue: orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-600">Đang tải...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Quản lý đơn hàng</h2>
          <p className="text-slate-600 mt-1">Tổng: {orders.length} đơn hàng</p>
        </div>
        <button
          onClick={loadOrders}
          className="btn btn-outline"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-sm text-slate-600 mb-1">Tổng đơn hàng</div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-600 mb-1">Chờ xác nhận</div>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-600 mb-1">Đang giao</div>
          <div className="text-2xl font-bold text-purple-600">{stats.shipping}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-600 mb-1">Doanh thu</div>
          <div className="text-xl font-bold text-green-600">
            {formatCurrency(stats.revenue)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Mã đơn, tên khách hàng, SĐT..."
              className="input"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Lọc theo trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="all">Tất cả ({stats.total})</option>
              <option value="pending">Chờ xác nhận ({stats.pending})</option>
              <option value="confirmed">Đã xác nhận ({stats.confirmed})</option>
              <option value="shipping">Đang giao ({stats.shipping})</option>
              <option value="completed">Hoàn thành ({stats.completed})</option>
              <option value="cancelled">Đã hủy ({stats.cancelled})</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Khoảng thời gian
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="input text-sm"
                placeholder="Từ ngày"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="input text-sm"
                placeholder="Đến ngày"
              />
            </div>
          </div>

          {/* Sort & Export */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sắp xếp & Xuất
            </label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input text-sm flex-1"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="total_high">Giá cao-thấp</option>
                <option value="total_low">Giá thấp-cao</option>
              </select>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={exportToCSV}
                className="btn btn-outline text-sm"
              >
                📊 CSV
              </button>
              <button
                onClick={printOrders}
                className="btn btn-outline text-sm"
              >
                🖨️ In
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-slate-600">
            {searchTerm || filterStatus !== 'all'
              ? 'Không tìm thấy đơn hàng nào'
              : 'Chưa có đơn hàng nào'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Mã đơn
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Khách hàng
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Ngày đặt
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Tổng tiền
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="font-mono text-sm font-medium text-primary">
                        #{order.id}
                      </div>
                      <div className="text-xs text-slate-500">
                        {order.items.length} sản phẩm
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-sm">
                        {order.shippingAddress.fullName}
                      </div>
                      <div className="text-xs text-slate-600">
                        📞 {order.shippingAddress.phone}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-slate-900">
                        {formatCurrency(order.total)}
                      </div>
                      <div className="text-xs text-slate-500">
                        {order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="mb-2">
                        {getStatusBadge(order.status)}
                      </div>
                      <select
                        value={order.status}
                        onChange={(e) => {
                          if (window.confirm('Bạn có chắc muốn thay đổi trạng thái đơn hàng?')) {
                            handleUpdateStatus(order.id, e.target.value)
                          }
                        }}
                        className="text-xs border rounded px-2 py-1 w-full"
                      >
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="shipping">Đang giao</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        Xem chi tiết →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      {filteredOrders.length > 0 && (
        <div className="mt-4 text-sm text-slate-600 text-right">
          Hiển thị {filteredOrders.length} / {orders.length} đơn hàng
        </div>
      )}
    </div>
  )
}

export default AdminOrders
