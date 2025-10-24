import { useState } from 'react'

function StarRating({ 
  rating = 0, 
  maxStars = 5, 
  size = 'md', 
  interactive = false,
  onChange = null,
  showValue = false 
}) {
  const [hoveredStar, setHoveredStar] = useState(0)

  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }

  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value)
    }
  }

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoveredStar(value)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoveredStar(0)
    }
  }

  const displayRating = hoveredStar || rating

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxStars)].map((_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= displayRating

        return (
          <button
            key={index}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            disabled={!interactive}
            className={`
              ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
              transition-transform
              ${sizes[size]}
            `}
          >
            <svg
              className={`${sizes[size]} ${
                isFilled 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'fill-none text-slate-300'
              }`}
              stroke="currentColor"
              strokeWidth="1"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        )
      })}
      {showValue && (
        <span className="ml-2 text-sm font-medium text-slate-600">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

export default StarRating
