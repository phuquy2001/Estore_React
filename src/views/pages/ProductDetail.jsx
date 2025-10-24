import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProducts } from '../../controllers/productSlice'
import { addToCart } from '../../controllers/cartSlice'
import { formatCurrency, calculateSalePercent } from '../../models/productModel'
import { showSuccessToast, showErrorToast } from '../../services/notificationService'
import { reviewsAPI } from '../../services/apiService'
import StarRating from '../../components/StarRating'
import ReviewForm from '../../components/ReviewForm'
import ReviewList from '../../components/ReviewList'

function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items: products, loading } = useSelector(state => state.products)
  
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState('M')
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  useEffect(() => {
    if (!products || products.length === 0) {
      dispatch(fetchProducts())
    }
  }, [dispatch, products?.length])

  useEffect(() => {
    if (id) {
      loadReviews()
    }
  }, [id])

  const product = products?.find(p => p.id === id)

  const loadReviews = async () => {
    try {
      setLoadingReviews(true)
      const response = await reviewsAPI.getByProduct(id)
      setReviews(response.data)
    } catch (error) {
      console.error('Failed to load reviews:', error)
    } finally {
      setLoadingReviews(false)
    }
  }

  const handleAddToCart = () => {
    if (quantity < 1) {
      showErrorToast('Số lượng không hợp lệ')
      return
    }
    dispatch(addToCart({ productId: product.id, quantity }))
    showSuccessToast(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`)
  }

  const handleBuyNow = () => {
    dispatch(addToCart({ productId: product.id, quantity }))
    navigate('/cart')
  }

  const relatedProducts = (products || [])
    .filter(p => p.id !== id && p.category === product?.category)
    .slice(0, 4)

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-600">Đang tải sản phẩm...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Không tìm thấy sản phẩm</h2>
        <button onClick={() => navigate('/shop')} className="btn btn-primary">
          Quay lại cửa hàng
        </button>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-primary">
            Trang chủ
          </button>
          <span>/</span>
          <button onClick={() => navigate('/shop')} className="hover:text-primary">
            Cửa hàng
          </button>
          <span>/</span>
          <span className="text-slate-900">{product.name}</span>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Image */}
          <div className="relative aspect-square bg-slate-100 rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <span className={`badge badge-${product.badge.toLowerCase()}`}>
                {product.badge}
              </span>
            )}
          </div>

          {/* Info */}
          <div>
            <span className="text-sm font-medium text-primary uppercase tracking-wide">
              {product.category}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-slate-300'
                    } fill-current`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
                <span className="ml-2 text-sm font-medium">{product.rating}</span>
              </div>
              <span className="text-sm text-slate-600">
                ({product.reviews} đánh giá)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(product.price)}
              </span>
              {product.original_price && (
                <>
                  <span className="text-xl text-slate-400 line-through">
                    {formatCurrency(product.original_price)}
                  </span>
                  <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded">
                    Giảm {calculateSalePercent(product)}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-slate-600 leading-relaxed">
                Sản phẩm chất lượng cao, được thiết kế theo phong cách hiện đại và trẻ trung. 
                Chất liệu mềm mại, thoải mái, phù hợp cho nhiều dịp khác nhau. 
                Dễ dàng phối hợp với nhiều trang phục khác nhau.
              </p>
            </div>

            <div className="border-t border-slate-200 pt-6 mb-6">
              {/* Size Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Kích thước
                </label>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-2 border-2 rounded-md font-medium transition-all ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-white'
                          : 'border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Số lượng
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border-2 border-slate-300 rounded-md hover:border-slate-400 transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center input"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border-2 border-slate-300 rounded-md hover:border-slate-400 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 btn btn-outline py-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Thêm vào giỏ
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 btn btn-primary py-3"
                >
                  Mua ngay
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="bg-slate-50 rounded-lg p-4 space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Miễn phí vận chuyển cho đơn hàng trên 500.000đ</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Đảm bảo chất lượng, hàng chính hãng 100%</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Đổi trả miễn phí trong vòng 7 ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Đánh giá sản phẩm
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Review Form */}
            <div className="lg:col-span-1">
              <ReviewForm 
                productId={id} 
                onReviewSubmitted={loadReviews}
              />
            </div>

            {/* Reviews List */}
            <div className="lg:col-span-2">
              {loadingReviews ? (
                <div className="card p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                  <p className="text-slate-600">Đang tải đánh giá...</p>
                </div>
              ) : (
                <ReviewList 
                  reviews={reviews} 
                  onReviewDeleted={loadReviews}
                />
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Sản phẩm tương tự
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="card group hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-100">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {relatedProduct.badge && (
                      <span className={`badge badge-${relatedProduct.badge.toLowerCase()}`}>
                        {relatedProduct.badge}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">
                        {formatCurrency(relatedProduct.price)}
                      </span>
                      {relatedProduct.original_price && (
                        <span className="text-sm text-slate-400 line-through">
                          {formatCurrency(relatedProduct.original_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail
