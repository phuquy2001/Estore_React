import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  loading: false,
  error: null
}

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('cart_v1')
    return saved ? JSON.parse(saved) : []
  } catch (error) {
    console.error('Failed to load cart from storage', error)
    return []
  }
}

// Debounced save function
let saveTimeout = null
const saveCartToStorage = (items) => {
  if (saveTimeout) {
    clearTimeout(saveTimeout)
  }
  saveTimeout = setTimeout(() => {
    try {
      localStorage.setItem('cart_v1', JSON.stringify(items))
    } catch (error) {
      console.error('Failed to save cart to storage', error)
    }
  }, 500) // Wait 500ms after last change
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    ...initialState,
    items: loadCartFromStorage()
  },
  reducers: {
    addToCart: (state, action) => {
      const { productId, quantity = 1 } = action.payload
      const existingItem = state.items.find(item => item.id === productId)
      
      if (existingItem) {
        existingItem.qty += quantity
      } else {
        state.items.push({ id: productId, qty: quantity })
      }
      
      saveCartToStorage(state.items)
    },
    
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload)
      saveCartToStorage(state.items)
    },
    
    updateCartItem: (state, action) => {
      const { productId, quantity } = action.payload
      const item = state.items.find(item => item.id === productId)
      
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(item => item.id !== productId)
        } else {
          item.qty = quantity
        }
      }
      
      saveCartToStorage(state.items)
    },
    
    clearCart: (state) => {
      state.items = []
      saveCartToStorage(state.items)
    }
  }
})

export const { addToCart, removeFromCart, updateCartItem, clearCart } = cartSlice.actions
export default cartSlice.reducer