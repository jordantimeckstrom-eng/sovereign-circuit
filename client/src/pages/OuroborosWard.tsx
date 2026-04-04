import { useState } from 'react'
import { OUROBOROS_SECTIONS } from '../data/ouroboros'
import styles from './Whitepaper.module.css'

export default function OuroborosWard() {
  const [activeSection, setActiveSection] = useState<string | null>(
    OUROBOROS_SECTIONS[0]?.id || null
  )

  return (
    <div className={styles.whitepaper}>
      <div className={styles.header}>
        <h1>The Ouroboros Ward</h1>
        <p>An Architectural Analysis of Idempotency and System Integrity in the MVA's Heart</p>
      </div>

      <div className={styles.layout}>
        <nav className={styles.sidebar}>
          {OUROBOROS_SECTIONS.map((section) => (
            <button
              key={section.id}
              className={`${styles.sidebarItem} ${
                activeSection === section.id ? styles.sidebarActive : ''
              }`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className={styles.sidebarIcon}>{section.icon}</span>
              <span>{section.title}</span>
            </button>
          ))}
        </nav>

        <div className={styles.content}>
          {OUROBOROS_SECTIONS.map((section) => (
            <div
              key={section.id}
              id={section.id}
              className={`${styles.section} ${
                activeSection === section.id ? styles.sectionVisible : ''
              }`}
            >
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>{section.icon}</span>
                <h2>{section.title}</h2>
              </div>
              <div className={styles.sectionContent}>
                {section.content.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {section.subsections && section.subsections.length > 0 && (
                <div className={styles.subsections}>
                  {section.subsections.map((sub, i) => (
                    <div key={i} className={styles.subsection}>
                      <h3 className={styles.subsectionTitle}>{sub.title}</h3>
                      <div className={styles.subsectionContent}>
                        {sub.content.split('\n').map((para, j) => (
                          <p key={j}>{para}</p>
                        ))}
                      </div>
                    </div>
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
