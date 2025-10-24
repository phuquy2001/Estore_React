// Notification Service - Toast notifications
let toastId = 0

export const showToast = (message, duration = 1800) => {
  const id = toastId++
  
  const toast = document.createElement('div')
  toast.className = 'fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg opacity-0 transition-opacity duration-300'
  toast.textContent = message
  toast.id = `toast-${id}`
  
  document.body.appendChild(toast)
  
  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('opacity-100')
  })
  
  // Remove after duration
  setTimeout(() => {
    toast.classList.remove('opacity-100')
    setTimeout(() => {
      toast.remove()
    }, 300)
  }, duration)
  
  return id
}

export const showSuccessToast = (message) => {
  const toast = document.createElement('div')
  toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg opacity-0 transition-opacity duration-300'
  toast.textContent = message
  
  document.body.appendChild(toast)
  
  requestAnimationFrame(() => {
    toast.classList.add('opacity-100')
  })
  
  setTimeout(() => {
    toast.classList.remove('opacity-100')
    setTimeout(() => {
      toast.remove()
    }, 300)
  }, 1800)
}

export const showErrorToast = (message) => {
  const toast = document.createElement('div')
  toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg opacity-0 transition-opacity duration-300'
  toast.textContent = message
  
  document.body.appendChild(toast)
  
  requestAnimationFrame(() => {
    toast.classList.add('opacity-100')
  })
  
  setTimeout(() => {
    toast.classList.remove('opacity-100')
    setTimeout(() => {
      toast.remove()
    }, 300)
  }, 2500)
}
