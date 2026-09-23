import { useState } from 'react'
import { Link } from 'react-router-dom'
import CountdownTimer from './CountdownTimer'
import StatusBadge from './StatusBadge'

function AuctionCard({ auction }) {
  const [imageFailed, setImageFailed] = useState(!auction.image)
  const [isEnded, setIsEnded] = useState(auction.status === 'ENDED' || auction.endTime <= Date.now())
  const status = isEnded ? 'ENDED' : 'LIVE'

  return (
    <article className="auction-card">
      <div className="auction-media">
        {imageFailed ? (
          <div className="auction-image-placeholder" role="img" aria-label="No image available">
            No image available
          </div>
        ) : (
          <img src={auction.image} alt={auction.productName} onError={() => setImageFailed(true)} />
        )}
        <StatusBadge status={status} />
      </div>

      <div className="auction-content">
        <div className="auction-header-row">
          <span className="auction-category">{auction.category}</span>
          <span className="auction-bids">{auction.bidCount} bids</span>
        </div>

        <h3>{auction.productName}</h3>

        <div className="auction-pricing">
          <div>
            <span className="label">Starting</span>
            <strong>₹{auction.startingPrice.toLocaleString('en-IN')}</strong>
          </div>
          <div>
            <span className="label">Current</span>
            <strong>₹{auction.currentBid.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div className="auction-meta">
          <CountdownTimer endTime={auction.endTime} onExpire={() => setIsEnded(true)} />
        </div>

        {isEnded ? (
          <button type="button" className="btn btn-secondary full-width" disabled>
            Auction Ended
          </button>
        ) : (
          <Link to={`/auctions/${auction.id}`} className="btn btn-primary full-width">
            View Auction
          </Link>
        )}
      </div>
    </article>
  )
}

export default AuctionCard
