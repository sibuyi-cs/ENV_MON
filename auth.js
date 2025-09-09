import { authHelpers } from './supabase.js'

// DOM Elements
const loginForm = document.getElementById('loginForm')
const registerForm = document.getElementById('registerForm')

// Utility Functions
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId)
    if (errorElement) {
        errorElement.textContent = message
        errorElement.classList.add('show')
    }
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId)
    if (errorElement) {
        errorElement.classList.remove('show')
    }
}

function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId)
    if (successElement) {
        successElement.textContent = message
        successElement.classList.add('show')
    }
}

function hideSuccess(elementId) {
    const successElement = document.getElementById(elementId)
    if (successElement) {
        successElement.classList.remove('show')
    }
}

function setLoading(buttonId, loaderId, isLoading) {
    const button = document.getElementById(buttonId)
    const loader = document.getElementById(loaderId)
    
    if (button && loader) {
        if (isLoading) {
            button.classList.add('loading')
            button.disabled = true
        } else {
            button.classList.remove('loading')
            button.disabled = false
        }
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

function validatePassword(password) {
    return {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    }
}

function getPasswordStrength(password) {
    const checks = validatePassword(password)
    const score = Object.values(checks).filter(Boolean).length
    
    if (score < 2) return { strength: 'weak', text: 'Weak password' }
    if (score < 3) return { strength: 'fair', text: 'Fair password' }
    if (score < 4) return { strength: 'good', text: 'Good password' }
    return { strength: 'strong', text: 'Strong password' }
}

// Password Toggle Functionality
function setupPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId)
    const toggle = document.getElementById(toggleId)
    
    if (input && toggle) {
        toggle.addEventListener('click', () => {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password'
            input.setAttribute('type', type)
            
            const icon = toggle.querySelector('.toggle-icon')
            if (icon) {
                icon.textContent = type === 'password' ? '👁️' : '🙈'
            }
        })
    }
}

// Password Strength Indicator
function setupPasswordStrength() {
    const passwordInput = document.getElementById('password')
    const strengthFill = document.getElementById('strengthFill')
    const strengthText = document.getElementById('strengthText')
    
    if (passwordInput && strengthFill && strengthText) {
        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value
            
            if (password.length === 0) {
                strengthFill.className = 'strength-fill'
                strengthText.textContent = 'Password strength'
                return
            }
            
            const { strength, text } = getPasswordStrength(password)
            strengthFill.className = `strength-fill ${strength}`
            strengthText.textContent = text
        })
    }
}

// Form Validation
function validateLoginForm(formData) {
    let isValid = true
    
    // Clear previous errors
    hideError('emailError')
    hideError('passwordError')
    hideError('mainError')
    
    // Email validation
    if (!formData.email) {
        showError('emailError', 'Email is required')
        isValid = false
    } else if (!validateEmail(formData.email)) {
        showError('emailError', 'Please enter a valid email address')
        isValid = false
    }
    
    // Password validation
    if (!formData.password) {
        showError('passwordError', 'Password is required')
        isValid = false
    }
    
    return isValid
}

function validateRegisterForm(formData) {
    let isValid = true
    
    // Clear previous errors
    hideError('fullNameError')
    hideError('emailError')
    hideError('passwordError')
    hideError('confirmPasswordError')
    hideError('mainError')
    
    // Full name validation
    if (!formData.fullName || formData.fullName.trim().length < 2) {
        showError('fullNameError', 'Please enter your full name (at least 2 characters)')
        isValid = false
    }
    
    // Email validation
    if (!formData.email) {
        showError('emailError', 'Email is required')
        isValid = false
    } else if (!validateEmail(formData.email)) {
        showError('emailError', 'Please enter a valid email address')
        isValid = false
    }
    
    // Password validation
    if (!formData.password) {
        showError('passwordError', 'Password is required')
        isValid = false
    } else {
        const passwordChecks = validatePassword(formData.password)
        if (!passwordChecks.length) {
            showError('passwordError', 'Password must be at least 8 characters long')
            isValid = false
        } else if (Object.values(passwordChecks).filter(Boolean).length < 3) {
            showError('passwordError', 'Password must contain uppercase, lowercase, and numbers')
            isValid = false
        }
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
        showError('confirmPasswordError', 'Please confirm your password')
        isValid = false
    } else if (formData.password !== formData.confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match')
        isValid = false
    }
    
    // Terms agreement validation
    if (!formData.agreeTerms) {
        showError('mainError', 'You must agree to the Terms of Service and Privacy Policy')
        isValid = false
    }
    
    return isValid
}

// Login Form Handler
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        
        const formData = {
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value
        }
        
        if (!validateLoginForm(formData)) {
            return
        }
        
        setLoading('loginButton', 'loginLoader', true)
        hideError('mainError')
        hideSuccess('successMessage')
        
        try {
            const result = await authHelpers.signIn(formData.email, formData.password)
            
            if (result.success) {
                showSuccess('successMessage', 'Login successful! Redirecting...')
                
                // Redirect to dashboard after successful login
                setTimeout(() => {
                    window.location.href = 'dashboard.html'
                }, 1500)
            } else {
                showError('mainError', result.error || 'Login failed. Please try again.')
            }
        } catch (error) {
            showError('mainError', 'An unexpected error occurred. Please try again.')
            console.error('Login error:', error)
        } finally {
            setLoading('loginButton', 'loginLoader', false)
        }
    })
    
    // Setup password toggle
    setupPasswordToggle('password', 'passwordToggle')
}

// Register Form Handler
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault()
        
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            agreeTerms: document.getElementById('agreeTerms').checked
        }
        
        if (!validateRegisterForm(formData)) {
            return
        }
        
        setLoading('registerButton', 'registerLoader', true)
        hideError('mainError')
        hideSuccess('successMessage')
        
        try {
            const result = await authHelpers.signUp(formData.email, formData.password)
            
            if (result.success) {
                showSuccess('successMessage', 'Account created successfully! Please check your email for verification.')
                
                // Clear form
                registerForm.reset()
                
                // Redirect to login page after successful registration
                setTimeout(() => {
                    window.location.href = 'login.html'
                }, 3000)
            } else {
                showError('mainError', result.error || 'Registration failed. Please try again.')
            }
        } catch (error) {
            showError('mainError', 'An unexpected error occurred. Please try again.')
            console.error('Registration error:', error)
        } finally {
            setLoading('registerButton', 'registerLoader', false)
        }
    })
    
    // Setup password toggles
    setupPasswordToggle('password', 'passwordToggle')
    setupPasswordToggle('confirmPassword', 'confirmPasswordToggle')
    
    // Setup password strength indicator
    setupPasswordStrength()
}

// Check if user is already logged in
async function checkAuthState() {
    try {
        const result = await authHelpers.getCurrentUser()
        
        if (result.success && result.user) {
            // User is already logged in, redirect to dashboard
            if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
                window.location.href = 'dashboard.html'
            }
        }
    } catch (error) {
        console.error('Auth state check error:', error)
    }
}

// Initialize auth state check
checkAuthState()

// Listen for auth state changes
authHelpers.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        console.log('User signed in:', session.user)
        // Redirect will be handled by the form submission success handler
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out')
        // Redirect to login if on a protected page
        if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html')) {
            window.location.href = 'login.html'
        }
    }
})