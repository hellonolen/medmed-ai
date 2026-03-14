import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'

// Marketing
import Landing from './pages/Landing'
import Pricing from './pages/Pricing'
import Checkout from './pages/Checkout'
import About from './pages/About'
import HowItWorks from './pages/HowItWorks'
import { Privacy, Terms, Policy, Support } from './pages/Legal'

// Auth
import Login from './pages/Login'
import Signup from './pages/Signup'

// App
import Dashboard from './pages/Dashboard'
import SymptomChecker from './pages/SymptomChecker'
import Interactions from './pages/Interactions'
import Pharmacy from './pages/Pharmacy'
import Camera from './pages/Camera'
import History from './pages/History'
import Account from './pages/Account'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <SubscriptionProvider>
        <BrowserRouter>
          <Routes>
            {/* Marketing */}
            <Route path="/" element={<Landing />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/policy" element={<Policy />} />
            <Route path="/support" element={<Support />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* App */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/interactions" element={<Interactions />} />
            <Route path="/pharmacy" element={<Pharmacy />} />
            <Route path="/camera" element={<Camera />} />
            <Route path="/history" element={<History />} />
            <Route path="/account" element={<Account />} />

            {/* Fallback */}
            <Route path="*" element={<Landing />} />
          </Routes>
        </BrowserRouter>
      </SubscriptionProvider>
    </AuthProvider>
  </React.StrictMode>,
)
