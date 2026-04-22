import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import posthog from 'posthog-js'
import './index.css'
import App from './App.tsx'

// 🚀 INITIALIZE ANALYTICS (Sugesstion #5)
// Professional infrastructure for tracking user growth & engagement.
// Replace 'phc_placeholder' with your real key if you have a PostHog account.
/*
if (typeof window !== 'undefined') {
  posthog.init('phc_placeholder', {
    api_host: 'https://app.posthog.com',
    autocapture: true,
    capture_pageview: true
  });
}
*/

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
