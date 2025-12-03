import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Phone, MapPin, Wifi, Clock } from 'lucide-react'

export default function PhoneDetails() {
  const { id } = useParams()
  const [phone, setPhone] = useState(null)

  useEffect(() => {
    fetchPhone()
  }, [id])

  const fetchPhone = async () => {
    try {
      const res = await fetch('/api/devices')
      if (res.ok) {
        const data = await res.json()
        const found = data.devices?.find(p => p.id === parseInt(id))
        setPhone(found)
      }
    } catch (err) {
      console.error('Failed to fetch device:', err)
    }
  }

  if (!phone) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl">
      <Link to="/" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
        <ArrowLeft size={20} />
        Back to Dashboard
      </Link>

      <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <Phone className="text-blue-600" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{phone.name}</h1>
              <p className="text-slate-500">{phone.hostname}</p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-semibold text-slate-900 mb-4">Device Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Device Type</p>
                <p className="font-medium text-slate-900">{phone.meta?.type || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Location</p>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-slate-400" />
                  <p className="font-medium text-slate-900">{phone.meta?.location || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Status</p>
                <p className={`font-medium ${phone.meta?.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                  {phone.meta?.status === 'active' ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-slate-900 mb-4">Additional Details</h2>
            <div className="space-y-4">
              {phone.meta?.sensors && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Sensors</p>
                  <div className="flex flex-wrap gap-2">
                    {phone.meta.sensors.map(sensor => (
                      <span key={sensor} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        {sensor}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {phone.meta?.function && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Function</p>
                  <p className="font-medium text-slate-900">{phone.meta.function}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
