import { useState } from 'react'
import { Card, Row, Col, Typography, Steps, Button, Select, Table, Tag, Space, Modal, Descriptions, message, Divider, Badge, Input } from 'antd'
import { PlusOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { mockFollowupRules, mockFollowupPlans, type FollowupRule, type FollowupPlan } from '../../mocks/followupRules'
import { mockMedicalCases } from '../../mocks/caseData'

const { Title, Text } = Typography

const methodConfig = {
  clinic: { color: 'blue', label: '门诊', icon: '🏥' },
  phone: { color: 'green', label: '电话', icon: '📞' },
  online: { color: 'purple', label: '线上', icon: '💻' },
}

const statusConfig = {
  draft: { color: 'default', label: '草稿', status: 'default' as const },
  active: { color: 'processing', label: '执行中', status: 'processing' as const },
  completed: { color: 'success', label: '已完成', status: 'success' as const },
  cancelled: { color: 'error', label: '已取消', status: 'error' as const },
}

const taskStatusConfig = {
  pending: { color: 'default', label: '待执行' },
  completed: { color: 'green', label: '已完成' },
  overdue: { color: 'red', label: '已逾期' },
  skipped: { color: 'default', label: '已跳过' },
}

export default function FollowupPlanner() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedCase, setSelectedCase] = useState<string>('')
  const [selectedRule, setSelectedRule] = useState<string>('')
  const [previewVisible, setPreviewVisible] = useState(false)
  const [planDetailVisible, setPlanDetailVisible] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<FollowupPlan | null>(null)
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create')

  const selectedCaseData = mockMedicalCases.find(c => c.id === selectedCase)
  const selectedRuleData = mockFollowupRules.find(r => r.id === selectedRule)

  const generatePlan = () => {
    if (!selectedCaseData || !selectedRuleData) {
      message.warning('请选择病例和随访规则')
      return
    }
    setPreviewVisible(true)
  }

  const publishPlan = () => {
    message.success('随访计划已发布')
    setPreviewVisible(false)
    setCurrentStep(0)
    setSelectedCase('')
    setSelectedRule('')
    setActiveTab('manage')
  }

  const planColumns: ColumnsType<FollowupPlan> = [
    {
      title: '计划ID',
      dataIndex: 'id',
      width: 120,
      render: (id: string) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: '患者姓名',
      dataIndex: 'patientName',
      width: 120,
    },
    {
      title: '病案ID',
      dataIndex: 'caseId',
      width: 120,
    },
    {
      title: '随访规则',
      dataIndex: 'ruleId',
      width: 150,
      render: (ruleId: string) => {
        const rule = mockFollowupRules.find(r => r.id === ruleId)
        return rule?.name || ruleId
      },
    },
    {
      title: '创建日期',
      dataIndex: 'createdAt',
      width: 120,
    },
    {
      title: '任务数',
      dataIndex: 'tasks',
      width: 100,
      render: (tasks: any[]) => tasks.length,
    },
    {
      title: '完成数',
      key: 'completed',
      width: 100,
      render: (_, record) => record.tasks.filter(t => t.status === 'completed').length,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => (
        <Badge
          status={statusConfig[status as keyof typeof statusConfig]?.status || 'default'}
          text={statusConfig[status as keyof typeof statusConfig]?.label || status}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedPlan(record)
              setPlanDetailVisible(true)
            }}
          >
            详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />}>
            编辑
          </Button>
        </Space>
      ),
    },
  ]

  const filteredCases = mockMedicalCases.map(c => ({
    value: c.id,
    label: `${c.id} - ${c.caseTitle}`,
  }))

  const filteredRules = mockFollowupRules.map(r => ({
    value: r.id,
    label: r.name,
  }))

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="mb-0">随访计划管理</Title>
        <Space>
          <Button
            type={activeTab === 'create' ? 'primary' : 'default'}
            onClick={() => setActiveTab('create')}
          >
            创建计划
          </Button>
          <Button
            type={activeTab === 'manage' ? 'primary' : 'default'}
            onClick={() => setActiveTab('manage')}
          >
            管理计划
          </Button>
        </Space>
      </div>

      {activeTab === 'create' ? (
        <>
          <Card>
            <Steps
              current={currentStep}
              items={[
                { title: '选择病例', icon: <EyeOutlined /> },
                { title: '选择规则', icon: <CalendarOutlined /> },
                { title: '确认发布', icon: <CheckCircleOutlined /> },
              ]}
            />
          </Card>

          {currentStep === 0 && (
            <Card title="步骤 1: 选择病例">
              <Select
                placeholder="搜索并选择患者"
                style={{ width: '100%' }}
                value={selectedCase}
                onChange={(v) => setSelectedCase(v)}
                showSearch
                optionFilterProp="label"
                options={filteredCases}
                size="large"
              />
              {selectedCaseData && (
                <Card size="small" className="mt-4 bg-blue-50 border-blue-200">
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="病案ID">{selectedCaseData.id}</Descriptions.Item>
                    <Descriptions.Item label="病例标题">{selectedCaseData.caseTitle}</Descriptions.Item>
                    <Descriptions.Item label="患者姓名">{selectedCaseData.patientInfo.name}</Descriptions.Item>
                    <Descriptions.Item label="性别/年龄">{selectedCaseData.patientInfo.gender} / {selectedCaseData.patientInfo.age}岁</Descriptions.Item>
                    <Descriptions.Item label="主要诊断">{selectedCaseData.diagnosis.primary}</Descriptions.Item>
                    <Descriptions.Item label="科室">{selectedCaseData.diagnosis.department}</Descriptions.Item>
                  </Descriptions>
                </Card>
              )}
              <div className="mt-4 flex justify-end">
                <Button
                  type="primary"
                  disabled={!selectedCase}
                  onClick={() => setCurrentStep(1)}
                >
                  下一步
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 1 && (
            <Card title="步骤 2: 选择随访规则">
              <Row gutter={[16, 16]}>
                {mockFollowupRules.map((rule) => (
                  <Col span={12} key={rule.id}>
                    <Card
                      hoverable
                      className={`cursor-pointer ${selectedRule === rule.id ? 'border-2 border-blue-500' : ''}`}
                      onClick={() => setSelectedRule(rule.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <Text strong>{rule.name}</Text>
                          <div className="mt-2 space-y-1">
                            <div>
                              <Text type="secondary" className="text-xs">病种：</Text>
                              <Tag color="red">{rule.disease}</Tag>
                            </div>
                            <div>
                              <Text type="secondary" className="text-xs">分期：</Text>
                              <Text>{rule.stage || '不限'}</Text>
                            </div>
                            <div>
                              <Text type="secondary" className="text-xs">治疗类型：</Text>
                              <Text>{rule.treatmentType}</Text>
                            </div>
                            <div>
                              <Text type="secondary" className="text-xs">指南来源：</Text>
                              <Tag color="blue">{rule.source}</Tag>
                            </div>
                            <div>
                              <Text type="secondary" className="text-xs">随访次数：</Text>
                              <Text strong>{rule.schedule.length} 次</Text>
                            </div>
                          </div>
                        </div>
                        {selectedRule === rule.id && (
                          <Tag color="blue">已选择</Tag>
                        )}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
              <div className="mt-4 flex justify-between">
                <Button onClick={() => setCurrentStep(0)}>上一步</Button>
                <Button
                  type="primary"
                  disabled={!selectedRule}
                  onClick={() => setCurrentStep(2)}
                >
                  下一步
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 2 && (
            <Card title="步骤 3: 预览随访计划">
              {selectedCaseData && selectedRuleData && (
                <div className="space-y-4">
                  <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="患者姓名">{selectedCaseData.patientInfo.name}</Descriptions.Item>
                    <Descriptions.Item label="病案ID">{selectedCaseData.id}</Descriptions.Item>
                    <Descriptions.Item label="随访规则">{selectedRuleData.name}</Descriptions.Item>
                    <Descriptions.Item label="指南来源">{selectedRuleData.source}</Descriptions.Item>
                  </Descriptions>

                  <Card title="随访计划预览" size="small">
                    <div className="space-y-3">
                      {selectedRuleData.schedule.map((item) => (
                        <Card key={item.sequence} size="small" className="bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <Text strong>第 {item.sequence} 次随访</Text>
                              <Tag color="blue" className="ml-2">{item.timing}</Tag>
                            </div>
                            <Tag color={methodConfig[item.method].color}>
                              {methodConfig[item.method].icon} {methodConfig[item.method].label}
                            </Tag>
                          </div>
                          <div className="mt-2">
                            <Text type="secondary" className="text-xs">随访内容：</Text>
                            <Space wrap className="mt-1">
                              {item.content.map((c, i) => (
                                <Tag key={i} color="green">{c}</Tag>
                              ))}
                            </Space>
                          </div>
                          <div className="mt-2">
                            <Text type="secondary" className="text-xs">检查项目：</Text>
                            <Space wrap className="mt-1">
                              {item.examinations.map((e, i) => (
                                <Tag key={i} color="orange">{e}</Tag>
                              ))}
                            </Space>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Card>

                  <div className="flex justify-between">
                    <Button onClick={() => setCurrentStep(1)}>上一步</Button>
                    <Button type="primary" onClick={publishPlan}>
                      确认发布
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </>
      ) : (
        <Card>
          <Table
            columns={planColumns}
            dataSource={mockFollowupPlans}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}

      <Modal
        title="随访计划详情"
        open={planDetailVisible}
        onCancel={() => setPlanDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPlanDetailVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedPlan && (
          <div className="space-y-4">
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="计划ID">{selectedPlan.id}</Descriptions.Item>
              <Descriptions.Item label="患者姓名">{selectedPlan.patientName}</Descriptions.Item>
              <Descriptions.Item label="病案ID">{selectedPlan.caseId}</Descriptions.Item>
              <Descriptions.Item label="创建日期">{selectedPlan.createdAt}</Descriptions.Item>
              <Descriptions.Item label="创建人">{selectedPlan.createdBy}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge
                  status={statusConfig[selectedPlan.status as keyof typeof statusConfig]?.status || 'default'}
                  text={statusConfig[selectedPlan.status as keyof typeof statusConfig]?.label || selectedPlan.status}
                />
              </Descriptions.Item>
            </Descriptions>

            <Card title="随访任务列表" size="small">
              <div className="space-y-3">
                {selectedPlan.tasks.map((task) => (
                  <Card key={task.id} size="small">
                    <div className="flex justify-between items-start">
                      <div>
                        <Text strong>第 {task.sequence} 次随访</Text>
                        <Tag color={taskStatusConfig[task.status as keyof typeof taskStatusConfig].color} className="ml-2">
                          {taskStatusConfig[task.status as keyof typeof taskStatusConfig].label}
                        </Tag>
                      </div>
                      <Tag color={methodConfig[task.method as keyof typeof methodConfig]?.color}>
                        {methodConfig[task.method as keyof typeof methodConfig]?.icon} {methodConfig[task.method as keyof typeof methodConfig]?.label}
                      </Tag>
                    </div>
                    <div className="mt-2">
                      <Text type="secondary" className="text-xs">计划日期：</Text>
                      <Text>{task.scheduledDate}</Text>
                      {task.actualDate && (
                        <>
                          <Text type="secondary" className="text-xs ml-4">实际日期：</Text>
                          <Text>{task.actualDate}</Text>
                        </>
                      )}
                    </div>
                    {task.result && (
                      <div className="mt-2">
                        <Text type="secondary" className="text-xs">随访结果：</Text>
                        <div className="mt-1 p-2 bg-green-50 rounded border border-green-200">
                          <Text>{task.result}</Text>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  )
}
