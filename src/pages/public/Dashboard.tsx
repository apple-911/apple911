import { useNavigate } from 'react-router-dom'
import DashboardScreen from '../../components/DashboardScreen'
import QualityDashboard from '../../components/QualityDashboard'
import { useAppStore } from '../../stores/appStore'

export default function Dashboard() {
  const navigate = useNavigate()
  const { role } = useAppStore()

  return (
    <div className="space-y-4">
      {role === '质控员' ? <QualityDashboard /> : <DashboardScreen />}
    </div>
  )
}