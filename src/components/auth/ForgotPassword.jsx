import { useState } from 'react'
import { Link } from 'react-router-dom'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../config/firebase'
import { showSuccessToast, showErrorToast } from '../../services/notificationService'

/**
 * Forgot Password Component
 * Secure password reset with email verification
 */
function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate email
    if (!email.trim()) {
      setErrors({ email: 'Email là bắt buộc' })
      return
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Email không hợp lệ' })
      return
    }
    
    setLoading(true)
    setErrors({})
    
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true
      })
      
      setSent(true)
      showSuccessToast('Email đặt lại mật khẩu đã được gửi')
    } catch (error) {
      console.error('Password reset error:', error)
      showErrorToast('Không thể gửi email đặt lại mật khẩu: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true
      })
      
      showSuccessToast('Email đặt lại mật khẩu đã được gửi lại')
    } catch (error) {
      console.error('Resend error:', error)
      showErrorToast('Không thể gửi lại email')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Email đã được gửi!
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Chúng tôi đã gửi liên kết đặt lại mật khẩu đến <strong>{email}</strong>
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">📧 Hướng dẫn tiếp theo:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Kiểm tra hộp thư đến của bạn</li>
                <li>• Nhấn vào liên kết trong email</li>
                <li>• Tạo mật khẩu mới mạnh</li>
                <li>• Đăng nhập với mật khẩu mới</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleResend}
                disabled={loading}
                className="btn btn-outline w-full"
              >
                {loading ? '⏳ Đang gửi...' : '📤 Gửi lại email'}
              </button>
              
              <Link
                to="/login"
                className="btn btn-primary w-full"
              >
                🔐 Quay lại đăng nhập
              </Link>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-slate-600">
                Không nhận được email? Kiểm tra thư mục spam hoặc{' '}
                <button
                  onClick={handleResend}
                  className="text-primary hover:underline"
                >
                  gửi lại
                </button>
              </p>
            </div>
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
            Quên mật khẩu?
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Nhập email của bạn để nhận liên kết đặt lại mật khẩu
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) {
                  setErrors({ ...errors, email: '' })
                }
              }}
              className={`mt-1 input ${errors.email ? 'border-red-500' : ''}`}
              placeholder="example@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? '⏳ Đang gửi...' : '📧 Gửi liên kết đặt lại'}
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">🔒 Lưu ý bảo mật:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Liên kết chỉ có hiệu lực trong 1 giờ</li>
            <li>• Chỉ có thể sử dụng 1 lần</li>
            <li>• Không chia sẻ liên kết với ai khác</li>
            <li>• Tạo mật khẩu mới mạnh</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
