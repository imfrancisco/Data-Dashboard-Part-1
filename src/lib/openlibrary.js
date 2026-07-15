// Shared OpenLibrary helpers used by both the dashboard and the detail view.

// We ask only for the fields we actually render, and sort by "readinglog" so we
// get well-known, popular books with complete ratings/cover data. 40 results is
// well above the 10-item minimum.
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
  'first_sentence',
  'language',
].join(',')

export const API_URL = `https://openlibrary.org/search.json?q=subject:fiction&sort=readinglog&limit=40&fields=${FIELDS}`

// A book's `key` looks like "/works/OL45804W". The trailing segment is a stable,
// URL-safe id we can use as the :bookId route parameter.
export const bookId = (book) => book.key.split('/').pop()

// Build the cover image URL for a given cover id (falls back to a dark placeholder).
export const coverUrl = (coverId, size = 'M') =>
  coverId
    ? `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`
    : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="72"><rect width="48" height="72" fill="%231d2b33"/></svg>'
