import { auth, db } from '../config/firebase'
import { 
  doc, 
  getDoc, 
  collection,
  query,
  where,
  getDocs,
  orderBy
} from 'firebase/firestore'

/**
 * Enhanced Role-Based Access Control Service
 * Detailed permission system for admin area
 */

// Enhanced Role Definitions
export const ENHANCED_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  VIEWER: 'viewer'
}

// Detailed Permission Categories
export const PERMISSION_CATEGORIES = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  USERS: 'users',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  SECURITY: 'security',
  REPORTS: 'reports',
  INVENTORY: 'inventory',
  MARKETING: 'marketing',
  FINANCE: 'finance'
}

// Detailed Permissions
export const DETAILED_PERMISSIONS = {
  // Product Management
  PRODUCTS_VIEW: 'products_view',
  PRODUCTS_CREATE: 'products_create',
  PRODUCTS_EDIT: 'products_edit',
  PRODUCTS_DELETE: 'products_delete',
  PRODUCTS_BULK_ACTIONS: 'products_bulk_actions',
  PRODUCTS_IMPORT: 'products_import',
  PRODUCTS_EXPORT: 'products_export',
  
  // Order Management
  ORDERS_VIEW: 'orders_view',
  ORDERS_CREATE: 'orders_create',
  ORDERS_EDIT: 'orders_edit',
  ORDERS_DELETE: 'orders_delete',
  ORDERS_PROCESS: 'orders_process',
  ORDERS_CANCEL: 'orders_cancel',
  ORDERS_REFUND: 'orders_refund',
  ORDERS_EXPORT: 'orders_export',
  
  // User Management
  USERS_VIEW: 'users_view',
  USERS_CREATE: 'users_create',
  USERS_EDIT: 'users_edit',
  USERS_DELETE: 'users_delete',
  USERS_ROLES: 'users_roles',
  USERS_STATUS: 'users_status',
  USERS_EXPORT: 'users_export',
  
  // Analytics & Reports
  ANALYTICS_VIEW: 'analytics_view',
  ANALYTICS_EXPORT: 'analytics_export',
  REPORTS_GENERATE: 'reports_generate',
  REPORTS_SCHEDULE: 'reports_schedule',
  
  // System Settings
  SETTINGS_GENERAL: 'settings_general',
  SETTINGS_SECURITY: 'settings_security',
  SETTINGS_INTEGRATION: 'settings_integration',
  SETTINGS_BACKUP: 'settings_backup',
  
  // Security
  SECURITY_LOGS: 'security_logs',
  SECURITY_2FA: 'security_2fa',
  SECURITY_IP: 'security_ip',
  SECURITY_SESSIONS: 'security_sessions',
  
  // Inventory
  INVENTORY_VIEW: 'inventory_view',
  INVENTORY_UPDATE: 'inventory_update',
  INVENTORY_ALERTS: 'inventory_alerts',
  INVENTORY_REPORTS: 'inventory_reports',
  
  // Marketing
  MARKETING_EMAIL: 'marketing_email',
  MARKETING_SMS: 'marketing_sms',
  MARKETING_CAMPAIGNS: 'marketing_campaigns',
  MARKETING_ANALYTICS: 'marketing_analytics',
  
  // Finance
  FINANCE_VIEW: 'finance_view',
  FINANCE_REPORTS: 'finance_reports',
  FINANCE_EXPORT: 'finance_export',
  FINANCE_SETTINGS: 'finance_settings'
}

