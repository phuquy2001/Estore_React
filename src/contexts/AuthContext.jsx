import { createContext, useContext, useState, useEffect } from 'react'
import firebaseAuthService from '../services/firebaseAuthService'
import { usersService } from '../services/firebaseService'
import { showSuccessToast, showErrorToast } from '../services/notificationService'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

 useEffect(() => {
  const unsubscribe = firebaseAuthService.onAuthStateChange(async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userDoc = await usersService.getById(firebaseUser.uid)
        if (userDoc?.data) {
          const userData = userDoc.data
          const enhancedUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: userData.name,
            role: userData.role || 'user',
            avatar: userData.avatar
          }
          setUser(enhancedUser)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Lỗi tải role:', error)
        setUser(null)
      }
    } else {
      setUser(null)
    }
    setLoading(false)
  })

  return () => unsubscribe()
}, [])

  const login = async (email, password) => {
    try {
      const { user } = await firebaseAuthService.login(email, password)
      
      // Get user data from Firestore to get role information
      const userDoc = await usersService.getById(user.uid)
      if (userDoc?.data) {
        const userData = userDoc.data
        const userWithRole = {
          uid: user.uid,
          email: user.email,
          name: userData.name,
          role: userData.role,
          avatar: userData.avatar
        }
        
        // Firebase Auth automatically updates user state via listener
        showSuccessToast('Đăng nhập thành công!')
        return { success: true, user: userWithRole }
      } else {
        throw new Error('Không tìm thấy thông tin người dùng')
      }
    } catch (error) {
      const message = error.message || 'Đăng nhập thất bại'
      showErrorToast(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      const { user } = await firebaseAuthService.register(
        userData.email, 
        userData.password, 
        userData.name
      )
      showSuccessToast('Đăng ký thành công!')
      return { success: true, user }
    } catch (error) {
      const message = error.message || 'Đăng ký thất bại'
      showErrorToast(message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      await firebaseAuthService.logout()
      // Firebase Auth automatically updates user state to null via listener
      showSuccessToast('Đã đăng xuất')
    } catch (error) {
      showErrorToast('Lỗi khi đăng xuất')
    }
  }

  const loginWithGoogle = async () => {
    try {
      const { user } = await firebaseAuthService.loginWithGoogle()
      
      // Get user data from Firestore to get role information
      const userDoc = await usersService.getById(user.uid)
      if (userDoc?.data) {
        const userData = userDoc.data
        const userWithRole = {
          uid: user.uid,
          email: user.email,
          name: userData.name,
          role: userData.role,
          avatar: userData.avatar
        }
        
        showSuccessToast('Đăng nhập thành công!')
        return { success: true, user: userWithRole }
      } else {
        throw new Error('Không tìm thấy thông tin người dùng')
      }
    } catch (error) {
      if (error.message !== 'Popup đã bị đóng') {
        showErrorToast(error.message || 'Đăng nhập Google thất bại')
      }
      return { success: false, error: error.message }
    }
  }

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }))
  }

  const value = {
  user,
  loading,
  login,
  register,
  logout,
  loginWithGoogle,
  updateUser,
  isAuthenticated: !!user,
  isAdmin: user?.role === 'admin' || user?.role === 'super_admin' // ← Sửa ở đây!
}
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
