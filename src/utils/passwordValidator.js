/**
 * Password Policy Validator
 * Enforces strong password requirements
 */

export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128
}

export const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result
 */
export function validatePassword(password) {
  const errors = []
  const warnings = []

  // Check minimum length
  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Mật khẩu phải có ít nhất ${PASSWORD_POLICY.minLength} ký tự`)
  }

  // Check maximum length
  if (password.length > PASSWORD_POLICY.maxLength) {
    errors.push(`Mật khẩu không được vượt quá ${PASSWORD_POLICY.maxLength} ký tự`)
  }

  // Check for uppercase
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ hoa')
  }

  // Check for lowercase
  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 chữ thường')
  }

  // Check for numbers
  if (PASSWORD_POLICY.requireNumbers && !/\d/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 số')
  }

  // Check for special characters
  if (PASSWORD_POLICY.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt')
  }

  // Check for common patterns
  if (/(.)\1{2,}/.test(password)) {
    warnings.push('Tránh lặp lại ký tự liên tiếp')
  }

  if (/123|abc|qwe/i.test(password)) {
    warnings.push('Tránh sử dụng chuỗi ký tự liên tiếp')
  }

  // Check for common passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ]
  
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    warnings.push('Tránh sử dụng mật khẩu phổ biến')
  }

  // Calculate strength score
  const strengthScore = calculatePasswordStrength(password)
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    strengthScore,
    strengthLevel: getStrengthLevel(strengthScore)
  }
}

/**
 * Calculate password strength score (0-100)
 * @param {string} password - Password to analyze
 * @returns {number} - Strength score
 */
function calculatePasswordStrength(password) {
  let score = 0

  // Length score (0-25 points)
  if (password.length >= 8) score += 10
  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 5

  // Character variety (0-40 points)
  if (/[a-z]/.test(password)) score += 10
  if (/[A-Z]/.test(password)) score += 10
  if (/\d/.test(password)) score += 10
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 10

  // Complexity (0-35 points)
  const uniqueChars = new Set(password).size
  score += Math.min(uniqueChars * 2, 20)
  
  if (password.length >= 8 && uniqueChars >= 6) score += 15

  return Math.min(score, 100)
}

/**
 * Get strength level based on score
 * @param {number} score - Password strength score
 * @returns {string} - Strength level
 */
function getStrengthLevel(score) {
  if (score < 30) return 'Rất yếu'
  if (score < 50) return 'Yếu'
  if (score < 70) return 'Trung bình'
  if (score < 90) return 'Mạnh'
  return 'Rất mạnh'
}

/**
 * Generate secure password suggestions
 * @returns {array} - Array of password suggestions
 */
export function generatePasswordSuggestions() {
  const suggestions = []
  
  // Generate 3 random secure passwords
  for (let i = 0; i < 3; i++) {
    const password = generateSecurePassword()
    const validation = validatePassword(password)
    suggestions.push({
      password,
      strength: validation.strengthLevel,
      score: validation.strengthScore
    })
  }
  
  return suggestions
}

/**
 * Generate a secure password
 * @returns {string} - Generated password
 */
function generateSecurePassword() {
  const length = 12
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  const allChars = lowercase + uppercase + numbers + special
  let password = ''
  
  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += special[Math.floor(Math.random() * special.length)]
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * Check if password has been compromised
 * @param {string} password - Password to check
 * @returns {Promise<boolean>} - True if compromised
 */
export async function checkPasswordBreach(password) {
  // This would typically call a service like HaveIBeenPwned API
  // For now, we'll simulate with a simple check
  const commonBreachedPasswords = [
    'password', '123456', 'password123', 'admin', 'qwerty'
  ]
  
  return commonBreachedPasswords.includes(password.toLowerCase())
}
