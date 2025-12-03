import React from 'react'
import { Clock, Phone, User } from 'lucide-react'

export default function RecentCallHistory() {
  const calls = [
    { id: 1, contact: 'John Doe', type: 'incoming', duration: '3:45', timestamp: '2 hours ago' },
    { id: 2, contact: 'Jane Smith', type: 'outgoing', duration: '5:20', timestamp: '4 hours ago' },
    { id: 3, contact: 'Missed Call', type: 'missed', duration: '0:00', timestamp: '6 hours ago' },
  ]

  return (
    <div className="bg-white rounded-lg border border-slate-100 shadow-sm">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-semibold text-slate-900">Recent Call History</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {calls.map((call) => (
          <div key={call.id} className="p-6 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 rounded-full">
                  <Phone size={20} className="text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{call.contact}</p>
                  <p className="text-sm text-slate-500">{call.duration}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <Clock size={16} />
                {call.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
