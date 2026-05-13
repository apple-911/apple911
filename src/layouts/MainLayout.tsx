import { useState, useMemo, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Button, Tag, message } from 'antd'
import {
  DashboardOutlined,
  FileTextOutlined,
  TeamOutlined,
  CalendarOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MedicineBoxOutlined,
  PlusCircleOutlined,
  CheckSquareOutlined,
  BarChartOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  BellOutlined,
  BookOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAppStore, Role } from '../stores/appStore'
import NotificationPanel from '../components/NotificationPanel'
import { hasPermission } from '../utils/helpers'
import { getRoleName, loadCodeTables } from '../utils/codeTable'

const { Header, Sider, Content } = Layout

// 定义带权限的菜单项类型
interface MenuItemConfig {
  key: string
  icon?: React.ReactNode
  label: string
  permission?: string
  children?: MenuItemConfig[]
}

// 所有可用的菜单项及其所需权限
const allMenuItems: MenuItemConfig[] = [
  { key: '/workbench', icon: <DashboardOutlined />, label: '工作台' },
  { key: '/dashboard', icon: <BarChartOutlined />, label: '数据仪表盘' },
  { key: '/consultation/apply', icon: <PlusCircleOutlined />, label: '申请会诊', permission: 'perm-consultation-apply' },
  { key: '/consultation/my-applies', icon: <FileTextOutlined />, label: '我的申请', permission: 'perm-consultation-my-applies' },
  { key: '/consultation/director-confirm', icon: <CheckSquareOutlined />, label: '会诊确认', permission: 'perm-consultation-confirm' },
  { key: '/consultation/pending-review', icon: <CheckSquareOutlined />, label: '待审核', permission: 'perm-consultation-pending-review' },
  { key: '/consultation/schedule', icon: <CalendarOutlined />, label: '排期管理', permission: 'perm-consultation-schedule' },
  { key: '/consultation/material-supervise', icon: <BellOutlined />, label: '材料督办', permission: 'perm-consultation-material' },
  { key: '/consultation/my-meetings', icon: <CalendarOutlined />, label: '我的待参会', permission: 'perm-consultation-my-meetings' },
  { key: '/consultation/mdt-management', icon: <CalendarOutlined />, label: '会诊管理', permission: 'perm-consultation-detail' },
  { key: '/consultation/submit-material', icon: <FileTextOutlined />, label: 'MDT 材料归档', permission: 'perm-consultation-material' },
  { key: '/patient/list', icon: <TeamOutlined />, label: '患者档案', permission: 'perm-patient-list' },
  {
    key: 'case-library',
    icon: <BookOutlined />,
    label: '病案库',
    permission: 'perm-case-library-index',
    children: [
      { key: '/case-library', label: '病案库首页', permission: 'perm-case-library-index' },
      { key: '/case-library/search', label: '病案检索', permission: 'perm-case-library-search' },
      { key: '/case-library/typical', label: '典型病例', permission: 'perm-case-library-typical' },
      { key: '/case-library/statistics', label: '统计分析', permission: 'perm-case-library-statistics' },
      { key: '/case-library/favorites', label: '我的收藏', permission: 'perm-case-library-favorites' },
      { key: '/case-library/learning', label: '学习进度', permission: 'perm-case-library-index' },
      { key: '/case-library/comparison', label: '病例对比', permission: 'perm-case-library-search' },
    ]
  },
  { key: '/report/list', icon: <FileTextOutlined />, label: '报告管理', permission: 'perm-report-list' },
  {
    key: 'followup',
    icon: <CalendarOutlined />,
    label: '随访管理',
    permission: 'perm-followup-list',
    children: [
      { key: '/followup/list', label: '随访计划', permission: 'perm-followup-list' },
      { key: '/followup/execute', label: '随访执行', permission: 'perm-followup-execute' },
      { key: '/followup/planner', label: '计划生成器', permission: 'perm-followup-list' },
    ]
  },
  { key: '/statistics', icon: <BarChartOutlined />, label: '统计分析', permission: 'perm-quality-statistics' },
  { key: '/quality/dashboard', icon: <BarChartOutlined />, label: '质控仪表盘', permission: 'perm-quality-dashboard' },
  { key: '/quality/tasks', icon: <SafetyOutlined />, label: '质控任务', permission: 'perm-quality-tasks' },
  { key: '/ai/screening', icon: <RobotOutlined />, label: 'AI 患者筛查', permission: 'perm-ai-screening' },
  {
    key: 'system-admin',
    icon: <SettingOutlined />,
    label: '系统管理',
    permission: 'perm-admin-org',
    children: [
      { key: '/admin/organizations', label: '组织机构', permission: 'perm-admin-org' },
      { key: '/admin/users', label: '用户管理', permission: 'perm-admin-users' },
      { key: '/admin/roles', label: '角色权限', permission: 'perm-admin-roles' },
      { key: '/admin/code-table', label: '码表管理', permission: 'perm-admin-codes' },
      { key: '/admin/expert-list', label: '专家库管理', permission: 'perm-admin-experts' },
      { key: '/admin/team-list', label: '团队管理', permission: 'perm-admin-teams' },
      { key: '/admin/logs', label: '系统日志', permission: 'perm-admin-logs' },
      { key: '/admin/audit-logs', label: '审计日志', permission: 'perm-admin-audit-logs' },
    ]
  },
  { key: '/notifications', icon: <BellOutlined />, label: '消息通知' },
]

