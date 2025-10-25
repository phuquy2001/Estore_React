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
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore'

/**
 * Admin Security Service
 * Handles maximum security for admin area
 */

// Security Configuration
const ADMIN_SECURITY_CONFIG = {
  required2FA: true,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  maxLoginAttempts: 3,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  allowedIPs: [], // Empty means no IP restriction
  logRetentionDays: 90
}

// Admin Actions to Log
const ADMIN_ACTIONS = {
  LOGIN: 'admin_login',
  LOGOUT: 'admin_logout',
  VIEW_PRODUCTS: 'view_products',
  CREATE_PRODUCT: 'create_product',
  UPDATE_PRODUCT: 'update_product',
  DELETE_PRODUCT: 'delete_product',
  VIEW_ORDERS: 'view_orders',
  UPDATE_ORDER: 'update_order',
  DELETE_ORDER: 'delete_order',
  VIEW_USERS: 'view_users',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
  SYSTEM_SETTINGS: 'system_settings',
  SECURITY_SETTINGS: 'security_settings'
}

/**
 * Check if user is admin
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - Is admin
 */
export async function isAdmin(userId) {
  try {
    if (!userId) return false
    
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) return false
    
    const userData = userSnap.data()
    return userData.role === 'admin' || userData.role === 'super_admin'
  } catch (error) {
    console.error('Admin check error:', error)
    return false
  }
}

/**
 * Check admin security requirements
 * @param {string} userId - User ID
 * @returns {Promise<object>} - Security check result
 */
export async function checkAdminSecurity(userId) {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      return { 
        success: false, 
        message: 'Người dùng không tồn tại',
        requires2FA: false,
        requiresIPCheck: false
      }
    }
    
    const userData = userSnap.data()
    
    // Check if user is admin
    if (!isAdmin(userId)) {
      return { 
        success: false, 
        message: 'Không có quyền truy cập admin',
        requires2FA: false,
        requiresIPCheck: false
      }
    }
    
    // Check account status
    if (userData.status === 'suspended' || userData.status === 'banned') {
      return { 
        success: false, 
        message: 'Tài khoản đã bị khóa',
        requires2FA: false,
        requiresIPCheck: false
      }
    }
    
    // Check 2FA requirement
    const requires2FA = ADMIN_SECURITY_CONFIG.required2FA && !userData.twoFactorEnabled
    
    // Check IP restriction
    const requiresIPCheck = ADMIN_SECURITY_CONFIG.allowedIPs.length > 0
    
    return {
      success: true,
      message: 'Admin security check passed',
      requires2FA,
      requiresIPCheck,
      userData
    }
  } catch (error) {
    console.error('Admin security check error:', error)
    return { 
      success: false, 
      message: 'Lỗi kiểm tra bảo mật admin',
      requires2FA: false,
      requiresIPCheck: false
    }
  }
}

/**
 * Log admin action
 * @param {string} userId - User ID
 * @param {string} action - Action performed
 * @param {object} details - Action details
 * @param {string} ip - IP address
 * @returns {Promise<void>}
 */
export async function logAdminAction(userId, action, details = {}, ip = 'unknown') {
  try {
    const logData = {
      userId,
      action,
      details,
      ip,
      userAgent: navigator.userAgent,
      timestamp: serverTimestamp(),
      sessionId: generateSessionId()
    }
    
    await addDoc(collection(db, 'adminLogs'), logData)
    
    // Clean up old logs
    await cleanupOldLogs()
  } catch (error) {
    console.error('Admin logging error:', error)
  }
}

/**
 * Get admin access logs
 * @param {string} userId - User ID (optional)
 * @param {number} limit - Number of logs to retrieve
 * @returns {Promise<array>} - Access logs
 */
