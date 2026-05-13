import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Statistic, Table, Tag, Space, Typography, Button, Badge, Timeline, Modal, Descriptions, Select, Input, Drawer, Result } from 'antd'
import { ClockCircleOutlined, CheckCircleOutlined, WarningOutlined, SearchOutlined, BellOutlined, SendOutlined, UserOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { mockConsultationProgress, mockProgressStats, type ConsultationProgress } from '../../mocks/progressData'
import PatientInfo from '../../components/PatientInfo'
import { hasPermission } from '../../utils/helpers'
import { getUrgencyName, getUrgencyColor, getConsultationTypeName, getConsultationTypeColor } from '../../utils/codeTable'

const { Title, Text } = Typography

const stageStatusConfig = {
  completed: { color: 'green', icon: <CheckCircleOutlined /> },
  processing: { color: 'blue', icon: <ClockCircleOutlined /> },
  pending: { color: 'default', icon: <ClockCircleOutlined /> },
  timeout: { color: 'red', icon: <WarningOutlined /> },
}

export default function ConsultationTracking() {
  const navigate = useNavigate()
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [keyword, setKeyword] = useState('')
  const [detailVisible, setDetailVisible] = useState(false)
  const [patientDrawerVisible, setPatientDrawerVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<ConsultationProgress | null>(null)
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [selectedPatientName, setSelectedPatientName] = useState<string>('')
  const [selectedPatientInpatientNo, setSelectedPatientInpatientNo] = useState<string>('')

  const filteredData = mockConsultationProgress.filter((item) => {
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

  const columns: ColumnsType<ConsultationProgress> = [
    {
      title: '会诊 ID',
      dataIndex: 'consultationCode',
      width: 120,
      render: (code: string, record: any) => <Tag color="blue">{code || record.id}</Tag>,
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
      width: 180,
      render: (_, record) => (
        <Space>
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
          {record.isTimeout && (
            <Button type="link" size="small" danger icon={<BellOutlined />}>
              催办
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const handleUrgent = (record: ConsultationProgress) => {
    // TODO: 实现催办逻辑
  }

  const showPatientInfo = (patientId: string, patientName: string, patientInpatientNo: string) => {
    setSelectedPatientId(patientId)
    setSelectedPatientName(patientName)
    setSelectedPatientInpatientNo(patientInpatientNo)
    setPatientDrawerVisible(true)
  }

  // 权限检查
  if (!hasPermission('perm-consultation-tracking')) {
    return (
      <Result
        status="403"
        title="暂无权限"
        subTitle="抱歉，您没有权限访问会诊进度追踪页面。如需获取权限，请联系系统管理员。"
        extra={<Button type="primary" onClick={() => navigate(-1)}>返回</Button>}
      />
    )
  }

  return (
    <div className="space-y-4">
      <Title level={4}>会诊进度追踪</Title>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={mockProgressStats.processing}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={mockProgressStats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="超时"
              value={mockProgressStats.timeout}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="完成率"
              value={mockProgressStats.completionRate}
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
              placeholder="搜索患者姓名、会诊ID、科室..."
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
            <Button key="urgent" type="primary" danger icon={<SendOutlined />}>
              催办
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
              <Descriptions.Item label="会诊ID">{selectedRecord.id}</Descriptions.Item>
              <Descriptions.Item label="会诊类型">
                <Tag color={getConsultationTypeColor(selectedRecord.consultationType)}>
                  {getConsultationTypeName(selectedRecord.consultationType)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="患者姓名">{selectedRecord.patientName}</Descriptions.Item>
              <Descriptions.Item label="性别/年龄">{selectedRecord.gender} / {selectedRecord.age}岁</Descriptions.Item>
              <Descriptions.Item label="申请科室">{selectedRecord.department}</Descriptions.Item>
              <Descriptions.Item label="申请人">{selectedRecord.applicant}</Descriptions.Item>
              <Descriptions.Item label="申请日期">{selectedRecord.applyDate}</Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={getUrgencyColor(selectedRecord.priority)}>
                  {getUrgencyName(selectedRecord.priority)}
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
                    color={stageStatusConfig[stage.status].color}
                    dot={stageStatusConfig[stage.status].icon}
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
                      <Tag color={stageStatusConfig[stage.status].color}>
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
