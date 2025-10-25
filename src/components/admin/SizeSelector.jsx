
function SizeSelector({ size, selectedSizes, onChange, error }) {
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  const handleToggle = (size) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size]
    onChange(newSizes)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Sizes có sẵn *
      </label>
      <div className="flex flex-wrap gap-2">
        {sizeOptions.map(size => (
          <button
            key={size}
            type="button"
            onClick={() => handleToggle(size)}
            className={`px-4 py-2 rounded border-2 transition-colors ${
              selectedSizes.includes(size)
                ? 'border-primary bg-primary text-white'
                : 'border-slate-300 hover:border-primary'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default SizeSelector