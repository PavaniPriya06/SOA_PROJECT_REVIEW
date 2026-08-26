import CountdownTimer from './CountdownTimer'
import StatusBadge from './StatusBadge'

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN').format(amount)

function AuctionDetails({ auction, isEnded, onExpire }) {
  return (
    <>
      <div className="detail-header-row">
        <div>
          <span className="auction-category">{auction.category}</span>
          <h1>{auction.productName}</h1>
        </div>
        <StatusBadge status={isEnded ? 'ENDED' : auction.status} />
      </div>

      <div className="detail-price-grid">
        <div className="current-bid-panel">
          <span className="label">Current Highest Bid</span>
          <strong>₹{formatCurrency(auction.currentBid)}</strong>
        </div>
        <div>
          <span className="label">Starting Bid</span>
          <strong>₹{formatCurrency(auction.startingPrice)}</strong>
        </div>
        <div>
          <span className="label">Total Bids</span>
          <strong>{auction.bidCount}</strong>
        </div>
        <div>
          <span className="label">Countdown</span>
          <CountdownTimer endTime={auction.endTime} onExpire={onExpire} />
        </div>
      </div>

      <div className="auction-information detail-panel">
        <div className="panel-header">
          <h3>Auction Information</h3>
        </div>
        <dl className="auction-information-grid">
          <div><dt>Seller</dt><dd>{auction.seller || auction.sellerId || 'BidVelocity Seller'}</dd></div>
          <div><dt>Category</dt><dd>{auction.category}</dd></div>
          <div><dt>Starting Price</dt><dd>₹{formatCurrency(auction.startingPrice)}</dd></div>
          <div><dt>Current Bid</dt><dd>₹{formatCurrency(auction.currentBid)}</dd></div>
          <div><dt>Total Bids</dt><dd>{auction.bidCount}</dd></div>
          <div><dt>Auction Status</dt><dd>{isEnded ? 'ENDED' : auction.status}</dd></div>
          <div><dt>Start Time</dt><dd>{new Date(auction.startTime).toLocaleString()}</dd></div>
          <div><dt>End Time</dt><dd>{new Date(auction.endTime).toLocaleString()}</dd></div>
        </dl>
      </div>
    </>
  )
}

export default AuctionDetails
