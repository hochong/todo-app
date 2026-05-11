import { useState } from 'react'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Calendar({ todos, onDateClick }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const todayStr = toDateStr(today)

  function changeMonth(dir) {
    let m = month + dir
    let y = year
    if (m > 11) { y++; m = 0 }
    if (m < 0)  { y--; m = 11 }
    setYear(y)
    setMonth(m)
  }

  // Build dot map: dateStr -> count
  const dotMap = {}
  todos.forEach(t => {
    if (t.date) dotMap[t.date] = (dotMap[t.date] || 0) + 1
  })

  const first    = new Date(year, month, 1)
  const last     = new Date(year, month + 1, 0)
  const startDay = first.getDay()

  const cells = []

  // Prev-month fillers
  for (let i = 0; i < startDay; i++) {
    const d = new Date(year, month, -startDay + i + 1)
    cells.push({ day: d.getDate(), dateStr: null, otherMonth: true })
  }

  // Current month
  for (let d = 1; d <= last.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({
      day: d,
      dateStr,
      otherMonth: false,
      isToday: dateStr === todayStr,
      count: dotMap[dateStr] || 0,
    })
  }

  // Trailing fillers
  const trailing = (7 - (cells.length % 7)) % 7
  for (let i = 1; i <= trailing; i++) {
    cells.push({ day: i, dateStr: null, otherMonth: true })
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="cal-nav" onClick={() => changeMonth(-1)}>‹</button>
        <span className="month-year">{MONTHS[month]} {year}</span>
        <button className="cal-nav" onClick={() => changeMonth(1)}>›</button>
      </div>

      <div className="calendar-body">
        <div className="cal-days-header">
          {DAY_NAMES.map(n => (
            <div key={n} className="cal-day-name">{n}</div>
          ))}
        </div>

        <div className="cal-grid">
          {cells.map((cell, i) => (
            <div
              key={i}
              className={[
                'cal-cell',
                cell.otherMonth ? 'other-month' : '',
                cell.isToday    ? 'today'       : '',
              ].join(' ').trim()}
              onClick={() => !cell.otherMonth && onDateClick(cell.dateStr)}
            >
              <span className="cal-num">{cell.day}</span>
              {cell.count > 0 && (
                <div className="cal-dots">
                  {Array.from({ length: Math.min(cell.count, 6) }).map((_, j) => (
                    <div key={j} className="cal-dot" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
