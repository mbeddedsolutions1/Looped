import React from 'react'
import { Trash2, Edit2, Star, Phone, Mail } from 'lucide-react'

export default function ContactList({ contacts, onEdit, onDelete, onHotDialUpdate }) {
  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-100 p-8 text-center">
        <p className="text-slate-600">No contacts yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="bg-white rounded-lg border border-slate-100 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-slate-900">{contact.name}</h3>
                {contact.hot_dial && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                    <Star size={14} />
                    {contact.hot_dial}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone size={16} />
                  <span>{contact.phone}</span>
                </div>
                {contact.email && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail size={16} />
                    <span>{contact.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 ml-4">
              <button
                onClick={() => onEdit(contact)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit contact"
              >
                <Edit2 size={20} />
              </button>
              <button
                onClick={() => onDelete(contact.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete contact"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
