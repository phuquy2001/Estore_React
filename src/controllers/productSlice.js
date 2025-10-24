import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loadProducts } from '../models/productModel'

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async () => {
    return await loadProducts()
  }
)

const initialState = {
  items: [],
  loading: false,
  error: null,
  selectedProduct: null
}

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
        state.items = []
      })
  }
})

export const { setSelectedProduct, clearSelectedProduct } = productSlice.actions
export default productSlice.reducer
