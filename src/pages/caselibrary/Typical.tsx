import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Tag, Typography, Space, Select, Empty, Rate } from 'antd'
import { StarOutlined, MedicineBoxOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons'
import { mockMedicalCases, type MedicalCase } from '../../mocks/caseData'

const { Title, Text, Paragraph } = Typography

export default function TypicalCases() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'typical' | 'difficult' | 'teaching' | 'research'>('all')

  const filteredCases = mockMedicalCases.filter((c) => {
    if (filter === 'all') return c.tags.length > 0
    if (filter === 'typical') return c.tags.includes('典型病例')
    if (filter === 'difficult') return c.tags.includes('疑难病例')
    if (filter === 'teaching') return c.tags.includes('教学示范')
    if (filter === 'research') return c.tags.includes('科研价值')
    return false
  })

  const getCaseTypeTags = (tags: string[]) => {
    const tagsList = []
    if (tags.includes('典型病例')) tagsList.push({ color: 'gold', label: '典型病例' })
    if (tags.includes('疑难病例')) tagsList.push({ color: 'red', label: '疑难病例' })
    if (tags.includes('教学示范')) tagsList.push({ color: 'green', label: '教学示范' })
    if (tags.includes('科研价值')) tagsList.push({ color: 'purple', label: '科研价值' })
    return tagsList
  }

  const getDiseaseIcon = (diagnosis: string) => {
    if (diagnosis.includes('肺')) return '🫁'
    if (diagnosis.includes('乳腺')) return '🎗️'
    if (diagnosis.includes('直肠') || diagnosis.includes('胃') || diagnosis.includes('消化')) return '🫀'
    if (diagnosis.includes('前列腺') || diagnosis.includes('泌尿')) return '🔬'
    return '📋'
  }

  return (
    <div className="space-y-4">
      <Title level={4}>典型病例库</Title>

      <Card>
        <Space wrap>
          <Tag
            color={filter === 'all' ? 'blue' : 'default'}
            className="cursor-pointer text-base px-4 py-2"
            onClick={() => setFilter('all')}
          >
            全部 ({mockMedicalCases.filter(c => c.tags.length > 0).length})
          </Tag>
          <Tag
            color={filter === 'typical' ? 'gold' : 'default'}
            className="cursor-pointer text-base px-4 py-2"
            onClick={() => setFilter('typical')}
          >
            <StarOutlined /> 典型病例 ({mockMedicalCases.filter(c => c.tags.includes('典型病例')).length})
          </Tag>
          <Tag
            color={filter === 'difficult' ? 'red' : 'default'}
            className="cursor-pointer text-base px-4 py-2"
            onClick={() => setFilter('difficult')}
          >
            疑难病例 ({mockMedicalCases.filter(c => c.tags.includes('疑难病例')).length})
          </Tag>
          <Tag
            color={filter === 'teaching' ? 'green' : 'default'}
            className="cursor-pointer text-base px-4 py-2"
            onClick={() => setFilter('teaching')}
          >
            教学示范 ({mockMedicalCases.filter(c => c.tags.includes('教学示范')).length})
          </Tag>
          <Tag
            color={filter === 'research' ? 'purple' : 'default'}
            className="cursor-pointer text-base px-4 py-2"
            onClick={() => setFilter('research')}
          >
            科研价值 ({mockMedicalCases.filter(c => c.tags.includes('科研价值')).length})
          </Tag>
        </Space>
      </Card>

      {filteredCases.length === 0 ? (
        <Card>
          <Empty description="暂无符合条件的病例" />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredCases.map((caseData) => (
            <Col span={8} key={caseData.id}>
              <Card
                hoverable
                className="h-full"
                onClick={() => navigate(`/case-library/detail/${caseData.id}`)}
                cover={
                  <div className="h-2 bg-gradient-to-r from-green-600 to-green-400" />
                }
              >
                <Card.Meta
                  title={
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getDiseaseIcon(caseData.diagnosis.primary)}</span>
                      <span>{caseData.caseTitle}</span>
                    </div>
                  }
                  description={
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UserOutlined />
                        <span>{caseData.patientInfo.name} | {caseData.patientInfo.gender} | {caseData.patientInfo.age}岁</span>
                      </div>
                      
                      <div className="text-sm">
                        <Text type="secondary">科室：</Text>
                        <Text>{caseData.diagnosis.department}</Text>
                      </div>

                      <div className="text-sm">
                        <Text type="secondary">会诊日期：</Text>
                        <Text>{caseData.mdtInfo.meetingDate}</Text>
                      </div>

                      <div className="text-sm">
                        <Text type="secondary">治疗方案：</Text>
                        <Text>{caseData.mdtInfo.conclusion}</Text>
                      </div>

                      <div className="text-sm">
                        <Text type="secondary">质控评分：</Text>
                        <Text strong style={{ color: '#045126' }}>{caseData.qualityControl.score}分</Text>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {getCaseTypeTags(caseData.tags).map((tag, i) => (
                          <Tag key={i} color={tag.color}>{tag.label}</Tag>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <Space size="small">
                          <Text type="secondary" className="text-xs">
                            <FileTextOutlined /> 浏览 {caseData.metadata.viewCount}
                          </Text>
                          <Text type="secondary" className="text-xs">
                            <StarOutlined /> 收藏 {caseData.metadata.favoriteCount}
                          </Text>
                        </Space>
                        <Text type="secondary" className="text-xs">
                          随访：{caseData.followUp.status}
                        </Text>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  )
}
