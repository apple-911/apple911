import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Descriptions, Tag, List, Avatar, Timeline, Typography, Button, Space, Collapse, Modal, message, Tabs, Progress, Statistic, Table, Badge, Alert, Divider, DescriptionsProps, Spin, Drawer } from 'antd'
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  UserOutlined,
  PhoneOutlined,
  AlertOutlined,
  HistoryOutlined,
  PlusOutlined,
  CameraOutlined,
  PictureOutlined,
  HeartOutlined,
  ScheduleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  FileProtectOutlined,
  ExperimentOutlined,
  AppstoreOutlined,
  FireOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  LineChartOutlined,
  BulbOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { mockPatients, mockConsultations, mockReports, mockFollowupPlans } from '../../mocks/data'
import RiskAssessment from '../../components/RiskAssessment'
import MDTWarningCard from '../../components/MDTWarningCard'
import aiPatientScreeningService, { MDTNecessityAssessment } from '../../services/integration/ai/aiPatientScreeningService'

const { Title, Text, Paragraph } = Typography
const { Panel } = Collapse

export default function Patient360() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('timeline')
  const [showMDTAssessment, setShowMDTAssessment] = useState(false)
  const [mdtAssessment, setMdtAssessment] = useState<MDTNecessityAssessment | null>(null)
  const [loadingMDT, setLoadingMDT] = useState(false)
  const [medicalTeam, setMedicalTeam] = useState([
    { name: '张明华', title: '主任医师', role: '主治医生', dept: '胸外科', phone: '138****1234' },
    { name: '李芳', title: '副主任医师', role: '肿瘤内科', dept: '肿瘤科', phone: '139****5678' },
    { name: '陈伟', title: '主治医师', role: '放疗科', dept: '放疗科', phone: '136****9012' },
    { name: '王丽', title: '护师', role: '责任护士', dept: '胸外科', phone: '135****3456' },
  ])
  
  // 病情趋势分析相关状态
  const [showTrendAnalysis, setShowTrendAnalysis] = useState(false)
  const [trendData, setTrendData] = useState<any>(null)
  const [loadingTrend, setLoadingTrend] = useState(false)
  const [selectedIndicator, setSelectedIndicator] = useState('tumor_marker')
  const [timeRange, setTimeRange] = useState('6m')

  // 按职称排序医生列表（主任医师 > 副主任医师 > 主治医师 > 护师）
  const sortedMedicalTeam = [...medicalTeam].sort((a, b) => {
    const titleRank: Record<string, number> = {
      '主任医师': 4,
      '副主任医师': 3,
      '主治医师': 2,
      '医师': 1,
      '护师': 0,
    }
    return (titleRank[b.title] || 0) - (titleRank[a.title] || 0)
  })

  const patient = mockPatients.find(p => p.id === id)
  const consultations = mockConsultations.filter(c => c.patientId === id)
  const reports = mockReports.filter(r => consultations.some(c => c.id === r.consultationId))
  const followups = mockFollowupPlans.filter(f => f.patientId === id)

  // 加载 MDT 评估数据
  useEffect(() => {
    if (showMDTAssessment && !mdtAssessment) {
      loadMDTAssessment()
    }
  }, [showMDTAssessment])

  const loadMDTAssessment = async () => {
    setLoadingMDT(true)
    try {
      const data = await aiPatientScreeningService.assessMDTNecessity(id!)
      setMdtAssessment(data)
    } catch (error) {
      console.error('加载 MDT 评估失败:', error)
      message.error('加载评估失败')
    } finally {
      setLoadingMDT(false)
    }
  }

  // 加载病情趋势数据
  const loadTrendData = async () => {
    setLoadingTrend(true)
    try {
      // 模拟加载趋势数据
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockTrendData = {
        tumorMarkers: {
          CEA: [
            { date: '2024-01', value: 15.2 },
            { date: '2024-02', value: 12.8 },
            { date: '2024-03', value: 18.5 },
            { date: '2024-04', value: 10.2 },
            { date: '2024-05', value: 8.5 },
            { date: '2024-06', value: 6.8 },
          ],
          CA125: [
            { date: '2024-01', value: 45.3 },
            { date: '2024-02', value: 38.6 },
            { date: '2024-03', value: 52.1 },
            { date: '2024-04', value: 35.2 },
            { date: '2024-05', value: 28.5 },
            { date: '2024-06', value: 22.3 },
          ],
          CA199: [
            { date: '2024-01', value: 120.5 },
            { date: '2024-02', value: 95.3 },
            { date: '2024-03', value: 145.2 },
            { date: '2024-04', value: 78.6 },
            { date: '2024-05', value: 52.3 },
            { date: '2024-06', value: 35.8 },
          ],
        },
        tumorSize: [
          { date: '2024-01', size: 4.5 },
          { date: '2024-02', size: 4.2 },
          { date: '2024-03', size: 3.8 },
          { date: '2024-04', size: 3.2 },
          { date: '2024-05', size: 2.8 },
          { date: '2024-06', size: 2.5 },
        ],
        bloodCounts: {
          WBC: [
            { date: '2024-01', value: 6.5 },
            { date: '2024-02', value: 7.2 },
            { date: '2024-03', value: 5.8 },
            { date: '2024-04', value: 6.8 },
            { date: '2024-05', value: 7.5 },
            { date: '2024-06', value: 6.8 },
          ],
          HGB: [
            { date: '2024-01', value: 115 },
            { date: '2024-02', value: 108 },
            { date: '2024-03', value: 98 },
            { date: '2024-04', value: 105 },
            { date: '2024-05', value: 112 },
            { date: '2024-06', value: 118 },
          ],
          PLT: [
            { date: '2024-01', value: 180 },
            { date: '2024-02', value: 195 },
            { date: '2024-03', value: 165 },
            { date: '2024-04', value: 188 },
            { date: '2024-05', value: 210 },
            { date: '2024-06', value: 195 },
          ],
        },
        liverFunction: {
          ALT: [
            { date: '2024-01', value: 35 },
            { date: '2024-02', value: 42 },
            { date: '2024-03', value: 58 },
            { date: '2024-04', value: 45 },
            { date: '2024-05', value: 32 },
            { date: '2024-06', value: 28 },
          ],
          AST: [
            { date: '2024-01', value: 28 },
            { date: '2024-02', value: 35 },
            { date: '2024-03', value: 48 },
            { date: '2024-04', value: 38 },
            { date: '2024-05', value: 25 },
            { date: '2024-06', value: 22 },
          ],
        },
        qualityOfLife: [
          { date: '2024-01', score: 65 },
          { date: '2024-02', score: 68 },
          { date: '2024-03', score: 62 },
          { date: '2024-04', score: 72 },
          { date: '2024-05', score: 78 },
          { date: '2024-06', score: 82 },
        ],
        treatmentResponse: {
          overall: 'PR', // PR: 部分缓解, CR: 完全缓解, SD: 稳定, PD: 进展
          tumorReduction: 44.4, // 肿瘤缩小百分比
          markerReduction: {
            CEA: 55.3,
            CA125: 50.8,
            CA199: 70.3,
          },
        },
        predictions: {
          progressionFreeSurvival: {
            probability: 0.75,
            median: '8.5 月',
            confidence: '中等',
          },
          overallSurvival: {
            probability: 0.85,
            median: '24.3 月',
            confidence: '中等',
          },
          nextCheckup: '2024-07-15',
          recommendations: [
            '继续当前治疗方案',
            '定期监测肿瘤标志物',
            '关注肝功能变化',
            '加强营养支持',
            '适当运动，提高生活质量',
          ],
        },
      }
      
      setTrendData(mockTrendData)
    } catch (error) {
      console.error('加载趋势数据失败:', error)
      message.error('加载趋势数据失败')
    } finally {
      setLoadingTrend(false)
    }
  }

  if (!patient) {
    return (
      <Card>
        <div className="text-center py-8">
          <Text>未找到患者信息</Text>
          <Button onClick={() => navigate(-1)} className="ml-4">返回</Button>
        </div>
      </Card>
    )
  }

  const timelineItems = [
    { date: '2024-03-01', event: '入院', detail: '因咳嗽伴痰中带血入院' },
    { date: '2024-03-05', event: 'CT检查', detail: '胸部CT：左肺占位性病变' },
    { date: '2024-03-08', event: '病理活检', detail: '支气管镜活检：鳞状细胞癌' },
    { date: '2024-03-15', event: 'MDT会诊', detail: '肺癌MDT讨论，制定治疗方案' },
    { date: '2024-03-20', event: '开始治疗', detail: '开始第一周期化疗' },
    { date: '2024-04-05', event: '随访', detail: '第一次随访复查' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
          <Title level={4} className="!mb-0">患者360视图</Title>
        </Space>
        <Space>
          <Button 
            type="primary" 
            ghost
            icon={<LineChartOutlined />} 
            onClick={() => {
              setShowTrendAnalysis(true)
              loadTrendData()
            }}
          >
            病情趋势分析
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/consultation/apply')}>
            发起新会诊
          </Button>
        </Space>
      </div>

      {/* 患者信息卡片 */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <div className="text-center">
              <div className="flex justify-center items-center gap-3 mb-3">
                <Avatar size={64} icon={<UserOutlined />} style={{ background: '#045126' }} />
                <div className="text-left">
                  <Title level={3} className="!mb-1 !mt-0">{patient.name}</Title>
                  <Space size="small">
                    <Tag>{patient.gender}</Tag>
                    <Tag>{patient.age}岁</Tag>
                    <Tag>A 型血</Tag>
                  </Space>
                </div>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div className="space-y-3 text-left">
                <div>
                  <Text type="secondary" className="text-xs">住院号</Text>
                  <div className="font-medium">{patient.inpatientNo}</div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">联系电话</Text>
                  <div className="font-medium">{patient.phone}</div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">科室</Text>
                  <div><Tag color="blue">{patient.department}</Tag></div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">主治医生</Text>
                  <div className="font-medium">{patient.doctor}</div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">入院时间</Text>
                  <div className="font-medium">{patient.admissionTime}</div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">病区床号</Text>
                  <div className="font-medium">A 区 15 床</div>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">护理级别</Text>
                  <div><Tag color="green">二级护理</Tag></div>
                </div>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">BMI</div>
                  <div className="text-2xl font-bold text-green-600">22.5</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">ECOG</div>
                  <div className="text-2xl font-bold text-blue-600">1 分</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 右侧信息区域 */}
        <Col span={18}>
          <div className="space-y-4">
            {/* AI MDT 评估按钮 */}
            <Card 
              bodyStyle={{ padding: '12px' }}
              className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setShowMDTAssessment(true)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
                    <ThunderboltOutlined className="text-white text-lg" />
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0 }}>
                      AI MDT 需求评估
                    </Title>
                    <Text type="secondary" className="text-xs">
                      点击查看详细评估结果
                    </Text>
                  </div>
                </div>
                <Button 
                  type="primary" 
                  size="small"
                  icon={<ThunderboltOutlined />}
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMDTAssessment(true)
                  }}
                >
                  查看评估
                </Button>
              </div>
            </Card>

            {/* AI MDT 评估详情弹窗 */}
             <Modal
               title={
                 <div className="flex items-center gap-2">
                   <ThunderboltOutlined className="text-yellow-500" />
                   <span>AI MDT 需求评估详情</span>
                 </div>
               }
               open={showMDTAssessment}
               onCancel={() => setShowMDTAssessment(false)}
               footer={[
                 <Button key="close" onClick={() => setShowMDTAssessment(false)}>
                   关闭
                 </Button>,
                 <Button
                   key="apply"
                   type="primary"
                   icon={<TeamOutlined />}
                   onClick={() => {
                     navigate('/consultation/apply')
                     setShowMDTAssessment(false)
                   }}
                 >
                   发起 MDT 会诊
                 </Button>,
               ]}
               width={1000}
               centered
             >
               <div className="space-y-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                 {loadingMDT ? (
                   <div className="flex items-center justify-center py-8">
                     <Spin size="large" tip="加载评估中..." />
                   </div>
                 ) : mdtAssessment ? (
                   <>
                     {/* 患者基本信息 */}
                     <Card
                       title={
                         <Space>
                           <UserOutlined />
                           <Text strong>患者基本信息</Text>
                         </Space>
                       }
                       size="small"
                     >
                       <Descriptions column={3} bordered size="small">
                         <Descriptions.Item label="姓名">
                           {mdtAssessment.patientInfo.name}
                         </Descriptions.Item>
                         <Descriptions.Item label="性别">
                           {mdtAssessment.patientInfo.gender}
                         </Descriptions.Item>
                         <Descriptions.Item label="年龄">
                           {mdtAssessment.patientInfo.age}岁
                         </Descriptions.Item>
                         <Descriptions.Item label="住院号">
                           {mdtAssessment.patientInfo.patientId}
                         </Descriptions.Item>
                         <Descriptions.Item label="科室">
                           {mdtAssessment.patientInfo.department}
                         </Descriptions.Item>
                         <Descriptions.Item label="入院日期">
                           {mdtAssessment.patientInfo.admissionDate}
                         </Descriptions.Item>
                       </Descriptions>
                     </Card>

                     {/* AI 评估结果 */}
                     <Row gutter={[16, 16]}>
                       <Col span={12}>
                         <Card
                           title={
                             <Space>
                               <RobotOutlined />
                               <Text strong>MDT 必要性评估</Text>
                             </Space>
                           }
                           className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100"
                           size="small"
                         >
                           <div className="space-y-3">
                             <div className="flex items-center justify-between">
                               <Text strong>评估结果：</Text>
                               <Tag
                                 color={mdtAssessment.recommendationLevel === '强烈推荐' || mdtAssessment.recommendationLevel === '推荐' ? 'green' : 'red'}
                                 style={{ fontSize: 14, padding: '4px 12px' }}
                               >
                                 {mdtAssessment.recommendationLevel}
                               </Tag>
                             </div>
                             <div>
                               <Text>MDT 评分：</Text>
                               <Progress
                                 percent={mdtAssessment.necessityScore}
                                 strokeColor={{
                                   '0%': '#1890ff',
                                   '100%': '#52c41a',
                                 }}
                                 size="small"
                               />
                             </div>
                             <div>
                               <Text>置信度：</Text>
                               <Progress
                                 percent={mdtAssessment.confidence}
                                 format={(percent) => `${percent}%`}
                                 strokeColor={mdtAssessment.confidence >= 80 ? '#52c41a' : mdtAssessment.confidence >= 60 ? '#fa8c16' : '#ff4d4f'}
                                 size="small"
                               />
                             </div>
                             <Divider style={{ margin: '12px 0' }} />
                             <div className="space-y-2">
                               <div>
                                 <Text strong>推荐类型：</Text>
                                 <Tag color="blue" className="ml-2">{mdtAssessment.recommendedType}</Tag>
                               </div>
                               <div>
                                 <Text strong>紧急程度：</Text>
                                 <Tag color={mdtAssessment.urgency === '紧急' ? 'red' : mdtAssessment.urgency === '常规' ? 'orange' : 'default'} className="ml-2">
                                   {mdtAssessment.urgency}
                                 </Tag>
                               </div>
                               <div>
                                 <Text strong>推荐科室：</Text>
                                 <div className="mt-1">
                                   <Space wrap size="small">
                                     {mdtAssessment.recommendedDepartments.map((dept, i) => (
                                       <Tag key={i} color="blue">{dept}</Tag>
                                     ))}
                                   </Space>
                                 </div>
                               </div>
                             </div>
                           </div>
                         </Card>
                       </Col>

                       <Col span={12}>
                         <Card
                           title={
                             <Space>
                               <ThunderboltOutlined />
                               <Text strong>评估维度</Text>
                             </Space>
                           }
                           className="border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100"
                           size="small"
                         >
                           <div className="space-y-3">
                             <Row gutter={8}>
                               <Col span={8}>
                                 <div className="text-center">
                                   <Text type="secondary" className="text-xs">疾病复杂度</Text>
                                   <div className="mt-1">
                                     <Progress
                                       type="dashboard"
                                       percent={mdtAssessment.assessmentDimensions.diseaseComplexity.score * 10}
                                       strokeColor="#ff4d4f"
                                       format={(percent) => (
                                         <Text strong style={{ fontSize: 14 }}>
                                           {mdtAssessment.assessmentDimensions.diseaseComplexity.score}
                                         </Text>
                                       )}
                                       width={80}
                                       strokeWidth={8}
                                     />
                                   </div>
                                 </div>
                               </Col>
                               <Col span={8}>
                                 <div className="text-center">
                                   <Text type="secondary" className="text-xs">治疗难度</Text>
                                   <div className="mt-1">
                                     <Progress
                                       type="dashboard"
                                       percent={mdtAssessment.assessmentDimensions.treatmentDifficulty.score * 10}
                                       strokeColor="#fa8c16"
                                       format={(percent) => (
                                         <Text strong style={{ fontSize: 14 }}>
                                           {mdtAssessment.assessmentDimensions.treatmentDifficulty.score}
                                         </Text>
                                       )}
                                       width={80}
                                       strokeWidth={8}
                                     />
                                   </div>
                                 </div>
                               </Col>
                               <Col span={8}>
                                 <div className="text-center">
                                   <Text type="secondary" className="text-xs">预后评分</Text>
                                   <div className="mt-1">
                                     <Progress
                                       type="dashboard"
                                       percent={mdtAssessment.assessmentDimensions.prognosis.score * 10}
                                       strokeColor="#722ed1"
                                       format={(percent) => (
                                         <Text strong style={{ fontSize: 14 }}>
                                           {mdtAssessment.assessmentDimensions.prognosis.score}
                                         </Text>
                                       )}
                                       width={80}
                                       strokeWidth={8}
                                     />
                                   </div>
                                 </div>
                               </Col>
                             </Row>
                           </div>
                         </Card>
                       </Col>
                     </Row>

                     {/* 匹配指征 */}
                     <Card
                       title={
                         <Space>
                           <CheckCircleOutlined />
                           <Text strong>MDT 指征匹配</Text>
                         </Space>
                       }
                       size="small"
                     >
                       <Row gutter={16}>
                         <Col span={12}>
                           <div className="space-y-2">
                             <Text strong className="text-green-600">✓ 匹配指征</Text>
                             <List
                               size="small"
                               dataSource={mdtAssessment.indications.matched}
                               renderItem={(item) => (
                                 <List.Item className="!py-2 !px-0">
                                   <List.Item.Meta
                                     title={
                                       <Space>
                                         <Tag color="green">{item.name}</Tag>
                                         <Tag color="blue">{item.category}</Tag>
                                       </Space>
                                     }
                                     description={item.description}
                                   />
                                 </List.Item>
                               )}
                             />
                           </div>
                         </Col>
                         <Col span={12}>
                           <div className="space-y-2">
                             <Text strong className="text-gray-600">○ 未匹配指征</Text>
                             <List
                               size="small"
                               dataSource={mdtAssessment.indications.notMatched.slice(0, 3)}
                               renderItem={(item) => (
                                 <List.Item className="!py-2 !px-0">
                                   <List.Item.Meta
                                     title={
                                       <Space>
                                         <Tag>{item.name}</Tag>
                                         <Tag color="blue">{item.category}</Tag>
                                       </Space>
                                     }
                                     description={item.description}
                                   />
                                 </List.Item>
                               )}
                             />
                           </div>
                         </Col>
                       </Row>
                     </Card>

                     {/* AI 建议 */}
                      <Alert
                        type="success"
                        showIcon
                        icon={<CheckCircleOutlined />}
                        message="AI 建议"
                        description={
                          <div className="space-y-2">
                            <Text>建议尽快组织 MDT 会诊，制定个体化综合治疗方案</Text>
                            <div className="space-y-1">
                              <div className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                <Text>多学科协作可提高诊疗效果</Text>
                              </div>
                              <div className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                <Text>评估手术指征和风险</Text>
                              </div>
                              <div className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                <Text>制定个体化综合治疗方案</Text>
                              </div>
                            </div>
                          </div>
                        }
                        style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}
                      />
                   </>
                 ) : (
                   <Alert
                     type="warning"
                     message="暂无评估数据"
                     description="该患者暂无 AI MDT 需求评估数据"
                     showIcon
                   />
                 )}
               </div>
             </Modal>

            {/* 基本信息 */}
            <Card title="基本信息">
              <Descriptions column={6} size="small">
                <Descriptions.Item label="主要诊断" span={2}>
                  <Tag color="red">{patient.mainDiagnosis}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="临床分期" span={2}>
                  <Tag color="orange">T2N1M0 - IIB 期</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="病理类型" span={2}>
                  <Tag color="blue">鳞状细胞癌</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="过敏史" span={2}>
                  {patient.allergies?.length ? (
                    <Space wrap size="small">
                      {patient.allergies.map(a => <Tag key={a} color="orange">{a}</Tag>)}
                    </Space>
                  ) : <Text type="secondary">无已知过敏</Text>}
                </Descriptions.Item>
                <Descriptions.Item label="既往史" span={4}>
                  {patient.history?.length ? (
                    <Space wrap size="small">
                      {patient.history.map(h => <Tag key={h}>{h}</Tag>)}
                    </Space>
                  ) : '无明显既往史'}
                </Descriptions.Item>
                <Descriptions.Item label="吸烟史" span={2}>
                  <Text>40 包年（已戒 3 年）</Text>
                </Descriptions.Item>
                <Descriptions.Item label="饮酒史" span={2}>
                  <Text>偶尔</Text>
                </Descriptions.Item>
                <Descriptions.Item label="家族史" span={2}>
                  <Text>父亲患肺癌（75 岁）</Text>
                </Descriptions.Item>
                <Descriptions.Item label="基因检测" span={2}>
                  <Space size="small">
                    <Tag color="green">EGFR 野生型</Tag>
                    <Tag color="green">ALK 阴性</Tag>
                    <Tag color="orange">PD-L1: 60%</Tag>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="ECOG 评分" span={2}>
                  <Tag color="blue">1 分</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="BMI" span={2}>
                  <Text>22.5 kg/m²</Text>
                </Descriptions.Item>
                <Descriptions.Item label="血型" span={2}>
                  <Tag>A 型 Rh(+)</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 诊疗团队和入院信息并排 */}
            <Row gutter={16}>
              <Col span={12}>
                <Card title={<><TeamOutlined /> 诊疗团队</>} size="small" className="h-full">
                  <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    <List
                      size="small"
                      dataSource={sortedMedicalTeam}
                      renderItem={(item) => (
                        <List.Item className="!py-2 hover:bg-gray-50">
                          <List.Item.Meta
                            avatar={<Avatar style={{ background: '#045126' }}>{item.name[0]}</Avatar>}
                            title={
                              <div className="flex items-center gap-2">
                                <Text strong>{item.name}</Text>
                                <Text type="secondary" className="text-xs">{item.phone}</Text>
                                <Tag color="blue">{item.title}</Tag>
                              </div>
                            }
                            description={
                              <div className="text-xs text-gray-600">
                                {item.role} · {item.dept}
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card title={<><FileProtectOutlined /> 入院信息</>} size="small" className="h-full">
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="病区">胸外科 A 区</Descriptions.Item>
                    <Descriptions.Item label="床号">15 床</Descriptions.Item>
                    <Descriptions.Item label="费用类别"><Tag color="blue">医保</Tag></Descriptions.Item>
                    <Descriptions.Item label="入院方式">步行入院</Descriptions.Item>
                    <Descriptions.Item label="婚姻状况">已婚</Descriptions.Item>
                    <Descriptions.Item label="联系人">张建国（子）</Descriptions.Item>
                    <Descriptions.Item label="联系人电话">138****1234</Descriptions.Item>
                    <Descriptions.Item label="关系">父子</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>

      <Row gutter={16} className="mt-4">
        <Col span={16}>
          <Card>
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'timeline',
                  label: <span><CalendarOutlined /> 诊疗时间轴</span>,
                  children: (
                    <Row gutter={16}>
                      <Col span={12}>
                        <Card title="时间轴" size="small">
                          <Timeline
                            items={timelineItems.map(item => ({
                              color: item.event === 'MDT 会诊' ? 'blue' : item.event === '开始治疗' ? 'green' : 'gray',
                              children: (
                                <div>
                                  <div className="flex justify-between items-center mb-1">
                                    <Text strong>{item.event}</Text>
                                    <Tag color="blue">{item.date}</Tag>
                                  </div>
                                  <Text type="secondary" className="text-sm">{item.detail}</Text>
                                </div>
                              )
                            }))}
                          />
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card title="治疗里程碑" size="small">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                              <CheckCircleOutlined className="text-green-600 text-lg" />
                              <div>
                                <Text strong className="text-sm">诊断完成</Text>
                                <div className="text-xs text-gray-500">2024-03-08</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-blue-50 rounded">
                              <CheckCircleOutlined className="text-blue-600 text-lg" />
                              <div>
                                <Text strong className="text-sm">MDT 会诊完成</Text>
                                <div className="text-xs text-gray-500">2024-03-15</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-green-50 rounded">
                              <CheckCircleOutlined className="text-green-600 text-lg" />
                              <div>
                                <Text strong className="text-sm">治疗开始</Text>
                                <div className="text-xs text-gray-500">2024-03-20</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                              <ScheduleOutlined className="text-gray-600 text-lg" />
                              <div>
                                <Text strong className="text-sm">下次随访</Text>
                                <div className="text-xs text-gray-500">2024-04-20</div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    </Row>
                  )
                },
            {
              key: 'exams',
              label: <span><PictureOutlined /> 检查报告</span>,
              children: (
                <Collapse>
                  <Panel header={<><FileTextOutlined /> 影像检查 (3)</>} key="image">
                    <List
                      size="small"
                      dataSource={[
                        { name: '胸部 CT 平扫 + 增强', date: '2024-03-05', status: 'normal', hospital: '放射科' },
                        { name: '颅脑 MRI', date: '2024-03-06', status: 'normal', hospital: '放射科' },
                        { name: '腹部 B 超', date: '2024-03-07', status: 'warning', hospital: '超声科' },
                      ]}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button key="view" type="link" size="small">查看报告</Button>,
                            <Button key="image" icon={<PictureOutlined />} size="small">查看影像</Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Badge status={item.status === 'normal' ? 'success' : 'warning'} />}
                            title={item.name}
                            description={
                              <Space size="small">
                                <Tag>{item.date}</Tag>
                                <Tag color="blue">{item.hospital}</Tag>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Panel>
                  <Panel header={<><FileTextOutlined /> 病理检查 (2)</>} key="pathology">
                    <List
                      size="small"
                      dataSource={[
                        { name: '支气管镜活检病理', date: '2024-03-08', result: '鳞状细胞癌', status: 'abnormal' },
                        { name: '免疫组化', date: '2024-03-10', result: 'CK5/6(+), TTF-1(-)', status: 'abnormal' },
                      ]}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button key="view" type="link" size="small">查看报告</Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Badge status={item.status === 'abnormal' ? 'error' : 'success'} />}
                            title={<span className="text-red-600">{item.name}</span>}
                            description={
                              <Space size="small">
                                <Tag>{item.date}</Tag>
                                <Tag color="red">{item.result}</Tag>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Panel>
                  <Panel header={<><ExperimentOutlined /> 检验检查 (5)</>} key="lab">
                    <List
                      size="small"
                      dataSource={[
                        { name: '血常规', date: '2024-03-05', abnormal: false },
                        { name: '肝肾功能', date: '2024-03-05', abnormal: false },
                        { name: '肿瘤标志物', date: '2024-03-06', abnormal: true },
                        { name: '凝血功能', date: '2024-03-07', abnormal: false },
                        { name: '心电图', date: '2024-03-07', abnormal: false },
                      ]}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button key="view" type="link" size="small">查看结果</Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Badge status={item.abnormal ? 'error' : 'success'} />}
                            title={item.name}
                            description={
                              <Space size="small">
                                <Tag>{item.date}</Tag>
                                {item.abnormal && <Tag color="red">异常</Tag>}
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Panel>
                </Collapse>
              )
            },
            {
              key: 'consultations',
              label: <span><MedicineBoxOutlined /> 会诊历史 ({consultations.length})</span>,
              children: (
                <List
                  dataSource={consultations}
                  renderItem={c => (
                    <List.Item
                      actions={[
                        <Button key="view" type="link" size="small" onClick={() => navigate(`/consultation/detail/${c.id}`)}>
                          查看详情
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge 
                            status={c.status === '已完成' ? 'success' : c.status === '进行中' ? 'processing' : 'default'} 
                          />
                        }
                        title={
                          <Space>
                            <Text strong>{c.mainDiagnosis}</Text>
                            <Tag color={c.status === '已完成' ? 'green' : c.status === '进行中' ? 'blue' : 'gray'}>
                              {c.status}
                            </Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Space>
                              <CalendarOutlined className="text-gray-400" />
                              <Text type="secondary">会诊时间：{c.expectTime}</Text>
                            </Space>
                            <Space>
                              <UserOutlined className="text-gray-400" />
                              <Text type="secondary">参与专家：{c.experts.map(e => e.name).join('、')}</Text>
                            </Space>
                            <Space>
                              <FileTextOutlined className="text-gray-400" />
                              <Text type="secondary">会诊结论：{c.conclusion?.summary || '待完善'}</Text>
                            </Space>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )
            },
            {
              key: 'followups',
              label: <span><CalendarOutlined /> 随访计划 ({followups.length})</span>,
              children: (
                <List
                  dataSource={followups}
                  renderItem={f => (
                    <List.Item
                      actions={[
                        <Button key="view" type="link" size="small">查看详情</Button>,
                        <Button key="edit" type="link" size="small">编辑</Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Badge 
                            status={f.status === '进行中' ? 'processing' : f.status === '已完成' ? 'success' : 'default'} 
                          />
                        }
                        title={
                          <Space>
                            <Text strong>{f.purpose}</Text>
                            <Tag color={f.status === '进行中' ? 'green' : 'gray'}>{f.status}</Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Space>
                              <CalendarOutlined className="text-gray-400" />
                              <Text type="secondary">计划周期：{f.startDate} 至 {f.endDate}</Text>
                            </Space>
                            <Space>
                              <ScheduleOutlined className="text-gray-400" />
                              <Text type="secondary">下次随访：{f.nextFollowup}</Text>
                            </Space>
                            <Space>
                              <UserOutlined className="text-gray-400" />
                              <Text type="secondary">负责医生：{f.doctor}</Text>
                            </Space>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )
            },
          ]}
        />
      </Card>
    </Col>
    <Col span={8}>
      {/* 生命体征趋势 */}
      <Card title={<><HeartOutlined className="mr-2" />生命体征趋势</>} className="mb-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Text><HeartOutlined className="mr-2 text-red-500" />心率</Text>
            <Statistic value={82} suffix="次/分" valueStyle={{ fontSize: '18px' }} />
          </div>
          <Progress 
            percent={82} 
            strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
            format={() => '正常范围：60-100'}
            size="small"
          />
          
          <Divider style={{ margin: '12px 0' }} />
          
          <div className="flex justify-between items-center">
            <Text><FireOutlined className="mr-2 text-orange-500" />体温</Text>
            <Statistic value={36.5} suffix="℃" valueStyle={{ fontSize: '18px' }} />
          </div>
          <Progress 
            percent={100} 
            strokeColor="#faad14"
            format={() => '正常范围：36.0-37.0'}
            size="small"
          />
          
          <Divider style={{ margin: '12px 0' }} />
          
          <div className="flex justify-between items-center">
            <Text><AlertOutlined className="mr-2 text-blue-500" />血压</Text>
            <Statistic value={130} suffix="/85 mmHg" valueStyle={{ fontSize: '18px' }} />
          </div>
          <Alert 
            message="血压控制良好" 
            type="success" 
            showIcon 
            style={{ fontSize: '12px' }}
          />
        </div>
      </Card>

      {/* 用药情况 */}
      <Card title={<><AppstoreOutlined className="mr-2" />当前用药</>} className="mb-4">
        <List
          size="small"
          dataSource={[
            { name: '紫杉醇', dosage: '135mg/m²', frequency: 'D1', status: 'using' },
            { name: '卡铂', dosage: 'AUC 5', frequency: 'D1', status: 'using' },
            { name: '地塞米松', dosage: '10mg', frequency: 'D1-3', status: 'using' },
          ]}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                avatar={<Badge status={item.status === 'using' ? 'processing' : 'default'} />}
                title={<span className="text-sm">{item.name} {item.dosage}</span>}
                description={<span className="text-xs text-gray-500">{item.frequency}</span>}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* 检验指标趋势 */}
      <Card title={<><ExperimentOutlined className="mr-2" />检验指标趋势</>} className="mb-4">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <Text className="text-sm">白细胞 (WBC)</Text>
              <Text className="text-sm text-blue-600">6.5 → 7.2 → 6.8</Text>
            </div>
            <Progress percent={68} strokeColor="#1890ff" size="small" showInfo={false} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <Text className="text-sm">血红蛋白 (HGB)</Text>
              <Text className="text-sm text-red-600">115 → 108 → 112</Text>
            </div>
            <Progress percent={75} strokeColor="#ff4d4f" size="small" showInfo={false} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <Text className="text-sm">血小板 (PLT)</Text>
              <Text className="text-sm text-green-600">180 → 195 → 188</Text>
            </div>
            <Progress percent={82} strokeColor="#52c41a" size="small" showInfo={false} />
          </div>
        </div>
      </Card>

      <RiskAssessment
        patientId={patient.id}
        age={patient.age}
        diagnosis={patient.diagnosis}
        comorbidities={patient.history}
        vitalSigns={{
          bloodPressure: '130/85 mmHg',
          heartRate: 82,
          temperature: 36.5,
          spo2: 96,
        }}
        labResults={{
          wbc: 6.5,
          hemoglobin: 115,
          platelets: 180,
        }}
        performanceStatus={1}
      />
    </Col>
  </Row>

  {/* 病情趋势分析抽屉 */}
  <Drawer
    title={
      <Space>
        <LineChartOutlined style={{ color: '#1890ff' }} />
        <span>AI 病情趋势分析</span>
      </Space>
    }
    placement="right"
    width={900}
    open={showTrendAnalysis}
    onClose={() => {
      setShowTrendAnalysis(false)
      setTrendData(null)
    }}
  >
    {loadingTrend ? (
      <div className="text-center py-20">
        <Spin size="large" />
        <div className="mt-4">
          <Text type="secondary">正在分析病情趋势...</Text>
        </div>
      </div>
    ) : trendData ? (
      <>
        {/* 治疗效果总览 */}
        <Card className="mb-4">
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="治疗效果"
                value={trendData.treatmentResponse.overall === 'PR' ? '部分缓解' : 
                       trendData.treatmentResponse.overall === 'CR' ? '完全缓解' :
                       trendData.treatmentResponse.overall === 'SD' ? '稳定' : '进展'}
                valueStyle={{ 
                  color: trendData.treatmentResponse.overall === 'PR' || trendData.treatmentResponse.overall === 'CR' ? '#52c41a' : '#faad14',
                  fontSize: '24px'
                }}
                prefix={<CheckCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="肿瘤缩小"
                value={trendData.treatmentResponse.tumorReduction}
                suffix="%"
                valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                prefix={<FallOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="无进展生存期"
                value={trendData.predictions.progressionFreeSurvival.median}
                valueStyle={{ fontSize: '24px' }}
                prefix={<ClockCircleOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="总生存期"
                value={trendData.predictions.overallSurvival.median}
                valueStyle={{ fontSize: '24px' }}
                prefix={<CalendarOutlined />}
              />
            </Col>
          </Row>
        </Card>

        <Tabs
          defaultActiveKey="tumor_marker"
          items={[
            {
              key: 'tumor_marker',
              label: '肿瘤标志物趋势',
              children: (
                <div className="space-y-4">
                  <Alert
                    type="info"
                    message="肿瘤标志物变化趋势"
                    description="显示患者近 6 个月的肿瘤标志物变化情况，数值下降表示治疗效果良好。"
                    showIcon
                  />
                  
                  <Row gutter={16}>
                    <Col span={8}>
                      <Card title="CEA" size="small">
                        <div className="space-y-2">
                          {trendData.tumorMarkers.CEA.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between">
                              <Text type="secondary">{item.date}</Text>
                              <Text strong className={
                                idx > 0 && item.value < trendData.tumorMarkers.CEA[idx-1].value 
                                  ? 'text-green-600' 
                                  : idx > 0 && item.value > trendData.tumorMarkers.CEA[idx-1].value 
                                    ? 'text-red-600' 
                                    : ''
                              }>
                                {item.value} ng/mL
                                {idx > 0 && item.value < trendData.tumorMarkers.CEA[idx-1].value && 
                                  <FallOutlined className="ml-1" />
                                }
                              </Text>
                            </div>
                          ))}
                        </div>
                        <Divider />
                        <div className="text-center">
                          <Progress 
                            type="circle" 
                            percent={trendData.treatmentResponse.markerReduction.CEA} 
                            format={(percent) => `下降 ${percent}%`}
                            strokeColor="#52c41a"
                            size={80}
                          />
                        </div>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card title="CA125" size="small">
                        <div className="space-y-2">
                          {trendData.tumorMarkers.CA125.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between">
                              <Text type="secondary">{item.date}</Text>
                              <Text strong className={
                                idx > 0 && item.value < trendData.tumorMarkers.CA125[idx-1].value 
                                  ? 'text-green-600' 
                                  : idx > 0 && item.value > trendData.tumorMarkers.CA125[idx-1].value 
                                    ? 'text-red-600' 
                                    : ''
                              }>
                                {item.value} U/mL
                                {idx > 0 && item.value < trendData.tumorMarkers.CA125[idx-1].value && 
                                  <FallOutlined className="ml-1" />
                                }
                              </Text>
                            </div>
                          ))}
                        </div>
                        <Divider />
                        <div className="text-center">
                          <Progress 
                            type="circle" 
                            percent={trendData.treatmentResponse.markerReduction.CA125} 
                            format={(percent) => `下降 ${percent}%`}
                            strokeColor="#52c41a"
                            size={80}
                          />
                        </div>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card title="CA199" size="small">
                        <div className="space-y-2">
                          {trendData.tumorMarkers.CA199.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between">
                              <Text type="secondary">{item.date}</Text>
                              <Text strong className={
                                idx > 0 && item.value < trendData.tumorMarkers.CA199[idx-1].value 
                                  ? 'text-green-600' 
                                  : idx > 0 && item.value > trendData.tumorMarkers.CA199[idx-1].value 
                                    ? 'text-red-600' 
                                    : ''
                              }>
                                {item.value} U/mL
                                {idx > 0 && item.value < trendData.tumorMarkers.CA199[idx-1].value && 
                                  <FallOutlined className="ml-1" />
                                }
                              </Text>
                            </div>
                          ))}
                        </div>
                        <Divider />
                        <div className="text-center">
                          <Progress 
                            type="circle" 
                            percent={trendData.treatmentResponse.markerReduction.CA199} 
                            format={(percent) => `下降 ${percent}%`}
                            strokeColor="#52c41a"
                            size={80}
                          />
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: 'tumor_size',
              label: '肿瘤大小变化',
              children: (
                <div className="space-y-4">
                  <Alert
                    type="success"
                    message="肿瘤缩小趋势"
                    description="通过影像学检查测量的肿瘤最大径变化，显示肿瘤对治疗的响应情况。"
                    showIcon
                  />
                  
                  <Card>
                    <div className="space-y-3">
                      {trendData.tumorSize.map((item: any, idx: number) => (
                        <div key={idx}>
                          <div className="flex justify-between mb-2">
                            <Text strong>{item.date}</Text>
                            <Space>
                              <Text className="text-2xl font-bold text-blue-600">{item.size} cm</Text>
                              {idx > 0 && (
                                <Tag color={
                                  item.size < trendData.tumorSize[idx-1].size ? 'green' :
                                  item.size > trendData.tumorSize[idx-1].size ? 'red' : 'default'
                                }>
                                  {item.size < trendData.tumorSize[idx-1].size ? '↓' : 
                                   item.size > trendData.tumorSize[idx-1].size ? '↑' : '→'}
                                  {Math.abs(((item.size - trendData.tumorSize[idx-1].size) / trendData.tumorSize[idx-1].size * 100)).toFixed(1)}%
                                </Tag>
                              )}
                            </Space>
                          </div>
                          <Progress 
                            percent={(item.size / 5) * 100} 
                            strokeColor={{
                              '0%': '#ff4d4f',
                              '50%': '#faad14',
                              '100%': '#52c41a',
                            }}
                            showInfo={false}
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Card>
                        <Statistic
                          title="初始肿瘤大小"
                          value={trendData.tumorSize[0].size}
                          suffix="cm"
                          valueStyle={{ color: '#ff4d4f' }}
                        />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card>
                        <Statistic
                          title="当前肿瘤大小"
                          value={trendData.tumorSize[trendData.tumorSize.length - 1].size}
                          suffix="cm"
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: 'blood_test',
              label: '血液指标',
              children: (
                <div className="space-y-4">
                  <Alert
                    type="info"
                    message="血液指标监测"
                    description="定期监测血常规和肝肾功能，评估治疗安全性和患者耐受性。"
                    showIcon
                  />
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Card title="血常规" size="small">
                        <div className="space-y-4">
                          <div>
                            <Text strong className="block mb-2">白细胞 (WBC)</Text>
                            <div className="space-y-1">
                              {trendData.bloodCounts.WBC.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <Text type="secondary">{item.date}</Text>
                                  <Text className={item.value < 4 ? 'text-red-600' : item.value > 10 ? 'text-orange-600' : 'text-green-600'}>
                                    {item.value} × 10⁹/L
                                  </Text>
                                </div>
                              ))}
                            </div>
                          </div>
                          <Divider />
                          <div>
                            <Text strong className="block mb-2">血红蛋白 (HGB)</Text>
                            <div className="space-y-1">
                              {trendData.bloodCounts.HGB.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <Text type="secondary">{item.date}</Text>
                                  <Text className={item.value < 110 ? 'text-red-600' : 'text-green-600'}>
                                    {item.value} g/L
                                  </Text>
                                </div>
                              ))}
                            </div>
                          </div>
                          <Divider />
                          <div>
                            <Text strong className="block mb-2">血小板 (PLT)</Text>
                            <div className="space-y-1">
                              {trendData.bloodCounts.PLT.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <Text type="secondary">{item.date}</Text>
                                  <Text className={item.value < 100 ? 'text-red-600' : 'text-green-600'}>
                                    {item.value} × 10⁹/L
                                  </Text>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card title="肝功能" size="small">
                        <div className="space-y-4">
                          <div>
                            <Text strong className="block mb-2">ALT (谷丙转氨酶)</Text>
                            <div className="space-y-1">
                              {trendData.liverFunction.ALT.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <Text type="secondary">{item.date}</Text>
                                  <Text className={item.value > 40 ? 'text-red-600' : 'text-green-600'}>
                                    {item.value} U/L
                                  </Text>
                                </div>
                              ))}
                            </div>
                          </div>
                          <Divider />
                          <div>
                            <Text strong className="block mb-2">AST (谷草转氨酶)</Text>
                            <div className="space-y-1">
                              {trendData.liverFunction.AST.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <Text type="secondary">{item.date}</Text>
                                  <Text className={item.value > 40 ? 'text-red-600' : 'text-green-600'}>
                                    {item.value} U/L
                                  </Text>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: 'quality_of_life',
              label: '生活质量',
              children: (
                <div className="space-y-4">
                  <Alert
                    type="info"
                    message="生活质量评估"
                    description="基于EORTC QLQ-C30量表评估患者生活质量，分数越高表示生活质量越好。"
                    showIcon
                  />
                  
                  <Card>
                    <div className="space-y-3">
                      {trendData.qualityOfLife.map((item: any, idx: number) => (
                        <div key={idx}>
                          <div className="flex justify-between mb-2">
                            <Text strong>{item.date}</Text>
                            <Space>
                              <Text className="text-2xl font-bold" style={{
                                color: item.score >= 80 ? '#52c41a' : 
                                       item.score >= 60 ? '#1890ff' : 
                                       item.score >= 40 ? '#faad14' : '#ff4d4f'
                              }}>
                                {item.score} 分
                              </Text>
                              {idx > 0 && (
                                <Tag color={
                                  item.score > trendData.qualityOfLife[idx-1].score ? 'green' :
                                  item.score < trendData.qualityOfLife[idx-1].score ? 'red' : 'default'
                                }>
                                  {item.score > trendData.qualityOfLife[idx-1].score ? '↑' : 
                                   item.score < trendData.qualityOfLife[idx-1].score ? '↓' : '→'}
                                  {Math.abs(item.score - trendData.qualityOfLife[idx-1].score)} 分
                                </Tag>
                              )}
                            </Space>
                          </div>
                          <Progress 
                            percent={item.score} 
                            strokeColor={{
                              '0%': '#ff4d4f',
                              '50%': '#faad14',
                              '100%': '#52c41a',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </Card>
                  
                  <Row gutter={16}>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="初始评分"
                          value={trendData.qualityOfLife[0].score}
                          suffix="分"
                          valueStyle={{ color: '#faad14' }}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="当前评分"
                          value={trendData.qualityOfLife[trendData.qualityOfLife.length - 1].score}
                          suffix="分"
                          valueStyle={{ color: '#52c41a' }}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="提升幅度"
                          value={trendData.qualityOfLife[trendData.qualityOfLife.length - 1].score - trendData.qualityOfLife[0].score}
                          suffix="分"
                          valueStyle={{ color: '#52c41a' }}
                          prefix={<RiseOutlined />}
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>
              ),
            },
            {
              key: 'predictions',
              label: 'AI 预测分析',
              children: (
                <div className="space-y-4">
                  <Alert
                    type="warning"
                    message="AI 预测说明"
                    description="以下预测结果基于机器学习模型，仅供参考，不能替代医生的专业判断。"
                    showIcon
                  />
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Card title="无进展生存期预测" className="h-full">
                        <div className="text-center py-4">
                          <Progress 
                            type="circle" 
                            percent={trendData.predictions.progressionFreeSurvival.probability * 100}
                            format={(percent) => (
                              <div>
                                <div className="text-2xl font-bold">{percent?.toFixed(0)}%</div>
                                <div className="text-sm text-gray-500">概率</div>
                              </div>
                            )}
                            strokeColor="#52c41a"
                            size={120}
                          />
                          <Divider />
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Text type="secondary">中位生存期：</Text>
                              <Text strong>{trendData.predictions.progressionFreeSurvival.median}</Text>
                            </div>
                            <div className="flex justify-between">
                              <Text type="secondary">置信度：</Text>
                              <Tag color="blue">{trendData.predictions.progressionFreeSurvival.confidence}</Tag>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card title="总生存期预测" className="h-full">
                        <div className="text-center py-4">
                          <Progress 
                            type="circle" 
                            percent={trendData.predictions.overallSurvival.probability * 100}
                            format={(percent) => (
                              <div>
                                <div className="text-2xl font-bold">{percent?.toFixed(0)}%</div>
                                <div className="text-sm text-gray-500">概率</div>
                              </div>
                            )}
                            strokeColor="#1890ff"
                            size={120}
                          />
                          <Divider />
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Text type="secondary">中位生存期：</Text>
                              <Text strong>{trendData.predictions.overallSurvival.median}</Text>
                            </div>
                            <div className="flex justify-between">
                              <Text type="secondary">置信度：</Text>
                              <Tag color="blue">{trendData.predictions.overallSurvival.confidence}</Tag>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                  
                  <Card title="AI 建议">
                    <List
                      dataSource={trendData.predictions.recommendations}
                      renderItem={(item: string) => (
                        <List.Item>
                          <CheckCircleOutlined className="text-green-500 mr-2" />
                          {item}
                        </List.Item>
                      )}
                    />
                  </Card>
                  
                  <Card>
                    <div className="flex justify-between items-center">
                      <div>
                        <Text strong className="block">下次复查时间</Text>
                        <Text type="secondary">建议按时复查，监测病情变化</Text>
                      </div>
                      <Tag color="purple" className="text-lg p-2">
                        <CalendarOutlined className="mr-2" />
                        {trendData.predictions.nextCheckup}
                      </Tag>
                    </div>
                  </Card>
                </div>
              ),
            },
          ]}
        />
      </>
    ) : null}
  </Drawer>
    </div>
  )
}