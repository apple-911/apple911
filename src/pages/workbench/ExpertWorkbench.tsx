import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Table, Tag, Space, Typography, Badge, Button, Avatar, Timeline } from 'antd'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
  EyeOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import { useAppStore } from '../../stores/appStore'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

interface Meeting {
  id: string
  patientName: string
  patientId: string
  diagnosis: string
  time: string
  room: string
  type: '现场会诊' | '远程会诊' | '床旁会诊'
  status: '待参加' | '进行中' | '已完成'
  organizer: string
}

export default function ExpertWorkbench() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMeetings: 0,
    upcomingMeetings: 0,
    completedMeetings: 0,
    reportsWritten: 0,
  })
  const [meetings, setMeetings] = useState<Meeting[]>([])

  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalMeetings: 89,
        upcomingMeetings: 4,
        completedMeetings: 82,
        reportsWritten: 76,
      })

      setMeetings([
        {
          id: 'MDT20240320001',
          patientName: '王建国',
          patientId: 'H001',
          diagnosis: '左肺鳞癌 III 期',
          time: '2024-03-20 14:00',
          room: '302 会议室',
          type: '现场会诊',
          status: '待参加',
          organizer: '张明华',
        },
        {
          id: 'MDT20240320002',
          patientName: '李秀英',
          patientId: 'H002',
          diagnosis: '右肺腺癌 IV 期',
          time: '2024-03-20 15:30',
          room: '301 会议室',
          type: '远程会诊',
          status: '待参加',
          organizer: '李建国',
        },
        {
          id: 'MDT20240319003',
          patientName: '张贵芳',
          patientId: 'H003',
          diagnosis: '食管鳞癌 II 期',
          time: '2024-03-19 14:00',
          room: '302 会议室',
          type: '现场会诊',
          status: '已完成',
          organizer: '王芳',
        },
      ])

      setLoading(false)
    }, 500)
  }, [])

  const columns: ColumnsType<Meeting> = [
    {
      title: '患者信息',
      key: 'patient',
      width: 150,
      render: (_, record) => (
        <Space>
          <Avatar size={32} style={{ backgroundColor: '#045126' }}>
            {record.patientName[0]}
          </Avatar>
          <div>
            <div>{record.patientName}</div>
            <div className="text-xs text-gray-400">{record.patientId}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '诊断',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      width: 180,
      ellipsis: true,
    },
    {
      title: '会诊时间',
      dataIndex: 'time',
      key: 'time',
      width: 150,
      sorter: (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
    },
    {
      title: '会诊地点',
      dataIndex: 'room',
      key: 'room',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => (
        <Tag color={type === '现场会诊' ? 'blue' : type === '远程会诊' ? 'purple' : 'green'}>
          {type}
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
          '待参加': { color: 'processing', text: '待参加' },
          '进行中': { color: 'processing', text: '进行中' },
          '已完成': { color: 'success', text: '已完成' },
        }
        const config = statusMap[status] || { color: 'default', text: status }
        return <Badge color={config.color} text={config.text} />
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/consultation/detail/${record.id}`)}
          >
            查看
          </Button>
          {record.status === '待参加' && (
            <Button
              type="primary"
              size="small"
              icon={<VideoCameraOutlined />}
              onClick={() => navigate(`/consultation/room/${record.id}`)}
            >
              参会
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
      <Card className="bg-gradient-to-r from-indigo-600 to-indigo-400">
        <div className="flex items-center justify-between">
          <div>
            <Title level={4} className="!mb-2 text-white">
              专家您好，{user?.name || '专家'}！👋
            </Title>
            <Text className="text-white/90">
              您有 {stats.upcomingMeetings} 场待参加的会诊，已完成 {stats.completedMeetings} 场
            </Text>
          </div>
        </div>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)' }}>
                <TeamOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">总会诊数</div>
                <div className="text-3xl font-bold text-indigo-500">{stats.totalMeetings}</div>
                <div className="text-xs text-gray-400">累计参加会诊</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)' }}>
                <ClockCircleOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">待参加</div>
                <div className="text-3xl font-bold text-blue-500">{stats.upcomingMeetings}</div>
                <div className="text-xs text-gray-400">待参加会诊</div>
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
                <div className="text-sm text-gray-500">已完成</div>
                <div className="text-3xl font-bold text-green-500">{stats.completedMeetings}</div>
                <div className="text-xs text-gray-400">已完成会诊</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fa8c16 0%, #ffc069 100%)' }}>
                <FileTextOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">报告撰写</div>
                <div className="text-3xl font-bold text-orange-500">{stats.reportsWritten}</div>
                <div className="text-xs text-gray-400">已撰写报告</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 会诊列表 */}
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            <span>我的会诊</span>
          </Space>
        }
        extra={
          <Button type="link" onClick={() => navigate('/consultation/my-meetings')}>
            查看全部
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={meetings}
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
                icon={<VideoCameraOutlined />}
                size="large"
                className="h-16 !border-indigo-500 !text-indigo-500 hover:!bg-indigo-500 hover:!text-white"
                onClick={() => navigate('/consultation/my-meetings')}
              >
                我的会诊
              </Button>
              <Button
                icon={<FileTextOutlined />}
                size="large"
                className="h-16 !border-blue-500 !text-blue-500 hover:!bg-blue-500 hover:!text-white"
                onClick={() => navigate('/report/list')}
              >
                报告列表
              </Button>
              <Button
                icon={<TeamOutlined />}
                size="large"
                className="h-16 !border-green-500 !text-green-500 hover:!bg-green-500 hover:!text-white"
                onClick={() => navigate('/case-library')}
              >
                病案库
              </Button>
              <Button
                icon={<EyeOutlined />}
                size="large"
                className="h-16 !border-orange-500 !text-orange-500 hover:!bg-orange-500 hover:!text-white"
                onClick={() => navigate('/consultation/schedule')}
              >
                会诊排班
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="会诊流程">
            <Timeline
                items={[
                  {
                    label: '收到邀请',
                    color: 'blue',
                    children: '接收会诊邀请通知',
                  },
                  {
                    label: '查看资料',
                    color: 'purple',
                    children: '查看患者病历和检查资料',
                  },
                  {
                    label: '参加会诊',
                    color: 'green',
                    children: '参加多学科会诊讨论',
                  },
                  {
                    label: '撰写报告',
                    color: 'orange',
                    children: '填写专家会诊意见',
                  },
                ]}
              />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