// Role-Permission Matrix
const ROLE_PERMISSIONS = {
  [ENHANCED_ROLES.SUPER_ADMIN]: [
    // All permissions
    ...Object.values(DETAILED_PERMISSIONS)
  ],
  
  [ENHANCED_ROLES.ADMIN]: [
    // Product Management
    DETAILED_PERMISSIONS.PRODUCTS_VIEW,
    DETAILED_PERMISSIONS.PRODUCTS_CREATE,
    DETAILED_PERMISSIONS.PRODUCTS_EDIT,
    DETAILED_PERMISSIONS.PRODUCTS_DELETE,
    DETAILED_PERMISSIONS.PRODUCTS_BULK_ACTIONS,
    DETAILED_PERMISSIONS.PRODUCTS_IMPORT,
    DETAILED_PERMISSIONS.PRODUCTS_EXPORT,
    
    // Order Management
    DETAILED_PERMISSIONS.ORDERS_VIEW,
    DETAILED_PERMISSIONS.ORDERS_EDIT,
    DETAILED_PERMISSIONS.ORDERS_PROCESS,
    DETAILED_PERMISSIONS.ORDERS_CANCEL,
    DETAILED_PERMISSIONS.ORDERS_REFUND,
    DETAILED_PERMISSIONS.ORDERS_EXPORT,
    
    // User Management
    DETAILED_PERMISSIONS.USERS_VIEW,
    DETAILED_PERMISSIONS.USERS_EDIT,
    DETAILED_PERMISSIONS.USERS_ROLES,
    DETAILED_PERMISSIONS.USERS_STATUS,
    DETAILED_PERMISSIONS.USERS_EXPORT,
    
    // Analytics
    DETAILED_PERMISSIONS.ANALYTICS_VIEW,
    DETAILED_PERMISSIONS.ANALYTICS_EXPORT,
    DETAILED_PERMISSIONS.REPORTS_GENERATE,
    
    // Settings
    DETAILED_PERMISSIONS.SETTINGS_GENERAL,
    DETAILED_PERMISSIONS.SETTINGS_SECURITY,
    
    // Security
    DETAILED_PERMISSIONS.SECURITY_LOGS,
    DETAILED_PERMISSIONS.SECURITY_2FA,
    DETAILED_PERMISSIONS.SECURITY_IP,
    
    // Inventory
    DETAILED_PERMISSIONS.INVENTORY_VIEW,
    DETAILED_PERMISSIONS.INVENTORY_UPDATE,
    DETAILED_PERMISSIONS.INVENTORY_ALERTS,
    DETAILED_PERMISSIONS.INVENTORY_REPORTS,
    
    // Marketing
    DETAILED_PERMISSIONS.MARKETING_EMAIL,
    DETAILED_PERMISSIONS.MARKETING_SMS,
    DETAILED_PERMISSIONS.MARKETING_CAMPAIGNS,
    DETAILED_PERMISSIONS.MARKETING_ANALYTICS,
    
    // Finance
    DETAILED_PERMISSIONS.FINANCE_VIEW,
    DETAILED_PERMISSIONS.FINANCE_REPORTS,
    DETAILED_PERMISSIONS.FINANCE_EXPORT
  ],
  
  [ENHANCED_ROLES.MANAGER]: [
    // Product Management (Limited)
    DETAILED_PERMISSIONS.PRODUCTS_VIEW,
    DETAILED_PERMISSIONS.PRODUCTS_CREATE,
    DETAILED_PERMISSIONS.PRODUCTS_EDIT,
    DETAILED_PERMISSIONS.PRODUCTS_EXPORT,
    
    // Order Management
    DETAILED_PERMISSIONS.ORDERS_VIEW,
    DETAILED_PERMISSIONS.ORDERS_EDIT,
    DETAILED_PERMISSIONS.ORDERS_PROCESS,
    DETAILED_PERMISSIONS.ORDERS_EXPORT,
    
    // User Management (Limited)
    DETAILED_PERMISSIONS.USERS_VIEW,
    DETAILED_PERMISSIONS.USERS_EDIT,
    
    // Analytics
    DETAILED_PERMISSIONS.ANALYTICS_VIEW,
    DETAILED_PERMISSIONS.ANALYTICS_EXPORT,
    
    // Inventory
    DETAILED_PERMISSIONS.INVENTORY_VIEW,
    DETAILED_PERMISSIONS.INVENTORY_UPDATE,
    DETAILED_PERMISSIONS.INVENTORY_ALERTS,
    
    // Marketing
    DETAILED_PERMISSIONS.MARKETING_EMAIL,
    DETAILED_PERMISSIONS.MARKETING_CAMPAIGNS,
    
    // Finance
    DETAILED_PERMISSIONS.FINANCE_VIEW,
    DETAILED_PERMISSIONS.FINANCE_REPORTS
  ],
  
  [ENHANCED_ROLES.STAFF]: [
    // Product Management (View Only)
    DETAILED_PERMISSIONS.PRODUCTS_VIEW,
    DETAILED_PERMISSIONS.PRODUCTS_EDIT,
    
    // Order Management
    DETAILED_PERMISSIONS.ORDERS_VIEW,
    DETAILED_PERMISSIONS.ORDERS_EDIT,
    DETAILED_PERMISSIONS.ORDERS_PROCESS,
    
    // User Management (View Only)
    DETAILED_PERMISSIONS.USERS_VIEW,
    
    // Analytics (View Only)
    DETAILED_PERMISSIONS.ANALYTICS_VIEW,
    
    // Inventory
    DETAILED_PERMISSIONS.INVENTORY_VIEW,
    DETAILED_PERMISSIONS.INVENTORY_UPDATE
  ],
  
  [ENHANCED_ROLES.VIEWER]: [
    // View Only Permissions
    DETAILED_PERMISSIONS.PRODUCTS_VIEW,
    DETAILED_PERMISSIONS.ORDERS_VIEW,
    DETAILED_PERMISSIONS.USERS_VIEW,
    DETAILED_PERMISSIONS.ANALYTICS_VIEW,
    DETAILED_PERMISSIONS.INVENTORY_VIEW,
    DETAILED_PERMISSIONS.FINANCE_VIEW
  ]
}

