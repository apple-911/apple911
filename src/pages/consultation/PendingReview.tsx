import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Tag, Space, Modal, message, List, Avatar, Typography, Empty, Select, DatePicker, Badge } from 'antd'
import { CheckOutlined, CloseOutlined, CalendarOutlined, ExclamationCircleOutlined, UserOutlined, MedicineBoxOutlined } from '@ant-design/icons'
import { mockConsultations } from '../../mocks/data'
import type { Consultation } from '../../stores/consultationStore'

const { Title, Text } = Typography

// 申请来源类型
type ApplicationSource = 'doctor' | 'patient'

interface ExtendedConsultation extends Consultation {
  source?: ApplicationSource
  sourceDetail?: string
}

export default function PendingReview() {
  // 增补多条待审核数据，包含申请来源
  const [data] = useState<ExtendedConsultation[]>([
    {
      id: 'C001',
      patientId: 'P001',
      patientName: '王建国',
      patientInpatientNo: 'ZY2024001234',
      type: '院内',
      applyTime: '2024-03-15 09:30',
      expectTime: '2024-03-20 14:00',
      status: '待审核',
      urgency: '紧急',
      department: '肿瘤科',
      applyDoctor: '张明华',
      experts: [
        { id: '1', name: '李芳', department: '胸外科', title: '副主任医师', status: '空闲' },
        { id: '3', name: '王建国', department: '放射科', title: '主任医师', status: '空闲' },
        { id: '4', name: '刘晓燕', department: '病理科', title: '主任医师', status: '空闲' }
      ],
      mainDiagnosis: '左肺鳞癌 III 期',
      source: 'doctor',
      sourceDetail: '肿瘤科张明华医生申请'
    },
    {
      id: 'C006',
      patientId: 'P006',
      patientName: '李秀英',
      patientInpatientNo: 'ZY2024001256',
      type: '远程',
      applyTime: '2024-03-15 14:20',
      expectTime: '2024-03-22 10:00',
      status: '待审核',
      urgency: '普通',
      department: '乳腺外科',
      applyDoctor: '陈伟',
      experts: [
        { id: '2', name: '李芳', department: '胸外科', title: '副主任医师', status: '空闲' },
        { id: '5', name: '陈伟', department: '肿瘤科', title: '副主任医师', status: '忙碌' }
      ],
      mainDiagnosis: '乳腺癌改良根治术后辅助治疗',
      source: 'doctor',
      sourceDetail: '乳腺外科陈伟医生申请'
    },
    {
      id: 'C007',
      patientId: 'P007',
      patientName: '张建国',
      patientInpatientNo: 'M123456789',
      type: '远程',
      applyTime: '2024-03-16 10:15',
      expectTime: '2024-03-25 14:30',
      status: '待审核',
      urgency: '普通',
      department: '肿瘤科',
      applyDoctor: '张建国（患者自行申请）',
      experts: [
        { id: '1', name: '张明华', department: '肿瘤科', title: '主任医师', status: '空闲' },
        { id: '6', name: '赵红梅', department: '呼吸科', title: '主任医师', status: '空闲' }
      ],
      mainDiagnosis: '肺癌术后复查',
      source: 'patient',
      sourceDetail: '患者张建国通过患者端申请'
    },
    {
      id: 'C008',
      patientId: 'P008',
      patientName: '刘芳',
      patientInpatientNo: 'ZY2024001356',
      type: '院内',
      applyTime: '2024-03-16 16:45',
      expectTime: '2024-03-19 09:00',
      status: '待审核',
      urgency: '特急',
      department: '消化内科',
      applyDoctor: '王建国',
      experts: [
        { id: '1', name: '张明华', department: '肿瘤科', title: '主任医师', status: '空闲' },
        { id: '2', name: '李芳', department: '胸外科', title: '副主任医师', status: '空闲' },
        { id: '8', name: '周丽萍', department: '营养科', title: '副主任医师', status: '空闲' }
      ],
      mainDiagnosis: '胃癌晚期伴多发转移',
      source: 'doctor',
      sourceDetail: '消化内科王建国医生申请'
    },
    {
      id: 'C009',
      patientId: 'P009',
      patientName: '陈刚',
      patientInpatientNo: 'ZY2024001402',
      type: '远程',
      applyTime: '2024-03-17 08:30',
      expectTime: '2024-03-23 15:00',
      status: '待审核',
      urgency: '普通',
      department: '泌尿外科',
      applyDoctor: '陈刚（患者自行申请）',
      experts: [
        { id: '1', name: '张明华', department: '肿瘤科', title: '主任医师', status: '空闲' },
        { id: '7', name: '孙志强', department: '放疗科', title: '副主任医师', status: '离线' }
      ],
      mainDiagnosis: '前列腺癌去势抵抗性',
      source: 'patient',
      sourceDetail: '患者陈刚通过患者端申请'
    },
    {
      id: 'C010',
      patientId: 'P010',
      patientName: '杨志强',
      patientInpatientNo: 'ZY2024001478',
      type: '院内',
      applyTime: '2024-03-17 11:20',
      expectTime: '2024-03-21 10:00',
      status: '待审核',
      urgency: '紧急',
      department: '神经外科',
      applyDoctor: '刘志远',
      experts: [
        { id: '1', name: '张明华', department: '肿瘤科', title: '主任医师', status: '空闲' },
        { id: '3', name: '王建国', department: '放射科', title: '主任医师', status: '空闲' },
        { id: '4', name: '刘晓燕', department: '病理科', title: '主任医师', status: '空闲' }
      ],
      mainDiagnosis: '胶质母细胞瘤术后复发',
      source: 'doctor',
      sourceDetail: '神经外科刘志远医生申请'
    }
  ])
  const [schedulingConsultation, setSchedulingConsultation] = useState<ExtendedConsultation | null>(null)
  const navigate = useNavigate()

  const getSourceBadge = (source: ApplicationSource | undefined) => {
    if (source === 'patient') {
      return (
        <Badge 
          icon={<UserOutlined />} 
          text="患者申请" 
          style={{ backgroundColor: '#52c41a' }} 
        />
      )
    }
    return (
      <Badge 
        icon={<MedicineBoxOutlined />} 
        text="医生申请" 
        style={{ backgroundColor: '#1890ff' }} 
      />
    )
  }

  const handleApprove = (consultation: ExtendedConsultation) => {
    const newData = data.filter(d => d.id !== consultation.id)
    setData(newData)
    message.success(`已通过 ${consultation.patientName} 的会诊申请（${getSourceLabel(consultation.source)}）`)
  }

  const handleReject = (consultation: ExtendedConsultation) => {
    Modal.confirm({
      title: '确认拒绝',
      content: `确定要拒绝 ${consultation.patientName} 的会诊申请吗？\n\n申请来源：${getSourceLabel(consultation.source)}`,
      onOk: () => {
        const newData = data.filter(d => d.id !== consultation.id)
        setData(newData)
        message.success('已拒绝申请')
      }
    })
  }

  const handleSchedule = (consultation: ExtendedConsultation) => {
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
        const newData = data.filter(d => d.id !== consultation.id)
        setData(newData)
        message.success('已排期，将通知专家')
        navigate('/consultation/schedule')
      }
    })
  }

  const getSourceLabel = (source: ApplicationSource | undefined) => {
    return source === 'patient' ? '患者申请' : '医生申请'
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
      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center" style={{ background: 'var(--xiehe-green-bg)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--xiehe-green)' }}>{data.length}</div>
          <div className="text-xs text-gray-500 mt-1">待审核总数</div>
        </Card>
        <Card className="text-center" style={{ background: '#e6f7ff' }}>
          <div className="text-2xl font-bold" style={{ color: '#1890ff' }}>
            {data.filter(d => d.source === 'doctor').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">医生申请</div>
        </Card>
        <Card className="text-center" style={{ background: '#f6ffed' }}>
          <div className="text-2xl font-bold" style={{ color: '#52c41a' }}>
            {data.filter(d => d.source === 'patient').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">患者申请</div>
        </Card>
        <Card className="text-center" style={{ background: '#fff7e6' }}>
          <div className="text-2xl font-bold" style={{ color: '#fa8c16' }}>
            {data.filter(d => d.urgency === '紧急' || d.urgency === '特急').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">紧急申请</div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">待审核列表</Title>
        <Space>
          <Text>共 {data.length} 条待审</Text>
          <Select placeholder="排序" style={{ width: 150 }} defaultValue="all">
            <Select.Option value="all">全部来源</Select.Option>
            <Select.Option value="doctor">仅医生申请</Select.Option>
            <Select.Option value="patient">仅患者申请</Select.Option>
          </Select>
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
                  {getSourceBadge(consultation.source)}
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
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      来源：{consultation.sourceDetail}
                    </Text>
                  </Space>
                </List.Item>
                <List.Item>
                  <Text strong>主要诊断：</Text>{consultation.mainDiagnosis}
                </List.Item>
                <List.Item>
                  <Text strong>邀请专家：</Text>
                  <Space wrap>
                    {consultation.experts.slice(0, 3).map(e => (
                      <Tag key={e.id}>{e.name}({e.department})</Tag>
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