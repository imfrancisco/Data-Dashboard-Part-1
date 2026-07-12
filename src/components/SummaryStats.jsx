import { useMemo } from 'react'

// Computes summary statistics about the fetched books:
//   1. Total number of books (total count)
//   2. Average rating across all books (mean of an attribute)
//   3. Median page count (median of an attribute)
//   4. Publication year range (min–max of an attribute)
function SummaryStats({ books }) {
  const stats = useMemo(() => {
    const total = books.length

    if (total === 0) {
      return { total: 0, avgRating: '—', medianPages: '—', yearRange: '—' }
    }

    // Stat 2: mean of ratings_average (only books that have a rating).
    const rated = books.filter((b) => typeof b.ratings_average === 'number')
    const avgRating = rated.length
      ? (
          rated.reduce((sum, b) => sum + b.ratings_average, 0) / rated.length
        ).toFixed(2)
      : '—'

    // Stat 3: median of number_of_pages_median.
    const pages = books
      .map((b) => b.number_of_pages_median)
      .filter((n) => typeof n === 'number')
      .sort((a, b) => a - b)
    let medianPages = '—'
    if (pages.length) {
      const mid = Math.floor(pages.length / 2)
      medianPages =
        pages.length % 2 === 0
          ? Math.round((pages[mid - 1] + pages[mid]) / 2)
          : pages[mid]
    }

    // Stat 4: range of first_publish_year.
    const years = books.map((b) => b.first_publish_year)
    const yearRange = `${Math.min(...years)}–${Math.max(...years)}`

    return { total, avgRating, medianPages, yearRange }
  }, [books])

  return (
    <section className="stats" aria-label="Summary statistics">
      <div className="stat-card">
        <span className="stat-card__value">{stats.total}</span>
        <span className="stat-card__label">Total Books</span>
      </div>
      <div className="stat-card">
        <span className="stat-card__value">⭐ {stats.avgRating}</span>
        <span className="stat-card__label">Average Rating</span>
      </div>
      <div className="stat-card">
        <span className="stat-card__value">{stats.medianPages}</span>
        <span className="stat-card__label">Median Page Count</span>
      </div>
      <div className="stat-card">
        <span className="stat-card__value">{stats.yearRange}</span>
        <span className="stat-card__label">Publication Range</span>
      </div>
    </section>
  )
}

export default SummaryStats
