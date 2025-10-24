import { auth, db } from '../config/firebase'
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
  getDocs
} from 'firebase/firestore'

/**
 * Two-Factor Authentication Service
 * Handles 2FA/MFA for enhanced security
 */

// 2FA Configuration
const TWO_FA_CONFIG = {
  totpWindow: 1, // Time window for TOTP validation
  backupCodesCount: 10,
  smsProvider: 'twilio', // In production, use real SMS provider
  emailProvider: 'sendgrid' // In production, use real email provider
}

/**
 * Enable 2FA for user
 * @param {string} userId - User ID
 * @param {string} method - 2FA method ('sms', 'email', 'totp')
 * @returns {Promise<object>} - Setup result
 */
export async function enable2FA(userId, method = 'sms') {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      return { success: false, message: 'Người dùng không tồn tại' }
    }
    
    const userData = userSnap.data()
    
    // Check if 2FA is already enabled
    if (userData.twoFactorEnabled) {
      return { success: false, message: '2FA đã được kích hoạt' }
    }
    
    let setupData = {}
    
    switch (method) {
      case 'sms':
        setupData = await setupSMS2FA(userId, userData.phone)
        break
      case 'email':
        setupData = await setupEmail2FA(userId, userData.email)
        break
      case 'totp':
        setupData = await setupTOTP2FA(userId)
        break
      default:
        return { success: false, message: 'Phương thức 2FA không hợp lệ' }
    }
    
    if (!setupData.success) {
      return setupData
    }
    
    // Update user 2FA settings
    await updateDoc(userRef, {
      twoFactorEnabled: true,
      twoFactorMethod: method,
      twoFactorSecret: setupData.secret,
      twoFactorBackupCodes: setupData.backupCodes,
      twoFactorSetupAt: serverTimestamp()
    })
    
    return {
      success: true,
      message: '2FA đã được kích hoạt',
      qrCode: setupData.qrCode,
      backupCodes: setupData.backupCodes,
      secret: setupData.secret
    }
  } catch (error) {
    console.error('Enable 2FA error:', error)
    return { 
      success: false, 
      message: 'Không thể kích hoạt 2FA: ' + error.message 
    }
  }
}

/**
 * Setup SMS 2FA
 * @param {string} userId - User ID
 * @param {string} phone - Phone number
 * @returns {Promise<object>} - Setup result
 */
async function setupSMS2FA(userId, phone) {
  try {
    if (!phone) {
      return { success: false, message: 'Số điện thoại chưa được cập nhật' }
    }
    
    // Generate backup codes
    const backupCodes = generateBackupCodes()
    
    // In production, you would integrate with SMS provider
    // For now, we'll simulate
    console.log(`SMS 2FA setup for ${phone}`)
    
    return {
      success: true,
      secret: `sms_${userId}_${Date.now()}`,
      backupCodes,
      phone
    }
  } catch (error) {
    return { success: false, message: 'Không thể thiết lập SMS 2FA' }
  }
}

/**
 * Setup Email 2FA
 * @param {string} userId - User ID
 * @param {string} email - Email address
 * @returns {Promise<object>} - Setup result
 */
async function setupEmail2FA(userId, email) {
  try {
    if (!email) {
      return { success: false, message: 'Email chưa được cập nhật' }
    }
    
    // Generate backup codes
    const backupCodes = generateBackupCodes()
    
    // In production, you would send verification email
    console.log(`Email 2FA setup for ${email}`)
    
    return {
      success: true,
      secret: `email_${userId}_${Date.now()}`,
      backupCodes,
      email
    }
  } catch (error) {
    return { success: false, message: 'Không thể thiết lập Email 2FA' }
  }
}

/**
 * Setup TOTP 2FA
 * @param {string} userId - User ID
 * @returns {Promise<object>} - Setup result
 */
async function setupTOTP2FA(userId) {
  try {
    // Generate TOTP secret
    const secret = generateTOTPSecret()
    const backupCodes = generateBackupCodes()
    
    // Generate QR code data
    const qrCodeData = `otpauth://totp/YourApp:${userId}?secret=${secret}&issuer=YourApp`
    
    return {
      success: true,
      secret,
      backupCodes,
      qrCode: qrCodeData
    }
  } catch (error) {
    return { success: false, message: 'Không thể thiết lập TOTP 2FA' }
  }
}

/**
 * Verify 2FA code
 * @param {string} userId - User ID
 * @param {string} code - 2FA code
 * @param {string} backupCode - Backup code (optional)
 * @returns {Promise<object>} - Verification result
 */