/**
 * Check if user has specific permission
 * @param {string} userId - User ID
 * @param {string} permission - Permission to check
 * @returns {Promise<boolean>} - Has permission
 */
export async function hasDetailedPermission(userId, permission) {
  try {
    if (!userId) return false
    
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) return false
    
    const userData = userSnap.data()
    const userRole = userData.role || ENHANCED_ROLES.VIEWER
    
    // Check if user is active
    if (userData.status === 'suspended' || userData.status === 'banned') {
      return false
    }
    
    // Get role permissions
    const rolePermissions = ROLE_PERMISSIONS[userRole] || []
    
    return rolePermissions.includes(permission)
  } catch (error) {
    console.error('Detailed permission check error:', error)
    return false
  }
}

/**
 * Check if user has any of the permissions
 * @param {string} userId - User ID
 * @param {array} permissions - Array of permissions
 * @returns {Promise<boolean>} - Has any permission
 */
export async function hasAnyDetailedPermission(userId, permissions) {
  try {
    for (const permission of permissions) {
      if (await hasDetailedPermission(userId, permission)) {
        return true
      }
    }
    return false
  } catch (error) {
    console.error('Any detailed permission check error:', error)
    return false
  }
}

/**
 * Check if user has all permissions
 * @param {string} userId - User ID
 * @param {array} permissions - Array of permissions
 * @returns {Promise<boolean>} - Has all permissions
 */
export async function hasAllDetailedPermissions(userId, permissions) {
  try {
    for (const permission of permissions) {
      if (!(await hasDetailedPermission(userId, permission))) {
        return false
      }
    }
    return true
  } catch (error) {
    console.error('All detailed permissions check error:', error)
    return false
  }
}

/**
 * Get user's detailed permissions
 * @param {string} userId - User ID
 * @returns {Promise<array>} - User permissions
 */
export async function getUserDetailedPermissions(userId) {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) return []
    
    const userData = userSnap.data()
    const userRole = userData.role || ENHANCED_ROLES.VIEWER
    
    return ROLE_PERMISSIONS[userRole] || []
  } catch (error) {
    console.error('Get user detailed permissions error:', error)
    return []
  }
}

/**
 * Get permissions by category
 * @param {string} category - Permission category
 * @returns {array} - Permissions in category
 */
export function getPermissionsByCategory(category) {
  const categoryPermissions = {}
  
  Object.entries(DETAILED_PERMISSIONS).forEach(([key, value]) => {
    if (value.startsWith(category + '_')) {
      if (!categoryPermissions[category]) {
        categoryPermissions[category] = []
      }
      categoryPermissions[category].push(value)
    }
  })
  
  return categoryPermissions[category] || []
}

/**
 * Check if user can access admin area
 * @param {string} userId - User ID
 * @returns {Promise<object>} - Access check result
 */
export async function canAccessAdminArea(userId) {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      return { 
        success: false, 
        message: 'Người dùng không tồn tại',
        role: null
      }
    }
    
    const userData = userSnap.data()
    const userRole = userData.role
    
    // Check if user has admin role
    const adminRoles = [
      ENHANCED_ROLES.SUPER_ADMIN,
      ENHANCED_ROLES.ADMIN,
      ENHANCED_ROLES.MANAGER,
      ENHANCED_ROLES.STAFF,
      ENHANCED_ROLES.VIEWER
    ]
    
    if (!adminRoles.includes(userRole)) {
      return { 
        success: false, 
        message: 'Không có quyền truy cập khu vực quản trị',
        role: userRole
      }
    }
    
    // Check account status
    if (userData.status === 'suspended' || userData.status === 'banned') {
      return { 
        success: false, 
        message: 'Tài khoản đã bị khóa',
        role: userRole
      }
    }
    
    return { 
      success: true, 
      message: 'Có quyền truy cập khu vực quản trị',
      role: userRole
    }
  } catch (error) {
    console.error('Admin area access check error:', error)
    return { 
      success: false, 
      message: 'Lỗi kiểm tra quyền truy cập',
      role: null
    }
  }
}

/**
 * Get role hierarchy
 * @returns {object} - Role hierarchy
 */
