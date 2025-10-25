import { useState, useEffect } from 'react'
import { showSuccessToast, showErrorToast } from '../../services/notificationService'
import ImageUploader from './ImageUploader'
import SizeSelector from './SizeSelector'

function ProductForm({ product, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Top',
    price: '',
    original_price: '',
    description: '',
    image: '',
    badge: '',
    stock: '',
    sizes: ['S', 'M', 'L'],
    rating: 4.5,
    reviews: 0
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [, setImagePreview] = useState('')

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || 'Top',
        price: product.price || '',
        original_price: product.original_price || '',
        description: product.description || '',
        image: product.image || '',
        badge: product.badge || '',
        stock: product.stock || '',
        sizes: product.sizes || ['S', 'M', 'L'],
        rating: product.rating || 4.5,
        reviews: product.reviews || 0
      })
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSizesChange = (newSizes) => {
    setFormData(prev => ({ ...prev, sizes: newSizes }))
    if (errors.sizes) {
      setErrors(prev => ({ ...prev, sizes: '' }))
    }
  }

  const handleImageChange = (imageUrl) => {
    setFormData(prev => ({ ...prev, image: imageUrl }))
    setImagePreview(imageUrl)
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Tên sản phẩm là bắt buộc'
    if (!formData.price || formData.price <= 0) newErrors.price = 'Giá phải lớn hơn 0'
    if (formData.original_price && formData.original_price <= formData.price) {
      newErrors.original_price = 'Giá gốc phải lớn hơn giá bán'
    }
    if (!formData.image.trim()) newErrors.image = 'Link hình ảnh là bắt buộc'
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Số lượng phải >= 0'
    if (formData.sizes.length === 0) newErrors.sizes = 'Chọn ít nhất 1 size'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      showErrorToast('Vui lòng kiểm tra lại thông tin')
      return
    }
    setLoading(true)
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        stock: parseInt(formData.stock),
        currency: 'VND'
      }
      await onSave(productData)
      showSuccessToast(product ? 'Cập nhật thành công!' : 'Thêm sản phẩm thành công!')
    } catch (error) {
      showErrorToast('Có lỗi xảy ra: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['Top', 'Bottom', 'Dress', 'Outerwear', 'Accessories']
  const badges = ['', 'New', 'Hot', 'Sale']

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tên sản phẩm *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`input ${errors.name ? 'border-red-500' : ''}`}
          placeholder="Áo thun basic..."
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Category & Badge */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Danh mục *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Badge
          </label>
          <select
            name="badge"
            value={formData.badge}
            onChange={handleChange}
            className="input"
          >
            {badges.map(badge => (
              <option key={badge || 'none'} value={badge}>
                {badge || 'Không có'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Price & Original Price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Giá bán (VNĐ) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={`input ${errors.price ? 'border-red-500' : ''}`}
            placeholder="299000"
            min="0"
          />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Giá gốc (VNĐ)
          </label>
          <input
            type="number"
            name="original_price"
            value={formData.original_price}
            onChange={handleChange}
            className={`input ${errors.original_price ? 'border-red-500' : ''}`}
            placeholder="399000"
            min="0"
          />
          {errors.original_price && <p className="text-red-500 text-xs mt-1">{errors.original_price}</p>}
        </div>
      </div>

      {/* Stock */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Số lượng tồn kho *
        </label>
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          className={`input ${errors.stock ? 'border-red-500' : ''}`}
          placeholder="100"
          min="0"
        />
        {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
      </div>

      {/* Sizes */}
      <SizeSelector
        sizes={formData.sizes}
        selectedSizes={formData.sizes}
        onChange={handleSizesChange}
        error={errors.sizes}
      />

      {/* Image Upload */}
      <ImageUploader
        value={formData.image}
        onChange={handleImageChange}
        error={errors.image}
      />

      {/* Image Preview */}
      {formData.image && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            👁️ Xem trước:
          </label>
          <img
            src={formData.image}
            alt="Product preview"
            className="w-48 h-48 object-cover rounded-lg border-2 border-slate-200"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/200x200?text=Invalid+Image'
            }}
          />
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Mô tả
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="input"
          rows="3"
          placeholder="Mô tả sản phẩm..."
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
          disabled={loading}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? '⏳ Đang lưu...' : (product ? '💾 Cập nhật' : '➕ Thêm mới')}
        </button>
      </div>
    </form>
  )
}

export default ProductForm