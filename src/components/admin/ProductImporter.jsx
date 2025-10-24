import { useState } from 'react'
import { productsAPI } from '../../services/apiService'
import { showSuccessToast, showErrorToast } from '../../services/notificationService'

/**
 * Product Importer Component
 * Import products from CSV or JSON file
 */
function ProductImporter({ onImportComplete, onCancel }) {
  const [loading, setLoading] = useState(false)
  const [importType, setImportType] = useState('csv')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [errors, setErrors] = useState([])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setErrors([])
    setPreview([])

    // Validate file type
    const validTypes = {
      csv: ['text/csv', 'application/csv', 'text/plain'],
      json: ['application/json', 'text/json']
    }

    if (!validTypes[importType].includes(selectedFile.type) && 
        !selectedFile.name.toLowerCase().endsWith(`.${importType}`)) {
      showErrorToast(`Vui lòng chọn file ${importType.toUpperCase()} hợp lệ`)
      return
    }

    // Parse file
    parseFile(selectedFile)
  }

  const parseFile = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        if (importType === 'csv') {
          parseCSV(e.target.result)
        } else {
          parseJSON(e.target.result)
        }
      } catch (error) {
        showErrorToast('Lỗi khi đọc file: ' + error.message)
      }
    }
    reader.readAsText(file)
  }

  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      showErrorToast('File CSV phải có ít nhất 1 dòng dữ liệu')
      return
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const requiredFields = ['name', 'price', 'category', 'image']
    
    // Check required fields
    const missingFields = requiredFields.filter(field => !headers.includes(field))
    if (missingFields.length > 0) {
      showErrorToast(`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`)
      return
    }

    const products = []
    const errors = []

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim())
        if (values.length !== headers.length) {
          errors.push(`Dòng ${i + 1}: Số cột không khớp`)
          continue
        }

        const product = {}
        headers.forEach((header, index) => {
          product[header] = values[index]
        })

        // Validate required fields
        if (!product.name || !product.price || !product.category || !product.image) {
          errors.push(`Dòng ${i + 1}: Thiếu thông tin bắt buộc`)
          continue
        }

        // Convert price to number
        product.price = parseFloat(product.price)
        if (isNaN(product.price) || product.price <= 0) {
          errors.push(`Dòng ${i + 1}: Giá không hợp lệ`)
          continue
        }

        // Set defaults
        product.stock = product.stock ? parseInt(product.stock) : 0
        product.rating = product.rating ? parseFloat(product.rating) : 4.5
        product.reviews = product.reviews ? parseInt(product.reviews) : 0
        product.sizes = product.sizes ? product.sizes.split('|') : ['S', 'M', 'L']
        product.badge = product.badge || ''
        product.description = product.description || ''

        products.push(product)
      } catch (error) {
        errors.push(`Dòng ${i + 1}: ${error.message}`)
      }
    }

    setPreview(products)
    setErrors(errors)
  }

  const parseJSON = (jsonText) => {
    try {
      const data = JSON.parse(jsonText)
      const products = Array.isArray(data) ? data : [data]
      
      const errors = []
      const validProducts = []

      products.forEach((product, index) => {
        // Validate required fields
        if (!product.name || !product.price || !product.category || !product.image) {
          errors.push(`Sản phẩm ${index + 1}: Thiếu thông tin bắt buộc`)
          return
        }

        // Set defaults
        product.stock = product.stock || 0
        product.rating = product.rating || 4.5
        product.reviews = product.reviews || 0
        product.sizes = product.sizes || ['S', 'M', 'L']
        product.badge = product.badge || ''
        product.description = product.description || ''

        validProducts.push(product)
      })

      setPreview(validProducts)
      setErrors(errors)
    } catch (error) {
      showErrorToast('Lỗi khi đọc file JSON: ' + error.message)
    }
  }

  const handleImport = async () => {
    if (preview.length === 0) {
      showErrorToast('Không có sản phẩm nào để import')
      return
    }

    setLoading(true)
    let successCount = 0
    let errorCount = 0

    try {
      for (const product of preview) {
        try {
          await productsAPI.create(product)
          successCount++
        } catch (error) {
          console.error('Error creating product:', error)
          errorCount++
        }
      }

      if (successCount > 0) {
        showSuccessToast(`Import thành công ${successCount} sản phẩm`)
        if (onImportComplete) {
          onImportComplete()
        }
      }
      
      if (errorCount > 0) {
        showErrorToast(`${errorCount} sản phẩm import thất bại`)
      }
    } catch (error) {
      showErrorToast('Lỗi khi import: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const template = {
      name: 'Tên sản phẩm',
      price: 'Giá bán (VNĐ)',
      original_price: 'Giá gốc (VNĐ)',
      category: 'Danh mục',
      image: 'Link ảnh',
      stock: 'Số lượng',
      badge: 'Badge',
      description: 'Mô tả',
      sizes: 'Sizes (S|M|L)',
      rating: 'Đánh giá',
      reviews: 'Số review'
    }

    const csvContent = Object.values(template).join(',') + '\n' +
      Object.values(template).map(() => 'Ví dụ').join(',')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'product_template.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">📁 Import Sản Phẩm</h3>
        <button
          onClick={onCancel}
          className="text-slate-500 hover:text-slate-700"
        >
          ✕
        </button>
      </div>

      {/* Import Type */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Loại file
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="csv"
              checked={importType === 'csv'}
              onChange={(e) => setImportType(e.target.value)}
              className="mr-2"
            />
            CSV
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="json"
              checked={importType === 'json'}
              onChange={(e) => setImportType(e.target.value)}
              className="mr-2"
            />
            JSON
          </label>
        </div>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Chọn file
        </label>
        <input
          type="file"
          accept={importType === 'csv' ? '.csv' : '.json'}
          onChange={handleFileChange}
          className="input"
        />
        <div className="mt-2 text-xs text-slate-500">
          💡 <strong>Gợi ý:</strong> Tải template mẫu để biết định dạng file
          <button
            onClick={downloadTemplate}
            className="ml-2 text-blue-600 hover:underline"
          >
            📥 Tải template CSV
          </button>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-800 mb-2">⚠️ Lỗi phát hiện:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-800 mb-2">
            ✅ Xem trước ({preview.length} sản phẩm):
          </h4>
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-green-100">
                <tr>
                  <th className="px-2 py-1 text-left">Tên</th>
                  <th className="px-2 py-1 text-left">Giá</th>
                  <th className="px-2 py-1 text-left">Danh mục</th>
                  <th className="px-2 py-1 text-left">Kho</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((product, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-2 py-1">{product.name}</td>
                    <td className="px-2 py-1">{product.price?.toLocaleString()}đ</td>
                    <td className="px-2 py-1">{product.category}</td>
                    <td className="px-2 py-1">{product.stock}</td>
                  </tr>
                ))}
                {preview.length > 10 && (
                  <tr>
                    <td colSpan="4" className="px-2 py-1 text-center text-slate-500">
                      ... và {preview.length - 10} sản phẩm khác
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          onClick={onCancel}
          className="btn btn-outline"
          disabled={loading}
        >
          Hủy
        </button>
        <button
          onClick={handleImport}
          disabled={loading || preview.length === 0}
          className="btn btn-primary"
        >
          {loading ? '⏳ Đang import...' : `📥 Import ${preview.length} sản phẩm`}
        </button>
      </div>
    </div>
  )
}

export default ProductImporter
