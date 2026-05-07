import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Calendar, Badge, List, Avatar, Tag, Space, Button, Modal, DatePicker, message, Typography, Tabs, Table } from 'antd'
import { PlusOutlined, TeamOutlined, CalendarOutlined, EditOutlined, ClockCircleOutlined, CheckCircleOutlined, UserOutlined } from '@ant-design/icons'
import { mockConsultations, mockExperts } from '../../mocks/data'
import type { Consultation, Expert } from '../../stores/consultationStore'
import dayjs from 'dayjs'
import IntelligentScheduler from '../../components/IntelligentScheduler'

const { Title, Text } = Typography

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs())
  const [scheduledConsultations, setScheduledConsultations] = useState(mockConsultations.filter(c => c.status === '已通过'))
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
          scroll={{ x: 1400 }}
          columns={[
            {
              title: '患者信息',
              dataIndex: 'patientName',
              width: 120,
              fixed: 'left',
              render: (name, record: any) => (
                <Space>
                  <Avatar icon={<UserOutlined />} size="small" />
                  <div>
                    <div className="font-medium">{name}</div>
                    <div className="text-xs text-gray-500">{record.patientInpatientNo}</div>
                    <div className="text-xs text-gray-400">{record.age ? `${record.age}岁` : ''} {record.gender === 'male' ? '男' : record.gender === 'female' ? '女' : ''}</div>
                  </div>
                </Space>
              )
            },
            {
              title: '诊断信息',
              key: 'diagnosis',
              width: 180,
              render: (_, record: any) => (
                <div>
                  <div className="font-medium text-sm">{record.mainDiagnosis}</div>
                  {record.otherDiagnoses && record.otherDiagnoses.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      其他：{record.otherDiagnoses.slice(0, 2).join('、')}
                      {record.otherDiagnoses.length > 2 && ` 等${record.otherDiagnoses.length}项`}
                    </div>
                  )}
                </div>
              )
            },
            {
              title: '申请信息',
              key: 'apply',
              width: 120,
              render: (_, record: any) => (
                <div>
                  <div className="text-sm">{record.department}</div>
                  <div className="text-xs text-gray-500">{record.applyDoctor}</div>
                  <div className="text-xs text-gray-400">{record.applyDate}</div>
                </div>
              )
            },
            {
              title: '紧急程度',
              dataIndex: 'urgency',
              width: 90,
              render: (urgency: string) => {
                const colorMap: Record<string, string> = {
                  '特急': 'red',
                  '紧急': 'orange',
                  '普通': 'default'
                }
                return <Tag color={colorMap[urgency] || 'default'}>{urgency}</Tag>
              }
            },
            {
              title: '期望时间',
              dataIndex: 'expectTime',
              width: 140,
              render: (time) => (
                <div>
                  <div className="text-sm">{time}</div>
                </div>
              )
            },
            {
              title: '会诊目的',
              dataIndex: 'consultationPurpose',
              width: 150,
              ellipsis: true
            },
            {
              title: '邀请专家',
              dataIndex: 'experts',
              width: 180,
              render: (experts: Expert[]) => (
                <Space wrap>
                  {experts.slice(0, 3).map(e => (
                    <Tag key={e.id} color="blue">
                      {e.name}
                      <br />
                      <span className="text-xs">{e.department}</span>
                    </Tag>
                  ))}
                  {experts.length > 3 && (
                    <Tag color="gray">+{experts.length - 3}人</Tag>
                  )}
                </Space>
              )
            },
            {
              title: '操作',
              key: 'action',
              width: 120,
              fixed: 'right',
              render: (_, record) => (
                <Space direction="vertical" size="small">
                  <Button
                    type="primary"
                    size="small"
                    icon={<CalendarOutlined />}
                    onClick={() => handleSchedule(record)}
                    block
                  >
                    智能排期
                  </Button>
                  <Button
                    size="small"
                    icon={<UserOutlined />}
                    onClick={() => navigate(`/patient/detail/${record.patientId}`)}
                    block
                  >
                    患者详情
                  </Button>
                  <Button
                    size="small"
                    onClick={() => navigate(`/consultation/detail/${record.id}`)}
                    block
                  >
                    会诊详情
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