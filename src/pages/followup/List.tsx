import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Button, Tag, Space, Typography, Modal, Form, Select, DatePicker, Input, message, Badge, Drawer, Alert, List, Progress, Divider, Statistic, Row, Col, Popover, Empty, Steps, Descriptions, Timeline } from 'antd'
import { PlusOutlined, EditOutlined, StopOutlined, CalendarOutlined, WarningOutlined, CheckCircleOutlined, ExclamationCircleOutlined, ThunderboltOutlined, TeamOutlined, EyeOutlined, SearchOutlined, FilterOutlined, RobotOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { mockFollowupPlans, mockPatients } from '../../mocks/data'
import type { FollowupPlan } from '../../stores/consultationStore'
import type { ColumnsType } from 'antd/es/table'
import intelligentFollowupService, { FollowupAnalysisResult } from '../../services/integration/ai/intelligentFollowupService'
import aiFollowupPlanningService, { PatientInfo, AIFollowupPlan, FollowupNode } from '../../services/integration/ai/aiFollowupPlanningService'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface FollowupPlanWithAnalysis extends FollowupPlan {
  analysisResult?: FollowupAnalysisResult
}

export default function FollowupList() {
  const navigate = useNavigate()
  const [data, setData] = useState<FollowupPlanWithAnalysis[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<FollowupPlan | null>(null)
  const [form] = Form.useForm()
  
  // AI 分析相关状态
  const [analysisDrawerVisible, setAnalysisDrawerVisible] = useState(false)
  const [selectedAnalysis, setSelectedAnalysis] = useState<FollowupAnalysisResult | null>(null)
  const [selectedFollowup, setSelectedFollowup] = useState<FollowupPlan | null>(null)
  const [autoAnalyzing, setAutoAnalyzing] = useState(false)

  // 检索相关状态
  const [searchText, setSearchText] = useState('')
  const [filterVisible, setFilterVisible] = useState(false)
  const [filters, setFilters] = useState<{
    patientName?: string
    status?: string
    riskLevel?: string
    department?: string
    dateRange?: [dayjs.Dayjs, dayjs.Dayjs]
  }>({})

  // AI 规划相关状态
  const [aiPlanningVisible, setAiPlanningVisible] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [aiPlan, setAiPlan] = useState<AIFollowupPlan | null>(null)
  const [generatingPlan, setGeneratingPlan] = useState(false)
  const [editingPlan, setEditingPlan] = useState(false)
  const [editablePlan, setEditablePlan] = useState<AIFollowupPlan | null>(null)

  // 自动分析所有随访计划
  const autoAnalyzeAll = async () => {
    setAutoAnalyzing(true)
    try {
      const plans = mockFollowupPlans.map(plan => ({
        ...plan,
        // 模拟随访数据 - 实际应该从后端获取
        mockData: {
          symptoms: plan.patientName === '王建国' ? ['症状严重，需紧急处理'] : ['无明显症状'],
          medications: plan.patientName === '李秀英' ? ['有不良反应：皮疹'] : ['规律服药'],
          qualityOfLife: plan.patientName === '张伟' ? { status: '需要关注', details: '睡眠质量差' } : { status: '良好', details: '睡眠、饮食正常' }
        }
      }))

      const analyzedPlans = await Promise.all(
        plans.map(async (plan) => {
          const result = await intelligentFollowupService.analyzeFollowup(plan.id, plan.mockData)
          return {
            ...plan,
            analysisResult: result
          }
        })
      )

      setData(analyzedPlans)
    } catch (error) {
      console.error('自动分析失败:', error)
      message.error('AI 分析失败')
    } finally {
      setAutoAnalyzing(false)
    }
  }

  useEffect(() => {
    autoAnalyzeAll()
  }, [])

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  // AI 规划随访计划
  const handleAIPlan = async (patientId: string) => {
    if (!patientId) {
      message.warning('请先选择患者')
      return
    }

    setGeneratingPlan(true)
    try {
      // 构造患者信息
      const patient = mockPatients.find(p => p.id === patientId)
      if (!patient) {
        message.error('患者信息不存在')
        return
      }

      const patientInfo: PatientInfo = {
        patientId: patient.id,
        name: patient.name,
        age: patient.age,
        gender: patient.gender,
        department: patient.department,
        diagnosis: {
          primary: patient.mainDiagnosis,
          secondary: [],
          stage: undefined,
          tnm: undefined
        },
        treatments: [],
        surgeryDate: undefined,
        riskFactors: []
      }

      // 调用 AI 规划服务
      const plan = await aiFollowupPlanningService.generateFollowupPlan(patientInfo)
      setAiPlan(plan)
      setEditablePlan(JSON.parse(JSON.stringify(plan))) // 深拷贝用于编辑
      setEditingPlan(false)
      message.success('AI 随访计划生成成功')
    } catch (error) {
      console.error('AI 规划失败:', error)
      message.error('AI 规划失败')
    } finally {
      setGeneratingPlan(false)
    }
  }

  // 开始编辑计划
  const handleStartEdit = () => {
    if (aiPlan) {
      setEditablePlan(JSON.parse(JSON.stringify(aiPlan))) // 深拷贝
      setEditingPlan(true)
      message.info('进入编辑模式，您可以修改随访计划')
    }
  }

  // 保存编辑
  const handleSaveEdit = () => {
    if (editablePlan) {
      setAiPlan(editablePlan)
      setEditingPlan(false)
      message.success('随访计划已保存')
    }
  }

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingPlan(false)
    setEditablePlan(aiPlan ? JSON.parse(JSON.stringify(aiPlan)) : null)
    message.info('已取消编辑')
  }

  // 更新随访节点
  const updateNode = (index: number, field: keyof FollowupNode, value: any) => {
    if (!editablePlan) return
    const newNodes = [...editablePlan.nodes]
    newNodes[index] = { ...newNodes[index], [field]: value }
    setEditablePlan({ ...editablePlan, nodes: newNodes })
  }

  // 添加随访节点
  const handleAddNode = () => {
    if (!editablePlan) return
    const newNode: FollowupNode = {
      timepoint: '自定义时间',
      days: 0,
      purpose: '',
      content: [],
      examinations: [],
      department: editablePlan.nodes[editablePlan.nodes.length - 1]?.department || '肿瘤内科',
      priority: 'medium'
    }
    setEditablePlan({
      ...editablePlan,
      nodes: [...editablePlan.nodes, newNode]
    })
    message.success('已添加随访节点')
  }

  // 删除随访节点
  const handleDeleteNode = (index: number) => {
    if (!editablePlan) return
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除随访节点"${editablePlan.nodes[index].timepoint}"吗？`,
      onOk: () => {
        const newNodes = editablePlan.nodes.filter((_, i) => i !== index)
        setEditablePlan({ ...editablePlan, nodes: newNodes })
        message.success('已删除随访节点')
      }
    })
  }

  // 应用 AI 规划
  const handleApplyAIPlan = () => {
    const planToApply = editingPlan ? editablePlan : aiPlan
    if (!planToApply) return

    // 填充表单
    form.setFieldsValue({
      patient: planToApply.patientName,
      purpose: `术后规范化随访（${aiFollowupPlanningService.getRiskText(planToApply.riskLevel)}）`,
      nodes: planToApply.nodes.map(n => n.timepoint)
    })

    message.success('AI 随访计划已填充到表单')
    setAiPlanningVisible(false)
  }

  const handleEdit = (record: FollowupPlan) => {
    setEditingRecord(record)
    setModalVisible(true)
    form.setFieldsValue({
      patient: record.patientName,
      purpose: record.purpose,
      doctor: record.doctor,
    })
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      console.log(values)
      message.success('随访计划创建成功')
      setModalVisible(false)
      form.resetFields()
    })
  }

  const handleTerminate = (id: string) => {
    Modal.confirm({
      title: '确认终止',
      content: '确定要终止该随访计划吗？',
      onOk: () => {
        setData(data.map(d => d.id === id ? { ...d, status: '已终止' as const } : d))
        message.success('已终止')
      }
    })
  }

  // 发起二次 MDT
  const handleInitiateMDT = (record: FollowupPlanWithAnalysis) => {
    if (record.analysisResult?.needSecondaryMDT) {
      Modal.confirm({
        title: '确认发起二次 MDT 会诊',
        content: (
          <div className="py-4">
            <Alert
              type="warning"
              message="二次 MDT 会诊申请"
              description="系统将为您创建新的会诊申请，并自动填充患者信息和 AI 分析结果。"
              showIcon
              className="mb-4"
            />
            <div className="space-y-2">
              <p><strong>患者：</strong>{record.patientName}</p>
              <p><strong>随访计划 ID：</strong>{record.id}</p>
              <p><strong>风险等级：</strong>
                <Tag color={
                  record.analysisResult.riskLevel === 'critical' ? 'red' :
                  record.analysisResult.riskLevel === 'high' ? 'orange' :
                  record.analysisResult.riskLevel === 'medium' ? 'yellow' : 'green'
                }>
                  {intelligentFollowupService.getRiskText(record.analysisResult.riskLevel)}
                </Tag>
              </p>
              <p><strong>需要 MDT 原因：</strong></p>
              <p className="text-gray-700 bg-gray-50 p-2 rounded">{record.analysisResult.mdtReason}</p>
              <p><strong>紧急程度：</strong>
                <Tag color={
                  record.analysisResult.urgency === 'emergency' ? 'red' :
                  record.analysisResult.urgency === 'urgent' ? 'orange' : 'blue'
                }>
                  {record.analysisResult.urgency === 'emergency' ? '紧急' :
                   record.analysisResult.urgency === 'urgent' ? '较急' : '常规'}
                </Tag>
              </p>
              <p><strong>预警数量：</strong>{record.analysisResult.warnings.length} 个</p>
            </div>
          </div>
        ),
        okText: '确认发起',
        cancelText: '取消',
        width: 600,
        onOk: () => {
          // 跳转到会诊申请页面，并传递随访信息
          navigate(`/consultation/apply?followupId=${record.id}&mdtType=secondary`, {
            state: {
              followupData: {
                patientName: record.patientName,
                analysisResult: record.analysisResult,
                mdtReason: record.analysisResult?.mdtReason,
                urgency: record.analysisResult?.urgency
              }
            }
          })
          message.success('正在跳转到会诊申请页面...')
        }
      })
    }
  }

  // 查看详情
  const handleViewDetails = (record: FollowupPlanWithAnalysis) => {
    setSelectedFollowup(record)
    setSelectedAnalysis(record.analysisResult || null)
    setAnalysisDrawerVisible(true)
  }

  const columns: ColumnsType<FollowupPlanWithAnalysis> = [
    {
      title: '风险等级',
      key: 'riskLevel',
      width: 100,
      filters: [
        { text: '低风险', value: 'low' },
        { text: '中风险', value: 'medium' },
        { text: '高风险', value: 'high' },
        { text: '极高风险', value: 'critical' },
      ],
      onFilter: (value, record) => {
        if (!record.analysisResult) return false
        return record.analysisResult.riskLevel === value
      },
      render: (_, record) => {
        if (!record.analysisResult || autoAnalyzing) {
          return <Progress type="circle" size={20} percent={100} status="active" />
        }
        const level = record.analysisResult.riskLevel
        const colors = {
          low: '#52c41a',
          medium: '#faad14',
          high: '#ff7a45',
          critical: '#ff4d4f'
        }
        const texts = {
          low: '低',
          medium: '中',
          high: '高',
          critical: '极高'
        }
        return (
          <Tag color={colors[level]} style={{ minWidth: 50 }}>
            {texts[level]}
          </Tag>
        )
      }
    },
    {
      title: '预警',
      key: 'warnings',
      width: 100,
      render: (_, record) => {
        if (!record.analysisResult || autoAnalyzing) {
          return null
        }
        const warningCount = record.analysisResult.warnings.length
        const needMDT = record.analysisResult.needSecondaryMDT
        
        if (needMDT) {
          return (
            <Popover
              content={
                <div>
                  <p className="font-bold text-red-600 mb-2">需要二次 MDT</p>
                  <p className="text-sm">{record.analysisResult.mdtReason}</p>
                </div>
              }
              title="预警信息"
              trigger="hover"
            >
              <Badge count="MDT" offset={[-5, 0]}>
                <ExclamationCircleOutlined className="text-red-500 text-lg" />
              </Badge>
            </Popover>
          )
        }
        
        if (warningCount > 0) {
          return (
            <Popover
              content={
                <div>
                  {record.analysisResult!.warnings.map((w, i) => (
                    <p key={i} className="text-sm mb-1">⚠️ {w.title}</p>
                  ))}
                </div>
              }
              title={`${warningCount}个预警`}
              trigger="hover"
            >
              <Badge count={warningCount} offset={[-5, 0]}>
                <WarningOutlined className="text-orange-500 text-lg" />
              </Badge>
            </Popover>
          )
        }
        
        return <CheckCircleOutlined className="text-green-500 text-lg" />
      }
    },
    { 
      title: '患者', 
      dataIndex: 'patientName',
      filterSearch: true,
      onFilter: (value, record) => record.patientName.includes(value as string)
    },
    { title: '随访目的', dataIndex: 'purpose', ellipsis: true },
    { title: '计划周期', render: (_, r) => `${r.startDate} ~ ${r.endDate}` },
    { title: '下次随访', dataIndex: 'nextFollowup' },
    { title: '负责医生', dataIndex: 'doctor' },
    {
      title: '状态',
      dataIndex: 'status',
      filters: [
        { text: '进行中', value: '进行中' },
        { text: '已完成', value: '已完成' },
        { text: '已终止', value: '已终止' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (t) => <Tag color={t === '进行中' ? 'green' : t === '已完成' ? 'blue' : 'red'}>{t}</Tag>
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space wrap size="small">
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            详情
          </Button>
          {record.analysisResult?.needSecondaryMDT && (
            <Button 
              size="small" 
              danger
              icon={<TeamOutlined />}
              onClick={() => handleInitiateMDT(record)}
            >
              二次 MDT
            </Button>
          )}
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.status === '进行中' && (
            <Button size="small" danger icon={<StopOutlined />} onClick={() => handleTerminate(record.id)}>
              终止
            </Button>
          )}
        </Space>
      )
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">随访计划管理</Title>
        <Space>
          <Button 
            icon={<RobotOutlined />} 
            onClick={() => {
              setAiPlanningVisible(true)
              setSelectedPatient(null)
              setAiPlan(null)
            }}
          >
            AI 规划随访
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建随访计划
          </Button>
        </Space>
      </div>

      <Card>
        {/* 检索栏 */}
        <div className="flex items-center justify-between mb-4">
          <Space>
            <Input
              placeholder="搜索患者姓名"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Button 
              icon={<FilterOutlined />} 
              onClick={() => setFilterVisible(!filterVisible)}
            >
              高级筛选
            </Button>
          </Space>
          <Space>
            <Button 
              icon={<RobotOutlined />} 
              onClick={() => {
                setAiPlanningVisible(true)
                setSelectedPatient(null)
                setAiPlan(null)
              }}
            >
              AI 规划随访
            </Button>
          </Space>
        </div>

        {/* 高级筛选 */}
        {filterVisible && (
          <Card className="mb-4" size="small">
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item label="风险等级">
                  <Select
                    placeholder="请选择"
                    allowClear
                    onChange={(value) => setFilters({ ...filters, riskLevel: value })}
                  >
                    <Select.Option value="low">低风险</Select.Option>
                    <Select.Option value="medium">中风险</Select.Option>
                    <Select.Option value="high">高风险</Select.Option>
                    <Select.Option value="critical">极高风险</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="状态">
                  <Select
                    placeholder="请选择"
                    allowClear
                    onChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <Select.Option value="进行中">进行中</Select.Option>
                    <Select.Option value="已完成">已完成</Select.Option>
                    <Select.Option value="已终止">已终止</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item label="日期范围">
                  <DatePicker.RangePicker
                    style={{ width: '100%' }}
                    onChange={(dates) => setFilters({ ...filters, dateRange: dates as any })}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Button 
                  type="primary" 
                  block
                  onClick={() => {
                    // 应用筛选
                    message.info('筛选条件已应用')
                  }}
                >
                  应用筛选
                </Button>
              </Col>
            </Row>
          </Card>
        )}

        {autoAnalyzing && (
          <div className="text-center py-4 mb-2">
            <Progress type="circle" size={20} percent={100} status="active" className="mr-2" />
            <Text type="secondary">AI 正在自动分析所有随访计划...</Text>
          </div>
        )}
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id" 
          pagination={{ pageSize: 10 }}
          rowClassName={(record) => {
            if (record.analysisResult?.riskLevel === 'critical') return 'bg-red-50'
            if (record.analysisResult?.riskLevel === 'high') return 'bg-orange-50'
            return ''
          }}
        />
      </Card>

      <Modal
        title={editingRecord ? "编辑随访计划" : "新建随访计划"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={700}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
            <OkBtn />
          </>
        )}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="选择患者" name="patient" rules={[{ required: true }]}>
            <Select 
              placeholder="请选择患者"
              showSearch
              optionFilterProp="children"
              onChange={(value) => setSelectedPatient(value)}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={mockPatients.map(p => ({
                value: p.id,
                label: `${p.name}（${p.gender}，${p.age}岁）`
              }))}
            />
          </Form.Item>
          <Form.Item label="随访目的" name="purpose" rules={[{ required: true }]}>
            <Input placeholder="请输入随访目的" />
          </Form.Item>
          <Form.Item label="计划周期" rules={[{ required: true }]}>
            <Space>
              <Form.Item name="startDate" noStyle>
                <DatePicker placeholder="开始日期" />
              </Form.Item>
              <Text>至</Text>
              <Form.Item name="endDate" noStyle>
                <DatePicker placeholder="结束日期" />
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item label="随访节点" name="nodes">
            <Select mode="tags" placeholder="添加随访时间点，如：1 个月、3 个月、6 个月" />
          </Form.Item>
          <Form.Item label="执行医生" name="doctor" rules={[{ required: true }]}>
            <Select placeholder="选择执行医生">
              <Select.Option value="张明华">张明华</Select.Option>
              <Select.Option value="李芳">李芳</Select.Option>
              <Select.Option value="陈伟">陈伟</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* AI 规划随访计划对话框 */}
      <Modal
        title={
          <Space>
            <RobotOutlined style={{ color: '#1890ff' }} />
            <span>AI 智能规划随访计划</span>
          </Space>
        }
        open={aiPlanningVisible}
        onCancel={() => {
          setAiPlanningVisible(false)
          setAiPlan(null)
          setSelectedPatient(null)
          setGeneratingPlan(false)
          setEditingPlan(false)
          setEditablePlan(null)
        }}
        onOk={handleApplyAIPlan}
        width={900}
        confirmLoading={generatingPlan}
        okText={editingPlan ? "应用编辑后的计划" : "应用此计划"}
        cancelText="取消"
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <CancelBtn />
            {editingPlan ? (
              <>
                <Button key="cancel" onClick={handleCancelEdit}>
                  取消编辑
                </Button>
                <Button key="save" type="primary" onClick={handleSaveEdit}>
                  保存编辑
                </Button>
              </>
            ) : (
              aiPlan && <OkBtn />
            )}
          </>
        )}
      >
        {!selectedPatient && !generatingPlan && !aiPlan ? (
          <div className="py-8">
            <Alert
              type="info"
              message="第一步：选择患者"
              description="系统将基于患者的病情、分期、治疗方案等信息，自动生成个性化的随访计划。"
              showIcon
              className="mb-4"
            />
            <div className="text-center">
              <Select
                placeholder="点击选择患者"
                style={{ width: '100%' }}
                showSearch
                optionFilterProp="children"
                onChange={(value) => {
                  setSelectedPatient(value)
                  // 选择患者后自动生成随访计划
                  handleAIPlan(value)
                }}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={mockPatients.map(p => ({
                  value: p.id,
                  label: `${p.name}（${p.gender}，${p.age}岁） - ${p.department}`
                }))}
              />
            </div>
          </div>
        ) : generatingPlan ? (
          <div className="text-center py-12">
            <Progress type="circle" size={60} percent={100} status="active" />
            <p className="mt-4 text-lg text-gray-600">AI 正在分析患者病情，生成个性化随访计划...</p>
            <p className="mt-2 text-sm text-gray-500">预计需要 1-2 秒</p>
          </div>
        ) : editablePlan ? (
          <div className="space-y-4">
            <Alert
              type="success"
              message={`✅ AI 随访计划生成成功 - ${aiFollowupPlanningService.getRiskText(editablePlan.riskLevel)}`}
              description={
                <Descriptions column={2} size="small">
                  <Descriptions.Item label="患者">{editablePlan.patientName}</Descriptions.Item>
                  <Descriptions.Item label="随访周期">{editablePlan.totalDuration} 天（约 {Math.round(editablePlan.totalDuration / 30)} 个月）</Descriptions.Item>
                  <Descriptions.Item label="风险等级">
                    <Tag color={editablePlan.riskLevel === 'high' ? 'red' : editablePlan.riskLevel === 'medium' ? 'orange' : 'green'}>
                      {aiFollowupPlanningService.getRiskText(editablePlan.riskLevel)}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="随访节点">{editablePlan.nodes.length} 个</Descriptions.Item>
                </Descriptions>
              }
              showIcon
              className="mb-4"
              action={
                !editingPlan && (
                  <Button size="small" icon={<EditOutlined />} onClick={handleStartEdit}>
                    编辑计划
                  </Button>
                )
              }
            />

            <Card 
              title={
                <Space>
                  <span>📋 随访计划详情</span>
                  {editingPlan && <Tag color="orange">编辑模式</Tag>}
                </Space>
              } 
              size="small" 
              className="max-h-96 overflow-y-auto"
              extra={
                editingPlan && (
                  <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={handleAddNode}>
                    添加节点
                  </Button>
                )
              }
            >
              <Timeline
                items={editablePlan.nodes.map((node, index) => ({
                  key: index,
                  color: node.priority === 'high' ? 'red' : node.priority === 'medium' ? 'orange' : 'green',
                  title: (
                    <Space>
                      {editingPlan ? (
                        <Input
                          value={node.timepoint}
                          onChange={(e) => updateNode(index, 'timepoint', e.target.value)}
                          style={{ width: 150 }}
                          size="small"
                        />
                      ) : (
                        <Text strong>{node.timepoint}</Text>
                      )}
                      {editingPlan ? (
                        <Select
                          value={node.priority}
                          onChange={(value) => updateNode(index, 'priority', value)}
                          size="small"
                          style={{ width: 80 }}
                        >
                          <Select.Option value="high">重要</Select.Option>
                          <Select.Option value="medium">一般</Select.Option>
                          <Select.Option value="low">常规</Select.Option>
                        </Select>
                      ) : (
                        <Tag color={node.priority === 'high' ? 'red' : node.priority === 'medium' ? 'orange' : 'green'}>
                          {node.priority === 'high' ? '重要' : node.priority === 'medium' ? '一般' : '常规'}
                        </Tag>
                      )}
                      <Tag>{node.department}</Tag>
                      {editingPlan && (
                        <Button
                          type="link"
                          danger
                          size="small"
                          icon={<CloseCircleOutlined />}
                          onClick={() => handleDeleteNode(index)}
                        >
                          删除
                        </Button>
                      )}
                    </Space>
                  ),
                  children: editingPlan ? (
                    <div className="space-y-2 text-sm">
                      <div>
                        <Text type="secondary">目的：</Text>
                        <Input
                          value={node.purpose}
                          onChange={(e) => updateNode(index, 'purpose', e.target.value)}
                          size="small"
                          style={{ width: '100%' }}
                          placeholder="请输入随访目的"
                        />
                      </div>
                      <div>
                        <Text type="secondary">科室：</Text>
                        <Select
                          value={node.department}
                          onChange={(value) => updateNode(index, 'department', value)}
                          size="small"
                          style={{ width: '100%' }}
                        >
                          <Select.Option value="胸外科">胸外科</Select.Option>
                          <Select.Option value="肿瘤内科">肿瘤内科</Select.Option>
                          <Select.Option value="放疗科">放疗科</Select.Option>
                          <Select.Option value="呼吸内科">呼吸内科</Select.Option>
                        </Select>
                      </div>
                      <div>
                        <Text type="secondary">随访内容：</Text>
                        <Input.TextArea
                          value={node.content.join('\n')}
                          onChange={(e) => updateNode(index, 'content', e.target.value.split('\n').filter(t => t.trim()))}
                          size="small"
                          rows={3}
                          placeholder="每行一条随访内容"
                        />
                      </div>
                      <div>
                        <Text type="secondary">检查项目：</Text>
                        <Input.TextArea
                          value={node.examinations.join('，')}
                          onChange={(e) => updateNode(index, 'examinations', e.target.value.split(/[,,]/).filter(t => t.trim()))}
                          size="small"
                          rows={2}
                          placeholder="用逗号分隔检查项目"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div>
                        <Text type="secondary">目的：</Text>
                        <Text>{node.purpose}</Text>
                      </div>
                      <div>
                        <Text type="secondary">随访内容：</Text>
                        <ul className="list-disc list-inside ml-4">
                          {node.content.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <Text type="secondary">检查项目：</Text>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {node.examinations.map((e, i) => (
                            <Tag key={i} color="blue" className="text-xs">{e}</Tag>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                }))}
              />
            </Card>

            <Card title="⚠️ 特别注意事项" size="small">
              <Alert
                type="warning"
                message="患者教育"
                description={
                  <ul className="list-disc list-inside">
                    {editablePlan.specialInstructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ul>
                }
                showIcon
              />
            </Card>

            <Card title="📚 循证依据" size="small">
              <ul className="list-disc list-inside text-sm text-gray-600">
                {editablePlan.evidenceBased.map((ev, i) => (
                  <li key={i}>{ev}</li>
                ))}
              </ul>
            </Card>
          </div>
        ) : null}
      </Modal>

      {/* AI 分析结果抽屉 */}
      <Drawer
        title={
          <Space>
            <ThunderboltOutlined style={{ color: '#1890ff' }} />
            <span>AI 随访智能分析详情</span>
            {selectedFollowup && <Tag color="blue">{selectedFollowup.patientName}</Tag>}
          </Space>
        }
        placement="right"
        width={700}
        open={analysisDrawerVisible}
        onClose={() => {
          setAnalysisDrawerVisible(false)
          setSelectedAnalysis(null)
          setSelectedFollowup(null)
        }}
      >
        {selectedAnalysis ? (
          <>
            {/* 风险评估 */}
            <Card className="mb-4">
              <div className="text-center mb-4">
                <Progress
                  type="circle"
                  percent={selectedAnalysis.riskScore}
                  format={(percent) => (
                    <div>
                      <div className="text-3xl font-bold" style={{ color: intelligentFollowupService.getRiskColor(selectedAnalysis.riskLevel) }}>
                        {percent}
                      </div>
                      <div className="text-sm text-gray-500">风险评分</div>
                    </div>
                  )}
                  strokeColor={intelligentFollowupService.getRiskColor(selectedAnalysis.riskLevel)}
                  size={120}
                />
              </div>
              
              <Divider />
              
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="风险等级"
                    value={intelligentFollowupService.getRiskText(selectedAnalysis.riskLevel)}
                    valueStyle={{ color: intelligentFollowupService.getRiskColor(selectedAnalysis.riskLevel), fontSize: '18px' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="预警数量"
                    value={selectedAnalysis.warnings.length}
                    valueStyle={{ color: selectedAnalysis.warnings.length > 0 ? '#ff4d4f' : '#52c41a' }}
                    prefix={selectedAnalysis.warnings.length > 0 ? <WarningOutlined /> : <CheckCircleOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="需要二次 MDT"
                    value={selectedAnalysis.needSecondaryMDT ? '是' : '否'}
                    valueStyle={{ color: selectedAnalysis.needSecondaryMDT ? '#ff4d4f' : '#52c41a', fontSize: '18px' }}
                    prefix={selectedAnalysis.needSecondaryMDT ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
                  />
                </Col>
              </Row>
            </Card>

            {/* 二次 MDT 提示 */}
            {selectedAnalysis.needSecondaryMDT && (
              <Alert
                type="error"
                message="需要发起二次 MDT 会诊"
                description={
                  <div>
                    <p><strong>原因：</strong>{selectedAnalysis.mdtReason}</p>
                    <p><strong>紧急程度：</strong>
                      <Tag color={
                        selectedAnalysis.urgency === 'emergency' ? 'red' :
                        selectedAnalysis.urgency === 'urgent' ? 'orange' : 'blue'
                      }>
                        {selectedAnalysis.urgency === 'emergency' ? '紧急' :
                         selectedAnalysis.urgency === 'urgent' ? '较急' : '常规'}
                      </Tag>
                    </p>
                  </div>
                }
                showIcon
                className="mb-4"
                action={
                  <Button type="primary" danger icon={<TeamOutlined />} onClick={() => handleInitiateMDT(selectedFollowup!)}>
                    发起二次 MDT
                  </Button>
                }
              />
            )}

            {/* 预警列表 */}
            {selectedAnalysis.warnings.length > 0 && (
              <Card title={<><WarningOutlined className="text-red-500 mr-2" />预警信息</>} className="mb-4">
                <List
                  dataSource={selectedAnalysis.warnings}
                  renderItem={(warning) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            warning.severity === 'critical' ? 'bg-red-100' :
                            warning.severity === 'error' ? 'bg-orange-100' :
                            warning.severity === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                          }`}>
                            {warning.severity === 'critical' && <ExclamationCircleOutlined className="text-red-500" />}
                            {warning.severity === 'error' && <WarningOutlined className="text-orange-500" />}
                            {warning.severity === 'warning' && <WarningOutlined className="text-yellow-500" />}
                            {warning.severity === 'info' && <CheckCircleOutlined className="text-blue-500" />}
                          </div>
                        }
                        title={
                          <Space>
                            <Text strong>{warning.title}</Text>
                            <Tag color={
                              warning.severity === 'critical' ? 'red' :
                              warning.severity === 'error' ? 'orange' :
                              warning.severity === 'warning' ? 'gold' : 'blue'
                            }>
                              {warning.severity === 'critical' ? '严重' :
                               warning.severity === 'error' ? '错误' :
                               warning.severity === 'warning' ? '警告' : '提示'}
                            </Tag>
                          </Space>
                        }
                        description={
                          <div>
                            <p>{warning.description}</p>
                            <p className="text-blue-600"><strong>建议：</strong>{warning.suggestion}</p>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {/* AI 建议 */}
            <Card title={<><ThunderboltOutlined className="text-blue-500 mr-2" />AI 建议</>} className="mb-4">
              <List
                dataSource={selectedAnalysis.recommendations}
                renderItem={(item) => (
                  <List.Item>
                    <CheckCircleOutlined className="text-green-500 mr-2" />
                    {item}
                  </List.Item>
                )}
              />
            </Card>

            {/* 下一步行动 */}
            <Card title="下一步行动">
              <List
                dataSource={selectedAnalysis.nextActions}
                renderItem={(action) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Tag color={
                          action.priority === 'high' ? 'red' :
                          action.priority === 'medium' ? 'orange' : 'blue'
                        }>
                          {action.priority === 'high' ? '高' :
                           action.priority === 'medium' ? '中' : '低'}
                        </Tag>
                      }
                      title={action.action}
                      description={
                        <Space split={<Divider type="vertical" />}>
                          {action.deadline && <Text type="secondary">期限：{action.deadline}</Text>}
                          {action.responsible && <Text type="secondary">负责人：{action.responsible}</Text>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </>
        ) : null}
      </Drawer>
    </div>
  )
}