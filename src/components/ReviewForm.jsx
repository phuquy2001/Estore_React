import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import StarRating from './StarRating'
import { reviewsAPI } from '../services/apiService'
import { showSuccessToast, showErrorToast } from '../services/notificationService'

function ReviewForm({ productId, onReviewSubmitted }) {
  const { user, isAuthenticated } = useAuth()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      showErrorToast('Vui lòng đăng nhập để đánh giá')
      return
    }

    if (comment.trim().length < 10) {
      showErrorToast('Đánh giá phải có ít nhất 10 ký tự')
      return
    }

    setLoading(true)

    try {
      const reviewData = {
        productId,
        userId: user.uid || user.id, // Firebase UID
        userName: user.name,
        rating,
        comment: comment.trim()
        // createdAt will be added by Firebase serverTimestamp
      }

      await reviewsAPI.create(reviewData)

      showSuccessToast('Đánh giá của bạn đã được gửi!')
      setRating(5)
      setComment('')
      
      if (onReviewSubmitted) {
        onReviewSubmitted()
      }
    } catch (error) {
      console.error('Review submission error:', error)
      showErrorToast('Không thể gửi đánh giá. Vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="card p-6 bg-blue-50 border-blue-200">
        <p className="text-blue-800">
          <span className="font-semibold">Đăng nhập</span> để viết đánh giá cho sản phẩm này
        </p>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h3 className="text-xl font-bold mb-4">Viết đánh giá của bạn</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Đánh giá của bạn *
          </label>
          <div className="flex items-center gap-3">
            <StarRating
              rating={rating}
              interactive={true}
              onChange={setRating}
              size="xl"
            />
            <span className="text-lg font-semibold text-slate-900">
              {rating} sao
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nhận xét của bạn *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            className="input min-h-[120px] resize-none"
            required
            minLength={10}
            maxLength={500}
          />
          <div className="text-xs text-slate-500 mt-1">
            {comment.length}/500 ký tự (tối thiểu 10)
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || comment.trim().length < 10}
          className="btn btn-primary w-full"
        >
          {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </form>
    </div>
  )
}

export default ReviewForm
