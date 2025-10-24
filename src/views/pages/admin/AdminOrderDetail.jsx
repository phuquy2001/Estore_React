import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ordersAPI, usersAPI } from '../../../services/apiService'
import { formatCurrency } from '../../../models/productModel'
import { showErrorToast, showSuccessToast } from '../../../services/notificationService'

function AdminOrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const orderResponse = await ordersAPI.getById(orderId)
      setOrder(orderResponse.data)
      
      // Load customer info if userId exists
      if (orderResponse.data.userId && orderResponse.data.userId !== 'guest') {
        try {
          const userResponse = await usersAPI.getById(orderResponse.data.userId)
          setCustomer(userResponse.data)
        } catch (err) {
          console.log('Customer not found or guest order')
        }
      }
    } catch (error) {
      console.error('Failed to load order:', error)
      showErrorToast('Không thể tải thông tin đơn hàng')
      navigate('/admin/orders')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus)
      showSuccessToast('Cập nhật trạng thái thành công')
      loadOrder()
    } catch (error) {
      showErrorToast('Cập nhật trạng thái thất bại')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!order) return null

  const statusOptions = [
    { value: 'pending', label: 'Chờ xác nhận', color: 'yellow' },
    { value: 'confirmed', label: 'Đã xác nhận', color: 'blue' },
    { value: 'shipping', label: 'Đang giao', color: 'purple' },
    { value: 'completed', label: 'Hoàn thành', color: 'green' },
    { value: 'cancelled', label: 'Đã hủy', color: 'red' }
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-slate-600 hover:text-slate-900 mb-2 flex items-center gap-2"
          >
            ← Quay lại danh sách
          </button>
          <h2 className="text-2xl font-bold">Chi tiết đơn hàng #{order.id}</h2>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-600">Ngày đặt</div>
          <div className="font-medium">
            {new Date(order.createdAt).toLocaleString('vi-VN')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <div className="card p-6">
            <h3 className="font-bold mb-4">Sản phẩm ({order.items.length})</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-slate-600 mt-1">
                      Size: {item.size} | SL: {item.quantity}
                    </div>
                    <div className="text-sm text-slate-600">
                      Đơn giá: {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-primary">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="mt-6 pt-6 border-t space-y-2">
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

          {/* Shipping Info */}
          <div className="card p-6">
            <h3 className="font-bold mb-4">Thông tin giao hàng</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-slate-600">Người nhận</div>
                <div className="font-medium">{order.shippingAddress.fullName}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Số điện thoại</div>
                <div className="font-medium">{order.shippingAddress.phone}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Email</div>
                <div className="font-medium">{order.shippingAddress.email}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Địa chỉ</div>
                <div className="font-medium">
                  {order.shippingAddress.address}, {order.shippingAddress.district},{' '}
                  {order.shippingAddress.city}
                </div>
              </div>
              {order.shippingAddress.notes && (
                <div>
                  <div className="text-sm text-slate-600">Ghi chú</div>
                  <div className="font-medium italic">{order.shippingAddress.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status Update */}
          <div className="card p-6">
            <h3 className="font-bold mb-4">Trạng thái đơn hàng</h3>
            <div className="space-y-3">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    if (option.value !== order.status) {
                      if (window.confirm(`Cập nhật trạng thái thành "${option.label}"?`)) {
                        handleUpdateStatus(option.value)
                      }
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                    order.status === option.value
                      ? `bg-${option.color}-100 border-2 border-${option.color}-500 text-${option.color}-800 font-semibold`
                      : 'bg-white border-2 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {order.status === option.value && <span>✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Info */}
          <div className="card p-6">
            <h3 className="font-bold mb-4">Thanh toán</h3>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-slate-600">Phương thức</div>
                <div className="font-medium">
                  {order.paymentMethod === 'cod' && 'Thanh toán khi nhận hàng'}
                  {order.paymentMethod === 'vnpay' && 'VNPay'}
                  {order.paymentMethod === 'momo' && 'Momo'}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Trạng thái thanh toán</div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {order.paymentStatus === 'pending' && 'Chờ thanh toán'}
                    {order.paymentStatus === 'paid' && 'Đã thanh toán'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          {customer && (
            <div className="card p-6">
              <h3 className="font-bold mb-4">Thông tin khách hàng</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-slate-600">Tên khách hàng</div>
                  <div className="font-medium">{customer.name}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Email</div>
                  <div className="font-medium">{customer.email}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Vai trò</div>
                  <div className="font-medium capitalize">{customer.role}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Ngày đăng ký</div>
                  <div className="font-medium">
                    {new Date(customer.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="card p-6">
            <h3 className="font-bold mb-4">Hành động</h3>
            <div className="space-y-2">
              <button
                onClick={() => window.print()}
                className="w-full btn btn-outline"
              >
                🖨️ In đơn hàng
              </button>
              <button
                onClick={() => showSuccessToast('Chức năng đang phát triển')}
                className="w-full btn btn-outline"
              >
                📧 Gửi email
              </button>
              {order.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    if (window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) {
                      handleUpdateStatus('cancelled')
                    }
                  }}
                  className="w-full btn btn-outline text-red-600 border-red-600 hover:bg-red-50"
                >
                  ❌ Hủy đơn hàng
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminOrderDetail
