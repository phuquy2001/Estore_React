import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ordersAPI } from '../../services/apiService'
import { formatCurrency } from '../../models/productModel'
import { showErrorToast, showSuccessToast } from '../../services/notificationService'

function OrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const response = await ordersAPI.getById(orderId)
      setOrder(response.data)
    } catch (error) {
      console.error('Failed to load order:', error)
      showErrorToast('Không thể tải thông tin đơn hàng')
      navigate('/profile')
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: {
        label: 'Chờ xác nhận',
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        icon: '⏳',
        description: 'Đơn hàng đang chờ shop xác nhận'
      },
      confirmed: {
        label: 'Đã xác nhận',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        icon: '✓',
        description: 'Đơn hàng đã được xác nhận, đang chuẩn bị'
      },
      shipping: {
        label: 'Đang giao hàng',
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        icon: '🚚',
        description: 'Đơn hàng đang được vận chuyển'
      },
      completed: {
        label: 'Đã hoàn thành',
        color: 'text-green-600 bg-green-50 border-green-200',
        icon: '✅',
        description: 'Đơn hàng đã được giao thành công'
      },
      cancelled: {
        label: 'Đã hủy',
        color: 'text-red-600 bg-red-50 border-red-200',
        icon: '❌',
        description: 'Đơn hàng đã bị hủy'
      }
    }
    return statusMap[status] || statusMap.pending
  }

  const getTimeline = (currentStatus) => {
    const steps = [
      { key: 'pending', label: 'Đặt hàng', icon: '📝' },
      { key: 'confirmed', label: 'Xác nhận', icon: '✓' },
      { key: 'shipping', label: 'Vận chuyển', icon: '🚚' },
      { key: 'completed', label: 'Hoàn thành', icon: '✅' }
    ]

    const statusOrder = ['pending', 'confirmed', 'shipping', 'completed']
    const currentIndex = statusOrder.indexOf(currentStatus)

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return null
  }

  const statusInfo = getStatusInfo(order.status)
  const timeline = getTimeline(order.status)

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/profile')}
            className="mb-6 text-slate-600 hover:text-slate-900 flex items-center gap-2"
          >
            ← Quay lại
          </button>

          {/* Order Header */}
          <div className="card p-6 mb-6">
            <div className="flex flex-wrap items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Đơn hàng #{order.id}
                </h1>
                <p className="text-sm text-slate-600">
                  Đặt ngày:{' '}
                  {new Date(order.createdAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-lg border-2 ${statusInfo.color}`}>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{statusInfo.icon}</span>
                  <div>
                    <div className="font-bold">{statusInfo.label}</div>
                    <div className="text-xs">{statusInfo.description}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          {order.status !== 'cancelled' && (
            <div className="card p-6 mb-6">
              <h2 className="font-bold mb-6">Trạng thái đơn hàng</h2>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-slate-200"></div>
                <div
                  className="absolute left-6 top-4 w-0.5 bg-primary transition-all duration-500"
                  style={{
                    height: `${(timeline.findIndex(s => s.active) / (timeline.length - 1)) * 100}%`
                  }}
                ></div>

                {/* Steps */}
                <div className="space-y-6 relative">
                  {timeline.map((step, index) => (
                    <div key={step.key} className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl z-10 transition-all ${
                          step.completed
                            ? 'bg-primary text-white'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {step.icon}
                      </div>
                      <div className="flex-1 pt-2">
                        <div
                          className={`font-medium ${
                            step.completed ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </div>
                        {step.active && (
                          <div className="text-sm text-slate-600 mt-1">
                            {new Date(order.updatedAt).toLocaleString('vi-VN')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          <div className="card p-6 mb-6">
            <h2 className="font-bold mb-4">Sản phẩm ({order.items.length})</h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-slate-900">{item.name}</div>
                    <div className="text-sm text-slate-600 mt-1">
                      Size: {item.size} | Số lượng: {item.quantity}
                    </div>
                    <div className="font-semibold text-primary mt-2">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Shipping Address */}
            <div className="card p-6">
              <h2 className="font-bold mb-4">Địa chỉ giao hàng</h2>
              <div className="space-y-2 text-sm">
                <div className="font-medium text-slate-900">
                  {order.shippingAddress.fullName}
                </div>
                <div className="text-slate-600">📞 {order.shippingAddress.phone}</div>
                <div className="text-slate-600">📧 {order.shippingAddress.email}</div>
                <div className="text-slate-600">
                  📍 {order.shippingAddress.address}, {order.shippingAddress.district},{' '}
                  {order.shippingAddress.city}
                </div>
                {order.shippingAddress.notes && (
                  <div className="text-slate-600 italic mt-2">
                    Ghi chú: {order.shippingAddress.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="card p-6">
              <h2 className="font-bold mb-4">Thanh toán</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Phương thức:</span>
                  <span className="font-medium">
                    {order.paymentMethod === 'cod' && 'Thanh toán khi nhận hàng'}
                    {order.paymentMethod === 'vnpay' && 'VNPay'}
                    {order.paymentMethod === 'momo' && 'Momo'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Trạng thái:</span>
                  <span
                    className={`font-medium ${
                      order.paymentStatus === 'paid'
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`}
                  >
                    {order.paymentStatus === 'pending' && 'Chờ thanh toán'}
                    {order.paymentStatus === 'paid' && 'Đã thanh toán'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="card p-6">
            <h2 className="font-bold mb-4">Tổng đơn hàng</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển</span>
                <span>
                  {order.shipping === 0 ? 'Miễn phí' : formatCurrency(order.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-3">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-4">
            {order.status === 'pending' && (
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
                    showErrorToast('Chức năng đang phát triển')
                  }
                }}
                className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50"
              >
                Hủy đơn hàng
              </button>
            )}
            {order.status === 'completed' && (
              <>
                <button className="btn btn-primary">Mua lại</button>
                <button className="btn btn-outline">Đánh giá</button>
              </>
            )}
            <Link to="/profile" className="btn btn-outline ml-auto">
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
