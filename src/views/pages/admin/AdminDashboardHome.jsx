import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ordersAPI, productsAPI } from '../../../services/apiService'
import { formatCurrency } from '../../../models/productModel'
import AnalyticsChart from '../../../components/admin/AnalyticsChart'

/**
 * Admin Dashboard Home Page
 * Shows statistics and quick actions
 */
function AdminDashboardHome() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState({
    revenueChart: [],
    ordersChart: [],
    categoryChart: [],
    topProducts: []
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load products
      const productsRes = await productsAPI.getAll()
      const products = productsRes.data || []

      // Load orders
      const ordersRes = await ordersAPI.getAll()
      const orders = ordersRes.data || []

      // Calculate stats
      const pendingOrders = orders.filter(o => o.status === 'pending').length
      const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length
      const totalRevenue = orders
        .filter(o => o.status === 'completed' || o.status === 'delivered')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
      const lowStockProducts = products.filter(p => (p.stock || 0) < 10).length

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        pendingOrders,
        completedOrders,
        totalRevenue,
        lowStockProducts
      })

      // Get 5 most recent orders
      const sortedOrders = [...orders].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )
      setRecentOrders(sortedOrders.slice(0, 5))

      // Generate analytics data
      generateAnalytics(products, orders)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateAnalytics = (products, orders) => {
    // Revenue chart (last 7 days)
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate.toDateString() === date.toDateString() && 
               (order.status === 'completed' || order.status === 'delivered')
      })
      const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      
      last7Days.push({
        label: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
        value: Math.round(dayRevenue / 1000) // Convert to thousands
      })
    }

    // Orders chart (last 7 days)
    const ordersChart = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate.toDateString() === date.toDateString()
      })
      
      ordersChart.push({
        label: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
        value: dayOrders.length
      })
    }

    // Category distribution
    const categoryStats = {}
    products.forEach(product => {
      categoryStats[product.category] = (categoryStats[product.category] || 0) + 1
    })
    const categoryChart = Object.entries(categoryStats).map(([category, count]) => ({
      label: category,
      value: count
    }))

    // Top products by orders
    const productOrderCount = {}
    orders.forEach(order => {
      order.items?.forEach(item => {
        productOrderCount[item.productId] = (productOrderCount[item.productId] || 0) + item.quantity
      })
    })
    const topProducts = Object.entries(productOrderCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([productId, count]) => {
        const product = products.find(p => p.id === productId)
        return {
          label: product?.name || 'Unknown',
          value: count
        }
      })

    setAnalytics({
      revenueChart: last7Days,
      ordersChart,
      categoryChart,
      topProducts
    })
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
      processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
      shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
      delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' }
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">📊 Dashboard</h2>
        <p className="text-slate-600 mt-1">Tổng quan hệ thống</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Sản phẩm</p>
              <p className="text-3xl font-bold text-blue-900">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          {stats.lowStockProducts > 0 && (
            <p className="text-xs text-blue-700 mt-2">
              ⚠️ {stats.lowStockProducts} sản phẩm sắp hết hàng
            </p>
          )}
        </div>

        {/* Total Orders */}
        <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 mb-1">Đơn hàng</p>
              <p className="text-3xl font-bold text-purple-900">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-purple-700 mt-2">
            {stats.completedOrders} hoàn thành
          </p>
        </div>

        {/* Pending Orders */}
        <div className="card p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600 mb-1">Chờ xử lý</p>
              <p className="text-3xl font-bold text-yellow-900">{stats.pendingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <Link to="/admin/orders" className="text-xs text-yellow-700 mt-2 hover:underline inline-block">
            Xem tất cả →
          </Link>
        </div>

        {/* Total Revenue */}
        <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Doanh thu</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-green-700 mt-2">
            Từ {stats.completedOrders} đơn hoàn thành
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link to="/admin/products" className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Quản lý sản phẩm</h3>
              <p className="text-sm text-slate-600">Thêm, sửa, xóa sản phẩm</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/orders" className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Quản lý đơn hàng</h3>
              <p className="text-sm text-slate-600">Xử lý & cập nhật đơn hàng</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/analytics" className="card p-6 hover:shadow-lg transition-shadow bg-blue-50 border-blue-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Advanced Analytics</h3>
              <p className="text-sm text-slate-600">Phân tích chi tiết & báo cáo</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/logs" className="card p-6 hover:shadow-lg transition-shadow bg-red-50 border-red-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Admin Logs</h3>
              <p className="text-sm text-slate-600">Theo dõi hoạt động quản trị</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/settings" className="card p-6 hover:shadow-lg transition-shadow bg-gray-50 border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Cài đặt hệ thống</h3>
              <p className="text-sm text-slate-600">Quản lý cài đặt chung</p>
            </div>
          </div>
        </Link>

        <Link to="/admin/settings/security" className="card p-6 hover:shadow-lg transition-shadow bg-orange-50 border-orange-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Cài đặt bảo mật</h3>
              <p className="text-sm text-slate-600">Cấu hình bảo mật admin</p>
            </div>
          </div>
        </Link>

      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart
          data={analytics.revenueChart}
          type="line"
          title="📈 Doanh thu 7 ngày qua (nghìn VNĐ)"
          color="green"
        />
        <AnalyticsChart
          data={analytics.ordersChart}
          type="line"
          title="📊 Đơn hàng 7 ngày qua"
          color="blue"
        />
        <AnalyticsChart
          data={analytics.categoryChart}
          type="bar"
          title="📦 Phân bố sản phẩm theo danh mục"
          color="purple"
        />
        <AnalyticsChart
          data={analytics.topProducts}
          type="bar"
          title="🏆 Sản phẩm bán chạy"
          color="yellow"
        />
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Đơn hàng gần đây</h3>
            <Link to="/admin/orders" className="text-sm text-primary hover:underline">
              Xem tất cả →
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Mã đơn</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Tổng tiền</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Ngày đặt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <Link to={`/admin/orders/${order.id}`} className="text-primary hover:underline font-medium">
                        #{order.id?.slice(0, 8)}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.customerName || 'N/A'}</div>
                      <div className="text-sm text-slate-500">{order.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {formatCurrency(order.totalAmount || 0)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardHome
