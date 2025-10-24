import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

/**
 * Firebase Authentication Service
 * Replaces JSON Server Auth
 */

export const firebaseAuthService = {
  /**
   * Register new user with email and password
   */
  async register(email, password, name) {
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update display name
      await updateProfile(user, { displayName: name })

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: email,
        name: name,
        role: 'customer', // Default role
        phone: '',
        address: '',
        createdAt: serverTimestamp()
      })

      return {
        user: {
          uid: user.uid,
          email: user.email,
          name: name,
          role: 'customer'
        }
      }
    } catch (error) {
      console.error('Register error:', error)
      throw this.handleAuthError(error)
    }
  },

  /**
   * Login with email and password
   */
  async login(email, password) {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          name: user.displayName || 'User',
          role: 'customer',
          createdAt: serverTimestamp()
        })
      }

      const userData = userDoc.exists() ? userDoc.data() : {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        role: 'customer'
      }

      return {
        user: {
          uid: user.uid,
          id: user.uid, // For compatibility with existing code
          email: user.email,
          name: userData.name || user.displayName,
          role: userData.role || 'customer',
          phone: userData.phone || '',
          address: userData.address || ''
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      throw this.handleAuthError(error)
    }
  },

  /**
   * Login with Google
   */
  async loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Check if user document exists
      const userDocRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          name: user.displayName || 'User',
          role: 'customer',
          phone: '',
          address: '',
          createdAt: serverTimestamp()
        })
      }

      const userData = userDoc.exists() ? userDoc.data() : {
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        role: 'customer'
      }

      return {
        user: {
          uid: user.uid,
          id: user.uid,
          email: user.email,
          name: userData.name,
          role: userData.role,
          phone: userData.phone || '',
          address: userData.address || ''
        }
      }
    } catch (error) {
      console.error('Google login error:', error)
      throw this.handleAuthError(error)
    }
  },

  /**
   * Logout current user
   */
  async logout() {
    try {
      await signOut(auth)
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser() {
    return auth.currentUser
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        const userData = userDoc.exists() ? userDoc.data() : {}

        callback({
          uid: user.uid,
          id: user.uid,
          email: user.email,
          name: userData.name || user.displayName || 'User',
          role: userData.role || 'customer',
          phone: userData.phone || '',
          address: userData.address || ''
        })
      } else {
        callback(null)
      }
    })
  },

  /**
   * Handle Firebase Auth errors
   */
  handleAuthError(error) {
    const errorMessages = {
      'auth/email-already-in-use': 'Email đã được sử dụng',
      'auth/invalid-email': 'Email không hợp lệ',
      'auth/operation-not-allowed': 'Thao tác không được phép',
      'auth/weak-password': 'Mật khẩu quá yếu (tối thiểu 6 ký tự)',
      'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa',
      'auth/user-not-found': 'Không tìm thấy tài khoản',
      'auth/wrong-password': 'Email hoặc mật khẩu không đúng',
      'auth/invalid-credential': 'Email hoặc mật khẩu không đúng',
      'auth/too-many-requests': 'Quá nhiều yêu cầu. Vui lòng thử lại sau',
      'auth/network-request-failed': 'Lỗi kết nối mạng',
      'auth/popup-closed-by-user': 'Popup đã bị đóng'
    }

    return {
      code: error.code,
      message: errorMessages[error.code] || error.message || 'Đã xảy ra lỗi'
    }
  }
}

export default firebaseAuthService
