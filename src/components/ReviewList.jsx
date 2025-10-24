import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import StarRating from './StarRating'
import { reviewsAPI } from '../services/apiService'
import { showSuccessToast, showErrorToast } from '../services/notificationService'

function ReviewList({ reviews, onReviewDeleted }) {
  const { user } = useAuth()
  const [sortBy, setSortBy] = useState('newest')

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      return
    }

    try {
      await reviewsAPI.delete(reviewId)

      showSuccessToast('Đã xóa đánh giá')
      
      if (onReviewDeleted) {
        onReviewDeleted()
      }
    } catch (error) {
      console.error('Delete review error:', error)
      showErrorToast('Không thể xóa đánh giá')
    }
  }

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt)
      case 'highest':
        return b.rating - a.rating
      case 'lowest':
        return a.rating - b.rating
      default:
        return 0
    }
  })

  // Calculate statistics
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const ratingCounts = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  }

  if (reviews.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-4xl mb-4">⭐</div>
        <h3 className="text-xl font-semibold mb-2">Chưa có đánh giá nào</h3>
        <p className="text-slate-600">
          Hãy là người đầu tiên đánh giá sản phẩm này!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <span className="text-5xl font-bold text-primary">
                {avgRating.toFixed(1)}
              </span>
              <div>
                <StarRating rating={avgRating} size="lg" showValue={false} />
                <div className="text-sm text-slate-600 mt-1">
                  {reviews.length} đánh giá
                </div>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-20">
                  <span className="text-sm font-medium">{star}</span>
                  <svg className="w-4 h-4 fill-yellow-400" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </div>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{
                      width: `${reviews.length > 0 ? (ratingCounts[star] / reviews.length) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="text-sm text-slate-600 w-12 text-right">
                  {ratingCounts[star]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Tất cả đánh giá ({reviews.length})</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input py-2 text-sm"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="highest">Đánh giá cao nhất</option>
          <option value="lowest">Đánh giá thấp nhất</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.map((review) => {
          const isOwnReview = user && user.id === review.userId
          const reviewDate = new Date(review.createdAt)
          const isNew = (Date.now() - reviewDate.getTime()) < 7 * 24 * 60 * 60 * 1000 // 7 days

          return (
            <div key={review.id} className="card p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                    {review.userName?.charAt(0).toUpperCase() || 'U'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {review.userName || 'Anonymous'}
                      </span>
                      {isOwnReview && (
                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                          Bạn
                        </span>
                      )}
                      {isNew && (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">
                          Mới
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-xs text-slate-500">
                        {reviewDate.toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delete Button (own reviews only) */}
                {isOwnReview && (
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                    title="Xóa đánh giá"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Comment */}
              <p className="text-slate-700 leading-relaxed">
                {review.comment}
              </p>

              {/* Helpful (optional - for future) */}
              <div className="mt-4 pt-4 border-t flex items-center gap-4 text-sm text-slate-600">
                <button className="hover:text-primary transition-colors">
                  👍 Hữu ích
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ReviewList
