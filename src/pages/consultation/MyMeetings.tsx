import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Tabs, Table, Tag, Button, Space, Typography, Empty, List, Avatar } from 'antd'
import { CalendarOutlined, VideoCameraOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { mockConsultations } from '../../mocks/data'
import type { Consultation } from '../../stores/consultationStore'

const { Title, Text } = Typography

export default function MyMeetings() {
  const [activeTab, setActiveTab] = useState('today')
  const navigate = useNavigate()

  const todayStr = new Date().toISOString().split('T')[0]

  const todayMeetings = mockConsultations.filter(c => c.status === '进行中')
  const weekMeetings = mockConsultations.filter(c => ['已通过', '进行中'].includes(c.status))
  const futureMeetings = mockConsultations.filter(c => c.status === '已通过')

  const columns = [
    { title: '会诊主题', dataIndex: 'mainDiagnosis', ellipsis: true },
    { title: '患者', dataIndex: 'patientName', render: (t: string) => <Tag>{t}</Tag> },
    { title: '时间', dataIndex: 'expectTime' },
    { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color={t === '院内' ? 'blue' : 'green'}>{t}</Tag> },
    { title: '状态', dataIndex: 'status', render: (t: string) => <Tag color={t === '进行中' ? 'processing' : 'default'}>{t}</Tag> },
    {
      title: '操作',
      render: (_: any, record: Consultation) => (
        <Space>
          {record.status === '进行中' && (
            <Button
              type="primary"
              icon={<VideoCameraOutlined />}
              onClick={() => navigate(`/consultation/room/${record.id}`)}
            >
              进入会诊室
            </Button>
          )}
        </Space>
      )
    },
  ]

  const renderMeetingList = (meetings: Consultation[]) => {
    if (meetings.length === 0) {
      return <Empty description="暂无会诊" />
    }
    return (
      <List
        dataSource={meetings}
        renderItem={(item) => (
          <List.Item
            className="hover:bg-gray-50 cursor-pointer"
            onClick={() => navigate(`/consultation/detail/${item.id}`)}
            actions={[
              item.status === '进行中' ? (
                <Button key="enter" type="primary" size="small" onClick={(e) => { e.stopPropagation(); navigate(`/consultation/room/${item.id}`) }}>
                  进入
                </Button>
              ) : (
                <Button key="opinion" size="small" onClick={(e) => { e.stopPropagation(); handlePreOpinion(item) }}>
                  预审
                </Button>
              )
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<TeamOutlined />} style={{ background: 'var(--xiehe-green)' }} />}
              title={<Space>{item.mainDiagnosis}<Tag color={item.status === '进行中' ? 'processing' : 'default'}>{item.status}</Tag></Space>}
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">{item.patientName} | {item.expectTime}</Text>
                  <Space>
                    {item.experts.slice(0, 3).map(e => <Tag key={e.id} className="!m-0">{e.name}</Tag>)}
                  </Space>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    )
  }

  return (
    <div className="space-y-4">
      <Title level={4}>我的待参会</Title>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'today',
              label: <span><ClockCircleOutlined /> 今日</span>,
              children: renderMeetingList(todayMeetings),
            },
            {
              key: 'week',
              label: <span><CalendarOutlined /> 本周</span>,
              children: renderMeetingList(weekMeetings),
            },
            {
              key: 'future',
              label: <span><CalendarOutlined /> 未来</span>,
              children: renderMeetingList(futureMeetings),
            },
          ]}
        />
      </Card>

      <Card title="会诊列表">
        <Table columns={columns} dataSource={mockConsultations} rowKey="id" size="small" pagination={false} />
      </Card>
    </div>
  )
}