import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Typography, Input, Button, Space, Tag, Statistic, Divider, Result } from 'antd'
import { SearchOutlined, BookOutlined, BarChartOutlined, StarOutlined, MedicineBoxOutlined, HeartOutlined, ClockCircleOutlined, SwapOutlined } from '@ant-design/icons'
import { mockCaseStatistics, mockMedicalCases } from '../../mocks/caseData'
import { useCaseLibraryStore } from '../../stores/caseLibraryStore'
import { hasPermission } from '../../utils/helpers'

const { Title, Text } = Typography

export default function CaseLibraryIndex() {
  const navigate = useNavigate()
  const { favorites, recentViews } = useCaseLibraryStore()

  // 权限检查
  if (!hasPermission('perm-caselibrary-index')) {
    return (
      <Result
        status="403"
        title="暂无权限"
        subTitle="抱歉，您没有权限访问MDT病案库。如需获取权限，请联系系统管理员。"
        extra={<Button type="primary" onClick={() => navigate(-1)}>返回</Button>}
      />
    )
  }

  const recentCases = mockMedicalCases.slice(0, 5)

  const diseaseIcons: Record<string, string> = {
    '肺癌': '🫁',
    '乳腺癌': '🎗️',
    '消化道肿瘤': '🫀',
    '泌尿系肿瘤': '🔬',
    '其他': '📋',
  }

  return (
    <div className="space-y-6">
      <Title level={3}>MDT 病案库</Title>

      <Card>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="已收录病案" value={mockCaseStatistics.totalCases} suffix="个" valueStyle={{ color: '#045126' }} />
          </Col>
          <Col span={6}>
            <Statistic title="涵盖科室" value={mockCaseStatistics.departments.length} suffix="个" valueStyle={{ color: '#1890ff' }} />
          </Col>
          <Col span={6}>
            <Statistic title="典型病例" value={mockCaseStatistics.typicalCases} suffix="个" valueStyle={{ color: '#faad14' }} />
          </Col>
          <Col span={6}>
            <Statistic title="科研价值病例" value={mockCaseStatistics.researchCases} suffix="个" valueStyle={{ color: '#722ed1' }} />
          </Col>
        </Row>
      </Card>

      <Card>
        <Input.Search
          placeholder="输入疾病名称、诊断、专家姓名..."
          enterButton={<Button type="primary" icon={<SearchOutlined />}>搜索</Button>}
          size="large"
          onSearch={() => navigate('/case-library/search')}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card
            hoverable
            onClick={() => navigate('/case-library/search')}
            className="text-center h-40 flex flex-col justify-center items-center"
          >
            <SearchOutlined className="text-5xl mb-3" style={{ color: '#045126' }} />
            <Title level={5}>病案检索</Title>
            <Text type="secondary">多维度筛选，快速定位目标病例</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            hoverable
            onClick={() => navigate('/case-library/typical')}
            className="text-center h-40 flex flex-col justify-center items-center"
          >
            <StarOutlined className="text-5xl mb-3" style={{ color: '#faad14' }} />
            <Title level={5}>典型病例</Title>
            <Text type="secondary">精选教学病例，专家点评注释</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            hoverable
            onClick={() => navigate('/case-library/statistics')}
            className="text-center h-40 flex flex-col justify-center items-center"
          >
            <BarChartOutlined className="text-5xl mb-3" style={{ color: '#1890ff' }} />
            <Title level={5}>统计分析</Title>
            <Text type="secondary">数据可视化，科研管理决策支持</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            hoverable
            onClick={() => navigate('/case-library/favorites')}
            className="text-center h-40 flex flex-col justify-center items-center"
          >
            <HeartOutlined className="text-5xl mb-3" style={{ color: '#eb2f96' }} />
            <Title level={5}>我的收藏</Title>
            <Text type="secondary">{favorites.length} 个收藏病例</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-4">
        <Col span={6}>
          <Card
            hoverable
            onClick={() => navigate('/case-library/learning')}
            className="text-center h-40 flex flex-col justify-center items-center"
          >
            <ClockCircleOutlined className="text-5xl mb-3" style={{ color: '#13c2c2' }} />
            <Title level={5}>学习进度</Title>
            <Text type="secondary">跟踪学习记录，管理学习进度</Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            hoverable
            onClick={() => navigate('/case-library/comparison')}
            className="text-center h-40 flex flex-col justify-center items-center"
          >
            <SwapOutlined className="text-5xl mb-3" style={{ color: '#722ed1' }} />
            <Title level={5}>病例对比</Title>
            <Text type="secondary">多病例对比分析，发现差异规律</Text>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <div className="flex items-center gap-2">
            <MedicineBoxOutlined style={{ color: '#045126' }} />
            <span>热门病种</span>
          </div>
        }
        headStyle={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}
      >
        <Row gutter={[16, 16]}>
          {mockCaseStatistics.diseaseTypes.map((disease) => (
            <Col span={4} key={disease.name}>
              <Card hoverable className="text-center" onClick={() => navigate('/case-library/search')}>
                <div className="text-4xl mb-2">{diseaseIcons[disease.name] || '📋'}</div>
                <Text strong>{disease.name}</Text>
                <div className="text-sm text-gray-500">{disease.count}例</div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card
        title="最新收录"
        extra={<Button type="link" onClick={() => navigate('/case-library/search')}>查看全部</Button>}
        headStyle={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}
      >
        <Row gutter={[16, 16]}>
          {recentCases.map((caseData) => (
            <Col span={8} key={caseData.id}>
              <Card
                hoverable
                size="small"
                onClick={() => navigate(`/case-library/detail/${caseData.id}`)}
              >
                <Card.Meta
                  title={caseData.caseTitle}
                  description={
                    <div className="space-y-2">
                      <div className="text-sm">
                        <Text type="secondary">诊断：</Text>
                        <Tag color="red" className="text-xs">{caseData.diagnosis.primary}</Tag>
                      </div>
                      <div className="text-sm">
                        <Text type="secondary">患者：</Text>
                        <Text>{caseData.patientInfo.name}</Text>
                        <Text type="secondary"> | {caseData.patientInfo.department}</Text>
                      </div>
                      <div className="text-sm">
                        <Text type="secondary">会诊日期：</Text>
                        <Text>{caseData.mdtInfo.meetingDate}</Text>
                      </div>
                      <div className="flex gap-1">
                        {caseData.tags.includes('典型病例') && <Tag color="gold" className="text-xs">典型</Tag>}
                        {caseData.tags.includes('教学示范') && <Tag color="green" className="text-xs">教学</Tag>}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  )
}
