import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Tag, Space, Modal, message, List, Avatar, Typography, Empty, Select, DatePicker } from 'antd'
import { CheckOutlined, CloseOutlined, CalendarOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { mockConsultations } from '../../mocks/data'
import type { Consultation } from '../../stores/consultationStore'

const { Title, Text } = Typography

export default function PendingReview() {
  const [data, setData] = useState(mockConsultations.filter(c => c.status === '待审核'))
  const [schedulingConsultation, setSchedulingConsultation] = useState<Consultation | null>(null)
  const navigate = useNavigate()

  const handleApprove = (consultation: Consultation) => {
    setData(data.filter(d => d.id !== consultation.id))
    message.success(`已通过 ${consultation.patientName} 的会诊申请`)
  }

  const handleReject = (consultation: Consultation) => {
    Modal.confirm({
      title: '确认拒绝',
      content: `确定要拒绝 ${consultation.patientName} 的会诊申请吗？`,
      onOk: () => {
        setData(data.filter(d => d.id !== consultation.id))
        message.success('已拒绝申请')
      }
    })
  }

  const handleSchedule = (consultation: Consultation) => {
    setSchedulingConsultation(consultation)
    Modal.confirm({
      title: '快速排期',
      content: (
        <div>
          <p>为 {consultation.patientName} 选择会诊时间：</p>
          <DatePicker showTime className="!w-full mt-2" />
        </div>
      ),
      onOk: () => {
        setData(data.filter(d => d.id !== consultation.id))
        message.success('已排期，将通知专家')
        navigate('/consultation/schedule')
      }
    })
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case '紧急': return 'red'
      case '特急': return 'orange'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">待审核列表</Title>
        <Space>
          <Text>共 {data.length} 条待审</Text>
          <Select placeholder="排序" style={{ width: 120 }} defaultValue="urgency">
            <Select.Option value="urgency">按紧急程度</Select.Option>
            <Select.Option value="time">按申请时间</Select.Option>
          </Select>
        </Space>
      </div>

      {data.length === 0 ? (
        <Card>
          <Empty description="暂无待审核申请" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.map(consultation => (
            <Card
              key={consultation.id}
              className="hover:shadow-lg transition-shadow"
              title={
                <Space>
                  <Avatar icon={<ExclamationCircleOutlined />} className="!bg-orange-500" />
                  <span>{consultation.patientName}</span>
                  <Tag color={getUrgencyColor(consultation.urgency)}>{consultation.urgency}</Tag>
                </Space>
              }
              extra={
                <Tag color={consultation.type === '院内' ? 'blue' : 'green'}>{consultation.type}</Tag>
              }
            >
              <List>
                <List.Item>
                  <Space direction="vertical" size={0}>
                    <Text type="secondary">住院号：{consultation.patientInpatientNo}</Text>
                    <Text type="secondary">申请科室：{consultation.department}</Text>
                    <Text type="secondary">申请医生：{consultation.applyDoctor}</Text>
                    <Text type="secondary">期望时间：{consultation.expectTime}</Text>
                  </Space>
                </List.Item>
                <List.Item>
                  <Text strong>主要诊断：</Text>{consultation.mainDiagnosis}
                </List.Item>
                <List.Item>
                  <Text strong>邀请专家：</Text>
                  <Space wrap>
                    {consultation.experts.slice(0, 3).map(e => (
                      <Tag key={e.id}>{e.name}</Tag>
                    ))}
                    {consultation.experts.length > 3 && <Tag>+{consultation.experts.length - 3}人</Tag>}
                  </Space>
                </List.Item>
              </List>
              <div className="flex justify-end gap-2 mt-4">
                <Button danger icon={<CloseOutlined />} onClick={() => handleReject(consultation)}>
                  拒绝
                </Button>
                <Button icon={<CalendarOutlined />} onClick={() => handleSchedule(consultation)}>
                  修改排期
                </Button>
                <Button type="primary" icon={<CheckOutlined />} className="!bg-green-500 !border-green-500" onClick={() => handleApprove(consultation)}>
                  通过
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}