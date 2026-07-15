import { useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'

// The Sidebar is rendered once in App (outside <Routes>), so it stays fixed on
// screen and looks identical on both the dashboard and the detail view. It
// carries the branding, the primary navigation, and a few "at a glance"
// numbers so there is always shared context regardless of which page is open.
function Sidebar({ books }) {
  const location = useLocation()

  const glance = useMemo(() => {
    if (books.length === 0) return null
    const rated = books.filter((b) => typeof b.ratings_average === 'number')
    const avg = rated.length
      ? (rated.reduce((s, b) => s + b.ratings_average, 0) / rated.length).toFixed(2)
      : '—'
    const years = books.map((b) => b.first_publish_year)
    return {
      total: books.length,
      avg,
      newest: Math.max(...years),
    }
  }, [books])

  return (
    <aside className="sidebar">
      <Link to="/" className="sidebar__brand">
        <span className="sidebar__logo">📚</span>
        <span className="sidebar__brand-text">
          OpenLibrary
          <small>Book Dashboard</small>
        </span>
      </Link>

      <nav className="sidebar__nav">
        <Link
          to="/"
          className={`sidebar__link${
            location.pathname === '/' ? ' sidebar__link--active' : ''
          }`}
        >
          <span aria-hidden="true">📊</span> Dashboard
        </Link>
      </nav>

      {glance && (
        <div className="sidebar__glance">
          <p className="sidebar__glance-title">At a glance</p>
          <dl className="sidebar__glance-list">
            <div>
              <dt>Books</dt>
              <dd>{glance.total}</dd>
            </div>
            <div>
              <dt>Avg. rating</dt>
              <dd>⭐ {glance.avg}</dd>
            </div>
            <div>
              <dt>Newest</dt>
              <dd>{glance.newest}</dd>
            </div>
          </dl>
        </div>
      )}

      <p className="sidebar__footer">
        Data from{' '}
        <a href="https://openlibrary.org" target="_blank" rel="noreferrer">
          OpenLibrary
        </a>
      </p>
    </aside>
  )
}

export default Sidebar
