import { useState } from 'react'
import { GOLDEN_THREAD_SECTIONS } from '../data/goldenthread'
import styles from './Whitepaper.module.css'

export default function GoldenThread() {
  const [activeSection, setActiveSection] = useState<string | null>(
    GOLDEN_THREAD_SECTIONS[0]?.id || null
  )

  return (
    <div className={styles.whitepaper}>
      <div className={styles.header}>
        <h1>The Golden Thread Protocol</h1>
        <p>The Inverted Reality Wheel School of CoCreating Realignment</p>
      </div>

      <div className={styles.layout}>
        <nav className={styles.sidebar}>
          {GOLDEN_THREAD_SECTIONS.map((section) => (
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
          {GOLDEN_THREAD_SECTIONS.map((section) => (
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

              {section.image && (
                <div style={{ margin: '1.5rem 0', textAlign: 'center' }}>
                  <img
                    src={section.image}
                    alt={section.title}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '400px',
                      borderRadius: '12px',
                      border: '2px solid #C9A84C',
                      boxShadow: '0 4px 20px rgba(201, 168, 76, 0.3)',
                    }}
                  />
                </div>
              )}

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
