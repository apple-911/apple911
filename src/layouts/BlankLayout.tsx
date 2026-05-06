import { Outlet, Navigate } from 'react-router-dom'
import { useAppStore } from '../stores/appStore'

export default function BlankLayout() {
  const { user } = useAppStore()

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-blue to-blue-600 flex items-center justify-center">
      <Outlet />
    </div>
  )
}