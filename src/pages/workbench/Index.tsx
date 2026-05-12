import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../stores/appStore'
import DoctorWorkbench from './DoctorWorkbench'
import DirectorWorkbench from './DirectorWorkbench'
import SecretaryWorkbench from './SecretaryWorkbench'
import ExpertWorkbench from './ExpertWorkbench'
import QualityWorkbench from './QualityWorkbench'
import AdminWorkbench from './AdminWorkbench'

/**
 * 统一工作台入口
 * 根据不同角色展示不同的工作台界面
 */
export default function Workbench() {
  const { role } = useAppStore()

  // 根据角色渲染不同的工作台
  const renderWorkbench = () => {
    switch (role) {
      case 'apply_doctor':
        return <DoctorWorkbench />
      case 'director':
        return <DirectorWorkbench />
      case 'secretary':
        return <SecretaryWorkbench />
      case 'expert':
        return <ExpertWorkbench />
      case 'quality_controller':
        return <QualityWorkbench />
      case 'admin':
      case 'super_admin':
        return <AdminWorkbench />
      default:
        return <DoctorWorkbench />
    }
  }

  return <div className="workbench-container">{renderWorkbench()}</div>
}
