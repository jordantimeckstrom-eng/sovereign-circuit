import { useState, useEffect, useMemo } from 'react'
import {
  Target,
  Flame,
  BookOpen,
  Compass,
  Plus,
  Link2,
  Feather,
  Clock,
  ChevronRight,
  Check,
  Pencil,
  X,
  Sparkles,
  Gavel,
  type LucideIcon,
} from 'lucide-react'
import { useLedger } from '../context/LedgerContext'
import styles from './SevenDay.module.css'

interface CustomPillar {
  id: string
  name: string
  icon: LucideIcon
  color: string
  active: boolean
}

type EntryType = 'reflection' | 'ceremony' | 'bid'

interface JournalEntry {
  type: EntryType
  text: string
  time: string
}

interface PastDay {
  id: string
  date: string
  day: string
  month: string
  entries: JournalEntry[]
  pillarProgress: number
  isToday?: boolean
}

interface FutureDay {
  id: string
  date: string
  day: string
  month: string
  intention: string
  focusPillars: string[]
  priority: 'high' | 'medium' | 'low'
}

const entryIcons: Record<EntryType, LucideIcon> = {
  reflection: Feather,
  ceremony: Sparkles,
  bid: Gavel,
}

const entryColors: Record<EntryType, string> = {
  reflection: '#C9A84C',
  ceremony: '#7B68EE',
  bid: '#4ECDC4',
}

const defaultPillars: CustomPillar[] = [
  { id: '1', name: 'Dawn Practice', icon: Flame, color: '#C9A84C', active: true },
  { id: '2', name: 'Deep Work', icon: Target, color: '#4ECDC4', active: true },
  { id: '3', name: 'Study', icon: BookOpen, color: '#7B68EE', active: false },
  { id: '4', name: 'Navigate', icon: Compass, color: '#E8725C', active: true },
]

const PILLARS_KEY = 'sevenday_pillars_v1'

const pillarIconById: Record<string, LucideIcon> = {
  '1': Flame,
  '2': Target,
  '3': BookOpen,
  '4': Compass,
}

function loadPillars(): CustomPillar[] {
  try {
    const raw = localStorage.getItem(PILLARS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Omit<CustomPillar, 'icon'>[]
      return parsed.map((p) => ({ ...p, icon: pillarIconById[p.id] ?? Compass }))
    }
  } catch {}
  return defaultPillars
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  let h = d.getHours()
  const m = d.getMinutes().toString().padStart(2, '0')
  const suffix = h >= 12 ? 'p' : 'a'
  h = h % 12
  if (h === 0) h = 12
  return `${h}:${m}${suffix}`
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className={styles.progressTrack}>
      <div
        className={styles.progressFill}
        style={{
          width: `${percent}%`,
          background: percent === 100 ? '#C9A84C' : percent >= 50 ? 'rgba(201,168,76,0.7)' : 'rgba(201,168,76,0.4)',
        }}
      />
    </div>
  )
}

function EntryBadge({ entry }: { entry: JournalEntry }) {
  const Icon = entryIcons[entry.type]
  const color = entryColors[entry.type]
  return (
    <div className={styles.entryBadge}>
      <div className={styles.entryIcon} style={{ color }}>
        <Icon size={11} />
      </div>
      <span className={styles.entryText}>{entry.text}</span>
    </div>
  )
}

