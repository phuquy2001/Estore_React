// src/views/pages/Shop.js - Updated version
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  fetchProducts, 
  setFilters, 
  selectFilteredProducts, 
  selectProductsLoading,
  selectProductsFilters 
} from '../../controllers/productSlice'
import { showErrorToast } from '../../services/notificationService'

function Shop() {
  const dispatch = useDispatch()
  const products = useSelector(selectFilteredProducts)
  const loading = useSelector(selectProductsLoading)
  const filters = useSelector(selectProductsFilters)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        await dispatch(fetchProducts()).unwrap()
      } catch (error) {
        showErrorToast('Không thể tải sản phẩm: ' + error)
      }
    }
    
    loadProducts()
  }, [dispatch])

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters))
  }

  // Filtered products are now computed by Redux selector
  // No need for useMemo in component

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Filters Section - Same as before but use handleFilterChange */}
        <div className="bg-white rounded-lg shadow-default p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
                placeholder="Nhập tên sản phẩm..."
                className="input"
              />
            </div>

            {/* Category and Sort filters... */}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-600">Đang tải sản phẩm từ Firebase...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Shop