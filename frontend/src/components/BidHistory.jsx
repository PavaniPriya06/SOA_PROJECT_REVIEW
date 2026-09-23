const formatCurrency = (amount) => new Intl.NumberFormat('en-IN').format(amount)

function BidHistory({ bids, currentUserBid, highestLabel = 'Highest' }) {
  return (
    <div className="bid-history-panel">
      <div className="panel-header">
        <h3>Bid History</h3>
      </div>

      <div className="bid-history-list">
        {bids && bids.length > 0 ? (
          bids.map((bid, index) => (
            <div
              key={`${bid.bidder}-${bid.amount}-${index}`}
              className={`bid-row ${bid.bidder === currentUserBid ? 'current-user' : ''}`}
            >
              <span className="bidder-name">{bid.bidder}</span>
              <span className="bid-amount">₹{formatCurrency(bid.amount)}</span>
              <span className="bid-time">{bid.time}{index === 0 && <strong className="highest-bid-label">{highestLabel}</strong>}</span>
            </div>
          ))
        ) : (
          <p className="muted">No bids placed yet.</p>
        )}
      </div>
    </div>
  )
}

export default BidHistory
