import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Table, Tag, Space, Typography, Badge, Button, Avatar, Alert, Calendar, List } from 'antd'
import {
  ClockCircleOutlined,
  TeamOutlined,
  FileTextOutlined,
  BellOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useAppStore } from '../../stores/appStore'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

interface Task {
  id: string
  type: '协调会诊' | '安排场地' | '通知专家' | '准备材料' | '跟进进度'
  title: string
  status: '待处理' | '进行中' | '已完成'
  priority: '高' | '中' | '低'
  dueTime: string
  consultationId?: string
}

export default function SecretaryWorkbench() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingTasks: 0,
    todayMeetings: 0,
    urgentTasks: 0,
  })
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalTasks: 48,
        pendingTasks: 12,
        todayMeetings: 5,
        urgentTasks: 3,
      })

      setTasks([
        {
          id: 'T001',
          type: '协调会诊',
          title: '王建国 MDT 会诊 - 确认专家时间',
          status: '待处理',
          priority: '高',
          dueTime: '今天 14:00',
          consultationId: 'MDT20240320001',
        },
        {
          id: 'T002',
          type: '安排场地',
          title: '302 会议室 - 下午会诊准备',
          status: '进行中',
          priority: '高',
          dueTime: '今天 13:30',
        },
        {
          id: 'T003',
          type: '通知专家',
          title: '通知李红梅教授参加会诊',
          status: '待处理',
          priority: '中',
          dueTime: '今天 12:00',
        },
        {
          id: 'T004',
          type: '准备材料',
          title: '打印王建国病历资料',
          status: '已完成',
          priority: '中',
          dueTime: '今天 10:00',
        },
        {
          id: 'T005',
          type: '跟进进度',
          title: '跟进李秀英会诊报告生成',
          status: '进行中',
          priority: '低',
          dueTime: '明天',
        },
      ])

      setLoading(false)
    }, 500)
  }, [])

  const columns: ColumnsType<Task> = [
    {
      title: '任务类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: '任务内容',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority) => (
        <Tag color={priority === '高' ? 'red' : priority === '中' ? 'orange' : 'green'}>
          {priority}
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
          '待处理': { color: 'orange', text: '待处理' },
          '进行中': { color: 'processing', text: '进行中' },
          '已完成': { color: 'success', text: '已完成' },
        }
        const config = statusMap[status] || { color: 'default', text: status }
        return <Badge color={config.color} text={config.text} />
      },
    },
    {
      title: '截止时间',
      dataIndex: 'dueTime',
      key: 'dueTime',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          {record.consultationId && (
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/consultation/detail/${record.consultationId}`)}
            >
              查看
            </Button>
          )}
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
      <Card className="bg-gradient-to-r from-purple-600 to-purple-400">
        <div className="flex items-center justify-between">
          <div>
            <Title level={4} className="!mb-2 text-white">
              秘书您好，{user?.name || '秘书'}！👋
            </Title>
            <Text className="text-white/90">
              您有 {stats.pendingTasks} 个待处理任务，今天有 {stats.todayMeetings} 场会诊
            </Text>
          </div>
          {stats.urgentTasks > 0 && (
            <Alert
              message={`${stats.urgentTasks}个紧急任务`}
              type="warning"
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
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)' }}>
                <FileTextOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">总任务数</div>
                <div className="text-3xl font-bold text-purple-500">{stats.totalTasks}</div>
                <div className="text-xs text-gray-400">累计任务数</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fa8c16 0%, #ffc069 100%)' }}>
                <ClockCircleOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">待处理</div>
                <div className="text-3xl font-bold text-orange-500">{stats.pendingTasks}</div>
                <div className="text-xs text-gray-400">待处理任务</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)' }}>
                <TeamOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">今日会诊</div>
                <div className="text-3xl font-bold text-blue-500">{stats.todayMeetings}</div>
                <div className="text-xs text-gray-400">今天的会诊安排</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%)' }}>
                <BellOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">紧急任务</div>
                <div className="text-3xl font-bold text-red-500">{stats.urgentTasks}</div>
                <div className="text-xs text-gray-400">需要优先处理</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 任务列表 */}
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            <span>我的任务</span>
          </Space>
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
        <Col xs={24} lg={8}>
          <Card title="快捷操作">
            <div className="space-y-3">
              <Button
                icon={<TeamOutlined />}
                size="large"
                className="w-full !border-blue-500 !text-blue-500 hover:!bg-blue-500 hover:!text-white"
                onClick={() => navigate('/consultation/schedule')}
              >
                会诊排班
              </Button>
              <Button
                icon={<FileTextOutlined />}
                size="large"
                className="w-full !border-orange-500 !text-orange-500 hover:!bg-orange-500 hover:!text-white"
                onClick={() => navigate('/consultation/pending-review')}
              >
                待审核
              </Button>
              <Button
                icon={<EyeOutlined />}
                size="large"
                className="w-full !border-purple-500 !text-purple-500 hover:!bg-purple-500 hover:!text-white"
                onClick={() => navigate('/consultation/tracking')}
              >
                进度跟踪
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="今日会诊安排">
            <List
              itemLayout="horizontal"
              dataSource={[
                { time: '14:00', patient: '王建国', room: '302 会议室', experts: 5 },
                { time: '15:30', patient: '李秀英', room: '301 会议室', experts: 4 },
                { time: '16:30', patient: '张贵芳', room: '302 会议室', experts: 6 },
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                        <ClockCircleOutlined className="text-xl text-blue-500" />
                      </div>
                    }
                    title={<Text strong>{item.time}</Text>}
                    description={
                      <Space direction="vertical" size={0}>
                        <Text>{item.patient} - {item.room}</Text>
                        <Text type="secondary"><TeamOutlined /> {item.experts}位专家</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
