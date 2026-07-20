import { useEffect, useState } from 'react'
import { deriveNullifier } from '../lib/humanNetwork'
import { thresholdDKG, DKG_TRIBES, type DKGResult, type TribeId } from '../lib/dkg'
import {
  encryptForVault,
  regulatorDecrypt,
  loadVaultRecords,
  deleteVaultRecord,
  type VaultRecord,
} from '../lib/vault'
import { isLedgerEncrypted, getDeviceId } from '../lib/ledgerCipher'
import { TRIBES } from '../data/tribes'

const gold = '#C9A84C'
const panelStyle: React.CSSProperties = {
  border: `1px solid ${gold}44`,
  borderRadius: 8,
  padding: '1.25rem',
  marginBottom: '1.5rem',
  background: 'rgba(201,168,76,0.04)',
}
const buttonStyle: React.CSSProperties = {
  background: 'transparent',
  border: `1px solid ${gold}`,
  color: gold,
  padding: '0.4rem 0.9rem',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: '0.85rem',
}
const monoStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '0.75rem',
  wordBreak: 'break-all',
  opacity: 0.85,
}

function tribeName(id: TribeId): string {
  return TRIBES.find((t) => t.id === id)?.name ?? id
}

export default function SovereignVaultPanel() {
  const [encrypted, setEncrypted] = useState(false)
  const [deviceId, setDeviceId] = useState('')
  const [identityInput, setIdentityInput] = useState('')
  const [nullifier, setNullifier] = useState('')
  const [deriving, setDeriving] = useState(false)
  const [dkg, setDkg] = useState<DKGResult | null>(null)
  const [dkgRunning, setDkgRunning] = useState(false)
  const [vaultInput, setVaultInput] = useState('')
  const [records, setRecords] = useState<VaultRecord[]>([])
  const [approvals, setApprovals] = useState<Record<string, TribeId[]>>({})
  const [decrypted, setDecrypted] = useState<Record<string, string>>({})
  const [vaultError, setVaultError] = useState('')

  useEffect(() => {
    setEncrypted(isLedgerEncrypted())
    setDeviceId(getDeviceId())
    setRecords(loadVaultRecords())
    const iv = setInterval(() => setEncrypted(isLedgerEncrypted()), 3000)
    return () => clearInterval(iv)
  }, [])

  const handleNullifier = async () => {
    if (!identityInput.trim()) return
    setDeriving(true)
    try {
      setNullifier(await deriveNullifier(identityInput.trim()))
    } finally {
      setDeriving(false)
    }
  }

  const handleDkg = async () => {
    setDkgRunning(true)
    try {
      setDkg(await thresholdDKG(4))
    } finally {
      setDkgRunning(false)
    }
  }

  const handleVaultEncrypt = async () => {
    if (!vaultInput.trim()) return
    setVaultError('')
    const owner = nullifier || (await deriveNullifier('device|' + deviceId))
    await encryptForVault(vaultInput.trim(), owner, {
      requiredTribes: [...DKG_TRIBES],
      threshold: 4,
      reasonCodes: ['court_order', 'safety_review'],
    })
    setVaultInput('')
    setRecords(loadVaultRecords())
  }

  const toggleApproval = (recordId: string, tribe: TribeId) => {
    setApprovals((prev) => {
      const current = prev[recordId] ?? []
      const next = current.includes(tribe)
        ? current.filter((t) => t !== tribe)
        : [...current, tribe]
      return { ...prev, [recordId]: next }
    })
  }

  const handleDecrypt = async (recordId: string) => {
    setVaultError('')
    try {
      const plain = await regulatorDecrypt(recordId, approvals[recordId] ?? [])
      setDecrypted((prev) => ({ ...prev, [recordId]: plain }))
    } catch (e) {
      setVaultError(e instanceof Error ? e.message : String(e))
    }
  }

  const handleDelete = (recordId: string) => {
    setRecords(deleteVaultRecord(recordId))
    setDecrypted((prev) => {
      const next = { ...prev }
      delete next[recordId]
      return next
    })
  }

  return (
    <div>
      <div style={panelStyle}>
        <h3 style={{ color: gold, marginTop: 0 }}>Encrypted Ledger Storage</h3>
        <p style={{ fontSize: '0.9rem' }}>
          The Ouroboros Ledger state on this device is persisted with AES-GCM-256. The key is
          derived via HKDF from a VOPRF evaluation of the device identity (simulated network —
          swappable for real Human Network nodes).
        </p>
        <p style={monoStyle}>
          status: {encrypted ? 'ENCRYPTED (sovereign_ledger_enc_v2)' : 'awaiting first write…'}
          <br />
          device: {deviceId ? deviceId.slice(0, 8) + '…' : '—'}
        </p>
      </div>

      <div style={panelStyle}>
        <h3 style={{ color: gold, marginTop: 0 }}>Derive Nullifier (VOPRF)</h3>
        <p style={{ fontSize: '0.9rem' }}>
          Turn low-entropy identity material (e.g. <code>name|dob|spineHash</code>) into a
          high-entropy nullifier via H(h(x)·k).
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            value={identityInput}
            onChange={(e) => setIdentityInput(e.target.value)}
            placeholder="name|dob|spineHash"
            style={{
              flex: 1,
              minWidth: 200,
              background: '#0A0A12',
              border: `1px solid ${gold}55`,
              color: '#F5F0E1',
              padding: '0.4rem 0.6rem',
              borderRadius: 6,
            }}
          />
          <button style={buttonStyle} onClick={handleNullifier} disabled={deriving}>
            {deriving ? 'Deriving…' : 'Derive'}
          </button>
        </div>
        {nullifier && <p style={{ ...monoStyle, marginTop: '0.75rem' }}>{nullifier}</p>}
      </div>

      <div style={panelStyle}>
        <h3 style={{ color: gold, marginTop: 0 }}>Epoch DKG — n=6 tribes, t=4</h3>
        <button style={buttonStyle} onClick={handleDkg} disabled={dkgRunning}>
          {dkgRunning ? 'Running VSS rounds…' : dkg ? 'Reshare (next epoch)' : 'Run DKG'}
        </button>
        {dkg && (
          <div style={{ marginTop: '0.75rem' }}>
            <p style={monoStyle}>
              network pk: {dkg.publicKey.slice(0, 26)}… · threshold {dkg.threshold}/6 · epoch{' '}
              {dkg.epoch}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {Object.values(dkg.shares).map((s) => (
                <li key={s.tribeId} style={{ ...monoStyle, padding: '0.15rem 0' }}>
                  #{s.index} {tribeName(s.tribeId)} — share {s.encryptedShare.slice(0, 16)}… ·
                  commit {s.commitment.slice(0, 12)}…
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={panelStyle}>
        <h3 style={{ color: gold, marginTop: 0 }}>Compliance Vault</h3>
        <p style={{ fontSize: '0.9rem' }}>
          Encrypt a note into the vault. Decryption requires approval from 4 of 6 tribes
          (threshold policy enforced; cryptography simulated locally).
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            value={vaultInput}
            onChange={(e) => setVaultInput(e.target.value)}
            placeholder="Sensitive ghost note…"
            style={{
              flex: 1,
              minWidth: 200,
              background: '#0A0A12',
              border: `1px solid ${gold}55`,
              color: '#F5F0E1',
              padding: '0.4rem 0.6rem',
              borderRadius: 6,
            }}
          />
          <button style={buttonStyle} onClick={handleVaultEncrypt}>
            Encrypt to Vault
          </button>
        </div>
        {vaultError && (
          <p style={{ color: '#e07070', fontSize: '0.85rem', marginTop: '0.5rem' }}>{vaultError}</p>
        )}
        {records.map((r) => (
          <div
            key={r.id}
            style={{
              borderTop: `1px solid ${gold}22`,
              marginTop: '0.75rem',
              paddingTop: '0.75rem',
            }}
          >
            <p style={monoStyle}>
              {r.id.slice(0, 8)}… · owner {r.ownerNullifier.slice(0, 14)}… ·{' '}
              {new Date(r.createdAt).toLocaleString()} · {r.proof}
            </p>
            <p style={monoStyle}>ciphertext: {r.ciphertext.slice(0, 48)}…</p>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', margin: '0.5rem 0' }}>
              {DKG_TRIBES.map((t) => {
                const approved = (approvals[r.id] ?? []).includes(t)
                return (
                  <button
                    key={t}
                    onClick={() => toggleApproval(r.id, t)}
                    style={{
                      ...buttonStyle,
                      fontSize: '0.72rem',
                      padding: '0.2rem 0.5rem',
                      background: approved ? `${gold}33` : 'transparent',
                    }}
                  >
                    {approved ? '✓ ' : ''}
                    {tribeName(t)}
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={buttonStyle} onClick={() => handleDecrypt(r.id)}>
                Regulator Decrypt ({(approvals[r.id] ?? []).length}/4)
              </button>
              <button
                style={{ ...buttonStyle, borderColor: '#8a4a4a', color: '#c98a8a' }}
                onClick={() => handleDelete(r.id)}
              >
                Delete
              </button>
            </div>
            {decrypted[r.id] && (
              <p style={{ ...monoStyle, color: gold, marginTop: '0.5rem' }}>
                DECRYPTED: {decrypted[r.id]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
