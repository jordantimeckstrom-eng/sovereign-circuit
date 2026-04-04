import { useState, useEffect } from 'react'
import styles from './BaseExplorer.module.css'

const BASESCAN_TX = 'https://basescan.org/tx/'
const BASESCAN_ADDR = 'https://basescan.org/address/'

function truncateAddr(addr: string): string {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

interface BlockInfo {
  blockNumber: number
  timestamp: number
  gasUsed: number
  gasLimit: number
  txCount: number
  hash: string
}

interface TxDetail {
  hash: string
  from: string
  to: string
  value: string
  blockNumber: number | null
  gas: number
  gasPrice: string | null
  nonce: number
  status: string
  gasUsed: number | null
  timestamp: number | null
}

export default function BaseExplorer() {
  const [activeTab, setActiveTab] = useState<'lookup' | 'transaction' | 'network'>('lookup')
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState<string | null>(null)
  const [txCount, setTxCount] = useState<number | null>(null)
  const [isContract, setIsContract] = useState<boolean | null>(null)
  const [gasPrice, setGasPrice] = useState<string | null>(null)
  const [latestBlock, setLatestBlock] = useState<BlockInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState('')
  const [txDetail, setTxDetail] = useState<TxDetail | null>(null)

  const fetchAddressInfo = async () => {
    if (!address) return
    setLoading(true)
    setError(null)
    setBalance(null)
    setTxCount(null)
    setIsContract(null)
    try {
      const [balRes, countRes, codeRes] = await Promise.all([
        fetch(`/api/base/balance/${address}`),
        fetch(`/api/base/txcount/${address}`),
        fetch(`/api/base/code/${address}`),
      ])
      const balData = await balRes.json()
      const countData = await countRes.json()
      const codeData = await codeRes.json()
      if (balData.error) throw new Error(balData.error)
      setBalance(balData.balance)
      setTxCount(countData.transactionCount)
      setIsContract(codeData.isContract)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const fetchTxDetail = async () => {
    if (!txHash) return
    setLoading(true)
    setError(null)
    setTxDetail(null)
    try {
      const res = await fetch(`/api/base/tx/${txHash}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setTxDetail(data.transaction)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  const fetchNetworkInfo = async () => {
    setLoading(true)
    setError(null)
    try {
      const [gasRes, blockRes] = await Promise.all([
        fetch('/api/base/gasprice'),
        fetch('/api/base/block/latest'),
      ])
      const gasData = await gasRes.json()
      const blockData = await blockRes.json()
      if (gasData.error) throw new Error(gasData.error)
      setGasPrice(gasData.gasPriceGwei)
      setLatestBlock(blockData)
    } catch (err: any) {
      setError(err.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (activeTab === 'network') {
      fetchNetworkInfo()
    }
  }, [activeTab])

  return (
    <div className={styles.explorer}>
      <div className={styles.header}>
        <h1>Base Chain Explorer</h1>
        <p>Query the Base L2 network directly. Look up addresses, inspect transactions, and monitor network status — with links to Basescan for full details.</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'lookup' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('lookup')}
        >
          Address Lookup
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'transaction' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('transaction')}
        >
          Transaction
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'network' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('network')}
        >
          Network Status
        </button>
      </div>

      {error && (
        <div className={styles.errorBar}>
          {error}
        </div>
      )}

      {activeTab === 'lookup' && (
        <div className={styles.lookupSection}>
          <div className={styles.searchCard}>
            <h2>Address Lookup</h2>
            <p className={styles.searchDesc}>Enter a Base address to check its ETH balance, transaction count, and whether it's a contract.</p>
            <div className={styles.searchRow}>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x... Base address"
                className={styles.input}
                onKeyDown={(e) => e.key === 'Enter' && fetchAddressInfo()}
              />
              <button onClick={fetchAddressInfo} className={styles.searchBtn} disabled={loading || !address}>
                {loading ? 'Loading...' : 'Lookup'}
              </button>
            </div>
            {balance !== null && (
              <div className={styles.resultCard}>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Address</span>
                  <a
                    href={`${BASESCAN_ADDR}${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.basescanLink}
                  >
                    {truncateAddr(address)} — View on Basescan
                  </a>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Balance</span>
                  <span className={styles.resultValue}>{balance} ETH</span>
                </div>
                {txCount !== null && (
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Transactions</span>
                    <span className={styles.resultMono}>{txCount}</span>
                  </div>
                )}
                {isContract !== null && (
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Type</span>
                    <span className={`${styles.typeBadge} ${isContract ? styles.typeBadgeContract : styles.typeBadgeEOA}`}>
                      {isContract ? 'Contract' : 'EOA (Wallet)'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'transaction' && (
        <div className={styles.lookupSection}>
          <div className={styles.searchCard}>
            <h2>Transaction Lookup</h2>
            <p className={styles.searchDesc}>Enter a transaction hash to view its details and status on Base.</p>
            <div className={styles.searchRow}>
              <input
                type="text"
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x... transaction hash"
                className={styles.input}
                onKeyDown={(e) => e.key === 'Enter' && fetchTxDetail()}
              />
              <button onClick={fetchTxDetail} className={styles.searchBtn} disabled={loading || !txHash}>
                {loading ? 'Loading...' : 'Lookup'}
              </button>
            </div>
            {txDetail && (
              <div className={styles.resultCard}>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Hash</span>
                  <a
                    href={`${BASESCAN_TX}${txDetail.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.basescanLink}
                  >
                    {truncateAddr(txDetail.hash)} — View on Basescan
                  </a>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Status</span>
                  <span className={`${styles.txStatusBadge} ${txDetail.status === 'success' ? styles.txSuccess : styles.txFail}`}>
                    {txDetail.status}
                  </span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>From</span>
                  <a
                    href={`${BASESCAN_ADDR}${txDetail.from}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.basescanLink}
                  >
                    {truncateAddr(txDetail.from)}
                  </a>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>To</span>
                  {txDetail.to ? (
                    <a
                      href={`${BASESCAN_ADDR}${txDetail.to}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.basescanLink}
                    >
                      {truncateAddr(txDetail.to)}
                    </a>
                  ) : (
                    <span className={styles.resultMono}>Contract Creation</span>
                  )}
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Value</span>
                  <span className={styles.resultValue}>{txDetail.value} ETH</span>
                </div>
                {txDetail.blockNumber !== null && (
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Block</span>
                    <span className={styles.resultMono}>{txDetail.blockNumber.toLocaleString()}</span>
                  </div>
                )}
                {txDetail.gasPrice && (
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Gas Price</span>
                    <span className={styles.resultMono}>{txDetail.gasPrice} Gwei</span>
                  </div>
                )}
                {txDetail.gasUsed !== null && (
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Gas Used</span>
                    <span className={styles.resultMono}>{txDetail.gasUsed.toLocaleString()}</span>
                  </div>
                )}
                {txDetail.timestamp !== null && (
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Time</span>
                    <span className={styles.resultMono}>{new Date(txDetail.timestamp * 1000).toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'network' && (
        <div className={styles.networkSection}>
          <div className={styles.networkGrid}>
            <div className={styles.networkCard}>
              <span className={styles.networkLabel}>Gas Price</span>
              {gasPrice !== null ? (
                <>
                  <span className={styles.networkValue}>{gasPrice}</span>
                  <span className={styles.networkUnit}>Gwei</span>
                </>
              ) : (
                <span className={styles.networkLoading}>Loading...</span>
              )}
            </div>
            <div className={styles.networkCard}>
              <span className={styles.networkLabel}>Latest Block</span>
              {latestBlock ? (
                <>
                  <span className={styles.networkValue}>{latestBlock.blockNumber.toLocaleString()}</span>
                  <span className={styles.networkUnit}>Block Height</span>
                </>
              ) : (
                <span className={styles.networkLoading}>Loading...</span>
              )}
            </div>
            <div className={styles.networkCard}>
              <span className={styles.networkLabel}>Block Transactions</span>
              {latestBlock ? (
                <>
                  <span className={styles.networkValue}>{latestBlock.txCount}</span>
                  <span className={styles.networkUnit}>TXs in latest block</span>
                </>
              ) : (
                <span className={styles.networkLoading}>Loading...</span>
              )}
            </div>
            <div className={styles.networkCard}>
              <span className={styles.networkLabel}>Gas Utilization</span>
              {latestBlock ? (
                <>
                  <span className={styles.networkValue}>
                    {((latestBlock.gasUsed / latestBlock.gasLimit) * 100).toFixed(1)}%
                  </span>
                  <span className={styles.networkUnit}>of gas limit</span>
                </>
              ) : (
                <span className={styles.networkLoading}>Loading...</span>
              )}
            </div>
          </div>

          {latestBlock && (
            <div className={styles.searchCard}>
              <h2>Latest Block Details</h2>
              <div className={styles.resultCard}>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Block Hash</span>
                  <span className={styles.resultMono}>{truncateAddr(latestBlock.hash)}</span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Timestamp</span>
                  <span className={styles.resultMono}>{new Date(latestBlock.timestamp * 1000).toLocaleString()}</span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Gas Used</span>
                  <span className={styles.resultMono}>{latestBlock.gasUsed.toLocaleString()}</span>
                </div>
                <div className={styles.resultRow}>
                  <span className={styles.resultLabel}>Gas Limit</span>
                  <span className={styles.resultMono}>{latestBlock.gasLimit.toLocaleString()}</span>
                </div>
              </div>
              <div className={styles.refreshRow}>
                <button onClick={fetchNetworkInfo} className={styles.searchBtn} disabled={loading}>
                  {loading ? 'Refreshing...' : 'Refresh Network Data'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
