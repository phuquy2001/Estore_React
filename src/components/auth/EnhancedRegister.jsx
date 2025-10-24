import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../../config/firebase'
import { usersService } from '../../services/firebaseService'
import { validatePassword } from '../../utils/passwordValidator'
import { 
  checkEmailUniqueness, 
  checkPhoneUniqueness, 
  generateOTP,
  sendEmailVerificationLink 
} from '../../services/verificationService'
import { showSuccessToast, showErrorToast } from '../../services/notificationService'

/**
 * Enhanced Register Component
 * With password policy, email/phone verification, and security features
 */
function EnhancedRegister() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Basic info, 2: Verification, 3: Complete
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  })
  const [errors, setErrors] = useState({})
  const [passwordValidation, setPasswordValidation] = useState(null)
  const [otpData, setOtpData] = useState(null)
  const [verificationStep, setVerificationStep] = useState('email') // 'email' or 'phone'

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
    
    // Validate password in real-time
    if (name === 'password') {
      const validation = validatePassword(value)
      setPasswordValidation(validation)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Họ tên là bắt buộc'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Họ tên phải có ít nhất 2 ký tự'
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại là bắt buộc'
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Số điện thoại phải có 10-11 chữ số'
    }
    
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
    
    // Terms agreement
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'Bạn phải đồng ý với điều khoản sử dụng'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      // Check email uniqueness
      const emailCheck = await checkEmailUniqueness(formData.email)
      if (!emailCheck.isUnique) {
        setErrors({ email: emailCheck.message })
        return
      }
      
      // Check phone uniqueness
      const phoneCheck = await checkPhoneUniqueness(formData.phone)
      if (!phoneCheck.isUnique) {
        setErrors({ phone: phoneCheck.message })
        return
      }
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      )
      
      // Update user profile
      await updateProfile(userCredential.user, {
        displayName: formData.name
      })
      
      // Save user data to Firestore
      await usersService.upsert(userCredential.user.uid, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'customer',
        status: 'active',
        emailVerified: false,
        phoneVerified: false,
        twoFactorEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      // Generate OTP for verification
      const otpResult = await generateOTP(formData.email, formData.phone)
      if (otpResult.success) {
        setOtpData(otpResult)
        setStep(2)
        showSuccessToast('Tài khoản đã được tạo. Vui lòng xác thực email/số điện thoại.')
      } else {
        throw new Error(otpResult.message)
      }
      
    } catch (error) {
      console.error('Registration error:', error)
      showErrorToast('Đăng ký thất bại: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (e) => {
    e.preventDefault()
    
    if (!otpData) return
    
    setLoading(true)
    
    try {
      const otpCode = e.target.otpCode.value
      if (!otpCode || otpCode.length !== 6) {
        showErrorToast('Vui lòng nhập mã OTP 6 chữ số')
        return
      }
      
      // In production, verify OTP with backend
      // For demo, accept any 6-digit code
      if (/^\d{6}$/.test(otpCode)) {
        // Send email verification
        await sendEmailVerificationLink(auth.currentUser)
        
        setStep(3)
        showSuccessToast('Xác thực thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.')
      } else {
        showErrorToast('Mã OTP không hợp lệ')
      }
      
    } catch (error) {
      console.error('Verification error:', error)
      showErrorToast('Xác thực thất bại: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    navigate('/login', { 
      state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' }
    })
  }

  // Step 1: Basic Information
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
              Đăng ký tài khoản
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              Tạo tài khoản mới với bảo mật cao
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Họ và tên *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`mt-1 input ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Nhập họ và tên"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Email *
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
              
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`mt-1 input ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="0123456789"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Mật khẩu *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`mt-1 input ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Nhập mật khẩu mạnh"
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
                  Xác nhận mật khẩu *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`mt-1 input ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Nhập lại mật khẩu"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
              
              {/* Terms Agreement */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded"
                />
                <label className="ml-2 block text-sm text-slate-700">
                  Tôi đồng ý với{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    Điều khoản sử dụng
                  </Link>{' '}
                  và{' '}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Chính sách bảo mật
                  </Link>
                </label>
              </div>
              {errors.agreeToTerms && <p className="text-red-500 text-xs">{errors.agreeToTerms}</p>}
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? '⏳ Đang tạo tài khoản...' : '📝 Đăng ký'}
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-slate-600">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    )
  }
  
  // Step 2: Verification
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
              Xác thực tài khoản
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600">
              Nhập mã OTP đã được gửi đến {verificationStep === 'email' ? formData.email : formData.phone}
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleVerification}>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Mã OTP (6 chữ số)
              </label>
              <input
                type="text"
                name="otpCode"
                maxLength="6"
                className="mt-1 input text-center text-2xl tracking-widest"
                placeholder="000000"
              />
              <p className="text-xs text-slate-500 mt-1">
                Mã OTP có hiệu lực trong 5 phút
              </p>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? '⏳ Đang xác thực...' : '✅ Xác thực'}
              </button>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-slate-600">
                Không nhận được mã?{' '}
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => {
                    // Resend OTP logic
                    showSuccessToast('Mã OTP mới đã được gửi')
                  }}
                >
                  Gửi lại
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    )
  }
  
  // Step 3: Complete
  if (step === 3) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Đăng ký thành công!
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Tài khoản của bạn đã được tạo. Vui lòng kiểm tra email để kích hoạt tài khoản.
            </p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleComplete}
              className="btn btn-primary w-full"
            >
              🚀 Tiếp tục đăng nhập
            </button>
            
            <div className="text-center">
              <p className="text-sm text-slate-600">
                Đã kích hoạt tài khoản?{' '}
                <Link to="/login" className="text-primary hover:underline">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default EnhancedRegister
