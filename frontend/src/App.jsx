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
import { auctionApi } from './api/auctionApi'
import { authApi } from './api/authApi'
import './App.css'

const readStoredUser = () => {
  if (localStorage.getItem('bidvelocity_authenticated') !== 'true') return null

  try {
    return JSON.parse(localStorage.getItem('bidvelocity_current_user') || 'null')
  } catch {
    return null
  }
}

function App() {
  const [user, setUser] = useState(readStoredUser)
  const [auctionData, setAuctionData] = useState([])
  const [isLoadingAuctions, setIsLoadingAuctions] = useState(true)
  const [auctionError, setAuctionError] = useState('')
  const [notifications, setNotifications] = useState(readNotifications)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    let active = true
    auctionApi.getAuctions()
      .then((auctions) => {
        if (active) setAuctionData(auctions)
      })
      .catch((error) => {
        if (active) setAuctionError(error.message)
      })
      .finally(() => {
        if (active) setIsLoadingAuctions(false)
      })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const syncNotifications = () => setNotifications(readNotifications())
    window.addEventListener('bidvelocity-notification', syncNotifications)
    return () => window.removeEventListener('bidvelocity-notification', syncNotifications)
  }, [])

  const currentUserProfile = useMemo(() => user, [user])

  const handleLogin = (loggedUser) => {
    setUser(loggedUser)
    setMobileOpen(false)
  }

  const handleLogout = () => {
    authApi.clearSession()
    setUser(null)
  }

  const handleProfileUpdate = (updatedUser) => {
    setUser(updatedUser)
  }

  const updateAuctionState = (updatedAuction) => {
    setAuctionData((current) =>
      current.map((auction) => (auction.id === updatedAuction.id ? updatedAuction : auction)),
    )
  }

  const handleCloseAuction = async (auction) => {
    const closedAuction = await auctionApi.closeAuction(auction.id)
    updateAuctionState({ ...auction, ...closedAuction, status: 'ENDED' })
    return closedAuction
  }

  const handleCreateAuction = (newAuction) => {
    setAuctionData((current) => [newAuction, ...current])
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

  if (isLoadingAuctions) return <div className="container empty-state"><strong>Loading auctions...</strong></div>
  if (auctionError) return <div className="container empty-state"><strong>Unable to load auctions</strong><span>{auctionError}</span></div>

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
                  <SellerDashboardPage auctions={auctionData} onAuctionUpdate={updateAuctionState} onAuctionClose={handleCloseAuction} addNotification={addNotification} />
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
