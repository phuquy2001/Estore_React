import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import { auth } from '../../config/firebase'
import { validatePassword } from '../../utils/passwordValidator'
import { showSuccessToast, showErrorToast } from '../../services/notificationService'

/**
 * Reset Password Component
 * Handles password reset from email link
 */
function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [validCode, setValidCode] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [passwordValidation, setPasswordValidation] = useState(null)

  useEffect(() => {
    verifyResetCode()
  }, [])

  const verifyResetCode = async () => {
    try {
      const oobCode = searchParams.get('oobCode')
      const mode = searchParams.get('mode')
      
      if (!oobCode || mode !== 'resetPassword') {
        setValidCode(false)
        setVerifying(false)
        return
      }
      
      // Verify the reset code
      await verifyPasswordResetCode(auth, oobCode)
      setValidCode(true)
    } catch (error) {
      console.error('Reset code verification error:', error)
      setValidCode(false)
    } finally {
      setVerifying(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    
    // Validate password in real-time
    if (name === 'password') {
      const validation = validatePassword(value)
      setPasswordValidation(validation)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc'
    } else if (passwordValidation && !passwordValidation.isValid) {
      newErrors.password = passwordValidation.errors[0]
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu không khớp'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const oobCode = searchParams.get('oobCode')
      
      // Reset password
      await confirmPasswordReset(auth, oobCode, formData.password)
      
      showSuccessToast('Mật khẩu đã được đặt lại thành công!')
      navigate('/login', { 
        state: { message: 'Mật khẩu đã được đặt lại. Vui lòng đăng nhập với mật khẩu mới.' }
      })
      
    } catch (error) {
      console.error('Password reset error:', error)
      showErrorToast('Không thể đặt lại mật khẩu: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <h2 className="text-2xl font-bold text-slate-900">Đang xác thực...</h2>
            <p className="text-slate-600 mt-2">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    )
  }

  if (!validCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">Liên kết không hợp lệ</h2>
            <p className="mt-2 text-sm text-slate-600">
              Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn
            </p>
          </div>
          
          <div className="space-y-4">
            <Link
              to="/forgot-password"
              className="btn btn-primary w-full"
            >
              🔄 Yêu cầu liên kết mới
            </Link>
            
            <Link
              to="/login"
              className="btn btn-outline w-full"
            >
              🔐 Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Đặt lại mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Tạo mật khẩu mới cho tài khoản của bạn
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Mật khẩu mới *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`mt-1 input ${errors.password ? 'border-red-500' : ''}`}
                placeholder="Nhập mật khẩu mới"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              
              {/* Password Strength Indicator */}
              {passwordValidation && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          passwordValidation.strengthScore < 30 ? 'bg-red-500' :
                          passwordValidation.strengthScore < 50 ? 'bg-orange-500' :
                          passwordValidation.strengthScore < 70 ? 'bg-yellow-500' :
                          passwordValidation.strengthScore < 90 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${passwordValidation.strengthScore}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium">
                      {passwordValidation.strengthLevel}
                    </span>
                  </div>
                  
                  {/* Password Requirements */}
                  <div className="mt-2 text-xs space-y-1">
                    <div className={`flex items-center gap-2 ${passwordValidation.errors.includes('Mật khẩu phải có ít nhất 8 ký tự') ? 'text-red-500' : 'text-green-500'}`}>
                      <span>•</span>
                      <span>Ít nhất 8 ký tự</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.errors.includes('Mật khẩu phải có ít nhất 1 chữ hoa') ? 'text-red-500' : 'text-green-500'}`}>
                      <span>•</span>
                      <span>1 chữ hoa</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.errors.includes('Mật khẩu phải có ít nhất 1 chữ thường') ? 'text-red-500' : 'text-green-500'}`}>
                      <span>•</span>
                      <span>1 chữ thường</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.errors.includes('Mật khẩu phải có ít nhất 1 số') ? 'text-red-500' : 'text-green-500'}`}>
                      <span>•</span>
                      <span>1 số</span>
                    </div>
                    <div className={`flex items-center gap-2 ${passwordValidation.errors.includes('Mật khẩu phải có ít nhất 1 ký tự đặc biệt') ? 'text-red-500' : 'text-green-500'}`}>
                      <span>•</span>
                      <span>1 ký tự đặc biệt</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Xác nhận mật khẩu mới *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`mt-1 input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                placeholder="Nhập lại mật khẩu mới"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? '⏳ Đang đặt lại...' : '🔐 Đặt lại mật khẩu'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-slate-600">
              Nhớ mật khẩu?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </form>
        
        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">🔒 Bảo mật:</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Mật khẩu mới sẽ thay thế mật khẩu cũ</li>
            <li>• Tất cả thiết bị đăng nhập sẽ bị đăng xuất</li>
            <li>• Bạn cần đăng nhập lại với mật khẩu mới</li>
            <li>• Liên kết này chỉ có thể sử dụng 1 lần</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
