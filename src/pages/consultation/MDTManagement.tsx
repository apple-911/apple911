import React, { useState, useEffect } from 'react'
import { 
  Card, Row, Col, Statistic, Table, Tag, Space, Typography, Button, Badge, 
  Timeline, Modal, Descriptions, Select, Input, Drawer, message, Popconfirm,
  Form, DatePicker, TimePicker, Radio, Divider, List, Avatar, Empty
} from 'antd'
import { 
  ClockCircleOutlined, CheckCircleOutlined, WarningOutlined, SearchOutlined, 
  BellOutlined, SendOutlined, UserOutlined, EditOutlined, CalendarOutlined,
  TeamOutlined, FileTextOutlined, ExclamationCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { supabase } from '../../lib/supabase'
import PatientInfo from '../../components/PatientInfo'
import dayjs from 'dayjs'

interface Stage {
  title?: string
  stage: string
  status: 'completed' | 'processing' | 'pending' | 'timeout'
  time?: string
  completedAt?: string
  operator?: string
  notes?: string
}

interface ConsultationProgress {
  id: string
  patientId: string
  patientName: string
  gender: string
  age: number
  department: string
  applicant: string
  applyDate: string
  currentStage: string
  priority: string
  stages: Stage[]
  isTimeout: boolean
  patientInpatientNo?: string
  mainDiagnosis?: string
  consultationType?: string
  estimatedCompletion?: string
  timeoutReason?: string
}

interface ProgressStats {
  processing: number
  completed: number
  timeout: number
  total: number
}

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

interface AuditModalProps {
  open: boolean
  consultationId: string
  patientName: string
  onConfirm: (result: '通过' | '拒绝' | '退回补充', opinion: string, rejectReason?: string) => void
  onCancel: () => void
}

interface ScheduleModalProps {
  open: boolean
  consultationId: string
  patientName: string
  experts: any[]
  onConfirm: (experts: string[], time: string) => void
  onCancel: () => void
}

const AuditModal: React.FC<AuditModalProps> = ({ open, consultationId, patientName, onConfirm, onCancel }) => {
  const [form] = Form.useForm()
  const [auditResult, setAuditResult] = useState<'通过' | '拒绝' | '退回补充'>('通过')

  const handleOk = () => {
    form.validateFields().then((values) => {
      onConfirm(auditResult, values.opinion, values.rejectReason)
      form.resetFields()
    }).catch(() => {})
  }

  return (
    <Modal
      title={<Space><FileTextOutlined /> 审核会诊申请</Space>}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={600}
    >
      <Descriptions bordered column={1} size="small" className="mb-4">
        <Descriptions.Item label="会诊 ID">{consultationId}</Descriptions.Item>
        <Descriptions.Item label="患者">{patientName}</Descriptions.Item>
      </Descriptions>

      <Form form={form} layout="vertical">
        <Form.Item label="审核结果" name="result" initialValue="通过">
          <Radio.Group onChange={(e) => setAuditResult(e.target.value)} value={auditResult}>
            <Radio value="通过" className="text-green-600">✓ 通过</Radio>
            <Radio value="退回补充" className="text-orange-600">⚠ 退回补充</Radio>
            <Radio value="拒绝" className="text-red-600">✗ 拒绝</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="审核意见"
          name="opinion"
          rules={[{ required: true, message: '请输入审核意见' }]}
        >
          <TextArea rows={3} placeholder="请输入审核意见..." />
        </Form.Item>

        {(auditResult === '拒绝' || auditResult === '退回补充') && (
          <Form.Item
            label="原因说明"
            name="rejectReason"
            rules={[{ required: true, message: '请说明原因' }]}
          >
            <TextArea 
              rows={3} 
              placeholder={auditResult === '拒绝' ? '请说明拒绝原因' : '请说明需要补充的材料'}
              className="border-orange-200"
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ open, consultationId, patientName, experts, onConfirm, onCancel }) => {
  const [form] = Form.useForm()
  const [selectedExperts, setSelectedExperts] = useState<string[]>([])

  const handleExpertToggle = (expertId: string) => {
    setSelectedExperts(prev => 
      prev.includes(expertId) 
        ? prev.filter(id => id !== expertId)
        : [...prev, expertId]
    )
  }

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (selectedExperts.length === 0) {
        message.warning('请至少选择一位专家')
        return
      }
      const scheduleTime = `${values.date.format('YYYY-MM-DD')} ${values.time.format('HH:mm')}`
      onConfirm(selectedExperts, scheduleTime)
      setSelectedExperts([])
      form.resetFields()
    }).catch(() => {})
  }

  return (
    <Modal
      title={<Space><CalendarOutlined /> 安排会诊</Space>}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      width={800}
    >
      <Descriptions bordered column={1} size="small" className="mb-4">
        <Descriptions.Item label="会诊 ID">{consultationId}</Descriptions.Item>
        <Descriptions.Item label="患者">{patientName}</Descriptions.Item>
      </Descriptions>

      <Form form={form} layout="vertical">
        <Form.Item
          label="选择会诊时间"
          name={['date', 'time']}
          rules={[{ required: true, message: '请选择会诊时间' }]}
        >
          <Space>
            <DatePicker placeholder="选择日期" style={{ width: 200 }} />
            <TimePicker placeholder="选择时间" format="HH:mm" />
          </Space>
        </Form.Item>

        <Divider orientation="left">邀请专家</Divider>

        <div className="mb-4">
          <Text strong>已选专家：{selectedExperts.length} 位</Text>
        </div>

        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={experts}
          renderItem={(expert) => (
            <List.Item>
              <Card
                size="small"
                hoverable
                className={`cursor-pointer transition-all ${
                  selectedExperts.includes(expert.id) 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200'
                }`}
                onClick={() => handleExpertToggle(expert.id)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar className={expert.status === '忙碌' ? '!bg-orange-500' : '!bg-green-500'}>
                      {expert.name[0]}
                    </Avatar>
                  }
                  title={
                    <Space>
                      <Text strong>{expert.name}</Text>
                      <Tag color={expert.status === '空闲' ? 'green' : 'orange'}>
                        {expert.status === '空闲' ? '空闲' : '忙碌'}
                      </Tag>
                    </Space>
                  }
                  description={
                    <div className="text-xs">
                      <div>{expert.department} - {expert.title}</div>
                      <div className="text-gray-500 truncate">{expert.specialty}</div>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </Form>
    </Modal>
  )
}

export default function MDTManagement() {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [keyword, setKeyword] = useState('')
  const [detailVisible, setDetailVisible] = useState(false)
  const [patientDrawerVisible, setPatientDrawerVisible] = useState(false)
  const [auditModalVisible, setAuditModalVisible] = useState(false)
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<ConsultationProgress | null>(null)
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [selectedPatientName, setSelectedPatientName] = useState<string>('')
  const [selectedPatientInpatientNo, setSelectedPatientInpatientNo] = useState<string>('')
  const [consultationProgress, setConsultationProgress] = useState<ConsultationProgress[]>([])
  const [stats, setStats] = useState<ProgressStats>({ processing: 0, completed: 0, timeout: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [expertsList, setExpertsList] = useState<any[]>([])

  useEffect(() => {
    loadConsultationProgress()
    loadExperts()
  }, [])

  const loadConsultationProgress = async () => {
    try {
      setLoading(true)
      
      const { data: consultations, error } = await supabase
        .from('consultations')
        .select('*')
        .order('apply_time', { ascending: false })

      if (error) throw error

      const progressList: ConsultationProgress[] = (consultations || []).map(c => {
        const stages = buildStages(c.status, c.apply_time, c.created_at)
        const currentStage = stages.find(s => s.status === 'processing')?.title || 
                            stages.find(s => s.status === 'pending')?.title ||
                            stages[stages.length - 1]?.title || '未知'
        
        return {
          id: c.id,
          patientId: c.patient_id,
          patientName: c.patient_name,
          gender: '',
          age: 0,
          department: c.department,
          applicant: c.apply_doctor,
          applyDate: c.apply_time ? dayjs(c.apply_time).format('YYYY-MM-DD HH:mm') : '',
          currentStage: currentStage,
          priority: c.urgency || '普通',
          stages: stages,
          isTimeout: false,
          patientInpatientNo: c.patient_inpatient_no,
          mainDiagnosis: c.main_diagnosis
        }
      })

      setConsultationProgress(progressList)
      
      const completedCount = progressList.filter(p => p.stages.every(s => s.status === 'completed')).length
      const processingCount = progressList.filter(p => p.stages.some(s => s.status === 'processing')).length
      const timeoutCount = progressList.filter(p => p.isTimeout).length

      setStats({
        processing: processingCount,
        completed: completedCount,
        timeout: timeoutCount,
        total: progressList.length
      })
    } catch (error) {
      console.error('加载会诊进度失败:', error)
      message.error('加载会诊进度失败')
    } finally {
      setLoading(false)
    }
  }

  const loadExperts = async () => {
    try {
      const { data, error } = await supabase.from('experts').select('*')
      if (error) throw error
      setExpertsList(data || [])
    } catch (error) {
      console.error('加载专家失败:', error)
    }
  }

  const buildStages = (status: string, applyTime?: string, createdAt?: string): Stage[] => {
    const baseStages: Stage[] = [
      { title: '申请提交', stage: '申请提交', status: 'completed' as const, time: createdAt ? dayjs(createdAt).format('YYYY-MM-DD HH:mm') : undefined },
      { title: '科室审核', stage: '科室审核', status: 'pending' as const },
      { title: '秘书审核', stage: '秘书审核', status: 'pending' as const },
      { title: '专家邀请', stage: '专家邀请', status: 'pending' as const },
      { title: '专家确认', stage: '专家确认', status: 'pending' as const },
      { title: '安排会诊', stage: '安排会诊', status: 'pending' as const },
      { title: '会诊进行', stage: '会诊进行', status: 'pending' as const },
      { title: '完成归档', stage: '完成归档', status: 'pending' as const },
    ]

    const statusOrder: Record<string, number> = {
      '医生提交': 0,
      '主任驳回': 0,
      '待科室审核': 0,
      '秘书审核': 2,
      '待秘书审核': 2,
      '专家邀请': 3,
      '专家确认': 4,
      '待专家确认': 3,
      '待排期': 4,
      '待会诊': 5,
      '会诊中': 6,
      '待质检审核': 7,
      '待归档': 7,
      '已完成': 7,
      '已取消': 7,
      '秘书驳回': 7,
    }

    const currentIndex = statusOrder[status] ?? 0

    return baseStages.map((stage, index) => {
      if (index < currentIndex) {
        return { ...stage, status: 'completed' as const }
      } else if (index === currentIndex) {
        return { ...stage, status: 'processing' as const, time: applyTime ? dayjs(applyTime).format('YYYY-MM-DD HH:mm') : undefined }
      }
      return stage
    })
  }

  const filteredData = consultationProgress.filter((item) => {
    const matchStatus = filterStatus === 'all' || 
      (filterStatus === 'timeout' && item.isTimeout) ||
      (filterStatus === 'processing' && !item.isTimeout && item.stages.some(s => s.status === 'processing')) ||
      (filterStatus === 'completed' && item.stages.every(s => s.status === 'completed'))
    
    const matchKeyword = !keyword || 
      item.patientName.includes(keyword) ||
      item.id.includes(keyword) ||
      item.department.includes(keyword)
    
    return matchStatus && matchKeyword
  })

  const handleAudit = (result: '通过' | '拒绝' | '退回补充', opinion: string, rejectReason?: string) => {
    message.success(`审核${result === '通过' ? '通过' : result === '拒绝' ? '拒绝' : '已退回'}，意见：${opinion}`)
    setAuditModalVisible(false)
  }

  const handleSchedule = (experts: string[], time: string) => {
    message.success(`会诊已安排，时间：${time}，已邀请 ${experts.length} 位专家`)
    setScheduleModalVisible(false)
  }

  const handleUrgent = (record: ConsultationProgress) => {
    message.success(`已发送催办通知给相关负责人`)
  }

  const showPatientInfo = (patientId: string, patientName: string, patientInpatientNo: string) => {
    setSelectedPatientId(patientId)
    setSelectedPatientName(patientName)
    setSelectedPatientInpatientNo(patientInpatientNo)
    setPatientDrawerVisible(true)
  }

  const getCurrentStageInfo = (record: ConsultationProgress) => {
    const currentStageIndex = record.stages.findIndex(s => s.status === 'processing' || s.status === 'timeout')
    return currentStageIndex !== -1 ? record.stages[currentStageIndex] : null
  }

  const canAudit = (record: ConsultationProgress) => {
    return record.currentStage === '申请提交' || record.currentStage === '审核通过'
  }

  const canSchedule = (record: ConsultationProgress) => {
    return record.currentStage === '专家邀请' || record.currentStage === '专家确认'
  }

  const columns: ColumnsType<ConsultationProgress> = [
    {
      title: '会诊 ID',
      dataIndex: 'id',
      width: 100,
      render: (id: string) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: '患者信息',
      key: 'patient',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.patientName}</div>
          <div className="text-xs text-gray-500">
            {record.gender} | {record.age}岁
          </div>
          <Button
            type="link"
            size="small"
            className="!p-0 mt-1"
            onClick={() => showPatientInfo(record.patientId, record.patientName, record.id)}
          >
            <UserOutlined className="mr-1" />
            查看患者信息
          </Button>
        </div>
      ),
    },
    {
      title: '申请科室',
      dataIndex: 'department',
      width: 120,
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      width: 100,
    },
    {
      title: '申请日期',
      dataIndex: 'applyDate',
      width: 120,
    },
    {
      title: '当前阶段',
      dataIndex: 'currentStage',
      width: 120,
      render: (stage: string, record) => (
        <Tag color={record.isTimeout ? 'red' : 'blue'}>{stage}</Tag>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      render: (priority: string) => (
        <Tag color={
          priority === '紧急' ? 'red' :
          priority === '较急' ? 'orange' : 'default'
        }>
          {priority}
        </Tag>
      ),
    },
    {
      title: '进度',
      key: 'progress',
      width: 200,
      render: (_, record) => {
        const completed = record.stages.filter(s => s.status === 'completed').length
        const total = record.stages.length
        const percent = Math.round((completed / total) * 100)
        
        return (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <Text type="secondary">{completed}/{total}</Text>
              <Text type="secondary">{percent}%</Text>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  record.isTimeout ? 'bg-red-500' :
                  percent >= 80 ? 'bg-green-500' :
                  percent >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Badge
          status={record.isTimeout ? 'error' : 'processing'}
          text={record.isTimeout ? '超时' : '进行中'}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <Space wrap>
            <Button
              type="link"
              size="small"
              onClick={() => {
                setSelectedRecord(record)
                setDetailVisible(true)
              }}
            >
              详情
            </Button>
            {canAudit(record) && (
              <Button
                type="primary"
                size="small"
                icon={<FileTextOutlined />}
                onClick={() => {
                  setSelectedRecord(record)
                  setAuditModalVisible(true)
                }}
              >
                审核
              </Button>
            )}
            {canSchedule(record) && (
              <Button
                type="primary"
                size="small"
                icon={<CalendarOutlined />}
                onClick={() => {
                  setSelectedRecord(record)
                  setScheduleModalVisible(true)
                }}
              >
                安排
              </Button>
            )}
            {record.isTimeout && (
              <Popconfirm
                title="确定要催办吗？"
                onConfirm={() => handleUrgent(record)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" size="small" danger icon={<BellOutlined />}>
                  催办
                </Button>
              </Popconfirm>
            )}
          </Space>
        </Space>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <Title level={4}>会诊管理</Title>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核"
              value={stats.processing}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="超时"
              value={stats.timeout}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="完成率"
              value={stats.total > 0 ? (stats.completed / stats.total * 100).toFixed(1) : 0}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="搜索患者姓名、会诊 ID、科室..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
            />
            <Button type="primary" icon={<SearchOutlined />}>搜索</Button>
          </Space.Compact>

          <Space wrap>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 150 }}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'processing', label: '进行中' },
                { value: 'completed', label: '已完成' },
                { value: 'timeout', label: '超时' },
              ]}
            />
          </Space>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </Card>

      <Modal
        title="会诊进度详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          selectedRecord?.isTimeout && (
            <Button key="urgent" type="primary" danger icon={<SendOutlined />} onClick={() => handleUrgent(selectedRecord)}>
              催办
            </Button>
          ),
          selectedRecord && canAudit(selectedRecord) && (
            <Button 
              key="audit" 
              type="primary" 
              icon={<FileTextOutlined />}
              onClick={() => {
                setDetailVisible(false)
                setAuditModalVisible(true)
              }}
            >
              审核
            </Button>
          ),
          selectedRecord && canSchedule(selectedRecord) && (
            <Button 
              key="schedule" 
              type="primary" 
              icon={<CalendarOutlined />}
              onClick={() => {
                setDetailVisible(false)
                setScheduleModalVisible(true)
              }}
            >
              安排会诊
            </Button>
          ),
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedRecord && (
          <div className="space-y-4">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="会诊 ID">{selectedRecord.id}</Descriptions.Item>
              <Descriptions.Item label="会诊类型">{selectedRecord.consultationType}</Descriptions.Item>
              <Descriptions.Item label="患者姓名">{selectedRecord.patientName}</Descriptions.Item>
              <Descriptions.Item label="性别/年龄">{selectedRecord.gender} / {selectedRecord.age}岁</Descriptions.Item>
              <Descriptions.Item label="申请科室">{selectedRecord.department}</Descriptions.Item>
              <Descriptions.Item label="申请人">{selectedRecord.applicant}</Descriptions.Item>
              <Descriptions.Item label="申请日期">{selectedRecord.applyDate}</Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={
                  selectedRecord.priority === '紧急' ? 'red' :
                  selectedRecord.priority === '较急' ? 'orange' : 'default'
                }>
                  {selectedRecord.priority}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="当前阶段">{selectedRecord.currentStage}</Descriptions.Item>
              <Descriptions.Item label="预计完成">{selectedRecord.estimatedCompletion}</Descriptions.Item>
            </Descriptions>

            {selectedRecord.isTimeout && (
              <Card size="small" className="bg-red-50 border-red-200">
                <Space>
                  <WarningOutlined style={{ color: '#ff4d4f' }} />
                  <Text type="danger">超时原因：{selectedRecord.timeoutReason}</Text>
                </Space>
              </Card>
            )}

            <Card title="进度时间轴" size="small">
              <Timeline>
                {selectedRecord.stages.map((stage, index) => (
                  <Timeline.Item
                    key={index}
                    color={stage.status === 'completed' ? 'green' : stage.status === 'processing' ? 'blue' : stage.status === 'timeout' ? 'red' : 'gray'}
                    dot={
                      stage.status === 'completed' ? <CheckCircleOutlined /> :
                      stage.status === 'timeout' ? <WarningOutlined /> :
                      <ClockCircleOutlined />
                    }
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <Text strong>{stage.stage}</Text>
                        {stage.completedAt && (
                          <div className="text-xs text-gray-500">{stage.completedAt}</div>
                        )}
                        {stage.operator && (
                          <div className="text-xs text-gray-500">操作人：{stage.operator}</div>
                        )}
                      </div>
                      <Tag color={
                        stage.status === 'completed' ? 'green' :
                        stage.status === 'processing' ? 'blue' :
                        stage.status === 'timeout' ? 'red' : 'default'
                      }>
                        {stage.status === 'completed' ? '已完成' :
                         stage.status === 'processing' ? '进行中' :
                         stage.status === 'timeout' ? '超时' : '待处理'}
                      </Tag>
                    </div>
                    {stage.notes && (
                      <div className="mt-1 text-sm text-gray-600">{stage.notes}</div>
                    )}
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </div>
        )}
      </Modal>

      <AuditModal
        open={auditModalVisible}
        consultationId={selectedRecord?.id || ''}
        patientName={selectedRecord?.patientName || ''}
        onConfirm={handleAudit}
        onCancel={() => setAuditModalVisible(false)}
      />

      <ScheduleModal
        open={scheduleModalVisible}
        consultationId={selectedRecord?.id || ''}
        patientName={selectedRecord?.patientName || ''}
        experts={expertsList}
        onConfirm={handleSchedule}
        onCancel={() => setScheduleModalVisible(false)}
      />

      <Drawer
        title="患者详细信息"
        placement="right"
        width={1200}
        open={patientDrawerVisible}
        onClose={() => setPatientDrawerVisible(false)}
      >
        <PatientInfo
          patientId={selectedPatientId}
          patientName={selectedPatientName}
          patientInpatientNo={selectedPatientInpatientNo}
          compact={false}
        />
      </Drawer>
    </div>
  )
}
