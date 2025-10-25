// src/controllers/productSlice.js
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import { 
  loadProducts, 
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  sortProducts // THÊM IMPORT NÀY
} from '../models/productModel'

// Async thunks for Firebase operations
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const products = await loadProducts()
      return products
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { rejectWithValue }) => {
    try {
      const product = await getProductById(productId)
      return product
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const addNewProduct = createAsyncThunk(
  'products/addNewProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const newProduct = await createProduct(productData)
      return newProduct
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const updateExistingProduct = createAsyncThunk(
  'products/updateExistingProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const updatedProduct = await updateProduct(id, productData)
      return updatedProduct
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const removeProduct = createAsyncThunk(
  'products/removeProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await deleteProduct(productId)
      return productId
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    currentProduct: null,
    loading: false,
    error: null,
    filters: {
      category: 'all',
      searchQuery: '',
      sortType: 'default'
    },
    lastFetch: null
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null
    },
    clearProducts: (state) => {
      state.items = []
      state.lastFetch = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
        state.lastFetch = Date.now()
        state.error = null
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.items = []
      })
      
      // Fetch single product
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false
        state.currentProduct = action.payload
        state.error = null
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.currentProduct = null
      })
      
      // Add new product
      .addCase(addNewProduct.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      
      // Update product
      .addCase(updateExistingProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
        if (state.currentProduct && state.currentProduct.id === action.payload.id) {
          state.currentProduct = action.payload
        }
      })
      
      // Delete product
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload)
        if (state.currentProduct && state.currentProduct.id === action.payload) {
          state.currentProduct = null
        }
      })
  }
})

export const { 
  setFilters, 
  clearError, 
  clearCurrentProduct, 
  clearProducts 
} = productSlice.actions

export default productSlice.reducer

// Selectors
export const selectAllProducts = (state) => state.products.items
export const selectCurrentProduct = (state) => state.products.currentProduct
export const selectProductsLoading = (state) => state.products.loading
export const selectProductsError = (state) => state.products.error
export const selectProductsFilters = (state) => state.products.filters

// Memoized selectors for filtered products - ĐÃ SỬA LỖI
export const selectFilteredProducts = createSelector(
  [selectAllProducts, selectProductsFilters],
  (products, filters) => {
    let filtered = [...products]
    
    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      )
    }
    
    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category)
    }
    
    // Apply sorting - SỬ DỤNG HÀM sortProducts ĐÃ IMPORT
    return sortProducts(filtered, filters.sortType)
  }
)