import { Card, Progress, Tag, Space, Typography, Alert, Divider, Tooltip } from 'antd'
import {
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

interface RiskFactor {
  name: string
  score: number
  description: string
}

interface RiskAssessmentProps {
  patientId: string
  age?: number
  diagnosis?: string
  comorbidities?: string[]
  vitalSigns?: {
    bloodPressure?: string
    heartRate?: number
    temperature?: number
    spo2?: number
  }
  labResults?: {
    wbc?: number
    hemoglobin?: number
    platelets?: number
  }
  performanceStatus?: number
  showSuggestions?: boolean
}

/**
 * 患者风险评估组件
 * 基于年龄、诊断、合并症等自动计算风险等级
 */
export default function RiskAssessment({
  patientId,
  age = 65,
  diagnosis = '',
  comorbidities = [],
  vitalSigns,
  labResults,
  performanceStatus = 1,
  showSuggestions = true,
}: RiskAssessmentProps) {
  // 计算风险评分
  const calculateRiskScore = (): number => {
    let score = 0

    // 年龄评分
    if (age > 75) score += 30
    else if (age > 65) score += 20
    else if (age > 55) score += 10

    // 合并症评分
    score += comorbidities.length * 15

    // 体能状态评分 (ECOG PS)
    score += performanceStatus * 10

    // 生命体征异常评分
    if (vitalSigns) {
      if (vitalSigns.heartRate && (vitalSigns.heartRate > 100 || vitalSigns.heartRate < 60)) {
        score += 10
      }
      if (vitalSigns.temperature && vitalSigns.temperature > 38.5) {
        score += 15
      }
      if (vitalSigns.spo2 && vitalSigns.spo2 < 95) {
        score += 20
      }
    }

    // 实验室检查异常评分
    if (labResults) {
      if (labResults.wbc && labResults.wbc > 12) score += 10
      if (labResults.hemoglobin && labResults.hemoglobin < 90) score += 15
      if (labResults.platelets && labResults.platelets < 100) score += 15
    }

    return Math.min(score, 100)
  }

  const riskScore = calculateRiskScore()

  // 风险等级
  const getRiskLevel = (score: number) => {
    if (score >= 70) return { level: '高危', color: 'red', icon: <ExclamationCircleOutlined /> }
    if (score >= 40) return { level: '中危', color: 'orange', icon: <WarningOutlined /> }
    return { level: '低危', color: 'green', icon: <CheckCircleOutlined /> }
  }

  const riskInfo = getRiskLevel(riskScore)

  // 风险因素详情
  const getRiskFactors = (): RiskFactor[] => {
    const factors: RiskFactor[] = []

    if (age > 75) {
      factors.push({
        name: '高龄',
        score: 30,
        description: '年龄 > 75 岁，并发症风险增加',
      })
    } else if (age > 65) {
      factors.push({
        name: '年龄偏大',
        score: 20,
        description: '年龄 > 65 岁，需关注基础疾病',
      })
    }

    comorbidities.forEach((comorbidity) => {
      factors.push({
        name: `合并症：${comorbidity}`,
        score: 15,
        description: '存在合并症，治疗复杂度增加',
      })
    })

    if (performanceStatus >= 2) {
      factors.push({
        name: '体能状态较差',
        score: performanceStatus * 10,
        description: 'ECOG PS ≥ 2，耐受性可能降低',
      })
    }

    if (vitalSigns?.spo2 && vitalSigns.spo2 < 95) {
      factors.push({
        name: '血氧饱和度偏低',
        score: 20,
        description: `SpO2: ${vitalSigns.spo2}%，需关注呼吸功能`,
      })
    }

    if (labResults?.hemoglobin && labResults.hemoglobin < 90) {
      factors.push({
        name: '贫血',
        score: 15,
        description: `Hb: ${labResults.hemoglobin} g/L，可能影响治疗`,
      })
    }

    return factors
  }

  const riskFactors = getRiskFactors()

  // 建议措施
  const getSuggestions = (): string[] => {
    const suggestions: string[] = []

    if (riskScore >= 70) {
      suggestions.push('建议优先安排 MDT 会诊')
      suggestions.push('加强生命体征监测')
      suggestions.push('评估多学科联合治疗方案')
    }

    if (comorbidities.length > 2) {
      suggestions.push('邀请相关科室会诊评估合并症')
    }

    if (performanceStatus >= 2) {
      suggestions.push('评估支持治疗方案')
      suggestions.push('关注营养支持和疼痛管理')
    }

    if (age > 75) {
      suggestions.push('老年综合评估 (CGA)')
      suggestions.push('关注药物相互作用')
    }

    if (!suggestions.length) {
      suggestions.push('按常规流程诊疗')
      suggestions.push('定期随访观察')
    }

    return suggestions
  }

  return (
    <Card className="w-full">
      <div className="space-y-4">
        {/* 风险评分总览 */}
        <div className="flex items-center gap-6">
          <div className="w-32">
            <Progress
              type="dashboard"
              percent={riskScore}
              strokeColor={{
                '0%': riskInfo.color === 'red' ? '#ff4d4f' : riskInfo.color === 'orange' ? '#fa8c16' : '#52c41a',
                '100%': riskInfo.color === 'red' ? '#ff7875' : riskInfo.color === 'orange' ? '#ffc53d' : '#95de64',
              }}
              format={() => (
                <div className="text-center">
                  <div className="text-2xl font-bold">{riskScore}</div>
                  <div className="text-xs text-gray-500">分</div>
                </div>
              )}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-2xl text-${riskInfo.color}-500`}>
                {riskInfo.icon}
              </span>
              <Title level={4} className="!mb-0">
                <Tag color={riskInfo.color} className="text-lg px-3 py-1">
                  {riskInfo.level}
                </Tag>
              </Title>
            </div>
            <Paragraph type="secondary" className="!mb-0">
              患者 ID: {patientId} | 年龄：{age}岁 | 诊断：{diagnosis || '未明确'}
            </Paragraph>
          </div>
        </div>

        <Divider />

        {/* 风险因素 */}
        <div>
          <Title level={5} className="!mb-3">
            <InfoCircleOutlined className="mr-2" />
            风险因素
          </Title>
          {riskFactors.length === 0 ? (
            <Text type="secondary">暂无明显风险因素</Text>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {riskFactors.map((factor, index) => (
                <Tooltip key={index} title={factor.description}>
                  <Alert
                    type={factor.score >= 20 ? 'warning' : 'info'}
                    message={
                      <Space>
                        <Tag color={factor.score >= 20 ? 'orange' : 'blue'}>
                          +{factor.score}分
                        </Tag>
                        <Text>{factor.name}</Text>
                      </Space>
                    }
                    description={factor.description}
                    className="text-sm"
                    showIcon={false}
                  />
                </Tooltip>
              ))}
            </div>
          )}
        </div>

        {/* 建议措施 */}
        {showSuggestions && (
          <>
            <Divider />
            <div>
              <Title level={5} className="!mb-3">
                <CheckCircleOutlined className="mr-2 text-green-500" />
                建议措施
              </Title>
              <ul className="space-y-2">
                {getSuggestions().map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-medical-blue mt-1">•</span>
                    <Text>{suggestion}</Text>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* 优先级别提示 */}
        {riskScore >= 70 && (
          <Alert
            message="优先会诊建议"
            description="该患者风险评分较高，建议优先安排 MDT 会诊，并邀请相关科室专家共同参与评估。"
            type="warning"
            showIcon
            className="mt-4"
          />
        )}
      </div>
    </Card>
  )
}