export function getRoleHierarchy() {
  return {
    [ENHANCED_ROLES.SUPER_ADMIN]: {
      level: 5,
      name: 'Super Admin',
      description: 'Toàn quyền hệ thống',
      color: 'red'
    },
    [ENHANCED_ROLES.ADMIN]: {
      level: 4,
      name: 'Admin',
      description: 'Quản trị viên chính',
      color: 'purple'
    },
    [ENHANCED_ROLES.MANAGER]: {
      level: 3,
      name: 'Manager',
      description: 'Quản lý',
      color: 'blue'
    },
    [ENHANCED_ROLES.STAFF]: {
      level: 2,
      name: 'Staff',
      description: 'Nhân viên',
      color: 'green'
    },
    [ENHANCED_ROLES.VIEWER]: {
      level: 1,
      name: 'Viewer',
      description: 'Xem chỉ đọc',
      color: 'gray'
    }
  }
}

/**
 * Check if user can manage another user
 * @param {string} managerId - Manager user ID
 * @param {string} targetUserId - Target user ID
 * @returns {Promise<boolean>} - Can manage
 */
export async function canManageUser(managerId, targetUserId) {
  try {
    // Get manager role
    const managerRef = doc(db, 'users', managerId)
    const managerSnap = await getDoc(managerRef)
    
    if (!managerSnap.exists()) return false
    
    const managerData = managerSnap.data()
    const managerRole = managerData.role
    
    // Get target user role
    const targetRef = doc(db, 'users', targetUserId)
    const targetSnap = await getDoc(targetRef)
    
    if (!targetSnap.exists()) return false
    
    const targetData = targetSnap.data()
    const targetRole = targetData.role
    
    // Get role hierarchy
    const hierarchy = getRoleHierarchy()
    const managerLevel = hierarchy[managerRole]?.level || 0
    const targetLevel = hierarchy[targetRole]?.level || 0
    
    // Manager can only manage users with lower level
    return managerLevel > targetLevel
  } catch (error) {
    console.error('User management check error:', error)
    return false
  }
}

/**
 * Get accessible admin sections for user
 * @param {string} userId - User ID
 * @returns {Promise<object>} - Accessible sections
 */
export async function getAccessibleAdminSections(userId) {
  try {
    
    const sections = {
      dashboard: await hasDetailedPermission(userId, DETAILED_PERMISSIONS.ANALYTICS_VIEW),
      products: await hasAnyDetailedPermission(userId, [
        DETAILED_PERMISSIONS.PRODUCTS_VIEW,
        DETAILED_PERMISSIONS.PRODUCTS_CREATE,
        DETAILED_PERMISSIONS.PRODUCTS_EDIT,
        DETAILED_PERMISSIONS.PRODUCTS_DELETE
      ]),
      orders: await hasAnyDetailedPermission(userId, [
        DETAILED_PERMISSIONS.ORDERS_VIEW,
        DETAILED_PERMISSIONS.ORDERS_EDIT,
        DETAILED_PERMISSIONS.ORDERS_PROCESS
      ]),
      users: await hasAnyDetailedPermission(userId, [
        DETAILED_PERMISSIONS.USERS_VIEW,
        DETAILED_PERMISSIONS.USERS_EDIT,
        DETAILED_PERMISSIONS.USERS_ROLES
      ]),
      analytics: await hasDetailedPermission(userId, DETAILED_PERMISSIONS.ANALYTICS_VIEW),
      settings: await hasAnyDetailedPermission(userId, [
        DETAILED_PERMISSIONS.SETTINGS_GENERAL,
        DETAILED_PERMISSIONS.SETTINGS_SECURITY
      ]),
      security: await hasAnyDetailedPermission(userId, [
        DETAILED_PERMISSIONS.SECURITY_LOGS,
        DETAILED_PERMISSIONS.SECURITY_2FA,
        DETAILED_PERMISSIONS.SECURITY_IP
      ]),
      inventory: await hasAnyDetailedPermission(userId, [
        DETAILED_PERMISSIONS.INVENTORY_VIEW,
        DETAILED_PERMISSIONS.INVENTORY_UPDATE
      ]),
      marketing: await hasAnyDetailedPermission(userId, [
        DETAILED_PERMISSIONS.MARKETING_EMAIL,
        DETAILED_PERMISSIONS.MARKETING_CAMPAIGNS
      ]),
      finance: await hasAnyDetailedPermission(userId, [
        DETAILED_PERMISSIONS.FINANCE_VIEW,
        DETAILED_PERMISSIONS.FINANCE_REPORTS
      ])
    }
    
    return sections
  } catch (error) {
    console.error('Get accessible sections error:', error)
    return {}
  }
}
