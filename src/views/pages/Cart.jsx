import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchProducts } from '../../controllers/productSlice'
import { removeFromCart, updateCartItem, clearCart } from '../../controllers/cartSlice'
import { formatCurrency } from '../../models/productModel'
import { showSuccessToast } from '../../services/notificationService'

function Cart() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cartItems = useSelector(state => state.cart.items)
  const { items: products } = useSelector(state => state.products)

  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProducts())
    }
  }, [dispatch, products?.length])

  // Get cart items with full product info
  const cartWithProducts = cartItems.map(cartItem => {
    const product = products?.find(p => p.id === cartItem.id)
    return product ? { ...product, qty: cartItem.qty } : null
  }).filter(Boolean)

  const handleUpdateQuantity = (productId, newQuantity) => {
    dispatch(updateCartItem({ productId, quantity: newQuantity }))
  }

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId))
    showSuccessToast('Đã xóa khỏi giỏ hàng')
  }

  const handleClearCart = () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
      dispatch(clearCart())
      showSuccessToast('Đã xóa toàn bộ giỏ hàng')
    }
  }

  // Calculate totals
  const subtotal = cartWithProducts.reduce((sum, item) => sum + (item.price * item.qty), 0)
  const shipping = subtotal > 500000 ? 0 : 30000
  const discount = 0 // Could add discount logic here
  const total = subtotal + shipping - discount

  if (cartItems.length === 0) {
    return (
      <div className="py-20 text-center">
        <svg className="w-24 h-24 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Giỏ hàng trống</h2>
        <p className="text-slate-600 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
        <button
          onClick={() => navigate('/shop')}
          className="btn btn-primary"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Giỏ hàng ({cartItems.length})
          </h1>
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Xóa tất cả
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartWithProducts.map((item) => (
              <div key={item.id} className="card">
                <div className="p-4 flex gap-4">
                  {/* Image */}
                  <div
                    className="w-24 h-24 bg-slate-100 rounded-md overflow-hidden flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/product/${item.id}`)}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-semibold text-slate-900 mb-1 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      {item.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-2">{item.category}</p>
                    
                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(item.price)}
                      </span>
                      {item.original_price && (
                        <span className="text-sm text-slate-400 line-through">
                          {formatCurrency(item.original_price)}
                        </span>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.qty - 1)}
                          className="w-8 h-8 border border-slate-300 rounded hover:border-slate-400 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium">{item.qty}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.qty + 1)}
                          className="w-8 h-8 border border-slate-300 rounded hover:border-slate-400 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">
                      {formatCurrency(item.price * item.qty)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <div className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Tóm tắt đơn hàng
                </h2>

                <div className="space-y-3 mb-4 pb-4 border-b border-slate-200">
                  <div className="flex justify-between text-slate-600">
                    <span>Tạm tính</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Phí vận chuyển</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600 font-medium">Miễn phí</span>
                      ) : (
                        formatCurrency(shipping)
                      )}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-lg font-bold text-slate-900 mb-4">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>

                {shipping > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-blue-800">
                      💡 Mua thêm {formatCurrency(500000 - subtotal)} để được miễn phí vận chuyển
                    </p>
                  </div>
                )}

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full btn btn-primary py-3 mb-3"
                >
                  Tiến hành thanh toán
                </button>

                <button
                  onClick={() => navigate('/shop')}
                  className="w-full btn btn-outline py-3"
                >
                  Tiếp tục mua sắm
                </button>

                {/* Payment Methods */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <p className="text-xs text-slate-600 mb-3">Phương thức thanh toán</p>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 border border-slate-300 rounded text-xs font-semibold">
                      VISA
                    </div>
                    <div className="px-2 py-1 border border-slate-300 rounded text-xs font-semibold">
                      MasterCard
                    </div>
                    <div className="px-2 py-1 border border-slate-300 rounded text-xs font-semibold">
                      MOMO
                    </div>
                    <div className="px-2 py-1 border border-slate-300 rounded text-xs font-semibold">
                      COD
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Giao dịch an toàn và bảo mật</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
