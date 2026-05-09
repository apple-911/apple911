import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Progress, Table, Tag, Space, Typography, Badge, Button, Alert } from 'antd'
import {
  CheckCircleOutlined,
  WarningOutlined,
  FileTextOutlined,
  BarChartOutlined,
  EyeOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useAppStore } from '../../stores/appStore'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

interface QualityTask {
  id: string
  type: '病历质控' | '会诊质控' | '随访质控'
  title: string
  status: '待检查' | '检查中' | '已完成'
  qualityScore: number
  issues: number
  deadline: string
}

export default function QualityWorkbench() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    avgQualityScore: 0,
    criticalIssues: 0,
  })
  const [tasks, setTasks] = useState<QualityTask[]>([])

  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalTasks: 156,
        pendingTasks: 23,
        avgQualityScore: 92.5,
        criticalIssues: 5,
      })

      setTasks([
        {
          id: 'Q001',
          type: '会诊质控',
          title: 'MDT20240320001 会诊质量检查',
          status: '待检查',
          qualityScore: 0,
          issues: 0,
          deadline: '2024-03-21',
        },
        {
          id: 'Q002',
          type: '病历质控',
          title: '王建国病历质量检查',
          status: '检查中',
          qualityScore: 88,
          issues: 3,
          deadline: '2024-03-20',
        },
        {
          id: 'Q003',
          type: '随访质控',
          title: '3 月随访计划执行检查',
          status: '已完成',
          qualityScore: 95,
          issues: 1,
          deadline: '2024-03-19',
        },
        {
          id: 'Q004',
          type: '会诊质控',
          title: 'MDT20240319002 会诊质量检查',
          status: '待检查',
          qualityScore: 0,
          issues: 0,
          deadline: '2024-03-20',
        },
      ])

      setLoading(false)
    }, 500)
  }, [])

  const columns: ColumnsType<QualityTask> = [
    {
      title: '任务类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => <Tag color="purple">{type}</Tag>,
    },
    {
      title: '任务内容',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '质量评分',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      width: 120,
      render: (score) => score > 0 ? (
        <Progress
          percent={score}
          size="small"
          strokeColor={score >= 90 ? '#52c41a' : score >= 75 ? '#faad14' : '#ff4d4f'}
          format={(percent) => `${percent}分`}
        />
      ) : (
        <Text type="secondary">待评分</Text>
      ),
    },
    {
      title: '问题数',
      dataIndex: 'issues',
      key: 'issues',
      width: 80,
      render: (issues) => (
        <Tag color={issues > 3 ? 'red' : issues > 0 ? 'orange' : 'green'}>
          {issues}个
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          '待检查': { color: 'orange', text: '待检查' },
          '检查中': { color: 'processing', text: '检查中' },
          '已完成': { color: 'success', text: '已完成' },
        }
        const config = statusMap[status] || { color: 'default', text: status }
        return <Badge color={config.color} text={config.text} />
      },
    },
    {
      title: '截止时间',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate('/quality/tasks')}
          >
            检查
          </Button>
        </Space>
      ),
    },
  ]

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-400">加载中...</div></div>
  }

  return (
    <div className="space-y-4">
      {/* 顶部欢迎语 */}
      <Card className="bg-gradient-to-r from-red-600 to-red-400">
        <div className="flex items-center justify-between">
          <div>
            <Title level={4} className="!mb-2 text-white">
              质控员您好，{user?.name || '质控员'}！👋
            </Title>
            <Text className="text-white/90">
              您有 {stats.pendingTasks} 个待检查任务，平均质量评分 {stats.avgQualityScore} 分
            </Text>
          </div>
          {stats.criticalIssues > 0 && (
            <Alert
              message={`${stats.criticalIssues}个严重问题待处理`}
              type="error"
              showIcon
              className="!bg-white/20 !text-white !border-white/30"
            />
          )}
        </div>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%)' }}>
                <FileTextOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">总任务数</div>
                <div className="text-3xl font-bold text-red-500">{stats.totalTasks}</div>
                <div className="text-xs text-gray-400">累计质控任务</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fa8c16 0%, #ffc069 100%)' }}>
                <WarningOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">待检查</div>
                <div className="text-3xl font-bold text-orange-500">{stats.pendingTasks}</div>
                <div className="text-xs text-gray-400">待检查任务</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' }}>
                <CheckCircleOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">平均评分</div>
                <div className="text-3xl font-bold text-green-500">{stats.avgQualityScore}</div>
                <div className="text-xs text-gray-400">平均质量评分</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)' }}>
                <BarChartOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">严重问题</div>
                <div className="text-3xl font-bold text-purple-500">{stats.criticalIssues}</div>
                <div className="text-xs text-gray-400">需要立即处理</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 质控任务列表 */}
      <Card
        title={
          <Space>
            <WarningOutlined />
            <span>质控任务</span>
          </Space>
        }
        extra={
          <Button type="link" onClick={() => navigate('/quality/tasks')}>
            查看全部
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 快捷入口 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="快捷操作">
            <div className="grid grid-cols-2 gap-4">
              <Button
                icon={<WarningOutlined />}
                size="large"
                className="h-16 !border-orange-500 !text-orange-500 hover:!bg-orange-500 hover:!text-white"
                onClick={() => navigate('/quality/tasks')}
              >
                质控任务
              </Button>
              <Button
                icon={<BarChartOutlined />}
                size="large"
                className="h-16 !border-blue-500 !text-blue-500 hover:!bg-blue-500 hover:!text-white"
                onClick={() => navigate('/quality/dashboard')}
              >
                质量看板
              </Button>
              <Button
                icon={<FileTextOutlined />}
                size="large"
                className="h-16 !border-green-500 !text-green-500 hover:!bg-green-500 hover:!text-white"
                onClick={() => navigate('/statistics')}
              >
                统计分析
              </Button>
              <Button
                icon={<ThunderboltOutlined />}
                size="large"
                className="h-16 !border-purple-500 !text-purple-500 hover:!bg-purple-500 hover:!text-white"
                onClick={() => navigate('/ai/screening')}
              >
                AI 筛查
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="质控流程">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <FileTextOutlined className="text-red-500" />
                </div>
                <div>
                  <div className="font-medium">质量检查</div>
                  <div className="text-sm text-gray-500">检查病历、会诊、随访质量</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <WarningOutlined className="text-orange-500" />
                </div>
                <div>
                  <div className="font-medium">问题反馈</div>
                  <div className="text-sm text-gray-500">发现问题并反馈给相关人员</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircleOutlined className="text-green-500" />
                </div>
                <div>
                  <div className="font-medium">整改跟踪</div>
                  <div className="text-sm text-gray-500">跟踪问题整改情况</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
