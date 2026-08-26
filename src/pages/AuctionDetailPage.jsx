import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AuctionDetails from '../components/AuctionDetails'
import BidBox from '../components/BidBox'
import BidHistory from '../components/BidHistory'
import StatusBadge from '../components/StatusBadge'
import { biddingApi } from '../api/biddingApi'

const marketplaceDetails = {
  'iphone-16-pro': { productName: 'iPhone 16 Pro', category: 'Electronics', startingPrice: 50000, currentBid: 62000, bidCount: 18 },
  'macbook-pro-m4': { productName: 'MacBook Pro M4', category: 'Laptops', startingPrice: 70000, currentBid: 86000, bidCount: 24 },
  'playstation-5': { productName: 'PlayStation 5', category: 'Gaming', startingPrice: 35000, currentBid: 42000, bidCount: 15 },
  'sony-alpha-a7': { productName: 'Sony Alpha Camera', category: 'Cameras', startingPrice: 45000, currentBid: 57000, bidCount: 12 },
  'gaming-laptop': { productName: 'Gaming Laptop', category: 'Laptops', startingPrice: 60000, currentBid: 78000, bidCount: 21 },
  'vintage-watch': { productName: 'Premium Watch', category: 'Collectibles', startingPrice: 25000, currentBid: 38000, bidCount: 9 },
}

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN').format(amount)

