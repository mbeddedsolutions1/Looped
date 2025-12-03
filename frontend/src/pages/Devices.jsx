import React from 'react'
import DeviceForm from '../components/DeviceForm'
import DeviceList from '../components/DeviceList'

export default function Devices() {
  return (
    <div>
      <h1>Devices</h1>
      <DeviceForm />
      <hr />
      <DeviceList />
    </div>
  )
}
