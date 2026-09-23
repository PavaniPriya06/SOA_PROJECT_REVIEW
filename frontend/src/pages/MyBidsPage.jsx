import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CountdownTimer from '../components/CountdownTimer'
import StatusBadge from '../components/StatusBadge'
import DashboardCard from '../components/DashboardCard'

const filters = ['All', 'Active', 'Leading', 'Outbid', 'Won', 'Lost']
const formatCurrency = (amount) => new Intl.NumberFormat('en-IN').format(amount)

function MyBidsPage({ user, auctions }) {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [, setClock] = useState(Date.now())
  const currentUser = user

  useEffect(() => {
    const interval = setInterval(() => setClock(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const userBids = useMemo(() => {
    if (!currentUser) return []

    return auctions
      .map((auction) => {
        const bids = (auction.bidHistory || []).filter((bid) => bid.bidderId === String(currentUser.id) || bid.bidder === currentUser.name)
        if (bids.length === 0) return null

        const highestUserBid = Math.max(...bids.map((bid) => Number(bid.amount)))
        const ended = auction.status === 'ENDED' || auction.endTime <= Date.now()
        const userIsHighest = highestUserBid === Number(auction.currentBid)
        const status = ended ? (userIsHighest ? 'WON' : 'LOST') : (userIsHighest ? 'LEADING' : 'OUTBID')

        return { auction, highestUserBid, status, userBidCount: bids.length }
      })
      .filter(Boolean)
  }, [auctions, currentUser, setClock])

  const visibleBids = useMemo(() => {
    const normalizedSearch = search.toLowerCase().trim()
    return userBids.filter(({ auction, status }) => {
      const matchesSearch = auction.productName.toLowerCase().includes(normalizedSearch)
      const matchesFilter = filter === 'All'
        || (filter === 'Active' && ['LEADING', 'OUTBID'].includes(status))
        || status === filter.toUpperCase()
      return matchesSearch && matchesFilter
    })
  }, [filter, search, userBids])

  const summary = useMemo(() => ({
    total: userBids.reduce((total, bid) => total + bid.userBidCount, 0),
    active: userBids.filter((bid) => ['LEADING', 'OUTBID'].includes(bid.status)).length,
    won: userBids.filter((bid) => bid.status === 'WON').length,
    lost: userBids.filter((bid) => bid.status === 'LOST').length,
  }), [userBids])

  if (!currentUser) {
    return <div className="container empty-state"><strong>Please login to view your bids.</strong><Link to="/login" className="btn btn-primary">Login</Link></div>
  }

  return (
    <div className="page-shell container my-bids-page">
      <div className="page-header-block my-bids-header">
        <div>
          <span className="eyebrow">Your activity</span>
          <h1>My Bids</h1>
          <p>Track your bidding activity, current position and auction results.</p>
        </div>
      </div>

      <div className="stats-row my-bids-summary">
        <DashboardCard title="Total Bids" value={summary.total} subtitle="Your submitted bids" />
        <DashboardCard title="Active Bids" value={summary.active} subtitle="Still in play" tone="primary" />
        <DashboardCard title="Auctions Won" value={summary.won} subtitle="Successful outcomes" tone="success" />
        <DashboardCard title="Auctions Lost" value={summary.lost} subtitle="Another bidder led" tone="warning" />
      </div>

      <div className="my-bids-toolbar">
        <div className="filter-tabs" role="tablist" aria-label="Filter my bids">
          {filters.map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={filter === option}
              className={`tab-button ${filter === option ? 'active' : ''}`}
              onClick={() => setFilter(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="search-field my-bids-search">
          <span>⌕</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search my bids..." aria-label="Search my bids" />
        </div>
      </div>

      {visibleBids.length === 0 ? (
        <div className="empty-state my-bids-empty">
          <strong>No bids yet</strong>
          <span>{userBids.length === 0 ? 'Explore live auctions and place your first bid.' : 'No bids match your current filter.'}</span>
          <Link to="/auctions" className="btn btn-primary">Explore Auctions</Link>
        </div>
      ) : (
        <div className="my-bids-list">
          {visibleBids.map(({ auction, highestUserBid, status, userBidCount }) => {
            const isEnded = status === 'WON' || status === 'LOST'
            return (
              <article className="my-bid-card" key={auction.id}>
                <img src={auction.image} alt={auction.productName} className="my-bid-image" />
                <div className="my-bid-main">
                  <div className="my-bid-title-row">
                    <div>
                      <span className="auction-category">{auction.category}</span>
                      <h2>{auction.productName}</h2>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  <div className="my-bid-values">
                    <div><span>Your highest bid</span><strong>₹{formatCurrency(highestUserBid)}</strong></div>
                    <div><span>{isEnded ? 'Winning bid' : 'Current highest bid'}</span><strong>₹{formatCurrency(auction.currentBid)}</strong></div>
                    <div><span>Number of bids</span><strong>{auction.bidCount}</strong></div>
                    <div><span>Auction end time</span><strong>{isEnded ? 'Auction ended' : <CountdownTimer endTime={auction.endTime} />}</strong></div>
                  </div>
                  <p className={`my-bid-message ${status.toLowerCase()}`}>
                    {status === 'LEADING' && 'You are currently the highest bidder.'}
                    {status === 'OUTBID' && 'You have been outbid.'}
                    {status === 'WON' && 'Congratulations! You won this auction.'}
                    {status === 'LOST' && 'Another bidder won this auction.'}
                  </p>
                </div>
                <div className="my-bid-actions">
                  {status === 'OUTBID' && <Link to={`/auctions/${auction.id}`} className="btn btn-primary">Bid Again</Link>}
                  {status === 'WON' && <Link to={`/payment/${auction.id}`} className="btn btn-primary">Proceed to Payment</Link>}
                  {status === 'LOST' && <Link to={`/auction/${auction.id}/result`} className="btn btn-secondary">View Result</Link>}
                  {status === 'LEADING' && <Link to={`/auctions/${auction.id}`} className="btn btn-secondary">View Auction</Link>}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyBidsPage
