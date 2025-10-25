import { auth, db } from '../config/firebase'
import { 
  sendEmailVerification, 
  sendPasswordResetEmail,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore'

/**
 * Email/OTP Verification Service
 * Handles email verification, OTP generation and validation
 */

// OTP Configuration
const OTP_CONFIG = {
  length: 6,
  expiry: 5 * 60 * 1000, // 5 minutes
  maxAttempts: 3
}

/**
 * Send email verification
 * @param {object} user - Firebase user object
 * @returns {Promise<object>} - Result object
 */
export async function sendEmailVerificationLink(user) {
  try {
    if (!user.emailVerified) {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/verify-email?uid=${user.uid}`,
        handleCodeInApp: true
      })
      return { success: true, message: 'Email xác thực đã được gửi' }
    } else {
      return { success: false, message: 'Email đã được xác thực' }
    }
  } catch (error) {
    console.error('Email verification error:', error)
    return { 
      success: false, 
      message: 'Không thể gửi email xác thực: ' + error.message 
    }
  }
}

/**
 * Generate and store OTP
 * @param {string} email - Email address
 * @param {string} phone - Phone number (optional)
 * @returns {Promise<object>} - Result with OTP ID
 */
export async function generateOTP(email, phone = null) {
  try {
    // Generate random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + OTP_CONFIG.expiry)
    
    // Store OTP in Firestore
    const otpData = {
      code: otp,
      email,
      phone,
      expiresAt,
      attempts: 0,
      verified: false,
      createdAt: serverTimestamp()
    }
    
    const otpRef = await addDoc(collection(db, 'otps'), otpData)
    
    // In production, you would send OTP via SMS/Email service
    // For now, we'll just log it (remove in production)
    
    
    return {
      success: true,
      otpId: otpRef.id,
      message: 'OTP đã được gửi',
      // Remove this in production
      otp: otp
    }
  } catch (error) {
    console.error('OTP generation error:', error)
    return { 
      success: false, 
      message: 'Không thể tạo OTP: ' + error.message 
    }
  }
}

/**
 * Verify OTP
 * @param {string} otpId - OTP document ID
 * @param {string} code - OTP code to verify
 * @returns {Promise<object>} - Verification result
 */
export async function verifyOTP(otpId, code) {
  try {
    const otpRef = doc(db, 'otps', otpId)
    const otpSnap = await getDoc(otpRef)
    
    if (!otpSnap.exists()) {
      return { success: false, message: 'OTP không tồn tại' }
    }
    
    const otpData = otpSnap.data()
    
    // Check if already verified
    if (otpData.verified) {
      return { success: false, message: 'OTP đã được sử dụng' }
    }
    
    // Check if expired
    if (new Date() > otpData.expiresAt.toDate()) {
      return { success: false, message: 'OTP đã hết hạn' }
    }
    
    // Check attempts
    if (otpData.attempts >= OTP_CONFIG.maxAttempts) {
      return { success: false, message: 'Quá nhiều lần thử sai' }
    }
    
    // Verify code
    if (otpData.code !== code) {
      // Increment attempts
      await updateDoc(otpRef, {
        attempts: otpData.attempts + 1
      })
      
      return { 
        success: false, 
        message: `Mã OTP không đúng. Còn ${OTP_CONFIG.maxAttempts - otpData.attempts - 1} lần thử` 
      }
    }
    
    // Mark as verified
    await updateDoc(otpRef, {
      verified: true,
      verifiedAt: serverTimestamp()
    })
    
    return { success: true, message: 'OTP xác thực thành công' }
  } catch (error) {
    console.error('OTP verification error:', error)
    return { 
      success: false, 
      message: 'Không thể xác thực OTP: ' + error.message 
    }
  }
}

/**
 * Send password reset email
 * @param {string} email - Email address
 * @returns {Promise<object>} - Result object
 */
export async function sendPasswordResetLink(email) {
  try {
    await sendPasswordResetEmail(auth, email, {
      url: `${window.location.origin}/reset-password`,
      handleCodeInApp: true
    })
    
    return { success: true, message: 'Email đặt lại mật khẩu đã được gửi' }
  } catch (error) {
    console.error('Password reset error:', error)
    return { 
      success: false, 
      message: 'Không thể gửi email đặt lại mật khẩu: ' + error.message 
    }
  }
}

/**
 * Verify email uniqueness
 * @param {string} email - Email to check
 * @returns {Promise<object>} - Check result
 */
export async function checkEmailUniqueness(email) {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('email', '==', email))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      return { 
        success: false, 
        message: 'Email này đã được sử dụng',
        isUnique: false 
      }
    }
    
    return { 
      success: true, 
      message: 'Email có thể sử dụng',
      isUnique: true 
    }
  } catch (error) {
    console.error('Email uniqueness check error:', error)
    return { 
      success: false, 
      message: 'Không thể kiểm tra email: ' + error.message,
      isUnique: false 
    }
  }
}

/**
 * Verify phone uniqueness
 * @param {string} phone - Phone to check
 * @returns {Promise<object>} - Check result
 */
export async function checkPhoneUniqueness(phone) {
  try {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('phone', '==', phone))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      return { 
        success: false, 
        message: 'Số điện thoại này đã được sử dụng',
        isUnique: false 
      }
    }
    
    return { 
      success: true, 
      message: 'Số điện thoại có thể sử dụng',
      isUnique: true 
    }
  } catch (error) {
    console.error('Phone uniqueness check error:', error)
    return { 
      success: false, 
      message: 'Không thể kiểm tra số điện thoại: ' + error.message,
      isUnique: false 
    }
  }
}

/**
 * Re-authenticate user for sensitive operations
 * @param {object} user - Firebase user
 * @param {string} password - Current password
 * @returns {Promise<object>} - Re-authentication result
 */
export async function reauthenticateUser(user, password) {
  try {
    const credential = EmailAuthProvider.credential(user.email, password)
    await reauthenticateWithCredential(user, credential)
    
    return { success: true, message: 'Xác thực thành công' }
  } catch (error) {
    console.error('Re-authentication error:', error)
    return { 
      success: false, 
      message: 'Mật khẩu hiện tại không đúng: ' + error.message 
    }
  }
}

/**
 * Update user email with verification
 * @param {object} user - Firebase user
 * @param {string} newEmail - New email
 * @returns {Promise<object>} - Update result
 */
export async function updateUserEmail(user, newEmail) {
  try {
    // Check if email is unique
    const emailCheck = await checkEmailUniqueness(newEmail)
    if (!emailCheck.isUnique) {
      return emailCheck
    }
    
    // Update email
    await updateProfile(user, { email: newEmail })
    
    // Send verification email
    await sendEmailVerificationLink(user)
    
    return { 
      success: true, 
      message: 'Email đã được cập nhật. Vui lòng kiểm tra email để xác thực.' 
    }
  } catch (error) {
    console.error('Email update error:', error)
    return { 
      success: false, 
      message: 'Không thể cập nhật email: ' + error.message 
    }
  }
}

/**
 * Clean up expired OTPs
 * @returns {Promise<void>}
 */
export async function cleanupExpiredOTPs() {
  try {
    const otpsRef = collection(db, 'otps')
    const q = query(
      otpsRef, 
      where('expiresAt', '<', new Date()),
      orderBy('expiresAt'),
      limit(100)
    )
    
    const querySnapshot = await getDocs(q)
    const batch = []
    
    querySnapshot.forEach((doc) => {
      batch.push(doc.ref.delete())
    })
    
    await Promise.all(batch)
    
  } catch (error) {
    console.error('OTP cleanup error:', error)
  }
}
