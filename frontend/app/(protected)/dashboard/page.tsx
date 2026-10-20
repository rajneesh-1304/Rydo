import UserDashboard from '@/components/dashboard/user-dashboard'
import React from 'react'

const page = () => {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <UserDashboard />
    </div>
  )
}

export default page