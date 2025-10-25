// Test utility to verify admin redirect logic
// This file can be removed after testing

export const testAdminRedirect = () => {
  
  
  // Test cases
  const testCases = [
    { role: 'admin', expected: '/admin' },
    { role: 'super_admin', expected: '/admin' },
    { role: 'customer', expected: '/' },
    { role: 'staff', expected: '/' },
    { role: 'guest', expected: '/' }
  ]
  
  testCases.forEach(testCase => {
    const shouldRedirectToAdmin = testCase.role === 'admin' || testCase.role === 'super_admin'
    const expectedPath = shouldRedirectToAdmin ? '/admin' : '/'
    
    
  })
  
  
}

// Call this function in browser console to test
window.testAdminRedirect = testAdminRedirect