function AuctionDetailPage({ user, auctions, onBidUpdate, addNotification }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const sourceAuction = useMemo(() => auctions.find((item) => item.id === id), [auctions, id])
  const auction = useMemo(() => {
    if (!sourceAuction) return null

    const curatedDetails = marketplaceDetails[id]
    if (!curatedDetails) return sourceAuction

    const hasLiveBidUpdate = sourceAuction.bidHistory?.length > 4 || sourceAuction.currentBid !== curatedDetails.currentBid
    return {
      ...sourceAuction,
      ...curatedDetails,
      ...(hasLiveBidUpdate ? {
        currentBid: sourceAuction.currentBid,
        bidCount: sourceAuction.bidCount,
        bidHistory: sourceAuction.bidHistory,
      } : {}),
    }
  }, [sourceAuction, id])
  const [bidValue, setBidValue] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEnded, setIsEnded] = useState(() => auction?.status === 'ENDED' || auction?.endTime <= Date.now())
  const [isOutbid, setIsOutbid] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setIsEnded(Boolean(auction && (auction.status === 'ENDED' || auction.endTime <= Date.now())))
    setBidValue('')
    setError('')
    setSuccess('')
    setIsOutbid(false)
    setImageFailed(false)
  }, [auction?.id, auction?.endTime, auction?.status])

  useEffect(() => {
    if (!user || !auction || auction.status !== 'LIVE' || auction.endTime <= Date.now()) return undefined

    const interval = setInterval(() => {
      const latestBid = auction.bidHistory?.[0]
      if (latestBid?.bidder !== user.name) return

      const amount = auction.currentBid + 1000
      if (amount > 1000000) return

      const updatedAuction = {
        ...auction,
        currentBid: amount,
        bidCount: auction.bidCount + 1,
        bidHistory: [
          { bidder: 'Another bidder', amount, time: 'just now' },
          ...(auction.bidHistory || []),
        ],
      }
      onBidUpdate(updatedAuction)
      setIsOutbid(true)
      setSuccess('')
      addNotification({
        type: 'OUTBID',
        title: 'You have been outbid',
        message: `You have been outbid on ${auction.productName}.`,
        link: `/auctions/${auction.id}`,
      })
    }, 15000)

    return () => clearInterval(interval)
  }, [addNotification, auction, onBidUpdate, user])

  if (!auction) {
    return (
      <div className="container detail-not-found">
        <h1>Auction Not Found</h1>
        <p>The auction you are looking for is no longer available.</p>
        <Link to="/auctions" className="btn btn-primary">Back to Live Auctions</Link>
      </div>
    )
  }

  const latestBid = auction.bidHistory?.[0]
  const currentUserIsHighest = Boolean(user && latestBid?.bidder === user.name)
  const canBid = !isEnded && auction.status === 'LIVE' && auction.startTime <= Date.now()

  const handleExpire = () => {
    setIsEnded(true)
    onBidUpdate({ ...auction, status: 'ENDED' })
  }

  const handlePlaceBid = async () => {
    if (!user) {
      setError('Please login to place a bid.')
      setSuccess('')
      return
    }

    if (!bidValue.trim()) {
      setError('Please enter a bid amount.')
      setSuccess('')
      return
    }

    const amount = Number(bidValue)
    if (!Number.isInteger(amount) || amount <= 0) {
      setError('Bid must be a valid positive whole number.')
      setSuccess('')
      return
    }
    if (amount > 1000000) {
      setError('Maximum allowed bid for this demo is ₹10,00,000.')
      setSuccess('')
      return
    }
    if (amount <= auction.currentBid) {
      setError(`Bid must be higher than ₹${formatCurrency(auction.currentBid)}.`)
      setSuccess('')
      return
    }

    try {
      await biddingApi.placeBid({ auctionId: auction.id, amount, bidderName: user.name })
      const updatedAuction = {
        ...auction,
        currentBid: amount,
        bidCount: auction.bidCount + 1,
        bidHistory: [
          { bidder: user.name, amount, time: 'just now' },
          ...(auction.bidHistory || []),
        ],
      }
      onBidUpdate(updatedAuction)
      setBidValue('')
      setError('')
      setIsOutbid(false)
      setSuccess('Bid placed successfully!')
      addNotification({
        type: 'BID',
        title: 'Bid placed',
        message: `You are now leading on ${auction.productName}.`,
        link: `/auctions/${auction.id}`,
      })
    } catch (requestError) {
      setError(requestError.message || 'Bid failed.')
      setSuccess('')
    }
  }

  return (
    <div className="container detail-page">
      <div className="auction-breadcrumb">
        <Link to="/">Home</Link><span>/</span><Link to="/auctions">Live Auctions</Link><span>/</span><strong>Auction Details</strong>
      </div>

      <div className="detail-layout">
        <div className="detail-gallery">
          <div className="detail-image-frame">
            {imageFailed || !auction.image ? (
              <div className="image-placeholder" role="img" aria-label="No image available">No image available</div>
            ) : (
              <img src={auction.image} alt={auction.productName} className="main-image" onError={() => setImageFailed(true)} />
            )}
            <StatusBadge status={isEnded ? 'ENDED' : auction.status} />
          </div>
          <div className="thumb-row">
            {(auction.images?.length ? auction.images : auction.image ? [auction.image] : []).map((image, index) => (
              <img key={`${image}-${index}`} src={image} alt={`${auction.productName} view ${index + 1}`} onError={(event) => { event.currentTarget.style.display = 'none' }} />
            ))}
          </div>

          <div className="detail-panel product-identity-panel">
            <span className="auction-category">{auction.category}</span>
            <h2>{auction.productName}</h2>
            <p><span className="label">Seller</span> <strong>{auction.seller || auction.sellerId || 'BidVelocity Seller'}</strong></p>
          </div>

          <div className="detail-panel">
            <h3>Product Description</h3>
            <p>{auction.description}</p>
          </div>

          <div className="detail-panel">
            <h3>Product Specifications</h3>
            {auction.specs?.length ? (
              <ul className="spec-list">{auction.specs.map((spec) => <li key={spec}>{spec}</li>)}</ul>
            ) : <p className="muted">Seller specifications are not available.</p>}
          </div>
        </div>

        <aside className="detail-sidebar">
          <AuctionDetails auction={auction} isEnded={isEnded} onExpire={handleExpire} />

          <BidBox
            currentBid={auction.currentBid}
            onBidSubmit={handlePlaceBid}
            disabled={!canBid}
            loginRequired={!user}
            onLogin={() => navigate('/login')}
            bidValue={bidValue}
            setBidValue={(value) => { setBidValue(value); setError(''); setSuccess('') }}
            error={error}
            success={success}
            minBid={auction.currentBid + 1}
          />

          {user && (currentUserIsHighest && !isOutbid ? (
            <p className="bidder-status success-copy">You are currently the highest bidder.</p>
          ) : isOutbid ? (
            <p className="bidder-status warning-copy">You have been outbid.</p>
          ) : null)}

          <BidHistory bids={auction.bidHistory} currentUserBid={user?.name || ''} />

          {isEnded && (
            <Link to={`/auction/${auction.id}/result`} className="btn btn-primary full-width">
              View Auction Result
            </Link>
          )}
          <Link to="/auctions" className="btn btn-secondary full-width">Back to Auctions</Link>
        </aside>
      </div>
    </div>
  )
}

export default AuctionDetailPage
