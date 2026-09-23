import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import DashboardCard from '../components/DashboardCard'
import ConfirmationDialog from '../components/ConfirmationDialog'

const chartData = [
  { name: 'Jan', sales: 150000 },
  { name: 'Feb', sales: 180000 },
  { name: 'Mar', sales: 210000 },
  { name: 'Apr', sales: 245000 },
  { name: 'May', sales: 220000 },
  { name: 'Jun', sales: 280000 },
]

function SellerDashboardPage({ auctions, onAuctionUpdate, onAuctionClose, addNotification }) {
  const navigate = useNavigate()
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const [selectedAuctionToClose, setSelectedAuctionToClose] = useState(null)

  const handleViewAuction = (auctionId) => {
    navigate(`/auctions/${auctionId}`)
  }

  const handleEditAuction = (auctionId) => {
    navigate(`/seller/edit-auction/${auctionId}`)
  }

  const handleCloseClick = (auction) => {
    setSelectedAuctionToClose(auction)
    setShowCloseConfirm(true)
  }

  const handleConfirmClose = async () => {
    if (!selectedAuctionToClose || !onAuctionClose) return

    try {
      const closedAuction = await onAuctionClose(selectedAuctionToClose)
      addNotification?.({
        type: 'CLOSED',
        title: 'Auction closed',
        message: `Your auction for ${closedAuction.productName} has been closed.`,
      })
      setShowCloseConfirm(false)
      setSelectedAuctionToClose(null)
    } catch (error) {
      addNotification?.({ type: 'ERROR', title: 'Unable to close auction', message: error.message })
    }
  }

  const handleCancelClose = () => {
    setShowCloseConfirm(false)
    setSelectedAuctionToClose(null)
  }

  return (
    <div className="page-shell container">
      <div className="page-header-block seller-heading">
        <div>
          <span className="eyebrow">Seller analytics</span>
          <h1>Seller Dashboard</h1>
        </div>
        <Link className="btn btn-primary" to="/seller/create-auction">+ Create New Auction</Link>
      </div>

      <div className="stats-row dashboard-stats">
        <DashboardCard title="Total Auctions" value={24} subtitle="Portfolio size" />
        <DashboardCard title="Active Auctions" value={8} subtitle="Currently live" tone="primary" />
        <DashboardCard title="Completed Auctions" value={16} subtitle="Closed listings" tone="warning" />
        <DashboardCard title="Total Sales" value="₹8,45,000" subtitle="Gross revenue" tone="success" />
      </div>

      <div className="chart-card">
        <div className="panel-header">
          <h3>Sales Activity</h3>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#243047" vertical={false} />
            <XAxis dataKey="name" stroke="#8fa3bf" />
            <YAxis stroke="#8fa3bf" />
            <Tooltip />
            <Bar dataKey="sales" radius={[8, 8, 0, 0]} fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Current Bid</th>
              <th>Bids</th>
              <th>End Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {auctions.slice(0, 5).map((auction) => (
              <tr key={auction.id}>
                <td>{auction.productName}</td>
                <td>₹{auction.currentBid.toLocaleString('en-IN')}</td>
                <td>{auction.bidCount}</td>
                <td>{new Date(auction.endTime).toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${auction.status.toLowerCase()}`}>{auction.status}</span>
                </td>
                <td>
                  <div className="action-group">
                    <button className="text-button" onClick={() => handleViewAuction(auction.id)}>View</button>
                    <button className="text-button" onClick={() => handleEditAuction(auction.id)} disabled={auction.status === 'ENDED'}>Edit</button>
                    <button className="text-button danger" onClick={() => handleCloseClick(auction)} disabled={auction.status === 'ENDED'}>Close</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationDialog
        isOpen={showCloseConfirm}
        title="Close Auction?"
        message="Are you sure you want to close this auction? Bidding will no longer be allowed."
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
        cancelText="Cancel"
        confirmText="Close Auction"
        isDangerous={true}
      />
    </div>
  )
}

export default SellerDashboardPage
