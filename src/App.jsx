import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import { API_URL } from './lib/openlibrary'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import BookDetail from './pages/BookDetail'

// App is now the application shell. It fetches the data once and owns it, then
// renders the persistent Sidebar next to a routed <main> area. Because the
// Sidebar lives here — outside <Routes> — it is displayed identically on both
// the dashboard and the detail view.
function App() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  return (
    <div className="layout">
      <Sidebar books={books} />

      <main className="layout__main">
        {error && (
          <div className="app__error" role="alert">
            ⚠️ Could not load data: {error}
          </div>
        )}

        {/* React Router picks ONE of these to render based on the URL. */}
        <Routes>
          <Route
            path="/"
            element={<Dashboard books={books} loading={loading} />}
          />
          <Route
            path="/book/:bookId"
            element={<BookDetail books={books} loading={loading} />}
          />
        </Routes>
      </main>
    </div>
  )
}

export default App
