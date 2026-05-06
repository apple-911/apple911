import { Navigate } from 'react-router-dom'
import { useAppStore } from '../stores/appStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAppStore()

  // 如果没有登录，重定向到登录页
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
