// Encrypted persistence for the Ouroboros Ledger.
// Storage key derivation: AES key = HKDF( VOPRF(deviceId) ), per the
// integration spec. Payload format: base64(iv || AES-GCM ciphertext).

import { aesGcmDecrypt, aesGcmEncrypt, deriveStorageKey } from './crypto'
import { voprfEval } from './humanNetwork'

const DEVICE_ID_KEY = 'sovereign_device_id'
export const ENCRYPTED_LEDGER_KEY = 'sovereign_ledger_enc_v2'
export const LEGACY_PLAINTEXT_KEY = 'sovereign_ledger_v1'

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

let keyPromise: Promise<CryptoKey> | null = null

export function getLedgerStorageKey(): Promise<CryptoKey> {
  if (!keyPromise) {
    keyPromise = voprfEval('storage|' + getDeviceId()).then(deriveStorageKey)
  }
  return keyPromise
}

export interface RestoredLedger<T> {
  state: T | null
  fromLegacy: boolean
}

// Restore ledger state: prefer encrypted payload; fall back to legacy
// plaintext (caller should immediately re-persist to complete migration).
export async function restoreLedgerState<T>(): Promise<RestoredLedger<T>> {
  try {
    const enc = localStorage.getItem(ENCRYPTED_LEDGER_KEY)
    if (enc) {
      const key = await getLedgerStorageKey()
      return { state: JSON.parse(await aesGcmDecrypt(enc, key)) as T, fromLegacy: false }
    }
  } catch (e) {
    console.warn('[ledgerCipher] failed to decrypt stored ledger, discarding', e)
    localStorage.removeItem(ENCRYPTED_LEDGER_KEY)
  }
  try {
    const legacy = localStorage.getItem(LEGACY_PLAINTEXT_KEY)
    if (legacy) return { state: JSON.parse(legacy) as T, fromLegacy: true }
  } catch {}
  return { state: null, fromLegacy: false }
}

// Encrypts state, then commits to localStorage only if `shouldCommit` still
// holds — the check runs AFTER the async crypto so a slow older write can
// never overwrite a newer one.
export async function persistLedgerState(
  state: unknown,
  shouldCommit: () => boolean = () => true,
): Promise<void> {
  const key = await getLedgerStorageKey()
  const payload = await aesGcmEncrypt(JSON.stringify(state), key)
  if (!shouldCommit()) return
  localStorage.setItem(ENCRYPTED_LEDGER_KEY, payload)
  // Plaintext copy is no longer needed once the encrypted copy exists
  localStorage.removeItem(LEGACY_PLAINTEXT_KEY)
}

export function isLedgerEncrypted(): boolean {
  return localStorage.getItem(ENCRYPTED_LEDGER_KEY) !== null
}
