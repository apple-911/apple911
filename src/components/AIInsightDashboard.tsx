import { useState, useEffect } from 'react'
import { Card, Button, Space, Typography, Tag, Progress, Alert, Divider, Spin, Table, Statistic, Row, Col, Badge, Tooltip } from 'antd'
import {
  RobotOutlined,
  DashboardOutlined,
  WarningOutlined,
  RiseOutlined as TrendUpOutlined,
  FallOutlined as TrendDownOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
// import intelligentConsultationService from '../../services/integration/ai/intelligentConsultationService'
// import aiQualityControlService from '../../services/integration/ai/aiQualityControlService'

interface ExpertMatch {
  consultationId: string
  matchedExperts: any[]
  matchScore: number
}

interface ConsultationPreparation {
  consultationId: string
  preparationItems: any[]
}

interface QualityIndicator {
  id: string
  name: string
  currentValue: number
  targetValue: number
  unit: string
  score: number
  trend: 'improving' | 'declining' | 'stable'
  alertStatus?: 'critical' | 'warning' | 'normal'
  recommendations: string[]
}

interface RiskWarning {
  id: string
  title: string
  description: string
  level: 'critical' | 'high' | 'medium' | 'low'
  severity: number
  riskScore: number
  recommendedActions: string[]
}

const { Title, Text } = Typography

interface AIInsight {
  type: 'opportunity' | 'warning' | 'optimization' | 'alert'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  action?: string
  confidence: number
}

interface DashboardMetrics {
  totalConsultations: number
  completionRate: number
  averageWaitTime: number
  qualityScore: number
  expertUtilization: number
  patientSatisfaction: number
}

/**
 * AI 智能驾驶舱组件
 * 
 * 提供全局 AI 洞察、实时质控、风险预警、运营优化建议等功能
 */
export default function AIInsightDashboard() {
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [qualityIndicators, setQualityIndicators] = useState<QualityIndicator[]>([])
  const [riskWarnings, setRiskWarnings] = useState<RiskWarning[]>([])
  const [expertRecommendations, setExpertRecommendations] = useState<ExpertMatch[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // 暂时使用模拟数据
      const qualityReport = {
        coreIndicators: [],
        benchmarking: {},
        overallScore: 85
      }
      const riskAssessment: any[] = []
      const operationAnalysis = {
        workload: {
          departmentBreakdown: [] as any[],
          totalConsultations: 100,
          completedConsultations: 85
        },
        efficiency: {
          averageDuration: 3.5,
          onTimeRate: 0.85,
          resourceUtilization: 0.75,
          optimizationSuggestions: [] as string[],
          averageWaitTime: 2.1
        },
        resources: {
          utilization: 0.75,
          expertUtilization: {
            utilizationRate: 0.8
          }
        },
        totalConsultations: 100,
        completedConsultations: 85
      }

      // 生成 AI 洞察
      const generatedInsights: AIInsight[] = []

      // 基于质控报告生成洞察
      qualityReport.coreIndicators.forEach((indicator: any) => {
        if (indicator.alertStatus === 'critical') {
          generatedInsights.push({
            type: 'alert',
            title: `${indicator.name}严重不达标`,
            description: `当前值${indicator.currentValue}${indicator.unit}，目标值${indicator.targetValue}${indicator.unit}，差距${((indicator.targetValue - indicator.currentValue) / indicator.targetValue * 100).toFixed(1)}%`,
            impact: 'high',
            action: indicator.recommendations[0],
            confidence: indicator.score
          })
        } else if (indicator.alertStatus === 'warning') {
          generatedInsights.push({
            type: 'warning',
            title: `${indicator.name}需要关注`,
            description: `当前值${indicator.currentValue}${indicator.unit}，趋势${indicator.trend === 'declining' ? '下降' : indicator.trend === 'improving' ? '改善' : '平稳'}`,
            impact: 'medium',
            action: indicator.recommendations[0],
            confidence: indicator.score
          })
        }
      })

      // 基于风险预警生成洞察
      riskAssessment.forEach((warning: any) => {
        if (warning.level === 'critical' || warning.level === 'high') {
          generatedInsights.push({
            type: 'alert',
            title: warning.title,
            description: warning.description,
            impact: warning.severity > 8 ? 'high' : 'medium',
            action: warning.recommendedActions[0],
            confidence: warning.riskScore
          })
        }
      })

      // 基于运营分析生成优化建议
      if (operationAnalysis.efficiency.resourceUtilization < 70) {
        generatedInsights.push({
          type: 'optimization',
          title: '资源利用率偏低',
          description: `当前资源利用率为${operationAnalysis.efficiency.resourceUtilization.toFixed(1)}%，低于行业平均水平（80%）`,
          impact: 'medium',
          action: operationAnalysis.efficiency.optimizationSuggestions[0],
          confidence: 85
        })
      }

      if (operationAnalysis.efficiency.averageWaitTime > 72) {
        generatedInsights.push({
          type: 'optimization',
          title: '会诊等待时间过长',
          description: `平均等待时间为${operationAnalysis.efficiency.averageWaitTime.toFixed(0)}小时，超过目标值（48 小时）`,
          impact: 'high',
          action: '优化排班算法，增加高峰时段专家配置',
          confidence: 90
        })
      }

      // 机会洞察
      if (operationAnalysis.workload.departmentBreakdown.some((d: any) => d.growth > 30)) {
        const fastGrowingDept = operationAnalysis.workload.departmentBreakdown.find((d: any) => d.growth > 30)
        if (fastGrowingDept) {
          generatedInsights.push({
            type: 'opportunity',
            title: `${fastGrowingDept.department}需求快速增长`,
            description: `${fastGrowingDept.department}会诊量同比增长${fastGrowingDept.growth.toFixed(1)}%，建议增加专家配置`,
            impact: 'medium',
            action: '考虑在该科室增设 MDT 专家岗',
            confidence: 88
          })
        }
      }

      setInsights(generatedInsights)
      setQualityIndicators(qualityReport.coreIndicators)
      setRiskWarnings(riskAssessment.filter((w: any) => w.level === 'high' || w.level === 'medium'))

      // 设置指标
      setMetrics({
        totalConsultations: operationAnalysis.workload.totalConsultations,
        completionRate: (operationAnalysis.workload.completedConsultations / operationAnalysis.workload.totalConsultations) * 100,
        averageWaitTime: operationAnalysis.efficiency.averageWaitTime,
        qualityScore: qualityReport.overallScore,
        expertUtilization: operationAnalysis.resources.expertUtilization.utilizationRate,
        patientSatisfaction: 92 // 示例数据
      })

    } catch (error) {
      console.error('加载驾驶舱数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInsightColor = (type: AIInsight['type']) => {
    switch (type) {
      case 'alert': return 'red'
      case 'warning': return 'orange'
      case 'optimization': return 'blue'
      case 'opportunity': return 'green'
    }
  }

  const getInsightIcon = (type: AIInsight['type']) => {
    switch (type) {
      case 'alert': return <ExclamationCircleOutlined />
      case 'warning': return <WarningOutlined />
      case 'optimization': return <ThunderboltOutlined />
      case 'opportunity': return <TrendUpOutlined />
    }
  }

  const qualityColumns: ColumnsType<QualityIndicator> = [
    {
      title: '指标名称',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 150
    },
    {
      title: '当前值',
      dataIndex: 'currentValue',
      key: 'currentValue',
      render: (value: number, record: QualityIndicator) => (
        <Text strong>{value}{record.unit}</Text>
      )
    },
    {
      title: '目标值',
      dataIndex: 'targetValue',
      key: 'targetValue',
      render: (value: number, record: QualityIndicator) => (
        <Text type="secondary">{value}{record.unit}</Text>
      )
    },
    {
      title: '趋势',
      dataIndex: 'trend',
      key: 'trend',
      render: (trend: QualityIndicator['trend']) => (
        <Space>
          {trend === 'improving' ? (
            <TrendUpOutlined className="text-green-500" />
          ) : trend === 'declining' ? (
            <TrendDownOutlined className="text-red-500" />
          ) : (
            <span>-</span>
          )}
          <span className="capitalize">{trend === 'improving' ? '改善' : trend === 'declining' ? '下降' : '平稳'}</span>
        </Space>
      )
    },
    {
      title: '评分',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => (
        <Progress
          type="dashboard"
          percent={score}
          strokeColor={score >= 90 ? '#52c41a' : score >= 70 ? '#fa8c16' : '#ff4d4f'}
          format={() => (
            <Text strong>{score}</Text>
          )}
          width={50}
        />
      )
    },
    {
      title: '状态',
      dataIndex: 'alertStatus',
      key: 'alertStatus',
      render: (status: QualityIndicator['alertStatus']) => (
        <Badge
          status={status === 'normal' ? 'success' : status === 'warning' ? 'warning' : 'error'}
          text={status === 'normal' ? '正常' : status === 'warning' ? '预警' : '危急'}
        />
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" tip="正在加载 AI 洞察..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI 洞察摘要 */}
      <Card
        title={
          <Space>
            <RobotOutlined className="text-medical-blue" />
            <span>AI 智能洞察</span>
            <Tag color="purple">实时</Tag>
          </Space>
        }
      >
        <div className="space-y-3">
          {insights.length === 0 ? (
            <Alert
              message="暂无重要洞察"
              description="系统运行平稳，各项指标正常"
              type="success"
              showIcon
            />
          ) : (
            insights.map((insight, index) => (
              <Alert
                key={index}
                type={insight.type === 'alert' ? 'error' : insight.type === 'warning' ? 'warning' : 'info'}
                message={
                  <Space>
                    {getInsightIcon(insight.type)}
                    <span className="font-medium">{insight.title}</span>
                    <Tag color={getInsightColor(insight.type)}>
                      {insight.type === 'alert' ? '警报' : insight.type === 'warning' ? '预警' : insight.type === 'optimization' ? '优化' : '机会'}
                    </Tag>
                    <Tag color="cyan">置信度 {insight.confidence.toFixed(0)}%</Tag>
                  </Space>
                }
                description={
                  <div className="space-y-2">
                    <p>{insight.description}</p>
                    {insight.action && (
                      <div>
                        <Text strong>建议措施：</Text>
                        <Text type="secondary">{insight.action}</Text>
                      </div>
                    )}
                  </div>
                }
                showIcon
                closable
              />
            ))
          )}
        </div>
      </Card>

      {/* 核心指标 */}
      {metrics && (
        <Card title="核心运营指标">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="总会诊数"
                  value={metrics.totalConsultations}
                  suffix="例"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="完成率"
                  value={metrics.completionRate}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="平均等待时间"
                  value={metrics.averageWaitTime}
                  precision={0}
                  suffix="小时"
                  valueStyle={{ color: metrics.averageWaitTime > 48 ? '#fa8c16' : '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="质控评分"
                  value={metrics.qualityScore}
                  suffix="分"
                  valueStyle={{ color: metrics.qualityScore >= 90 ? '#52c41a' : '#fa8c16' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="专家利用率"
                  value={metrics.expertUtilization}
                  precision={1}
                  suffix="%"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card>
                <Statistic
                  title="满意度"
                  value={metrics.patientSatisfaction}
                  suffix="%"
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>
        </Card>
      )}

      {/* 质控指标详情 */}
      <Card title="质控指标监控">
        <Table
          columns={qualityColumns}
          dataSource={qualityIndicators}
          rowKey="code"
          pagination={false}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>

      {/* 风险预警 */}
      {riskWarnings.length > 0 && (
        <Card
          title={
            <Space>
              <WarningOutlined className="text-orange-500" />
              <span>风险预警</span>
              <Badge count={riskWarnings.length} />
            </Space>
          }
        >
          <div className="space-y-3">
            {riskWarnings.map((warning: any, index: number) => (
              <Alert
                key={index}
                type={warning.level === 'critical' ? 'error' : 'warning'}
                message={
                  <Space>
                    <ExclamationCircleOutlined />
                    <span className="font-medium">{warning.title}</span>
                    <Tag color={warning.level === 'critical' ? 'red' : 'orange'}>
                      {warning.level === 'critical' ? '严重' : '高'}风险
                    </Tag>
                  </Space>
                }
                description={
                  <div className="space-y-2">
                    <p>{warning.description}</p>
                    <div>
                      <Text strong>影响：</Text>
                      <Text type="secondary">{warning.impact}</Text>
                    </div>
                    <div>
                      <Text strong>建议措施：</Text>
                      <ul className="list-disc list-inside ml-2">
                        {warning.recommendedActions.map((action: any, i: number) => (
                          <li key={i}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                }
                showIcon
                closable
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
