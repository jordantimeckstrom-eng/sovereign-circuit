import { useState, useEffect } from 'react'
import styles from './Reflection.module.css'

interface ReflectionEntry {
  text: string;
  inverted: string;
  date: string;
}

const HISTORY_KEY = 'juscrReflections'

function gentleInversion(text: string): string {
  const lowers = text.toLowerCase()
  if (lowers.includes('forget') || lowers.includes('loop') || lowers.includes('reset')) {
    return "The loop is the classroom. Every reset is a new chance to see clearer."
  }
  if (lowers.includes('stuck') || lowers.includes("can't"))
    return "What if the stuck place is actually protecting something important?"
  if (lowers.includes('confused') || lowers.includes('?'))
    return "The confusion might be the edge where clarity is about to arrive."
  if (lowers.includes('left out') || lowers.includes('alone'))
    return "The part that feels left out often holds the key the rest is looking for."
  if (lowers.includes('sovereign') || lowers.includes('free'))
    return "Sovereignty begins when you stop asking for permission to be yourself."
  if (lowers.includes('time') || lowers.includes('wait'))
    return "Time is not your enemy. It is the canvas on which your governance is written."
  if (lowers.includes('afraid') || lowers.includes('fear'))
    return "Fear is the threshold guardian. It only blocks those who haven't named it yet."
  if (lowers.includes('trust'))
    return "Trust is not given or earned. In the sovereign circuit, trust is attested — verified by action, anchored in code."

  return (
    "Seen from the quiet side: sometimes '" +
    text.split(' ').slice(0, 3).join(' ') +
    "...' is already the beginning of kindness."
  )
}

export default function Reflection() {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<ReflectionEntry[]>([])
  const [currentReflection, setCurrentReflection] = useState<ReflectionEntry | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY)
      if (saved) setHistory(JSON.parse(saved))
    } catch {
      setHistory([])
    }
  }, [])

  const handleSubmit = () => {
    if (!input.trim()) return

    const inverted = gentleInversion(input.trim())
    const entry: ReflectionEntry = {
      text: input.trim(),
      inverted,
      date: new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    }

    setCurrentReflection(entry)
    const newHistory = [entry, ...history]
    setHistory(newHistory)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory))
    setInput('')
  }

  const loadIntoBox = (index: number) => {
    setInput(history[index].text)
  }

  return (
    <div className={styles.reflection}>
      <div className={styles.header}>
        <h1>Echo Chamber</h1>
        <p className={styles.subtitle}>Clarity is kindness</p>
        <p className={styles.description}>
          Write something that's on your mind — a question, a feeling, a stuck place.
          The echo listens and reflects from the other side.
        </p>
      </div>

      <div className={styles.inputArea}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What's on your mind right now..."
          className={styles.textarea}
          rows={5}
        />
        <button onClick={handleSubmit} className={styles.sendBtn}>
          Send to the echo
        </button>
      </div>

      {currentReflection && (
        <div className={styles.response}>
          <div className={styles.yourWords}>
            <span className={styles.responseLabel}>Your words</span>
            <p>{currentReflection.text}</p>
          </div>
          <div className={styles.otherSide}>
            <span className={styles.responseLabel}>From the other side</span>
            <p>{currentReflection.inverted}</p>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className={styles.history}>
          <h3 className={styles.historyTitle}>Past Reflections</h3>
          {history.map((entry, index) => (
            <div key={index} className={styles.historyEntry}>
              <span className={styles.historyDate}>{entry.date}</span>
              <p className={styles.historyText}>
                <strong>You said:</strong> {entry.text}
              </p>
              <p className={styles.historyInverted}>
                <strong>From the other side:</strong> {entry.inverted}
              </p>
              <button
                onClick={() => loadIntoBox(index)}
                className={styles.continueBtn}
              >
                Continue this →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
