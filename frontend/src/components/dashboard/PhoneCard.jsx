import React from 'react'
import { Link } from 'react-router-dom'
import { Phone, Activity, MoreVertical } from 'lucide-react'

export default function PhoneCard({ phone, onRefresh }) {
  const statusColor = phone.meta?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
  const statusText = phone.meta?.status === 'active' ? 'Active' : 'Offline'

  return (
    <div className="bg-white rounded-lg border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Phone className="text-blue-600" size={24} />
            <div>
              <h3 className="font-semibold text-slate-900">{phone.name}</h3>
              <p className="text-sm text-slate-500">{phone.hostname}</p>
            </div>
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <MoreVertical size={20} className="text-slate-400" />
          </button>
        </div>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
          {statusText}
        </span>
      </div>

      {/* Details */}
      <div className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Type</span>
          <span className="font-medium text-slate-900">{phone.meta?.type || 'Unknown'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Location</span>
          <span className="font-medium text-slate-900">{phone.meta?.location || 'N/A'}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-2">
        <Link
          to={`/phone/${phone.id}`}
          className="flex-1 px-3 py-2 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
        >
          View Details
        </Link>
        <button
          onClick={onRefresh}
          className="flex-1 px-3 py-2 text-center text-sm font-medium text-slate-600 hover:bg-slate-200 rounded transition-colors"
        >
          Refresh
        </button>
      </div>
    </div>
  )
}
