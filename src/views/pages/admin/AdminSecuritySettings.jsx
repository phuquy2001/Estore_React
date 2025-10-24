import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { 
  getAdminSecuritySettings,
  updateAdminSecuritySettings,
  hasDetailedPermission 
} from '../../../services/adminSecurityService'
import { DETAILED_PERMISSIONS } from '../../../services/enhancedRBACService'
import { showSuccessToast, showErrorToast } from '../../../services/notificationService'

/**
 * Admin Security Settings Component
 * Security configuration for admin area
 */
function AdminSecuritySettings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState(false)
  const [settings, setSettings] = useState({
    required2FA: true,
    sessionTimeout: 30,
    maxLoginAttempts: 3,
    lockoutDuration: 15,
    allowedIPs: [],
    logRetentionDays: 90,
    enableIPRestriction: false,
    enableSessionMonitoring: true,
    enableAuditLogging: true
  })

  useEffect(() => {
    checkPermissions()
    loadSettings()
  }, [])

  const checkPermissions = async () => {
    try {
      const canManage = await hasDetailedPermission(user.uid, DETAILED_PERMISSIONS.SETTINGS_SECURITY)
      setHasPermission(canManage)
      
      if (!canManage) {
        showErrorToast('Bạn không có quyền quản lý cài đặt bảo mật')
      }
    } catch (error) {
      console.error('Permission check error:', error)
    }
  }

  const loadSettings = async () => {
    try {
      setLoading(true)
      const securitySettings = getAdminSecuritySettings()
      setSettings(prev => ({
        ...prev,
        ...securitySettings,
        sessionTimeout: securitySettings.sessionTimeout / (60 * 1000), // Convert to minutes
        lockoutDuration: securitySettings.lockoutDuration / (60 * 1000), // Convert to minutes
        allowedIPs: securitySettings.allowedIPs.filter(ip => ip !== 'No IP restriction')
      }))
    } catch (error) {
      console.error('Load security settings error:', error)
      showErrorToast('Không thể tải cài đặt bảo mật')
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

  const handleIPChange = (index, value) => {
    const newIPs = [...settings.allowedIPs]
    newIPs[index] = value
    setSettings(prev => ({
      ...prev,
      allowedIPs: newIPs
    }))
  }

  const addIP = () => {
    setSettings(prev => ({
      ...prev,
      allowedIPs: [...prev.allowedIPs, '']
    }))
  }

  const removeIP = (index) => {
    setSettings(prev => ({
      ...prev,
      allowedIPs: prev.allowedIPs.filter((_, i) => i !== index)
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      const updatedSettings = {
        ...settings,
        sessionTimeout: settings.sessionTimeout * 60 * 1000, // Convert to milliseconds
        lockoutDuration: settings.lockoutDuration * 60 * 1000, // Convert to milliseconds
        allowedIPs: settings.enableIPRestriction ? settings.allowedIPs.filter(ip => ip.trim()) : []
      }
      
      const result = await updateAdminSecuritySettings(updatedSettings)
      
      if (result.success) {
        showSuccessToast('Cài đặt bảo mật đã được lưu thành công')
      } else {
        showErrorToast(result.message)
      }
    } catch (error) {
      console.error('Save security settings error:', error)
      showErrorToast('Không thể lưu cài đặt bảo mật')
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
          <p className="text-slate-600 mt-2">Bạn không có quyền quản lý cài đặt bảo mật</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-600">Đang tải cài đặt bảo mật...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">🔒 Cài đặt bảo mật</h2>
          <p className="text-slate-600 mt-1">Cấu hình bảo mật cho khu vực quản trị</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? '⏳ Đang lưu...' : '💾 Lưu cài đặt'}
        </button>
      </div>

      {/* 2FA Settings */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">🔐 Xác thực 2 yếu tố (2FA)</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">Bắt buộc 2FA cho admin</h4>
              <p className="text-sm text-slate-600">Yêu cầu tất cả admin phải kích hoạt 2FA</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.required2FA}
                onChange={(e) => handleChange('required2FA', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Session Settings */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">⏰ Quản lý phiên đăng nhập</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Thời gian hết phiên (phút)
            </label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
              className="input"
              min="5"
              max="480"
            />
            <p className="text-xs text-slate-500 mt-1">Từ 5 đến 480 phút</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Thời gian khóa tài khoản (phút)
            </label>
            <input
              type="number"
              value={settings.lockoutDuration}
              onChange={(e) => handleChange('lockoutDuration', parseInt(e.target.value))}
              className="input"
              min="5"
              max="60"
            />
            <p className="text-xs text-slate-500 mt-1">Sau khi đăng nhập sai quá số lần</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Số lần đăng nhập sai tối đa
            </label>
            <input
              type="number"
              value={settings.maxLoginAttempts}
              onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
              className="input"
              min="1"
              max="10"
            />
            <p className="text-xs text-slate-500 mt-1">Từ 1 đến 10 lần</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">Giám sát phiên</h4>
              <p className="text-sm text-slate-600">Theo dõi hoạt động phiên đăng nhập</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableSessionMonitoring}
                onChange={(e) => handleChange('enableSessionMonitoring', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* IP Restriction */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">🌐 Hạn chế IP</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">Kích hoạt hạn chế IP</h4>
              <p className="text-sm text-slate-600">Chỉ cho phép truy cập từ các IP được phép</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableIPRestriction}
                onChange={(e) => handleChange('enableIPRestriction', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {settings.enableIPRestriction && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Danh sách IP được phép
              </label>
              <div className="space-y-2">
                {settings.allowedIPs.map((ip, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ip}
                      onChange={(e) => handleIPChange(index, e.target.value)}
                      className="input flex-1"
                      placeholder="192.168.1.1 hoặc 192.168.1.0/24"
                    />
                    <button
                      onClick={() => removeIP(index)}
                      className="btn btn-outline text-red-600 hover:bg-red-50"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <button
                  onClick={addIP}
                  className="btn btn-outline w-full"
                >
                  ➕ Thêm IP
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Hỗ trợ IP đơn lẻ (192.168.1.1) hoặc dải IP (192.168.1.0/24)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Logging Settings */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">📋 Cài đặt ghi log</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">Ghi log audit</h4>
              <p className="text-sm text-slate-600">Ghi lại mọi hoạt động của admin</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableAuditLogging}
                onChange={(e) => handleChange('enableAuditLogging', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Thời gian lưu trữ logs (ngày)
            </label>
            <input
              type="number"
              value={settings.logRetentionDays}
              onChange={(e) => handleChange('logRetentionDays', parseInt(e.target.value))}
              className="input"
              min="7"
              max="365"
            />
            <p className="text-xs text-slate-500 mt-1">Từ 7 đến 365 ngày</p>
          </div>
        </div>
      </div>

      {/* Security Status */}
      <div className="card p-6 bg-green-50 border-green-200">
        <h3 className="text-lg font-semibold mb-4 text-green-800">🛡️ Trạng thái bảo mật</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700">2FA: {settings.required2FA ? 'Bắt buộc' : 'Tùy chọn'}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700">Session: {settings.sessionTimeout} phút</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700">IP: {settings.enableIPRestriction ? 'Hạn chế' : 'Mở'}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700">Logs: {settings.enableAuditLogging ? 'Bật' : 'Tắt'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSecuritySettings
