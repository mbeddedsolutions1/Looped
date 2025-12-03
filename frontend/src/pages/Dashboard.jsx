import React, { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import PhoneCard from '../components/dashboard/PhoneCard'
import QuickStats from '../components/dashboard/QuickStats'
import RecentCallHistory from '../components/dashboard/RecentCallHistory'
import EmptyState from '../components/dashboard/EmptyState'

export default function Dashboard() {
  const [phones, setPhones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPhones()
  }, [])

  const fetchPhones = async () => {
    try {
      const res = await fetch('/api/devices')
      if (res.ok) {
        const data = await res.json()
        setPhones(data.devices || [])
      }
    } catch (err) {
      console.error('Failed to fetch devices:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (phones.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your Looped devices</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          Add Device
        </button>
      </div>

      {/* Quick Stats */}
      <QuickStats phones={phones} />

      {/* Phones Grid */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Your Devices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {phones.map((phone) => (
            <PhoneCard key={phone.id} phone={phone} onRefresh={fetchPhones} />
          ))}
        </div>
      </div>

      {/* Recent Call History */}
      <div className="mt-8">
        <RecentCallHistory />
      </div>
    </div>
  )
}