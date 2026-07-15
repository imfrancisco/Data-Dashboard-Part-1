import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

// ── Palette ────────────────────────────────────────────────────────────────
// Single-hue per chart (each chart is one data series, so no categorical
// separation is needed). Both hues clear contrast on the dark surface.
const AMBER = '#e0a458' // brand accent — used for the "per decade" bars
const BLUE = '#5aa9e6' // cool accent — used for the rating/popularity dots
const GRID = 'rgba(255,255,255,0.08)'
const AXIS = '#8f8067'

// Shared dark tooltip styling so both charts match the app theme.
const tooltipStyle = {
  background: '#221a11',
  border: '1px solid rgba(224,164,88,0.4)',
  borderRadius: 10,
  color: '#f3ead9',
}

// Two charts, each describing a DIFFERENT aspect of the same dataset:
//   Chart 1 — WHEN the collection was published (counts over time).
//   Chart 2 — WHETHER the most-rated books are also the highest rated
//             (quality vs. reach), a relationship the first chart can't show.
function Charts({ books }) {
  // Chart 1 data: number of books grouped by publication decade.
  const perDecade = useMemo(() => {
    const counts = new Map()
    for (const book of books) {
      const decade = Math.floor(book.first_publish_year / 10) * 10
      counts.set(decade, (counts.get(decade) ?? 0) + 1)
    }
    return [...counts.entries()]
      .map(([decade, count]) => ({ decade: `${decade}s`, count }))
      .sort((a, b) => parseInt(a.decade) - parseInt(b.decade))
  }, [books])

  // Chart 2 data: one dot per rated book — x = average rating, y = how many
  // people rated it. Only books that have both values can be plotted.
  const ratingVsReach = useMemo(
    () =>
      books
        .filter(
          (b) =>
            typeof b.ratings_average === 'number' &&
            typeof b.ratings_count === 'number',
        )
        .map((b) => ({
          title: b.title,
          rating: Number(b.ratings_average.toFixed(2)),
          count: b.ratings_count,
        })),
    [books],
  )

  if (books.length === 0) return null

  return (
    <section className="charts" aria-label="Data visualizations">
      {/* ── Chart 1: Books per decade (magnitude over time) ── */}
      <figure className="chart-card">
        <figcaption className="chart-card__title">
          Books published per decade
          <span className="chart-card__hint">
            When this popular-fiction collection was written
          </span>
        </figcaption>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={perDecade}
            margin={{ top: 8, right: 12, bottom: 4, left: -12 }}
          >
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis
              dataKey="decade"
              tick={{ fill: AXIS, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: AXIS, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(224,164,88,0.08)' }}
              contentStyle={tooltipStyle}
              formatter={(value) => [`${value} books`, 'Count']}
            />
            <Bar dataKey="count" fill={AMBER} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </figure>

      {/* ── Chart 2: Rating vs. popularity (relationship / correlation) ── */}
      <figure className="chart-card">
        <figcaption className="chart-card__title">
          Rating vs. popularity
          <span className="chart-card__hint">
            Do the most-rated books earn the highest scores?
          </span>
        </figcaption>
        <ResponsiveContainer width="100%" height={260}>
          <ScatterChart margin={{ top: 8, right: 16, bottom: 4, left: -4 }}>
            <CartesianGrid stroke={GRID} />
            <XAxis
              type="number"
              dataKey="rating"
              name="Average rating"
              domain={[0, 5]}
              tick={{ fill: AXIS, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: GRID }}
              label={{
                value: 'Average rating →',
                position: 'insideBottom',
                offset: -2,
                fill: AXIS,
                fontSize: 11,
              }}
            />
            <YAxis
              type="number"
              dataKey="count"
              name="Ratings"
              tick={{ fill: AXIS, fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={64}
            />
            <ZAxis range={[70, 70]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: AXIS }}
              contentStyle={tooltipStyle}
              formatter={(value, name) =>
                name === 'Ratings'
                  ? [value.toLocaleString(), '# of ratings']
                  : [value, 'Avg rating']
              }
              labelFormatter={() => ''}
            />
            <Scatter data={ratingVsReach} fill={BLUE} fillOpacity={0.75}>
              {ratingVsReach.map((entry, i) => (
                <Cell key={i} stroke="#221a11" strokeWidth={1} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </figure>
    </section>
  )
}

export default Charts
