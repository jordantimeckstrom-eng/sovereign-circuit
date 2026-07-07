import type { Action, LedgerState } from '../context/LedgerContext'

const SYNC_ACTIONS = new Set<Action['type']>([
  'INGEST_BID',
  'DIGEST_GHOST',
  'INCREMENT_DAWN',
  'INCREMENT_DUSK',
  'INCREMENT_CHAIN',
])

type RawDispatch = (action: Action) => void

let socket: WebSocket | null = null
let rawDispatch: RawDispatch | null = null
let reconnectAttempts = 0
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let pollTimer: ReturnType<typeof setInterval> | null = null
let started = false

function wsUrl(): string {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}/ws/ledger`
}

function applyHistory(payload: Partial<LedgerState>) {
  if (!rawDispatch) return
  rawDispatch({ type: 'HYDRATE', payload })
}

async function pollSnapshot() {
  try {
    const res = await fetch('/api/ledger/snapshot')
    if (!res.ok) return
    const snapshot = (await res.json()) as Partial<LedgerState>
    applyHistory(snapshot)
  } catch {
    /* offline — keep local state */
  }
}

function startPolling() {
  if (pollTimer) return
  void pollSnapshot()
  pollTimer = setInterval(pollSnapshot, 15000)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return
  reconnectAttempts += 1
  const delay = Math.min(30000, 1000 * 2 ** Math.min(reconnectAttempts, 4))
  // After a few failed attempts, fall back to REST polling so the feed stays live.
  if (reconnectAttempts >= 3) startPolling()
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    connect()
  }, delay)
}

function connect() {
  if (!rawDispatch) return
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return

  try {
    socket = new WebSocket(wsUrl())
  } catch {
    scheduleReconnect()
    return
  }

  socket.onopen = () => {
    reconnectAttempts = 0
    stopPolling()
    rawDispatch?.({ type: 'SET_SIGNALR', payload: true })
  }

  socket.onmessage = (ev) => {
    let msg: any
    try {
      msg = JSON.parse(ev.data)
    } catch {
      return
    }
    if (msg?.t === 'history') {
      const { t, ...snapshot } = msg
      applyHistory(snapshot as Partial<LedgerState>)
    } else if (msg?.t === 'event' && msg.action?.type && rawDispatch) {
      // Remote origin: apply with the raw dispatch so it is NOT re-published.
      rawDispatch(msg.action as Action)
    }
  }

  socket.onclose = () => {
    rawDispatch?.({ type: 'SET_SIGNALR', payload: false })
    socket = null
    scheduleReconnect()
  }

  socket.onerror = () => {
    try {
      socket?.close()
    } catch {
      /* noop */
    }
  }
}

/** Initialise the realtime client. `dispatch` must be the RAW reducer dispatch. */
export function initRealtime(dispatch: RawDispatch) {
  rawDispatch = dispatch
  if (started) return
  started = true
  connect()
}

/** Publish a locally-originated action to the server for broadcast + persistence. */
export function publish(action: Action) {
  if (!SYNC_ACTIONS.has(action.type)) return
  const message = JSON.stringify({ t: 'publish', action })
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(message)
  } else {
    // WS unavailable — persist over REST so the event is not lost.
    void fetch('/api/ledger/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    }).catch(() => {})
  }
}

/**
 * Wrap the raw dispatch so every locally-originated syncable action is also
 * published to the server. Remote actions must bypass this wrapper.
 */
export function wrapDispatch(dispatch: RawDispatch): RawDispatch {
  return (action: Action) => {
    dispatch(action)
    if (SYNC_ACTIONS.has(action.type)) publish(action)
  }
}
