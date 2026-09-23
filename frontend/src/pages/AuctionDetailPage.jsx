import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AuctionDetails from '../components/AuctionDetails'
import BidBox from '../components/BidBox'
import BidHistory from '../components/BidHistory'
import StatusBadge from '../components/StatusBadge'
import { biddingApi } from '../api/biddingApi'
import { auctionApi } from '../api/auctionApi'

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN').format(amount)

function AuctionDetailPage({ user, auctions, onBidUpdate, addNotification }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [auction, setAuction] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [bidValue, setBidValue] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isEnded, setIsEnded] = useState(() => auction?.status === 'ENDED' || auction?.endTime <= Date.now())
  const [isOutbid, setIsOutbid] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setLoadError('')
    setAuction(null)

    auctionApi.getAuctionById(id)
      .then((loadedAuction) => {
        if (active) setAuction(loadedAuction)
      })
      .catch((requestError) => {
        if (active) setLoadError(requestError.message || 'Unable to load this auction.')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => { active = false }
  }, [id])

  useEffect(() => {
    setIsEnded(Boolean(auction && (auction.status === 'ENDED' || auction.endTime <= Date.now())))
    setBidValue('')
    setError('')
    setSuccess('')
    setIsOutbid(false)
    setImageFailed(false)
  }, [auction?.id, auction?.endTime, auction?.status])

  if (isLoading) {
    return <div className="container empty-state"><strong>Loading auction...</strong></div>
  }

  if (!auction || loadError) {
    return (
      <div className="container detail-not-found">
        <h1>Auction Not Found</h1>
        <p>{loadError || 'The auction you are looking for is no longer available.'}</p>
        <Link to="/auctions" className="btn btn-primary">Back to Live Auctions</Link>
      </div>
    )
  }

  const latestBid = auction.bidHistory?.[0]
  const currentUserIsHighest = Boolean(user && latestBid && (latestBid.bidderId === String(user.id) || latestBid.bidder === user.name))
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
      await biddingApi.placeBid({ auctionId: auction.id, amount, bidderName: user.id })
      const updatedAuction = {
        ...auction,
        currentBid: amount,
        bidCount: auction.bidCount + 1,
        bidHistory: [
          { bidder: user.name, bidderId: String(user.id), amount, time: 'just now' },
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
