import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import RegisterPage from './pages/RegisterPage'
import LiveAuctionsPage from './pages/LiveAuctionsPage'
import AuctionDetailPage from './pages/AuctionDetailPage'
import MyBidsPage from './pages/MyBidsPage'
import SellerDashboardPage from './pages/SellerDashboardPage'
import CreateAuctionPage from './pages/CreateAuctionPage'
import EditAuctionPage from './pages/EditAuctionPage'
import AuctionResultPage from './pages/AuctionResultPage'
import PaymentPage from './pages/PaymentPage'
import ProfilePage from './pages/ProfilePage'
import { createNotification, readNotifications } from './utils/notifications'

import { mockAuctions, userProfile } from './data/mockAuctions'
import './App.css'

const readStoredUser = () => {
  if (localStorage.getItem('bidvelocity_authenticated') !== 'true') return null

  try {
    return JSON.parse(localStorage.getItem('bidvelocity_current_user') || 'null')
  } catch {
    return null
  }
}

const readStoredAuctions = () => {
  try {
    const storedAuctions = JSON.parse(localStorage.getItem('bidvelocity_auctions') || '[]')
    return Array.isArray(storedAuctions) ? storedAuctions : []
  } catch {
    return []
  }
}

const readAuctionUpdates = () => {
  try {
    const updates = JSON.parse(localStorage.getItem('bidvelocity_auction_updates') || '{}')
    return updates && typeof updates === 'object' ? updates : {}
  } catch {
    return {}
  }
}

function App() {
  const [user, setUser] = useState(readStoredUser)

  const [auctionData, setAuctionData] = useState(() => {
    const updates = readAuctionUpdates()
    const updatedMocks = mockAuctions.map((auction) => ({ ...auction, ...(updates[auction.id] || {}) }))
    const storedAuctions = readStoredAuctions().filter(
      (auction) => !mockAuctions.some((mockAuction) => mockAuction.id === auction.id),
    )
    return [...storedAuctions, ...updatedMocks]
  })
  const [notifications, setNotifications] = useState(readNotifications)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (user) {
      localStorage.setItem('bidvelocity_current_user', JSON.stringify(user))
      localStorage.setItem('bidvelocity_authenticated', 'true')
    } else {
      localStorage.removeItem('bidvelocity_current_user')
      localStorage.removeItem('bidvelocity_authenticated')
    }
  }, [user])

  useEffect(() => {
    const syncNotifications = () => setNotifications(readNotifications())
    window.addEventListener('bidvelocity-notification', syncNotifications)
    return () => window.removeEventListener('bidvelocity-notification', syncNotifications)
  }, [])

  const currentUserProfile = useMemo(() => user || userProfile, [user])

  const handleLogin = (loggedUser) => {
    setUser(loggedUser)
    setMobileOpen(false)
  }

  const handleLogout = () => {
    setUser(null)
  }

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser)
  }

  const updateAuctionState = (updatedAuction) => {
    setAuctionData((current) =>
      current.map((auction) => (auction.id === updatedAuction.id ? updatedAuction : auction)),
    )

    const storedAuctions = readStoredAuctions()
    if (storedAuctions.some((auction) => auction.id === updatedAuction.id)) {
      localStorage.setItem(
        'bidvelocity_auctions',
        JSON.stringify(storedAuctions.map((auction) => auction.id === updatedAuction.id ? updatedAuction : auction)),
      )
    }

    const updates = readAuctionUpdates()
    localStorage.setItem('bidvelocity_auction_updates', JSON.stringify({ ...updates, [updatedAuction.id]: updatedAuction }))
  }

  const handleCreateAuction = (newAuction) => {
    setAuctionData((current) => [newAuction, ...current])
    localStorage.setItem('bidvelocity_auctions', JSON.stringify([newAuction, ...readStoredAuctions()]))
  }

  const addNotification = (notification) => {
    if (typeof notification === 'string') {
      createNotification({ message: notification })
      return
    }
    createNotification(notification)
  }

  const handleNotificationsChange = (updatedNotifications) => {
    setNotifications(updatedNotifications)
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar
          user={user}
          onLogout={handleLogout}
          notifications={notifications}
          onNotificationsChange={handleNotificationsChange}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <main className="page-view">
          <Routes>
            <Route path="/" element={<HomePage auctions={auctionData} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auctions" element={<LiveAuctionsPage auctions={auctionData} />} />
            <Route
              path="/auctions/:id"
              element={
                <AuctionDetailPage
                  user={user}
                  auctions={auctionData}
                  onBidUpdate={updateAuctionState}
                  addNotification={addNotification}
                />
              }
            />
            <Route
              path="/my-bids"
              element={
                <ProtectedRoute user={user}>
                  <MyBidsPage user={currentUserProfile} auctions={auctionData} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/dashboard"
              element={
                <ProtectedRoute user={user}>
                  <SellerDashboardPage auctions={auctionData} onAuctionUpdate={updateAuctionState} addNotification={addNotification} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/create-auction"
              element={
                <ProtectedRoute user={user}>
                  <CreateAuctionPage user={currentUserProfile} onCreateAuction={handleCreateAuction} addNotification={addNotification} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seller/edit-auction/:id"
              element={
                <ProtectedRoute user={user}>
                  <EditAuctionPage auctions={auctionData} onAuctionUpdate={updateAuctionState} addNotification={addNotification} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/auction/:id/result"
              element={<AuctionResultPage auctions={auctionData} user={user} addNotification={addNotification} />}
            />
            <Route
              path="/payment/:id"
              element={<PaymentPage auctions={auctionData} user={user} addNotification={addNotification} />}
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute user={user}>
                  <ProfilePage user={currentUserProfile} auctions={auctionData} onProfileUpdate={handleProfileUpdate} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
