import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Button,
  Space,
  Typography,
  Tag,
  Descriptions,
  Divider,
  Row,
  Col,
  Progress,
  Timeline,
  Alert,
  Spin,
  message,
  Badge,
  Collapse,
  Tooltip
} from 'antd'
import {
  ArrowLeftOutlined,
  ThunderboltOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TeamOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import aiPatientScreeningService, {
  ScreeningAlert,
  MDTNecessityAssessment
} from '../../services/integration/ai/aiPatientScreeningService'

const { Title, Text, Paragraph } = Typography
const { Panel } = Collapse

interface ScreeningDetailData {
  alert: ScreeningAlert
  assessment: MDTNecessityAssessment
}

export default function ScreeningDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ScreeningDetailData | null>(null)

  useEffect(() => {
    loadDetail()
  }, [id])

  const loadDetail = async () => {
    setLoading(true)
    try {
      // TODO: 调用实际 API 获取详情
      // const alertData = await aiPatientScreeningService.getAlerts()
      // const assessmentData = await aiPatientScreeningService.assessMDTNecessity(id!)
      // setData({ alert: alertData[0], assessment: assessmentData })

      // Mock 数据 - ScreeningAlert
      const mockAlert: ScreeningAlert = {
        id: id!,
        type: 'needs_review',
        level: 'urgent',
        message: '患者病情复杂，建议 MDT 会诊',
        patientId: 'P001',
        patientName: '张建国',
        department: '呼吸内科',
        score: 85,
        indications: [],
        recommendations: ['建议进行 MDT 会诊'],
        reasons: [
          '多系统疾病共存',
          '治疗方案选择困难',
          '存在高风险因素'
        ],
        suggestedActions: [
          '组织胸外科、肿瘤内科、放疗科等多学科会诊',
          '评估手术指征和风险',
          '制定个体化综合治疗方案'
        ],
        timestamp: new Date().toISOString(),
        reviewed: false,
        createdAt: new Date().toISOString()
      }

      // Mock 数据 - MDTNecessityAssessment
      const mockAssessment: MDTNecessityAssessment = {
        patientInfo: {
          patientId: 'P001',
          name: '张建国',
          age: 65,
          gender: '男',
          department: '呼吸内科',
          admissionDate: '2024-01-05'
        },
        necessityScore: 85,
        recommendationLevel: '强烈推荐',
        indications: {
          matched: [
            { code: 'A01', name: '多系统疾病', category: '疾病复杂', description: '患者同时患有多个系统疾病', weight: 0.3, matched: true },
            { code: 'A02', name: '疑难重症', category: '疾病复杂', description: '病情复杂，诊断困难', weight: 0.25, matched: true },
            { code: 'B01', name: '治疗方案选择困难', category: '治疗困难', description: '存在多种治疗方案，需要权衡', weight: 0.2, matched: true },
          ],
          notMatched: [
            { code: 'D01', name: '罕见病', category: '疾病复杂', description: '罕见疾病', weight: 0.15, matched: false },
          ]
        },
        assessmentDimensions: {
          diseaseComplexity: {
            score: 9,
            factors: [],
            diagnosis: {
              primary: '右肺上叶占位性病变',
              secondary: ['2 型糖尿病', '高血压病 3 级'],
              icd10: ['C34.1', 'E11.9', 'I10'],
              rarity: 'common',
              complexity: 'complex'
            },
            stage: {
              tnm: { t: 'T2', n: 'N1', m: 'M0', stage: 'IIB' },
              stage: 'II',
              metastasis: false
            },
            comorbidities: {
              count: 2,
              list: [
                { name: '2 型糖尿病', severity: 'moderate', impact: 0.6 },
                { name: '高血压病 3 级', severity: 'severe', impact: 0.8 }
              ],
              cci: 4
            }
          },
          treatmentDifficulty: {
            score: 8,
            factors: [],
            previousTreatments: [],
            currentChallenges: [
              '需要平衡抗肿瘤治疗与基础疾病管理',
              '手术风险评估复杂',
              '药物治疗相互作用风险'
            ],
            availableOptions: 3,
            guidelineCompliance: 'compliant'
          },
          prognosis: {
            score: 6,
            factors: [],
            survivalEstimate: {
              months6: 0.85,
              oneYear: 0.75,
              twoYear: 0.65,
              fiveYear: 0.45
            },
            recurrenceRisk: 'high',
            qualityOfLife: {
              current: 65,
              predicted: 70,
              trend: 'stable'
            }
          },
          socialFactors: {
            score: 5,
            factors: [],
            economicStatus: 'medium',
            familySupport: 'good',
            insuranceType: 'basic',
            psychologicalState: 'mild_anxiety',
            healthLiteracy: 'medium'
          }
        },
        recommendedType: '院内 MDT',
        recommendedDepartments: ['胸外科', '肿瘤内科', '放疗科', '心内科', '内分泌科'],
        urgency: '常规',
        expectedBenefits: [
          '制定个体化综合治疗方案',
          '评估手术风险和获益',
          '优化基础疾病管理',
          '提高治疗效果，改善预后'
        ],
        confidence: 92
      }

      setData({
        alert: mockAlert,
        assessment: mockAssessment
      })
    } catch (error) {
      console.error('加载详情失败:', error)
      message.error('加载详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (approved: boolean) => {
    try {
      // TODO: 调用实际 API
      // await aiPatientScreeningService.reviewAlert(id!, { approved, reviewerId: 'current-user' })
      
      message.success(approved ? '已通过' : '已驳回')
      navigate('/ai/screening')
    } catch (error) {
      message.error('操作失败')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!data) {
    return (
      <Alert
        type="error"
        message="数据加载失败"
        description="无法加载预警详情，请稍后重试"
        showIcon
      />
    )
  }

  const { alert, assessment } = data

  // 紧急程度颜色
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'urgent': return 'red'
      case 'warning': return 'orange'
      case 'info': return 'blue'
      default: return 'default'
    }
  }

  const getLevelText = (level: string) => {
    switch (level) {
      case 'urgent': return '紧急'
      case 'warning': return '警告'
      case 'info': return '提示'
      default: return level
    }
  }

  return (
    <div className="space-y-4">
      {/* 顶部导航栏 */}
      <Card>
        <div className="flex items-center justify-between">
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/ai/screening')}
            >
              返回
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              <ThunderboltOutlined className="text-yellow-500 mr-2" />
              患者 MDT 需求 AI 评估详情
            </Title>
          </Space>
          <Space>
            <Badge
              count={
                <Tag color={getLevelColor(alert.level)}>
                  {getLevelText(alert.level)}
                </Tag>
              }
            />
            <Tooltip title="驳回 AI 的 MDT 建议">
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleReview(false)}
              >
                驳回
              </Button>
            </Tooltip>
            <Tooltip title="基于 AI 评估结果发起 MDT 会诊申请">
              <Button
                type="primary"
                icon={<TeamOutlined />}
                style={{ background: '#52c41a' }}
                onClick={() => {
                  // 跳转到 MDT 申请页面，传递患者 ID
                  navigate(`/consultation/apply?patientId=${alert.patientId}`)
                }}
              >
                发起 MDT 会诊
              </Button>
            </Tooltip>
          </Space>
        </div>
      </Card>

      {/* 患者基本信息 */}
      <Card
        title={
          <Space>
            <UserOutlined />
            <Text strong>患者基本信息</Text>
          </Space>
        }
      >
        <Descriptions column={3} bordered>
          <Descriptions.Item label="姓名">
            {assessment.patientInfo.name}
          </Descriptions.Item>
          <Descriptions.Item label="性别">
            {assessment.patientInfo.gender}
          </Descriptions.Item>
          <Descriptions.Item label="年龄">
            {assessment.patientInfo.age}岁
          </Descriptions.Item>
          <Descriptions.Item label="住院号">
            {assessment.patientInfo.patientId}
          </Descriptions.Item>
          <Descriptions.Item label="科室">
            {assessment.patientInfo.department}
          </Descriptions.Item>
          <Descriptions.Item label="入院日期">
            {assessment.patientInfo.admissionDate}
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
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Text strong>评估结果：</Text>
                <Tag
                  color={assessment.recommendationLevel === '强烈推荐' || assessment.recommendationLevel === '推荐' ? 'green' : 'red'}
                  style={{ fontSize: 16, padding: '4px 12px' }}
                >
                  {assessment.recommendationLevel}
                </Tag>
              </div>
              <div>
                <Text>MDT 评分：</Text>
                <Progress
                  percent={assessment.necessityScore}
                  strokeColor={{
                    '0%': '#1890ff',
                    '100%': '#52c41a',
                  }}
                />
              </div>
              <div>
                <Text>置信度：</Text>
                <Progress
                  percent={assessment.confidence}
                  format={(percent) => `${percent}%`}
                  strokeColor={assessment.confidence >= 80 ? '#52c41a' : assessment.confidence >= 60 ? '#fa8c16' : '#ff4d4f'}
                />
              </div>
              <Divider />
              <div>
                <Text strong>推荐类型：</Text>
                <Tag color="blue" className="ml-2">{assessment.recommendedType}</Tag>
              </div>
              <div>
                <Text strong>紧急程度：</Text>
                <Tag color={assessment.urgency === '紧急' ? 'red' : assessment.urgency === '常规' ? 'orange' : 'default'} className="ml-2">
                  {assessment.urgency}
                </Tag>
              </div>
              <div>
                <Text strong>推荐科室：</Text>
                <div className="mt-2">
                  <Space wrap>
                    {assessment.recommendedDepartments.map((dept, i) => (
                      <Tag key={i} color="blue">{dept}</Tag>
                    ))}
                  </Space>
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
          >
            <div className="space-y-4">
              <Row gutter={8}>
                <Col span={8}>
                  <div className="text-center">
                    <Text type="secondary">疾病复杂度</Text>
                    <div className="mt-2">
                      <Progress
                        type="dashboard"
                        percent={assessment.assessmentDimensions.diseaseComplexity.score * 10}
                        strokeColor="#ff4d4f"
                        format={(percent) => (
                          <Text strong style={{ fontSize: 18 }}>
                            {assessment.assessmentDimensions.diseaseComplexity.score}
                          </Text>
                        )}
                      />
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <Text type="secondary">治疗难度</Text>
                    <div className="mt-2">
                      <Progress
                        type="dashboard"
                        percent={assessment.assessmentDimensions.treatmentDifficulty.score * 10}
                        strokeColor="#fa8c16"
                        format={(percent) => (
                          <Text strong style={{ fontSize: 18 }}>
                            {assessment.assessmentDimensions.treatmentDifficulty.score}
                          </Text>
                        )}
                      />
                    </div>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="text-center">
                    <Text type="secondary">预后评分</Text>
                    <div className="mt-2">
                      <Progress
                        type="dashboard"
                        percent={assessment.assessmentDimensions.prognosis.score * 10}
                        strokeColor="#722ed1"
                        format={(percent) => (
                          <Text strong style={{ fontSize: 18 }}>
                            {assessment.assessmentDimensions.prognosis.score}
                          </Text>
                        )}
                      />
                    </div>
                  </div>
                </Col>
              </Row>
              <Divider />
              <div>
                <Text strong>主要诊断：</Text>
                <div className="mt-2">
                  <Tag color="red">{assessment.assessmentDimensions.diseaseComplexity.diagnosis.primary}</Tag>
                </div>
              </div>
              <div>
                <Text strong>合并症：</Text>
                <div className="mt-2">
                  <Space wrap>
                    {assessment.assessmentDimensions.diseaseComplexity.comorbidities.list.map((c, i) => (
                      <Tag key={i} color="orange">{c.name}</Tag>
                    ))}
                  </Space>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 适应证匹配 */}
      <Card
        title={
          <Space>
            <CheckCircleOutlined />
            <Text strong>MDT 适应证匹配</Text>
          </Space>
        }
      >
        <Row gutter={16}>
          <Col span={12}>
            <Text strong className="text-green-600">匹配的适应证：</Text>
            <div className="mt-3">
              <Space direction="vertical" style={{ width: '100%' }}>
                {assessment.indications.matched.map((indication, i) => (
                  <Card key={i} size="small" className="bg-green-50 border-green-200">
                    <div className="space-y-1">
                      <Text strong>{indication.name}</Text>
                      <Text type="secondary" className="text-xs block">{indication.description}</Text>
                      <Tag color="green">权重：{(indication.weight * 100).toFixed(0)}%</Tag>
                    </div>
                  </Card>
                ))}
              </Space>
            </div>
          </Col>
          <Col span={12}>
            <Text strong className="text-gray-600">未匹配的适应证：</Text>
            <div className="mt-3">
              <Space direction="vertical" style={{ width: '100%' }}>
                {assessment.indications.notMatched.map((indication, i) => (
                  <Card key={i} size="small" className="bg-gray-50 border-gray-200">
                    <div className="space-y-1">
                      <Text>{indication.name}</Text>
                      <Text type="secondary" className="text-xs block">{indication.description}</Text>
                    </div>
                  </Card>
                ))}
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 预期获益 */}
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <Text strong>预期获益</Text>
          </Space>
        }
      >
        <Timeline
          items={assessment.expectedBenefits.map((benefit, i) => ({
            color: 'green',
            children: <Text>{benefit}</Text>
          }))}
        />
      </Card>

      {/* 快速发起 MDT 会诊 */}
      <Card
        className="border-green-200 bg-gradient-to-r from-green-50 to-green-100"
        bodyStyle={{ padding: '16px' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
              <TeamOutlined className="text-2xl text-white" />
            </div>
            <div>
              <Title level={5} style={{ margin: 0 }}>
                快速发起 MDT 会诊
              </Title>
              <Text type="secondary">
                基于 AI 评估结果，一键发起 MDT 会诊申请流程
              </Text>
            </div>
          </div>
          <div>
            <Space>
              <Tooltip title="基于 AI 评估结果发起 MDT 会诊申请">
                <Button
                  type="primary"
                  size="large"
                  icon={<ThunderboltOutlined />}
                  style={{ background: '#52c41a' }}
                  onClick={() => {
                    // 跳转到 MDT 申请页面，传递患者 ID
                    navigate(`/consultation/apply?patientId=${alert.patientId}`)
                  }}
                >
                  立即发起
                </Button>
              </Tooltip>
            </Space>
          </div>
        </div>
      </Card>

      {/* 预警信息 */}
      <Card
        title={
          <Space>
            <WarningOutlined />
            <Text strong>预警信息</Text>
          </Space>
        }
      >
        <div className="space-y-3">
          <Alert
            type="warning"
            message={alert.message}
            description={alert.message}
            showIcon
          />
          <div>
            <Text strong>预警原因：</Text>
            <div className="mt-2">
              <Space direction="vertical" style={{ width: '100%' }}>
                {alert.reasons?.map((reason, i) => (
                  <Text key={i} type="secondary" className="block">• {reason}</Text>
                ))}
              </Space>
            </div>
          </div>
          <div>
            <Text strong>建议措施：</Text>
            <div className="mt-2">
              <Space direction="vertical" style={{ width: '100%' }}>
                {alert.suggestedActions?.map((action, i) => (
                  <Text key={i} type="secondary" className="block">• {action}</Text>
                ))}
              </Space>
            </div>
          </div>
        </div>
      </Card>

      {/* 免责声明 */}
      <Alert
        type="info"
        message={
          <div className="flex items-start gap-2">
            <WarningOutlined className="mt-1" />
            <div>
              <Text strong>免责声明：</Text>
              <Text type="secondary">本评估由 AI 生成，仅供参考，最终诊疗决策需经医师专业判断和 MDT 会诊讨论确定。</Text>
            </div>
          </div>
        }
        showIcon
      />
    </div>
  )
}
