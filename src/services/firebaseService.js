import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { queryCache } from '../utils/cache'

/**
 * Firebase Firestore Service with Caching
 * Reduces Firestore reads and improves performance
 */

// ============================================
// PRODUCTS
// ============================================

export const productsService = {
  /**
   * Get all products (with cache)
   */
  async getAll() {
    const cacheKey = 'products:all'
    const cached = queryCache.get(cacheKey, 5 * 60 * 1000) // 5 min cache
    
    if (cached) {
      console.log('✅ Products from cache')
      return cached
    }

    try {
      const querySnapshot = await getDocs(collection(db, 'products'))
      const products = []
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() })
      })
      
      const result = { data: products }
      queryCache.set(cacheKey, result)
      
      return result
    } catch (error) {
      console.error('Error getting products:', error)
      throw error
    }
  },

  /**
   * Get product by ID
   */
  async getById(id) {
    try {
      const docRef = doc(db, 'products', id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { data: { id: docSnap.id, ...docSnap.data() } }
      } else {
        throw new Error('Product not found')
      }
    } catch (error) {
      console.error('Error getting product:', error)
      throw error
    }
  },

  /**
   * Get products by category
   */
  async getByCategory(category) {
    try {
      const q = query(collection(db, 'products'), where('category', '==', category))
      const querySnapshot = await getDocs(q)
      const products = []
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() })
      })
      return { data: products }
    } catch (error) {
      console.error('Error getting products by category:', error)
      throw error
    }
  },

  /**
   * Create new product (Admin only)
   */
  async create(productData) {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      // Clear products cache
      queryCache.clear('products:all')
      
      return { data: { id: docRef.id, ...productData } }
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  },

  /**
   * Update product (Admin only)
   */
  async update(id, productData) {
    try {
      const docRef = doc(db, 'products', id)
      await updateDoc(docRef, {
        ...productData,
        updatedAt: serverTimestamp()
      })
      
      // Clear products cache
      queryCache.clear('products:all')
      queryCache.clear(`product:${id}`)
      
      return { data: { id, ...productData } }
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  },

  /**
   * Delete product (Admin only)
   */
  async delete(id) {
    try {
      await deleteDoc(doc(db, 'products', id))
      
      // Clear products cache
      queryCache.clear('products:all')
      queryCache.clear(`product:${id}`)
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }
}

// ============================================
// ORDERS
// ============================================

export const ordersService = {
  /**
   * Get all orders (Admin only)
   */
  async getAll() {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      const orders = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        orders.push({ 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
        })
      })
      return { data: orders }
    } catch (error) {
      console.error('Error getting orders:', error)
      throw error
    }
  },

  /**
   * Get orders by user ID
   */
  async getUserOrders(userId) {
    try {
      const q = query(
        collection(db, 'orders'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const orders = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        orders.push({ 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
        })
      })
      return { data: orders }
    } catch (error) {
      console.error('Error getting user orders:', error)
      throw error
    }
  },

  /**
   * Get order by ID
   */
  async getById(id) {
    try {
      const docRef = doc(db, 'orders', id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data()
        return { 
          data: { 
            id: docSnap.id, 
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
          } 
        }
      } else {
        throw new Error('Order not found')
      }
    } catch (error) {
      console.error('Error getting order:', error)
      throw error
    }
  },

  /**
   * Create new order
   */
  async create(orderData) {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return { data: { id: docRef.id, ...orderData } }
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  },

  /**
   * Update order status
   */
  async updateStatus(id, status) {
    try {
      const docRef = doc(db, 'orders', id)
      await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp()
      })
      return { data: { id, status } }
    } catch (error) {
      console.error('Error updating order status:', error)
      throw error
    }
  },

  /**
   * Update order
   */
  async update(id, orderData) {
    try {
      const docRef = doc(db, 'orders', id)
      await updateDoc(docRef, {
        ...orderData,
        updatedAt: serverTimestamp()
      })
      return { data: { id, ...orderData } }
    } catch (error) {
      console.error('Error updating order:', error)
      throw error
    }
  }
}

// ============================================
// REVIEWS
// ============================================

export const reviewsService = {
  /**
   * Get all reviews for a product
   */
  async getByProduct(productId) {
    try {
      const q = query(
        collection(db, 'reviews'), 
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const reviews = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        reviews.push({ 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
        })
      })
      return { data: reviews }
    } catch (error) {
      console.error('Error getting reviews:', error)
      throw error
    }
  },

  /**
   * Create new review
   */
  async create(reviewData) {
    try {
      const docRef = await addDoc(collection(db, 'reviews'), {
        ...reviewData,
        createdAt: serverTimestamp()
      })
      return { data: { id: docRef.id, ...reviewData } }
    } catch (error) {
      console.error('Error creating review:', error)
      throw error
    }
  },

  /**
   * Delete review
   */
  async delete(id) {
    try {
      await deleteDoc(doc(db, 'reviews', id))
      return { success: true }
    } catch (error) {
      console.error('Error deleting review:', error)
      throw error
    }
  }
}

// ============================================
// USERS
// ============================================

export const usersService = {
  /**
   * Get all users (Admin only)
   */
  async getAll() {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'))
      const users = []
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() })
      })
      return { data: users }
    } catch (error) {
      console.error('Error getting users:', error)
      throw error
    }
  },

  /**
   * Get user by ID
   */
  async getById(id) {
    try {
      const docRef = doc(db, 'users', id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { data: { id: docSnap.id, ...docSnap.data() } }
      } else {
        throw new Error('User not found')
      }
    } catch (error) {
      console.error('Error getting user:', error)
      throw error
    }
  },

  /**
   * Create or update user profile
   */
  async upsert(userId, userData) {
    try {
      const docRef = doc(db, 'users', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        // Update existing user
        await updateDoc(docRef, {
          ...userData,
          updatedAt: serverTimestamp()
        })
      } else {
        // Create new user document
        await setDoc(docRef, {
          ...userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }
      
      return { data: { id: userId, ...userData } }
    } catch (error) {
      console.error('Error upserting user:', error)
      throw error
    }
  }
}

// Export all services
export default {
  products: productsService,
  orders: ordersService,
  reviews: reviewsService,
  users: usersService
}
