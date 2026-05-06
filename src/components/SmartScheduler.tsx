import { useState, useMemo } from 'react'
import { Card, DatePicker, TimePicker, Button, Tag, Space, Typography, Divider, Tooltip } from 'antd'
import { ClockCircleOutlined, CheckCircleOutlined, UserOutlined } from '@ant-design/icons'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

const { Text, Title } = Typography

interface ExpertSchedule {
  id: string
  name: string
  department: string
  availableSlots: {
    date: string
    timeSlots: string[]
  }[]
}

interface TimeSlot {
  date: Dayjs
  time: string
  score: number
  availableExperts: number
  totalExperts: number
}

interface SmartSchedulerProps {
  experts: ExpertSchedule[]
  duration?: number
  onSelect?: (date: Dayjs, time: string) => void
}

/**
 * 智能排期推荐组件
 * 基于专家空闲时间自动推荐最优时间段
 */
export default function SmartScheduler({
  experts,
  duration = 60,
  onSelect,
}: SmartSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null)

  // 计算所有专家的共同空闲时间
  const recommendedSlots: TimeSlot[] = useMemo(() => {
    if (experts.length === 0) return []

    const slots: TimeSlot[] = []
    const today = dayjs()
    const next7Days = Array.from({ length: 7 }, (_, i) => today.add(i, 'day'))

    next7Days.forEach((date) => {
      const dateStr = date.format('YYYY-MM-DD')

      // 找出这天所有专家的空闲时段
      const allSlots: Record<string, number> = {}

      experts.forEach((expert) => {
        const schedule = expert.availableSlots.find((s) => s.date === dateStr)
        if (schedule) {
          schedule.timeSlots.forEach((time) => {
            allSlots[time] = (allSlots[time] || 0) + 1
          })
        }
      })

      // 转换为时间槽，计算推荐分数
      Object.entries(allSlots).forEach(([time, count]) => {
        const score = (count / experts.length) * 100
        slots.push({
          date,
          time,
          score,
          availableExperts: count,
          totalExperts: experts.length,
        })
      })
    })

    // 按分数排序，取前 6 个推荐
    return slots.sort((a, b) => b.score - a.score).slice(0, 6)
  }, [experts])

  const handleSelect = () => {
    if (selectedDate && selectedTime) {
      onSelect?.(selectedDate, selectedTime.format('HH:mm'))
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'green'
    if (score >= 50) return 'orange'
    return 'red'
  }

  return (
    <Card title="智能排期推荐" className="w-full">
      <div className="space-y-4">
        <div>
          <Text type="secondary" className="text-sm">
            系统根据 {experts.length} 位专家的排班，为您推荐以下最优时间段
          </Text>
        </div>

        {recommendedSlots.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <ClockCircleOutlined className="text-4xl mb-2" />
            <div>暂无可推荐的时间段</div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {recommendedSlots.map((slot, index) => (
              <Card
                key={`${slot.date.format('YYYY-MM-DD')}-${slot.time}`}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedDate?.isSame(slot.date, 'day') && selectedTime?.format('HH:mm') === slot.time
                    ? '!border-medical-blue !bg-blue-50'
                    : ''
                }`}
                size="small"
                onClick={() => {
                  setSelectedDate(slot.date)
                  setSelectedTime(dayjs(slot.time, 'HH:mm'))
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Tag color={index === 0 ? 'green' : 'default'}>
                      {index === 0 ? '最佳' : `推荐${index + 1}`}
                    </Tag>
                    <Tooltip title={`${slot.availableExperts}/${slot.totalExperts} 专家可用`}>
                      <Tag color={getScoreColor(slot.score)}>{slot.score.toFixed(0)}%</Tag>
                    </Tooltip>
                  </div>

                  <div className="flex items-center gap-2">
                    <ClockCircleOutlined className="text-medical-blue" />
                    <Text strong>{slot.date.format('MM 月 DD 日')}</Text>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircleOutlined className="text-green-500" />
                    <Text>{slot.time}</Text>
                  </div>

                  <Divider className="!my-2" />

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <UserOutlined />
                    <Text type="secondary">
                      {slot.availableExperts} 位专家可参会
                    </Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <Space>
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
            <TimePicker
              value={selectedTime}
              onChange={setSelectedTime}
              format="HH:mm"
            />
          </Space>
          <Button
            type="primary"
            onClick={handleSelect}
            disabled={!selectedDate || !selectedTime}
          >
            确认选择
          </Button>
        </div>
      </div>
    </Card>
  )
}