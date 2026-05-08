import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Statistic, Table, Tag, Space, Typography, Badge, Button, Progress, List, Alert } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  ExportOutlined,
  DashboardOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons'
import { Column, Line, Pie } from '@ant-design/plots'
import {
  mockQualityStats,
  mockPendingTasks,
  mockQualityMetrics,
  mockQualityIndicators,
  mockReturnedTasks,
  mockProblemTypes,
  mockDepartmentRankings,
  mockAuditEfficiency,
  type ReturnedTask,
  type ProblemType,
  type DepartmentRanking,
  type QualityIndicator,
  type AuditEfficiency,
} from '../mocks/qualityData'

const { Title, Text } = Typography

export default function QualityDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <Row gutter={16}>
          {[1, 2, 3, 4].map((i) => (
            <Col span={6} key={i}>
              <Card>
                <div className="h-20 bg-gray-100 animate-pulse rounded" />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    )
  }

  const taskColumns = [
    {
      title: '会诊ID',
      dataIndex: 'consultationId',
      render: (t: string) => <Tag color="blue">#{t}</Tag>,
    },
    { title: '患者姓名', dataIndex: 'patientName' },
    { title: '申请科室', dataIndex: 'department' },
    { title: '会诊日期', dataIndex: 'meetingDate' },
    {
      title: '材料完整度',
      dataIndex: 'materialScore',
      render: (score: number) => (
        <Progress
          percent={score}
          size="small"
          strokeColor={score >= 90 ? '#52c41a' : score >= 80 ? '#faad14' : '#ff4d4f'}
          format={(percent) => `${percent}%`}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color={status === '待审核' ? 'orange' : status === '审核中' ? 'processing' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: '操作',
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/quality/tasks`)}>
            查看
          </Button>
          {record.status === '待审核' && (
            <Button type="primary" size="small" onClick={() => navigate(`/quality/tasks`)}>
              审核
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const returnedTaskColumns = [
    {
      title: '会诊ID',
      dataIndex: 'consultationId',
      render: (t: string) => <Tag>#{t}</Tag>,
    },
    { title: '患者', dataIndex: 'patientName' },
    { title: '科室', dataIndex: 'department' },
    { title: '退回日期', dataIndex: 'returnDate' },
    { title: '整改期限', dataIndex: 'deadline' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => (
        <Tag color={status === '已超期' ? 'red' : 'orange'}>{status}</Tag>
      ),
    },
  ]

  const qualityScoreConfig = {
    data: mockQualityMetrics,
    xField: 'date',
    yField: 'score',
    smooth: true,
    color: '#045126',
    areaStyle: {
      fill: 'l(270) 0:#04512620 1:#04512600',
    },
    point: {
      size: 4,
      shape: 'circle',
      style: {
        fill: '#045126',
        stroke: '#fff',
        lineWidth: 2,
      },
    },
    yAxis: {
      min: 85,
      max: 100,
    },
    tooltip: {
      formatter: (datum: any) => ({
        name: '质量评分',
        value: `${datum.score}分`,
      }),
    },
    height: 200,
    padding: [20, 20, 40, 50],
  }

  const problemTypeConfig = {
    data: mockProblemTypes.map((item: ProblemType) => ({
      type: item.type,
      value: item.count,
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
    color: ['#ff4d4f', '#faad14', '#1890ff', '#722ed1', '#52c41a'],
    height: 220,
    padding: [10, 10, 10, 10],
  }

  const departmentRankingConfig = {
    data: mockDepartmentRankings
      .slice()
      .reverse()
      .map((item: DepartmentRanking) => ({
        department: item.department,
        score: item.score,
      })),
    xField: 'department',
    yField: 'score',
    color: (datum: any) => {
      const rank = mockDepartmentRankings.findIndex((r: DepartmentRanking) => r.department === datum.department) + 1
      if (rank === 1) return '#045126'
      if (rank === 2) return '#0d7a3d'
      if (rank === 3) return '#1890ff'
      return '#69c0ff'
    },
    label: {
      position: 'right',
      content: (datum: any) => `${datum.score}分`,
    },
    height: 280,
    padding: [20, 80, 40, 80],
  }

  const auditEfficiencyConfig = {
    data: mockAuditEfficiency,
    xField: 'date',
    yField: 'avgTime',
    smooth: true,
    color: '#fa8c16',
    point: {
      size: 4,
      shape: 'circle',
      style: {
        fill: '#fa8c16',
        stroke: '#fff',
        lineWidth: 2,
      },
    },
    yAxis: {
      title: {
        text: '平均时长(小时)',
      },
    },
    height: 200,
    padding: [20, 20, 40, 60],
  }

  return (
    <div className="space-y-4">
      {/* AI预警 */}
      {mockReturnedTasks.some((t: ReturnedTask) => t.status === '已超期') && (
        <Alert
          message="整改超期预警"
          description={`当前有 ${mockReturnedTasks.filter((t: ReturnedTask) => t.status === '已超期').length} 个任务已超过整改期限，请及时跟进`}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          closable
        />
      )}

      {/* 顶部统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card className="hover:shadow-lg transition-shadow duration-300" bodyStyle={{ padding: '20px' }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">待审核任务</div>
                <div className="text-3xl font-bold" style={{ color: '#fa8c16' }}>
                  {mockQualityStats.pendingTasks}
                </div>
                <div className="mt-3 text-sm text-gray-400">需要立即处理</div>
              </div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #fa8c16 0%, #ffc069 100%)' }}
              >
                <ClockCircleOutlined className="text-2xl text-white" />
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="hover:shadow-lg transition-shadow duration-300" bodyStyle={{ padding: '20px' }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">今日已审核</div>
                <div className="text-3xl font-bold" style={{ color: '#52c41a' }}>
                  {mockQualityStats.reviewedToday}
                </div>
                <div className="mt-3 flex items-center gap-1 text-sm">
                  <span className="text-green-500 flex items-center">
                    <ArrowUpOutlined className="mr-1" /> 15.3%
                  </span>
                  <span className="text-gray-400">较昨日</span>
                </div>
              </div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' }}
              >
                <CheckCircleOutlined className="text-2xl text-white" />
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="hover:shadow-lg transition-shadow duration-300" bodyStyle={{ padding: '20px' }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">待整改跟踪</div>
                <div className="text-3xl font-bold" style={{ color: '#ff4d4f' }}>
                  {mockQualityStats.pendingRectification}
                </div>
                <div className="mt-3 text-sm text-red-500">
                  {mockReturnedTasks.filter((t: ReturnedTask) => t.status === '已超期').length} 个已超期
                </div>
              </div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)' }}
              >
                <WarningOutlined className="text-2xl text-white" />
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="hover:shadow-lg transition-shadow duration-300" bodyStyle={{ padding: '20px' }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">本月质控覆盖率</div>
                <div className="text-3xl font-bold" style={{ color: '#1890ff' }}>
                  {mockQualityStats.monthlyCoverage}%
                </div>
                <div className="mt-3 flex items-center gap-1 text-sm">
                  <span className="text-blue-500 flex items-center">
                    <ArrowUpOutlined className="mr-1" /> 5.2%
                  </span>
                  <span className="text-gray-400">较上月</span>
                </div>
              </div>
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)' }}
              >
                <BarChartOutlined className="text-2xl text-white" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 核心工作区 */}
      <Row gutter={[16, 16]}>
        {/* 左侧：待办任务列表 */}
        <Col span={14}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <div
                  className="w-1 h-4 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #045126, #0d7a3d)' }}
                ></div>
                <span className="font-semibold">待办质控任务</span>
              </div>
            }
            headStyle={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}
            extra={
              <Button type="link" onClick={() => navigate('/quality/tasks')}>
                查看全部
              </Button>
            }
          >
            <div className="mb-3">
              <Space>
                <Tag color="orange" className="cursor-pointer">全部</Tag>
                <Tag className="cursor-pointer">待审核</Tag>
                <Tag className="cursor-pointer">审核中</Tag>
                <Tag className="cursor-pointer">已退回</Tag>
              </Space>
            </div>
            <Table
              columns={taskColumns}
              dataSource={mockPendingTasks}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* 右侧：质量指标仪表盘 */}
        <Col span={10}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <div
                  className="w-1 h-4 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #722ed1, #b37feb)' }}
                ></div>
                <span className="font-semibold">质量指标</span>
              </div>
            }
            headStyle={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}
          >
            <div className="space-y-4">
              {mockQualityIndicators.map((indicator: QualityIndicator, index: number) => (
                <div key={index} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                          index === 0
                            ? 'bg-green-600'
                            : index === 1
                            ? 'bg-green-500'
                            : index === 2
                            ? 'bg-orange-500'
                            : 'bg-blue-500'
                        }`}
                      ></div>
                      <Text className="text-sm font-medium text-gray-700">{indicator.name}</Text>
                    </div>
                    <div className="text-right">
                      <Text strong className="text-xl" style={{ color: '#045126' }}>
                        {indicator.value}
                        {indicator.unit}
                      </Text>
                      <div
                        className={`text-xs flex items-center justify-end gap-1 ${
                          indicator.trend === 'up'
                            ? indicator.name === '平均审核时长'
                              ? 'text-red-600'
                              : 'text-green-600'
                            : indicator.name === '平均审核时长'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {indicator.trend === 'up' ? (
                          <ArrowUpOutlined className="font-bold" />
                        ) : (
                          <ArrowDownOutlined className="font-bold" />
                        )}{' '}
                        {Math.abs(indicator.change)}
                        {indicator.unit}
                      </div>
                    </div>
                  </div>
                  <Progress
                    percent={indicator.name === '平均审核时长' ? (indicator.value / 5) * 100 : indicator.value}
                    strokeColor={{
                      '0%': index === 0 ? '#045126' : index === 1 ? '#0d7a3d' : index === 2 ? '#fa8c16' : '#1890ff',
                      '100%': index === 0 ? '#0d7a3d' : index === 1 ? '#1890ff' : index === 2 ? '#ffc069' : '#40a9ff',
                    }}
                    showInfo={false}
                    size="small"
                    strokeLinecap="round"
                    strokeWidth={8}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <Text className="text-sm font-medium text-gray-700 mb-2 block">质量评分趋势（近7天）</Text>
              <Line {...qualityScoreConfig} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 问题跟踪区域 */}
      <Row gutter={[16, 16]}>
        <Col span={14}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <div
                  className="w-1 h-4 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #ff4d4f, #ff7875)' }}
                ></div>
                <span className="font-semibold">退回任务跟踪</span>
              </div>
            }
            headStyle={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}
          >
            <Table
              columns={returnedTaskColumns}
              dataSource={mockReturnedTasks}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col span={10}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <div
                  className="w-1 h-4 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #1890ff, #40a9ff)' }}
                ></div>
                <span className="font-semibold">常见问题统计</span>
              </div>
            }
            headStyle={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}
          >
            <Pie {...problemTypeConfig} />
          </Card>
        </Col>
      </Row>

      {/* 质量分析图表 */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <div
                  className="w-1 h-4 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #045126, #0d7a3d)' }}
                ></div>
                <span className="font-semibold">科室质量排名</span>
              </div>
            }
            headStyle={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}
          >
            <Column {...departmentRankingConfig} />
          </Card>
        </Col>

        <Col span={12}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <div
                  className="w-1 h-4 rounded-full"
                  style={{ background: 'linear-gradient(180deg, #fa8c16, #ffc069)' }}
                ></div>
                <span className="font-semibold">审核效率趋势</span>
              </div>
            }
            headStyle={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}
          >
            <Line {...auditEfficiencyConfig} />
          </Card>
        </Col>
      </Row>

      {/* 快捷操作区 */}
      <Card
        title={
          <div className="flex items-center gap-2">
            <div
              className="w-1 h-4 rounded-full"
              style={{ background: 'linear-gradient(180deg, #722ed1, #b37feb)' }}
            ></div>
            <span className="font-semibold">快捷操作</span>
          </div>
        }
        headStyle={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}
      >
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Button
              type="primary"
              icon={<DashboardOutlined />}
              block
              size="large"
              onClick={() => navigate('/quality/tasks')}
              style={{
                background: 'linear-gradient(135deg, #045126 0%, #0d7a3d 100%)',
                borderColor: '#045126',
                height: '60px',
                fontSize: '16px',
              }}
            >
              质控任务列表
            </Button>
          </Col>
          <Col span={6}>
            <Button
              icon={<FileTextOutlined />}
              block
              size="large"
              onClick={() => navigate('/quality/statistics')}
              style={{
                height: '60px',
                fontSize: '16px',
                borderColor: '#045126',
                color: '#045126',
              }}
            >
              生成质控报告
            </Button>
          </Col>
          <Col span={6}>
            <Button
              icon={<LineChartOutlined />}
              block
              size="large"
              onClick={() => navigate('/quality/statistics')}
              style={{
                height: '60px',
                fontSize: '16px',
                borderColor: '#1890ff',
                color: '#1890ff',
              }}
            >
              查看质量分析
            </Button>
          </Col>
          <Col span={6}>
            <Button
              icon={<ExportOutlined />}
              block
              size="large"
              style={{
                height: '60px',
                fontSize: '16px',
                borderColor: '#722ed1',
                color: '#722ed1',
              }}
            >
              导出审核数据
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  )
}
