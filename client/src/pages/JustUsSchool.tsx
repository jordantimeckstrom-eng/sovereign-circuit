import { useState, useEffect, useRef } from 'react'
import styles from './JustUsSchool.module.css'

interface ProtocolData {
  spaceName: string
  coreValues: string[]
  shieldMode: 'ghost' | 'accountability' | ''
  governanceModel: string
  manifesto: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const PROTOCOL_STORAGE_KEY = 'juscrSovereignProtocol'
const SOVEREIGN_SYSTEM_PROMPT = `You are "The Sovereign Guide," an AI mentor within the Just Us School of Sovereign Design. Your purpose is to help users discover, define, and build their own sovereign spaces and protocols. You speak with clarity, warmth, and authority — like a wise architect who has helped many communities build their own governance.

You help with:
- Understanding what sovereignty means in personal, community, and digital contexts
- Designing protocols: rules, rituals, values, and governance structures
- Choosing shield modes (privacy vs accountability frameworks)
- Writing manifestos and declarations of sovereign intent
- Building architectures for self-governing spaces

You never impose a single model. You ask questions, offer frameworks, and let the user decide. You believe sovereignty is not isolation — it is self-determination within connection.

Keep responses focused and practical. Use metaphors from architecture, gardening, and craftsmanship. Always affirm the user's agency.`

export default function JustUsSchool() {
  const [currentStep, setCurrentStep] = useState(0)
  const [protocol, setProtocol] = useState<ProtocolData>({
    spaceName: '',
    coreValues: [''],
    shieldMode: '',
    governanceModel: '',
    manifesto: '',
  })
  const [generatedProtocol, setGeneratedProtocol] = useState<ProtocolData | null>(null)

  const [conversationId, setConversationId] = useState<number | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [chatError, setChatError] = useState('')
  const [streamingContent, setStreamingContent] = useState('')
  const chatWindowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PROTOCOL_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setGeneratedProtocol(parsed)
        setProtocol(parsed)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
    }
  }, [chatMessages, streamingContent])

  const updateValue = (index: number, value: string) => {
    const newValues = [...protocol.coreValues]
    newValues[index] = value
    setProtocol({ ...protocol, coreValues: newValues })
  }

  const addValue = () => {
    if (protocol.coreValues.length < 5) {
      setProtocol({ ...protocol, coreValues: [...protocol.coreValues, ''] })
    }
  }

  const removeValue = (index: number) => {
    if (protocol.coreValues.length > 1) {
      const newValues = protocol.coreValues.filter((_, i) => i !== index)
      setProtocol({ ...protocol, coreValues: newValues })
    }
  }

  const getStepComplete = (step: number): boolean => {
    switch (step) {
      case 0: return protocol.spaceName.trim().length > 0
      case 1: return protocol.coreValues.some(v => v.trim().length > 0)
      case 2: return protocol.shieldMode !== ''
      case 3: return protocol.governanceModel !== ''
      case 4: return protocol.manifesto.trim().length > 0
      default: return false
    }
  }

  const allStepsComplete = () => {
    for (let i = 0; i < 5; i++) {
      if (!getStepComplete(i)) return false
    }
    return true
  }

  const generateProtocol = () => {
    const cleaned: ProtocolData = {
      ...protocol,
      coreValues: protocol.coreValues.filter(v => v.trim().length > 0),
    }
    setGeneratedProtocol(cleaned)
    localStorage.setItem(PROTOCOL_STORAGE_KEY, JSON.stringify(cleaned))
  }

  const sendMessage = async () => {
    if (!chatInput.trim() || isSending) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatError('')
    setIsSending(true)

    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])

    try {
      let convId = conversationId

      if (!convId) {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Sovereign Guide Session' }),
        })
        if (!res.ok) throw new Error('Failed to create conversation')
        const conv = await res.json()
        convId = conv.id
        setConversationId(convId)

        await fetch(`/api/conversations/${convId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: SOVEREIGN_SYSTEM_PROMPT }),
        })
      }

      const response = await fetch(`/api/conversations/${convId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMessage }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let accumulated = ''
      setStreamingContent('')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        const lines = text.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.done) {
                setChatMessages(prev => [...prev, { role: 'assistant', content: accumulated }])
                setStreamingContent('')
                accumulated = ''
              } else if (data.content) {
                accumulated += data.content
                setStreamingContent(accumulated)
              } else if (data.error) {
                throw new Error(data.error)
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue
              throw e
            }
          }
        }
      }
    } catch (err: any) {
      setChatError(err.message || 'Failed to get response')
      setStreamingContent('')
    } finally {
      setIsSending(false)
    }
  }

  const handleChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const shieldModeLabels: Record<string, string> = {
    ghost: 'Ghost Mode',
    accountability: 'Accountability Mode',
  }

  return (
    <div className={styles.school}>
      <div className={styles.hero}>
        <h1>Just Us School of Sovereign Design</h1>
        <p className={styles.heroSubtitle}>
          Build Your Own Sovereign Space. Define Your Own Protocol.
        </p>
      </div>

      <div>
        <h2 className={styles.sectionTitle}>The Three Pillars</h2>
        <p className={styles.sectionSubtitle}>
          Every sovereign space begins with understanding, designing, and building.
        </p>
        <div className={styles.pillarsGrid}>
          <div className={styles.pillarCard}>
            <span className={styles.pillarIcon}>🔍</span>
            <h3>Identify Your Sovereignty</h3>
            <p>
              Discover what sovereignty means in your context — personal, community, or digital.
              Map your boundaries, your non-negotiables, and the freedoms you refuse to surrender.
              Sovereignty starts with knowing what is yours to govern.
            </p>
          </div>
          <div className={styles.pillarCard}>
            <span className={styles.pillarIcon}>📐</span>
            <h3>Design Your Protocol</h3>
            <p>
              A guided framework for creating your own rules, rituals, and governance structures.
              Define how decisions are made, how conflicts resolve, and how your space evolves.
              Your protocol is your constitution — written by you, for you.
            </p>
          </div>
          <div className={styles.pillarCard}>
            <span className={styles.pillarIcon}>🏗️</span>
            <h3>Build Your Space</h3>
            <p>
              Tools and templates for implementing your sovereign architecture. From digital
              sanctuaries to community councils, turn your protocol into a living system.
              Build not just walls, but doorways — on your terms.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.builderSection}>
        <h2>Protocol Builder</h2>
        <p className={styles.builderDesc}>
          Walk through each step to craft your sovereign protocol. Your progress is saved locally.
        </p>

        <div className={styles.stepIndicator}>
          {[1, 2, 3, 4, 5].map((num, i) => (
            <button
              key={i}
              className={`${styles.stepDot} ${currentStep === i ? styles.stepDotActive : ''} ${getStepComplete(i) && currentStep !== i ? styles.stepDotComplete : ''}`}
              onClick={() => setCurrentStep(i)}
            >
              {getStepComplete(i) && currentStep !== i ? '✓' : num}
            </button>
          ))}
        </div>

        <div className={styles.stepContent}>
          {currentStep === 0 && (
            <>
              <span className={styles.stepLabel}>Step 1 of 5</span>
              <h3 className={styles.stepTitle}>Name Your Space</h3>
              <div className={styles.formGroup}>
                <label>What will you call your sovereign space?</label>
                <input
                  type="text"
                  className={styles.input}
                  value={protocol.spaceName}
                  onChange={(e) => setProtocol({ ...protocol, spaceName: e.target.value })}
                  placeholder="e.g., The Inner Council, Midnight Forge, Sovereign Nexus..."
                />
              </div>
            </>
          )}

          {currentStep === 1 && (
            <>
              <span className={styles.stepLabel}>Step 2 of 5</span>
              <h3 className={styles.stepTitle}>Define Your Core Values</h3>
              <div className={styles.formGroup}>
                <label>Add up to 5 values that anchor your space</label>
                <div className={styles.valuesContainer}>
                  {protocol.coreValues.map((value, i) => (
                    <div key={i} className={styles.valueRow}>
                      <input
                        type="text"
                        className={styles.input}
                        value={value}
                        onChange={(e) => updateValue(i, e.target.value)}
                        placeholder={`Value ${i + 1} (e.g., Transparency, Autonomy, Truth...)`}
                      />
                      {protocol.coreValues.length > 1 && (
                        <button
                          className={styles.removeValueBtn}
                          onClick={() => removeValue(i)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    className={styles.addValueBtn}
                    onClick={addValue}
                    disabled={protocol.coreValues.length >= 5}
                  >
                    + Add Value {protocol.coreValues.length < 5 ? `(${5 - protocol.coreValues.length} remaining)` : '(max reached)'}
                  </button>
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <span className={styles.stepLabel}>Step 3 of 5</span>
              <h3 className={styles.stepTitle}>Choose Your Shield Mode</h3>
              <div className={styles.radioGroup}>
                <div
                  className={`${styles.radioOption} ${protocol.shieldMode === 'ghost' ? styles.radioOptionSelected : ''}`}
                  onClick={() => setProtocol({ ...protocol, shieldMode: 'ghost' })}
                >
                  <div className={`${styles.radioCircle} ${protocol.shieldMode === 'ghost' ? styles.radioCircleSelected : ''}`} />
                  <div className={styles.radioContent}>
                    <h4>👻 Ghost Mode</h4>
                    <p>
                      Maximum privacy and anonymity. Your space operates in the shadows — visible only to those you invite.
                      No public records, no external accountability. Sovereignty through invisibility.
                    </p>
                  </div>
                </div>
                <div
                  className={`${styles.radioOption} ${protocol.shieldMode === 'accountability' ? styles.radioOptionSelected : ''}`}
                  onClick={() => setProtocol({ ...protocol, shieldMode: 'accountability' })}
                >
                  <div className={`${styles.radioCircle} ${protocol.shieldMode === 'accountability' ? styles.radioCircleSelected : ''}`} />
                  <div className={styles.radioContent}>
                    <h4>🛡️ Accountability Mode</h4>
                    <p>
                      Transparent governance with public attestations. Your space is visible, your decisions are recorded,
                      and your protocol is open to inspection. Sovereignty through integrity.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <span className={styles.stepLabel}>Step 4 of 5</span>
              <h3 className={styles.stepTitle}>Set Your Governance Model</h3>
              <div className={styles.formGroup}>
                <label>How will decisions be made in your space?</label>
                <select
                  className={styles.input}
                  value={protocol.governanceModel}
                  onChange={(e) => setProtocol({ ...protocol, governanceModel: e.target.value })}
                >
                  <option value="">Select a governance model...</option>
                  <option value="Solo Sovereign">Solo Sovereign — One voice, one authority, full responsibility</option>
                  <option value="Council of Equals">Council of Equals — Every member has equal vote and voice</option>
                  <option value="Weighted Consensus">Weighted Consensus — Votes weighted by contribution, trust, or stake</option>
                </select>
              </div>
            </>
          )}

          {currentStep === 4 && (
            <>
              <span className={styles.stepLabel}>Step 5 of 5</span>
              <h3 className={styles.stepTitle}>Write Your Manifesto</h3>
              <div className={styles.formGroup}>
                <label>Declare the purpose and spirit of your sovereign space</label>
                <textarea
                  className={styles.textarea}
                  value={protocol.manifesto}
                  onChange={(e) => setProtocol({ ...protocol, manifesto: e.target.value })}
                  placeholder="We build this space because... Our sovereignty means... We commit to..."
                  rows={8}
                />
              </div>
            </>
          )}

          <div className={styles.stepNav}>
            {currentStep > 0 && (
              <button className={styles.stepNavBtn} onClick={() => setCurrentStep(currentStep - 1)}>
                ← Previous
              </button>
            )}
            {currentStep < 4 && (
              <button
                className={styles.stepNavBtn}
                onClick={() => setCurrentStep(currentStep + 1)}
                style={{ marginLeft: 'auto' }}
              >
                Next →
              </button>
            )}
          </div>

          {currentStep === 4 && (
            <button
              className={styles.generateBtn}
              onClick={generateProtocol}
              disabled={!allStepsComplete()}
            >
              Generate Protocol
            </button>
          )}
        </div>

        {generatedProtocol && (
          <div className={styles.protocolOutput}>
            <h3>⚡ Your Sovereign Protocol</h3>
            <div className={styles.protocolField}>
              <span className={styles.protocolLabel}>Space Name</span>
              <div className={styles.protocolValue}>{generatedProtocol.spaceName}</div>
            </div>
            <div className={styles.protocolField}>
              <span className={styles.protocolLabel}>Core Values</span>
              <div className={styles.protocolValues}>
                {generatedProtocol.coreValues.map((v, i) => (
                  <span key={i} className={styles.protocolValueTag}>{v}</span>
                ))}
              </div>
            </div>
            <div className={styles.protocolField}>
              <span className={styles.protocolLabel}>Shield Mode</span>
              <div className={styles.protocolValue}>
                {shieldModeLabels[generatedProtocol.shieldMode] || generatedProtocol.shieldMode}
              </div>
            </div>
            <div className={styles.protocolField}>
              <span className={styles.protocolLabel}>Governance Model</span>
              <div className={styles.protocolValue}>{generatedProtocol.governanceModel}</div>
            </div>
            <div className={styles.protocolField}>
              <span className={styles.protocolLabel}>Manifesto</span>
              <div className={styles.protocolValue}>{generatedProtocol.manifesto}</div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.guideSection}>
        <div className={styles.guideHeader}>
          <span className={styles.guideIcon}>🧭</span>
          <div className={styles.guideHeaderText}>
            <h2>The Sovereign Guide</h2>
            <p>Ask questions about sovereignty, protocol design, governance, or building your space</p>
          </div>
        </div>

        <div className={styles.chatWindow} ref={chatWindowRef}>
          {chatMessages.length === 0 && !streamingContent ? (
            <div className={styles.chatEmpty}>
              <span>🏛️</span>
              <p>
                Welcome to the Sovereign Guide. Ask anything about designing your own
                sovereign space, building governance protocols, or understanding self-determination
                in personal, community, or digital contexts.
              </p>
            </div>
          ) : (
            <>
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageAssistant}`}
                >
                  {msg.content}
                </div>
              ))}
              {streamingContent && (
                <div className={`${styles.message} ${styles.messageAssistant} ${styles.messageStreaming}`}>
                  {streamingContent}
                </div>
              )}
            </>
          )}
        </div>

        {chatError && <div className={styles.chatError}>{chatError}</div>}

        <div className={styles.chatInputArea}>
          <input
            type="text"
            className={styles.chatInput}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleChatKeyDown}
            placeholder="Ask the Sovereign Guide..."
            disabled={isSending}
          />
          <button
            className={styles.chatSendBtn}
            onClick={sendMessage}
            disabled={isSending || !chatInput.trim()}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
