import { useNavigate } from 'react-router-dom'
import { markAllNotificationsRead, markNotificationRead } from '../utils/notifications'

const icons = {
  OUTBID: '↗',
  WON: '★',
  ENDING: '◷',
  PAYMENT: '✓',
  CREATED: '+',
  ACTIVITY: '•',
}

function NotificationDropdown({ notifications, onChange, onClose }) {
  const navigate = useNavigate()

  const handleNotificationClick = (notification) => {
    onChange(markNotificationRead(notification.id))
    if (notification.link) navigate(notification.link)
    onClose()
  }

  const handleMarkAllRead = () => {
    onChange(markAllNotificationsRead())
  }

  return (
    <div className="notification-panel" role="dialog" aria-label="Notifications">
      <div className="panel-header notification-panel-header">
        <div>
          <h3>Notifications</h3>
          <span className="muted">Your latest activity</span>
        </div>
        <button type="button" className="text-button" onClick={handleMarkAllRead}>Mark all as read</button>
      </div>
      <div className="notification-list">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <button
              type="button"
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
            >
              <span className={`notification-icon ${notification.type.toLowerCase()}`}>{icons[notification.type] || icons.ACTIVITY}</span>
              <span className="notification-copy">
                <strong>{notification.title}</strong>
                <span>{notification.message}</span>
                <small>{notification.time}</small>
              </span>
              {!notification.read && <span className="notification-unread-dot" aria-label="Unread" />}
            </button>
          ))
        ) : (
          <p className="muted notification-empty">No notifications yet.</p>
        )}
      </div>
    </div>
  )
}

export default NotificationDropdown
