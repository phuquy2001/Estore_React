import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '../../contexts/AuthContext'
import { ordersAPI } from '../../services/apiService'
import { clearCart } from '../../controllers/cartSlice'
import { formatCurrency } from '../../models/productModel'
import { showSuccessToast, showErrorToast } from '../../services/notificationService'

function Checkout() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useAuth()
  const cartItems = useSelector(state => state.cart.items)
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    city: 'TP. Hồ Chí Minh',
    district: '',
    notes: '',
    paymentMethod: 'cod'
  })
  
  const [errors, setErrors] = useState({})

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0)
  const shipping = subtotal > 500000 ? 0 : 30000 // Free ship trên 500k
  const total = subtotal + shipping

  // Validation
  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ tên'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại'
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10 số)'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ giao hàng'
    }

    if (!formData.district.trim()) {
      newErrors.district = 'Vui lòng chọn quận/huyện'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      showErrorToast('Vui lòng kiểm tra lại thông tin')
      return
    }

    if (cartItems.length === 0) {
      showErrorToast('Giỏ hàng trống')
      return
    }

    setLoading(true)

    try {
      const orderData = {
        userId: user?.id || 'guest',
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          image: item.image,
          quantity: item.qty,
          size: item.size,
          price: item.price
        })),
        subtotal,
        shipping,
        total,
        status: 'pending',
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentMethod === 'cod' ? 'pending' : 'pending',
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          district: formData.district,
          city: formData.city,
          notes: formData.notes
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const response = await ordersAPI.create(orderData)
      
      // Clear cart
      dispatch(clearCart())
      
      showSuccessToast('Đặt hàng thành công!')
      
      // Navigate to success page with order info
      navigate('/order-success', { 
        state: { order: response.data },
        replace: true 
      })
      
    } catch (error) {
      console.error('Order error:', error)
      showErrorToast('Đặt hàng thất bại. Vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-4">Giỏ hàng trống</h2>
          <p className="text-slate-600 mb-6">
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="btn btn-primary"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="card p-6">
                <h2 className="text-xl font-bold mb-4">Thông tin liên hệ</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`input ${errors.fullName ? 'border-red-500' : ''}`}
                      placeholder="Nguyễn Văn A"
                    />
                    {errors.fullName && (
                      <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Số điện thoại *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`input ${errors.phone ? 'border-red-500' : ''}`}
                        placeholder="0987654321"
                      />
                      {errors.phone && (
                        <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`input ${errors.email ? 'border-red-500' : ''}`}
                        placeholder="email@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="card p-6">
                <h2 className="text-xl font-bold mb-4">Địa chỉ giao hàng</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Địa chỉ *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`input ${errors.address ? 'border-red-500' : ''}`}
                      placeholder="Số nhà, tên đường"
                    />
                    {errors.address && (
                      <p className="text-red-600 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Quận/Huyện *
                      </label>
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className={`input ${errors.district ? 'border-red-500' : ''}`}
                      >
                        <option value="">Chọn quận/huyện</option>
                        <option value="Quận 1">Quận 1</option>
                        <option value="Quận 2">Quận 2</option>
                        <option value="Quận 3">Quận 3</option>
                        <option value="Quận 4">Quận 4</option>
                        <option value="Quận 5">Quận 5</option>
                        <option value="Quận 6">Quận 6</option>
                        <option value="Quận 7">Quận 7</option>
                        <option value="Quận 8">Quận 8</option>
                        <option value="Quận 10">Quận 10</option>
                        <option value="Quận 11">Quận 11</option>
                        <option value="Quận 12">Quận 12</option>
                        <option value="Bình Thạnh">Bình Thạnh</option>
                        <option value="Tân Bình">Tân Bình</option>
                        <option value="Tân Phú">Tân Phú</option>
                        <option value="Phú Nhuận">Phú Nhuận</option>
                        <option value="Gò Vấp">Gò Vấp</option>
                        <option value="Thủ Đức">Thủ Đức</option>
                      </select>
                      {errors.district && (
                        <p className="text-red-600 text-sm mt-1">{errors.district}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tỉnh/Thành phố *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="input bg-slate-100"
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ghi chú (Tùy chọn)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      className="input"
                      rows="3"
                      placeholder="Ghi chú về đơn hàng, ví dụ: Giao giờ hành chính"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="card p-6">
                <h2 className="text-xl font-bold mb-4">Phương thức thanh toán</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
                      <div className="text-sm text-slate-600">
                        Thanh toán bằng tiền mặt khi nhận hàng
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-slate-50 opacity-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="vnpay"
                      disabled
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">VNPay</div>
                      <div className="text-sm text-slate-600">
                        Thanh toán qua VNPay (Đang phát triển)
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-slate-50 opacity-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="momo"
                      disabled
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Momo</div>
                      <div className="text-sm text-slate-600">
                        Thanh toán qua Momo (Đang phát triển)
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Tóm tắt đơn hàng</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-sm text-slate-600">
                        Size: {item.size} | SL: {item.qty}
                      </div>
                      <div className="text-sm font-semibold text-primary">
                        {formatCurrency(item.price * item.qty)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phí vận chuyển</span>
                  <span>{shipping === 0 ? 'Miễn phí' : formatCurrency(shipping)}</span>
                </div>
                {shipping === 0 && (
                  <div className="text-sm text-green-600">
                    🎉 Bạn được miễn phí vận chuyển!
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full btn btn-primary mt-6 py-3"
              >
                {loading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>

              <p className="text-xs text-slate-500 text-center mt-4">
                Bằng cách đặt hàng, bạn đồng ý với{' '}
                <a href="#" className="text-primary hover:underline">
                  Điều khoản sử dụng
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
