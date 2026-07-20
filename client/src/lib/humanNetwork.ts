// Human Network integration layer — VOPRF flow H(h(x) * k) per the whitepaper.
// SIMULATION: in production this calls Human Network threshold nodes.
// Here the distributed secret k is mocked locally, but the API shape matches
// the real SDK so it can be swapped later without touching callers.

import { sha256, bufToHex } from './crypto'

export type VoprfOutput = Uint8Array // 32 bytes

// h(x): hash input to a "curve point" (simulated as SHA-256)
async function h(input: string): Promise<Uint8Array> {
  return sha256('h|' + input)
}

const MOCK_K = 'human-network-mock-k-do-not-use-in-prod'

async function mockThresholdMul(point: Uint8Array): Promise<Uint8Array> {
  const kBytes = new TextEncoder().encode(MOCK_K)
  const combined = new Uint8Array(point.length + kBytes.length)
  combined.set(point)
  combined.set(kBytes, point.length)
  return sha256(combined)
}

// 2HashDH pattern: H( h(x) * k )
export async function voprfEval(input: string): Promise<VoprfOutput> {
  const blinded = await h(input)
  const evaluated = await mockThresholdMul(blinded)
  return sha256(evaluated)
}

// Derive a hex nullifier from identity material (e.g. name|dob|spineHash).
// The nullifier identifies without revealing the underlying identity.
export async function deriveNullifier(identityInput: string): Promise<string> {
  const out = await voprfEval('nullifier|' + identityInput)
  return '0x' + bufToHex(out)
}
