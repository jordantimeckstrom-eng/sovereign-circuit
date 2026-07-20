import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useLedger } from '../context/LedgerContext'
import { TRIBES } from '../data/tribes'

// ── Lore data ────────────────────────────────────────────────────────────────
const EARTH_FRAMES = [
  'Cervical', 'Thoracic', 'Lumbar', 'Hips', 'Shoulders', 'Breath', 'Posture',
]
const HEAVEN_FRAMES = ['Dawn', 'Dusk', 'Thread', 'Echo', 'Forge', 'Ward', 'Sovereign']
const HELL_FRAMES = ['LENA', 'BRAM', 'SERA', 'ORION', 'IVY', 'MARO', 'CANTO']

type RingId = 'earth' | 'heaven' | 'hell'

const RINGS: { id: RingId; label: string; color: string; y: number; frames: string[] }[] = [
  { id: 'heaven', label: 'Heaven 7', color: '#C9A84C', y: 1.35, frames: HEAVEN_FRAMES },
  { id: 'earth', label: 'Earth 7', color: '#3FB68B', y: 0, frames: EARTH_FRAMES },
  { id: 'hell', label: 'Hell 7', color: '#E05252', y: -1.35, frames: HELL_FRAMES },
]

// Coupling: turning Earth also turns Heaven; Heaven also turns Hell; Hell turns alone.
const COUPLING: Record<RingId, RingId[]> = {
  earth: ['earth', 'heaven'],
  heaven: ['heaven', 'hell'],
  hell: ['hell'],
}

type Offsets = Record<RingId, number>
const SEG = (Math.PI * 2) / 7

function scramble(): Offsets {
  const r = () => 1 + Math.floor(Math.random() * 6) // never already aligned
  return { earth: r(), heaven: r(), hell: r() }
}

const BEST_KEY = 'sovereign_spine_game_best'
const ROUND_KEY = 'sovereign_spine_game_rounds'

// ── 3D pieces ────────────────────────────────────────────────────────────────
function Ring({
  color,
  y,
  offset,
  onTurn,
  highlight,
}: {
  color: string
  y: number
  offset: number
  onTurn: () => void
  highlight: boolean
}) {
  const group = useRef<THREE.Group>(null)
  const target = offset * SEG
  useFrame(() => {
    if (!group.current) return
    group.current.rotation.y += (target - group.current.rotation.y) * 0.12
  })
  const segments = useMemo(() => Array.from({ length: 7 }, (_, i) => i), [])
  return (
    <group ref={group} position={[0, y, 0]}>
      {segments.map((i) => {
        const angle = i * SEG
        const keystone = i === 0
        return (
          <mesh
            key={i}
            position={[Math.sin(angle) * 1.6, 0, Math.cos(angle) * 1.6]}
            rotation={[0, angle, 0]}
            onClick={(e) => {
              e.stopPropagation()
              onTurn()
            }}
          >
            <boxGeometry args={keystone ? [0.55, 0.55, 0.28] : [0.45, 0.38, 0.22]} />
            <meshStandardMaterial
              color={keystone ? '#F5F0E1' : color}
              emissive={keystone ? color : '#000000'}
              emissiveIntensity={keystone ? (highlight ? 1.4 : 0.5) : 0}
              metalness={0.4}
              roughness={0.35}
            />
          </mesh>
        )
      })}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.03, 12, 64]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

function SpineAxis({ aligned }: { aligned: boolean }) {
  const pt = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (pt.current) {
      const s = 1 + Math.sin(clock.elapsedTime * (aligned ? 6 : 2)) * 0.08
      pt.current.scale.setScalar(s)
    }
  })
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 4.4, 12]} />
        <meshStandardMaterial
          color="#C9A84C"
          emissive="#C9A84C"
          emissiveIntensity={aligned ? 1.2 : 0.25}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>
      {/* The Point — frame 1 of 22 */}
      <mesh ref={pt} position={[0, 2.5, 0]}>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial
          color="#F5F0E1"
          emissive="#C9A84C"
          emissiveIntensity={aligned ? 2 : 0.6}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
      {/* Meridian marker: where keystones must land */}
      <mesh position={[0, 0, 2.15]}>
        <boxGeometry args={[0.06, 4.4, 0.06]} />
        <meshStandardMaterial color="#C9A84C" emissive="#C9A84C" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

// ── UI styles ────────────────────────────────────────────────────────────────
const gold = '#C9A84C'
const panel: React.CSSProperties = {
  background: 'rgba(13,13,26,0.92)',
  border: `1px solid ${gold}44`,
  borderRadius: 10,
  padding: '0.9rem 1.1rem',
  color: '#F5F0E1',
}
const btn: React.CSSProperties = {
  background: 'transparent',
  border: `1px solid ${gold}`,
  color: gold,
  padding: '0.45rem 1rem',
  borderRadius: 8,
  cursor: 'pointer',
  fontSize: '0.85rem',
}

