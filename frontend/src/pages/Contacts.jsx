import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Star, Phone, Mail } from 'lucide-react'
import ContactForm from '../components/contacts/ContactForm'
import ContactList from '../components/contacts/ContactList'
import HotDialPanel from '../components/contacts/HotDialPanel'

export default function Contacts() {
  const [contacts, setContacts] = useState([])
  const [hotDials, setHotDials] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContacts()
    fetchHotDials()
  }, [])

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/contacts')
      if (res.ok) {
        const data = await res.json()
        setContacts(data.contacts || [])
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchHotDials = async () => {
    try {
      const res = await fetch('/api/hot-dials')
      if (res.ok) {
        const data = await res.json()
        setHotDials(data.hot_dials || {})
      }
    } catch (err) {
      console.error('Failed to fetch hot dials:', err)
    }
  }

  const handleAddContact = async (contact) => {
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contact)
      })
      if (res.ok) {
        fetchContacts()
        fetchHotDials()
        setShowForm(false)
      }
    } catch (err) {
      console.error('Failed to add contact:', err)
    }
  }

  const handleUpdateContact = async (contactId, updates) => {
    try {
      const res = await fetch(`/api/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      if (res.ok) {
        fetchContacts()
        fetchHotDials()
        setEditingContact(null)
      }
    } catch (err) {
      console.error('Failed to update contact:', err)
    }
  }

  const handleDeleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        const res = await fetch(`/api/contacts/${contactId}`, {
          method: 'DELETE'
        })
        if (res.ok) {
          fetchContacts()
          fetchHotDials()
        }
      } catch (err) {
        console.error('Failed to delete contact:', err)
      }
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  const hotDialContacts = contacts.filter(c => c.hot_dial)
  const normalContacts = contacts.filter(c => !c.hot_dial)

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contacts</h1>
          <p className="text-slate-500 mt-1">Manage your contacts and hot dials</p>
        </div>
        <button
          onClick={() => {
            setEditingContact(null)
            setShowForm(!showForm)
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Contact
        </button>
      </div>

      {/* Contact Form */}
      {showForm && (
        <div className="mb-8">
          <ContactForm
            contact={editingContact}
            onSave={(contact) => {
              if (editingContact) {
                handleUpdateContact(editingContact.id, contact)
              } else {
                handleAddContact(contact)
              }
            }}
            onCancel={() => {
              setShowForm(false)
              setEditingContact(null)
            }}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Contacts ({contacts.length})
        </button>
        <button
          onClick={() => setActiveTab('hotdial')}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'hotdial'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Star size={16} />
          Hot Dials ({hotDialContacts.length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === 'all' ? (
            <ContactList
              contacts={contacts}
              onEdit={(contact) => {
                setEditingContact(contact)
                setShowForm(true)
              }}
              onDelete={handleDeleteContact}
              onHotDialUpdate={(contactId, hotDial) => {
                handleUpdateContact(contactId, { hot_dial: hotDial })
              }}
            />
          ) : (
            <ContactList
              contacts={hotDialContacts}
              onEdit={(contact) => {
                setEditingContact(contact)
                setShowForm(true)
              }}
              onDelete={handleDeleteContact}
              onHotDialUpdate={(contactId, hotDial) => {
                handleUpdateContact(contactId, { hot_dial: hotDial })
              }}
            />
          )}
        </div>

        {/* Hot Dial Panel */}
        <div>
          <HotDialPanel hotDials={hotDials} />
        </div>
      </div>
    </div>
  )
}

