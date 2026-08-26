function FilterBar({ categories, selectedCategory, onCategoryChange, sortBy, onSortChange, showEndingSoon, onEndingSoonToggle, priceFilter, onPriceFilterChange }) {
  return (
    <div className="filter-bar">
      <select value={selectedCategory} onChange={onCategoryChange}>
        <option value="All">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>

      <select value={priceFilter} onChange={onPriceFilterChange}>
        <option value="all">Price: Any</option>
        <option value="under-50000">Under ₹50,000</option>
        <option value="50000-150000">₹50,000 - ₹1,50,000</option>
        <option value="150000-plus">₹1,50,000+</option>
      </select>

      <label className="checkbox-row">
        <input type="checkbox" checked={showEndingSoon} onChange={onEndingSoonToggle} />
        Ending soon
      </label>

      <select value={sortBy} onChange={onSortChange}>
        <option value="endingSoon">Ending soon</option>
        <option value="highestBid">Highest bid</option>
        <option value="lowestBid">Lowest bid</option>
        <option value="mostBids">Most bids</option>
      </select>
    </div>
  )
}

export default FilterBar
