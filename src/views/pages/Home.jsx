import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchProducts } from '../../controllers/productSlice'
import { addToCart } from '../../controllers/cartSlice'
import { formatCurrency, calculateSalePercent } from '../../models/productModel'
import { showSuccessToast } from '../../services/notificationService'

function Home() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items: products, loading } = useSelector(state => state.products)

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  const handleAddToCart = (productId) => {
    dispatch(addToCart({ productId, quantity: 1 }))
    showSuccessToast('Đã thêm vào giỏ hàng!')
  }

  const featuredProducts = (products || []).slice(0, 4)

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Winter Collection 2025
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Khám phá bộ sưu tập thời trang mùa đông mới nhất với phong cách hiện đại và chất liệu cao cấp.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/shop')}
                className="btn btn-primary px-8 py-3 text-lg"
              >
                Mua sắm ngay
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="btn btn-outline px-8 py-3 text-lg"
              >
                Xem bộ sưu tập
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Sản phẩm nổi bật
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Những sản phẩm được yêu thích nhất trong bộ sưu tập của chúng tôi
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4 text-slate-600">Đang tải sản phẩm...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div key={product.id} className="card group hover:shadow-xl transition-shadow duration-300">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.badge && (
                      <span className={`badge badge-${product.badge.toLowerCase()}`}>
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1">
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                        <span className="text-sm font-medium ml-1">{product.rating}</span>
                      </div>
                      <span className="text-xs text-slate-500">({product.reviews} đánh giá)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(product.price)}
                      </span>
                      {product.original_price && (
                        <>
                          <span className="text-sm text-slate-400 line-through">
                            {formatCurrency(product.original_price)}
                          </span>
                          <span className="text-xs font-semibold text-red-500">
                            -{calculateSalePercent(product)}%
                          </span>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="flex-1 btn btn-outline text-sm"
                      >
                        Chi tiết
                      </button>
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        className="flex-1 btn btn-primary text-sm"
                      >
                        Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/shop')}
              className="btn btn-primary px-8 py-3"
            >
              Xem tất cả sản phẩm
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Miễn phí vận chuyển</h3>
              <p className="text-slate-600">Cho đơn hàng trên 500.000đ</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Đảm bảo chất lượng</h3>
              <p className="text-slate-600">Cam kết hàng chính hãng 100%</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Đổi trả dễ dàng</h3>
              <p className="text-slate-600">Trong vòng 7 ngày miễn phí</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
