import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'

function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: 'kiran@example.com', password: 'demo123' })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await authApi.login(form)
      const user = response.user
      onLogin(user)
      if (rememberMe) {
        localStorage.setItem('bidvelocity-user', JSON.stringify(user))
      }
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell container">
      <div className="auth-card login-card">
        <div className="auth-intro">
          <span className="eyebrow">Welcome back</span>
          <h2>Login to BidVelocity</h2>
          <p>Access live bidding, watchlists, and your dashboard in one secure place.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Password</label>
            <div className="password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button type="button" className="inline-toggle" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="auth-row">
            <label className="checkbox-row">
              <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe((value) => !value)} />
              Remember me
            </label>
            <button type="button" className="text-button">Forgot password?</button>
          </div>

          {error && <p className="form-error">{error}</p>}

          <button className="btn btn-primary full-width" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>

          <p className="auth-switch">
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
