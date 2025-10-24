// Product Model - Business logic for products
import { productsAPI } from '../services/apiService'

const FALLBACK_PRODUCTS = [
  {id:'p001', name:'Quần short caro', price:349000, original_price:499000, currency:'VND', rating:4.7, reviews:64, image:'https://picsum.photos/seed/p1/600/600', badge:'New', category:'Bottom'},
  {id:'p002', name:'Áo sweater xanh', price:459000, original_price:null, currency:'VND', rating:4.5, reviews:112, image:'https://picsum.photos/seed/p2/600/600', badge:null, category:'Top'},
  {id:'p003', name:'Áo len vàng', price:529000, original_price:699000, currency:'VND', rating:4.2, reviews:45, image:'https://picsum.photos/seed/p3/600/600', badge:'Sale', category:'Top'},
  {id:'p004', name:'Áo nỉ xám', price:399000, original_price:510000, currency:'VND', rating:4.1, reviews:21, image:'https://picsum.photos/seed/p4/600/600', badge:null, category:'Top'},
  {id:'p005', name:'Quần jogger đen', price:429000, original_price:null, currency:'VND', rating:4.4, reviews:80, image:'https://picsum.photos/seed/p5/600/600', badge:null, category:'Bottom'},
  {id:'p006', name:'Blazer xanh nhạt', price:899000, original_price:1199000, currency:'VND', rating:4.8, reviews:12, image:'https://picsum.photos/seed/p6/600/600', badge:'Hot', category:'Outer'},
  {id:'p007', name:'Hoodie basic', price:599000, original_price:null, currency:'VND', rating:4.3, reviews:54, image:'https://picsum.photos/seed/p7/600/600', badge:null, category:'Top'},
  {id:'p008', name:'Áo thun cổ tròn', price:199000, original_price:249000, currency:'VND', rating:4.0, reviews:33, image:'https://picsum.photos/seed/p8/600/600', badge:'Sale', category:'Top'}
]

/**
 * Load all products from Firebase or fallback data
 */
export const loadProducts = async () => {
  try {
    const response = await productsAPI.getAll()
    console.log('✅ Products loaded from Firebase:', response.data?.length || 0)
    return response.data || []
  } catch (error) {
    console.warn('⚠️ Failed to load products from Firebase, using fallback data', error)
    return FALLBACK_PRODUCTS
  }
}

/**
 * Get product by ID
 */
export const getProductById = async (id) => {
  const products = await loadProducts()
  return products.find(p => p.id === id)
}

/**
 * Get all unique categories
 */
export const getCategories = (products) => {
  if (!Array.isArray(products)) return []
  const set = new Set(products.map(p => p.category))
  return Array.from(set)
}

/**
 * Filter products by category
 */
export const filterByCategory = (products, category) => {
  if (!Array.isArray(products)) return []
  return products.filter(p => p.category === category)
}

/**
 * Search products by name
 */
export const searchProducts = (products, query) => {
  if (!Array.isArray(products)) return []
  const q = query.toLowerCase().trim()
  return products.filter(p => p.name.toLowerCase().includes(q))
}

/**
 * Sort products
 */
export const sortProducts = (products, sortType) => {
  if (!Array.isArray(products)) return []
  const list = [...products]
  
  switch(sortType) {
    case 'popular':
      return list.sort((a, b) => b.reviews - a.reviews)
    case 'new':
      return list.reverse()
    case 'sale':
      return list.filter(p => p.original_price)
    default:
      return list
  }
}

/**
 * Calculate sale percentage
 */
export const calculateSalePercent = (product) => {
  if (!product.original_price) return null
  return Math.round((1 - product.price / product.original_price) * 100)
}

/**
 * Format currency to VND
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(value)
}
