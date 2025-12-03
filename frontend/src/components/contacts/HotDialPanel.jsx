import React from 'react'
import { Phone, Star } from 'lucide-react'

export default function HotDialPanel({ hotDials = {} }) {
  const slots = Array.from({ length: 9 }, (_, i) => i + 1)

  return (
    <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden sticky top-8">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <Star size={24} className="text-amber-500" />
          Hot Dials
        </h2>
        <p className="text-sm text-slate-600 mt-1">Quick access (1-9)</p>
      </div>

      <div className="p-4 space-y-2">
        {slots.map((slot) => {
          const contact = hotDials[slot]
          return (
            <div
              key={slot}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {slot}
                </div>
                <div className="flex-1 min-w-0">
                  {contact ? (
                    <div>
                      <p className="font-medium text-slate-900 truncate">
                        {contact.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {contact.phone}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">Empty</p>
                  )}
                </div>
                {contact && (
                  <button
                    className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title={`Call ${contact.name}`}
                  >
                    <Phone size={16} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
        <p className="text-xs text-slate-600 text-center">
          Press 1-9 to quick dial
        </p>
      </div>
    </div>
  )
}
