// Compliance Vault — "privacy for users, provable access under policy".
// Records are AES-GCM encrypted to a vault key; a record can only be
// decrypted when the required threshold of tribe approvals is presented.
// SIMULATION NOTE: production uses threshold ElGamal over BabyJubJub with
// partial decryptions from network nodes; here the threshold policy check is
// real but decryption uses a locally-held vault key.

import { aesGcmDecrypt, aesGcmEncrypt, base64ToBuf, bufToBase64, deriveStorageKey } from './crypto'
import type { TribeId } from './dkg'

export interface VaultPolicy {
  requiredTribes: TribeId[]
  threshold: number
  reasonCodes: string[]
}

export interface VaultRecord {
  id: string
  ownerNullifier: string
  ciphertext: string
  policy: VaultPolicy
  createdAt: string
  proof: string
}

const VAULT_SEED_KEY = 'sovereign_vault_seed'
const VAULT_RECORDS_KEY = 'sovereign_vault_records_v1'

let vaultKeyPromise: Promise<CryptoKey> | null = null

function getVaultKey(): Promise<CryptoKey> {
  if (!vaultKeyPromise) {
    let seedB64 = localStorage.getItem(VAULT_SEED_KEY)
    if (!seedB64) {
      seedB64 = bufToBase64(crypto.getRandomValues(new Uint8Array(32)))
      localStorage.setItem(VAULT_SEED_KEY, seedB64)
    }
    vaultKeyPromise = deriveStorageKey(base64ToBuf(seedB64))
  }
  return vaultKeyPromise
}

export function loadVaultRecords(): VaultRecord[] {
  try {
    const raw = localStorage.getItem(VAULT_RECORDS_KEY)
    if (raw) return JSON.parse(raw) as VaultRecord[]
  } catch {}
  return []
}

function saveVaultRecords(records: VaultRecord[]): void {
  localStorage.setItem(VAULT_RECORDS_KEY, JSON.stringify(records.slice(0, 50)))
}

export async function encryptForVault(
  data: string,
  ownerNullifier: string,
  policy: VaultPolicy,
): Promise<VaultRecord> {
  const key = await getVaultKey()
  const record: VaultRecord = {
    id: crypto.randomUUID(),
    ownerNullifier,
    ciphertext: await aesGcmEncrypt(data, key),
    policy,
    createdAt: new Date().toISOString(),
    proof: 'zk_proof_sim_' + crypto.randomUUID().slice(0, 8),
  }
  const records = [record, ...loadVaultRecords()]
  saveVaultRecords(records)
  return record
}

// Regulator decryption: only succeeds with enough distinct tribe approvals.
export async function regulatorDecrypt(recordId: string, approvals: TribeId[]): Promise<string> {
  const record = loadVaultRecords().find((r) => r.id === recordId)
  if (!record) throw new Error('Vault record not found')
  const distinct = Array.from(new Set(approvals)).filter((t) =>
    record.policy.requiredTribes.includes(t),
  )
  if (distinct.length < record.policy.threshold) {
    throw new Error(
      `Threshold not met: need ${record.policy.threshold} tribe approvals, have ${distinct.length}`,
    )
  }
  const key = await getVaultKey()
  return aesGcmDecrypt(record.ciphertext, key)
}

export function deleteVaultRecord(recordId: string): VaultRecord[] {
  const records = loadVaultRecords().filter((r) => r.id !== recordId)
  saveVaultRecords(records)
  return records
}
