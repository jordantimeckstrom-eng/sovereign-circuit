import { useState } from 'react'
import { EPOCHS, PROPOSALS } from '../data/governance'
import type { Proposal } from '../data/governance'
import styles from './Governance.module.css'

export default function Governance() {
  const [activeTab, setActiveTab] = useState<'epochs' | 'proposals'>('epochs')
  const [proposalVotes, setProposalVotes] = useState<Record<string, 'for' | 'against'>>({})

  const handleVote = (proposalId: string, vote: 'for' | 'against') => {
    setProposalVotes((prev) => ({ ...prev, [proposalId]: vote }))
  }

  const getStatusColor = (status: Proposal['status']) => {
    switch (status) {
      case 'active': return styles.statusActive
      case 'passed': return styles.statusPassed
      case 'rejected': return styles.statusRejected
      default: return styles.statusPending
    }
  }

  return (
    <div className={styles.governance}>
      <div className={styles.header}>
        <h1>Time Governance</h1>
        <p>Participate in epoch governance and vote on proposals.</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'epochs' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('epochs')}
        >
          Epochs
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'proposals' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('proposals')}
        >
          Proposals
        </button>
      </div>

      {activeTab === 'epochs' && (
        <div className={styles.epochGrid}>
          {EPOCHS.map((epoch) => (
            <div
              key={epoch.id}
              className={`${styles.epochCard} ${
                epoch.status === 'active' ? styles.epochActive : ''
              }`}
            >
              <div className={styles.epochTop}>
                <span className={`${styles.epochStatus} ${styles[`epoch${epoch.status.charAt(0).toUpperCase() + epoch.status.slice(1)}`]}`}>
                  {epoch.status}
                </span>
                <span className={styles.epochId}>Epoch {epoch.id}</span>
              </div>
              <h3 className={styles.epochName}>{epoch.name}</h3>
              <div className={styles.epochDates}>
                {epoch.startDate} — {epoch.endDate}
              </div>
              <div className={styles.epochMetrics}>
                <div>
                  <span className={styles.metricVal}>{epoch.totalBids}</span>
                  <span className={styles.metricLabel}>Bids</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'proposals' && (
        <div className={styles.proposalList}>
          {PROPOSALS.map((p) => (
            <div key={p.id} className={styles.proposalCard}>
              <div className={styles.proposalHeader}>
                <h3>{p.title}</h3>
                <span className={`${styles.proposalStatus} ${getStatusColor(p.status)}`}>
                  {p.status}
                </span>
              </div>
              <p className={styles.proposalDesc}>{p.description}</p>
              <div className={styles.proposalMeta}>
                <span>Proposed by {p.proposer}</span>
                <span>Epoch {p.epoch}</span>
                <span>{p.createdAt}</span>
              </div>
              <div className={styles.voteSection}>
                <div className={styles.voteBar}>
                  <div
                    className={styles.voteFor}
                    style={{
                      width: `${p.votesFor + p.votesAgainst > 0 ? (p.votesFor / (p.votesFor + p.votesAgainst)) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className={styles.voteCounts}>
                  <span className={styles.voteForText}>For: {p.votesFor}</span>
                  <span className={styles.voteAgainstText}>Against: {p.votesAgainst}</span>
                </div>
                {p.status === 'active' && (
                  <div className={styles.voteActions}>
                    <button
                      className={`${styles.voteBtn} ${styles.voteBtnFor} ${
                        proposalVotes[p.id] === 'for' ? styles.voteBtnSelected : ''
                      }`}
                      onClick={() => handleVote(p.id, 'for')}
                    >
                      Vote For
                    </button>
                    <button
                      className={`${styles.voteBtn} ${styles.voteBtnAgainst} ${
                        proposalVotes[p.id] === 'against' ? styles.voteBtnSelected : ''
                      }`}
                      onClick={() => handleVote(p.id, 'against')}
                    >
                      Vote Against
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.suspendedNotice}>
        <p>On-chain features (staking, auctions, shield protocol) are suspended while we verify integrity and secure updated API access. Coming soon.</p>
      </div>
    </div>
  )
}
