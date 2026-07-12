// Renders one row per book. Each row shows several features: cover thumbnail,
// title, author, first-published year, rating, and edition count.
const coverUrl = (coverId) =>
  coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
    : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="72"><rect width="48" height="72" fill="%231d2b33"/></svg>'

function BookList({ books }) {
  if (books.length === 0) {
    return <p className="empty-state">No books match your filters.</p>
  }

  return (
    <ul className="book-list">
      <li className="book-list__head" aria-hidden="true">
        <span>Book</span>
        <span>Year</span>
        <span>Rating</span>
        <span>Editions</span>
      </li>
      {books.map((book) => (
        <li key={book.key} className="book-row">
          <div className="book-row__identity">
            <img
              className="book-row__cover"
              src={coverUrl(book.cover_i)}
              alt={`Cover of ${book.title}`}
              loading="lazy"
            />
            <div className="book-row__text">
              <span className="book-row__title">{book.title}</span>
              <span className="book-row__author">
                {book.author_name?.[0] ?? 'Unknown author'}
              </span>
            </div>
          </div>

          <div className="book-row__year">{book.first_publish_year}</div>

          <div className="book-row__rating">
            {typeof book.ratings_average === 'number' ? (
              <>
                ⭐ {book.ratings_average.toFixed(2)}
                <span className="book-row__rating-count">
                  ({book.ratings_count?.toLocaleString() ?? 0})
                </span>
              </>
            ) : (
              'Not rated'
            )}
          </div>

          <div className="book-row__editions">
            {book.edition_count?.toLocaleString() ?? 0}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default BookList
