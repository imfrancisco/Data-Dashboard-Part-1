import { useEffect, useMemo, useState } from 'react'
import './App.css'
import SummaryStats from './components/SummaryStats'
import SearchBar from './components/SearchBar'
import DecadeFilter from './components/DecadeFilter'
import BookList from './components/BookList'

// OpenLibrary Search API. We ask only for the fields we actually render, and
// sort by "readinglog" so we get well-known, popular books with complete
// ratings/cover data. 40 results is well above the 10-item minimum.
const FIELDS = [
  'key',
  'title',
  'author_name',
  'first_publish_year',
  'edition_count',
  'cover_i',
  'ratings_average',
  'ratings_count',
  'number_of_pages_median',
].join(',')

const API_URL = `https://openlibrary.org/search.json?q=subject:fiction&sort=readinglog&limit=40&fields=${FIELDS}`

function App() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Two independent controlled inputs.
  const [searchQuery, setSearchQuery] = useState('')
  const [decade, setDecade] = useState('all')

  // Fetch the book data once, on mount, with useEffect + async/await.
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true)
        const response = await fetch(API_URL)
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const data = await response.json()
        // Keep only books that have the data our rows/stats rely on.
        const cleaned = data.docs.filter(
          (book) => book.title && book.first_publish_year,
        )
        setBooks(cleaned)
        setError(null)
      } catch (err) {
        setError(err.message ?? 'Something went wrong while fetching data.')
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  // Build the list of decades present in the data for the filter dropdown.
  const decades = useMemo(() => {
    const set = new Set(
      books.map((book) => Math.floor(book.first_publish_year / 10) * 10),
    )
    return [...set].sort((a, b) => b - a)
  }, [books])

  // Search (by title/author) and the decade filter are applied together.
  // Search matches the `title`/`author_name` text; the filter uses the
  // `first_publish_year` attribute — two different attributes.
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
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">📚 OpenLibrary Book Dashboard</h1>
        <p className="app__subtitle">
          Browse popular fiction from the OpenLibrary catalog. Search by title
          or author, filter by decade, and explore the stats.
        </p>
      </header>

      {error && (
        <div className="app__error" role="alert">
          ⚠️ Could not load data: {error}
        </div>
      )}

      <SummaryStats books={books} />

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
    </div>
  )
}

export default App