// 根据权限过滤菜单项
function filterMenuItems(items: MenuItemConfig[]): MenuProps['items'] {
  const result: MenuProps['items'] = []
  
  for (const item of items) {
    if (!item) continue
    
    // 没有设置权限要求的菜单项始终显示
    if (!item.permission) {
      // 如果有子菜单，也需要过滤
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterMenuItems(item.children)
        if (filteredChildren && filteredChildren.length > 0) {
          result.push({ ...item, children: filteredChildren })
        }
      } else {
        result.push({ key: item.key, icon: item.icon, label: item.label })
      }
      continue
    }

    // 检查是否有该权限
    if (hasPermission(item.permission)) {
      // 如果有子菜单，也需要过滤
      if (item.children && item.children.length > 0) {
        const filteredChildren = filterMenuItems(item.children)
        if (filteredChildren && filteredChildren.length > 0) {
          result.push({ key: item.key, icon: item.icon, label: item.label, children: filteredChildren })
        } else {
          // 子菜单都没有权限，但父菜单项有权限，显示父菜单
          result.push({ key: item.key, icon: item.icon, label: item.label })
        }
      } else {
        result.push({ key: item.key, icon: item.icon, label: item.label })
      }
    }
  }
  
  return result
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, role, logout } = useAppStore()

  // 根据用户权限动态生成菜单
  const menuItems = useMemo(() => {
    return filterMenuItems(allMenuItems)
  }, [])

  const [menuOpen, setMenuOpen] = useState(false)

  const userMenuItems: MenuProps['items'] = [
    { 
      key: 'profile', 
      icon: <UserOutlined />, 
      label: '个人中心',
      onClick: () => {
        message.info('个人中心功能开发中')
        setMenuOpen(false)
      }
    },
    { 
      key: 'settings', 
      icon: <SettingOutlined />, 
      label: '设置',
      onClick: () => {
        message.info('设置功能开发中')
        setMenuOpen(false)
      }
    },
    { type: 'divider' },
    { 
      key: 'logout', 
      icon: <LogoutOutlined />, 
      label: '退出登录', 
      danger: true,
      onClick: () => {
        logout()
        navigate('/login')
        message.success('已退出登录')
        setMenuOpen(false)
      }
    },
  ]

  return (
    <Layout className="min-h-screen" style={{ background: 'var(--bg-default)' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="!bg-white"
        width={220}
        style={{ 
          borderRight: '1px solid var(--border-light)',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100
        }}
      >
        <div className="h-16 flex items-center justify-center border-b" style={{ borderColor: 'var(--border-light)' }}>
          {collapsed ? (
            <MedicineBoxOutlined className="text-2xl" style={{ color: 'var(--xiehe-green)' }} />
          ) : (
            <span className="text-lg font-bold" style={{ color: 'var(--xiehe-green)' }}>MDT 会诊系统</span>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="!border-none"
          style={{
            background: 'transparent',
            height: 'calc(100% - 64px)',
            overflowY: 'auto',
          }}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 220, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header 
          className="!bg-white !px-4 flex items-center justify-between !h-16 !leading-16 border-b" 
          style={{ 
            borderColor: 'var(--border-light)',
            flexShrink: 0
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div className="flex items-center gap-4">
            <NotificationPanel />
            <Tag color="green" style={{ background: 'var(--xiehe-green-bg)', color: 'var(--xiehe-green)' }}>{user?.name || '用户'}</Tag>
            <Dropdown 
              menu={{ items: userMenuItems }} 
              placement="bottomRight" 
              trigger={['click']}
              open={menuOpen}
              onOpenChange={setMenuOpen}
            >
              <Avatar 
                icon={<UserOutlined />} 
                className="cursor-pointer hover:opacity-80" 
                style={{ 
                  background: '#045126',        // 协和绿 - 直接使用色值
                  color: '#ffffff',             // 白色图标
                  fontSize: '16px',
                  border: '2px solid #045126'   // 确保可见的边框
                }} 
              />
            </Dropdown>
          </div>
        </Header>
        <Content 
          className="p-4 rounded-lg" 
          style={{ 
            background: 'var(--bg-paper)',
            marginLeft: 16,
            marginRight: 16,
            marginBottom: 16,
            overflow: 'auto',
            flex: 1
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}