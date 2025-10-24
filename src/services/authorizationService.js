import { auth, db } from '../config/firebase'
import { 
  doc, 
  getDoc, 
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore'

/**
 * Role-Based Authorization Service
 * Handles permissions and access control
 */

// Role definitions
export const ROLES = {
  GUEST: 'guest',
  CUSTOMER: 'customer',
  STAFF: 'staff',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
}

// Permission definitions
export const PERMISSIONS = {
  // Product permissions
  VIEW_PRODUCTS: 'view_products',
  CREATE_PRODUCTS: 'create_products',
  EDIT_PRODUCTS: 'edit_products',
  DELETE_PRODUCTS: 'delete_products',
  
  // Order permissions
  VIEW_ORDERS: 'view_orders',
  CREATE_ORDERS: 'create_orders',
  EDIT_ORDERS: 'edit_orders',
  DELETE_ORDERS: 'delete_orders',
  MANAGE_ORDERS: 'manage_orders',
  
  // User permissions
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  MANAGE_USERS: 'manage_users',
  
  // Analytics permissions
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_ANALYTICS: 'export_analytics',
  
  // System permissions
  MANAGE_SETTINGS: 'manage_settings',
  MANAGE_ROLES: 'manage_roles',
  VIEW_LOGS: 'view_logs',
  
  // Account permissions
  VIEW_OWN_PROFILE: 'view_own_profile',
  EDIT_OWN_PROFILE: 'edit_own_profile',
  CHANGE_PASSWORD: 'change_password',
  ENABLE_2FA: 'enable_2fa'
}

// Role-Permission mapping
const ROLE_PERMISSIONS = {
  [ROLES.GUEST]: [
    PERMISSIONS.VIEW_PRODUCTS
  ],
  
  [ROLES.CUSTOMER]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_ORDERS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
    PERMISSIONS.CHANGE_PASSWORD,
    PERMISSIONS.ENABLE_2FA
  ],
  
  [ROLES.STAFF]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCTS,
    PERMISSIONS.EDIT_PRODUCTS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.EDIT_ORDERS,
    PERMISSIONS.MANAGE_ORDERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
    PERMISSIONS.CHANGE_PASSWORD,
    PERMISSIONS.ENABLE_2FA
  ],
  
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_PRODUCTS,
    PERMISSIONS.CREATE_PRODUCTS,
    PERMISSIONS.EDIT_PRODUCTS,
    PERMISSIONS.DELETE_PRODUCTS,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.EDIT_ORDERS,
    PERMISSIONS.DELETE_ORDERS,
    PERMISSIONS.MANAGE_ORDERS,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.EDIT_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_ANALYTICS,
    PERMISSIONS.MANAGE_SETTINGS,
    PERMISSIONS.VIEW_LOGS,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.EDIT_OWN_PROFILE,
    PERMISSIONS.CHANGE_PASSWORD,
    PERMISSIONS.ENABLE_2FA
  ],
  
  [ROLES.SUPER_ADMIN]: [
    // All permissions
    ...Object.values(PERMISSIONS)
  ]
}

/**
 * Check if user has permission
 * @param {string} userId - User ID
 * @param {string} permission - Permission to check
 * @returns {Promise<boolean>} - Has permission
 */
export async function hasPermission(userId, permission) {
  try {
    if (!userId) return false
    
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) return false
    
    const userData = userSnap.data()
    const userRole = userData.role || ROLES.GUEST
    
    // Check if user is active
    if (userData.status === 'suspended' || userData.status === 'banned') {
      return false
    }
    
    // Get role permissions
    const rolePermissions = ROLE_PERMISSIONS[userRole] || []
    
    // Check if permission is granted
    return rolePermissions.includes(permission)
  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
}

/**
 * Check if user has any of the permissions
 * @param {string} userId - User ID
 * @param {array} permissions - Array of permissions
 * @returns {Promise<boolean>} - Has any permission
 */
export async function hasAnyPermission(userId, permissions) {
  try {
    for (const permission of permissions) {
      if (await hasPermission(userId, permission)) {
        return true
      }
    }
    return false
  } catch (error) {
    console.error('Any permission check error:', error)
    return false
  }
}

/**
 * Check if user has all permissions
 * @param {string} userId - User ID
 * @param {array} permissions - Array of permissions
 * @returns {Promise<boolean>} - Has all permissions
 */
export async function hasAllPermissions(userId, permissions) {
  try {
    for (const permission of permissions) {
      if (!(await hasPermission(userId, permission))) {
        return false
      }
    }
    return true
  } catch (error) {
    console.error('All permissions check error:', error)
    return false
  }
}

/**
 * Get user role
 * @param {string} userId - User ID
 * @returns {Promise<string>} - User role
 */
export async function getUserRole(userId) {
  try {
    if (!userId) return ROLES.GUEST
    
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) return ROLES.GUEST
    
    const userData = userSnap.data()
    return userData.role || ROLES.GUEST
  } catch (error) {
    console.error('Get user role error:', error)
    return ROLES.GUEST
  }
}

/**
 * Check if user is admin
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - Is admin
 */
export async function isAdmin(userId) {
  const role = await getUserRole(userId)
  return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN
}

/**
 * Check if user is staff or admin
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - Is staff or admin
 */
