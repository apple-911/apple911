import { useState, useMemo } from 'react'
import { Card, DatePicker, TimePicker, Button, Tag, Space, Typography, Alert, List, Avatar, Modal, message, Badge } from 'antd'
import { ClockCircleOutlined, CheckCircleOutlined, UserOutlined, WarningOutlined, TeamOutlined, CalendarOutlined, SyncOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

const { Text, Title } = Typography

interface Expert {
  id: string
  name: string
  department: string
  title: string
  status: '空闲' | '忙碌' | '离线'
  avatar?: string
  specialty: string
}

interface ScheduledEvent {
  id: string
  title: string
  patientName: string
  date: Dayjs
  time: string
  experts: Expert[]
  type: 'consultation' | 'meeting' | 'other'
}

interface ExpertAvailability {
  expertId: string
  date: string
  availableSlots: string[]
  busySlots: string[]
}

interface IntelligentSchedulerProps {
  experts: Expert[]
  scheduledEvents?: ScheduledEvent[]
  expertAvailability?: ExpertAvailability[]
  duration?: number
  onSchedule?: (date: Dayjs, time: string, selectedExperts: Expert[]) => void
  mode?: 'schedule' | 'reschedule'
  existingConsultation?: any
}

export default function IntelligentScheduler({
  experts,
  scheduledEvents = [],
  expertAvailability = [],
  duration = 60,
  onSchedule,
  mode = 'schedule',
  existingConsultation,
}: IntelligentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null)
  const [selectedExperts, setSelectedExperts] = useState<Expert[]>(experts)
  const [showExpertSelector, setShowExpertSelector] = useState(false)

  const getExpertAvailabilityAtTime = useMemo(() => {
    return (date: Dayjs, time: string) => {
      const dateStr = date.format('YYYY-MM-DD')
      return experts.map(expert => {
        const availability = expertAvailability.find(
          a => a.expertId === expert.id && a.date === dateStr
        )
        
        const hasConflict = scheduledEvents.some(event => 
          event.date.isSame(date, 'day') && 
          event.time === time &&
          event.experts.some(e => e.id === expert.id)
        )

        const isBusy = availability?.busySlots.includes(time) || hasConflict
        const isAvailable = availability?.availableSlots.includes(time) && !isBusy

        return {
          expert,
          isAvailable: isAvailable,
          isBusy: isBusy,
          reason: hasConflict ? '已有会诊安排' : isBusy ? '其他安排' : isAvailable ? '空闲' : '未设置'
        }
      })
    }
  }, [experts, expertAvailability, scheduledEvents])

  const recommendedSlots = useMemo(() => {
    if (!selectedDate || experts.length === 0) return []

    const slots: {
      time: string
      score: number
      availableExperts: Expert[]
      busyExperts: Expert[]
      totalExperts: number
    }[] = []

    const timeSlots: string[] = []
    for (let hour = 8; hour <= 17; hour++) {
      timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
      timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    }

    timeSlots.forEach(time => {
      const availability = getExpertAvailabilityAtTime(selectedDate, time)
      const availableExperts = availability.filter((a: any) => a.isAvailable).map((a: any) => a.expert)
      const busyExperts = availability.filter((a: any) => a.isBusy)

      const score = (availableExperts.length / experts.length) * 100

      slots.push({
        time,
        score,
        availableExperts,
        busyExperts,
        totalExperts: experts.length
      })
    })

    return slots
      .filter((s: any) => s.score >= 50)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 8)
  }, [selectedDate, experts, getExpertAvailabilityAtTime])

  const conflictCheck = useMemo(() => {
    if (!selectedDate || !selectedTime) return null

    const availability = getExpertAvailabilityAtTime(selectedDate, selectedTime.format('HH:mm'))
    const busyExperts = availability.filter((a: any) => a.isBusy)
    const unavailableExperts = availability.filter((a: any) => !a.isAvailable)

    return {
      hasConflict: busyExperts.length > 0,
      busyExperts,
      unavailableExperts,
      availableCount: availability.filter((a: any) => a.isAvailable).length,
      totalCount: experts.length
    }
  }, [selectedDate, selectedTime, getExpertAvailabilityAtTime, experts])

  const handleConfirmSchedule = () => {
    if (!selectedDate || !selectedTime) {
      message.warning('请选择日期和时间')
      return
    }

    if (conflictCheck && conflictCheck.hasConflict) {
      Modal.confirm({
        title: '确认排期',
        content: (
          <div>
            <p>以下专家时间有冲突：</p>
            <List
              size="small"
              dataSource={conflictCheck.busyExperts}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.expert.name}
                    description={item.reason}
                  />
                </List.Item>
              )}
            />
            <p className="mt-2">确定要继续排期吗？</p>
          </div>
        ),
        onOk: () => {
          onSchedule?.(selectedDate, selectedTime.format('HH:mm'), selectedExperts)
        }
      })
    } else {
      onSchedule?.(selectedDate, selectedTime.format('HH:mm'), selectedExperts)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'processing'
    return 'warning'
  }

  const renderExpertSelector = () => (
    <Modal
      title="选择会诊专家"
      open={showExpertSelector}
      onCancel={() => setShowExpertSelector(false)}
      onOk={() => setShowExpertSelector(false)}
      width={600}
    >
      <div className="space-y-3">
        <Alert
          message={`已选择 ${selectedExperts.length} 位专家`}
          type="info"
          showIcon
        />
        <List
          dataSource={experts}
          renderItem={(expert: Expert) => {
            const isSelected = selectedExperts.some(e => e.id === expert.id)
            return (
              <List.Item
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  if (isSelected) {
                    setSelectedExperts(selectedExperts.filter(e => e.id !== expert.id))
                  } else {
                    setSelectedExperts([...selectedExperts, expert])
                  }
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Badge status={expert.status === '空闲' ? 'success' : expert.status === '忙碌' ? 'error' : 'default'}>
                      <Avatar icon={<UserOutlined />} src={expert.avatar} />
                    </Badge>
                  }
                  title={
                    <Space>
                      <Text strong>{expert.name}</Text>
                      <Tag>{expert.department}</Tag>
                      <Tag>{expert.title}</Tag>
                    </Space>
                  }
                  description={
                    <Text type="secondary">
                      状态：{expert.status === '空闲' ? '空闲' : expert.status === '忙碌' ? '忙碌' : '离线'}
                    </Text>
                  }
                />
                <Tag color={isSelected ? 'green' : 'default'}>
                  {isSelected ? '已选择' : '未选择'}
                </Tag>
              </List.Item>
            )
          }}
        />
      </div>
    </Modal>
  )

  const renderRecommendedSlots = () => (
    <div className="space-y-3">
      <Title level={5}>
        <ClockCircleOutlined className="mr-2" />
        智能推荐时间段
      </Title>
      {recommendedSlots.length === 0 ? (
        <Alert
          message="暂无推荐时间段"
          description="请选择日期或调整专家组合"
          type="info"
          showIcon
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {recommendedSlots.map((slot: any) => (
            <Button
              key={slot.time}
              onClick={() => {
                setSelectedTime(dayjs(slot.time, 'HH:mm'))
                message.success(`选择时间 ${slot.time}，${slot.availableExperts.length}/${slot.totalExperts} 位专家可用`)
              }}
              className="h-full"
              style={{ minHeight: '80px' }}
            >
              <div className="flex flex-col items-center justify-center w-full gap-1">
                <div className="text-sm font-bold">{slot.time}</div>
                <div className="text-xs text-gray-500">
                  {slot.availableExperts.length}/{slot.totalExperts} 专家
                </div>
                <Tag color={getScoreColor(slot.score)} style={{ fontSize: '10px', padding: '0 4px' }}>
                  {Math.round(slot.score)}%
                </Tag>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  )

  const renderConflictAlert = () => {
    if (!conflictCheck) return null

    if (conflictCheck.hasConflict) {
      return (
        <Alert
          message={`${conflictCheck.busyExperts.length} 位专家时间冲突`}
          description={
            <List
              size="small"
              dataSource={conflictCheck.busyExperts}
              renderItem={(item: any) => (
                <List.Item className="!py-1">
                  <List.Item.Meta
                    avatar={<WarningOutlined className="text-orange-500" />}
                    title={item.expert.name}
                    description={item.reason}
                  />
                </List.Item>
              )}
            />
          }
          type="warning"
          showIcon
        />
      )
    }

    if (conflictCheck.availableCount < conflictCheck.totalCount) {
      return (
        <Alert
          message={`部分专家不可用`}
          description={`${conflictCheck.availableCount}/${conflictCheck.totalCount} 位专家可用`}
          type="info"
          showIcon
        />
      )
    }

    return (
      <Alert
        message={`${conflictCheck.availableCount} 位专家均可用`}
        type="success"
        showIcon
        icon={<CheckCircleOutlined />}
      />
    )
  }

  return (
    <div className="space-y-4">
      {mode === 'reschedule' && existingConsultation && (
        <Alert
          message={`调整排期：${existingConsultation.patientName}`}
          description={
            <Space>
              <span>原时间：{existingConsultation.expectTime}</span>
              <SyncOutlined spin />
              <span>新时间：待选择</span>
            </Space>
          }
          type="info"
          showIcon
        />
      )}

      <Card title={
        <Space>
          <CalendarOutlined className="mr-2" />
          <span>选择会诊时间</span>
        </Space>
      }>
        <div className="space-y-4">
          <DatePicker
            value={selectedDate}
            onChange={(date) => {
              setSelectedDate(date)
              setSelectedTime(null)
            }}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
            style={{ width: '100%' }}
            size="large"
            placeholder="选择日期"
          />
          {selectedDate && selectedTime && renderConflictAlert()}
        </div>
      </Card>

      {selectedDate && renderRecommendedSlots()}

      <Card
        title={
          <Space>
            <TeamOutlined className="mr-2" />
            <span>会诊专家</span>
          </Space>
        }
        extra={
          <Button size="small" onClick={() => setShowExpertSelector(true)}>
            调整专家
          </Button>
        }
      >
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {selectedExperts.map(expert => (
              <Tag key={expert.id} icon={<UserOutlined />} closable onClose={() => {
                setSelectedExperts(selectedExperts.filter(e => e.id !== expert.id))
              }}>
                {expert.name} ({expert.department})
              </Tag>
            ))}
          </div>
          <Text type="secondary">
            共 {selectedExperts.length} 位专家
          </Text>
        </div>
      </Card>

      <div className="flex justify-center gap-3 pt-4">
        <Button
          size="large"
          onClick={() => {
            setSelectedDate(null)
            setSelectedTime(null)
            setSelectedExperts(experts)
          }}
        >
          重置
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<CheckCircleOutlined />}
          onClick={handleConfirmSchedule}
          disabled={!selectedDate || !selectedTime}
        >
          {mode === 'reschedule' ? '确认调整' : '确认排期'}
        </Button>
      </div>

      {renderExpertSelector()}
    </div>
  )
}
