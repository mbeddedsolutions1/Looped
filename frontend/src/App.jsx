import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Sidebar from './components/layout/Sidebar'
import Dashboard from './pages/Dashboard'
import PhoneDetails from './pages/PhoneDetails'
import CallHistory from './pages/CallHistory'
import Contacts from './pages/Contacts'
import Settings from './pages/Settings'
import Setup from './pages/Setup'
import Layout from './pages/Layout'
import './index.css'

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route element={<Layout mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/phone/:id" element={<PhoneDetails />} />
            <Route path="/history" element={<CallHistory />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/setup" element={<Setup />} />
          </Route>
        </Routes>
      </main>
      <Toaster />
    </div>
  )
}
