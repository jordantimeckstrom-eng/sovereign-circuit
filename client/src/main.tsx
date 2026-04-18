import { Buffer } from 'buffer'
;(window as any).Buffer = Buffer

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { LedgerProvider } from './context/LedgerContext'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LedgerProvider>
        <App />
      </LedgerProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
