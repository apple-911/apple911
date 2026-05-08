import { Card, Row, Col, Typography, Statistic } from 'antd'
import { BarChartOutlined, PieChartOutlined, LineChartOutlined, TrophyOutlined } from '@ant-design/icons'
import { Column, Pie, Line } from '@ant-design/plots'
import { mockCaseStatistics } from '../../mocks/caseData'

const { Title, Text } = Typography

export default function CaseStatistics() {
  const departmentConfig = {
    data: mockCaseStatistics.departments.map((d) => ({
      department: d.name,
      count: d.count,
    })),
    xField: 'department',
    yField: 'count',
    color: (datum: any) => {
      const colors = ['#045126', '#0d7a3d', '#1890ff', '#40a9ff', '#722ed1']
      const index = mockCaseStatistics.departments.findIndex((d) => d.name === datum.department)
      return colors[index] || '#69c0ff'
    },
    label: {
      position: 'top',
      content: (datum: any) => `${datum.count}例`,
    },
    height: 300,
    padding: [20, 20, 40, 60],
  }

  const diseaseConfig = {
    data: mockCaseStatistics.diseaseTypes.map((d) => ({
      type: d.name,
      value: d.count,
    })),
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
    color: ['#045126', '#0d7a3d', '#1890ff', '#40a9ff', '#722ed1'],
    height: 300,
    padding: [20, 20, 20, 20],
  }

  const trendConfig = {
    data: mockCaseStatistics.monthlyTrend.map((m) => ({
      month: m.month,
      count: m.count,
    })),
    xField: 'month',
    yField: 'count',
    smooth: true,
    color: '#045126',
    areaStyle: {
      fill: 'l(270) 0:#04512620 1:#04512600',
    },
    point: {
      size: 5,
      shape: 'circle',
      style: {
        fill: '#045126',
        stroke: '#fff',
        lineWidth: 2,
      },
    },
    height: 300,
    padding: [20, 20, 40, 60],
  }

  return (
    <div className="space-y-4">
      <Title level={4}>统计分析</Title>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总病案数"
              value={mockCaseStatistics.totalCases}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#045126' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="典型病例"
              value={mockCaseStatistics.typicalCases}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="疑难病例"
              value={mockCaseStatistics.difficultCases}
              prefix={<LineChartOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="教学示范"
              value={mockCaseStatistics.teachingCases}
              prefix={<PieChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #045126, #0d7a3d)' }}></div>
                <span className="font-semibold">科室病案分布</span>
              </div>
            }
            headStyle={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}
          >
            <Column {...departmentConfig} />
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #1890ff, #40a9ff)' }}></div>
                <span className="font-semibold">病种分布</span>
              </div>
            }
            headStyle={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}
          >
            <Pie {...diseaseConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #722ed1, #b37feb)' }}></div>
                <span className="font-semibold">月度病案收录趋势</span>
              </div>
            }
            headStyle={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}
          >
            <Line {...trendConfig} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
