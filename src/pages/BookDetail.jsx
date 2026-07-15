import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { coverUrl } from '../lib/openlibrary'

// The detail view, rendered at /book/:bookId. useParams() reads the :bookId
// segment out of the URL; we use it to look up the matching book in the data
// App already fetched. We ALSO fetch the full "work" record from OpenLibrary so
// the detail page can show extra information (description, subjects) that never
// appears on the dashboard.
function BookDetail({ books, loading }) {
  const { bookId } = useParams() // ← extract the URL parameter

  // Find the book whose key ends with this id (keys look like /works/OL123W).
  const book = books.find((b) => b.key.endsWith(bookId))

  const [work, setWork] = useState(null)
  const [workLoading, setWorkLoading] = useState(true)

  // Fetch the extra "work" details keyed off the URL parameter.
  useEffect(() => {
    let ignore = false
    const fetchWork = async () => {
      try {
        setWorkLoading(true)
        const res = await fetch(`https://openlibrary.org/works/${bookId}.json`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (!ignore) setWork(data)
      } catch {
        if (!ignore) setWork(null)
      } finally {
        if (!ignore) setWorkLoading(false)
      }
    }
    fetchWork()
    return () => {
      ignore = true
    }
  }, [bookId])

  // Still waiting on the initial dashboard fetch.
  if (loading && books.length === 0) {
    return <p className="app__loading">Loading…</p>
  }

  // Data loaded, but no book matches this id (e.g. a hand-typed bad URL).
  if (!book) {
    return (
      <div className="detail">
        <Link to="/" className="detail__back">
          ← Back to dashboard
        </Link>
        <p className="empty-state">
          Sorry, we couldn’t find a book for “{bookId}”.
        </p>
      </div>
    )
  }

  // Pull a plain-text description out of the work record (the API returns
  // either a string or an object with a `.value`).
  const description =
    typeof work?.description === 'string'
      ? work.description
      : work?.description?.value

  const subjects = work?.subjects?.slice(0, 12) ?? []

  const firstSentence = Array.isArray(book.first_sentence)
    ? book.first_sentence[0]
    : book.first_sentence

  return (
    <div className="detail">
      <Link to="/" className="detail__back">
        ← Back to dashboard
      </Link>

      <div className="detail__hero">
        <img
          className="detail__cover"
          src={coverUrl(book.cover_i, 'L')}
          alt={`Cover of ${book.title}`}
        />

        <div className="detail__intro">
          <h1 className="detail__title">{book.title}</h1>
          <p className="detail__authors">
            by {book.author_name?.join(', ') ?? 'Unknown author'}
          </p>

          {/* Key facts — a mix of dashboard fields and EXTRA fields. */}
          <dl className="detail__facts">
            <div>
              <dt>First published</dt>
              <dd>{book.first_publish_year}</dd>
            </div>
            <div>
              <dt>Average rating</dt>
              <dd>
                {typeof book.ratings_average === 'number'
                  ? `⭐ ${book.ratings_average.toFixed(2)}`
                  : 'Not rated'}
              </dd>
            </div>
            {/* EXTRA: total number of ratings */}
            <div>
              <dt>Total ratings</dt>
              <dd>{book.ratings_count?.toLocaleString() ?? '—'}</dd>
            </div>
            <div>
              <dt>Editions</dt>
              <dd>{book.edition_count?.toLocaleString() ?? '—'}</dd>
            </div>
            {/* EXTRA: median page count */}
            <div>
              <dt>Median pages</dt>
              <dd>{book.number_of_pages_median?.toLocaleString() ?? '—'}</dd>
            </div>
            {/* EXTRA: languages available */}
            <div>
              <dt>Languages</dt>
              <dd>{book.language?.length ?? '—'}</dd>
            </div>
          </dl>

          <a
            className="detail__external"
            href={`https://openlibrary.org${book.key}`}
            target="_blank"
            rel="noreferrer"
          >
            View on OpenLibrary ↗
          </a>
        </div>
      </div>

      {/* EXTRA: opening line, not shown anywhere on the dashboard. */}
      {firstSentence && (
        <blockquote className="detail__quote">“{firstSentence}”</blockquote>
      )}

      {/* EXTRA: full description fetched from the work record. */}
      <section className="detail__section">
        <h2>Description</h2>
        {workLoading ? (
          <p className="app__loading">Loading description…</p>
        ) : description ? (
          <p className="detail__description">{description}</p>
        ) : (
          <p className="empty-state">No description available for this book.</p>
        )}
      </section>

      {/* EXTRA: subject tags fetched from the work record. */}
      {subjects.length > 0 && (
        <section className="detail__section">
          <h2>Subjects</h2>
          <ul className="detail__tags">
            {subjects.map((subject) => (
              <li key={subject} className="detail__tag">
                {subject}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export default BookDetail
