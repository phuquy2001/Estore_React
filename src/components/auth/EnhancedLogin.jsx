import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '../../config/firebase'
import { usersService } from '../../services/firebaseService'
import { verify2FA } from '../../services/twoFactorAuthService'
import { hasPermission, isAdmin } from '../../services/authorizationService'
import { showSuccessToast, showErrorToast } from '../../services/notificationService'

/**
 * Enhanced Login Component
 * With 2FA support, role-based redirection, and OAuth integration
 */
function EnhancedLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Login, 2: 2FA, 3: Success
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [errors, setErrors] = useState({})
  const [userData, setUserData] = useState(null)
  const [twoFactorRequired, setTwoFactorRequired] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }
    
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      )
      
      const user = userCredential.user
      
      // Get user data from Firestore
      const userDoc = await usersService.getById(user.uid)
      if (!userDoc || !userDoc.data) {
        throw new Error('Không tìm thấy thông tin người dùng')
      }
      
      const userInfo = userDoc.data
      setUserData(userInfo)
      
      // Check if user is active
      if (userInfo.status === 'suspended') {
        throw new Error('Tài khoản đã bị tạm khóa')
      }
      
      if (userInfo.status === 'banned') {
        throw new Error('Tài khoản đã bị cấm')
      }
      
      // Check if 2FA is enabled
      if (userInfo.twoFactorEnabled) {
        setTwoFactorRequired(true)
        setStep(2)
        showSuccessToast('Vui lòng nhập mã 2FA để tiếp tục')
        return
      }
      
      // Check email verification
      if (!user.emailVerified) {
        showErrorToast('Vui lòng xác thực email trước khi đăng nhập')
        return
      }
      
      // Successful login
      await handleSuccessfulLogin(userInfo)
      
    } catch (error) {
      console.error('Login error:', error)
      showErrorToast('Đăng nhập thất bại: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handle2FA = async (e) => {
    e.preventDefault()
    
    if (!userData) return
    
    setLoading(true)
    
    try {
      const code = e.target.twoFactorCode.value
      if (!code || code.length !== 6) {
        showErrorToast('Vui lòng nhập mã 2FA 6 chữ số')
        return
      }
      
      // Verify 2FA
      const result = await verify2FA(userData.uid, code)
      
      if (result.success) {
        await handleSuccessfulLogin(userData)
      } else {
        showErrorToast(result.message)
      }
      
    } catch (error) {
      console.error('2FA error:', error)
      showErrorToast('Xác thực 2FA thất bại: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessfulLogin = async (userInfo) => {
    try {
      console.log('User info after 2FA:', userInfo) // Debug log
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify({
        uid: userInfo.uid,
        name: userInfo.name,
        email: userInfo.email,
        role: userInfo.role,
        avatar: userInfo.avatar
      }))
      
      // Check permissions and redirect
      const isAdminUser = await isAdmin(userInfo.uid)
      console.log('Is admin user:', isAdminUser) // Debug log
      console.log('User role:', userInfo.role) // Debug log
      
      if (isAdminUser || userInfo.role === 'admin' || userInfo.role === 'super_admin') {
        navigate('/admin', { replace: true })
        showSuccessToast('Chào mừng Admin!')
      } else {
        navigate(from, { replace: true })
        showSuccessToast('Đăng nhập thành công!')
      }
      
    } catch (error) {
      console.error('Post-login error:', error)
      showErrorToast('Có lỗi xảy ra sau khi đăng nhập')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      
      // Check if user exists in Firestore
      const userDoc = await usersService.get(user.uid)
      
      if (userDoc.exists()) {
        const userInfo = userDoc.data()
        
        // Check if user is active
        if (userInfo.status === 'suspended' || userInfo.status === 'banned') {
          throw new Error('Tài khoản đã bị khóa')
        }
        
        await handleSuccessfulLogin(userInfo)
      } else {
        // Create new user
        await usersService.upsert(user.uid, {
          name: user.displayName,
          email: user.email,
          avatar: user.photoURL,
          role: 'customer',
          status: 'active',
          emailVerified: true,
          provider: 'google',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        
        await handleSuccessfulLogin({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          role: 'customer',
          avatar: user.photoURL
        })
      }
      
    } catch (error) {
      console.error('Google login error:', error)
      showErrorToast('Đăng nhập Google thất bại: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    navigate('/forgot-password')
  }

  // Step 1: Login Form
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
              Đăng nhập
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              Đăng nhập vào tài khoản của bạn
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 input ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="example@email.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 input ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Nhập mật khẩu"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              
              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-slate-700">
                    Ghi nhớ đăng nhập
                  </label>
                </div>
                
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-primary hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? '⏳ Đang đăng nhập...' : '🔐 Đăng nhập'}
              </button>
            </div>
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-50 text-slate-500">Hoặc</span>
              </div>
            </div>
            
            {/* Google Login */}
            <div>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="btn btn-outline w-full flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Đăng nhập với Google
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-slate-600">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-primary hover:underline">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    )
  }
  
  // Step 2: 2FA Verification
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
              Xác thực 2FA
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              Nhập mã 2FA từ ứng dụng xác thực của bạn
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handle2FA}>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Mã 2FA (6 chữ số)
              </label>
              <input
                type="text"
                name="twoFactorCode"
                maxLength="6"
                className="mt-1 input text-center text-2xl tracking-widest"
                placeholder="000000"
              />
              <p className="text-xs text-slate-500 mt-1">
                Mã 2FA có hiệu lực trong 30 giây
              </p>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? '⏳ Đang xác thực...' : '🔐 Xác thực 2FA'}
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-slate-600">
                Không có quyền truy cập?{' '}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => setStep(1)}
                >
                  Quay lại đăng nhập
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default EnhancedLogin