export async function verify2FA(userId, code, backupCode = null) {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      return { success: false, message: 'Người dùng không tồn tại' }
    }
    
    const userData = userSnap.data()
    
    if (!userData.twoFactorEnabled) {
      return { success: false, message: '2FA chưa được kích hoạt' }
    }
    
    // Check backup code first
    if (backupCode) {
      const isValidBackup = await verifyBackupCode(userId, backupCode)
      if (isValidBackup.success) {
        return { success: true, message: 'Xác thực 2FA thành công (backup code)' }
      }
    }
    
    // Verify regular 2FA code
    const isValid = await verify2FACode(userData, code)
    
    if (isValid) {
      // Log successful 2FA attempt
      await log2FAAttempt(userId, true)
      return { success: true, message: 'Xác thực 2FA thành công' }
    } else {
      // Log failed 2FA attempt
      await log2FAAttempt(userId, false)
      return { success: false, message: 'Mã 2FA không đúng' }
    }
  } catch (error) {
    console.error('2FA verification error:', error)
    return { 
      success: false, 
      message: 'Không thể xác thực 2FA: ' + error.message 
    }
  }
}

/**
 * Verify 2FA code based on method
 * @param {object} userData - User data
 * @param {string} code - Code to verify
 * @returns {Promise<boolean>} - Verification result
 */
async function verify2FACode(userData, code) {
  const method = userData.twoFactorMethod
  
  switch (method) {
    case 'sms':
      return await verifySMSCode(userData, code)
    case 'email':
      return await verifyEmailCode(userData, code)
    case 'totp':
      return await verifyTOTPCode(userData, code)
    default:
      return false
  }
}

/**
 * Verify SMS code
 * @param {object} userData - User data
 * @param {string} code - SMS code
 * @returns {Promise<boolean>} - Verification result
 */
async function verifySMSCode(userData, code) {
  // In production, verify with SMS provider
  // For demo, accept any 6-digit code
  return /^\d{6}$/.test(code)
}

/**
 * Verify Email code
 * @param {object} userData - User data
 * @param {string} code - Email code
 * @returns {Promise<boolean>} - Verification result
 */
async function verifyEmailCode(userData, code) {
  // In production, verify with email service
  // For demo, accept any 6-digit code
  return /^\d{6}$/.test(code)
}

/**
 * Verify TOTP code
 * @param {object} userData - User data
 * @param {string} code - TOTP code
 * @returns {Promise<boolean>} - Verification result
 */
async function verifyTOTPCode(userData, code) {
  // In production, use proper TOTP library
  // For demo, accept any 6-digit code
  return /^\d{6}$/.test(code)
}

/**
 * Verify backup code
 * @param {string} userId - User ID
 * @param {string} backupCode - Backup code
 * @returns {Promise<object>} - Verification result
 */
async function verifyBackupCode(userId, backupCode) {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      return { success: false, message: 'Người dùng không tồn tại' }
    }
    
    const userData = userSnap.data()
    const backupCodes = userData.twoFactorBackupCodes || []
    
    // Check if backup code exists and is unused
    const codeIndex = backupCodes.findIndex(code => 
      code.code === backupCode && !code.used
    )
    
    if (codeIndex === -1) {
      return { success: false, message: 'Backup code không hợp lệ' }
    }
    
    // Mark backup code as used
    backupCodes[codeIndex].used = true
    backupCodes[codeIndex].usedAt = serverTimestamp()
    
    await updateDoc(userRef, {
      twoFactorBackupCodes: backupCodes
    })
    
    return { success: true, message: 'Backup code hợp lệ' }
  } catch (error) {
    return { success: false, message: 'Không thể xác thực backup code' }
  }
}

/**
 * Disable 2FA
 * @param {string} userId - User ID
 * @param {string} password - Current password for verification
 * @returns {Promise<object>} - Disable result
 */
export async function disable2FA(userId, password) {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      return { success: false, message: 'Người dùng không tồn tại' }
    }
    
    // In production, verify password here
    // For demo, we'll skip password verification
    
    // Disable 2FA
    await updateDoc(userRef, {
      twoFactorEnabled: false,
      twoFactorMethod: null,
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
      twoFactorDisabledAt: serverTimestamp()
    })
    
    return { success: true, message: '2FA đã được tắt' }
  } catch (error) {
    console.error('Disable 2FA error:', error)
    return { 
      success: false, 
      message: 'Không thể tắt 2FA: ' + error.message 
    }
  }
}

/**
 * Generate backup codes
 * @returns {array} - Array of backup codes
 */
function generateBackupCodes() {
  const codes = []
  for (let i = 0; i < TWO_FA_CONFIG.backupCodesCount; i++) {
    codes.push({
      code: generateRandomCode(8),
      used: false,
      createdAt: serverTimestamp()
    })
  }
  return codes
}

/**
 * Generate TOTP secret
 * @returns {string} - TOTP secret
 */
function generateTOTPSecret() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return secret
}

/**
 * Generate random code
 * @param {number} length - Code length
 * @returns {string} - Random code
 */
function generateRandomCode(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Log 2FA attempt
 * @param {string} userId - User ID
 * @param {boolean} success - Success status
 * @returns {Promise<void>}
 */
async function log2FAAttempt(userId, success) {
  try {
    await addDoc(collection(db, 'twoFactorAttempts'), {
      userId,
      success,
      timestamp: serverTimestamp(),
      ip: 'unknown', // In production, get real IP
      userAgent: navigator.userAgent
    })
  } catch (error) {
    console.error('2FA logging error:', error)
  }
}
