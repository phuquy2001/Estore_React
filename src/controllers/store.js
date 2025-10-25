import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './cartSlice'
import productReducer from './productSlice'

const store = configureStore({
  reducer: {
    cart: cartReducer,
    products: productReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'] // Nếu sử dụng Redux Persist
      }
    }).concat(/* your middleware */),
  devTools: process.env.NODE_ENV !== 'production'
})

export default store
