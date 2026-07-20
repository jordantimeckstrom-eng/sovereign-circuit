// WebCrypto primitives for the Sovereign Circuit encryption layer.
// AES-GCM-256 for storage encryption, HKDF-SHA256 for key derivation.

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export function bufToBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary)
}

export function base64ToBuf(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export function bufToHex(buf: Uint8Array): string {
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function sha256(data: string | Uint8Array): Promise<Uint8Array> {
  const buf = typeof data === 'string' ? encoder.encode(data) : data
  const hash = await crypto.subtle.digest('SHA-256', buf as BufferSource)
  return new Uint8Array(hash)
}

// Derive an AES-GCM-256 CryptoKey from 32 bytes of key material via HKDF.
export async function deriveStorageKey(keyMaterial: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey('raw', keyMaterial as BufferSource, 'HKDF', false, [
    'deriveKey',
  ])
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: encoder.encode('sovereign-circuit-v1'),
      info: encoder.encode('storage-aes-gcm'),
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

// AES-GCM encrypt; output is base64(iv || ciphertext) with a random 12-byte IV.
export async function aesGcmEncrypt(plainText: string, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const pt = encoder.encode(plainText)
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, pt)
  const combined = new Uint8Array(iv.byteLength + ct.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ct), iv.byteLength)
  return bufToBase64(combined)
}

export async function aesGcmDecrypt(payloadB64: string, key: CryptoKey): Promise<string> {
  const combined = base64ToBuf(payloadB64)
  const iv = combined.slice(0, 12)
  const ct = combined.slice(12)
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct as BufferSource)
  return decoder.decode(pt)
}
