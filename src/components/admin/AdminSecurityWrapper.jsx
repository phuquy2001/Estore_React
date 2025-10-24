import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  checkAdminSecurity, 
  logAdminAction, 
  getClientIP,
  checkAdminSession 
} from '../../services/adminSecurityService'
import { 
  canAccessAdminArea, 
  getAccessibleAdminSections 
} from '../../services/enhancedRBACService'
import { showErrorToast } from '../../services/notificationService'

/**
 * Admin Security Wrapper Component
 * Enforces maximum security for admin area
 */
function AdminSecurityWrapper({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [securityCheck, setSecurityCheck] = useState(null)
  const [accessibleSections, setAccessibleSections] = useState({})
  const [sessionValid, setSessionValid] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login', { 
        state: { from: location },
        replace: true 
      })
      return
    }

    performSecurityChecks()
  }, [user, location])

  const performSecurityChecks = async () => {
    try {
      setLoading(true)

      // 1. Check admin access
      const accessCheck = await canAccessAdminArea(user.uid)
      if (!accessCheck.success) {
        showErrorToast(accessCheck.message)
        navigate('/', { replace: true })
        return
      }

      // 2. Check admin security requirements
      const securityResult = await checkAdminSecurity(user.uid)
      if (!securityResult.success) {
        showErrorToast(securityResult.message)
        navigate('/', { replace: true })
        return
      }

      // 3. Check session validity
      const sessionCheck = await checkAdminSession(user.uid)
      if (!sessionCheck.success) {
        showErrorToast(sessionCheck.message)
        navigate('/login', { replace: true })
        return
      }

      // 4. Get accessible sections
      const sections = await getAccessibleAdminSections(user.uid)
      setAccessibleSections(sections)

      // 5. Get client IP
      const clientIP = await getClientIP()

      // 6. Log admin access
      await logAdminAction(
        user.uid,
        'admin_area_access',
        {
          path: location.pathname,
          timestamp: new Date().toISOString()
        },
        clientIP
      )

      setSecurityCheck(securityResult)
      setSessionValid(true)

    } catch (error) {
      console.error('Admin security check error:', error)
      showErrorToast('Lỗi kiểm tra bảo mật admin')
      navigate('/', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  // Check if current route is accessible
  const isRouteAccessible = () => {
    const path = location.pathname
    
    // Dashboard is always accessible if user has admin access
    if (path === '/admin' || path === '/admin/') {
      return accessibleSections.dashboard
    }
    
    // Check specific sections
    if (path.startsWith('/admin/products')) {
      return accessibleSections.products
    }
    
    if (path.startsWith('/admin/orders')) {
      return accessibleSections.orders
    }
    
    if (path.startsWith('/admin/users')) {
      return accessibleSections.users
    }
    
    if (path.startsWith('/admin/analytics')) {
      return accessibleSections.analytics
    }
    
    if (path.startsWith('/admin/settings')) {
      return accessibleSections.settings
    }
    
    if (path.startsWith('/admin/security')) {
      return accessibleSections.security
    }
    
    if (path.startsWith('/admin/inventory')) {
      return accessibleSections.inventory
    }
    
    if (path.startsWith('/admin/marketing')) {
      return accessibleSections.marketing
    }
    
    if (path.startsWith('/admin/finance')) {
      return accessibleSections.finance
    }
    
    return true // Default to accessible
  }

  // Handle security violations
  const handleSecurityViolation = (violation) => {
    console.error('Security violation:', violation)
    showErrorToast('Vi phạm bảo mật: ' + violation)
    navigate('/admin', { replace: true })
  }

  // Check 2FA requirement
  const check2FARequirement = () => {
    if (securityCheck?.requires2FA) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">
                Yêu cầu xác thực 2FA
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Để truy cập khu vực quản trị, bạn cần kích hoạt xác thực 2 yếu tố
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => navigate('/admin/settings/security')}
                className="btn btn-primary w-full"
              >
                🔐 Kích hoạt 2FA
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="btn btn-outline w-full"
              >
                🏠 Về trang chủ
              </button>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Check IP restriction
  const checkIPRestriction = () => {
    if (securityCheck?.requiresIPCheck) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">
                Truy cập bị hạn chế
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Bạn không thể truy cập khu vực quản trị từ địa chỉ IP này
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => navigate('/')}
                className="btn btn-primary w-full"
              >
                🏠 Về trang chủ
              </button>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <h2 className="text-xl font-bold text-slate-900">Đang kiểm tra bảo mật...</h2>
          <p className="text-slate-600 mt-2">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    )
  }

  // 2FA requirement
  const twoFAComponent = check2FARequirement()
  if (twoFAComponent) return twoFAComponent

  // IP restriction
  const ipComponent = checkIPRestriction()
  if (ipComponent) return ipComponent

  // Route access check
  if (!isRouteAccessible()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Không có quyền truy cập
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Bạn không có quyền truy cập trang này
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => navigate('/admin')}
              className="btn btn-primary w-full"
            >
              🏠 Về Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Session monitoring
  useEffect(() => {
    if (!sessionValid) return

    const sessionCheckInterval = setInterval(async () => {
      const sessionCheck = await checkAdminSession(user.uid)
      if (!sessionCheck.success) {
        showErrorToast('Phiên đăng nhập đã hết hạn')
        navigate('/login', { replace: true })
      }
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(sessionCheckInterval)
  }, [sessionValid, user, navigate])

  // Render children with security context
  return (
    <div className="admin-security-wrapper">
      {/* Security Status Bar */}
      <div className="bg-green-50 border-b border-green-200 px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-700 font-medium">Bảo mật Admin</span>
          </div>
          <div className="text-green-600">
            🔒 Phiên an toàn
          </div>
        </div>
      </div>
      
      {children}
    </div>
  )
}

export default AdminSecurityWrapper
