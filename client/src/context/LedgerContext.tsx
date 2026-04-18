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

export interface LedgerState {
  bids: Bid[]
  ghosts: string[]
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
  dawnCount: 0,
  duskCount: 0,
  chainCount: 0,
  grokTemp: 0.7,
  lastSync: new Date().toISOString(),
  signalRConnected: false,
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
      return { ...state, ghosts: [action.payload, ...state.ghosts].slice(0, 100) }
    case 'INCREMENT_DAWN':
      return { ...state, dawnCount: state.dawnCount + 1 }
    case 'INCREMENT_DUSK':
      return { ...state, duskCount: state.duskCount + 1 }
    case 'INCREMENT_CHAIN':
      return { ...state, chainCount: Math.min(state.chainCount + 1, 1132) }
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
