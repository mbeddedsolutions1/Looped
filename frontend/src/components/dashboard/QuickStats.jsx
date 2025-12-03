import React from 'react'
import { Globe, Zap, Users, BarChart3 } from 'lucide-react'

export default function QuickStats({ phones = [] }) {
  const stats = [
    {
      label: 'Active Devices',
      value: phones.filter(p => p.meta?.status === 'active').length,
      icon: Zap,
      color: 'green',
    },
    {
      label: 'Total Devices',
      value: phones.length,
      icon: Globe,
      color: 'blue',
    },
    {
      label: 'Contacts',
      value: '3 / 5',
      icon: Users,
      color: 'purple',
    },
    {
      label: 'Performance',
      value: '98%',
      icon: BarChart3,
      color: 'orange',
    },
  ]

  const colorMap = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        const colors = colorMap[stat.color] || colorMap.blue
        return (
          <div
            key={stat.label}
            className="bg-white rounded-lg p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`${colors} p-3 rounded-lg`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
