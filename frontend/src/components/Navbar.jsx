import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import NotificationDropdown from './NotificationDropdown'

function Navbar({ user, onLogout, notifications, onNotificationsChange, mobileOpen, setMobileOpen }) {
  const navigate = useNavigate()
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const handleLogout = () => {
    onLogout()
    setMobileOpen(false)
    navigate('/login')
  }

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const navItems = [
    { label: 'Home', to: '/' },
    { label: 'Live Auctions', to: '/auctions' },
    { label: 'My Bids', to: '/my-bids' },
    { label: 'Seller Dashboard', to: '/seller/dashboard' },
  ]

  return (
    <header className="site-header">
      <nav className="navbar container">
        <div className="brand-wrap" onClick={() => navigate('/')}>
          <div className="brand-mark">B</div>
          <span>BidVelocity</span>
        </div>

        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <div className={`nav-group ${mobileOpen ? 'open' : ''}`}>
          <div className="nav-links">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="nav-actions">
            {user ? (
              <>
                <div className="notification-wrap">
                  <button className="icon-button" aria-label="Notifications" onClick={() => setNotificationsOpen((open) => !open)}>
                    🔔
                  </button>
                  {unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
                  {notificationsOpen && (
                    <NotificationDropdown
                      notifications={notifications}
                      onChange={onNotificationsChange}
                      onClose={() => setNotificationsOpen(false)}
                    />
                  )}
                </div>
                <button className="icon-button profile-button" aria-label="Profile" onClick={() => navigate('/profile')}>
                  👤
                </button>
                <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="btn btn-ghost" onClick={() => { setMobileOpen(false); navigate('/login') }}>Login</button>
                <button className="btn btn-primary" onClick={() => { setMobileOpen(false); navigate('/register') }}>Register</button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
