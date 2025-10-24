import { useState, useEffect } from 'react'
import { productsAPI, ordersAPI, usersAPI } from '../../services/apiService'
import { showErrorToast } from '../../services/notificationService'

/**
 * Advanced Analytics Component
 * Comprehensive analytics dashboard with multiple chart types
 */
function AdvancedAnalytics() {
  const [analytics, setAnalytics] = useState({
    revenue: {
      total: 0,
      growth: 0,
      monthly: [],
      daily: []
    },
    customers: {
      total: 0,
      new: 0,
      active: 0,
      retention: 0
    },
    products: {
      total: 0,
      topSelling: [],
      lowStock: [],
      categories: []
    },
    orders: {
      total: 0,
      completed: 0,
      pending: 0,
      cancelled: 0,
      averageValue: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('revenue')

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Load all data in parallel
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        productsAPI.getAll(),
        ordersAPI.getAll(),
        usersAPI.getAll()
      ])

      const products = productsRes.data || []
      const orders = ordersRes.data || []
      const users = usersRes.data || []

      // Calculate analytics
      const analyticsData = calculateAnalytics(products, orders, users, dateRange)
      setAnalytics(analyticsData)
    } catch (error) {
      showErrorToast('Không thể tải dữ liệu analytics')
      console.error('Analytics error:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalytics = (products, orders, users, range) => {
    const now = new Date()
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    // Filter data by date range
    const recentOrders = orders.filter(order => {
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
      return orderDate >= startDate
    })

    const recentUsers = users.filter(user => {
      const userDate = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt)
      return userDate >= startDate
    })

    // Revenue calculations
    const totalRevenue = recentOrders.reduce((sum, order) => sum + (order.total || 0), 0)
    const completedOrders = recentOrders.filter(order => order.status === 'completed')
    const completedRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0)

    // Calculate growth (compare with previous period)
    const previousStartDate = new Date(startDate.getTime() - days * 24 * 60 * 60 * 1000)
    const previousOrders = orders.filter(order => {
      const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
      return orderDate >= previousStartDate && orderDate < startDate
    })
    const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.total || 0), 0)
    const revenueGrowth = previousRevenue > 0 ? ((completedRevenue - previousRevenue) / previousRevenue * 100) : 0

    // Daily revenue for chart
    const dailyRevenue = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayOrders = recentOrders.filter(order => {
        const orderDate = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt)
        return orderDate.toDateString() === date.toDateString()
      })
      const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0)
      dailyRevenue.push({
        date: date.toISOString().split('T')[0],
        revenue: dayRevenue
      })
    }

    // Customer analytics
    const totalCustomers = users.length
    const newCustomers = recentUsers.length
    const activeCustomers = [...new Set(recentOrders.map(order => order.userId))].length
    const retentionRate = totalCustomers > 0 ? (activeCustomers / totalCustomers * 100) : 0

    // Product analytics
    const totalProducts = products.length
    const lowStockProducts = products.filter(p => (p.stock || 0) < 10)
    
    // Top selling products
    const productSales = {}
    recentOrders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          productSales[item.productId] = (productSales[item.productId] || 0) + item.quantity
        })
      }
    })
    
    const topSelling = Object.entries(productSales)
      .map(([productId, sales]) => {
        const product = products.find(p => p.id === productId)
        return product ? { ...product, sales } : null
      })
      .filter(Boolean)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)

    // Category distribution
    const categorySales = {}
    products.forEach(product => {
      const category = product.category || 'Other'
      categorySales[category] = (categorySales[category] || 0) + 1
    })

    // Order analytics
    const totalOrders = recentOrders.length
    const completedOrdersCount = completedOrders.length
    const pendingOrders = recentOrders.filter(order => order.status === 'pending').length
    const cancelledOrders = recentOrders.filter(order => order.status === 'cancelled').length
    const averageOrderValue = totalOrders > 0 ? completedRevenue / totalOrders : 0

    return {
      revenue: {
        total: completedRevenue,
        growth: revenueGrowth,
        daily: dailyRevenue
      },
      customers: {
        total: totalCustomers,
        new: newCustomers,
        active: activeCustomers,
        retention: retentionRate
      },
      products: {
        total: totalProducts,
        topSelling,
        lowStock: lowStockProducts,
        categories: Object.entries(categorySales).map(([name, count]) => ({ name, count }))
      },
      orders: {
        total: totalOrders,
        completed: completedOrdersCount,
        pending: pendingOrders,
        cancelled: cancelledOrders,
        averageValue: averageOrderValue
      }
    }
  }

  const exportReport = () => {
    const reportData = {
      dateRange,
      generatedAt: new Date().toISOString(),
      analytics
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-report-${dateRange}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-600">Đang tải analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📊 Advanced Analytics</h2>
          <p className="text-slate-600 mt-1">Phân tích chi tiết hiệu suất kinh doanh</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input"
          >
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
          </select>
          <button
            onClick={exportReport}
            className="btn btn-outline"
          >
            📥 Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Doanh thu</p>
              <p className="text-2xl font-bold text-green-600">
                {analytics.revenue.total.toLocaleString()}đ
              </p>
              <p className={`text-sm ${analytics.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.revenue.growth >= 0 ? '↗️' : '↘️'} {Math.abs(analytics.revenue.growth).toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              💰
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Khách hàng</p>
              <p className="text-2xl font-bold text-blue-600">
                {analytics.customers.total.toLocaleString()}
              </p>
              <p className="text-sm text-slate-600">
                +{analytics.customers.new} mới
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              👥
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Đơn hàng</p>
              <p className="text-2xl font-bold text-purple-600">
                {analytics.orders.total.toLocaleString()}
              </p>
              <p className="text-sm text-slate-600">
                {analytics.orders.completed} hoàn thành
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              🛒
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Sản phẩm</p>
              <p className="text-2xl font-bold text-orange-600">
                {analytics.products.total.toLocaleString()}
              </p>
              <p className="text-sm text-slate-600">
                {analytics.products.lowStock.length} sắp hết
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              📦
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">📈 Doanh thu theo ngày</h3>
          <div className="h-64">
            <RevenueChart data={analytics.revenue.daily} />
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">📊 Phân bố danh mục</h3>
          <div className="h-64">
            <CategoryChart data={analytics.products.categories} />
          </div>
        </div>
      </div>

      {/* Top Products & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">🏆 Sản phẩm bán chạy</h3>
          <div className="space-y-3">
            {analytics.products.topSelling.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                  />
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-slate-600">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{product.sales} bán</p>
                  <p className="text-xs text-slate-600">{product.price?.toLocaleString()}đ</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">⚠️ Sắp hết hàng</h3>
          <div className="space-y-3">
            {analytics.products.lowStock.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                  />
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-slate-600">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-red-600">{product.stock} còn</p>
                  <p className="text-xs text-slate-600">Cần nhập thêm</p>
                </div>
              </div>
            ))}
            {analytics.products.lowStock.length === 0 && (
              <p className="text-center text-slate-500 py-4">✅ Tất cả sản phẩm đều đủ hàng</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple Revenue Chart Component
function RevenueChart({ data }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue))
  
  return (
    <div className="h-full flex items-end gap-2">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center">
          <div
            className="w-full bg-primary rounded-t"
            style={{
              height: `${(item.revenue / maxRevenue) * 200}px`,
              minHeight: '4px'
            }}
          ></div>
          <div className="text-xs text-slate-600 mt-2">
            {new Date(item.date).getDate()}
          </div>
          <div className="text-xs text-slate-500">
            {item.revenue.toLocaleString()}đ
          </div>
        </div>
      ))}
    </div>
  )
}

// Simple Category Chart Component
function CategoryChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={item.name} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded"
              style={{
                backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
              }}
            ></div>
            <span className="text-sm font-medium">{item.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-32 bg-slate-200 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{
                  width: `${(item.count / total) * 100}%`,
                  backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`
                }}
              ></div>
            </div>
            <span className="text-sm text-slate-600 w-8 text-right">
              {item.count}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AdvancedAnalytics
