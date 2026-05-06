import { useNavigate } from 'react-router-dom'
import DashboardScreen from '../../components/DashboardScreen'

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-4">
      <DashboardScreen />
    </div>
  )
}