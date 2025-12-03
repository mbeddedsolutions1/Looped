import React from 'react'
import { Link } from 'react-router-dom'
import { Smartphone, Plus } from 'lucide-react'

export default function EmptyState() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-100 rounded-full">
            <Smartphone size={48} className="text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">No Devices Yet</h1>
        <p className="text-slate-600 mb-8">
          Get started by adding your first Looped device. Follow the setup wizard to configure your device.
        </p>
        <Link
          to="/setup"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Add Your First Device
        </Link>
      </div>
    </div>
  )
}
