import { NavLink, Outlet } from 'react-router-dom'
import { useState, useCallback, useEffect } from 'react'
import styles from './Layout.module.css'

const BASE_CHAIN_ID = '0x2105'
const BASE_CHAIN_CONFIG = {
  chainId: BASE_CHAIN_ID,
  chainName: 'Base',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://mainnet.base.org'],
  blockExplorerUrls: ['https://basescan.org'],
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: '◈' },
  { path: '/governance', label: 'Governance', icon: '⏳' },
  { path: '/tribes', label: 'Tribes', icon: '⚔' },
  { path: '/curriculum', label: 'Curriculum', icon: '📜' },
  { path: '/whitepaper', label: 'Whitepaper', icon: '🛡' },
  { path: '/golden-thread', label: 'Golden Thread', icon: '🧵' },
  { path: '/ouroboros', label: 'Ouroboros', icon: '🐍' },
  { path: '/reflection', label: 'Echo', icon: '🔮' },
  { path: '/school', label: 'School', icon: '🏛️' },
  { path: '/calendar', label: 'Calendar', icon: '📅' },
  { path: '/community', label: 'Community', icon: '🤝' },
  { path: '/base', label: 'Base', icon: '🔵' },
  { path: '/spine-align-time', label: 'Temple', icon: '🏛' },
]

function truncateAddress(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    const eth = (window as any).ethereum
    if (!eth) return
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        sessionStorage.removeItem('walletDisconnected')
        setWalletAddress(accounts[0])
      } else {
        setWalletAddress(null)
      }
    }
    const handleChainChanged = () => {
      window.location.reload()
    }
    eth.on('accountsChanged', handleAccountsChanged)
    eth.on('chainChanged', handleChainChanged)
    const userDisconnected = sessionStorage.getItem('walletDisconnected')
    if (!userDisconnected) {
      eth.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) setWalletAddress(accounts[0])
      }).catch(() => {})
    }
    return () => {
      eth.removeListener('accountsChanged', handleAccountsChanged)
      eth.removeListener('chainChanged', handleChainChanged)
    }
  }, [])

  const connectWallet = useCallback(async () => {
    const eth = (window as any).ethereum
    if (!eth) {
      window.open('https://metamask.io/download/', '_blank')
      return
    }
    setConnecting(true)
    try {
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' })
      try {
        await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BASE_CHAIN_ID }] })
      } catch (switchErr: any) {
        if (switchErr.code === 4902) {
          await eth.request({ method: 'wallet_addEthereumChain', params: [BASE_CHAIN_CONFIG] })
        } else {
          console.error('Failed to switch to Base chain:', switchErr)
          return
        }
      }
      const chainId = await eth.request({ method: 'eth_chainId' })
      if (chainId !== BASE_CHAIN_ID) {
        console.error('Not connected to Base chain')
        return
      }
      if (accounts.length > 0) {
        sessionStorage.removeItem('walletDisconnected')
        setWalletAddress(accounts[0])
      }
    } catch (err) {
      console.error('Wallet connection failed:', err)
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnectWallet = useCallback(async () => {
    setWalletAddress(null)
    sessionStorage.setItem('walletDisconnected', 'true')
    try {
      const eth = (window as any).ethereum
      if (eth && eth.request) {
        await eth.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        })
      }
    } catch {
    }
  }, [])

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            className={styles.menuBtn}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            ☰
          </button>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>◈</span>
            <span className={styles.logoText}>Sovereign Circuit</span>
          </div>
        </div>
        <nav className={`${styles.nav} ${mobileOpen ? styles.navOpen : ''}`}>
          {navItems.map((item) =>
            item.path === '/spine-align-time' ? (
              <a
                key={item.path}
                href="/spine-align-time"
                className={styles.navLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </a>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navActive : ''}`
                }
                onClick={() => setMobileOpen(false)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                {item.label}
              </NavLink>
            )
          )}
        </nav>
        <div className={styles.headerRight}>
          {walletAddress ? (
            <div className={styles.walletConnected}>
              <span className={styles.baseDot} />
              <span className={styles.baseLabel}>BASE</span>
              <span className={styles.walletAddress}>{truncateAddress(walletAddress)}</span>
              <button className={styles.disconnectBtn} onClick={disconnectWallet}>✕</button>
            </div>
          ) : (
            <button className={styles.connectBtn} onClick={connectWallet} disabled={connecting}>
              {connecting ? 'Connecting...' : 'Connect Base Wallet'}
            </button>
          )}
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
