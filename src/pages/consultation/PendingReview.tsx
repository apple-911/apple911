import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Tag, Space, Modal, message, List, Avatar, Typography, Empty, Select, DatePicker } from 'antd'
import { CheckOutlined, CloseOutlined, CalendarOutlined, ExclamationCircleOutlined, UserOutlined, MedicineBoxOutlined } from '@ant-design/icons'
import { mockConsultations } from '../../mocks/data'
import type { Consultation } from '../../stores/consultationStore'

const { Title, Text } = Typography

// 申请来源类型
type ApplicationSource = 'doctor' | 'patient'

interface ExtendedConsultation extends Consultation {
  source?: ApplicationSource
  sourceDetail?: string
  age?: number
  gender?: 'male' | 'female'
  otherDiagnoses?: string[]
  consultationPurpose?: string
  applyDate?: string
}

export default function PendingReview() {
  // 增补多条待审核数据，包含申请来源
  const [data] = useState<ExtendedConsultation[]>([
    {
      id: 'C001',
      patientId: 'P001',
      patientName: '王建国',
      patientInpatientNo: 'ZY2024001234',
      age: 65,
      gender: 'male',
      type: '院内',
      applyTime: '2024-03-15 09:30',
      applyDate: '2024-03-15',
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
      otherDiagnoses: ['高血压 2 级', '2 型糖尿病'],
      consultationPurpose: '明确分期及后续治疗方案',
      source: 'doctor',
      sourceDetail: '肿瘤科张明华医生申请'
    },
    {
      id: 'C006',
      patientId: 'P006',
      patientName: '李秀英',
      patientInpatientNo: 'ZY2024001256',
      age: 52,
      gender: 'female',
      type: '远程',
      applyTime: '2024-03-15 14:20',
      applyDate: '2024-03-15',
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
      otherDiagnoses: ['骨质疏松症'],
      consultationPurpose: '制定术后辅助化疗方案',
      source: 'doctor',
      sourceDetail: '乳腺外科陈伟医生申请'
    },
    {
      id: 'C007',
      patientId: 'P007',
      patientName: '张建国',
      patientInpatientNo: 'M123456789',
      age: 58,
      gender: 'male',
      type: '远程',
      applyTime: '2024-03-16 10:15',
      applyDate: '2024-03-16',
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
      consultationPurpose: '术后复查及康复指导',
      source: 'patient',
      sourceDetail: '患者张建国通过患者端申请'
    },
    {
      id: 'C008',
      patientId: 'P008',
      patientName: '刘芳',
      patientInpatientNo: 'ZY2024001356',
      age: 71,
      gender: 'female',
      type: '院内',
      applyTime: '2024-03-16 16:45',
      applyDate: '2024-03-16',
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
      otherDiagnoses: ['贫血', '低蛋白血症', '腹腔积液'],
      consultationPurpose: '姑息治疗方案及营养支持',
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
        <Tag icon={<UserOutlined />} color="success">
          患者申请
        </Tag>
      )
    }
    return (
      <Tag icon={<MedicineBoxOutlined />} color="processing">
        医生申请
      </Tag>
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
                  <Avatar icon={<ExclamationCircleOutlined />} className="!bg-orange-500" size="small" />
                  <div>
                    <div className="font-medium text-sm">
                      {consultation.patientName} {consultation.age ? `${consultation.age}岁` : ''} {consultation.gender === 'male' ? '男' : consultation.gender === 'female' ? '女' : ''}
                    </div>
                    <div className="text-xs text-gray-500">{consultation.patientInpatientNo}</div>
                  </div>
                  <Tag color={getUrgencyColor(consultation.urgency)} size="small">{consultation.urgency}</Tag>
                  {getSourceBadge(consultation.source)}
                </Space>
              }
              extra={
                <Tag color={consultation.type === '院内' ? 'blue' : 'green'} size="small">{consultation.type}</Tag>
              }
              size="small"
            >
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <Text type="secondary">申请科室：</Text>
                    <Text>{consultation.department}</Text>
                  </div>
                  <div>
                    <Text type="secondary">申请医生：</Text>
                    <Text>{consultation.applyDoctor}</Text>
                  </div>
                  <div>
                    <Text type="secondary">申请时间：</Text>
                    <Text>{consultation.applyTime}</Text>
                  </div>
                  <div>
                    <Text type="secondary">期望时间：</Text>
                    <Text>{consultation.expectTime}</Text>
                  </div>
                  <div className="col-span-2">
                    <Text type="secondary">来源：</Text>
                    <Text className="text-xs">{consultation.sourceDetail}</Text>
                  </div>
                </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="mb-2">
                  <Text strong>主要诊断：</Text>
                  <Text>{consultation.mainDiagnosis}</Text>
                </div>
                {consultation.otherDiagnoses && consultation.otherDiagnoses.length > 0 && (
                  <div className="mb-2">
                    <Text strong>其他诊断：</Text>
                    <Text className="text-xs text-gray-600">{consultation.otherDiagnoses.join('、')}</Text>
                  </div>
                )}
                {consultation.consultationPurpose && (
                  <div className="mb-2">
                    <Text strong>会诊目的：</Text>
                    <Text>{consultation.consultationPurpose}</Text>
                  </div>
                )}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="mb-2">
                  <Text strong>邀请专家：</Text>
                </div>
                <Space wrap>
                  {consultation.experts.map(e => (
                    <Tag key={e.id} color="blue" size="small">
                      {e.name}
                      <br />
                      <span className="text-xs">{e.department}</span>
                    </Tag>
                  ))}
                </Space>
              </div>
                <div className="flex justify-between items-center mt-4">
                  <Button onClick={() => navigate(`/patient/detail/${consultation.patientId}`)}>
                    <UserOutlined className="mr-1" />
                    查看患者详情
                  </Button>
                  <Space>
                    <Button danger icon={<CloseOutlined />} onClick={() => handleReject(consultation)}>
                      拒绝
                    </Button>
                    <Button icon={<CalendarOutlined />} onClick={() => handleSchedule(consultation)}>
                      修改排期
                    </Button>
                    <Button type="primary" icon={<CheckOutlined />} className="!bg-green-500 !border-green-500" onClick={() => handleApprove(consultation)}>
                      通过
                    </Button>
                  </Space>
                </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}