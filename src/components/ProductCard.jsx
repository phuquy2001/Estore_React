import { memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency, calculateSalePercent } from '../models/productModel'

/**
 * Optimized Product Card Component
 * - Uses React.memo to prevent unnecessary re-renders
 * - Only re-renders when product data changes
 */
const ProductCard = memo(({ product }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/product/${product.id}`)
  }

  const salePercent = product.original_price 
    ? calculateSalePercent(product.price, product.original_price)
    : null

  return (
    <div
      className="card group hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy" // Native lazy loading
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badge */}
        {product.badge && (
          <span className={`badge badge-${product.badge.toLowerCase()}`}>
            {product.badge}
          </span>
        )}

        {/* Sale Percent */}
        {salePercent && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{salePercent}%
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 min-h-[3rem]">
          {product.name}
        </h3>
        
        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-primary">
            {formatCurrency(product.price)}
          </span>
          {product.original_price && (
            <span className="text-sm text-slate-400 line-through">
              {formatCurrency(product.original_price)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function
  // Only re-render if product id or price changes
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.price === nextProps.product.price &&
         prevProps.product.name === nextProps.product.name
})

ProductCard.displayName = 'ProductCard'

export default ProductCard
