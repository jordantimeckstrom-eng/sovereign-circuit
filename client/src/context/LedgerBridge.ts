import type React from 'react'
import type { Action } from './LedgerContext'

let ledgerDispatch: React.Dispatch<Action> | null = null

export function setLedgerDispatch(dispatch: React.Dispatch<Action>) {
  ledgerDispatch = dispatch
  if (typeof window !== 'undefined') {
    ;(window as any).__sovereignLedger = {
      dispatch,
      ingestBid: (bid: any) =>
        dispatch({
          type: 'INGEST_BID',
          payload: {
            id: bid.id || `bid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            timestamp: bid.timestamp || new Date().toISOString(),
            name: bid.name || 'Anonymous',
            amount: Number(bid.amount) || 0,
            channel: bid.channel || 'External',
            ghostNote: bid.ghostNote,
            status: bid.status || 'Leading',
            saraiWhisper: bid.saraiWhisper || 'Pending',
          },
        }),
      digestGhost: (note: string) =>
        dispatch({ type: 'DIGEST_GHOST', payload: note }),
    }
  }
}

export function getLedgerDispatch() {
  if (!ledgerDispatch) {
    throw new Error('Ledger not initialized — LedgerProvider must mount first')
  }
  return ledgerDispatch
}

export function tryGetLedgerDispatch() {
  return ledgerDispatch
}
