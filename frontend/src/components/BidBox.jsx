function BidBox({ currentBid, onBidSubmit, disabled, bidValue, setBidValue, error, success, minBid, loginRequired, onLogin }) {
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN').format(amount)
  const handleBidChange = (event) => {
    const { value } = event.target
    if (!/^\d*$/.test(value)) return
    setBidValue(value.slice(0, 7))
  }

  return (
    <div className="bid-box">
      <div className="bid-box-heading">
        <span className="eyebrow">Live bidding</span>
        <h2>Place Your Bid</h2>
      </div>
      <div className="label-row">
        <span className="label">Current Bid</span>
        <span className="current-bid">₹{formatCurrency(currentBid)}</span>
      </div>

      <p className="minimum-bid">Minimum acceptable bid: <strong>₹{formatCurrency(minBid)}</strong></p>

      <label className="input-label" htmlFor="bid-input">Enter your bid amount</label>
      <div className="bid-input-row">
        <span className="currency-symbol">₹</span>
        <input
          id="bid-input"
          type="number"
          min="0"
          max="1000000"
          step="1"
          inputMode="numeric"
          value={bidValue}
          onChange={handleBidChange}
          onKeyDown={(event) => {
            if (['e', 'E', '+', '-', '.', ','].includes(event.key)) event.preventDefault()
          }}
          placeholder="Enter your bid"
          disabled={disabled || loginRequired}
        />
      </div>

      {loginRequired ? (
        <>
          <p className="form-error">Please login to place a bid.</p>
          <button className="btn btn-primary full-width" onClick={onLogin} type="button">
            Login to Bid
          </button>
        </>
      ) : (
        <button className="btn btn-primary full-width" onClick={onBidSubmit} disabled={disabled} type="button">
          PLACE BID
        </button>
      )}

      {error && <p className="form-error">{error}</p>}
      {success && <p className="form-success">{success}</p>}
    </div>
  )
}

export default BidBox
