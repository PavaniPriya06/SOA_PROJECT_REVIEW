import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [submitMessage, setSubmitMessage] = useState('')

  const passwordStrength = useMemo(() => {
    const value = form.password
    if (!value) return { label: 'No password', score: 0 }
    if (value.length < 6) return { label: 'Weak', score: 1 }
    if (value.length < 9) return { label: 'Medium', score: 2 }
    return { label: 'Strong', score: 3 }
  }, [form.password])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validation = {}

    if (!form.name.trim()) validation.name = 'Full name is required.'
    const normalizedEmail = form.email.trim().toLowerCase()
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!normalizedEmail) validation.email = 'Email is required.'
    else if (!emailPattern.test(normalizedEmail)) validation.email = 'Please enter a valid email address.'
    if (!form.password) validation.password = 'Password is required.'
    if (form.password !== form.confirmPassword) validation.confirmPassword = 'Passwords do not match.'

    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      setSubmitMessage('')
      return
    }

    try {
      await authApi.register({ name: form.name, email: normalizedEmail, password: form.password })
      setSubmitMessage('Account created successfully.')
      navigate('/login')
    } catch (error) {
      setSubmitMessage(error.message)
    }
  }

  return (
    <div className="auth-shell container">
      <div className="auth-card register-card">
        <div className="auth-intro">
          <span className="eyebrow">Create account</span>
          <h2>Join BidVelocity</h2>
          <p>Start bidding on premium items and manage your auctions with confidence.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Full Name</label>
            <input name="name" value={form.name} onChange={handleChange} />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="field">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="field">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} />
            {errors.password && <span className="field-error">{errors.password}</span>}
            <div className="strength-meter">
              <div className={`strength strength-${passwordStrength.score}`} />
            </div>
            <small className="muted">Password strength: {passwordStrength.label}</small>
          </div>

          <div className="field">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          {submitMessage && <p className="form-success">{submitMessage}</p>}

          <button className="btn btn-primary full-width" type="submit">Create Account</button>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
