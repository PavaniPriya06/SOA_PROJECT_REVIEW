import { Link } from 'react-router-dom'

function RegisterPlaceholder() {
  return (
    <div className="login-page-shell">
      <div className="login-panel container">
        <div className="login-visual">
          <div className="login-brand">
            <div className="brand-mark">B</div>
            <span>BidVelocity</span>
          </div>

          <h1>Bid Live. Compete. Win.</h1>
          <p>Join thousands of bidders and participate in secure real-time auctions.</p>

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
            <span className="eyebrow">Create account</span>
            <h2>Register to get started</h2>
          </div>

          <div className="placeholder-card">
            <p>This is a placeholder Register page for the BidVelocity frontend.</p>
            <p>Registration logic and form validation will be added in a future phase.</p>
            <Link to="/login" className="btn btn-primary login-btn">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPlaceholder
