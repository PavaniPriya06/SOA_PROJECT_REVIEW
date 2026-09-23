function SearchBar({ value, onChange, placeholder = 'Search items' }) {
  return (
    <div className="search-field">
      <span>⌕</span>
      <input value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  )
}

export default SearchBar
