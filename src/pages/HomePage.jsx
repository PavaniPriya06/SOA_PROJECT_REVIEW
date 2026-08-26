import { Link } from 'react-router-dom'
import AuctionCard from '../components/AuctionCard'

function HomePage({ auctions }) {
  const featuredAuctions = auctions.slice(0, 3)

  return (
    <div className="page-shell">
      <section className="hero-section container">
        <div className="hero-copy">
          <span className="eyebrow">Realtime marketplace</span>
          <h1>Bid Live. Compete. Win.</h1>
          <p>
            Experience real-time auctions with secure bidding, transparent results and seamless payments.
          </p>
          <div className="cta-row">
            <Link className="btn btn-primary" to="/auctions">Explore Live Auctions</Link>
            <Link className="btn btn-secondary" to="/seller/create-auction">Start Selling</Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="feature-panel highlight">
            <img
              src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80"
              alt="Premium auction"
            />
            <div className="mini-card">
              <span>Current Bid</span>
              <strong>₹62,000</strong>
              <small>iPhone 16 Pro</small>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-row container">
        <div className="stat-box"><strong>10K+</strong><span>Active Bidders</span></div>
        <div className="stat-box"><strong>2K+</strong><span>Auctions</span></div>
        <div className="stat-box"><strong>99.9%</strong><span>Platform Availability</span></div>
        <div className="stat-box"><strong>Secure</strong><span>Payments</span></div>
      </section>

      <section className="section container">
        <div className="section-header">
          <div>
            <span className="eyebrow">Marketplace</span>
            <h2>Live Auctions</h2>
          </div>
          <Link className="text-link" to="/auctions">See all</Link>
        </div>

        <div className="auction-grid">
          {featuredAuctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage
