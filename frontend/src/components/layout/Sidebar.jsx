import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Phone, History, Users, Settings, ShieldAlert, LogOut } from 'lucide-react'

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path

  const mainLinks = [
    { path: '/', label: 'Dashboard', icon: Phone },
    { path: '/history', label: 'Call History', icon: History },
    { path: '/contacts', label: 'Contacts', icon: Users },
  ]

  const safetyLinks = [
    { path: '/setup', label: 'Setup', icon: ShieldAlert },
  ]

  const accountLinks = [
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 hover:bg-slate-200 rounded-lg"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-slate-200
          transform transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Phone className="text-blue-600" size={32} />
            <h1 className="text-2xl font-bold text-slate-900">Looped</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-8">
          {/* Main Section */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Main
            </p>
            <div className="space-y-1">
              {mainLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                    ${isActive(path)
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Safety Section */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Safety
            </p>
            <div className="space-y-1">
              {safetyLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                    ${isActive(path)
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Account Section */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Account
            </p>
            <div className="space-y-1">
              {accountLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                    ${isActive(path)
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className="px-4 py-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">Status</p>
            <p className="font-semibold text-green-600">Online</p>
          </div>
          <button className="w-full flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
