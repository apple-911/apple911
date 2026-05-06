import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Calendar, Badge, List, Avatar, Tag, Space, Button, Modal, DatePicker, message, Typography } from 'antd'
import { PlusOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons'
import { mockConsultations, mockExperts } from '../../mocks/data'
import type { Consultation } from '../../stores/consultationStore'
import dayjs from 'dayjs'
import SmartScheduler from '../../components/SmartScheduler'

const { Title, Text } = Typography

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs())
  const [scheduledConsultations, setScheduledConsultations] = useState(mockConsultations.filter(c => c.status === '已通过' || c.status === '进行中'))
  const navigate = useNavigate()

  const getListData = (value: dayjs.Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD')
    return scheduledConsultations
      .filter(c => c.expectTime.startsWith(dateStr))
      .map(c => ({
        id: c.id,
        type: c.urgency === '紧急' ? 'error' : c.urgency === '特急' ? 'warning' : 'success',
        content: `${c.patientName} - ${c.mainDiagnosis.substring(0, 10)}`,
      }))
  }

  const handleDateSelect = (date: dayjs.Dayjs) => {
    setSelectedDate(date)
  }

  const selectedDateConsultations = scheduledConsultations.filter(c =>
    c.expectTime.startsWith(selectedDate.format('YYYY-MM-DD'))
  )

  const handleQuickSchedule = (consultation: Consultation) => {
    Modal.confirm({
      title: '快速排期',
      content: (
        <div>
          <p>为 {consultation.patientName} 选择会诊时间：</p>
          <DatePicker
            showTime
            className="!w-full mt-2"
            defaultValue={dayjs(consultation.expectTime)}
          />
        </div>
      ),
      onOk: () => {
        message.success('排期成功，已通知专家')
      }
    })
  }

  const pendingConsultations = mockConsultations.filter(c => c.status === '待审核').slice(0, 5)

  return (
    <div className="space-y-4">
      <Title level={4}>会诊排期管理</Title>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <Calendar
            fullscreen={false}
            value={selectedDate}
            onSelect={handleDateSelect}
            cellRender={(current, info) => {
              if (info.type === 'date') {
                const listData = getListData(current)
                return (
                  <ul className="events absolute top-0 left-0 w-full p-1">
                    {listData.map((item, index) => (
                      <li key={index}>
                        <Badge status={item.type as any} text={<span className="text-xs">{item.content}</span>} />
                      </li>
                    ))}
                  </ul>
                )
              }
              return info.originNode
            }}
          />
        </Card>

        <Card
          title={
            <Space>
              <CalendarOutlined />
              <span>{selectedDate.format('MM月DD日')} 会诊安排</span>
            </Space>
          }
        >
          {selectedDateConsultations.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CalendarOutlined className="text-4xl mb-2" />
              <p>当日暂无会诊</p>
            </div>
          ) : (
            <List
              dataSource={selectedDateConsultations}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button key="enter" type="link" size="small" onClick={() => navigate(`/consultation/room/${item.id}`)}>
                      进入
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<TeamOutlined />} className="!bg-medical-blue" />}
                    title={item.mainDiagnosis}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text>{item.patientName}</Text>
                        <Text type="secondary" className="text-xs">{item.expectTime}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>

      <Card
        title={
          <Space>
            <PlusOutlined />
            <span>待排期列表</span>
            <Tag color="orange">{pendingConsultations.length}</Tag>
          </Space>
        }
      >
        <List
          dataSource={pendingConsultations}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button key="schedule" type="link" size="small" onClick={() => handleQuickSchedule(item)}>
                  快速排期
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    {item.mainDiagnosis}
                    <Tag color={item.urgency === '紧急' ? 'red' : item.urgency === '特急' ? 'orange' : 'default'}>
                      {item.urgency}
                    </Tag>
                  </Space>
                }
                description={
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">{item.patientName} | {item.applyDoctor}</Text>
                    <Text type="secondary" className="text-xs">期望时间：{item.expectTime}</Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Card title="智能排期推荐" className="mt-4">
        <SmartScheduler
          experts={mockExperts.map(e => ({
            id: e.id,
            name: e.name,
            department: e.department,
            availableSlots: [
              { date: dayjs().format('YYYY-MM-DD'), timeSlots: ['09:00', '10:00', '14:00', '15:00'] },
              { date: dayjs().add(1, 'day').format('YYYY-MM-DD'), timeSlots: ['09:00', '11:00', '14:00'] },
              { date: dayjs().add(2, 'day').format('YYYY-MM-DD'), timeSlots: ['10:00', '14:00', '16:00'] },
            ],
          }))}
          onSelect={(date, time) => {
            message.success(`已选择：${date.format('YYYY-MM-DD')} ${time}`)
          }}
        />
      </Card>
    </div>
  )
}