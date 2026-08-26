import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const nextErrors = {}
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required.'
    } else if (!emailPattern.test(form.email)) {
      nextErrors.email = 'Please enter a valid email address.'
    }

    if (!form.password.trim()) {
      nextErrors.password = 'Password is required.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    if (status.message) setStatus({ type: '', message: '' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!validateForm()) {
      setStatus({ type: 'error', message: 'Please fix the highlighted fields and try again.' })
      return
    }

    setIsLoading(true)
    setStatus({ type: '', message: '' })

    await new Promise((resolve) => setTimeout(resolve, 700))

    let registeredUsers = []
    try {
      registeredUsers = JSON.parse(localStorage.getItem('bidvelocity_users') || '[]')
    } catch {
      registeredUsers = []
    }

    const registeredUser = registeredUsers.find(
      (user) => user.email === form.email.trim().toLowerCase() && user.password === form.password,
    )

    if (!registeredUser) {
      setStatus({ type: 'error', message: 'Invalid email or password' })
      setIsLoading(false)
      return
    }

    const { password, ...mockUser } = registeredUser
    const authenticatedUser = {
      ...mockUser,
      totalBids: 0,
      auctionsWon: 0,
      totalSpent: 0,
    }

    localStorage.setItem('bidvelocity_current_user', JSON.stringify(authenticatedUser))
    localStorage.setItem('bidvelocity_authenticated', 'true')
    if (onLogin) onLogin(authenticatedUser)

    setStatus({ type: 'success', message: 'Login successful. Redirecting to home...' })
    setIsLoading(false)

    setTimeout(() => {
      navigate('/')
    }, 900)
  }

  return (
    <div className="login-page-shell">
      <div className="login-panel container">
        <div className="login-visual">
          <div className="login-brand">
            <div className="brand-mark">B</div>
            <span>BidVelocity</span>
          </div>

          <h1>Bid Live. Compete. Win.</h1>
          <p>
            Real-time auctions. Secure bidding. Trusted payments.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-dot">●</span>
              <span>Real-Time Bidding</span>
            </div>
            <div className="feature-item">
              <span className="feature-dot">●</span>
              <span>Secure Auctions</span>
            </div>
            <div className="feature-item">
              <span className="feature-dot">●</span>
              <span>Trusted Payments</span>
            </div>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <span className="eyebrow">Welcome Back</span>
            <h2>Sign in to continue bidding</h2>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="field-wrap">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={errors.email ? 'invalid' : ''}
              />
              {errors.email && <span className="validation-message">{errors.email}</span>}
            </div>

            <div className="field-wrap">
              <label htmlFor="password">Password</label>
              <div className="password-field">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={errors.password ? 'invalid' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && <span className="validation-message">{errors.password}</span>}
            </div>

            <div className="login-row">
              <label className="checkbox-wrap">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe((prev) => !prev)}
                />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-link">Forgot Password</Link>
            </div>

            {status.message && (
              <div className={`status-box ${status.type}`}>
                {status.message}
              </div>
            )}

            <button type="submit" className="btn btn-primary login-btn" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Login'}
            </button>

            <p className="signup-text">
              Don&apos;t have an account? <Link to="/register">Create an account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