const BREATH_MS = 4000

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

class CanvasBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

// 2D fallback: same puzzle, drawn as three flat wheels.
function FlatWheel({ offsets }: { offsets: Offsets }) {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2.5rem',
        flexWrap: 'wrap',
      }}
    >
      {RINGS.map((r) => (
        <div key={r.id} style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: '50%',
              border: `2px solid ${r.color}`,
              position: 'relative',
              transition: 'transform 0.4s',
              transform: `rotate(${offsets[r.id] * (360 / 7)}deg)`,
              margin: '0 auto',
            }}
          >
            {r.frames.map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: i === 0 ? 18 : 12,
                  height: i === 0 ? 18 : 12,
                  borderRadius: 3,
                  background: i === 0 ? '#F5F0E1' : r.color,
                  transform: `rotate(${i * (360 / 7)}deg) translateY(-64px) translate(-50%,-50%)`,
                  transformOrigin: '0 0',
                }}
              />
            ))}
            <div
              style={{
                position: 'absolute',
                top: -12,
                left: '50%',
                width: 2,
                height: 10,
                background: gold,
                transform: `translateX(-50%) rotate(${-offsets[r.id] * (360 / 7)}deg)`,
              }}
            />
          </div>
          <div style={{ color: r.color, marginTop: 8, fontSize: '0.85rem' }}>
            {r.label} {offsets[r.id] === 0 ? '✓' : ''}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SpineGame() {
  const { state, dispatch } = useLedger()
  const [offsets, setOffsets] = useState<Offsets>(scramble)
  const [moves, setMoves] = useState(0)
  const [rounds, setRounds] = useState<number>(() => Number(localStorage.getItem(ROUND_KEY) ?? 0))
  const [best, setBest] = useState<number | null>(() => {
    const v = localStorage.getItem(BEST_KEY)
    return v ? Number(v) : null
  })
  const [breathing, setBreathing] = useState(false)
  const [breathPct, setBreathPct] = useState(0)
  const [sealedFlash, setSealedFlash] = useState(false)
  const breathTimer = useRef<number | null>(null)
  const breathStart = useRef(0)
  const breathingRef = useRef(false)

  const aligned = offsets.earth === 0 && offsets.heaven === 0 && offsets.hell === 0
  const hour = new Date().getHours()
  const ceremony = hour < 12 ? 'Dawn' : 'Dusk'
  const tribe = useMemo(() => TRIBES[rounds % TRIBES.length], [rounds])

  const turn = useCallback((ring: RingId) => {
    // Rings are locked while the breath seal is in progress
    if (breathingRef.current) return
    setOffsets((prev) => {
      const next = { ...prev }
      for (const r of COUPLING[ring]) next[r] = (next[r] + 1) % 7
      return next
    })
    setMoves((m) => m + 1)
  }, [])

  const stopBreath = useCallback(() => {
    if (breathTimer.current) cancelAnimationFrame(breathTimer.current)
    breathTimer.current = null
    breathingRef.current = false
    setBreathing(false)
    setBreathPct(0)
  }, [])

  const seal = useCallback(() => {
    stopBreath()
    dispatch({ type: 'INCREMENT_CHAIN' })
    setBest((prev) => {
      const b = prev === null ? moves : Math.min(prev, moves)
      localStorage.setItem(BEST_KEY, String(b))
      return b
    })
    setRounds((r) => {
      localStorage.setItem(ROUND_KEY, String(r + 1))
      return r + 1
    })
    setSealedFlash(true)
    setTimeout(() => setSealedFlash(false), 2200)
    setMoves(0)
    setOffsets(scramble())
  }, [dispatch, moves, stopBreath])

  const startBreath = useCallback(() => {
    if (!aligned || breathingRef.current) return
    breathingRef.current = true
    setBreathing(true)
    breathStart.current = performance.now()
    const tick = () => {
      const pct = Math.min(1, (performance.now() - breathStart.current) / BREATH_MS)
      setBreathPct(pct)
      if (pct >= 1) {
        seal()
      } else {
        breathTimer.current = requestAnimationFrame(tick)
      }
    }
    breathTimer.current = requestAnimationFrame(tick)
  }, [aligned, breathing, seal])

  useEffect(() => () => stopBreath(), [stopBreath])

  // Keyboard: 1/2/3 turn rings, space holds breath
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === '1') turn('earth')
      if (e.key === '2') turn('heaven')
      if (e.key === '3') turn('hell')
      if (e.key === ' ' && aligned && !breathing) {
        e.preventDefault()
        startBreath()
      }
    }
    const up = (e: KeyboardEvent) => {
      if (e.key === ' ') stopBreath()
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [turn, aligned, breathing, startBreath, stopBreath])

  const [gl] = useState(webglAvailable)

  return (
    <div style={{ position: 'relative', height: 'calc(100vh - 64px)', background: '#06060E' }}>
      {gl ? (
        <CanvasBoundary fallback={<FlatWheel offsets={offsets} />}>
          <Canvas camera={{ position: [4.5, 2.5, 5.5], fov: 48 }}>
            <color attach="background" args={['#06060E']} />
            <ambientLight intensity={0.35} />
            <pointLight position={[5, 5, 5]} intensity={60} color="#F5F0E1" />
            <pointLight position={[-5, -3, -4]} intensity={30} color="#C9A84C" />
            <SpineAxis aligned={aligned} />
            {RINGS.map((r) => (
              <Ring
                key={r.id}
                color={r.color}
                y={r.y}
                offset={offsets[r.id]}
                onTurn={() => turn(r.id)}
                highlight={offsets[r.id] === 0}
              />
            ))}
            <OrbitControls enablePan={false} minDistance={4} maxDistance={12} />
          </Canvas>
        </CanvasBoundary>
      ) : (
        <FlatWheel offsets={offsets} />
      )}

      {/* HUD — top left */}
      <div style={{ position: 'absolute', top: 16, left: 16, ...panel, maxWidth: 320 }}>
        <div style={{ color: gold, fontFamily: "'Crimson Pro', serif", fontSize: '1.25rem' }}>
          The 22-Frame Wheel — Spine Ritual
        </div>
        <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: 6 }}>
          {ceremony} ceremony · patron: <span style={{ color: gold }}>{tribe.name}</span>
        </div>
        <div style={{ fontSize: '0.78rem', opacity: 0.7, marginTop: 8, lineHeight: 1.5 }}>
          Click a ring (or press 1 · 2 · 3) to turn it one frame. Earth turns Heaven with it;
          Heaven turns Hell. Land every keystone (the ivory frame) on the golden meridian, then
          hold the breath to seal the alignment into the chain.
        </div>
      </div>

      {/* HUD — top right */}
      <div style={{ position: 'absolute', top: 16, right: 16, ...panel, textAlign: 'right' }}>
        <div style={{ fontSize: '0.8rem' }}>
          moves <span style={{ color: gold }}>{moves}</span>
          {best !== null && (
            <>
              {' '}· best <span style={{ color: gold }}>{best}</span>
            </>
          )}
        </div>
        <div style={{ fontSize: '0.8rem', marginTop: 4 }}>
          rituals sealed <span style={{ color: gold }}>{rounds}</span>
        </div>
        <div style={{ fontSize: '0.8rem', marginTop: 4 }}>
          alignment chain <span style={{ color: gold }}>{state.chainCount}</span>/1132
        </div>
      </div>

      {/* Ring buttons + breath — bottom center */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          {RINGS.map((r) => (
            <button
              key={r.id}
              style={{
                ...btn,
                borderColor: r.color,
                color: r.color,
                opacity: offsets[r.id] === 0 ? 1 : 0.85,
              }}
              onClick={() => turn(r.id)}
            >
              {r.label} {offsets[r.id] === 0 ? '✓' : `(${offsets[r.id]})`}
            </button>
          ))}
        </div>
        <button
          style={{
            ...btn,
            borderColor: aligned ? gold : '#444',
            color: aligned ? '#0A0A12' : '#666',
            background: aligned
              ? `linear-gradient(90deg, ${gold} ${breathPct * 100}%, ${gold}55 ${breathPct * 100}%)`
              : 'transparent',
            padding: '0.6rem 2.2rem',
            fontWeight: 600,
            cursor: aligned ? 'pointer' : 'default',
          }}
          onPointerDown={startBreath}
          onPointerUp={stopBreath}
          onPointerLeave={stopBreath}
          disabled={!aligned}
        >
          {aligned
            ? breathing
              ? `Breathing… ${Math.round(breathPct * 100)}%`
              : 'Hold to Breathe (4s) — or hold Space'
            : 'Align all three keystones first'}
        </button>
      </div>

      {sealedFlash && (
        <div
          style={{
            position: 'absolute',
            top: '38%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            ...panel,
            border: `1px solid ${gold}`,
            textAlign: 'center',
            fontFamily: "'Crimson Pro', serif",
            fontSize: '1.3rem',
            color: gold,
          }}
        >
          Alignment sealed · +1 to the chain
          <div style={{ fontSize: '0.85rem', color: '#F5F0E1', opacity: 0.8, marginTop: 4 }}>
            {tribe.name} witnesses the {ceremony.toLowerCase()} ritual.
          </div>
        </div>
      )}
    </div>
  )
}
