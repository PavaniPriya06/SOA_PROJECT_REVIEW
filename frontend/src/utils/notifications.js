const STORAGE_KEY = 'bidvelocity_notifications'

const defaultNotifications = [
  { id: 'default-outbid', type: 'OUTBID', title: 'You have been outbid', message: 'You have been outbid on iPhone 16 Pro.', time: 'Recently', read: false, link: '/auctions/iphone-16-pro' },
  { id: 'default-won', type: 'WON', title: 'Auction won', message: 'Congratulations! You won the PlayStation 5 auction.', time: 'Recently', read: false, link: '/auction/playstation-5/result' },
  { id: 'default-ending', type: 'ENDING', title: 'Auction ending soon', message: 'MacBook Pro M4 auction ends soon.', time: 'Recently', read: false, link: '/auctions/macbook-pro-m4' },
  { id: 'default-payment', type: 'PAYMENT', title: 'Payment successful', message: 'Payment successful for iPhone 16 Pro.', time: 'Recently', read: false, link: '/payment/iphone-16-pro' },
  { id: 'default-created', type: 'CREATED', title: 'Auction created', message: 'Your auction for Sony Alpha Camera has been created.', time: 'Recently', read: false, link: '/seller/dashboard' },
]

export function readNotifications() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    return Array.isArray(stored) ? stored : defaultNotifications
  } catch {
    return defaultNotifications
  }
}

export function createNotification({ type = 'ACTIVITY', title = 'Activity update', message, link = '', time = 'Just now' }) {
  const notification = {
    id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    title,
    message,
    time,
    link,
    read: false,
    createdAt: new Date().toISOString(),
  }
  const notifications = [notification, ...readNotifications()].slice(0, 40)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  window.dispatchEvent(new CustomEvent('bidvelocity-notification', { detail: notification }))
  return notification
}

export function markNotificationRead(id) {
  const notifications = readNotifications().map((notification) => notification.id === id ? { ...notification, read: true } : notification)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  return notifications
}

export function markAllNotificationsRead() {
  const notifications = readNotifications().map((notification) => ({ ...notification, read: true }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
  return notifications
}