export async function getAdminLogs(userId = null, limit = 100) {
  try {
    let q = query(
      collection(db, 'adminLogs'),
      orderBy('timestamp', 'desc'),
      limit(limit)
    )
    
    if (userId) {
      q = query(
        collection(db, 'adminLogs'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(limit)
      )
    }
    
    const querySnapshot = await getDocs(q)
    const logs = []
    
    querySnapshot.forEach((doc) => {
      logs.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return logs
  } catch (error) {
    console.error('Get admin logs error:', error)
    return []
  }
}

/**
 * Check IP restriction
 * @param {string} ip - IP address to check
 * @returns {boolean} - Is IP allowed
 */
export function checkIPRestriction(ip) {
  if (ADMIN_SECURITY_CONFIG.allowedIPs.length === 0) {
    return true // No IP restriction
  }
  
  return ADMIN_SECURITY_CONFIG.allowedIPs.includes(ip)
}

/**
 * Get client IP address
 * @returns {Promise<string>} - Client IP
 */
export async function getClientIP() {
  try {
    // In production, you would get real IP from request headers
    // For demo, we'll use a mock IP
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.error('Get IP error:', error)
    return 'unknown'
  }
}

/**
 * Check admin session
 * @param {string} userId - User ID
 * @returns {Promise<object>} - Session check result
 */
export async function checkAdminSession(userId) {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      return { 
        success: false, 
        message: 'Người dùng không tồn tại' 
      }
    }
    
    const userData = userSnap.data()
    const lastActivity = userData.lastActivity?.toDate()
    const now = new Date()
    
    // Check session timeout
    if (lastActivity && (now - lastActivity) > ADMIN_SECURITY_CONFIG.sessionTimeout) {
      return { 
        success: false, 
        message: 'Phiên đăng nhập đã hết hạn' 
      }
    }
    
    // Update last activity
    await updateDoc(userRef, {
      lastActivity: serverTimestamp()
    })
    
    return { 
      success: true, 
      message: 'Phiên đăng nhập hợp lệ' 
    }
  } catch (error) {
    console.error('Admin session check error:', error)
    return { 
      success: false, 
      message: 'Lỗi kiểm tra phiên đăng nhập' 
    }
  }
}

/**
 * Log admin login
 * @param {string} userId - User ID
 * @param {string} ip - IP address
 * @param {boolean} success - Login success
 * @returns {Promise<void>}
 */
export async function logAdminLogin(userId, ip, success) {
  try {
    await logAdminAction(
      userId, 
      success ? ADMIN_ACTIONS.LOGIN : 'admin_login_failed',
      { 
        success,
        loginTime: new Date().toISOString()
      },
      ip
    )
    
    // Update user login info
    if (success) {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
        lastLoginIP: ip,
        loginCount: (await getDoc(userRef)).data()?.loginCount + 1 || 1
      })
    }
  } catch (error) {
    console.error('Admin login logging error:', error)
  }
}

/**
 * Log admin logout
 * @param {string} userId - User ID
 * @param {string} ip - IP address
 * @returns {Promise<void>}
 */
export async function logAdminLogout(userId, ip) {
  try {
    await logAdminAction(
      userId, 
      ADMIN_ACTIONS.LOGOUT,
      { 
        logoutTime: new Date().toISOString()
      },
      ip
    )
  } catch (error) {
    console.error('Admin logout logging error:', error)
  }
}

/**
 * Generate session ID
 * @returns {string} - Session ID
 */
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

/**
 * Clean up old logs
 * @returns {Promise<void>}
 */
async function cleanupOldLogs() {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - ADMIN_SECURITY_CONFIG.logRetentionDays)
    
    const q = query(
      collection(db, 'adminLogs'),
      where('timestamp', '<', cutoffDate),
      limit(1000)
    )
    
    const querySnapshot = await getDocs(q)
    const batch = []
    
    querySnapshot.forEach((doc) => {
      batch.push(doc.ref.delete())
    })
    
    if (batch.length > 0) {
      await Promise.all(batch)

    }
  } catch (error) {
    console.error('Log cleanup error:', error)
  }
}

/**
 * Get admin security settings
 * @returns {object} - Security settings
 */
export function getAdminSecuritySettings() {
  return {
    ...ADMIN_SECURITY_CONFIG,
    allowedIPs: ADMIN_SECURITY_CONFIG.allowedIPs.length > 0 ? 
      ADMIN_SECURITY_CONFIG.allowedIPs : ['No IP restriction']
  }
}

/**
 * Update admin security settings
 * @param {object} settings - New settings
 * @returns {Promise<object>} - Update result
 */
export async function updateAdminSecuritySettings(settings) {
  try {
    // In production, you would save to Firestore
    // For demo, we'll update the config object
    Object.assign(ADMIN_SECURITY_CONFIG, settings)
    
    return {
      success: true,
      message: 'Cài đặt bảo mật đã được cập nhật'
    }
  } catch (error) {
    console.error('Update security settings error:', error)
    return {
      success: false,
      message: 'Không thể cập nhật cài đặt bảo mật'
    }
  }
}

/**
 * Get admin activity summary
 * @param {string} userId - User ID
 * @param {number} days - Number of days
 * @returns {Promise<object>} - Activity summary
 */
export async function getAdminActivitySummary(userId, days = 7) {
  try {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    const q = query(
      collection(db, 'adminLogs'),
      where('userId', '==', userId),
      where('timestamp', '>=', startDate),
      orderBy('timestamp', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const activities = []
    
    querySnapshot.forEach((doc) => {
      activities.push(doc.data())
    })
    
    // Group by action
    const actionCounts = {}
    activities.forEach(activity => {
      actionCounts[activity.action] = (actionCounts[activity.action] || 0) + 1
    })
    
    return {
      totalActions: activities.length,
      actionCounts,
      lastActivity: activities[0]?.timestamp,
      period: `${days} days`
    }
  } catch (error) {
    console.error('Get activity summary error:', error)
    return {
      totalActions: 0,
      actionCounts: {},
      lastActivity: null,
      period: `${days} days`
    }
  }
}
