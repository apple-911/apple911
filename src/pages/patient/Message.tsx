import { useState } from 'react'
import { Card, List, Badge, Button, Tabs, Empty } from 'antd'
import { LeftOutlined, BellOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { TabPane } = Tabs

const allMessages = [
  {
    id: 1,
    type: 'consultation',
    title: '会诊安排通知',
    content: '您的 MDT 会诊已安排在 2024 年 1 月 15 日 14:30，地点：北京协和医院 3 楼 MDT 会诊室，请准时参加。',
    time: '2024-01-08 10:30',
    read: false
  },
  {
    id: 2,
    type: 'report',
    title: '报告已完成',
    content: '您的会诊报告已完成，专家已签名确认，您可以查看下载。',
    time: '2024-01-05 16:20',
    read: false
  },
  {
    id: 3,
    type: 'followup',
    title: '随访提醒',
    content: '您有一次随访需要在 1 月 20 日前完成，请及时填写随访记录。',
    time: '2024-01-03 09:00',
    read: true
  },
  {
    id: 4,
    type: 'system',
    title: '系统通知',
    content: '系统将于 1 月 25 日凌晨 2:00-4:00 进行维护，期间可能无法访问，请谅解。',
    time: '2024-01-02 15:00',
    read: true
  },
  {
    id: 5,
    type: 'consultation',
    title: '申请审核通过',
    content: '您的 MDT 会诊申请已通过审核，工作人员将尽快安排会诊时间。',
    time: '2024-01-01 11:00',
    read: true
  }
]

const PatientMessage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')

  const getFilteredMessages = () => {
    if (activeTab === 'all') return allMessages
    if (activeTab === 'unread') return allMessages.filter(m => !m.read)
    if (activeTab === 'read') return allMessages.filter(m => m.read)
    return allMessages
  }

  const getTypeIcon = (type: string) => {
    const colors: any = {
      consultation: 'green',
      report: 'blue',
      followup: 'orange',
      system: 'gray'
    }
    return colors[type] || 'default'
  }

  const messages = getFilteredMessages()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-default)' }}>
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="h-12 flex items-center px-4">
          <Button type="text" icon={<LeftOutlined />} onClick={() => navigate('/patient/home')}>
            返回
          </Button>
          <span className="flex-1 text-center font-bold">消息中心</span>
          <div className="w-16" />
        </div>
      </div>

      {/* 标签页 */}
      <div className="p-4 bg-white">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            { key: 'all', label: `全部消息 (${allMessages.length})` },
            { key: 'unread', label: `未读 (${allMessages.filter(m => !m.read).length})` },
            { key: 'read', label: '已读' }
          ]}
        />
      </div>

      {/* 消息列表 */}
      <div className="p-4 space-y-3">
        {messages.length > 0 ? (
          messages.map(message => (
            <Card 
              key={message.id} 
              className="cursor-pointer hover:shadow-md"
              hoverable
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <Badge 
                    color={getTypeIcon(message.type)}
                    count={!message.read ? 1 : 0}
                    offset={[-5, 5]}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--xiehe-green-bg)' }}>
                      <BellOutlined className="text-lg" style={{ color: 'var(--xiehe-green)' }} />
                    </div>
                  </Badge>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{message.title}</div>
                    <div className="text-xs text-gray-400">{message.time.split(' ')[0]}</div>
                  </div>
                  <div className="text-sm text-gray-600 line-clamp-2">{message.content}</div>
                  <div className="mt-2">
                    <Button type="link" size="small" className="pl-0">
                      查看详情
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Empty description="暂无消息" />
        )}
      </div>

      {/* 底部操作 */}
      {activeTab === 'unread' && messages.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4" style={{ borderColor: 'var(--border-light)' }}>
          <Button block size="large">
            全部标记为已读
          </Button>
        </div>
      )}
    </div>
  )
}

export default PatientMessage
