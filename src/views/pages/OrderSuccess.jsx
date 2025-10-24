import { useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { formatCurrency } from '../../models/productModel'

function OrderSuccess() {
  const location = useLocation()
  const navigate = useNavigate()
  const order = location.state?.order

  useEffect(() => {
    // If no order data, redirect to home
    if (!order) {
      navigate('/', { replace: true })
    }
  }, [order, navigate])

  if (!order) {
    return null
  }

  const { shippingAddress } = order

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Đặt hàng thành công!
            </h1>
            <p className="text-slate-600">
              Cảm ơn bạn đã mua hàng. Chúng tôi sẽ xử lý đơn hàng của bạn sớm nhất.
            </p>
          </div>

          {/* Order Info Card */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-6 pb-6 border-b">
              <div>
                <div className="text-sm text-slate-600 mb-1">Mã đơn hàng</div>
                <div className="text-2xl font-bold text-primary">
                  #{order.id}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-600 mb-1">Ngày đặt</div>
                <div className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-bold mb-4">Sản phẩm đã đặt</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-slate-600">
                        Size: {item.size} | Số lượng: {item.quantity}
                      </div>
                      <div className="font-semibold text-primary mt-1">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-bold mb-3">Địa chỉ giao hàng</h3>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="font-medium mb-1">{shippingAddress.fullName}</div>
                <div className="text-sm text-slate-600 space-y-1">
                  <div>📞 {shippingAddress.phone}</div>
                  <div>📧 {shippingAddress.email}</div>
                  <div>
                    📍 {shippingAddress.address}, {shippingAddress.district},{' '}
                    {shippingAddress.city}
                  </div>
                  {shippingAddress.notes && (
                    <div className="mt-2 italic">
                      Ghi chú: {shippingAddress.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-bold mb-3">Thông tin thanh toán</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {order.paymentMethod === 'cod' && 'Thanh toán khi nhận hàng (COD)'}
                    {order.paymentMethod === 'vnpay' && 'VNPay'}
                    {order.paymentMethod === 'momo' && 'Momo'}
                  </div>
                  <div className="text-sm text-slate-600">
                    Trạng thái:{' '}
                    <span className="text-orange-600 font-medium">
                      {order.paymentStatus === 'pending' && 'Chờ thanh toán'}
                      {order.paymentStatus === 'paid' && 'Đã thanh toán'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Total */}
            <div className="space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển</span>
                <span>
                  {order.shipping === 0
                    ? 'Miễn phí'
                    : formatCurrency(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-3">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="card p-6 mb-6">
            <h3 className="font-bold mb-4">Trạng thái đơn hàng</h3>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
              
              <div className="relative flex items-start mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white z-10">
                  ✓
                </div>
                <div className="ml-4">
                  <div className="font-medium">Đơn hàng đã được đặt</div>
                  <div className="text-sm text-slate-600">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>

              <div className="relative flex items-start mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-300 text-white z-10">
                  2
                </div>
                <div className="ml-4">
                  <div className="font-medium text-slate-400">Đang xác nhận</div>
                  <div className="text-sm text-slate-400">Chờ xác nhận từ shop</div>
                </div>
              </div>

              <div className="relative flex items-start mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-300 text-white z-10">
                  3
                </div>
                <div className="ml-4">
                  <div className="font-medium text-slate-400">Đang giao hàng</div>
                  <div className="text-sm text-slate-400">Đơn hàng đang được vận chuyển</div>
                </div>
              </div>

              <div className="relative flex items-start">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-300 text-white z-10">
                  4
                </div>
                <div className="ml-4">
                  <div className="font-medium text-slate-400">Đã giao hàng</div>
                  <div className="text-sm text-slate-400">Giao hàng thành công</div>
                </div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="card p-6 mb-6 bg-blue-50 border-blue-200">
            <h3 className="font-bold mb-3 flex items-center">
              <span className="mr-2">💡</span>
              Tiếp theo sẽ ra sao?
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>Chúng tôi sẽ xác nhận đơn hàng của bạn trong vòng 24 giờ</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>Đơn hàng sẽ được đóng gói và giao cho đơn vị vận chuyển</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>Bạn sẽ nhận được thông báo khi đơn hàng đang được giao</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">4.</span>
                <span>Thời gian giao hàng dự kiến: 2-3 ngày làm việc</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/" className="flex-1 btn btn-outline text-center py-3">
              Về trang chủ
            </Link>
            <Link to="/shop" className="flex-1 btn btn-primary text-center py-3">
              Tiếp tục mua sắm
            </Link>
          </div>

          {/* Contact Support */}
          <div className="text-center mt-8 text-sm text-slate-600">
            Cần hỗ trợ?{' '}
            <a href="tel:0123456789" className="text-primary hover:underline">
              Liên hệ: 0123-456-789
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess
