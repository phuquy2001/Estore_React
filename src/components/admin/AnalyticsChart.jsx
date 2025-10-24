import { useState, useEffect } from 'react'

/**
 * Simple Analytics Chart Component
 * No external dependencies - pure CSS charts
 */
function AnalyticsChart({ data, type = 'line', title, color = 'blue' }) {
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    if (data && data.length > 0) {
      setChartData(data)
    }
  }, [data])

  const getMaxValue = () => {
    return Math.max(...chartData.map(item => item.value))
  }

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500'
    }
    return colors[color] || colors.blue
  }

  if (chartData.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="text-center text-slate-500 py-8">
          Không có dữ liệu để hiển thị
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      
      {type === 'line' && (
        <div className="space-y-4">
          <div className="flex items-end justify-between h-32">
            {chartData.map((item, index) => {
              const height = (item.value / getMaxValue()) * 100
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="w-full flex flex-col items-center">
                    <div 
                      className={`w-8 ${getColorClasses(color)} rounded-t`}
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="text-xs text-slate-600 mt-2 text-center">
                      {item.label}
                    </div>
                    <div className="text-xs font-semibold text-slate-800 mt-1">
                      {item.value}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {type === 'bar' && (
        <div className="space-y-2">
          {chartData.map((item, index) => {
            const width = (item.value / getMaxValue()) * 100
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-slate-600">{item.value}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getColorClasses(color)}`}
                    style={{ width: `${width}%` }}
                  ></div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {type === 'pie' && (
        <div className="flex items-center justify-center">
          <div className="w-32 h-32 relative">
            {chartData.map((item, index) => {
              const percentage = (item.value / chartData.reduce((sum, d) => sum + d.value, 0)) * 100
              const rotation = chartData.slice(0, index).reduce((sum, d) => 
                sum + (d.value / chartData.reduce((s, d) => s + d.value, 0)) * 360, 0
              )
              
              return (
                <div
                  key={index}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(from ${rotation}deg, ${getColorClasses(color)} ${percentage}%, transparent ${percentage}%)`
                  }}
                ></div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalyticsChart
