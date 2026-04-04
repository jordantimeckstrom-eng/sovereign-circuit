import { useState } from 'react'
import { LESSONS, MODULE_TITLE, MODULE_SUBTITLE, MODULE_DESCRIPTION, CAPSTONE } from '../data/curriculum'
import type { Section } from '../data/curriculum'
import styles from './Curriculum.module.css'

const sectionIcons: Record<Section['type'], string> = {
  reading: '📖',
  lecture: '🎓',
  exercise: '✍️',
  ritual: '🕯',
}

export default function Curriculum() {
  const [activeLesson, setActiveLesson] = useState<string | null>(null)
  const [completedSections, setCompletedSections] = useState<Set<string>>(
    () => {
      try {
        const saved = localStorage.getItem('completedSections')
        return saved ? new Set(JSON.parse(saved)) : new Set<string>()
      } catch {
        return new Set<string>()
      }
    }
  )

  const toggleSection = (sectionId: string) => {
    setCompletedSections((prev) => {
      const next = new Set(prev)
      if (next.has(sectionId)) {
        next.delete(sectionId)
      } else {
        next.add(sectionId)
      }
      localStorage.setItem('completedSections', JSON.stringify([...next]))
      return next
    })
  }

  const getLessonProgress = (lessonId: string) => {
    const lesson = LESSONS.find((l) => l.id === lessonId)
    if (!lesson) return 0
    const completed = lesson.sections.filter((s) => completedSections.has(s.id)).length
    return Math.round((completed / lesson.sections.length) * 100)
  }

  return (
    <div className={styles.curriculum}>
      <div className={styles.header}>
        <h1>{MODULE_TITLE}</h1>
        <p className={styles.subtitle}>{MODULE_SUBTITLE}</p>
        <p className={styles.description}>{MODULE_DESCRIPTION}</p>
      </div>

      <div className={styles.lessons}>
        {LESSONS.map((lesson) => (
          <div key={lesson.id} className={styles.lessonCard}>
            <button
              className={styles.lessonHeader}
              onClick={() =>
                setActiveLesson(activeLesson === lesson.id ? null : lesson.id)
              }
            >
              <div className={styles.lessonLeft}>
                <span className={styles.lessonNum}>Lesson {lesson.number}</span>
                <h3 className={styles.lessonTitle}>{lesson.title}</h3>
                <p className={styles.lessonSubtitle}>{lesson.subtitle}</p>
              </div>
              <div className={styles.lessonRight}>
                <div className={styles.progressRing}>
                  <svg viewBox="0 0 36 36" className={styles.ringsvg}>
                    <path
                      className={styles.ringBg}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={styles.ringFill}
                      strokeDasharray={`${getLessonProgress(lesson.id)}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className={styles.progressText}>
                    {getLessonProgress(lesson.id)}%
                  </span>
                </div>
                <span className={styles.expandIcon}>
                  {activeLesson === lesson.id ? '▲' : '▼'}
                </span>
              </div>
            </button>

            {activeLesson === lesson.id && (
              <div className={styles.sections}>
                {lesson.sections.map((section) => (
                  <div key={section.id} className={styles.sectionCard}>
                    <div className={styles.sectionHeader}>
                      <span className={styles.sectionIcon}>
                        {sectionIcons[section.type]}
                      </span>
                      <span className={styles.sectionType}>{section.title}</span>
                      <button
                        className={`${styles.checkBtn} ${
                          completedSections.has(section.id) ? styles.checked : ''
                        }`}
                        onClick={() => toggleSection(section.id)}
                      >
                        {completedSections.has(section.id) ? '✓' : '○'}
                      </button>
                    </div>
                    <p className={styles.sectionContent}>{section.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.capstone}>
        <h2>Capstone: {CAPSTONE.title}</h2>
        <ol className={styles.capstoneSteps}>
          {CAPSTONE.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>
    </div>
  )
}
