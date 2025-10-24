/**
 * API Service - Firebase Backend
 * Migrated from JSON Server to Firebase Firestore
 */
import firebaseService from './firebaseService'

// Legacy axios setup (kept for potential fallback)
// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Products API - Firebase Firestore
export const productsAPI = {
  getAll: () => firebaseService.products.getAll(),
  getById: (id) => firebaseService.products.getById(id),
  create: (data) => firebaseService.products.create(data),
  update: (id, data) => firebaseService.products.update(id, data),
  delete: (id) => firebaseService.products.delete(id)
}

// Auth API - Use firebaseAuthService.js directly
// Removed legacy authAPI to avoid confusion

// Orders API - Firebase Firestore
export const ordersAPI = {
  create: (data) => firebaseService.orders.create(data),
  getAll: () => firebaseService.orders.getAll(),
  getById: (id) => firebaseService.orders.getById(id),
  getUserOrders: (userId) => firebaseService.orders.getUserOrders(userId),
  updateStatus: (id, status) => firebaseService.orders.updateStatus(id, status),
  update: (id, data) => firebaseService.orders.update(id, data)
}

// Users API - Firebase Firestore
export const usersAPI = {
  getAll: () => firebaseService.users.getAll(),
  getById: (id) => firebaseService.users.getById(id),
  update: (id, data) => firebaseService.users.upsert(id, data),
  delete: (id) => Promise.reject(new Error('User deletion not implemented'))
}

// Reviews API - Firebase Firestore
export const reviewsAPI = {
  getByProduct: (productId) => firebaseService.reviews.getByProduct(productId),
  create: (data) => firebaseService.reviews.create(data),
  delete: (id) => firebaseService.reviews.delete(id)
}

// Export Firebase service as default
export default firebaseService
