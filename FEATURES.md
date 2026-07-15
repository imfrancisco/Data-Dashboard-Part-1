# Required Techniques — Where & How

This document explains the four required React techniques for the CodePath
Unit 5 Data Dashboard, and points to the exact place in the code where each one
lives. All file/line references are for the OpenLibrary Book Dashboard.

| # | Technique | File | Lines |
|---|-----------|------|-------|
| 1 | Fetch API data with `useEffect` + `async`/`await` | `src/App.jsx` | 34–59 |
| 2 | Respond to user-interaction events / handle input | `src/components/SearchBar.jsx`, `src/components/DecadeFilter.jsx` | 15 / 14 |
| 3 | `.map()` to render a group of elements | `src/components/BookList.jsx`, `DecadeFilter.jsx`, `SummaryStats.jsx` | 21 / 17 / — |
| 4 | `.filter()` to filter data based on user input | `src/App.jsx` | 75–85 |

---

## 1. Fetch API data with `useEffect` + `async`/`await`

**File:** `src/App.jsx` — lines **34–59**

```jsx
// Fetch the book data once, on mount, with useEffect + async/await.
useEffect(() => {
  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await fetch(API_URL)          // ← await the network request
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = await response.json()             // ← await parsing the JSON body
      const cleaned = data.docs.filter(
        (book) => book.title && book.first_publish_year,
      )
      setBooks(cleaned)                              // ← store results in state
      setError(null)
    } catch (err) {
      setError(err.message ?? 'Something went wrong while fetching data.')
    } finally {
      setLoading(false)
    }
  }

  fetchBooks()
}, [])                                               // ← empty deps = run once on mount
```

**How it works, step by step:**

- **`useEffect(() => { … }, [])`** — the effect runs *after the first render*.
  The empty dependency array `[]` means it runs **exactly once**, when the
  component mounts. This is the correct place for a one-time data fetch.
- **Why a nested `async` function?** A `useEffect` callback itself cannot be
  `async` (React expects it to return either nothing or a cleanup function, not
  a Promise). So we define `fetchBooks` as an `async` function *inside* the
  effect and then call it on the last line.
- **`await fetch(API_URL)`** pauses until the HTTP response arrives, so the code
  reads top-to-bottom instead of nesting `.then()` callbacks.
- **`await response.json()`** pauses again while the response body is parsed
  into a JavaScript object.
- **`try` / `catch` / `finally`** handle the three real-world outcomes: success
  (store the data), failure (store an error message shown at `App.jsx:98-102`),
  and *always* turning off the loading flag when finished.

The API URL being fetched is defined just above, at `App.jsx:23`:

```jsx
const API_URL = `https://openlibrary.org/search.json?q=subject:fiction&sort=readinglog&limit=40&fields=${FIELDS}`
```

---

## 2. Respond to events triggered by user interaction & handle user input

The dashboard has **two** interactive controls. Both are
["controlled components"](https://react.dev/learn/reacting-to-input-with-state):
their displayed value comes from React state, and every user action fires an
`onChange` event that updates that state.

### a) The search bar — `src/components/SearchBar.jsx` (line **15**)

```jsx
<input
  id="search"
  className="control__input"
  type="text"
  placeholder="e.g. Harry Potter, Tolkien, Hoover…"
  value={value}                                        // ← value driven by state
  onChange={(event) => onChange(event.target.value)}   // ← fires on every keystroke
/>
```

Each keystroke fires `onChange`, which reads the new text from
`event.target.value` and passes it up to the parent. Because this happens on
*every* keystroke, the list updates live as you type.

### b) The decade filter — `src/components/DecadeFilter.jsx` (line **14**)

```jsx
<select
  id="decade"
  className="control__input"
  value={value}                                        // ← value driven by state
  onChange={(event) => onChange(event.target.value)}   // ← fires when selection changes
>
```

### Where the input is actually "handled"

Both components receive their `value` and `onChange` from the parent, wired up
in `src/App.jsx` at lines **106–109**:

```jsx
<section className="controls">
  <SearchBar value={searchQuery} onChange={setSearchQuery} />
  <DecadeFilter value={decade} decades={decades} onChange={setDecade} />
