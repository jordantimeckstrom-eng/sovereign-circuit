import { useEffect } from 'react'
import { useLedger } from '../context/LedgerContext'

export function useCeremonyScheduler() {
  const { dispatch } = useLedger()

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      if (now.getHours() === 6 && now.getMinutes() === 0) {
        dispatch({ type: 'INCREMENT_DAWN' })
      }
      if (now.getHours() === 18 && now.getMinutes() === 0) {
        dispatch({ type: 'INCREMENT_DUSK' })
      }
      dispatch({
        type: 'EVOLVE_SYSTEM',
        payload: { lastSync: new Date().toISOString() },
      })
    }, 60000)
    return () => clearInterval(interval)
  }, [dispatch])
}
