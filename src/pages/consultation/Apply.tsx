import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Card, Steps, Form, Input, Select, DatePicker, Button, Table, Tag, Space, message, Modal, Upload, List, Avatar, Typography, Row, Col, Spin, Alert, Badge, Divider, Tooltip, Drawer, Progress } from 'antd'
import { SearchOutlined, UserAddOutlined, UploadOutlined, PlusOutlined, CheckCircleOutlined, RobotOutlined, ThunderboltOutlined, FileProtectOutlined, WarningOutlined, CheckCircleFilled, StarFilled } from '@ant-design/icons'
import { mockPatients, mockExperts } from '../../mocks/data'
import type { ColumnsType } from 'antd/es/table'
import type { Patient, Expert } from '../../stores/consultationStore'
import dayjs from 'dayjs'
import intelligentConsultationService, { IntelligentApplication, ExpertMatch } from '../../services/integration/ai/intelligentConsultationService'

const { TextArea } = Input
const { Title, Text } = Typography

export default function Apply() {
  const [searchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedExperts, setSelectedExperts] = useState<Expert[]>([])
  const [form] = Form.useForm()
  const navigate = useNavigate()
  
  // AI 辅助相关状态
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<IntelligentApplication | null>(null)
  const [showAiPanel, setShowAiPanel] = useState(false)
  
  // 智能匹配专家相关状态
  const [matchDrawerVisible, setMatchDrawerVisible] = useState(false)
  const [matchedExperts, setMatchedExperts] = useState<ExpertMatch[]>([])
  const [matchLoading, setMatchLoading] = useState(false)

  // 从 URL 参数中获取患者 ID 并自动选择患者
  useEffect(() => {
    const patientId = searchParams.get('patientId')
    if (patientId) {
      // 尝试从 mock 数据中查找患者
      const patient = mockPatients.find(p => p.id === patientId)
      if (patient) {
        setSelectedPatient(patient)
        setCurrentStep(1)
        message.success(`已自动选择患者：${patient.name}`)
      }
    }
  }, [searchParams])

  const patientColumns: ColumnsType<Patient> = [
    { title: '姓名', dataIndex: 'name', render: (t) => <a onClick={() => setSelectedPatient(mockPatients.find(p => p.name === t) || null)}>{t}</a> },
    { title: '住院号', dataIndex: 'inpatientNo' },
    { title: '性别', dataIndex: 'gender' },
    { title: '年龄', dataIndex: 'age' },
    { title: '主要诊断', dataIndex: 'mainDiagnosis', ellipsis: true },
    { title: '主治医生', dataIndex: 'doctor' },
  ]

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setCurrentStep(1)
    message.success(`已选择患者: ${patient.name}`)
  }

  const handleExpertSelect = (expert: Expert) => {
    if (!selectedExperts.find(e => e.id === expert.id)) {
      setSelectedExperts([...selectedExperts, expert])
    }
  }

  const handleRemoveExpert = (expertId: string) => {
    setSelectedExperts(selectedExperts.filter(e => e.id !== expertId))
  }

  // AI 智能辅助填写
  const handleAIAssist = async () => {
    if (!selectedPatient) {
      message.warning('请先选择患者')
      return
    }

    setAiLoading(true)
    try {
      // 调用 AI 服务获取智能建议
      const suggestion = await intelligentConsultationService.getIntelligentApplication(selectedPatient.id)
      setAiSuggestion(suggestion)
      setShowAiPanel(true)
      
      // 自动填充表单
      if (suggestion.summary) {
        form.setFieldsValue({
          summary: suggestion.summary,
          type: suggestion.recommendedType,
          urgency: '紧急'
        })
      }

      message.success('AI 智能分析完成！已自动填充部分信息')
    } catch (error) {
      console.error('AI 辅助失败:', error)
      message.error('AI 分析失败，请稍后重试')
    } finally {
      setAiLoading(false)
    }
  }

  // 应用 AI 推荐的专家
  const handleApplyAIExperts = () => {
    if (!aiSuggestion) return
    
    const recommendedExpertIds = aiSuggestion.recommendedExperts.map(e => e.id)
    const expertsToAdd = mockExperts.filter(e => recommendedExpertIds.includes(e.id))
    
    setSelectedExperts([...selectedExperts, ...expertsToAdd])
    message.success(`已添加 ${expertsToAdd.length} 位推荐专家`)
    setShowAiPanel(false)
  }

  // 智能匹配专家
  const handleSmartMatchExperts = async () => {
    if (!selectedPatient) {
      message.warning('请先选择患者')
      return
    }
    
    setMatchLoading(true)
    setMatchDrawerVisible(true)
    
    try {
      const result = await intelligentConsultationService.recommendExperts({
        diagnosis: selectedPatient.mainDiagnosis,
        condition: selectedPatient.mainDiagnosis,
        urgency: form.getFieldValue('urgency') || '常规',
        preferredDepartments: form.getFieldValue('departments') || []
      })
      
      setMatchedExperts(result)
    } catch (error) {
      message.error('智能匹配失败，请重试')
      setMatchDrawerVisible(false)
    } finally {
      setMatchLoading(false)
    }
  }

  // 从匹配结果中选择专家
  const handleSelectMatchedExpert = (expert: ExpertMatch) => {
    const fullExpert = mockExperts.find(e => e.id === expert.expertId)
    if (fullExpert && !selectedExperts.find(e => e.id === fullExpert.id)) {
      setSelectedExperts([...selectedExperts, fullExpert])
      message.success(`已添加专家：${expert.name}`)
    } else if (selectedExperts.find(e => e.id === expert.expertId)) {
      message.info('该专家已在邀请列表中')
    }
  }

  const handleSubmit = async () => {
    const values = form.getFieldsValue()
    if (!selectedPatient) {
      message.error('请选择患者')
      return
    }
    if (selectedExperts.length === 0) {
      message.error('请至少选择一位会诊专家')
      return
    }
    await new Promise(r => setTimeout(r, 1000))
    message.success('会诊申请提交成功！')
    Modal.confirm({
      title: '申请已提交',
      content: '是否前往查看我的申请列表？',
      onOk: () => navigate('/consultation/my-applies'),
      onCancel: () => navigate('/consultation/my-applies'),
    })
  }

  return (
    <div className="space-y-4">
      <Title level={4}>申请会诊</Title>

      <Steps
        current={currentStep}
        items={[
          { title: '选择患者', icon: <SearchOutlined /> },
          { title: '填写信息', icon: <UserAddOutlined /> },
          { title: '邀请专家', icon: <UserAddOutlined /> },
          { title: '提交申请', icon: <CheckCircleOutlined /> },
        ]}
      />

      <Row gutter={16}>
        <Col span={selectedPatient ? 24 : 24}>
          <Card title="患者检索" className={selectedPatient ? 'border-green-500' : ''}>
            {currentStep === 0 && (
              <>
                <div className="mb-4">
                  <Input.Search
                    placeholder="输入姓名/住院号搜索患者"
                    allowClear
                    onSearch={(value) => {
                      if (!value) return
                      const patient = mockPatients.find(p =>
                        p.name.includes(value) || p.inpatientNo.includes(value)
                      )
                      if (patient) {
                        handlePatientSelect(patient)
                      } else {
                        message.warning('未找到患者')
                      }
                    }}
                  />
                </div>
                <Table
                  columns={patientColumns}
                  dataSource={mockPatients}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  onRow={(record) => ({
                    onClick: () => handlePatientSelect(record),
                    className: 'cursor-pointer hover:bg-blue-50',
                  })}
                />
              </>
            )}

            {selectedPatient && currentStep >= 1 && (
              <Card
                className="!bg-green-50 !border-green-200"
                title={
                  <Space>
                    <CheckCircleOutlined className="text-green-500" />
                    <span>已选患者</span>
                  </Space>
                }
              >
                <Row gutter={16}>
                  <Col span={6}><Text strong>姓名：</Text>{selectedPatient.name}</Col>
                  <Col span={6}><Text strong>住院号：</Text>{selectedPatient.inpatientNo}</Col>
                  <Col span={6}><Text strong>性别/年龄：</Text>{selectedPatient.gender}/{selectedPatient.age}</Col>
                  <Col span={6}><Text strong>主治医生：</Text>{selectedPatient.doctor}</Col>
                </Row>
                <Row gutter={16} className="mt-2">
                  <Col span={24}><Text strong>主要诊断：</Text>{selectedPatient.mainDiagnosis}</Col>
                </Row>
                <Button type="link" onClick={() => setCurrentStep(currentStep - 1)} className="!p-0">
                  重新选择
                </Button>
              </Card>
            )}
          </Card>
        </Col>
      </Row>

      {currentStep >= 1 && (
        <Card 
          title={
            <Space>
              <span>会诊信息</span>
              <Tooltip title="AI 智能分析患者病情，自动填写会诊信息">
                <Button
                  type="primary"
                  icon={<RobotOutlined />}
                  onClick={handleAIAssist}
                  loading={aiLoading}
                  size="small"
                >
                  AI 智能填写
                </Button>
              </Tooltip>
            </Space>
          }
        >
          {/* AI 建议面板 */}
          {showAiPanel && aiSuggestion && (
            <Alert
              type="info"
              className="mb-4"
              message={
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Space>
                      <ThunderboltOutlined style={{ color: '#faad14' }} />
                      <Text strong>AI 智能分析结果</Text>
                    </Space>
                    <Button size="small" onClick={() => setShowAiPanel(false)}>关闭</Button>
                  </div>
                  
                  <Divider style={{ margin: '12px 0' }} />
                  
                  <Row gutter={[16, 12]}>
                    <Col span={12}>
                      <Text type="secondary">推荐会诊类型：</Text>
                      <Tag color="blue">{aiSuggestion.recommendedType}</Tag>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">推荐科室：</Text>
                      {aiSuggestion.recommendedDepartments.slice(0, 3).map((dept, idx) => (
                        <Tag key={idx} color="green">{dept.department}</Tag>
                      ))}
                    </Col>
                  </Row>
                  
                  <div className="mt-3">
                    <Text type="secondary">会诊目的建议：</Text>
                    <ul className="mt-1 ml-4">
                      {aiSuggestion.purposes.map((purpose, idx) => (
                        <li key={idx}><Text>{purpose}</Text></li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-3">
                    <Text type="secondary">推荐专家（按匹配度排序）：</Text>
                    <div className="mt-2">
                      {aiSuggestion.recommendedExperts.slice(0, 5).map((expert, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded mb-2">
                          <Space>
                            <Avatar size="small">{expert.name[0]}</Avatar>
                            <div>
                              <Text strong>{expert.name}</Text>
                              <Text type="secondary" className="ml-2">{expert.department} · {expert.title}</Text>
                            </div>
                          </Space>
                          <Space>
                            <Badge count={`${(expert.matchScore * 100).toFixed(0)}%`} style={{ backgroundColor: '#52c41a' }} />
                            {expert.available ? (
                              <Tag color="success">可预约</Tag>
                            ) : (
                              <Tag color="warning">忙碌</Tag>
                            )}
                          </Space>
                        </div>
                      ))}
                    </div>
                    <Button 
                      type="primary" 
                      size="small" 
                      onClick={handleApplyAIExperts}
                      icon={<UserAddOutlined />}
                    >
                      一键添加推荐专家
                    </Button>
                  </div>
                  
                  {aiSuggestion.suggestedExams.length > 0 && (
                    <div className="mt-3">
                      <Text type="secondary">建议完善的检查：</Text>
                      <div className="mt-2">
                        {aiSuggestion.suggestedExams.map((exam, idx) => (
                          <Tag key={idx} color={exam.urgency === '紧急' ? 'red' : exam.urgency === '常规' ? 'blue' : 'default'}>
                            {exam.examName} ({exam.urgency})
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              }
            />
          )}
          
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="会诊类型" name="type" initialValue="院内">
                  <Select options={[{ value: '院内', label: '院内会诊' }, { value: '远程', label: '远程会诊' }]} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="紧急程度" name="urgency" initialValue="普通">
                  <Select options={[
                    { value: '普通', label: '普通' },
                    { value: '紧急', label: '紧急' },
                    { value: '特急', label: '特急' },
                  ]} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="期望会诊时间" name="expectTime">
                  <DatePicker showTime className="!w-full" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item 
                  label={
                    <Space>
                      <span>病情摘要</span>
                      {aiSuggestion && (
                        <Tag color="green" icon={<CheckCircleFilled />}>AI 已生成</Tag>
                      )}
                    </Space>
                  } 
                  name="summary"
                >
                  <TextArea rows={4} placeholder="请详细描述患者病情、会诊目的及需要讨论的问题..." />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="上传资料">
                  <Upload multiple>
                    <Button icon={<UploadOutlined />}>上传病历/影像/PDF</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}>上一步</Button>
            <Button type="primary" onClick={() => setCurrentStep(2)}>下一步</Button>
          </div>
        </Card>
      )}

      {currentStep >= 2 && (
        <Card title="邀请会诊专家">
          <div className="mb-4 flex justify-between items-center">
            <div className="flex gap-4">
              <Input.Search placeholder="按科室/职称筛选专家" allowClear style={{ width: 250 }} />
              <Select placeholder="按科室" allowClear style={{ width: 150 }}>
                {Array.from(new Set(mockExperts.map(e => e.department))).map(d => (
                  <Select.Option key={d} value={d}>{d}</Select.Option>
                ))}
              </Select>
            </div>
            <Button 
              type="primary" 
              ghost
              icon={<RobotOutlined />} 
              onClick={handleSmartMatchExperts}
            >
              智能匹配专家
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <Title level={5}>可选专家</Title>
              <List
                dataSource={mockExperts}
                renderItem={(expert) => (
                  <List.Item
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleExpertSelect(expert)}
                    actions={[
                      <Button key="add" size="small" icon={<PlusOutlined />}>邀请</Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar className={expert.status === '忙碌' ? '!bg-orange-500' : expert.status === '离线' ? '!bg-gray-400' : '!bg-green-500'}>{expert.name[0]}</Avatar>}
                      title={<Space>{expert.name}<Tag>{expert.department}</Tag><Tag>{expert.title}</Tag></Space>}
                      description={expert.specialty}
                    />
                  </List.Item>
                )}
              />
            </Col>
            <Col span={8}>
              <Title level={5}>已选专家 ({selectedExperts.length})</Title>
              <List
                dataSource={selectedExperts}
                renderItem={(expert) => (
                  <List.Item
                    actions={[<Button key="remove" size="small" danger onClick={() => handleRemoveExpert(expert.id)}>移除</Button>]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar className="!bg-medical-blue">{expert.name[0]}</Avatar>}
                      title={expert.name}
                      description={expert.department}
                    />
                  </List.Item>
                )}
              />
            </Col>
          </Row>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setCurrentStep(1)}>上一步</Button>
            <Button type="primary" onClick={() => setCurrentStep(3)} disabled={selectedExperts.length === 0}>
              下一步
            </Button>
          </div>
        </Card>
      )}

      {currentStep >= 3 && (
        <Card title="确认提交">
          <Card type="inner" title="患者信息">
            <Text>姓名：{selectedPatient?.name} | 住院号：{selectedPatient?.inpatientNo} | 诊断：{selectedPatient?.mainDiagnosis}</Text>
          </Card>
          <Card type="inner" title="会诊信息" className="mt-2">
            <Text>类型：{form.getFieldValue('type')} | 紧急程度：{form.getFieldValue('urgency')}</Text>
            <br />
            <Text>期望时间：{form.getFieldValue('expectTime')?.format('YYYY-MM-DD HH:mm')}</Text>
          </Card>
          <Card type="inner" title="邀请专家" className="mt-2">
            <Space wrap>
              {selectedExperts.map(e => <Tag key={e.id} icon={<UserAddOutlined />}>{e.name} - {e.department}</Tag>)}
            </Space>
          </Card>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setCurrentStep(2)}>上一步</Button>
            <Button type="primary" onClick={handleSubmit} className="!bg-medical-blue">提交申请</Button>
          </div>
        </Card>
      )}

      {/* 智能匹配专家抽屉 */}
      <Drawer
        title={
          <Space>
            <RobotOutlined style={{ color: '#1890ff' }} />
            <span>AI 智能匹配专家</span>
            {selectedPatient && <Tag color="blue">{selectedPatient.name}</Tag>}
          </Space>
        }
        placement="right"
        width={700}
        open={matchDrawerVisible}
        onClose={() => {
          setMatchDrawerVisible(false)
          setMatchedExperts([])
        }}
      >
        {matchLoading ? (
          <div className="text-center py-20">
            <Progress type="circle" percent={100} status="active" />
            <div className="mt-4">
              <Text type="secondary">正在进行智能匹配...</Text>
            </div>
          </div>
        ) : matchedExperts.length > 0 ? (
          <>
            <Alert
              type="info"
              message="智能匹配结果"
              description="基于患者病情、专家专长、历史案例、可用时间等多维度进行智能匹配，推荐最合适的专家组合。"
              showIcon
              className="mb-4"
            />
            
            <List
              dataSource={matchedExperts}
              renderItem={(expert) => (
                <List.Item
                  actions={[
                    <Button 
                      key="add" 
                      type="primary" 
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => handleSelectMatchedExpert(expert)}
                      disabled={!!selectedExperts.find(e => e.id === expert.expertId)}
                    >
                      {selectedExperts.find(e => e.id === expert.expertId) ? '已添加' : '邀请'}
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div className="relative">
                        <Avatar className="!bg-medical-blue" size={48}>{expert.name[0]}</Avatar>
                        {expert.recommended && (
                          <div className="absolute -top-1 -right-1">
                            <StarFilled className="text-yellow-400 text-sm" />
                          </div>
                        )}
                      </div>
                    }
                    title={
                      <Space>
                        <Text strong>{expert.name}</Text>
                        <Tag>{expert.department}</Tag>
                        <Tag color={expert.title === '主任医师' ? 'gold' : 'blue'}>{expert.title}</Tag>
                        {expert.recommended && <Tag color="red">推荐</Tag>}
                      </Space>
                    }
                    description={
                      <div className="space-y-2">
                        <Text type="secondary">{expert.specialty}</Text>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Text type="secondary" className="text-xs">匹配度：</Text>
                            <Progress 
                              percent={expert.matchScore} 
                              size="small" 
                              style={{ width: 100 }}
                              strokeColor={
                                expert.matchScore >= 90 ? '#52c41a' :
                                expert.matchScore >= 80 ? '#1890ff' :
                                expert.matchScore >= 70 ? '#faad14' : '#ff4d4f'
                              }
                            />
                          </div>
                          <Tag color={expert.availability === '空闲' ? 'green' : expert.availability === '忙碌' ? 'orange' : 'default'}>
                            {expert.availability}
                          </Tag>
                        </div>
                        
                        <div className="mt-2">
                          <Text type="secondary" className="text-xs">匹配原因：</Text>
                          <ul className="mt-1 space-y-1">
                            {expert.matchReasons.map((reason, idx) => (
                              <li key={idx} className="text-xs text-gray-600">• {reason}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex gap-4 mt-2 text-xs">
                          <Text type="secondary">近期案例：{expert.recentCases}例</Text>
                          <Text type="secondary">成功率：{expert.successRate}%</Text>
                          <Text type="secondary">平均评分：{expert.averageRating}分</Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </>
        ) : (
          <Alert
            type="warning"
            message="未找到匹配专家"
            description="请确保已选择患者并填写了会诊信息，然后重新尝试智能匹配。"
            showIcon
          />
        )}
      </Drawer>
    </div>
  )
}