import { useState } from 'react'
import { TRIBES, TRIBE_EVENTS, type Tribe, type TribeEvent } from '../data/tribes'
import styles from './Tribes.module.css'

const TRON_TREASURY_ADDRESS = 'TB9s7N68J9WCkTmg5VYdxLTeW7TP2kHe1E'

const EVENT_ICONS: Record<TribeEvent['type'], string> = {
  ritual: '🕯',
  vote: '🗳',
  bid: '⏳',
  shield: '🛡',
  initiation: '✦',
}

export default function Tribes() {
  const [selectedTribe, setSelectedTribe] = useState<string | null>(null)
  const [tribeName, setTribeName] = useState('')

  const totalMembers = TRIBES.reduce((sum, t) => sum + t.members, 0)
  const totalTreasury = TRIBES.reduce((sum, t) => sum + t.treasury, 0)
  const activeTribes = TRIBES.filter((t) => t.status === 'active').length
  const tronTribes = TRIBES.filter((t) => t.chain === 'TRON').length

  const filteredEvents = selectedTribe
    ? TRIBE_EVENTS.filter((e) => e.tribeId === selectedTribe)
    : TRIBE_EVENTS

  const formatTime = (ts: string) => {
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return 'just now'
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const getStatusClass = (status: Tribe['status']) => {
    switch (status) {
      case 'active': return styles.statusActive
      case 'forming': return styles.statusForming
      case 'sealed': return styles.statusSealed
    }
  }

  return (
    <div className={styles.tribes}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Sovereign Tribes</h1>
        <p className={styles.subtitle}>
          Autonomous governance collectives bound by protocol. Each tribe holds its own shield,
          its own rhythm, its own sovereign space.
        </p>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{TRIBES.length}</span>
          <span className={styles.statLabel}>Total Tribes</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{activeTribes}</span>
          <span className={styles.statLabel}>Active</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalMembers}</span>
          <span className={styles.statLabel}>Members</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalTreasury.toLocaleString()}</span>
          <span className={styles.statLabel}>Treasury (TRX)</span>
        </div>
      </div>

      <div>
        <h2 className={styles.sectionTitle}>Active Tribes</h2>
        <p className={styles.sectionSub}>
          Select a tribe to filter events. {tronTribes} tribes on TRON, {TRIBES.length - tronTribes} on Solana.
        </p>
        <div className={styles.tribeGrid}>
          {TRIBES.map((tribe) => (
            <div
              key={tribe.id}
              className={`${styles.tribeCard} ${
                tribe.status === 'active' ? styles.tribeCardActive :
                tribe.status === 'forming' ? styles.tribeCardForming :
                styles.tribeCardSealed
              } ${selectedTribe === tribe.id ? styles.tribeCardActive : ''}`}
              onClick={() => setSelectedTribe(selectedTribe === tribe.id ? null : tribe.id)}
            >
              <div className={styles.tribeHeader}>
                <span className={styles.tribeSigil}>{tribe.sigil}</span>
                <span className={`${styles.tribeStatus} ${getStatusClass(tribe.status)}`}>
                  {tribe.status}
                </span>
              </div>
              <h3 className={styles.tribeName}>{tribe.name}</h3>
              <p className={styles.tribeDesc}>{tribe.description}</p>
              <div className={styles.tribeMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Protocol</span>
                  <span className={styles.metaValue}>{tribe.protocol.split(' — ')[0]}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Founded</span>
                  <span className={styles.metaValue}>Epoch {tribe.epoch}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Founder</span>
                  <span className={styles.metaValue}>{tribe.founder}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Treasury</span>
                  <span className={styles.metaValue}>{tribe.treasury.toLocaleString()} {tribe.chain === 'TRON' ? 'TRX' : 'SOL'}</span>
                </div>
              </div>
              <div className={styles.tribeFooter}>
                <div className={styles.memberBar}>
                  <div className={styles.memberTrack}>
                    <div
                      className={styles.memberFill}
                      style={{ width: `${(tribe.members / tribe.maxMembers) * 100}%` }}
                    />
                  </div>
                  <span className={styles.memberCount}>
                    {tribe.members}/{tribe.maxMembers}
                  </span>
                </div>
                <span className={`${styles.chainBadge} ${
                  tribe.chain === 'TRON' ? styles.chainTron : styles.chainSolana
                }`}>
                  {tribe.chain}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.eventsSection}>
        <h2 className={styles.sectionTitle}>Tribe Events</h2>
        <p className={styles.sectionSub}>
          {selectedTribe
            ? `Showing events for ${TRIBES.find(t => t.id === selectedTribe)?.name}`
            : 'Recent activity across all tribes'}
        </p>
        <div className={styles.eventsList}>
          {filteredEvents.map((event) => {
            const tribe = TRIBES.find(t => t.id === event.tribeId)
            return (
              <div key={event.id} className={styles.eventItem}>
                <span className={styles.eventIcon}>{EVENT_ICONS[event.type]}</span>
                <div className={styles.eventContent}>
                  <p className={styles.eventDesc}>{event.description}</p>
                  <div className={styles.eventMeta}>
                    <span>{tribe?.name}</span>
                    <span>{event.actor}</span>
                    <span>{formatTime(event.timestamp)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className={styles.joinSection}>
        <h3 className={styles.joinTitle}>Found Your Own Tribe</h3>
        <p className={styles.joinDesc}>
          Every sovereign space begins with a name and a commitment. Tribes are capped at 8 members (7+1)
          to maintain intimate governance circles.
        </p>
        <div className={styles.joinForm}>
          <input
            className={styles.joinInput}
            placeholder="Enter tribe name..."
            value={tribeName}
            onChange={(e) => setTribeName(e.target.value)}
          />
          <button
            className={styles.joinBtn}
            onClick={() => {
              if (!tribeName.trim()) {
                alert('Please enter a tribe name.')
                return
              }
              alert(`Tribe "${tribeName.trim()}" initiation request submitted. On-chain registration is coming soon.`)
              setTribeName('')
            }}
          >Initiate Tribe</button>
        </div>
        <div className={styles.walletAddress}>
          <span className={styles.walletLabel}>Treasury</span>
          <span className={styles.walletValue}>{TRON_TREASURY_ADDRESS}</span>
        </div>
      </div>
    </div>
  )
}
