import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { ReferenceHomeShell } from './ReferenceHomeShell'
import './styles.css'
import './premium-heritage.css'
import './stitch-logo-theme.css'
import './stitch-exact.css'
import './uiux-pro-max-board.css'
import './uiux-pro-max-home.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReferenceHomeShell>
      <App />
    </ReferenceHomeShell>
  </React.StrictMode>,
)
