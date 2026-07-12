# OpenLibrary Book Dashboard

A data dashboard built with **React + Vite** for CodePath Web Development,
Unit 5 — Data Dashboard (Part 1). It fetches book data from the free
[OpenLibrary Search API](https://openlibrary.org/swagger/docs) and lets you
explore it with live search, a category filter, and summary statistics.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default: http://localhost:5173).

## Features implemented

- **API-driven list** — book data is fetched with `fetch` inside a `useEffect`
  hook using `async`/`await`. 40 popular fiction titles are loaded (well above
  the 10-item minimum), one book per row rendered with `.map()`.
- **Multiple features per row** — each row shows a cover thumbnail, title,
  author, first-published year, average rating (with rating count), and the
  number of editions.
- **Four summary statistics:**
  1. Total number of books (total count)
  2. Average rating across all books (mean of an attribute)
  3. Median page count (median of an attribute)
  4. Publication year range (min–max of an attribute)
- **Live search bar** — filters books by `title` or `author`, updating on every
  keystroke using `.filter()`.
- **Category filter** — a decade dropdown (derived from `first_publish_year`)
  that filters on a *different* attribute than the search bar. Both filters
  combine and update the list dynamically.

## Required techniques

| Requirement                                 | Where |
| ------------------------------------------- | ----- |
| Fetch with `useEffect` + `async`/`await`    | `src/App.jsx` |
| Handle user input / events                  | `SearchBar.jsx`, `DecadeFilter.jsx` |
| `.map()` to render a group of elements      | `BookList.jsx`, `DecadeFilter.jsx`, `SummaryStats.jsx` |
| `.filter()` to filter data on user input    | `src/App.jsx` |

## Project structure

```
src/
  App.jsx                  # data fetching + search/filter state
  components/
    SummaryStats.jsx       # four summary statistics
    SearchBar.jsx          # live title/author search
    DecadeFilter.jsx       # publication-decade category filter
    BookList.jsx           # one row per book
```

## API

Uses the OpenLibrary Search endpoint (no API key required):

```
https://openlibrary.org/search.json?q=subject:fiction&sort=readinglog&limit=40&fields=...
```

Book covers come from `https://covers.openlibrary.org/b/id/{cover_i}-M.jpg`.
