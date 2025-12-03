import React from 'react'
import { Outlet } from 'react-router-dom'

export default function Layout({ mobileOpen, setMobileOpen }) {
  return (
    <div 
      className="w-full pt-16 md:pt-0"
      onClick={() => mobileOpen && setMobileOpen(false)}
    >
      <Outlet />
    </div>
  )
}
