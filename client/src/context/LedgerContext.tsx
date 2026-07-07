import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { setLedgerDispatch } from './LedgerBridge'

export type Channel = 'UI' | 'Email' | 'External' | 'Scheduler' | 'SignalR'
export type BidStatus = 'Leading' | 'Outbid' | 'Sealed'
export type SaraiWhisper = 'Pending' | 'Heard' | 'Witnessed'

export interface Bid {
  id: string
  timestamp: string
  name: string
  amount: number
  channel: Channel
  ghostNote?: string
  status: BidStatus
  saraiWhisper: SaraiWhisper
}

export type LedgerEventType = 'reflection' | 'ceremony'

export interface LedgerEvent {
  id: string
  type: LedgerEventType
  text: string
  timestamp: string
}

export interface LedgerState {
  bids: Bid[]
  ghosts: string[]
  events: LedgerEvent[]
  dawnCount: number
  duskCount: number
  chainCount: number
  grokTemp: number
  lastSync: string
  signalRConnected: boolean
}

const initialState: LedgerState = {
  bids: [],
  ghosts: [],
  events: [],
  dawnCount: 0,
  duskCount: 0,
  chainCount: 0,
  grokTemp: 0.7,
  lastSync: new Date().toISOString(),
  signalRConnected: false,
}

function makeEvent(type: LedgerEventType, text: string): LedgerEvent {
  return {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    text,
    timestamp: new Date().toISOString(),
  }
}

export type Action =
  | { type: 'INGEST_BID'; payload: Bid }
  | { type: 'DIGEST_GHOST'; payload: string }
  | { type: 'INCREMENT_DAWN' }
  | { type: 'INCREMENT_DUSK' }
  | { type: 'INCREMENT_CHAIN' }
  | { type: 'EVOLVE_SYSTEM'; payload: { grokTemp?: number; lastSync?: string } }
  | { type: 'SET_SIGNALR'; payload: boolean }
  | { type: 'HYDRATE'; payload: Partial<LedgerState> }

function ledgerReducer(state: LedgerState, action: Action): LedgerState {
  switch (action.type) {
    case 'INGEST_BID':
      return { ...state, bids: [action.payload, ...state.bids].slice(0, 200) }
    case 'DIGEST_GHOST':
      return {
        ...state,
        ghosts: [action.payload, ...state.ghosts].slice(0, 100),
        events: [makeEvent('reflection', action.payload), ...state.events].slice(0, 500),
      }
    case 'INCREMENT_DAWN':
      return {
        ...state,
        dawnCount: state.dawnCount + 1,
        events: [makeEvent('ceremony', 'Dawn ceremony completed'), ...state.events].slice(0, 500),
      }
    case 'INCREMENT_DUSK':
      return {
        ...state,
        duskCount: state.duskCount + 1,
        events: [makeEvent('ceremony', 'Dusk ceremony completed'), ...state.events].slice(0, 500),
      }
    case 'INCREMENT_CHAIN':
      return {
        ...state,
        chainCount: Math.min(state.chainCount + 1, 1132),
        events: [makeEvent('ceremony', 'Alignment committed (+1)'), ...state.events].slice(0, 500),
      }
    case 'EVOLVE_SYSTEM':
      return { ...state, ...action.payload }
    case 'SET_SIGNALR':
      return { ...state, signalRConnected: action.payload }
    case 'HYDRATE':
      return { ...state, ...action.payload }
    default:
      return state
  }
}

interface LedgerContextValue {
  state: LedgerState
  dispatch: React.Dispatch<Action>
}

const LedgerContext = createContext<LedgerContextValue | null>(null)

const STORAGE_KEY = 'sovereign_ledger_v1'

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(ledgerReducer, initialState, (init) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) return { ...init, ...JSON.parse(raw) }
    } catch {}
    return init
  })

  useEffect(() => {
    setLedgerDispatch(dispatch)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  return (
    <LedgerContext.Provider value={{ state, dispatch }}>
      {children}
    </LedgerContext.Provider>
  )
}

export function useLedger() {
  const ctx = useContext(LedgerContext)
  if (!ctx) throw new Error('useLedger must be used within LedgerProvider')
  return ctx
}
