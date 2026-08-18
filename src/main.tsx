import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import './index.css'
import { initializeAnalytics } from './lib/analytics/supabase'
import { ErrorBoundary } from './components/ErrorBoundary'

// Initialize Supabase analytics before rendering
initializeAnalytics()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
