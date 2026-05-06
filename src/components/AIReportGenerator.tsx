import { useState } from 'react'
import { Card, Button, Space, Typography, Spin, Alert, Tag, Divider } from 'antd'
import {
  RobotOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

interface DiscussionItem {
  expertName: string
  department: string
  content: string
  timestamp: string
}

interface GeneratedReport {
  diagnosis: string
  staging: string
  treatmentPlan: string[]
  followupPlan: string[]
  suggestions: string[]
}

interface AIReportGeneratorProps {
  discussion: DiscussionItem[]
  patientInfo: {
    name: string
    age: number
    diagnosis: string
  }
  onGenerate?: (report: GeneratedReport) => void
}

/**
 * AI 报告生成器
 * 基于会诊讨论内容自动生成报告草稿
 */
export default function AIReportGenerator({
  discussion,
  patientInfo,
  onGenerate,
}: AIReportGeneratorProps) {
  const [generating, setGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 模拟 AI 生成报告
  const generateReport = async () => {
    setGenerating(true)
    setError(null)

    try {
      // 模拟 API 调用延迟
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 从讨论内容中提取关键信息
      const extractedInfo = extractKeyInformation(discussion)

      // 生成结构化报告
      const report: GeneratedReport = {
        diagnosis: generateDiagnosis(extractedInfo, patientInfo),
        staging: generateStaging(extractedInfo),
        treatmentPlan: generateTreatmentPlan(extractedInfo),
        followupPlan: generateFollowupPlan(extractedInfo),
        suggestions: generateSuggestions(extractedInfo),
      }

      setGeneratedReport(report)
      onGenerate?.(report)
    } catch (err) {
      setError('报告生成失败，请稍后重试')
      console.error('AI report generation error:', err)
    } finally {
      setGenerating(false)
    }
  }

  // 从讨论内容提取关键信息
  const extractKeyInformation = (discussion: DiscussionItem[]) => {
    const info: any = {
      diagnoses: [] as string[],
      treatments: [] as string[],
      exams: [] as string[],
      drugs: [] as string[],
    }

    discussion.forEach((item) => {
      const content = item.content.toLowerCase()

      // 简单关键词匹配（实际应该用 NLP）
      if (content.includes('诊断') || content.includes('考虑')) {
        info.diagnoses.push(item.content)
      }
      if (content.includes('方案') || content.includes('治疗') || content.includes('手术')) {
        info.treatments.push(item.content)
      }
      if (content.includes('检查') || content.includes('CT') || content.includes('MRI')) {
        info.exams.push(item.content)
      }
      if (content.includes('药') || content.includes('化疗') || content.includes('靶向')) {
        info.drugs.push(item.content)
      }
    })

    return info
  }

  // 生成诊断意见
  const generateDiagnosis = (info: any, patientInfo: any): string => {
    const defaultDiagnosis = `患者${patientInfo.name}，${patientInfo.age}岁，因"${patientInfo.diagnosis}"入院。`

    if (info.diagnoses.length === 0) {
      return defaultDiagnosis + '经 MDT 会诊讨论，诊断明确。'
    }

    return (
      defaultDiagnosis +
      '经 MDT 会诊讨论，结合影像学、病理学及临床表现，' +
      `主要诊断为：${info.diagnoses[0] || '待补充'}。`
    )
  }

  // 生成分期
  const generateStaging = (info: any): string => {
    if (info.treatments.some((t: string) => t.includes('晚期') || t.includes('转移'))) {
      return 'IV 期（晚期，伴远处转移）'
    }
    if (info.treatments.some((t: string) => t.includes('局部'))) {
      return 'III 期（局部晚期）'
    }
    return 'II 期（中期）'
  }

  // 生成治疗方案
  const generateTreatmentPlan = (info: any): string[] => {
    const plans: string[] = []

    if (info.treatments.length > 0) {
      plans.push(`1. 主要治疗方案：${info.treatments[0]}`)
    } else {
      plans.push('1. 建议行手术治疗')
    }

    if (info.drugs.length > 0) {
      plans.push(`2. 药物治疗：${info.drugs[0]}`)
    } else {
      plans.push('2. 术后辅助化疗（根据病理结果）')
    }

    plans.push('3. 支持治疗：营养支持、疼痛管理、心理疏导')
    plans.push('4. 定期复查评估疗效')

    return plans
  }

  // 生成随访计划
  const generateFollowupPlan = (info: any): string[] => {
    const plans: string[] = []

    if (info.exams.length > 0) {
      plans.push(`1. 复查项目：${info.exams[0]}`)
    } else {
      plans.push('1. 复查项目：胸部 CT、腹部 B 超、肿瘤标志物')
    }

    plans.push('2. 随访频率：术后 2 年内每 3 个月一次，2-5 年每 6 个月一次')
    plans.push('3. 随访内容：症状评估、体格检查、影像学检查')
    plans.push('4. 不良反应监测：骨髓抑制、肝肾功能、心脏毒性')

    return plans
  }

  // 生成建议
  const generateSuggestions = (info: any): string[] => {
    const suggestions: string[] = []

    suggestions.push('建议完善相关检查，评估手术指征')
    suggestions.push('多学科协作，制定个体化治疗方案')
    suggestions.push('加强营养支持，改善患者一般状况')
    suggestions.push('关注患者心理健康，必要时请心理科会诊')

    return suggestions
  }

  return (
    <Card
      title={
        <Space>
          <RobotOutlined className="text-medical-blue" />
          <span>AI 报告生成</span>
          <Tag color="purple">Beta</Tag>
        </Space>
      }
      extra={
        <Button
          type="primary"
          icon={generating ? <LoadingOutlined spin /> : <FileTextOutlined />}
          onClick={generateReport}
          disabled={generating || discussion.length === 0}
        >
          {generating ? '生成中...' : '生成报告'}
        </Button>
      }
    >
      <div className="space-y-4">
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
          />
        )}

        {generating && (
          <div className="text-center py-8">
            <Spin size="large" />
            <div className="mt-4 text-gray-500">
              <Text>正在分析会诊讨论内容...</Text>
              <br />
              <Text type="secondary" className="text-sm">
                提取关键信息 · 生成诊断意见 · 制定治疗方案
              </Text>
            </div>
          </div>
        )}

        {generatedReport && (
          <div className="space-y-4">
            <Alert
              message="AI 生成内容仅供参考，请专家审核后修改使用"
              type="warning"
              showIcon
              closable
            />

            <div>
              <Title level={5}>
                <CheckCircleOutlined className="text-green-500 mr-2" />
                诊断意见
              </Title>
              <Paragraph className="bg-gray-50 p-3 rounded">
                {generatedReport.diagnosis}
              </Paragraph>
            </div>

            <div>
              <Title level={5}>分期评估</Title>
              <Tag color="blue" className="text-base px-3 py-1">
                {generatedReport.staging}
              </Tag>
            </div>

            <Divider />

            <div>
              <Title level={5}>治疗方案</Title>
              <ul className="space-y-2">
                {generatedReport.treatmentPlan.map((plan, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-medical-blue mt-1">•</span>
                    <Text>{plan}</Text>
                  </li>
                ))}
              </ul>
            </div>

            <Divider />

            <div>
              <Title level={5}>随访计划</Title>
              <ul className="space-y-2">
                {generatedReport.followupPlan.map((plan, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-medical-blue mt-1">•</span>
                    <Text>{plan}</Text>
                  </li>
                ))}
              </ul>
            </div>

            <Divider />

            <div>
              <Title level={5}>其他建议</Title>
              <ul className="space-y-2">
                {generatedReport.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-medical-blue mt-1">•</span>
                    <Text>{suggestion}</Text>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button onClick={() => setGeneratedReport(null)}>重新生成</Button>
              <Button type="primary">使用此报告</Button>
            </div>
          </div>
        )}

        {!generatedReport && !generating && (
          <div className="text-center py-8 text-gray-400">
            <FileTextOutlined className="text-4xl mb-2" />
            <div>
              <Text>基于会诊讨论内容，自动生成结构化报告</Text>
              <br />
              <Text type="secondary" className="text-sm">
                已记录 {discussion.length} 条讨论内容
              </Text>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}