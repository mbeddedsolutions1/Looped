import React, { useState } from 'react'
import { Save, X } from 'lucide-react'

export default function ContactForm({ contact, onSave, onCancel }) {
  const [formData, setFormData] = useState(contact || {
    name: '',
    phone: '',
    email: '',
    hot_dial: null
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleHotDialChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({
      ...prev,
      hot_dial: value ? parseInt(value) : null
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name && formData.phone) {
      onSave(formData)
      setFormData({ name: '', phone: '', email: '', hot_dial: null })
    }
  }

  return (
    <div className="bg-white rounded-lg border border-slate-100 shadow-sm">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-semibold text-slate-900">
          {contact ? 'Edit Contact' : 'New Contact'}
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Contact name"
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1-555-0100"
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@example.com"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Hot Dial (1-9)
          </label>
          <select
            value={formData.hot_dial || ''}
            onChange={handleHotDialChange}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">None</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Save size={20} />
            Save Contact
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
          >
            <X size={20} />
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
