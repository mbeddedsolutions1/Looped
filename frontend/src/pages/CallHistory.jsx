import React from 'react'

export default function CallHistory() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Call History</h1>
      <p className="text-slate-500 mb-8">View all your previous calls</p>
      
      <div className="bg-white rounded-lg border border-slate-100 p-8 text-center">
        <p className="text-slate-600">No call history yet</p>
      </div>
    </div>
  )
}
