import styles from './Whitepaper.module.css'

export default function HumanNetwork() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Human Network</h1>
        <p className={styles.subtitle}>
          A Decentralized Threshold Network with Forward Secrecy — Holonym Foundation
        </p>
        <p className={styles.subtitle} style={{ fontStyle: 'italic', opacity: 0.7 }}>
          Referenced as the identity-and-personhood substrate for the Sovereign Circuit
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1 · Why Personhood Matters Here</h2>
        <p className={styles.paragraph}>
          Personhood is critical infrastructure. To access social benefits, travel, or transact, you
          must prove you are a real, specific person. Yet personhood is under threat from deepfakes,
          centralized identity silos, and routine data breaches. Sovereign Circuit treats identity as
          a sacred bond — Human Network is the cryptographic skeleton that makes that bond
          verifiable without surveillance.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2 · What Human Network Is</h2>
        <p className={styles.paragraph}>
          Human Network is a threshold network for scalar-by-elliptic-curve-point multiplication,
          secured on EigenLayer and Symbiotic. A quorum of nodes performs multiplication
          asynchronously, with no inter-node communication required — making it effectively
          infinitely scalable for the high-privacy applications the Circuit needs.
        </p>
        <ul className={styles.list}>
          <li>
            <strong>Verifiable Oblivious Pseudorandom Function (VOPRF)</strong> — high-entropy
            nullifiers and private keys derived from low-entropy data (names, dates, biometrics,
            passwords). Enables wallets recoverable by memorable phrases and JWT-derived keys.
          </li>
          <li>
            <strong>Provable ElGamal Decryption on ZK-Friendly Curves</strong> — users prove they
            encrypted data such that only a regulator can decrypt under defined rules. Privacy for
            normal users; visibility only for suspected criminals. Compliance without carte-blanche
            surveillance.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3 · The Threshold Primitive</h2>
        <p className={styles.paragraph}>
          The pseudorandom function over client input <code>x</code> and distributed secret{' '}
          <code>k</code>:
        </p>
        <pre className={styles.code}>H( h(x) * k )</pre>
        <p className={styles.paragraph}>
          Where <code>h</code> hashes a scalar to a curve point and <code>H</code> hashes a curve
          point back to a scalar. The 2HashDH protocol applies information-theoretic masks so
          inputs stay private. Only multiplication by <code>k</code> is distributed across the
          quorum.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>4 · Network & Security Model</h2>
        <ul className={styles.list}>
          <li>
            <strong>n-quorum</strong> — group of n nodes selected per epoch via DKG or resharing.
          </li>
          <li>
            <strong>t-quorum</strong> — t (+ ε) nodes drawn from the n-quorum to perform a
            transaction; ε absorbs failing/slow nodes.
          </li>
          <li>
            <strong>Epoch e</strong> — period during which Q<sub>e</sub> holds the secret share.
          </li>
          <li>
            <strong>Mobile adversary</strong> — can corrupt up to t−1 nodes per epoch and reuse
            stored data later. Forward-secure encryption (CHK03) defeats post-hoc decryption of
            broadcast traffic.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>5 · Building Blocks</h2>
        <ul className={styles.list}>
          <li>
            <strong>Shamir Secret Sharing (SSS)</strong> — splits secret <code>s</code> into shares
            on a degree t−1 polynomial. Any t shares reconstruct s; fewer reveal nothing.
          </li>
          <li>
            <strong>Feldman VSS</strong> — adds public coefficient commitments so nodes can verify
            their shares are correct.
          </li>
          <li>
            <strong>Lagrange Interpolation</strong> — each node weights its share by{' '}
            <code>λᵢ = ∏ⱼ j / ∏ⱼ (j−i)</code> before summing to recover the secret.
          </li>
          <li>
            <strong>DLEQ proofs (Fiat-Shamir)</strong> — non-interactive zero-knowledge proofs that
            two public values share the same discrete log; required for VOPRF correctness.
          </li>
          <li>
            <strong>Distributed Key Generation (DKG)</strong> — every node samples a polynomial,
            broadcasts commitments, and exchanges shares so the network jointly holds k without any
            single node knowing it.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>6 · Why It Lives in the Circuit</h2>
        <p className={styles.paragraph}>
          Sovereign Circuit's identity bond (<code>jordaneckstrom.base.eth</code>) is a public
          tether on Base. Human Network is the private counterpart: a way to derive keys, prove
          personhood, and grant compliant decryption — without leaking biometrics, IDs, or
          memorable phrases to centralized custodians.
        </p>
        <p className={styles.paragraph}>
          The temple's Live Ledger ingests bids from any realm. Threshold cryptography ensures the
          identities behind those bids can be verified, recovered, and selectively decrypted —
          without ever being surveilled wholesale.
        </p>
      </section>

      <footer style={{ marginTop: '3rem', opacity: 0.6, fontSize: '0.85rem', textAlign: 'center' }}>
        Source: Holonym Foundation, <em>Human Network: A Decentralized Threshold Network with
        Forward Secrecy</em>. Summarized for Sovereign Circuit lore — refer to the original paper
        for proofs and protocol pseudocode.
      </footer>
    </div>
  )
}