export async function isStaffOrAdmin(userId) {
  const role = await getUserRole(userId)
  return [ROLES.STAFF, ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(role)
}

/**
 * Check if user can access resource
 * @param {string} userId - User ID
 * @param {string} resource - Resource type
 * @param {string} action - Action (view, edit, delete)
 * @param {object} resourceData - Resource data (optional)
 * @returns {Promise<boolean>} - Can access
 */
export async function canAccessResource(userId, resource, action, resourceData = null) {
  try {
    // Check basic permissions first
    const permission = `${action.toUpperCase()}_${resource.toUpperCase()}S`
    if (await hasPermission(userId, permission)) {
      return true
    }
    
    // Check resource-specific permissions
    switch (resource) {
      case 'order':
        return await canAccessOrder(userId, action, resourceData)
      case 'user':
        return await canAccessUser(userId, action, resourceData)
      case 'product':
        return await canAccessProduct(userId, action, resourceData)
      default:
        return false
    }
  } catch (error) {
    console.error('Resource access check error:', error)
    return false
  }
}

/**
 * Check if user can access order
 * @param {string} userId - User ID
 * @param {string} action - Action
 * @param {object} orderData - Order data
 * @returns {Promise<boolean>} - Can access
 */
async function canAccessOrder(userId, action, orderData) {
  try {
    // Admin and staff can access all orders
    if (await isStaffOrAdmin(userId)) {
      return true
    }
    
    // Customers can only access their own orders
    if (orderData && orderData.userId === userId) {
      return action === 'view' || action === 'edit'
    }
    
    return false
  } catch (error) {
    return false
  }
}

/**
 * Check if user can access user profile
 * @param {string} userId - User ID
 * @param {string} action - Action
 * @param {object} userData - User data
 * @returns {Promise<boolean>} - Can access
 */
async function canAccessUser(userId, action, userData) {
  try {
    // Super admin can access all users
    if (await getUserRole(userId) === ROLES.SUPER_ADMIN) {
      return true
    }
    
    // Admin can access all users except super admin
    if (await getUserRole(userId) === ROLES.ADMIN) {
      return userData?.role !== ROLES.SUPER_ADMIN
    }
    
    // Users can only access their own profile
    if (userData && userData.id === userId) {
      return action === 'view' || action === 'edit'
    }
    
    return false
  } catch (error) {
    return false
  }
}

/**
 * Check if user can access product
 * @param {string} userId - User ID
 * @param {string} action - Action
 * @param {object} productData - Product data
 * @returns {Promise<boolean>} - Can access
 */
async function canAccessProduct(userId, action, productData) {
  try {
    // Staff and admin can access all products
    if (await isStaffOrAdmin(userId)) {
      return true
    }
    
    // Customers can only view products
    if (action === 'view') {
      return true
    }
    
    return false
  } catch (error) {
    return false
  }
}

/**
 * Get user permissions
 * @param {string} userId - User ID
 * @returns {Promise<array>} - User permissions
 */
export async function getUserPermissions(userId) {
  try {
    const role = await getUserRole(userId)
    return ROLE_PERMISSIONS[role] || []
  } catch (error) {
    console.error('Get user permissions error:', error)
    return []
  }
}

/**
 * Check if user can perform action on resource
 * @param {string} userId - User ID
 * @param {string} resource - Resource
 * @param {string} action - Action
 * @returns {Promise<boolean>} - Can perform action
 */
export async function canPerformAction(userId, resource, action) {
  const permission = `${action.toUpperCase()}_${resource.toUpperCase()}S`
  return await hasPermission(userId, permission)
}

/**
 * Get accessible resources for user
 * @param {string} userId - User ID
 * @returns {Promise<object>} - Accessible resources
 */
export async function getAccessibleResources(userId) {
  try {
    const permissions = await getUserPermissions(userId)
    
    return {
      products: {
        view: permissions.includes(PERMISSIONS.VIEW_PRODUCTS),
        create: permissions.includes(PERMISSIONS.CREATE_PRODUCTS),
        edit: permissions.includes(PERMISSIONS.EDIT_PRODUCTS),
        delete: permissions.includes(PERMISSIONS.DELETE_PRODUCTS)
      },
      orders: {
        view: permissions.includes(PERMISSIONS.VIEW_ORDERS),
        create: permissions.includes(PERMISSIONS.CREATE_ORDERS),
        edit: permissions.includes(PERMISSIONS.EDIT_ORDERS),
        delete: permissions.includes(PERMISSIONS.DELETE_ORDERS),
        manage: permissions.includes(PERMISSIONS.MANAGE_ORDERS)
      },
      users: {
        view: permissions.includes(PERMISSIONS.VIEW_USERS),
        create: permissions.includes(PERMISSIONS.CREATE_USERS),
        edit: permissions.includes(PERMISSIONS.EDIT_USERS),
        delete: permissions.includes(PERMISSIONS.DELETE_USERS),
        manage: permissions.includes(PERMISSIONS.MANAGE_USERS)
      },
      analytics: {
        view: permissions.includes(PERMISSIONS.VIEW_ANALYTICS),
        export: permissions.includes(PERMISSIONS.EXPORT_ANALYTICS)
      },
      system: {
        settings: permissions.includes(PERMISSIONS.MANAGE_SETTINGS),
        roles: permissions.includes(PERMISSIONS.MANAGE_ROLES),
        logs: permissions.includes(PERMISSIONS.VIEW_LOGS)
      }
    }
  } catch (error) {
    console.error('Get accessible resources error:', error)
    return {}
  }
}
