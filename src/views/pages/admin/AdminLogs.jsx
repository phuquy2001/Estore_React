import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { 
  getAdminLogs, 
  getAdminActivitySummary,
  hasDetailedPermission 
} from '../../../services/adminSecurityService'
import { DETAILED_PERMISSIONS } from '../../../services/enhancedRBACService'
import { showErrorToast } from '../../../services/notificationService'

/**
 * Admin Logs Component
 * View and manage admin activity logs
 */
function AdminLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    dateRange: '7d',
    limit: 100
  })
  const [activitySummary, setActivitySummary] = useState(null)
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    checkPermissions()
    loadLogs()
    loadActivitySummary()
  }, [filters])

  const checkPermissions = async () => {
    try {
      const canView = await hasDetailedPermission(user.uid, DETAILED_PERMISSIONS.SECURITY_LOGS)
      setHasPermission(canView)
      
      if (!canView) {
        showErrorToast('Bạn không có quyền xem logs admin')
      }
    } catch (error) {
      console.error('Permission check error:', error)
    }
  }

  const loadLogs = async () => {
    try {
      setLoading(true)
      const logsData = await getAdminLogs(filters.userId, filters.limit)
      setLogs(logsData)
    } catch (error) {
      console.error('Load logs error:', error)
      showErrorToast('Không thể tải logs')
    } finally {
      setLoading(false)
    }
  }

  const loadActivitySummary = async () => {
    try {
      const summary = await getAdminActivitySummary(user.uid, 7)
      setActivitySummary(summary)
    } catch (error) {
      console.error('Load activity summary error:', error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User ID', 'Action', 'IP', 'User Agent'],
      ...logs.map(log => [
        log.timestamp?.toDate?.()?.toISOString() || 'N/A',
        log.userId || 'N/A',
        log.action || 'N/A',
        log.ip || 'N/A',
        log.userAgent || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `admin-logs-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const getActionIcon = (action) => {
    const actionIcons = {
      'admin_login': '🔐',
      'admin_logout': '🚪',
      'view_products': '👁️',
      'create_product': '➕',
      'update_product': '✏️',
      'delete_product': '🗑️',
      'view_orders': '📋',
      'update_order': '📝',
      'delete_order': '❌',
      'view_users': '👥',
      'update_user': '👤',
      'delete_user': '👤❌',
      'view_analytics': '📊',
      'export_data': '📤',
      'system_settings': '⚙️',
      'security_settings': '🔒'
    }
    return actionIcons[action] || '📝'
  }

  const getActionColor = (action) => {
    if (action.includes('login')) return 'text-green-600'
    if (action.includes('logout')) return 'text-blue-600'
    if (action.includes('delete')) return 'text-red-600'
    if (action.includes('create')) return 'text-green-600'
    if (action.includes('update')) return 'text-blue-600'
    return 'text-slate-600'
  }

  if (!hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Không có quyền truy cập</h2>
          <p className="text-slate-600 mt-2">Bạn không có quyền xem logs admin</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-600">Đang tải logs...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">📋 Admin Logs</h2>
          <p className="text-slate-600 mt-1">Theo dõi hoạt động quản trị</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportLogs}
            className="btn btn-outline"
          >
            📥 Export CSV
          </button>
          <button
            onClick={loadLogs}
            className="btn btn-primary"
          >
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* Activity Summary */}
      {activitySummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Tổng hoạt động</p>
                <p className="text-2xl font-bold text-blue-600">
                  {activitySummary.totalActions}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                📊
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Thời gian</p>
                <p className="text-2xl font-bold text-green-600">
                  {activitySummary.period}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                ⏰
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Hoạt động cuối</p>
                <p className="text-sm font-bold text-purple-600">
                  {activitySummary.lastActivity ? 
                    new Date(activitySummary.lastActivity.seconds * 1000).toLocaleDateString('vi-VN') : 
                    'N/A'
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                🔄
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Loại hoạt động</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Object.keys(activitySummary.actionCounts).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                📝
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              className="input"
              placeholder="Lọc theo User ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Hành động
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="input"
            >
              <option value="">Tất cả hành động</option>
              <option value="admin_login">Đăng nhập</option>
              <option value="admin_logout">Đăng xuất</option>
              <option value="view_products">Xem sản phẩm</option>
              <option value="create_product">Tạo sản phẩm</option>
              <option value="update_product">Sửa sản phẩm</option>
              <option value="delete_product">Xóa sản phẩm</option>
              <option value="view_orders">Xem đơn hàng</option>
              <option value="update_order">Sửa đơn hàng</option>
              <option value="view_users">Xem người dùng</option>
              <option value="update_user">Sửa người dùng</option>
              <option value="view_analytics">Xem analytics</option>
              <option value="export_data">Xuất dữ liệu</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Thời gian
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="input"
            >
              <option value="1d">1 ngày</option>
              <option value="7d">7 ngày</option>
              <option value="30d">30 ngày</option>
              <option value="90d">90 ngày</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Số lượng
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="input"
            >
              <option value={50}>50 logs</option>
              <option value={100}>100 logs</option>
              <option value={200}>200 logs</option>
              <option value={500}>500 logs</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Thời gian
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Hành động
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  User ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  IP
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                  Chi tiết
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log, index) => (
                <tr key={log.id || index} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-sm">
                    {log.timestamp?.toDate?.()?.toLocaleString('vi-VN') || 'N/A'}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getActionIcon(log.action)}
                      </span>
                      <span className={`font-medium ${getActionColor(log.action)}`}>
                        {log.action || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-mono">
                    {log.userId || 'N/A'}
                  </td>
                  <td className="px-4 py-4 text-sm font-mono">
                    {log.ip || 'N/A'}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <div className="max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : 'N/A'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {logs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-slate-600">Không có logs nào</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminLogs
