import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Calendar, Badge, List, Avatar, Tag, Space, Button, Modal, DatePicker, message, Typography, Tabs, Table, UserOutlined } from 'antd'
import { PlusOutlined, TeamOutlined, CalendarOutlined, EditOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { mockConsultations, mockExperts } from '../../mocks/data'
import type { Consultation, Expert } from '../../stores/consultationStore'
import dayjs from 'dayjs'
import IntelligentScheduler from '../../components/IntelligentScheduler'

const { Title, Text } = Typography

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs())
  const [scheduledConsultations, setScheduledConsultations] = useState(mockConsultations.filter(c => c.status === '已通过' || c.status === '已排期'))
  const [reschedulingConsultation, setReschedulingConsultation] = useState<Consultation | null>(null)
  const [showScheduler, setShowScheduler] = useState(false)
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

  // 打开智能排期
  const handleSchedule = (consultation: Consultation) => {
    setReschedulingConsultation(consultation)
    setShowScheduler(true)
  }

  // 确认排期
  const handleConfirmSchedule = (date: dayjs.Dayjs, time: string, selectedExperts: Expert[]) => {
    const datetime = date.format('YYYY-MM-DD') + ' ' + time
    message.success(`排期成功！会诊时间：${datetime}`)
    setShowScheduler(false)
    setReschedulingConsultation(null)
    // TODO: 更新会诊状态和专家安排
  }

  const pendingConsultations = mockConsultations.filter(c => c.status === '待审核')

  // 专家时间数据（Mock）
  const expertAvailability = mockExperts.map(expert => ({
    expertId: expert.id,
    date: dayjs().format('YYYY-MM-DD'),
    availableSlots: ['09:00', '10:00', '14:00', '15:00', '16:00'],
    busySlots: ['11:00', '17:00']
  }))

  // 已安排的会诊（用于冲突检测）
  const scheduledEvents = scheduledConsultations.map(c => ({
    id: c.id,
    title: c.mainDiagnosis,
    patientName: c.patientName,
    date: dayjs(c.expectTime),
    time: c.expectTime.split(' ')[1] || '09:00',
    experts: c.experts,
    type: 'consultation' as const
  }))

  return (
    <div className="space-y-4">
      <Title level={4}>会诊排期管理</Title>

      {/* 待排期列表 */}
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            <span>待排期申请</span>
            <Tag color="orange">{pendingConsultations.length}</Tag>
          </Space>
        }
      >
        <Table
          dataSource={pendingConsultations}
          rowKey="id"
          columns={[
            {
              title: '患者信息',
              dataIndex: 'patientName',
              render: (name, record) => (
                <Space>
                  <Avatar icon={<UserOutlined />} size="small" />
                  <div>
                    <div>{name}</div>
                    <div className="text-xs text-gray-500">{record.patientInpatientNo}</div>
                  </div>
                </Space>
              )
            },
            {
              title: '诊断',
              dataIndex: 'mainDiagnosis',
              ellipsis: true
            },
            {
              title: '申请科室',
              dataIndex: 'department'
            },
            {
              title: '申请医生',
              dataIndex: 'applyDoctor'
            },
            {
              title: '紧急程度',
              dataIndex: 'urgency',
              render: (urgency) => (
                <Tag color={urgency === '紧急' ? 'red' : urgency === '特急' ? 'orange' : 'default'}>
                  {urgency}
                </Tag>
              )
            },
            {
              title: '期望时间',
              dataIndex: 'expectTime'
            },
            {
              title: '邀请专家',
              dataIndex: 'experts',
              render: (experts: Expert[]) => (
                <Space wrap>
                  {experts.slice(0, 2).map(e => (
                    <Tag key={e.id}>{e.name}</Tag>
                  ))}
                  {experts.length > 2 && <Tag>+{experts.length - 2}人</Tag>}
                </Space>
              )
            },
            {
              title: '操作',
              key: 'action',
              render: (_, record) => (
                <Space>
                  <Button
                    type="link"
                    size="small"
                    icon={<CalendarOutlined />}
                    onClick={() => handleSchedule(record)}
                  >
                    智能排期
                  </Button>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => navigate(`/consultation/detail/${record.id}`)}
                  >
                    详情
                  </Button>
                </Space>
              )
            }
          ]}
        />
      </Card>

      {/* 已排期列表 */}
      <Card
        title={
          <Space>
            <CheckCircleOutlined />
            <span>已排期会诊</span>
            <Tag color="green">{scheduledConsultations.length}</Tag>
          </Space>
        }
      >
        <Table
          dataSource={scheduledConsultations}
          rowKey="id"
          columns={[
            {
              title: '患者信息',
              dataIndex: 'patientName',
              render: (name, record) => (
                <Space>
                  <Avatar icon={<UserOutlined />} size="small" />
                  <div>
                    <div>{name}</div>
                    <div className="text-xs text-gray-500">{record.patientInpatientNo}</div>
                  </div>
                </Space>
              )
            },
            {
              title: '诊断',
              dataIndex: 'mainDiagnosis',
              ellipsis: true
            },
            {
              title: '会诊时间',
              dataIndex: 'expectTime',
              render: (time) => (
                <Space>
                  <CalendarOutlined />
                  {time}
                </Space>
              )
            },
            {
              title: '会诊专家',
              dataIndex: 'experts',
              render: (experts: Expert[]) => (
                <Space wrap>
                  {experts.slice(0, 3).map(e => (
                    <Tag key={e.id}>{e.name}({e.department})</Tag>
                  ))}
                  {experts.length > 3 && <Tag>+{experts.length - 3}人</Tag>}
                </Space>
              )
            },
            {
              title: '操作',
              key: 'action',
              render: (_, record) => (
                <Space>
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleSchedule(record)}
                  >
                    调整
                  </Button>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => navigate(`/consultation/room/${record.id}`)}
                  >
                    进入
                  </Button>
                </Space>
              )
            }
          ]}
        />
      </Card>

      {/* 智能排期 Modal */}
      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <span>
              {reschedulingConsultation ? `${reschedulingConsultation.patientName} - 会诊排期` : '会诊排期'}
            </span>
          </Space>
        }
        open={showScheduler}
        onCancel={() => {
          setShowScheduler(false)
          setReschedulingConsultation(null)
        }}
        footer={null}
        width={800}
      >
        {reschedulingConsultation && (
          <IntelligentScheduler
            experts={reschedulingConsultation.experts}
            scheduledEvents={scheduledEvents}
            expertAvailability={expertAvailability}
            mode={reschedulingConsultation.status === '待审核' ? 'schedule' : 'reschedule'}
            existingConsultation={reschedulingConsultation}
            onSchedule={handleConfirmSchedule}
          />
        )}
      </Modal>
    </div>
  )
}