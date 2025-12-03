import React, { useState } from 'react'

export default function DeviceForm() {
  const [name, setName] = useState('')
  const [meta, setMeta] = useState('{}')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    let metaObj = {}
    try {
      metaObj = JSON.parse(meta || '{}')
    } catch (err) {
      setError('Meta must be valid JSON')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, meta: metaObj }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setSuccess(`Added device id=${data.id}`)
      setName('')
      setMeta('{}')
      // notify other components to refresh
      window.dispatchEvent(new Event('devices:updated'))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 600 }}>
      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Device name" style={{ width: '100%' }} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', marginBottom: 4 }}>Meta (JSON)</label>
        <textarea value={meta} onChange={(e) => setMeta(e.target.value)} rows={4} style={{ width: '100%' }} />
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Add Device'}</button>
        {error && <span style={{ color: 'red' }}>{error}</span>}
        {success && <span style={{ color: 'green' }}>{success}</span>}
      </div>
    </form>
  )
}
