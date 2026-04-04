import { useState } from 'react'
import { WHITEPAPER_SECTIONS } from '../data/whitepaper'
import styles from './Whitepaper.module.css'

export default function Whitepaper() {
  const [activeSection, setActiveSection] = useState<string | null>(
    WHITEPAPER_SECTIONS[0]?.id || null
  )

  return (
    <div className={styles.whitepaper}>
      <div className={styles.header}>
        <h1>Master Interface as a Sovereign Ritual System</h1>
        <p>Synthesizing Mobile Sovereignty: Decentralized Ritual, Technical Architecture, and Participatory Curriculum</p>
      </div>

      <div className={styles.layout}>
        <nav className={styles.sidebar}>
          {WHITEPAPER_SECTIONS.map((section) => (
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
          {WHITEPAPER_SECTIONS.map((section) => (
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
