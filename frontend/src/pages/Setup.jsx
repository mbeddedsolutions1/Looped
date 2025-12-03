import React from 'react'
import { Wifi, Shield, Phone } from 'lucide-react'

export default function Setup() {
  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Device Setup</h1>
      <p className="text-slate-500 mb-8">Follow these steps to set up your new Looped device</p>
      
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-slate-100 p-6 flex gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Wifi className="text-blue-600" size={24} />
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Step 1: WiFi Connection</h2>
            <p className="text-slate-600 mt-1">Connect your device to WiFi for initial setup</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-100 p-6 flex gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Shield className="text-green-600" size={24} />
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Step 2: Security Setup</h2>
            <p className="text-slate-600 mt-1">Configure security settings and credentials</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-100 p-6 flex gap-4">
          <div className="flex-shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Phone className="text-purple-600" size={24} />
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Step 3: Register Device</h2>
            <p className="text-slate-600 mt-1">Register your device and complete the setup</p>
          </div>
        </div>
      </div>
    </div>
  )
}
