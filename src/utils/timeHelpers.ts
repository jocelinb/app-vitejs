export const days: Record<string, string> = {
    'http://schema.org/Monday': 'Lundi',
    'http://schema.org/Tuesday': 'Mardi',
    'http://schema.org/Wednesday': 'Mercredi',
    'http://schema.org/Thursday': 'Jeudi',
    'http://schema.org/Friday': 'Vendredi',
    'http://schema.org/Saturday': 'Samedi',
    'http://schema.org/Sunday': 'Dimanche'
  }
  
  export function dayOfWeekToFrench(day: string): string {
    return days[day] || day
  }
  
  export function formatHours(time: string | undefined): string {
    if (!time || time === '00:00:00') return 'Fermé'
    const [h, m] = time.split(':')
    return `${h}:${m}`
  }
  
  export interface OpeningHour {
    dayOfWeek: string
    opens: string
    closes: string
  }
  
  export interface GroupedDay {
    main: OpeningHour | null
    afternoon: OpeningHour | null
    merged: boolean
  }
  
  export function groupHoursByDay(
    openingHours: OpeningHour[]
  ): Record<string, GroupedDay> {
    const grouped: Record<string, GroupedDay> = {}
  
    openingHours
      .slice()
      .sort((a, b) => {
        const d = a.dayOfWeek.localeCompare(b.dayOfWeek)
        if (d !== 0) return d
        return a.opens.localeCompare(b.opens)
      })
      .forEach(h => {
        const fr = dayOfWeekToFrench(h.dayOfWeek)
        if (!grouped[fr]) grouped[fr] = { main: null, afternoon: null, merged: false }
        const cur = grouped[fr]
        if (!cur.main) {
          cur.main = h
        } else if (!cur.afternoon) {
          if (h.opens <= cur.main.closes) {
            cur.main.closes = h.closes
            cur.merged = true
          } else {
            cur.afternoon = h
          }
        }
      })
  
    return grouped
  }
  
  export function hasAfternoonHours(
    grouped: Record<string, GroupedDay>
  ): boolean {
    return Object.values(grouped).some(d => d.afternoon && !d.merged)
  }
  
  export function formatMorningHoursForDisplay(times: GroupedDay): string {
    if (!times.main) return 'Fermé'
    return `${formatHours(times.main.opens)} – ${formatHours(times.main.closes)}`
  }
  
  export function formatAfternoonHoursForDisplay(times: GroupedDay): string {
    if (times.merged || !times.afternoon) return ''
    return `${formatHours(times.afternoon.opens)} – ${formatHours(times.afternoon.closes)}`
  }
  