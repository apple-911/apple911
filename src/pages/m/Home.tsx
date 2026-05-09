import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, List, Badge, Space, Tag, Avatar, Button, Typography, Alert, Menu } from 'antd'
import type { MenuProps } from 'antd'
import {
  HomeOutlined,
  MessageOutlined,
  CheckSquareOutlined,
  UserOutlined,
  BellOutlined,
} from '@ant-design/icons'
import { mockConsultations, mockFollowupPlans } from '../../mocks/data'

const { Title, Text } = Typography

export default function MHome() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('home')

  const todayMeetings = mockConsultations.filter(c => c.status === '进行中')
  const pendingCount = mockConsultations.filter(c => c.status === '待科室审核').length
  const todoCount = pendingCount + mockFollowupPlans.filter(f => f.status === '进行中').length

  const menuItems: MenuProps['items'] = [
    { key: 'home', icon: <HomeOutlined style={{ fontSize: '20px' }} />, label: <span style={{ fontSize: '12px' }}>首页</span> },
    { key: 'message', icon: <Badge count={3}><MessageOutlined style={{ fontSize: '20px' }} /></Badge>, label: <span style={{ fontSize: '12px' }}>消息</span> },
    { key: 'todo', icon: <Badge count={todoCount}><CheckSquareOutlined style={{ fontSize: '20px' }} /></Badge>, label: <span style={{ fontSize: '12px' }}>待办</span> },
    { key: 'profile', icon: <UserOutlined style={{ fontSize: '20px' }} />, label: <span style={{ fontSize: '12px' }}>我的</span> },
  ]

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setActiveTab(e.key)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="p-3 space-y-3">
            <Card className="text-white" styles={{ body: { padding: '16px' } }} style={{ background: 'linear-gradient(to right, var(--xiehe-green), var(--xiehe-green-light))' }}>
              <div className="flex justify-between items-center">
                <div>
                  <Text className="text-white/80" style={{ fontSize: '14px' }}>欢迎回来</Text>
                  <Title level={4} className="text-white mt-0 mb-0" style={{ fontSize: '18px', fontWeight: 600 }}>张明华 主任</Title>
                </div>
                <Avatar size={40} icon={<UserOutlined />} className="bg-white" style={{ color: 'var(--xiehe-green)' }} />
              </div>
            </Card>

            {todayMeetings.length > 0 && (
              <Card title="今日会诊" className="border-l-4" styles={{ body: { padding: '12px' } }} style={{ borderLeftColor: 'var(--warning-color)' }}>
                {todayMeetings.map(m => (
                  <div key={m.id} className="mb-3 last:mb-0 pb-3 last:border-b-0 border-b" style={{ borderColor: 'var(--border-light)' }}>
                    <Space direction="vertical" size="small" className="w-full">
                      <div className="flex justify-between items-center">
                        <Title level={5} className="mb-0 flex-1" style={{ fontSize: '15px', fontWeight: 500 }}>{m.mainDiagnosis.substring(0, 12)}...</Title>
                        <Tag color="orange" style={{ fontSize: '12px' }}>即将开始</Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: '13px' }}>{m.expectTime}</Text>
                      <Button
                        type="primary"
                        size="small"
                        className="border-orange-500"
                        style={{ background: 'var(--warning-color)', borderColor: 'var(--warning-color)' }}
                        onClick={() => navigate(`/m/room/${m.id}`)}
                        block
                      >
                        进入会诊
                      </Button>
                    </Space>
                  </div>
                ))}
              </Card>
            )}

            <Card title="待处理" styles={{ body: { padding: '12px' } }}>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg text-center" style={{ background: 'var(--xiehe-green-bg)' }}>
                  <Title level={2} className="mb-0" style={{ fontSize: '28px', fontWeight: 600, color: 'var(--warning-color)' }}>{pendingCount}</Title>
                  <Text type="secondary" style={{ fontSize: '13px' }}>待审核</Text>
                </div>
                <div className="p-3 rounded-lg text-center" style={{ background: 'var(--primary-50)' }}>
                  <Title level={2} className="mb-0" style={{ fontSize: '28px', fontWeight: 600, color: 'var(--xiehe-green)' }}>{todayMeetings.length}</Title>
                  <Text type="secondary" style={{ fontSize: '13px' }}>今日会诊</Text>
                </div>
              </div>
            </Card>

            <Card title="最近访问患者" styles={{ body: { padding: '8px' } }}>
              <List
                size="small"
                dataSource={mockConsultations.slice(0, 3)}
                renderItem={(item) => (
                  <List.Item className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/patient/360/${item.patientId}`)}>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} size={40} />}
                      title={<span style={{ fontSize: '14px' }}>{item.patientName}</span>}
                      description={<span style={{ fontSize: '12px', color: '#999' }}>{item.mainDiagnosis.substring(0, 15)}...</span>}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )

      case 'message':
        return (
          <div className="p-3 space-y-3">
            <Alert message="您有 3 条新通知" showIcon style={{ fontSize: '13px' }} />
            <List
              dataSource={[
                { id: 1, title: '会诊邀请', desc: '王建国申请会诊，邀请您参加', time: '10 分钟前', unread: true },
                { id: 2, title: '报告待签', desc: '刘芳会诊报告待您签名', time: '30 分钟前', unread: true },
                { id: 3, title: '会诊提醒', desc: '张伟会诊将在 15 分钟后开始', time: '1 小时前', unread: false },
              ]}
              renderItem={(item) => (
                <List.Item className="cursor-pointer hover:bg-gray-50" style={{ padding: '12px 8px' }}>
                  <List.Item.Meta
                    avatar={<Badge dot={item.unread}><Avatar icon={<BellOutlined />} size={40} /></Badge>}
                    title={<span style={{ fontSize: '14px', fontWeight: 500 }}>{item.title}</span>}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text type="secondary" style={{ fontSize: '13px' }}>{item.desc}</Text>
                        <Text type="secondary" style={{ fontSize: '12px' }}>{item.time}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )

      case 'todo':
        return (
          <div className="p-3 space-y-3">
            <Title level={5} style={{ fontSize: '16px', fontWeight: 600 }}>待办事项 ({todoCount})</Title>
            <List
              dataSource={[
                ...mockConsultations.filter(c => c.status === '待科室审核').map(c => ({
                  id: c.id,
                  title: '会诊待审核',
                  desc: `${c.patientName} - ${c.mainDiagnosis}`,
                  type: 'review',
                  time: c.applyTime,
                })),
                ...mockFollowupPlans.filter(f => f.status === '进行中').map(f => ({
                  id: f.id,
                  title: '随访提醒',
                  desc: `${f.patientName} - ${f.purpose}`,
                  type: 'followup',
                  time: f.nextFollowup,
                })),
              ]}
              renderItem={(item) => (
                <Card size="small" className="mb-2" styles={{ body: { padding: '12px' } }}>
                  <Space direction="vertical" size="small" className="w-full">
                    <Space>
                      <Tag color={item.type === 'review' ? 'orange' : 'blue'} style={{ fontSize: '12px' }}>{item.title}</Tag>
                      <Text style={{ fontSize: '13px' }}>{item.desc}</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: '12px' }}>{item.time}</Text>
                  </Space>
                </Card>
              )}
            />
          </div>
        )

      case 'profile':
        return (
          <div className="p-3 text-center pt-8">
            <Avatar size={80} icon={<UserOutlined />} className="mb-3" style={{ background: 'var(--xiehe-green)' }} />
            <Title level={4} style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>张明华</Title>
            <Text type="secondary" style={{ fontSize: '14px' }}>肿瘤科 | 主任医师</Text>
            <div className="mt-6 space-y-2 px-4">
              <Button block size="large" type="primary" style={{ background: 'var(--xiehe-green)', borderColor: 'var(--xiehe-green)' }}>个人设置</Button>
              <Button block size="large" danger onClick={() => navigate('/login')}>退出登录</Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen pb-[60px]" style={{ background: 'var(--bg-default)' }}>
      {renderContent()}
      <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom" style={{ background: 'var(--bg-paper)', borderTop: '1px solid var(--border-light)' }}>
        <Menu
          mode="horizontal"
          selectedKeys={[activeTab]}
          onClick={handleMenuClick}
          items={menuItems}
          className="w-full border-none justify-around"
          style={{ 
            display: 'flex',
            background: 'transparent',
          }}
        />
      </div>
    </div>
  )
}