export default function SevenDay() {
  const [pillars, setPillars] = useState<CustomPillar[]>(loadPillars)
  const [editMode, setEditMode] = useState(false)
  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const { state } = useLedger()

  useEffect(() => {
    try {
      const serializable = pillars.map(({ icon, ...rest }) => rest)
      localStorage.setItem(PILLARS_KEY, JSON.stringify(serializable))
    } catch {}
  }, [pillars])

  const togglePillar = (id: string) => {
    setPillars(pillars.map((p) => (p.id === id ? { ...p, active: !p.active } : p)))
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const activePillarCount = pillars.filter((p) => p.active).length

  const odinActivity =
    state.bids.length +
    state.events.length +
    state.dawnCount +
    state.duskCount +
    state.chainCount
  const odinState = odinActivity > 10 ? 'active' : 'idle'

  const pastDays: PastDay[] = useMemo(() => {
    const now = new Date()
    const todayKey = dayKey(now)

    const collected: { key: string; ts: string; entry: JournalEntry }[] = []
    for (const b of state.bids) {
      collected.push({
        key: dayKey(new Date(b.timestamp)),
        ts: b.timestamp,
        entry: {
          type: 'bid',
          text: `${b.name} — $${b.amount} bid${b.ghostNote ? ` · ${b.ghostNote}` : ''}`,
          time: formatTime(b.timestamp),
        },
      })
    }
    for (const ev of state.events) {
      collected.push({
        key: dayKey(new Date(ev.timestamp)),
        ts: ev.timestamp,
        entry: { type: ev.type, text: ev.text, time: formatTime(ev.timestamp) },
      })
    }

    const days: PastDay[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const key = dayKey(d)
      const dayEntries = collected
        .filter((c) => c.key === key)
        .sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime())
        .map((c) => c.entry)
      days.push({
        id: key,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate().toString(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        entries: dayEntries,
        pillarProgress: Math.min(100, dayEntries.length * 34),
        isToday: key === todayKey,
      })
    }
    return days
  }, [state.bids, state.events])

  const futureDays: FutureDay[] = useMemo(() => {
    const now = new Date()
    const days: FutureDay[] = []
    for (let i = 1; i <= 7; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() + i)
      const isSunday = d.getDay() === 0
      days.push({
        id: dayKey(d),
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate().toString(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        intention: isSunday ? 'Weekly goal release' : '',
        focusPillars: pillars.filter((p) => p.active).map((p) => p.name).slice(0, 2),
        priority: isSunday ? 'high' : 'low',
      })
    }
    return days
  }, [pillars])

  return (
    <div className={styles.stage}>
      <div className={styles.frame}>
        <div className={`${styles.scroll} ${styles.noScrollbar}`}>
          <header className={styles.header}>
            <h1 className={styles.title}>Rise, PhoenixFly</h1>
            <p className={styles.date}>{today}</p>
            <div className={styles.divider} />
          </header>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <h2 className={styles.pillarsLabel}>My Pillars</h2>
              <button
                onClick={() => setEditMode(!editMode)}
                className={styles.editBtn}
                aria-label={editMode ? 'Done editing pillars' : 'Edit pillars'}
              >
                {editMode ? <Check size={16} /> : <Pencil size={14} />}
              </button>
            </div>

            <div className={styles.pillarGrid}>
              {pillars.map((pillar) => {
                const Icon = pillar.icon
                return (
                  <button
                    key={pillar.id}
                    onClick={() => togglePillar(pillar.id)}
                    className={`${styles.pillar} ${pillar.active ? styles.pillarActive : ''}`}
                  >
                    {pillar.active && <div className={styles.pillarGlow} />}
                    <div className={`${styles.pillarIconWrap} ${pillar.active ? styles.pillarIconWrapActive : ''}`}>
                      <Icon size={16} style={{ color: pillar.active ? pillar.color : 'rgba(245,240,225,0.25)' }} />
                    </div>
                    <div className={styles.pillarText}>
                      <span className={`${styles.pillarName} ${pillar.active ? styles.pillarNameActive : ''}`}>
                        {pillar.name}
                      </span>
                      {pillar.active && <span className={styles.pillarActiveTag}>active</span>}
                    </div>
                    {editMode && <X size={12} className={styles.pillarRemove} />}
                  </button>
                )
              })}

              {editMode && (
                <button className={styles.addPillar}>
                  <Plus size={16} />
                  <span>Add Pillar</span>
                </button>
              )}
            </div>

            <div className={styles.pillarProgressRow}>
              <ProgressBar percent={(activePillarCount / pillars.length) * 100} />
              <span className={styles.pillarCount}>
                {activePillarCount}/{pillars.length}
              </span>
            </div>
          </section>

          <div className={styles.odin}>
            <div className={`${styles.odinPulse} ${odinState === 'active' ? styles.odinActive : styles.odinIdle}`} />
            <div className={styles.odinBody}>
              <div className={styles.odinLabel}>ODIN Awareness</div>
              <div className={styles.odinState}>
                The system observes itself — {odinState}
              </div>
            </div>
            <span className={styles.odinCount}>{odinActivity} signals</span>
          </div>

          <section className={styles.sectionNoPadX}>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitlePad}`}>The Seven Behind</h2>
            <div className={`${styles.pastRow} ${styles.noScrollbar}`}>
              {pastDays.map((day) => {
                const isExpanded = expandedDay === day.id
                return (
                  <button
                    key={day.id}
                    onClick={() => setExpandedDay(isExpanded ? null : day.id)}
                    className={`${styles.pastCard} ${isExpanded ? styles.pastCardExpanded : ''} ${day.isToday ? styles.pastCardToday : ''}`}
                  >
                    <div className={styles.pastCardHead}>
                      <div>
                        <div className={styles.pastDay}>{day.day}</div>
                        <div className={styles.pastDateRow}>
                          <span className={styles.pastDate}>{day.date}</span>
                          <span className={styles.pastMonth}>{day.month}</span>
                        </div>
                      </div>
                      {day.isToday && <span className={styles.todayTag}>today</span>}
                    </div>

                    <ProgressBar percent={day.pillarProgress} />

                    <div className={styles.entryDots}>
                      {day.entries.slice(0, 3).map((entry, i) => {
                        const EIcon = entryIcons[entry.type]
                        return (
                          <div
                            key={i}
                            className={styles.entryDot}
                            style={{ backgroundColor: `${entryColors[entry.type]}20` }}
                          >
                            <EIcon size={8} style={{ color: entryColors[entry.type] }} />
                          </div>
                        )
                      })}
                      <span className={styles.entryCount}>{day.entries.length}</span>
                    </div>

                    {isExpanded && (
                      <div className={styles.entryList}>
                        {day.entries.map((entry, i) => (
                          <EntryBadge key={i} entry={entry} />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>The Seven Ahead</h2>
            <div className={styles.futureList}>
              {futureDays.map((day) => (
                <div key={day.id} className={styles.futureRow}>
                  <div className={styles.futureDateCol}>
                    <span className={styles.futureDay}>{day.day}</span>
                    <span className={styles.futureDate}>{day.date}</span>
                  </div>

                  <div className={styles.futureVDivider} />

                  <div className={styles.futureBody}>
                    <span
                      className={styles.futureIntention}
                      style={day.intention ? undefined : { opacity: 0.4, fontStyle: 'italic' }}
                    >
                      {day.intention || 'Open — set an intention'}
                    </span>
                    {day.focusPillars.length > 0 && (
                      <div className={styles.futureTags}>
                        {day.focusPillars.map((p, i) => (
                          <span key={i} className={styles.futureTag}>{p}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    className={`${styles.priorityDot} ${
                      day.priority === 'high'
                        ? styles.priorityHigh
                        : day.priority === 'medium'
                        ? styles.priorityMedium
                        : styles.priorityLow
                    }`}
                  />

                  <ChevronRight size={14} className={styles.chevron} />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.dock}>
          <div className={styles.dockInner}>
            <button className={styles.dockBtn} aria-label="Links">
              <Link2 size={20} />
            </button>
            <div className={styles.dockDivider} />
            <button className={`${styles.dockBtn} ${styles.dockBtnActive}`} aria-label="Reflect">
              <div className={styles.dockGlow} />
              <Feather size={24} />
            </button>
            <div className={styles.dockDivider} />
            <button className={styles.dockBtn} aria-label="Time">
              <Clock size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
