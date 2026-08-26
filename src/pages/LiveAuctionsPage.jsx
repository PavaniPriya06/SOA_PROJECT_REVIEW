import { useMemo, useState } from 'react'
import AuctionCard from '../components/AuctionCard'
import SearchBar from '../components/SearchBar'

const categories = ['All', 'Electronics', 'Gaming', 'Cameras', 'Laptops', 'Collectibles', 'Vehicles']
const marketplaceItems = [
  { id: 'iphone-16-pro', productName: 'iPhone 16 Pro', category: 'Electronics', startingPrice: 50000, currentBid: 62000, bidCount: 18 },
  { id: 'macbook-pro-m4', productName: 'MacBook Pro M4', category: 'Laptops', startingPrice: 70000, currentBid: 86000, bidCount: 24 },
  { id: 'playstation-5', productName: 'PlayStation 5', category: 'Gaming', startingPrice: 35000, currentBid: 42000, bidCount: 15 },
  { id: 'sony-alpha-a7', productName: 'Sony Alpha Camera', category: 'Cameras', startingPrice: 45000, currentBid: 57000, bidCount: 12 },
  { id: 'gaming-laptop', productName: 'Gaming Laptop', category: 'Laptops', startingPrice: 60000, currentBid: 78000, bidCount: 21 },
  { id: 'vintage-watch', productName: 'Premium Watch', category: 'Collectibles', startingPrice: 25000, currentBid: 38000, bidCount: 9 },
]

function LiveAuctionsPage({ auctions }) {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('endingSoon')

  const marketplaceAuctions = useMemo(
    () => [
      ...marketplaceItems.map((item) => ({ ...auctions.find((auction) => auction.id === item.id), ...item })),
      ...auctions.filter(
        (auction) => auction.sellerId && !marketplaceItems.some((item) => item.id === auction.id),
      ),
    ],
    [auctions],
  )

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
