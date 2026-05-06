import { useState } from 'react'
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
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useAppStore, Role } from '../stores/appStore'
import NotificationPanel from '../components/NotificationPanel'

const { Header, Sider, Content } = Layout

const menuItemsByRole: Record<Role, MenuProps['items']> = {
  '申请医生': [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '工作台' },
    { key: '/consultation/apply', icon: <PlusCircleOutlined />, label: '申请会诊' },
    { key: '/consultation/my-applies', icon: <FileTextOutlined />, label: '我的申请' },
    { key: '/patient/list', icon: <TeamOutlined />, label: '患者档案' },
    {
      key: 'followup',
      icon: <CalendarOutlined />,
      label: '随访管理',
      children: [
        { key: '/followup/list', label: '随访计划' },
        { key: '/followup/execute', label: '随访执行' },
      ]
    },
  ],
  'MDT 秘书': [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '工作台' },
    { key: '/consultation/pending-review', icon: <CheckSquareOutlined />, label: '待审核' },
    { key: '/consultation/schedule', icon: <CalendarOutlined />, label: '排期管理' },
    { key: '/consultation/my-applies', icon: <FileTextOutlined />, label: '我的申请' },
    { key: '/patient/list', icon: <TeamOutlined />, label: '患者档案' },
    { key: '/report/list', icon: <FileTextOutlined />, label: '报告管理' },
    {
      key: 'followup',
      icon: <CalendarOutlined />,
      label: '随访管理',
      children: [
        { key: '/followup/list', label: '随访计划' },
        { key: '/followup/execute', label: '随访执行' },
      ]
    },
  ],
  '会诊专家': [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '工作台' },
    { key: '/consultation/my-meetings', icon: <CalendarOutlined />, label: '我的待参会' },
    { key: '/consultation/my-applies', icon: <FileTextOutlined />, label: '我的申请' },
    { key: '/patient/list', icon: <TeamOutlined />, label: '患者档案' },
    { key: '/report/list', icon: <FileTextOutlined />, label: '报告管理' },
    {
      key: 'followup',
      icon: <CalendarOutlined />,
      label: '随访管理',
      children: [
        { key: '/followup/list', label: '随访计划' },
        { key: '/followup/execute', label: '随访执行' },
      ]
    },
  ],
  '质控员': [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '工作台' },
    { key: '/quality/tasks', icon: <SafetyOutlined />, label: '质控任务' },
    { key: '/statistics', icon: <BarChartOutlined />, label: '统计分析' },
    { key: '/report/list', icon: <FileTextOutlined />, label: '报告管理' },
  ],
  '系统管理员': [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '工作台' },
    { key: '/admin/expert-list', icon: <TeamOutlined />, label: '专家库' },
    { key: '/admin/team-list', icon: <TeamOutlined />, label: '团队管理' },
    { key: '/admin/roles', icon: <SettingOutlined />, label: '角色权限' },
    { key: '/admin/logs', icon: <SafetyOutlined />, label: '系统日志' },
    { key: '/admin/audit-logs', icon: <SafetyOutlined />, label: '审计日志' },
  ],
  '超级管理员': [
    { key: '/dashboard', icon: <DashboardOutlined />, label: '工作台' },
    { key: '/consultation/pending-review', icon: <CheckSquareOutlined />, label: '待审核' },
    { key: '/consultation/schedule', icon: <CalendarOutlined />, label: '排期管理' },
    { key: '/consultation/my-meetings', icon: <CalendarOutlined />, label: '我的待参会' },
    { key: '/patient/list', icon: <TeamOutlined />, label: '患者档案' },
    { key: '/report/list', icon: <FileTextOutlined />, label: '报告管理' },
    {
      key: 'followup',
      icon: <CalendarOutlined />,
      label: '随访管理',
      children: [
        { key: '/followup/list', label: '随访计划' },
        { key: '/followup/execute', label: '随访执行' },
      ]
    },
    { key: '/statistics', icon: <BarChartOutlined />, label: '统计分析' },
    { key: '/quality/tasks', icon: <SafetyOutlined />, label: '质控任务' },
    { key: '/admin/expert-list', icon: <TeamOutlined />, label: '专家库' },
    { key: '/admin/team-list', icon: <TeamOutlined />, label: '团队管理' },
    { key: '/admin/roles', icon: <SettingOutlined />, label: '角色权限' },
    { key: '/admin/logs', icon: <SafetyOutlined />, label: '系统日志' },
    { key: '/admin/audit-logs', icon: <SafetyOutlined />, label: '审计日志' },
  ],
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, role, logout } = useAppStore()

  const menuItems = menuItemsByRole[role] || menuItemsByRole['申请医生']

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
        style={{ borderRight: '1px solid var(--border-light)' }}
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
          }}
        />
      </Sider>
      <Layout>
        <Header className="!bg-white !px-4 flex items-center justify-between !h-16 !leading-16 border-b" style={{ borderColor: 'var(--border-light)' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <div className="flex items-center gap-4">
            <NotificationPanel />
            <Tag color="green" style={{ background: 'var(--xiehe-green-bg)', color: 'var(--xiehe-green)' }}>{role}</Tag>
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
        <Content className="m-4 p-4 rounded-lg" style={{ background: 'var(--bg-paper)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}