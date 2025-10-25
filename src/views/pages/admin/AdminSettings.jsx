import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { 
  hasDetailedPermission 
} from '../../../services/adminSecurityService'
import { DETAILED_PERMISSIONS } from '../../../services/enhancedRBACService'
import { showSuccessToast, showErrorToast } from '../../../services/notificationService'

/**
 * Admin Settings Component
 * General admin settings and configuration
 */
function AdminSettings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState(false)
  const [settings, setSettings] = useState({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    timezone: 'Asia/Ho_Chi_Minh',
    currency: 'VND',
    language: 'vi',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true
  })

  useEffect(() => {
    checkPermissions()
    loadSettings()
  }, [])

  const checkPermissions = async () => {
    try {
      const canManage = await hasDetailedPermission(user.uid, DETAILED_PERMISSIONS.SETTINGS_GENERAL)
      setHasPermission(canManage)
      
      if (!canManage) {
        showErrorToast('Bạn không có quyền quản lý cài đặt')
      }
    } catch (error) {
      console.error('Permission check error:', error)
    }
  }

  const loadSettings = async () => {
    try {
      setLoading(true)
      // In production, load from Firestore
      // For demo, use default settings
      setSettings({
        siteName: 'E-Store Admin',
        siteDescription: 'Hệ thống quản lý cửa hàng trực tuyến',
        contactEmail: 'admin@estore.com',
        contactPhone: '0123456789',
        timezone: 'Asia/Ho_Chi_Minh',
        currency: 'VND',
        language: 'vi',
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: true
      })
    } catch (error) {
      console.error('Load settings error:', error)
      showErrorToast('Không thể tải cài đặt')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      // In production, save to Firestore
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      showSuccessToast('Cài đặt đã được lưu thành công')
    } catch (error) {
      console.error('Save settings error:', error)
      showErrorToast('Không thể lưu cài đặt')
    } finally {
      setLoading(false)
    }
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
          <p className="text-slate-600 mt-2">Bạn không có quyền quản lý cài đặt</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-600">Đang tải cài đặt...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">⚙️ Cài đặt hệ thống</h2>
          <p className="text-slate-600 mt-1">Quản lý cài đặt chung của hệ thống</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? '⏳ Đang lưu...' : '💾 Lưu cài đặt'}
        </button>
      </div>

      {/* General Settings */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">🌐 Thông tin website</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tên website
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => handleChange('siteName', e.target.value)}
              className="input"
              placeholder="Tên website"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mô tả website
            </label>
            <input
              type="text"
              value={settings.siteDescription}
              onChange={(e) => handleChange('siteDescription', e.target.value)}
              className="input"
              placeholder="Mô tả website"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email liên hệ
            </label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              className="input"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={settings.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              className="input"
              placeholder="0123456789"
            />
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">🔧 Cài đặt hệ thống</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Múi giờ
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="input"
            >
              <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (GMT+7)</option>
              <option value="UTC">UTC (GMT+0)</option>
              <option value="America/New_York">America/New_York (GMT-5)</option>
              <option value="Europe/London">Europe/London (GMT+0)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Đơn vị tiền tệ
            </label>
            <select
              value={settings.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="input"
            >
              <option value="VND">VND (Việt Nam Đồng)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="GBP">GBP (British Pound)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Ngôn ngữ
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleChange('language', e.target.value)}
              className="input"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">🔒 Cài đặt bảo mật</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">Chế độ bảo trì</h4>
              <p className="text-sm text-slate-600">Tạm thời đóng website để bảo trì</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">Cho phép đăng ký</h4>
              <p className="text-sm text-slate-600">Cho phép người dùng mới đăng ký tài khoản</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowRegistration}
                onChange={(e) => handleChange('allowRegistration', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">Xác thực email</h4>
              <p className="text-sm text-slate-600">Yêu cầu xác thực email khi đăng ký</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireEmailVerification}
                onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">⚡ Hành động nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn btn-outline">
            🔄 Làm mới cache
          </button>
          <button className="btn btn-outline">
            📊 Xem logs hệ thống
          </button>
          <button className="btn btn-outline">
            💾 Backup dữ liệu
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
