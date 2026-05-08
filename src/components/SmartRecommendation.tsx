import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Typography, Tag, Space, Button, Empty, Tooltip, Rate } from 'antd'
import { ThunderboltOutlined, EyeOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons'
import { MedicalCase } from '../mocks/caseData'
import { findSimilarCases, type SimilarCase } from '../utils/caseRecommendation'

const { Title, Text, Paragraph } = Typography

interface SmartRecommendationProps {
  currentCase: MedicalCase
  allCases: MedicalCase[]
  limit?: number
  title?: string
}

export default function SmartRecommendation({
  currentCase,
  allCases,
  limit = 3,
  title = '🤖 智能推荐',
}: SmartRecommendationProps) {
  const navigate = useNavigate()
  const [similarCases, setSimilarCases] = useState<SimilarCase[]>([])
  const [feedback, setFeedback] = useState<Record<string, 'useful' | 'not-useful' | null>>({})

  useEffect(() => {
    const similar = findSimilarCases(currentCase, allCases, limit)
    setSimilarCases(similar)
  }, [currentCase, allCases, limit])

  const handleFeedback = (caseId: string, type: 'useful' | 'not-useful') => {
    setFeedback(prev => ({ ...prev, [caseId]: type }))
    // TODO: 发送反馈到后端，优化推荐算法
  }

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 80) return '#52c41a'
    if (similarity >= 60) return '#1890ff'
    if (similarity >= 40) return '#faad14'
    return '#d9d9d9'
  }

  const getSimilarityLevel = (similarity: number) => {
    if (similarity >= 80) return '高度相似'
    if (similarity >= 60) return '较为相似'
    if (similarity >= 40) return '部分相似'
    return '轻微相似'
  }

  if (similarCases.length === 0) {
    return (
      <Card size="small">
        <Empty description="暂无相似病例推荐" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Card>
    )
  }

  return (
    <Card
      size="small"
      title={
        <Space>
          <ThunderboltOutlined style={{ color: '#722ed1' }} />
          <span>{title}</span>
        </Space>
      }
      extra={
        <Tooltip title="基于诊断、科室、标签等多维度智能匹配">
          <Text type="secondary" className="text-xs">?</Text>
        </Tooltip>
      }
    >
      <div className="space-y-3">
        {similarCases.map((similar) => (
          <Card
            key={similar.caseId}
            size="small"
            hoverable
            className="border border-gray-200 hover:border-blue-400 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Text strong className="text-sm">{similar.caseTitle}</Text>
                    <Tag
                      color={getSimilarityColor(similar.similarity)}
                      className="text-xs"
                    >
                      {getSimilarityLevel(similar.similarity)}
                    </Tag>
                  </div>
                  <div className="mt-1">
                    <Text type="secondary" className="text-xs">相似度：</Text>
                    <Text strong style={{ color: getSimilarityColor(similar.similarity) }}>
                      {similar.similarity}%
                    </Text>
                  </div>
                </div>
              </div>

              <div className="text-xs space-y-1">
                <div>
                  <Text type="secondary">诊断：</Text>
                  <Tag color="red" className="text-xs">{similar.diagnosis}</Tag>
                </div>
                <div>
                  <Text type="secondary">科室：</Text>
                  <Text>{similar.department}</Text>
                </div>
                <div>
                  <Text type="secondary">会诊日期：</Text>
                  <Text>{similar.meetingDate}</Text>
                </div>
              </div>

              <div>
                <Text type="secondary" className="text-xs">匹配原因：</Text>
                <Space wrap className="mt-1">
                  {similar.matchReasons.map((reason, index) => (
                    <Tag key={index} color="blue" className="text-xs">
                      {reason}
                    </Tag>
                  ))}
                </Space>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <Space>
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => navigate(`/case-library/detail/${similar.caseId}`)}
                  >
                    查看详情
                  </Button>
                </Space>
                <Space size="small">
                  <Tooltip title="有用">
                    <Button
                      type="text"
                      size="small"
                      icon={<LikeOutlined />}
                      className={feedback[similar.caseId] === 'useful' ? 'text-green-500' : ''}
                      onClick={() => handleFeedback(similar.caseId, 'useful')}
                    />
                  </Tooltip>
                  <Tooltip title="无用">
                    <Button
                      type="text"
                      size="small"
                      icon={<DislikeOutlined />}
                      className={feedback[similar.caseId] === 'not-useful' ? 'text-red-500' : ''}
                      onClick={() => handleFeedback(similar.caseId, 'not-useful')}
                    />
                  </Tooltip>
                </Space>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  )
}
