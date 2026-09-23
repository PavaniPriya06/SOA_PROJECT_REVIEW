import { useMemo, useState } from 'react'
import AuctionCard from '../components/AuctionCard'
import SearchBar from '../components/SearchBar'

const categories = ['All', 'Electronics', 'Gaming', 'Cameras', 'Laptops', 'Collectibles', 'Vehicles']
function LiveAuctionsPage({ auctions }) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('endingSoon')

  const marketplaceAuctions = useMemo(() => auctions, [auctions])

  const filteredAuctions = useMemo(() => {
    const result = marketplaceAuctions.filter((auction) => {
      const matchesSearch = auction.productName.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || auction.category === selectedCategory

      return matchesSearch && matchesCategory
    })

    return result.sort((a, b) => {
      if (sortBy === 'highestBid') return b.currentBid - a.currentBid
      if (sortBy === 'lowestBid') return a.currentBid - b.currentBid
      if (sortBy === 'mostBids') return b.bidCount - a.bidCount
      return a.endTime - b.endTime
    })
  }, [marketplaceAuctions, search, selectedCategory, sortBy])

  return (
    <div className="page-shell container">
      <section className="page-header-block">
        <div>
          <span className="eyebrow">Bidding marketplace</span>
          <h1>Live Auctions</h1>
          <p>Discover active auctions and place your best bid before time runs out.</p>
        </div>
      </section>

      <div className="toolbar">
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search auctions..." />
        <div className="filter-bar">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} aria-label="Filter by category">
            {categories.map((category) => <option key={category} value={category}>{category === 'All' ? 'All Categories' : category}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort auctions">
            <option value="endingSoon">Ending Soon</option>
            <option value="highestBid">Highest Bid</option>
            <option value="lowestBid">Lowest Bid</option>
            <option value="mostBids">Most Bids</option>
          </select>
        </div>
      </div>

      <div className="auction-grid">
        {filteredAuctions.length > 0 ? (
          filteredAuctions.map((auction) => <AuctionCard key={auction.id} auction={auction} />)
        ) : (
          <div className="empty-state">
            <strong>No auctions found</strong>
            <span>Try changing your search or filters.</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveAuctionsPage
