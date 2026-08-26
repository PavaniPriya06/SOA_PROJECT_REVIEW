import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import { paymentApi } from '../api/paymentApi'

const formatCurrency = (amount) => new Intl.NumberFormat('en-IN').format(amount)
const methods = ['UPI', 'Credit / Debit Card', 'Net Banking']
const banks = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank']

function PaymentPage({ auctions, user, addNotification }) {
  const { id } = useParams()
  const auction = useMemo(() => auctions.find((item) => item.id === id), [auctions, id])
  const [method, setMethod] = useState('UPI')
  const [form, setForm] = useState({ upiId: '', cardNumber: '', expiry: '', cvv: '', cardHolder: '', bank: '' })
  const [errors, setErrors] = useState({})
  const [paymentState, setPaymentState] = useState({ status: '', payment: null })
  const [imageFailed, setImageFailed] = useState(false)

  const resolution = useMemo(() => {
    if (!auction) return null
    const validBids = (auction.bidHistory || [])
      .map((bid, index) => ({ ...bid, amount: Number(bid.amount), originalIndex: index }))
      .filter((bid) => Number.isFinite(bid.amount) && bid.amount > 0)
      .sort((firstBid, secondBid) => secondBid.amount - firstBid.amount || firstBid.originalIndex - secondBid.originalIndex)
    return {
      winner: validBids[0],
      ended: auction.status === 'ENDED' || auction.endTime <= Date.now(),
    }
  }, [auction])

  if (!auction || !resolution) {
    return (
      <div className="container detail-not-found">
        <h1>Auction Not Found</h1>
        <p>The auction you are looking for is no longer available.</p>
        <Link to="/auctions" className="btn btn-primary">Back to Auctions</Link>
      </div>
    )
  }

  const isWinner = Boolean(user && resolution.winner && resolution.winner.bidder === user.name)
  const amount = resolution.winner?.amount || auction.currentBid || 0

  if (!resolution.ended) {
    return (
      <div className="page-shell container payment-page">
        <div className="payment-access-card">
          <span className="eyebrow">Payment pending</span>
          <h1>Payment is not available yet.</h1>
          <p>Complete payment after the auction has ended and the winner is confirmed.</p>
          <Link to={`/auctions/${auction.id}`} className="btn btn-primary">Back to Auction</Link>
        </div>
      </div>
    )
  }

  if (!isWinner) {
    return (
      <div className="page-shell container payment-page">
        <div className="payment-access-card">
          <span className="eyebrow">Checkout restricted</span>
          <h1>Payment Unavailable</h1>
          <p>Only the auction winner can make this payment.</p>
          <Link to="/auctions" className="btn btn-secondary">Back to Auctions</Link>
        </div>
      </div>
    )
  }

  if (paymentState.status === 'SUCCESS') {
    const payment = paymentState.payment
    return (
      <div className="page-shell container payment-page">
        <div className="payment-success-card">
          <div className="payment-success-icon" aria-hidden="true">✓</div>
          <span className="eyebrow">Payment complete</span>
          <h1>Payment Successful</h1>
          <p>Your payment has been successfully processed.</p>
          <div className="payment-receipt-grid">
            <div><span>Payment ID</span><strong>{payment.paymentId}</strong></div>
            <div><span>Auction ID</span><strong>{payment.auctionId}</strong></div>
            <div><span>Product</span><strong>{auction.productName}</strong></div>
            <div><span>Amount Paid</span><strong>₹{formatCurrency(payment.amount)}</strong></div>
            <div><span>Payment Method</span><strong>{payment.method}</strong></div>
            <div><span>Date &amp; Time</span><strong>{new Date(payment.timestamp).toLocaleString()}</strong></div>
          </div>
          <div className="payment-success-actions">
            <Link to="/my-bids" className="btn btn-primary">View My Purchase</Link>
            <Link to="/" className="btn btn-secondary">Back to Home</Link>
          </div>
        </div>
      </div>
    )
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
    setPaymentState({ status: '', payment: null })
  }

  const validate = () => {
    const nextErrors = {}
    if (method === 'UPI' && !form.upiId.trim()) nextErrors.upiId = 'UPI ID is required.'
    if (method === 'Credit / Debit Card') {
      if (!form.cardNumber.trim()) nextErrors.cardNumber = 'Card number is required.'
      if (!form.expiry.trim()) nextErrors.expiry = 'Expiry date is required.'
      if (!form.cvv.trim()) nextErrors.cvv = 'CVV is required.'
      if (!form.cardHolder.trim()) nextErrors.cardHolder = 'Card holder name is required.'
    }
    if (method === 'Net Banking' && !form.bank) nextErrors.bank = 'Please select a bank.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handlePay = async () => {
    if (!validate()) return
    setPaymentState({ status: 'PROCESSING', payment: null })

    try {
      const result = await paymentApi.processPayment({ amount, method, buyerName: user.name })
      const payment = {
        paymentId: result.receipt,
        auctionId: auction.id,
        userId: user.id,
        amount,
        method,
        status: 'SUCCESS',
        timestamp: new Date().toISOString(),
      }
      let payments = []
      try {
        payments = JSON.parse(localStorage.getItem('bidvelocity_payments') || '[]')
      } catch {
        payments = []
      }
      localStorage.setItem('bidvelocity_payments', JSON.stringify([...payments, payment]))
      addNotification?.({
        type: 'PAYMENT',
        title: 'Payment successful',
        message: `Payment successful for ${auction.productName}.`,
        link: `/payment/${auction.id}`,
      })
      setPaymentState({ status: 'SUCCESS', payment })
    } catch {
      setPaymentState({ status: 'FAILED', payment: null })
    }
  }

  return (
    <div className="page-shell container payment-page">
      <div className="payment-header">
        <span className="eyebrow">Secure checkout</span>
        <h1>Complete Your Payment</h1>
        <p>Secure your winning bid and complete your purchase.</p>
      </div>

      <div className="payment-checkout-layout">
        <section className="payment-order-card">
          <div className="panel-header"><h2>Order Summary</h2></div>
          {imageFailed || !auction.image ? (
            <div className="payment-image-placeholder">No image available</div>
          ) : (
            <img src={auction.image} alt={auction.productName} onError={() => setImageFailed(true)} />
          )}
          <span className="auction-category">{auction.category}</span>
          <h2>{auction.productName}</h2>
          <div className="order-summary-lines">
            <div><span>Winning Bid</span><strong>₹{formatCurrency(amount)}</strong></div>
            <div><span>Winner</span><strong>{user.name}</strong></div>
            <div><span>Auction ID</span><strong>{auction.id}</strong></div>
            <div><span>Auction Status</span><strong><StatusBadge status="WON" /></strong></div>
          </div>
          <div className="secure-payment-note"><strong>🔒 Secure payment processing</strong><span>This is a demo payment interface. No real money is charged.</span></div>
        </section>

        <section className="payment-form-card">
          <div className="panel-header"><h2>Buyer Information</h2></div>
          <div className="buyer-information"><div><span>Full Name</span><strong>{user.name}</strong></div><div><span>Email</span><strong>{user.email}</strong></div></div>
          <div className="panel-header payment-method-heading"><h2>Payment Method</h2></div>
          <div className="payment-methods" role="tablist" aria-label="Payment methods">
            {methods.map((option) => <button key={option} type="button" role="tab" aria-selected={method === option} className={`method-button ${method === option ? 'selected' : ''}`} onClick={() => { setMethod(option); setErrors({}); setPaymentState({ status: '', payment: null }) }}>{option}</button>)}
          </div>

          <div className="payment-inputs">
            {method === 'UPI' && <div className="field"><label htmlFor="upiId">UPI ID</label><input id="upiId" name="upiId" value={form.upiId} onChange={updateField} placeholder="example@upi" />{errors.upiId && <span className="field-error">{errors.upiId}</span>}</div>}
            {method === 'Credit / Debit Card' && <>
              <div className="field"><label htmlFor="cardNumber">Card Number</label><input id="cardNumber" name="cardNumber" inputMode="numeric" value={form.cardNumber} onChange={updateField} placeholder="XXXX XXXX XXXX XXXX" />{errors.cardNumber && <span className="field-error">{errors.cardNumber}</span>}</div>
              <div className="field-grid"><div className="field"><label htmlFor="expiry">Expiry Date</label><input id="expiry" name="expiry" value={form.expiry} onChange={updateField} placeholder="MM/YY" />{errors.expiry && <span className="field-error">{errors.expiry}</span>}</div><div className="field"><label htmlFor="cvv">CVV</label><input id="cvv" name="cvv" type="password" value={form.cvv} onChange={updateField} placeholder="***" />{errors.cvv && <span className="field-error">{errors.cvv}</span>}</div></div>
              <div className="field"><label htmlFor="cardHolder">Card Holder Name</label><input id="cardHolder" name="cardHolder" value={form.cardHolder} onChange={updateField} placeholder="Name" />{errors.cardHolder && <span className="field-error">{errors.cardHolder}</span>}</div>
            </>}
            {method === 'Net Banking' && <div className="field"><label htmlFor="bank">Select Bank</label><select id="bank" name="bank" value={form.bank} onChange={updateField}><option value="">Choose your bank</option>{banks.map((bank) => <option key={bank}>{bank}</option>)}</select>{errors.bank && <span className="field-error">{errors.bank}</span>}</div>}
          </div>

          {paymentState.status === 'FAILED' && <div className="payment-failure"><strong>Payment Failed</strong><span>Something went wrong while processing your payment.</span><button type="button" className="btn btn-secondary" onClick={() => setPaymentState({ status: '', payment: null })}>Try Again</button><Link to={`/auction/${auction.id}/result`} className="text-link">Back to Auction Result</Link></div>}
          <button type="button" className="btn btn-primary full-width payment-submit" onClick={handlePay} disabled={paymentState.status === 'PROCESSING'}>{paymentState.status === 'PROCESSING' ? 'Processing Payment...' : `Pay ₹${formatCurrency(amount)}`}</button>
        </section>
      </div>
    </div>
  )
}

export default PaymentPage
