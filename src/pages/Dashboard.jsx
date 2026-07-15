import { useMemo, useState } from 'react'
import SummaryStats from '../components/SummaryStats'
import Charts from '../components/Charts'
import SearchBar from '../components/SearchBar'
import DecadeFilter from '../components/DecadeFilter'
import BookList from '../components/BookList'

// The Dashboard page renders at the "/" route. It receives the already-fetched
// books from App and owns the two interactive controls (search + decade). This
// is the "list view": summary stats, charts, and the linked list of books.
function Dashboard({ books, loading }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [decade, setDecade] = useState('all')

  // Build the list of decades present in the data for the filter dropdown.
  const decades = useMemo(() => {
    const set = new Set(
      books.map((book) => Math.floor(book.first_publish_year / 10) * 10),
    )
    return [...set].sort((a, b) => b - a)
  }, [books])

  // Search (title/author) and the decade filter are applied together —
  // two different attributes.
  const visibleBooks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return books.filter((book) => {
      const haystack = [book.title, ...(book.author_name ?? [])]
        .join(' ')
        .toLowerCase()
      const matchesSearch = haystack.includes(query)

      const bookDecade = Math.floor(book.first_publish_year / 10) * 10
      const matchesDecade = decade === 'all' || bookDecade === Number(decade)

      return matchesSearch && matchesDecade
    })
  }, [books, searchQuery, decade])

  return (
    <>
      <header className="page__header">
        <h1 className="page__title">📚 Book Dashboard</h1>
        <p className="page__subtitle">
          Browse popular fiction from the OpenLibrary catalog. Search by title
          or author, filter by decade, explore the charts, and click any book
          for its full details.
        </p>
      </header>

      <SummaryStats books={books} />

      <Charts books={books} />

      <section className="controls">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <DecadeFilter value={decade} decades={decades} onChange={setDecade} />
      </section>

      <p className="results-count">
        Showing <strong>{visibleBooks.length}</strong> of{' '}
        <strong>{books.length}</strong> books
      </p>

      {loading ? (
        <p className="app__loading">Loading books…</p>
      ) : (
        <BookList books={visibleBooks} />
      )}
    </>
  )
}

export default Dashboard
