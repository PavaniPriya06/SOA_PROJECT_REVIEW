import { useNavigate } from 'react-router-dom'

function ProfileDropdown({ user, onLogout }) {
  const navigate = useNavigate()

  if (!user) {
    return null
  }

  return (
    <div className="profile-panel">
      <div className="profile-card-head">
        <div className="avatar">{user.name?.charAt(0) || 'U'}</div>
        <div>
          <strong>{user.name}</strong>
          <p className="muted">{user.email}</p>
        </div>
      </div>

      <button className="dropdown-link" onClick={() => navigate('/profile')}>
        Edit Profile
      </button>
      <button className="dropdown-link" onClick={() => navigate('/my-bids')}>
        My Bids
      </button>
      <button className="dropdown-link danger" onClick={onLogout}>
        Logout
      </button>
    </div>
  )
}

export default ProfileDropdown
