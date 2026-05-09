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
      case '申请医生':
        return <DoctorWorkbench />
      case '主任医生':
        return <DirectorWorkbench />
      case 'MDT 秘书':
        return <SecretaryWorkbench />
      case '会诊专家':
        return <ExpertWorkbench />
      case '质控员':
        return <QualityWorkbench />
      case '系统管理员':
      case '超级管理员':
        return <AdminWorkbench />
      default:
        return <DoctorWorkbench />
    }
  }

  return <div className="workbench-container">{renderWorkbench()}</div>
}
