import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'

/**
 * Firebase Product Service - Replace JSON API calls
 */
export const productService = {
  /**
   * Load all products from Firebase Firestore
   */
  async loadProducts(filters = {}) {
    try {

      
      let productsQuery = collection(db, 'products')
      
      // Apply filters if provided
      if (filters.category && filters.category !== 'all') {
        productsQuery = query(productsQuery, where('category', '==', filters.category))
      }
      
      // Apply sorting
      if (filters.sortBy) {
        productsQuery = query(productsQuery, orderBy(filters.sortBy, filters.sortOrder || 'desc'))
      }
      
      // Limit results for pagination
      if (filters.limit) {
        productsQuery = query(productsQuery, limit(filters.limit))
      }
      
      const querySnapshot = await getDocs(productsQuery)
      const products = []
      
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data()
        })
      })
      

      return products
    } catch (error) {
      console.error('❌ Failed to load products from Firebase:', error)
      throw new Error(`Không thể tải sản phẩm: ${error.message}`)
    }
  },

  /**
   * Get single product by ID
   */
  async getProductById(id) {
    try {
      if (!id) {
        throw new Error('Product ID is required')
      }
      
      const docRef = doc(db, 'products', id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        }
      } else {
        throw new Error('Không tìm thấy sản phẩm')
      }
    } catch (error) {
      console.error('❌ Failed to get product by ID:', error)
      throw error
    }
  },

  /**
   * Create new product - THÊM HÀM NÀY
   */
  async createProduct(productData) {
    try {
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      

      return {
        id: docRef.id,
        ...productData
      }
    } catch (error) {
      console.error('❌ Failed to create product:', error)
      throw new Error(`Không thể tạo sản phẩm: ${error.message}`)
    }
  },

  /**
   * Update existing product - THÊM HÀM NÀY
   */
  async updateProduct(id, productData) {
    try {
      const docRef = doc(db, 'products', id)
      await updateDoc(docRef, {
        ...productData,
        updatedAt: serverTimestamp()
      })
      

      return {
        id,
        ...productData
      }
    } catch (error) {
      console.error('❌ Failed to update product:', error)
      throw new Error(`Không thể cập nhật sản phẩm: ${error.message}`)
    }
  },

  /**
   * Delete product - THÊM HÀM NÀY
   */
  async deleteProduct(id) {
    try {
      await deleteDoc(doc(db, 'products', id))

      return { success: true }
    } catch (error) {
      console.error('❌ Failed to delete product:', error)
      throw new Error(`Không thể xóa sản phẩm: ${error.message}`)
    }
  },

  /**
   * Get featured products (with badge)
   */
  async getFeaturedProducts(limitCount = 8) {
    try {
      const featuredQuery = query(
        collection(db, 'products'),
        where('badge', '!=', ''),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(featuredQuery)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('❌ Failed to load featured products:', error)
      return []
    }
  },

  /**
   * Get products by category
   */
  async getProductsByCategory(category, limitCount = 20) {
    try {
      const categoryQuery = query(
        collection(db, 'products'),
        where('category', '==', category),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(categoryQuery)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('❌ Failed to load products by category:', error)
      return []
    }
  },

  /**
   * Search products by name
   */
  async searchProducts(searchTerm, limitCount = 20) {
    try {
      // Firestore doesn't support full-text search natively
      // This loads all products and filters client-side for small datasets
      // For larger datasets, consider Algolia or Firebase Extensions
      const allProducts = await this.loadProducts()
      
      return allProducts
        .filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, limitCount)
    } catch (error) {
      console.error('❌ Search failed:', error)
      return []
    }
  }
}

/**
 * Utility functions for product data manipulation
 */

/**
 * Get all unique categories from products array
 */
export const getCategories = (products) => {
  if (!Array.isArray(products)) return []
  const categories = new Set(products.map(p => p.category).filter(Boolean))
  return ['all', ...Array.from(categories)]
}

/**
 * Filter products by category (client-side)
 */
export const filterByCategory = (products, category) => {
  if (!Array.isArray(products)) return []
  if (category === 'all') return products
  return products.filter(p => p.category === category)
}

/**
 * Search products by name (client-side)
 */
export const searchProducts = (products, query) => {
  if (!Array.isArray(products)) return []
  if (!query.trim()) return products
  
  const searchTerm = query.toLowerCase().trim()
  return products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm) ||
    p.description?.toLowerCase().includes(searchTerm)
  )
}

/**
 * Sort products by various criteria
 */
export const sortProducts = (products, sortType) => {
  if (!Array.isArray(products)) return []
  
  const sortedProducts = [...products]
  
  switch(sortType) {
    case 'popular':
      return sortedProducts.sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
    
    case 'rating':
      return sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    
    case 'price-low':
      return sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0))
    
    case 'price-high':
      return sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0))
    
    case 'new':
      // Sort by createdAt field (newest first)
      return sortedProducts.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0)
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0)
        return dateB - dateA
      })
    
    case 'sale':
      // Show products with sale (original_price > price)
      return sortedProducts.filter(p => 
        p.original_price && p.original_price > p.price
      )
    
    default:
      return sortedProducts
  }
}

/**
 * Calculate sale percentage
 */
export const calculateSalePercent = (product) => {
  if (!product?.original_price || !product?.price) return 0
  if (product.original_price <= product.price) return 0
  
  return Math.round((1 - product.price / product.original_price) * 100)
}

/**
 * Format currency to VND
 */
export const formatCurrency = (value) => {
  if (!value && value !== 0) return '0₫'
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

/**
 * Get related products (by category)
 */
export const getRelatedProducts = (currentProduct, allProducts, limitCount = 4) => {
  if (!currentProduct || !Array.isArray(allProducts)) return []
  
  return allProducts
    .filter(product => 
      product.id !== currentProduct.id && 
      product.category === currentProduct.category
    )
    .slice(0, limitCount)
}

/**
 * Validate product data structure
 */
export const validateProduct = (product) => {
  const errors = []
  
  if (!product.name?.trim()) errors.push('Tên sản phẩm là bắt buộc')
  if (!product.price || product.price <= 0) errors.push('Giá phải lớn hơn 0')
  if (!product.category?.trim()) errors.push('Danh mục là bắt buộc')
  if (product.stock < 0) errors.push('Số lượng không hợp lệ')
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// ============================================
// NAMED EXPORTS FOR REDUX SLICES - THÊM PHẦN NÀY
// ============================================

/**
 * Load all products - for Redux
 */
export const loadProducts = (filters = {}) => productService.loadProducts(filters)

/**
 * Get product by ID - for Redux
 */
export const getProductById = (id) => productService.getProductById(id)

/**
 * Create new product - for Redux
 */
export const createProduct = (productData) => productService.createProduct(productData)

/**
 * Update product - for Redux
 */
export const updateProduct = (id, productData) => productService.updateProduct(id, productData)

/**
 * Delete product - for Redux
 */
export const deleteProduct = (id) => productService.deleteProduct(id)

/**
 * Get featured products - for Redux
 */
export const getFeaturedProducts = (limitCount = 8) => productService.getFeaturedProducts(limitCount)

/**
 * Get products by category - for Redux
 */
export const getProductsByCategory = (category, limitCount = 20) => 
  productService.getProductsByCategory(category, limitCount)

/**
 * Search products - for Redux
 */
export const searchProductsFromAPI = (searchTerm, limitCount = 20) => 
  productService.searchProducts(searchTerm, limitCount)

export default productService