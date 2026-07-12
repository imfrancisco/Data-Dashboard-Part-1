// Category filter that restricts the list by publication decade — derived from
// the `first_publish_year` attribute, a different attribute than the search bar
// (which matches title/author). The available decades are built from the data.
function DecadeFilter({ value, decades, onChange }) {
  return (
    <div className="control">
      <label className="control__label" htmlFor="decade">
        Filter by decade
      </label>
      <select
        id="decade"
        className="control__input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="all">All decades</option>
        {decades.map((decade) => (
          <option key={decade} value={decade}>
            {decade}s
          </option>
        ))}
      </select>
    </div>
  )
}

export default DecadeFilter
