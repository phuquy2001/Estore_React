import { useEffect, useState, useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchProducts } from '../../controllers/productSlice'
import { addToCart } from '../../controllers/cartSlice'
import { formatCurrency, calculateSalePercent, getCategories, filterByCategory, searchProducts, sortProducts } from '../../models/productModel'
import { showSuccessToast } from '../../services/notificationService'
import ProductCard from '../../components/ProductCard'

function Shop() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items: products, loading } = useSelector(state => state.products)

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortType, setSortType] = useState('default')

  useEffect(() => {
    dispatch(fetchProducts())
  }, [dispatch])

  // Memoized callback for add to cart
  const handleAddToCart = useCallback((productId) => {
    dispatch(addToCart({ productId, quantity: 1 }))
    showSuccessToast('Đã thêm vào giỏ hàng!')
  }, [dispatch])

  // Memoized categories list - only recalculate when products change
  const categories = useMemo(() => {
    return ['all', ...getCategories(products || [])]
  }, [products])

  // Memoized filtered products - only recalculate when dependencies change
  const filteredProducts = useMemo(() => {
    let result = [...(products || [])]

    // Search
    if (searchQuery.trim()) {
      result = searchProducts(result, searchQuery)
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = filterByCategory(result, selectedCategory)
    }

    // Sort
    result = sortProducts(result, sortType)

    return result
  }, [products, searchQuery, selectedCategory, sortType])

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Cửa hàng</h1>
          <p className="text-slate-600">
            Khám phá {products?.length || 0} sản phẩm trong bộ sưu tập của chúng tôi
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-default p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên sản phẩm..."
                className="input"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Danh mục
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Tất cả' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sắp xếp
              </label>
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
                className="input"
              >
                <option value="default">Mặc định</option>
                <option value="popular">Phổ biến nhất</option>
                <option value="new">Mới nhất</option>
                <option value="sale">Đang giảm giá</option>
              </select>
            </div>
          </div>

          {/* Active filters info */}
          {(searchQuery || selectedCategory !== 'all' || sortType !== 'default') && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Tìm thấy <span className="font-semibold">{filteredProducts.length}</span> sản phẩm
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                    setSortType('default')
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-600">Đang tải sản phẩm...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-slate-600 mb-4">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setSortType('default')
              }}
              className="btn btn-primary"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Shop
