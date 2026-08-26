import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN').format(amount)
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function readUsers() {
  try {
    const users = JSON.parse(localStorage.getItem('bidvelocity_users') || '[]')
    return Array.isArray(users) ? users : []
  } catch {
    return []
  }
}

function readPayments() {
  try {
    const payments = JSON.parse(localStorage.getItem('bidvelocity_payments') || '[]')
    return Array.isArray(payments) ? payments : []
  } catch {
    return []
  }
}

function ProfilePage({ user, auctions, onProfileUpdate, onLogout }) {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({ name: user.name || '', email: user.email || '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const stats = useMemo(() => {
    const bids = auctions.flatMap((auction) => (auction.bidHistory || []).filter((bid) => bid.bidder === user.name))
    const won = auctions.filter((auction) => {
      const bidsForAuction = (auction.bidHistory || []).filter((bid) => bid.bidder === user.name)
      const highest = Math.max(...bidsForAuction.map((bid) => Number(bid.amount)), 0)
      return bidsForAuction.length > 0 && (auction.status === 'ENDED' || auction.endTime <= Date.now()) && highest === Number(auction.currentBid)
    }).length
    const lost = auctions.filter((auction) => {
      const bidsForAuction = (auction.bidHistory || []).filter((bid) => bid.bidder === user.name)
      const highest = Math.max(...bidsForAuction.map((bid) => Number(bid.amount)), 0)
      return bidsForAuction.length > 0 && (auction.status === 'ENDED' || auction.endTime <= Date.now()) && highest < Number(auction.currentBid)
    }).length
    const active = auctions.filter((auction) => {
      const bidsForAuction = (auction.bidHistory || []).filter((bid) => bid.bidder === user.name)
      if (!bidsForAuction.length || auction.status === 'ENDED' || auction.endTime <= Date.now()) return false
      return Math.max(...bidsForAuction.map((bid) => Number(bid.amount))) === Number(auction.currentBid)
    }).length
    const totalSpent = readPayments()
      .filter((payment) => payment.userId === user.id && payment.status === 'SUCCESS')
      .reduce((total, payment) => total + Number(payment.amount || 0), 0)

    return { totalBids: bids.length, active, won, lost, totalSpent }
  }, [auctions, user])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setError('')
    setMessage('')
  }

  const handleSave = (event) => {
    event.preventDefault()
    const name = form.name.trim()
    const email = form.email.trim().toLowerCase()
    if (!name) {
      setError('Full name is required.')
      return
    }
    if (!emailPattern.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    const users = readUsers()
    if (users.some((registeredUser) => registeredUser.email === email && registeredUser.id !== user.id)) {
      setError('An account with this email already exists.')
      return
    }

    const updatedUser = { ...user, name, email }
    const matchingUser = users.some((registeredUser) => registeredUser.id === user.id)
    const updatedUsers = matchingUser
      ? users.map((registeredUser) => registeredUser.id === user.id ? { ...registeredUser, name, email } : registeredUser)
      : [...users, updatedUser]
    localStorage.setItem('bidvelocity_users', JSON.stringify(updatedUsers))
    localStorage.setItem('bidvelocity_current_user', JSON.stringify(updatedUser))
    onProfileUpdate(updatedUser)
    setForm({ name, email })
    setIsEditing(false)
    setMessage('Profile updated successfully.')
  }

  return (
    <div className="page-shell container profile-page">
      <div className="profile-dashboard">
        <div className="profile-main-card">
          <div className="profile-header-row">
            <div className="avatar large-avatar">{user.name?.charAt(0).toUpperCase() || 'U'}</div>
            <div>
              <span className="eyebrow">Account overview</span>
              <h1>My Profile</h1>
              <p className="muted">{user.email}</p>
            </div>
          </div>
          <div className="profile-account-meta">
            <span>Account created</span>
            <strong>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Date not available'}</strong>
          </div>
          <div className="profile-stats-row">
            <div className="stat-box compact"><strong>{stats.totalBids}</strong><span>Total Bids</span></div>
            <div className="stat-box compact"><strong>{stats.active}</strong><span>Active Bids</span></div>
            <div className="stat-box compact"><strong>{stats.won}</strong><span>Auctions Won</span></div>
            <div className="stat-box compact"><strong>{stats.lost}</strong><span>Auctions Lost</span></div>
            <div className="stat-box compact profile-spent"><strong>₹{formatCurrency(stats.totalSpent)}</strong><span>Total Amount Spent</span></div>
          </div>
        </div>

        <section className="profile-edit-card">
          <div className="panel-header"><div><span className="eyebrow">Personal details</span><h2>Edit Profile</h2></div></div>
          {isEditing ? (
            <form className="profile-edit-form" onSubmit={handleSave}>
              <div className="field"><label htmlFor="profile-name">Full Name</label><input id="profile-name" name="name" value={form.name} onChange={handleChange} /></div>
              <div className="field"><label htmlFor="profile-email">Email</label><input id="profile-email" name="email" type="email" value={form.email} onChange={handleChange} /></div>
              {error && <p className="form-error">{error}</p>}
              <div className="profile-actions"><button type="button" className="btn btn-secondary" onClick={() => { setIsEditing(false); setForm({ name: user.name || '', email: user.email || '' }); setError('') }}>Cancel</button><button type="submit" className="btn btn-primary">Save Changes</button></div>
            </form>
          ) : (
            <div className="profile-edit-summary"><p>Keep your account details current for a smoother bidding experience.</p><button type="button" className="btn btn-secondary" onClick={() => setIsEditing(true)}>Edit Profile</button></div>
          )}
          {message && <p className="form-success">{message}</p>}
        </section>

        <div className="profile-page-actions">
          <Link to="/my-bids" className="btn btn-primary">My Bids</Link>
          <button type="button" className="btn btn-ghost" onClick={() => { onLogout(); navigate('/login') }}>Logout</button>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
