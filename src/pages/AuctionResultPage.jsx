import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BidHistory from '../components/BidHistory'
import CountdownTimer from '../components/CountdownTimer'
import StatusBadge from '../components/StatusBadge'

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN').format(amount)

function AuctionResultPage({ auctions, user, addNotification }) {
  const { id } = useParams()
  const auction = useMemo(() => auctions.find((item) => item.id === id), [auctions, id])
  const [imageFailed, setImageFailed] = useState(false)
  const winnerNotificationSent = useRef(false)

  const resolution = useMemo(() => {
    if (!auction) return null

    const validBids = (auction.bidHistory || [])
      .map((bid, index) => ({ ...bid, amount: Number(bid.amount), originalIndex: index }))
      .filter((bid) => Number.isFinite(bid.amount) && bid.amount > 0)
      .sort((firstBid, secondBid) => {
        if (secondBid.amount !== firstBid.amount) return secondBid.amount - firstBid.amount
        return firstBid.originalIndex - secondBid.originalIndex
      })

    return {
      validBids,
      winner: validBids[0] || null,
      secondHighest: validBids[1] || null,
      ended: auction.status === 'ENDED' || auction.endTime <= Date.now(),
    }
  }, [auction])

  if (!auction || !resolution) {
    return (
      <div className="container detail-not-found">
        <h1>Auction Not Found</h1>
        <p>The auction you are looking for is no longer available.</p>
        <Link to="/auctions" className="btn btn-primary">Back to Live Auctions</Link>
      </div>
    )
  }

  const winnerName = resolution.winner?.bidder || 'No winner'
  const isWinner = Boolean(user && resolution.winner?.bidder === user.name)
  const winningAmount = resolution.winner?.amount || auction.currentBid || 0

  useEffect(() => {
    if (resolution.ended && isWinner && !winnerNotificationSent.current) {
      winnerNotificationSent.current = true
      addNotification?.({
        type: 'WON',
        title: 'Auction won',
        message: `Congratulations! You won the ${auction.productName} auction.`,
        link: `/auction/${auction.id}/result`,
      })
    }
  }, [addNotification, auction, isWinner, resolution.ended])

  if (!resolution.ended) {
    return (
      <div className="page-shell container result-page">
        <div className="result-card active-result-card">
          <div className="result-kicker"><span className="eyebrow">Auction in progress</span><StatusBadge status="LIVE" /></div>
          <h1>Auction is still active.</h1>
          <p className="result-lead">The final result will be available after bidding ends.</p>
          <div className="active-result-details">
            {imageFailed || !auction.image ? (
              <div className="result-image-placeholder">No image available</div>
            ) : (
              <img src={auction.image} alt={auction.productName} onError={() => setImageFailed(true)} />
            )}
            <div>
              <span className="auction-category">{auction.category}</span>
              <h2>{auction.productName}</h2>
              <p>Current bid: <strong>₹{formatCurrency(auction.currentBid)}</strong></p>
              <CountdownTimer endTime={auction.endTime} />
              <Link to={`/auctions/${auction.id}`} className="btn btn-primary result-action">Back to Auction</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const sortedHistory = resolution.validBids.map(({ originalIndex, ...bid }) => bid)

  return (
    <div className="page-shell container result-page">
      <div className="result-card">
        <div className="result-title-row">
          <div>
            <span className="eyebrow">Auction closed</span>
            <h1>Final Auction Result</h1>
          </div>
          <StatusBadge status="ENDED" />
        </div>

        <div className="result-hero">
          {imageFailed || !auction.image ? (
            <div className="result-image-placeholder">No image available</div>
          ) : (
            <img src={auction.image} alt={auction.productName} onError={() => setImageFailed(true)} />
          )}
          <div className="result-product-copy">
            <span className="auction-category">{auction.category}</span>
            <h2>{auction.productName}</h2>
            <div className="result-facts">
              <div><span>Winning Bid</span><strong>₹{formatCurrency(winningAmount)}</strong></div>
              <div><span>Winning Bidder</span><strong>{winnerName}</strong></div>
              <div><span>Total Bids</span><strong>{auction.bidCount || sortedHistory.length}</strong></div>
            </div>
          </div>
        </div>

        {isWinner ? (
          <section className="winner-result-card">
            <span className="result-icon" aria-hidden="true">🏆</span>
            <div>
              <h2>Congratulations!</h2>
              <p>You won this auction.</p>
              <strong>Winning Bid: ₹{formatCurrency(winningAmount)}</strong>
              <span>Complete your payment to confirm the purchase.</span>
            </div>
            <Link to={`/payment/${auction.id}`} className="btn btn-primary">Proceed to Payment</Link>
          </section>
        ) : (
          <section className="loser-result-card">
            <div>
              <h2>Auction Completed</h2>
              <p>You did not win this auction.</p>
              <strong>Winning Bid: ₹{formatCurrency(winningAmount)}</strong>
              <span>Winner: {winnerName}</span>
            </div>
            <Link to="/auctions" className="btn btn-secondary">Browse More Auctions</Link>
          </section>
        )}

        <section className="result-summary-section">
          <div className="panel-header"><h2>Bid Summary</h2></div>
          <div className="result-summary-grid">
            <div><span>Highest Bid</span><strong>₹{formatCurrency(winningAmount)}</strong></div>
            <div><span>Second Highest Bid</span><strong>₹{formatCurrency(resolution.secondHighest?.amount || 0)}</strong></div>
            <div><span>Total Bids</span><strong>{auction.bidCount || sortedHistory.length}</strong></div>
            <div><span>Auction Started</span><strong>{new Date(auction.startTime).toLocaleString()}</strong></div>
            <div><span>Auction Ended</span><strong>{new Date(auction.endTime).toLocaleString()}</strong></div>
          </div>
        </section>

        <div className="result-history-section">
          <BidHistory bids={sortedHistory} currentUserBid={user?.name || ''} highestLabel="Winning Bid" />
        </div>
      </div>
    </div>
  )
}

export default AuctionResultPage
