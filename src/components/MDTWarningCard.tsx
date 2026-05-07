import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { Card, Tag, Button, Space, Typography, Progress, Tooltip, Modal, Divider, List, Badge, Alert, Spin, message, Descriptions } from 'antd'
import {
  RobotOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  TeamOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import aiPatientScreeningService, { MDTNecessityAssessment } from '../services/integration/ai/aiPatientScreeningService'

const { Title, Text, Paragraph } = Typography

interface MDTWarningCardProps {
  patientId: string
  patientName?: string
  onApplyMDT?: () => void
  onViewDetail?: () => void
  autoRefresh?: boolean
  refreshInterval?: number // 分钟
}

/**
 * 患者 MDT 需求 AI 预警卡片
 * 
 * 嵌入在患者信息页面，实时显示 MDT 必要性评估
 * 根据患者病情自动判断是否需要 MDT 会诊
 */
export default function MDTWarningCard({
  patientId,
  patientName,
  onApplyMDT,
  onViewDetail,
  autoRefresh = true,
  refreshInterval = 30
}: MDTWarningCardProps) {
  const [loading, setLoading] = useState(true)
  const [assessment, setAssessment] = useState<MDTNecessityAssessment | null>(null)
  const [detailVisible, setDetailVisible] = useState(false)

  useEffect(() => {
    loadAssessment()
    
    // 自动刷新
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadAssessment()
      }, refreshInterval * 60 * 1000)
      
      return () => clearInterval(interval)
    }
  }, [patientId, autoRefresh, refreshInterval])

  const loadAssessment = async () => {
    setLoading(true)
    try {
      const data = await aiPatientScreeningService.assessMDTNecessity(patientId)
      setAssessment(data)
    } catch (error) {
      console.error('加载 MDT 评估失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLevelConfig = (level: MDTNecessityAssessment['recommendationLevel']) => {
    switch (level) {
      case '强烈推荐':
        return {
          color: 'red',
          icon: <ThunderboltOutlined />,
          bgColor: '#fff2f0',
          borderColor: '#ffccc7',
          text: '强烈推荐进行 MDT',
          action: '立即申请'
        }
      case '推荐':
        return {
          color: 'orange',
          icon: <WarningOutlined />,
          bgColor: '#fff7e6',
          borderColor: '#ffe7ba',
          text: '推荐进行 MDT',
          action: '申请 MDT'
        }
      case '可考虑':
        return {
          color: 'blue',
          icon: <InfoCircleOutlined />,
          bgColor: '#e6f7ff',
          borderColor: '#bae7ff',
          text: '可考虑 MDT',
          action: '了解详情'
        }
      case '不推荐':
        return {
          color: 'green',
          icon: <CheckCircleOutlined />,
          bgColor: '#f6ffed',
          borderColor: '#d9f7be',
          text: '暂不推荐 MDT',
          action: '查看详情'
        }
    }
  }

  const getUrgencyConfig = (urgency: MDTNecessityAssessment['urgency']) => {
    switch (urgency) {
      case '紧急':
        return { color: 'red', text: '紧急' }
      case '常规':
        return { color: 'orange', text: '常规' }
      case '择期':
        return { color: 'default', text: '择期' }
    }
  }

  if (loading) {
    return (
      <Card className="text-center py-8">
        <Spin tip="AI 正在评估..." />
      </Card>
    )
  }

  if (!assessment) {
    return (
      <Card>
        <Alert
          message="无法完成评估"
          description="暂时无法获取 MDT 必要性评估，请稍后重试或联系管理员。"
          type="error"
          showIcon
        />
      </Card>
    )
  }

  const levelConfig = getLevelConfig(assessment.recommendationLevel)
  const urgencyConfig = getUrgencyConfig(assessment.urgency)

  return (
    <>
      <Card
        style={{
          backgroundColor: levelConfig.bgColor,
          borderColor: levelConfig.borderColor
        }}
        className="transition-all hover:shadow-md"
      >
        {/* 头部 */}
        <div className="flex items-start justify-between mb-4">
          <Space>
            <RobotOutlined className={`text-2xl text-${levelConfig.color}-500`} />
            <div>
              <Title level={5} className="!mb-0">
                AI MDT 需求评估
              </Title>
              <Text type="secondary" className="text-xs">
                基于患者病情自动分析
              </Text>
            </div>
          </Space>
          <Tag color={levelConfig.color} className="text-base px-3 py-1">
            {levelConfig.icon} {assessment.recommendationLevel}
          </Tag>
        </div>

        {/* 评分 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <Text>MDT 必要性评分</Text>
            <Text strong className={`text-${levelConfig.color}-500`}>
              {assessment.necessityScore} / 100
            </Text>
          </div>
          <Progress
            percent={assessment.necessityScore}
            strokeColor={{
              '0%': levelConfig.color === 'red' ? '#ff4d4f' : levelConfig.color === 'orange' ? '#fa8c16' : levelConfig.color === 'blue' ? '#1890ff' : '#52c41a',
              '100%': levelConfig.color === 'red' ? '#ff7875' : levelConfig.color === 'orange' ? '#ffc53d' : levelConfig.color === 'blue' ? '#69c0ff' : '#95de64'
            }}
            showInfo={false}
          />
        </div>

        {/* 关键信息 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Space>
              <TeamOutlined />
              <Text>推荐类型</Text>
            </Space>
            <Tag color="blue">{assessment.recommendedType}</Tag>
          </div>
          
          <div className="flex items-center justify-between">
            <Space>
              <CalendarOutlined />
              <Text>紧急程度</Text>
            </Space>
            <Tag color={urgencyConfig.color}>{urgencyConfig.text}</Tag>
          </div>

          <div className="flex items-center justify-between">
            <Space>
              <TeamOutlined />
              <Text>推荐科室</Text>
            </Space>
            <Text>
              {assessment.recommendedDepartments.slice(0, 2).join('、')}
              {assessment.recommendedDepartments.length > 2 && `等${assessment.recommendedDepartments.length}个`}
            </Text>
          </div>
        </div>

        {/* 适应证匹配 */}
        {assessment.indications.matched.length > 0 && (
          <div className="mt-4">
            <Text type="secondary" className="text-xs block mb-2">
              匹配的 MDT 适应证：
            </Text>
            <Space wrap>
              {assessment.indications.matched.slice(0, 3).map((indication, index) => (
                <Tooltip key={index} title={indication.description}>
                  <Tag color="orange">{indication.name}</Tag>
                </Tooltip>
              ))}
              {assessment.indications.matched.length > 3 && (
                <Tag>+{assessment.indications.matched.length - 3}</Tag>
              )}
            </Space>
          </div>
        )}

        <Divider className="!my-4" />

        {/* 预期获益 */}
        {assessment.expectedBenefits.length > 0 && (
          <div className="mb-4">
            <Text type="secondary" className="text-xs block mb-1">
              预期获益：
            </Text>
            <Text className="text-sm">
              {assessment.expectedBenefits.slice(0, 2).join('；')}
              {assessment.expectedBenefits.length > 2 && '...'}
            </Text>
          </div>
        )}

        {/* 不推荐理由 */}
        {assessment.notRecommendedReasons && assessment.notRecommendedReasons.length > 0 && (
          <div className="mb-4">
            <Alert
              message="不推荐原因"
              description={assessment.notRecommendedReasons[0]}
              type="info"
              showIcon
            />
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2 mt-4">
          <Button
            type="primary"
            icon={<ArrowRightOutlined />}
            onClick={onApplyMDT}
            block
            disabled={assessment.recommendationLevel === '不推荐'}
          >
            {levelConfig.action}
          </Button>
          <Button
            icon={<InfoCircleOutlined />}
            onClick={() => setDetailVisible(true)}
          >
            详情
          </Button>
        </div>

        {/* 底部信息 */}
        <div className="mt-3 text-center">
          <Text type="secondary" className="text-xs">
            置信度：{assessment.confidence}% | 更新时间：{dayjs().format('HH:mm')}
          </Text>
        </div>
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title={
          <Space>
            <RobotOutlined className="text-medical-blue" />
            <span>MDT 必要性评估详情</span>
          </Space>
        }
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
          assessment.recommendationLevel !== '不推荐' && (
            <Button
              key="apply"
              type="primary"
              onClick={() => {
                setDetailVisible(false)
                onApplyMDT?.()
              }}
            >
              申请 MDT
            </Button>
          )
        ]}
      >
        {/* 基本信息 */}
        <Card size="small" className="mb-4">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="患者">
              {patientName || assessment.patientInfo.name}
            </Descriptions.Item>
            <Descriptions.Item label="ID">
              {patientId}
            </Descriptions.Item>
            <Descriptions.Item label="年龄">
              {assessment.patientInfo.age} 岁
            </Descriptions.Item>
            <Descriptions.Item label="性别">
              {assessment.patientInfo.gender}
            </Descriptions.Item>
            <Descriptions.Item label="科室">
              {assessment.patientInfo.department}
            </Descriptions.Item>
            <Descriptions.Item label="入院日期">
              {dayjs(assessment.patientInfo.admissionDate).format('YYYY-MM-DD')}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* 评估结果 */}
        <Card size="small" className="mb-4">
          <div className="text-center mb-4">
            <Progress
              type="circle"
              percent={assessment.necessityScore}
              strokeColor={
                assessment.necessityScore >= 80 ? '#ff4d4f' : 
                assessment.necessityScore >= 60 ? '#fa8c16' : '#52c41a'
              }
              format={() => (
                <div>
                  <Text strong className="text-2xl">{assessment.necessityScore}</Text>
                  <br />
                  <Text type="secondary">分</Text>
                </div>
              )}
            />
            <div className="mt-2">
              <Tag color={levelConfig.color} className="text-base">
                {levelConfig.icon} {assessment.recommendationLevel}
              </Tag>
            </div>
          </div>

          <Space className="w-full justify-center">
            <Tag color="blue">{assessment.recommendedType}</Tag>
            <Tag color={urgencyConfig.color}>{urgencyConfig.text}</Tag>
            <Text type="secondary">置信度 {assessment.confidence}%</Text>
          </Space>
        </Card>

        {/* 评估维度 */}
        <Card 
          size="small" 
          title="评估维度"
          className="mb-4"
        >
          {/* 疾病复杂度 */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <Text strong>疾病复杂度</Text>
              <Tag>评分：{assessment.assessmentDimensions.diseaseComplexity.score}</Tag>
            </div>
            <Progress 
              percent={assessment.assessmentDimensions.diseaseComplexity.score * 10} 
              strokeColor="#1890ff"
              showInfo={false}
              size="small"
            />
          </div>

          {/* 治疗难度 */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <Text strong>治疗难度</Text>
              <Tag>{assessment.assessmentDimensions.treatmentDifficulty.score >= 80 ? '极其困难' : 
                     assessment.assessmentDimensions.treatmentDifficulty.score >= 60 ? '困难' :
                     assessment.assessmentDimensions.treatmentDifficulty.score >= 40 ? '一般' : '简单'}</Tag>
            </div>
            <Progress 
              percent={assessment.assessmentDimensions.treatmentDifficulty.score} 
              strokeColor="#fa8c16"
              showInfo={false}
              size="small"
            />
          </div>

          {/* 预后 */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <Text strong>预后</Text>
              <Tag color={assessment.assessmentDimensions.prognosis.recurrenceRisk === 'high' ? 'red' : 
                             assessment.assessmentDimensions.prognosis.recurrenceRisk === 'intermediate' ? 'orange' : 'green'}>
                {assessment.assessmentDimensions.prognosis.recurrenceRisk === 'high' ? '高危' : 
                 assessment.assessmentDimensions.prognosis.recurrenceRisk === 'intermediate' ? '中危' : '低危'}
              </Tag>
            </div>
            <Progress 
              percent={assessment.assessmentDimensions.prognosis.score} 
              strokeColor={assessment.assessmentDimensions.prognosis.score >= 70 ? '#ff4d4f' : '#52c41a'}
              showInfo={false}
              size="small"
            />
          </div>

          {/* 社会因素 */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <Text strong>社会因素</Text>
              <Text type="secondary">
                CCI: {assessment.assessmentDimensions.diseaseComplexity.comorbidities.cci}
              </Text>
            </div>
            <Progress 
              percent={assessment.assessmentDimensions.socialFactors.score} 
              strokeColor="#722ed1"
              showInfo={false}
              size="small"
            />
          </div>
        </Card>

        {/* 适应证 */}
        <Card size="small" className="mb-4">
          <Divider orientation="left">匹配的适应证</Divider>
          {assessment.indications.matched.length > 0 ? (
            <List
              size="small"
              dataSource={assessment.indications.matched}
              renderItem={(item) => (
                <List.Item>
                  <Badge status="success" />
                  <Text>{item.name}</Text>
                  <Text type="secondary" className="ml-2">- {item.description}</Text>
                </List.Item>
              )}
            />
          ) : (
            <Text type="secondary">无匹配适应证</Text>
          )}

          <Divider orientation="left">未匹配的适应证</Divider>
          {assessment.indications.notMatched.length > 0 ? (
            <List
              size="small"
              dataSource={assessment.indications.notMatched.slice(0, 5)}
              renderItem={(item) => (
                <List.Item>
                  <Badge status="default" />
                  <Text type="secondary">{item.name}</Text>
                </List.Item>
              )}
            />
          ) : (
            <Text type="secondary">-</Text>
          )}
        </Card>

        {/* 推荐科室 */}
        <Card size="small" className="mb-4">
          <Divider orientation="left">推荐会诊科室</Divider>
          <Space wrap>
            {assessment.recommendedDepartments.map((dept, index) => (
              <Tag key={index} color="blue">{dept}</Tag>
            ))}
          </Space>
        </Card>

        {/* 预期获益 */}
        {assessment.expectedBenefits.length > 0 && (
          <Card size="small">
            <Divider orientation="left">预期获益</Divider>
            <List
              size="small"
              dataSource={assessment.expectedBenefits}
              renderItem={(benefit) => (
                <List.Item>
                  <CheckCircleOutlined className="text-green-500 mr-2" />
                  <Text>{benefit}</Text>
                </List.Item>
              )}
            />
          </Card>
        )}

        {/* 声明 */}
        <Alert
          message="AI 辅助决策声明"
          description="本评估结果仅供临床参考，不构成医疗诊断或治疗建议。MDT 会诊的决定应由医疗团队根据患者具体情况综合考量后做出。"
          type="warning"
          showIcon
          className="mt-4"
        />
      </Modal>
    </>
  )
}
