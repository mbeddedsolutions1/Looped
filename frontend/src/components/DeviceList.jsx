import React, { useEffect, useState } from 'react'

export default function DeviceList() {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDevices = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/devices')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setDevices(data.devices || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()

    const handler = () => fetchDevices()
    window.addEventListener('devices:updated', handler)
    return () => window.removeEventListener('devices:updated', handler)
  }, [])

  return (
    <div>
      <h3>Device List</h3>
      <button onClick={fetchDevices} disabled={loading} style={{ marginBottom: 8 }}>
        {loading ? 'Refreshing...' : 'Refresh'}
      </button>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {!loading && devices.length === 0 && <div>No devices found.</div>}
      <ul>
        {devices.map((d) => (
          <li key={d.id}>
            <strong>{d.name}</strong> — <code>Hostname: {d.hostname}</code> — <code>{JSON.stringify(d.meta)}</code>
          </li>
        ))}
      </ul>
    </div>
  )
}
