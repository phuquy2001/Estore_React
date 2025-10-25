// ImageUploader.jsx
import { useState } from 'react'
import { showErrorToast } from '../../services/notificationService'

function ImageUploader({ value, onChange, error }) {
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (file) => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      showErrorToast('Vui lòng chọn file ảnh hợp lệ')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast('Kích thước ảnh không được vượt quá 5MB')
      return
    }

    setUploading(true)
    // TODO: Upload file to Firebase Storage and get download URL
    // For now, use base64
    const reader = new FileReader()
    reader.onload = (e) => {
      onChange(e.target.result)
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Hình ảnh sản phẩm *
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            📁 Tải lên từ thiết bị
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            className="input"
            disabled={uploading}
          />
          {uploading && (
            <p className="text-blue-600 text-xs mt-1">⏳ Đang xử lý ảnh...</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            🔗 Hoặc nhập link ảnh
          </label>
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`input ${error ? 'border-red-500' : ''}`}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
    </div>
  )
}

export default ImageUploader