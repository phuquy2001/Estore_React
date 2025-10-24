import { useState, useEffect } from 'react'
import { productsAPI } from '../../../services/apiService'
import { formatCurrency } from '../../../models/productModel'
import { showSuccessToast, showErrorToast } from '../../../services/notificationService'
import ProductForm from '../../../components/admin/ProductForm'
import ProductImporter from '../../../components/admin/ProductImporter'

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [showImporter, setShowImporter] = useState(false)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll()
      setProducts(response.data)
    } catch (error) {
      showErrorToast('Không thể tải sản phẩm')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return

    try {
      await productsAPI.delete(id)
      showSuccessToast('Đã xóa sản phẩm')
      loadProducts()
    } catch (error) {
      showErrorToast('Không thể xóa sản phẩm')
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowModal(true)
  }

  const handleSave = async (productData) => {
    try {
      if (editingProduct) {
        // Update existing product
        await productsAPI.update(editingProduct.id, productData)
      } else {
        // Create new product
        await productsAPI.create(productData)
      }
      setShowModal(false)
      setEditingProduct(null)
      loadProducts()
    } catch (error) {
      throw error
    }
  }

  // Bulk actions
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map(p => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId, checked) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId])
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return
    
    if (!window.confirm(`Bạn có chắc muốn xóa ${selectedProducts.length} sản phẩm?`)) return

    try {
      await Promise.all(selectedProducts.map(id => productsAPI.delete(id)))
      showSuccessToast(`Đã xóa ${selectedProducts.length} sản phẩm`)
      setSelectedProducts([])
      loadProducts()
    } catch (error) {
      showErrorToast('Không thể xóa một số sản phẩm')
    }
  }

  const handleBulkUpdateStock = async (newStock) => {
    if (selectedProducts.length === 0) return

    try {
      await Promise.all(selectedProducts.map(id => {
        const product = products.find(p => p.id === id)
        return productsAPI.update(id, { ...product, stock: newStock })
      }))
      showSuccessToast(`Đã cập nhật kho cho ${selectedProducts.length} sản phẩm`)
      setSelectedProducts([])
      loadProducts()
    } catch (error) {
      showErrorToast('Không thể cập nhật một số sản phẩm')
    }
  }

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price':
          return a.price - b.price
        case 'stock':
          return a.stock - b.stock
        case 'category':
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })

  if (loading) {
    return <div className="text-center py-12">Đang tải...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý sản phẩm</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImporter(true)}
            className="btn btn-outline"
          >
            📁 Import từ file
          </button>
          <button
            onClick={() => {
              setEditingProduct(null)
              setShowModal(true)
            }}
            className="btn btn-primary"
          >
            + Thêm sản phẩm mới
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tên sản phẩm..."
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Danh mục
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input"
            >
              <option value="all">Tất cả</option>
              {[...new Set(products.map(p => p.category))].map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sắp xếp
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
            >
              <option value="name">Tên A-Z</option>
              <option value="price">Giá thấp-cao</option>
              <option value="stock">Kho ít-nhiều</option>
              <option value="category">Danh mục</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bulk Actions
            </label>
            <div className="flex gap-2">
              {selectedProducts.length > 0 && (
                <>
                  <button
                    onClick={handleBulkDelete}
                    className="btn btn-outline text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Xóa ({selectedProducts.length})
                  </button>
                  <button
                    onClick={() => {
                      const newStock = prompt('Nhập số lượng kho mới:')
                      if (newStock && !isNaN(newStock)) {
                        handleBulkUpdateStock(parseInt(newStock))
                      }
                    }}
                    className="btn btn-outline text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    Cập nhật kho
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <table className="w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Hình ảnh</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Tên sản phẩm</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Danh mục</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Giá</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Kho</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                    className="rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium">{product.name}</div>
                  {product.badge && (
                    <span className="text-xs px-2 py-0.5 bg-primary text-white rounded">
                      {product.badge}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">{product.category}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold">{formatCurrency(product.price)}</div>
                  {product.original_price && (
                    <div className="text-xs text-slate-400 line-through">
                      {formatCurrency(product.original_price)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">{product.stock || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full my-8">
            <h3 className="text-2xl font-bold mb-6">
              {editingProduct ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
            </h3>
            <ProductForm
              product={editingProduct}
              onSave={handleSave}
              onCancel={() => {
                setShowModal(false)
                setEditingProduct(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImporter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full my-8">
            <ProductImporter
              onImportComplete={() => {
                setShowImporter(false)
                loadProducts()
              }}
              onCancel={() => setShowImporter(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts
