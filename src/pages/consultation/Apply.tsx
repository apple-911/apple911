import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { Card, Steps, Form, Input, Select, DatePicker, Button, Table, Tag, Space, message, Modal, Upload, List, Avatar, Typography, Row, Col, Spin, Alert, Badge, Divider, Tooltip, Drawer, Progress, Tabs } from 'antd'
import { SearchOutlined, UserAddOutlined, UploadOutlined, PlusOutlined, CheckCircleOutlined, RobotOutlined, ThunderboltOutlined, FileProtectOutlined, WarningOutlined, CheckCircleFilled, StarFilled, UserOutlined, DatabaseOutlined, SyncOutlined, TeamOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons'
import { mockPatients, mockExperts } from '../../mocks/data'
import type { ColumnsType } from 'antd/es/table'
import type { Patient, Expert, UploadedFile } from '../../stores/consultationStore'
import dayjs from 'dayjs'
import intelligentConsultationService, { IntelligentApplication, ExpertMatch } from '../../services/integration/ai/intelligentConsultationService'
import PatientInfo from '../../components/PatientInfo'
import MaterialUpload from '../../components/MaterialUpload'

const { TextArea } = Input
const { Title, Text } = Typography

export default function Apply() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
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
  
  // 患者信息抽屉相关状态
  const [patientDrawerVisible, setPatientDrawerVisible] = useState(false)
  
  // 材料上传相关状态
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [medicalRecords, setMedicalRecords] = useState<any>({})
  const [hisDataSynced, setHisDataSynced] = useState(false)
  const [hisSyncLoading, setHisSyncLoading] = useState(false)

  // 从 URL 参数中获取患者 ID 或随访信息并自动选择患者
  useEffect(() => {
    const patientId = searchParams.get('patientId')
    const followupId = searchParams.get('followupId')
    const mdtType = searchParams.get('mdtType')
    
    // 如果是筛查推荐的 MDT，从 location.state 获取筛查数据
    if (mdtType === 'screening' && location.state?.screeningData) {
      const screeningData = location.state.screeningData
      // 根据患者姓名查找患者
      const patient = mockPatients.find(p => p.name === screeningData.patientName)
      if (patient) {
        handlePatientSelect(patient)
        // 自动填充会诊信息
        setTimeout(() => {
          form.setFieldsValue({
            summary: `AI 筛查推荐 MDT - ${screeningData.recommendations.join('；')}`,
            type: '多学科会诊',
            urgency: screeningData.level === 'urgent' ? '紧急' : '常规'
          })
        }, 500)
      }
    }
    // 如果是二次 MDT，从 location.state 获取随访数据
    else if (mdtType === 'secondary' && location.state?.followupData) {
      const followupData = location.state.followupData
      // 根据患者姓名查找患者
      const patient = mockPatients.find(p => p.name === followupData.patientName)
      if (patient) {
        handlePatientSelect(patient)
        // 自动填充会诊信息
        setTimeout(() => {
          form.setFieldsValue({
            summary: `二次 MDT 会诊 - ${followupData.mdtReason}`,
            type: '多学科会诊',
            urgency: followupData.urgency === 'emergency' ? '紧急' : followupData.urgency === 'urgent' ? '较急' : '常规'
          })
        }, 500)
      }
    } else if (patientId) {
      // 普通患者选择
      const patient = mockPatients.find(p => p.id === patientId)
      if (patient) {
        handlePatientSelect(patient)
      }
    }
  }, [searchParams, location.state])

  const patientColumns: ColumnsType<Patient> = [
    { title: '姓名', dataIndex: 'name', render: (t) => <a onClick={() => {
      const patient = mockPatients.find(p => p.name === t)
      if (patient) handlePatientSelect(patient)
    }}>{t}</a> },
    { title: '住院号', dataIndex: 'inpatientNo' },
    { title: '性别', dataIndex: 'gender' },
    { title: '年龄', dataIndex: 'age' },
    { title: '主要诊断', dataIndex: 'mainDiagnosis', ellipsis: true },
    { title: '主治医生', dataIndex: 'doctor' },
  ]

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setCurrentStep(1)
    
    // 自动填充病情摘要
    setTimeout(() => {
      form.setFieldsValue({
        summary: `患者${patient.name}，${patient.gender}，${patient.age}岁。主要诊断：${patient.mainDiagnosis}。`
      })
    }, 300)
    
    // 自动同步 HIS 数据
    setTimeout(() => {
      handleHISDataSync(patient)
    }, 600)
    
    message.success(`已选择患者：${patient.name}，系统将自动填充病情摘要并同步 HIS 数据`)
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

  // 计算专家与患者的匹配度
  const calculateMatchScore = (patient: Patient, expert: Expert): number => {
    const diagnosis = patient.mainDiagnosis.toLowerCase()
    const specialty = expert.specialty.toLowerCase()
    
    // 基础匹配分
    let score = 50
    
    // 关键词匹配
    const keywords = diagnosis.split(/[,\s]+/).filter(k => k.length > 1)
    keywords.forEach(keyword => {
      if (specialty.includes(keyword)) {
        score += 10
      }
    })
    
    // 科室匹配
    if (expert.department.includes('肿瘤') && diagnosis.includes('癌')) {
      score += 15
    }
    if (expert.department.includes('胸外') && (diagnosis.includes('肺') || diagnosis.includes('食管'))) {
      score += 15
    }
    if (expert.department.includes('消化') && diagnosis.includes('胃') || diagnosis.includes('肠')) {
      score += 15
    }
    
    // 职称加成
    if (expert.title === '主任医师') {
      score += 5
    } else if (expert.title === '副主任医师') {
      score += 3
    }
    
    // 限制最高 95 分
    return Math.min(95, Math.max(30, score))
  }

  // 获取专家从业年限
  const getExpertExperience = (expert: Expert): number => {
    // 根据职称估算从业年限
    if (expert.title === '主任医师') return 15 + Math.floor(Math.random() * 10)
    if (expert.title === '副主任医师') return 8 + Math.floor(Math.random() * 7)
    return 3 + Math.floor(Math.random() * 5)
  }

  // 获取专家会诊次数
  const getConsultationCount = (expert: Expert): number => {
    // 根据职称和状态估算会诊次数
    const base = expert.title === '主任医师' ? 100 : expert.title === '副主任医师' ? 50 : 20
    return base + Math.floor(Math.random() * 50)
  }

  // 获取专家评分
  const getExpertRating = (expert: Expert): string => {
    // 根据职称生成评分
    if (expert.title === '主任医师') return (4.8 + Math.random() * 0.2).toFixed(1)
    if (expert.title === '副主任医师') return (4.5 + Math.random() * 0.3).toFixed(1)
    return (4.2 + Math.random() * 0.3).toFixed(1)
  }

  // 生成匹配原因
  const generateMatchReasons = (expert: Expert, matchScore: number): string[] => {
    const reasons: string[] = []
    
    // 根据匹配分数生成原因
    if (matchScore >= 80) {
      reasons.push('擅长领域与患者病情高度匹配')
      reasons.push('近期有大量相关成功案例')
    } else if (matchScore >= 60) {
      reasons.push('擅长领域与患者病情相关')
      reasons.push('有类似病例诊治经验')
    } else {
      reasons.push('科室方向基本符合')
    }
    
    // 根据职称添加原因
    if (expert.title === '主任医师') {
      reasons.push('资深专家，经验丰富')
    }
    
    // 根据状态添加原因
    if (expert.status === '空闲') {
      reasons.push('当前可接诊，响应及时')
    }
    
    return reasons
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

  // HIS 数据同步
  const handleHISDataSync = async (patient?: Patient) => {
    const targetPatient = patient || selectedPatient
    if (!targetPatient) {
      message.warning('请先选择患者')
      return
    }

    setHisSyncLoading(true)
    try {
      // 模拟 HIS 系统数据同步
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 从患者数据中提取病历资料
      const syncedRecords = {
        chiefComplaint: targetPatient.mainDiagnosis,
        presentIllness: `患者因"${targetPatient.mainDiagnosis}"入院，详细病史...`,
        pastHistory: targetPatient.history?.join('；') || '无特殊既往史',
        auxiliaryExamination: `影像学检查：${targetPatient.imagingExams?.length || 0}项；实验室检查：${targetPatient.labTests?.length || 0}项`,
        hisSyncTime: new Date().toISOString()
      }
      
      setMedicalRecords(syncedRecords)
      setHisDataSynced(true)
      
      // 模拟从 HIS 获取文件
      const hisFiles: UploadedFile[] = [
        {
          id: 'HIS001',
          fileName: '入院记录.pdf',
          fileType: '病历',
          fileSize: 524288,
          uploadTime: new Date().toISOString(),
          uploadUrl: '/his/records/001.pdf',
          fromHIS: true
        },
        {
          id: 'HIS002',
          fileName: 'CT 检查报告.pdf',
          fileType: '检查报告',
          fileSize: 1048576,
          uploadTime: new Date().toISOString(),
          uploadUrl: '/his/reports/ct001.pdf',
          fromHIS: true
        }
      ]
      
      setUploadedFiles(hisFiles)
      message.success('HIS 数据同步成功！已获取病历资料和检查报告')
    } catch (error) {
      console.error('HIS 同步失败:', error)
      message.error('HIS 数据同步失败，请重试')
    } finally {
      setHisSyncLoading(false)
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
    if (uploadedFiles.length === 0 && !hisDataSynced) {
      Modal.confirm({
        title: '未上传材料',
        content: '您还没有上传任何病历资料，确定要提交申请吗？',
        onOk: () => submitApplication(values)
      })
      return
    }
    await submitApplication(values)
  }

  const submitApplication = async (values: any) => {
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

      {/* MDT 来源提示 */}
      {searchParams.get('mdtType') === 'screening' && location.state?.screeningData && (
        <Alert
          type="success"
          message="AI 筛查推荐 MDT"
          description={
            <div>
              <p className="mb-2">
                <strong>来源：</strong>AI 患者 MDT 需求筛查
                <Tag color={location.state.screeningData.level === 'urgent' ? 'red' : 'orange'} className="ml-2">
                  {location.state.screeningData.level === 'urgent' ? '紧急' : '推荐'}
                </Tag>
              </p>
              <p className="mb-1">
                <strong>患者：</strong>{location.state.screeningData.patientName}
              </p>
              <p>
                <strong>AI 建议：</strong>
                <ul className="list-disc list-inside mt-1">
                  {location.state.screeningData.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </p>
            </div>
          }
          showIcon
          className="mb-4"
        />
      )}

      {/* 二次 MDT 提示 */}
      {searchParams.get('mdtType') === 'secondary' && location.state?.followupData && (
        <Alert
          type="warning"
          message="二次 MDT 会诊申请"
          description={
            <div>
              <p className="mb-2">
                <strong>来源：</strong>随访 AI 分析预警
                <Tag color="red" className="ml-2">紧急</Tag>
              </p>
              <p className="mb-1">
                <strong>AI 分析原因：</strong>{location.state.followupData.mdtReason}
              </p>
              <p>
                <strong>紧急程度：</strong>
                <Tag color={
                  location.state.followupData.urgency === 'emergency' ? 'red' :
                  location.state.followupData.urgency === 'urgent' ? 'orange' : 'blue'
                }>
                  {location.state.followupData.urgency === 'emergency' ? '紧急' :
                   location.state.followupData.urgency === 'urgent' ? '较急' : '常规'}
                </Tag>
              </p>
            </div>
          }
          showIcon
          className="mb-4"
        />
      )}

      <Card className="mb-4">
        <Steps
          current={currentStep}
          items={[
            { title: '选择患者', icon: <UserOutlined /> },
            { title: '填写信息', icon: <FileProtectOutlined /> },
            { title: '选择专家', icon: <TeamOutlined /> },
            { title: '确认提交', icon: <CheckCircleOutlined /> },
          ]}
        />
      </Card>

      {currentStep === 0 && (
        <Card title="选择患者">
          <div className="mb-4 flex justify-between items-center">
            <Input.Search 
              placeholder="搜索患者姓名/住院号" 
              allowClear 
              style={{ width: 300 }}
              onSearch={(val) => {
                if (!val) return
                const patient = mockPatients.find(p =>
                  p.name.includes(val) || p.inpatientNo.includes(val)
                )
                if (patient) {
                  handlePatientSelect(patient)
                } else {
                  message.warning('未找到患者')
                }
              }}
            />
            <Button 
              type="primary" 
              icon={<ThunderboltOutlined />} 
              onClick={() => {
                navigate('/followup/list')
              }}
            >
              从随访列表选择
            </Button>
          </div>
          
          <Table
            rowKey="id"
            columns={patientColumns}
            dataSource={mockPatients}
            onRow={(record) => ({
              onClick: () => handlePatientSelect(record)
            })}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}

      {currentStep === 1 && selectedPatient && (
        <div className="space-y-4">
          <Card title="患者信息">
            <PatientInfo
              patientId={selectedPatient.id}
              patientName={selectedPatient.name}
              patientInpatientNo={selectedPatient.inpatientNo}
              compact={true}
            />
          </Card>

            <Card title="会诊信息">
              <Form form={form} layout="vertical">
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="会诊类型" name="type" initialValue="院内">
                      <Select options={[{ value: '院内', label: '院内会诊' }, { value: '远程', label: '远程会诊' }]} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="紧急程度" name="urgency" initialValue="普通">
                      <Select options={[
                        { value: '普通', label: '普通' },
                        { value: '紧急', label: '紧急' },
                        { value: '特急', label: '特大' },
                      ]} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
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
                </Row>
              </Form>
            </Card>

            <Card 
              title={
                <Space>
                  <span>病历资料</span>
                  {hisDataSynced && (
                    <Space>
                      <Tag color="green" icon={<CheckCircleOutlined />}>
                        HIS 已同步 {new Date(medicalRecords.hisSyncTime).toLocaleString()}
                      </Tag>
                      <Button
                        type="primary"
                        icon={<SyncOutlined spin={hisSyncLoading} />}
                        onClick={() => handleHISDataSync()}
                        loading={hisSyncLoading}
                        size="small"
                      >
                        重新同步
                      </Button>
                    </Space>
                  )}
                </Space>
              }
            >
              <MaterialUpload
                patient={selectedPatient}
                uploadedFiles={uploadedFiles}
                medicalRecords={medicalRecords}
                onFilesChange={setUploadedFiles}
                onMedicalRecordsChange={setMedicalRecords}
                hisDataSynced={hisDataSynced}
                onHISDataSync={handleHISDataSync}
              />
            </Card>

            <div className="flex justify-between">
              <Button onClick={() => setCurrentStep(0)}>上一步</Button>
              <Button type="primary" onClick={() => setCurrentStep(2)}>下一步</Button>
            </div>
          </div>
        )}

      {currentStep === 2 && selectedPatient && (
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
          </div>
          
          <Alert
            type="info"
            message="专家推荐说明"
            description="基于患者病情、专家专长、历史案例、可用时间等多维度进行智能匹配，推荐最合适的专家组合。匹配度越高表示专家越适合该病例。"
            showIcon
            className="mb-4"
            closable
          />
          
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <div className="flex items-center justify-between mb-2">
                <Title level={5} className="mb-0">可选专家</Title>
                <Button
                  type="primary"
                  size="small"
                  icon={<ThunderboltOutlined />}
                  onClick={() => {
                    message.success('已重新计算匹配度')
                    // 强制刷新匹配度
                    window.dispatchEvent(new Event('storage'))
                  }}
                >
                  重新匹配
                </Button>
              </div>
              <List
                dataSource={mockExperts}
                renderItem={(expert) => {
                  // 计算匹配度（基于患者诊断和专家擅长）
                  const matchScore = selectedPatient ? calculateMatchScore(selectedPatient, expert) : 0
                  const matchReasons = generateMatchReasons(expert, matchScore)
                  const recentCases = getConsultationCount(expert) > 100 ? Math.floor(getConsultationCount(expert) / 10) : Math.floor(getConsultationCount(expert) / 20)
                  const successRate = expert.title === '主任医师' ? 95 + Math.random() * 4 : expert.title === '副主任医师' ? 90 + Math.random() * 5 : 85 + Math.random() * 5
                  
                  return (
                    <List.Item
                      className="p-4 hover:bg-gray-50"
                      actions={[
                        <Button 
                          key="add" 
                          type="primary" 
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => handleExpertSelect(expert)}
                          disabled={expert.status === '离线' || !!selectedExperts.find(e => e.id === expert.id)}
                        >
                          {expert.status === '离线' ? '暂不可用' : selectedExperts.find(e => e.id === expert.id) ? '已添加' : '邀请'}
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <div className="relative">
                            <Avatar className="!bg-medical-blue" size={48}>{expert.name[0]}</Avatar>
                            {matchScore >= 80 && (
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
                            {matchScore >= 80 && <Tag color="red">高匹配</Tag>}
                          </Space>
                        }
                        description={
                          <div className="space-y-2">
                            <Text type="secondary">{expert.specialty}</Text>
                            
                            <div className="flex items-center gap-4 mt-2">
                              <div className="flex items-center gap-1">
                                <Text type="secondary" className="text-xs">匹配度：</Text>
                                <Progress 
                                  percent={matchScore} 
                                  size="small" 
                                  style={{ width: 100 }}
                                  strokeColor={
                                    matchScore >= 80 ? '#52c41a' :
                                    matchScore >= 60 ? '#1890ff' :
                                    matchScore >= 40 ? '#faad14' : '#ff4d4f'
                                  }
                                />
                              </div>
                              <Tag color={expert.status === '空闲' ? 'green' : expert.status === '忙碌' ? 'orange' : 'default'}>
                                {expert.status}
                              </Tag>
                            </div>
                            
                            <div className="mt-2">
                              <Text type="secondary" className="text-xs">匹配原因：</Text>
                              <ul className="mt-1 space-y-1">
                                {matchReasons.map((reason, idx) => (
                                  <li key={idx} className="text-xs text-gray-600">• {reason}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="flex gap-4 mt-2 text-xs">
                              <Space>
                                <Text type="secondary">从业：</Text>
                                <Text strong>{getExpertExperience(expert)}年</Text>
                              </Space>
                              <Space>
                                <Text type="secondary">近期案例：</Text>
                                <Text strong>{recentCases}例</Text>
                              </Space>
                              <Space>
                                <Text type="secondary">成功率：</Text>
                                <Text strong className="text-green-600">{successRate.toFixed(1)}%</Text>
                              </Space>
                              <Space>
                                <Text type="secondary">评分：</Text>
                                <span className="text-yellow-500">★</span>
                                <Text strong>{getExpertRating(expert)}</Text>
                              </Space>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )
                }}
              />
            </Col>
            <Col span={8}>
              <Title level={5}>已选专家 ({selectedExperts.length})</Title>
              {selectedExperts.length > 0 ? (
                <Card size="small" className="bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <Text strong>邀请列表</Text>
                    <Button 
                      type="link" 
                      onClick={() => setSelectedExperts([])} 
                      danger 
                      size="small"
                      disabled={selectedExperts.length === 0}
                    >
                      清空全部
                    </Button>
                  </div>
                  <List
                    dataSource={selectedExperts}
                    size="small"
                    renderItem={(expert) => {
                      const matchScore = selectedPatient ? calculateMatchScore(selectedPatient, expert) : 0
                      return (
                        <List.Item
                          className="bg-white rounded mb-2"
                          actions={[
                            <Button 
                              key="remove" 
                              danger 
                              size="small" 
                              onClick={() => handleRemoveExpert(expert.id)}
                            >
                              移除
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar className="!bg-medical-blue" size={40}>
                                {expert.name[0]}
                              </Avatar>
                            }
                            title={
                              <div className="flex items-center gap-2">
                                <Text strong>{expert.name}</Text>
                                <Tag color={expert.title === '主任医师' ? 'gold' : 'blue'}>
                                  {expert.title}
                                </Tag>
                              </div>
                            }
                            description={
                              <div className="space-y-1 mt-1">
                                <div className="text-xs">
                                  <Text type="secondary">科室：</Text>
                                  <Tag>{expert.department}</Tag>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <Text type="secondary">匹配度：</Text>
                                  <Progress 
                                    percent={matchScore} 
                                    size="small" 
                                    style={{ width: 80 }}
                                    strokeColor={
                                      matchScore >= 80 ? '#52c41a' :
                                      matchScore >= 60 ? '#1890ff' :
                                      matchScore >= 40 ? '#faad14' : '#ff4d4f'
                                    }
                                  />
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      )
                    }}
                  />
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                      <Text type="secondary">共 {selectedExperts.length} 位专家</Text>
                      <Space>
                        <Text type="secondary">科室分布：</Text>
                        <Tag color="blue">{Array.from(new Set(selectedExperts.map(e => e.department))).length} 个</Tag>
                      </Space>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card size="small" className="bg-gray-50 border border-gray-200">
                  <div className="text-center py-8">
                    <UserAddOutlined className="text-4xl text-gray-300 mb-2" />
                    <Text type="secondary">暂无已选专家</Text>
                    <div className="text-xs text-gray-400 mt-2">
                      请点击左侧专家卡片中的"邀请"按钮
                    </div>
                  </div>
                </Card>
              )}
            </Col>
          </Row>
          <div className="flex justify-between mt-4">
            <Button onClick={() => setCurrentStep(1)}>上一步</Button>
            <Button type="primary" onClick={() => setCurrentStep(3)} disabled={selectedExperts.length === 0}>
              下一步
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 3 && selectedPatient && (
        <Card 
          title={
            <Space>
              <CheckCircleOutlined className="text-green-500" />
              <span>确认提交</span>
            </Space>
          }
        >
          <div className="space-y-4">
            {/* 患者信息 */}
            <Card 
              type="inner" 
              title={
                <Space>
                  <UserOutlined />
                  <span>患者信息</span>
                </Space>
              }
              size="small"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text type="secondary" className="text-xs">姓名：</Text>
                  <Text strong>{selectedPatient?.name}</Text>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">住院号：</Text>
                  <Text strong>{selectedPatient?.inpatientNo}</Text>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">性别：</Text>
                  <Text>{selectedPatient?.gender}</Text>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">年龄：</Text>
                  <Text>{selectedPatient?.age}岁</Text>
                </div>
                <div className="col-span-2">
                  <Text type="secondary" className="text-xs">主要诊断：</Text>
                  <Tag color="blue">{selectedPatient?.mainDiagnosis}</Tag>
                </div>
              </div>
            </Card>

            {/* 会诊信息 */}
            <Card 
              type="inner" 
              title={
                <Space>
                  <FileTextOutlined />
                  <span>会诊信息</span>
                </Space>
              }
              size="small"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text type="secondary" className="text-xs">会诊类型：</Text>
                  <Tag>{form.getFieldValue('type') || '多学科会诊'}</Tag>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">紧急程度：</Text>
                  <Tag color={
                    form.getFieldValue('urgency') === '紧急' ? 'red' :
                    form.getFieldValue('urgency') === '较急' ? 'orange' : 'green'
                  }>
                    {form.getFieldValue('urgency') || '常规'}
                  </Tag>
                </div>
                <div className="col-span-2">
                  <Text type="secondary" className="text-xs">期望会诊时间：</Text>
                  <Text strong className="text-base">
                    {form.getFieldValue('expectTime') ? 
                      form.getFieldValue('expectTime').format('YYYY-MM-DD HH:mm') : 
                      <Text type="warning">未设置</Text>
                    }
                  </Text>
                </div>
                <div className="col-span-2">
                  <Text type="secondary" className="text-xs">病情摘要：</Text>
                  <div className="mt-1 p-3 bg-gray-50 rounded border border-gray-200">
                    <Text className="text-sm">{form.getFieldValue('summary') || '无'}</Text>
                  </div>
                </div>
              </div>
            </Card>

            {/* 邀请专家 */}
            <Card 
              type="inner" 
              title={
                <Space>
                  <TeamOutlined />
                  <span>邀请专家 ({selectedExperts.length}位)</span>
                </Space>
              }
              size="small"
            >
              <div className="space-y-2">
                {selectedExperts.map((expert, index) => {
                  const matchScore = calculateMatchScore(selectedPatient, expert)
                  return (
                    <div 
                      key={expert.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                    >
                      <Space>
                        <Avatar className="!bg-medical-blue" size={32}>
                          {expert.name[0]}
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <Text strong>{expert.name}</Text>
                            <Tag color={expert.title === '主任医师' ? 'gold' : 'blue'}>
                              {expert.title}
                            </Tag>
                            <Tag>{expert.department}</Tag>
                            {matchScore >= 80 && <Tag color="red">高匹配</Tag>}
                          </div>
                          <div className="text-xs text-gray-500">
                            <Text type="secondary">擅长：</Text>
                            <Text className="text-xs">{expert.specialty}</Text>
                          </div>
                        </div>
                      </Space>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs text-gray-500">匹配度</div>
                          <Progress 
                            percent={matchScore} 
                            size="small" 
                            style={{ width: 80 }}
                            strokeColor={
                              matchScore >= 80 ? '#52c41a' :
                              matchScore >= 60 ? '#1890ff' :
                              matchScore >= 40 ? '#faad14' : '#ff4d4f'
                            }
                            format={(percent) => `${percent}%`}
                          />
                        </div>
                        <Button 
                          size="small" 
                          danger 
                          onClick={() => {
                            handleRemoveExpert(expert.id)
                            message.warning('已移除该专家，请确认后再提交')
                          }}
                        >
                          移除
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* 提交提示 */}
            <Alert
              type="success"
              message="提交确认"
              description="提交后将通知各位专家进行会诊确认，请确保以上信息准确无误。"
              showIcon
              className="mt-4"
            />

            <div className="flex justify-between pt-4 border-t border-gray-200">
              <Button onClick={() => setCurrentStep(2)}>上一步</Button>
              <Button 
                type="primary" 
                onClick={handleSubmit} 
                className="!bg-medical-blue"
                icon={<CheckCircleOutlined />}
              >
                确认提交申请
              </Button>
            </div>
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
                            {expert.matchReasons?.map((reason, idx) => (
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

      <Drawer
        title="患者信息"
        placement="right"
        width={1200}
        open={patientDrawerVisible}
        onClose={() => setPatientDrawerVisible(false)}
      >
        {selectedPatient && (
          <PatientInfo
            patientId={selectedPatient.id}
            patientName={selectedPatient.name}
            patientInpatientNo={selectedPatient.inpatientNo}
            compact={false}
          />
        )}
      </Drawer>
    </div>
  )
}