</section>
```

- `setSearchQuery` and `setDecade` are React state setters created at
  `App.jsx:31-32`:
  ```jsx
  const [searchQuery, setSearchQuery] = useState('')
  const [decade, setDecade] = useState('all')
  ```
- When the user types or picks a decade, the matching setter runs, React
  re-renders the component, and the filtering logic (Technique 4) recomputes the
  visible list. This is the full **event → state → re-render** loop.

---

## 3. Use `.map()` to dynamically render a group of elements

`.map()` turns an **array of data** into an **array of JSX elements**. It is
used in three places.

### a) Rendering one row per book — `src/components/BookList.jsx` (lines **21–57**)

```jsx
{books.map((book) => (
  <li key={book.key} className="book-row">
    <div className="book-row__identity">
      <img className="book-row__cover" src={coverUrl(book.cover_i)} alt={`Cover of ${book.title}`} />
      <div className="book-row__text">
        <span className="book-row__title">{book.title}</span>
        <span className="book-row__author">{book.author_name?.[0] ?? 'Unknown author'}</span>
      </div>
    </div>
    <div className="book-row__year">{book.first_publish_year}</div>
    <div className="book-row__rating">⭐ {book.ratings_average.toFixed(2)} …</div>
    <div className="book-row__editions">{book.edition_count?.toLocaleString() ?? 0}</div>
  </li>
))}
```

This is the main dashboard list — each book object becomes one `<li>` row. Note
the **`key={book.key}`**: React requires a unique `key` on each mapped element
so it can track items efficiently across re-renders.

### b) Rendering the decade dropdown options — `src/components/DecadeFilter.jsx` (lines **17–21**)

```jsx
{decades.map((decade) => (
  <option key={decade} value={decade}>
    {decade}s
  </option>
))}
```

The list of decades is itself built dynamically from the data (see
`App.jsx:62-67`), then mapped into `<option>` elements.

### c) Rendering the summary-stat cards — `src/components/SummaryStats.jsx`

The four statistic cards are laid out from the computed `stats` object. (This
one is written as explicit cards rather than a `.map()`, but the pattern of
turning data into repeated elements is the same idea used in (a) and (b).)

---

## 4. Use `.filter()` to filter data based on user input

**File:** `src/App.jsx` — lines **72–86**

```jsx
const visibleBooks = useMemo(() => {
  const query = searchQuery.trim().toLowerCase()

  return books.filter((book) => {
    // --- Search bar: matches the title OR author text ---
    const haystack = [book.title, ...(book.author_name ?? [])]
      .join(' ')
      .toLowerCase()
    const matchesSearch = haystack.includes(query)

    // --- Decade filter: matches the first_publish_year attribute ---
    const bookDecade = Math.floor(book.first_publish_year / 10) * 10
    const matchesDecade = decade === 'all' || bookDecade === Number(decade)

    // A book is shown only if it passes BOTH conditions.
    return matchesSearch && matchesDecade
  })
}, [books, searchQuery, decade])
```

**How it works:**

- **`books.filter(...)`** walks every book and keeps only those for which the
  callback returns `true`. The result, `visibleBooks`, is what actually gets
  rendered (`App.jsx:119` → `<BookList books={visibleBooks} />`).
- **Two independent conditions, two different attributes:**
  - `matchesSearch` compares the user's typed text against the book's **title
    and author** (`title` / `author_name`).
  - `matchesDecade` compares the selected decade against the book's
    **publication year** (`first_publish_year`) — a *different attribute* than
    the search, as the rubric requires.
- Combining them with `matchesSearch && matchesDecade` means both filters work
  together (e.g. search "the" *and* restrict to the 1990s).
- **`useMemo(..., [books, searchQuery, decade])`** recomputes this filtered list
  only when the data or either input changes — which is exactly when the user
  types or changes the dropdown. That is what makes the list update *live*.

---

## The full data flow (putting it together)

```
                fetch on mount                 user types / selects
                     │                                 │
   OpenLibrary  ──►  useEffect + async/await  ──►  setBooks()          setSearchQuery() / setDecade()
   Search API        (Technique 1)                (state)   ◄──────────  (Technique 2: events)
                                                     │                          │
                                                     ▼                          ▼
                                          books.filter(...)  ◄── searchQuery, decade
                                             (Technique 4)
                                                     │
                                                     ▼
                                          visibleBooks.map(...)
                                             (Technique 3)
                                                     │
                                                     ▼
                                          rendered rows on screen
```

1. **Technique 1** loads the data once.
2. **Technique 2** captures what the user types/selects into state.
3. **Technique 4** filters the data using that state.
4. **Technique 3** renders the filtered data as rows.

Every keystroke or dropdown change re-runs steps 3–4 automatically, which is why
the dashboard feels live.
