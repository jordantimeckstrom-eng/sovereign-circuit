import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { EPOCHS } from '../data/governance'
import styles from './Dashboard.module.css'

interface SovereignIdentity {
  name: string
  address: string
  mintTx: string
  mintDate: string
  status: string
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [sovereign, setSovereign] = useState<SovereignIdentity | null>(null)
  const activeEpoch = EPOCHS.find((e) => e.status === 'active')

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetch('/api/base/sovereign')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setSovereign(data)
      })
      .catch(() => {})
  }, [])

  const getEpochProgress = () => {
    if (!activeEpoch) return 0
    const start = new Date(activeEpoch.startDate).getTime()
    const end = new Date(activeEpoch.endDate).getTime()
    const now = currentTime.getTime()
    return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100))
  }

  const getTimeRemaining = () => {
    if (!activeEpoch) return 'N/A'
    const end = new Date(activeEpoch.endDate).getTime()
    const diff = end - currentTime.getTime()
    if (diff <= 0) return 'Epoch Complete'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const secs = Math.floor((diff % (1000 * 60)) / 1000)
    return `${days}d ${hours}h ${mins}m ${secs}s`
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Time Governance</h1>
        <p className={styles.subtitle}>Sovereign Circuit &middot; Decentralized Ritual System</p>
        <p className={styles.tagline}>
          Where protocol meets purpose. Govern time, anchor sovereignty, activate the dawn.
        </p>
      </div>

      <div className={styles.epochBanner}>
        <div className={styles.epochHeader}>
          <div>
            <span className={styles.epochLabel}>Current Epoch</span>
            <h2 className={styles.epochName}>{activeEpoch?.name || 'No Active Epoch'}</h2>
          </div>
          <div className={styles.epochTimer}>
            <span className={styles.timerLabel}>Time Remaining</span>
            <span className={styles.timerValue}>{getTimeRemaining()}</span>
          </div>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${getEpochProgress()}%` }}
          />
        </div>
        <div className={styles.epochStats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{activeEpoch?.totalBids || 0}</span>
            <span className={styles.statLabel}>Time Bids</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>8</span>
            <span className={styles.statLabel}>Time Slots Available</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{EPOCHS.filter(e => e.status === 'completed').length}</span>
            <span className={styles.statLabel}>Epochs Completed</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className={styles.statLabel}>System Clock</span>
          </div>
        </div>
      </div>

      {sovereign && (
        <div className={styles.sovereignBond}>
          <div className={styles.sovereignHeader}>
            <div className={styles.sovereignIcon}>⬡</div>
            <div>
              <span className={styles.sovereignLabel}>Sovereign Identity Bond</span>
              <h2 className={styles.sovereignName}>{sovereign.name}</h2>
            </div>
            <div className={styles.sovereignStatus}>
              <span className={styles.sovereignStatusDot}></span>
              {sovereign.status}
            </div>
          </div>
          <div className={styles.sovereignDetails}>
            <div className={styles.sovereignDetail}>
              <span className={styles.sovereignDetailLabel}>Owner</span>
              {sovereign.address ? (
                <a
                  href={`https://basescan.org/address/${sovereign.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.sovereignLink}
                >
                  {sovereign.address.slice(0, 6)}...{sovereign.address.slice(-4)}
                </a>
              ) : (
                <span className={styles.sovereignDetailValue}>Resolving...</span>
              )}
            </div>
            <div className={styles.sovereignDetail}>
              <span className={styles.sovereignDetailLabel}>Minted</span>
              <span className={styles.sovereignDetailValue}>
                {new Date(sovereign.mintDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className={styles.sovereignDetail}>
              <span className={styles.sovereignDetailLabel}>Mint TX</span>
              {sovereign.mintTx ? (
                <a
                  href={`https://basescan.org/tx/${sovereign.mintTx}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.sovereignLink}
                >
                  {sovereign.mintTx.slice(0, 8)}...{sovereign.mintTx.slice(-4)}
                </a>
              ) : (
                <span className={styles.sovereignDetailValue}>Pending</span>
              )}
            </div>
            <div className={styles.sovereignDetail}>
              <span className={styles.sovereignDetailLabel}>Chain</span>
              <span className={styles.sovereignDetailValue}>Base L2</span>
            </div>
          </div>
          <p className={styles.sovereignQuote}>
            "This identity is the on-chain anchor of the Sovereign Circuit. All governance, all time, all protocol — bonded here."
          </p>
        </div>
      )}

      <div className={styles.cards}>
        <Link to="/governance" className={styles.card}>
          <span className={styles.cardIcon}>⏳</span>
          <h3>Time Governance</h3>
          <p>View epochs, vote on proposals, and participate in governance.</p>
        </Link>
        <Link to="/calendar" className={styles.card}>
          <span className={styles.cardIcon}>📅</span>
          <h3>Calendar</h3>
          <p>Browse and bid on weekly time auction slots. 8 blocks available each week.</p>
        </Link>
        <Link to="/community" className={styles.card}>
          <span className={styles.cardIcon}>🤝</span>
          <h3>Community Projects</h3>
          <p>Submit project needs, vote on priorities, funded by 50% of auction revenue.</p>
        </Link>
        <Link to="/curriculum" className={styles.card}>
          <span className={styles.cardIcon}>📜</span>
          <h3>Curriculum</h3>
          <p>Walk the sovereign path. Four lessons of architecture, ritual, and deployment.</p>
        </Link>
        <Link to="/whitepaper" className={styles.card}>
          <span className={styles.cardIcon}>🛡</span>
          <h3>Whitepaper</h3>
          <p>Explore the philosophical and technical foundations of the sovereign system.</p>
        </Link>
        <Link to="/tribes" className={styles.card}>
          <span className={styles.cardIcon}>⚔</span>
          <h3>Tribes</h3>
          <p>Join or found sovereign collectives. Govern together in circles of 7+1.</p>
        </Link>
        <Link to="/reflection" className={styles.card}>
          <span className={styles.cardIcon}>🔮</span>
          <h3>Echo Chamber</h3>
          <p>Reflect, write, and receive gentle inversions from the other side.</p>
        </Link>
        <Link to="/base" className={`${styles.card} ${styles.cardBase}`}>
          <span className={styles.cardIcon}>🔵</span>
          <h3>Base Explorer</h3>
          <p>Query the Base L2 network. Look up addresses, transactions, and network status.</p>
        </Link>
      </div>

      <div className={styles.disclaimer}>
        <p className={styles.disclaimerText}>
          I always reserve the right to change my mind and withdraw my time. I got hacked up. I want to provide my time, not surrender it.
        </p>
      </div>

      <div className={styles.dawnProtocol}>
        <h3 className={styles.dawnTitle}>Dawn Activation Protocol</h3>
        <div className={styles.dawnSteps}>
          <div className={styles.dawnStep}>
            <span className={styles.dawnNum}>I</span>
            <p>"The Interface is bound. The coordinates are set. The sovereign circuit is complete."</p>
          </div>
          <div className={styles.dawnStep}>
            <span className={styles.dawnNum}>II</span>
            <p>"Let this commit be a vow. Let this message be a marker in the ledger of our becoming."</p>
          </div>
          <div className={styles.dawnStep}>
            <span className={styles.dawnNum}>III</span>
            <p>"The sunrise is waiting for the Interface. And now — it rises with us."</p>
          </div>
        </div>
      </div>
    </div>
  )
}
