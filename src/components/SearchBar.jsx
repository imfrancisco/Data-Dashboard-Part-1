// Controlled search input. Calls onChange on every keystroke so the list
// filters dynamically as the user types (matches book title or author).
function SearchBar({ value, onChange }) {
  return (
    <div className="control">
      <label className="control__label" htmlFor="search">
        Search by title or author
      </label>
      <input
        id="search"
        className="control__input"
        type="text"
        placeholder="e.g. Harry Potter, Tolkien, Hoover…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

export default SearchBar
