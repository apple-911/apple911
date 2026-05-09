import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Table, Tag, Space, Typography, Badge, Button, Avatar } from 'antd'
import {
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  FileTextOutlined,
  EyeOutlined,
  EditOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import { useAppStore } from '../../stores/appStore'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

interface SystemUser {
  id: string
  name: string
  role: string
  department: string
  status: 'active' | 'inactive'
  lastLogin: string
}

export default function AdminWorkbench() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExperts: 0,
    totalDepartments: 0,
    systemLogs: 0,
  })
  const [users, setUsers] = useState<SystemUser[]>([])

  useEffect(() => {
    setTimeout(() => {
      setStats({
        totalUsers: 256,
        totalExperts: 89,
        totalDepartments: 24,
        systemLogs: 1024,
      })

      setUsers([
        {
          id: 'U001',
          name: '张明华',
          role: '会诊专家',
          department: '胸外科',
          status: 'active',
          lastLogin: '2024-03-20 10:30',
        },
        {
          id: 'U002',
          name: '李建国',
          role: '主任医生',
          department: '肿瘤科',
          status: 'active',
          lastLogin: '2024-03-20 09:15',
        },
        {
          id: 'U003',
          name: '王芳',
          role: 'MDT 秘书',
          department: '医务处',
          status: 'active',
          lastLogin: '2024-03-20 08:50',
        },
        {
          id: 'U004',
          name: '刘伟',
          role: '申请医生',
          department: '放疗科',
          status: 'inactive',
          lastLogin: '2024-03-19 16:20',
        },
      ])

      setLoading(false)
    }, 500)
  }, [])

  const columns: ColumnsType<SystemUser> = [
    {
      title: '用户信息',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar size={32} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <div>
            <div>{record.name}</div>
            <div className="text-xs text-gray-400">ID: {record.id}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: '科室',
      dataIndex: 'department',
      key: 'department',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Badge color={status === 'active' ? 'success' : 'default'} text={status === 'active' ? '在线' : '离线'} />
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
          >
            编辑
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
      <Card className="bg-gradient-to-r from-gray-700 to-gray-500">
        <div className="flex items-center justify-between">
          <div>
            <Title level={4} className="!mb-2 text-white">
              管理员您好，{user?.name || '管理员'}！👋
            </Title>
            <Text className="text-white/90">
              系统共有 {stats.totalUsers} 个用户，{stats.totalExperts} 个专家，{stats.totalDepartments} 个科室
            </Text>
          </div>
        </div>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)' }}>
                <UserOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">总用户数</div>
                <div className="text-3xl font-bold text-blue-500">{stats.totalUsers}</div>
                <div className="text-xs text-gray-400">系统用户总数</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)' }}>
                <TeamOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">专家数</div>
                <div className="text-3xl font-bold text-purple-500">{stats.totalExperts}</div>
                <div className="text-xs text-gray-400">会诊专家总数</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' }}>
                <BarChartOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">科室数</div>
                <div className="text-3xl font-bold text-green-500">{stats.totalDepartments}</div>
                <div className="text-xs text-gray-400">系统科室总数</div>
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
                <div className="text-sm text-gray-500">系统日志</div>
                <div className="text-3xl font-bold text-orange-500">{stats.systemLogs}</div>
                <div className="text-xs text-gray-400">累计日志记录</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 用户列表 */}
      <Card
        title={
          <Space>
            <UserOutlined />
            <span>用户管理</span>
          </Space>
        }
        extra={
          <Button type="link" onClick={() => navigate('/admin/expert-list')}>
            查看全部
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 快捷入口 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="系统管理">
            <div className="grid grid-cols-2 gap-4">
              <Button
                icon={<TeamOutlined />}
                size="large"
                className="h-16 !border-blue-500 !text-blue-500 hover:!bg-blue-500 hover:!text-white"
                onClick={() => navigate('/admin/expert-list')}
              >
                专家管理
              </Button>
              <Button
                icon={<UserOutlined />}
                size="large"
                className="h-16 !border-green-500 !text-green-500 hover:!bg-green-500 hover:!text-white"
                onClick={() => navigate('/admin/team-list')}
              >
                团队管理
              </Button>
              <Button
                icon={<SettingOutlined />}
                size="large"
                className="h-16 !border-orange-500 !text-orange-500 hover:!bg-orange-500 hover:!text-white"
                onClick={() => navigate('/admin/roles')}
              >
                角色管理
              </Button>
              <Button
                icon={<FileTextOutlined />}
                size="large"
                className="h-16 !border-purple-500 !text-purple-500 hover:!bg-purple-500 hover:!text-white"
                onClick={() => navigate('/admin/logs')}
              >
                系统日志
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="系统状态">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Text>系统运行状态</Text>
                <Badge status="processing" text="正常运行" />
              </div>
              <div className="flex items-center justify-between">
                <Text>数据库连接</Text>
                <Badge status="success" text="已连接" />
              </div>
              <div className="flex items-center justify-between">
                <Text>缓存服务</Text>
                <Badge status="success" text="正常" />
              </div>
              <div className="flex items-center justify-between">
                <Text>消息服务</Text>
                <Badge status="success" text="正常" />
              </div>
              <div className="flex items-center justify-between">
                <Text>最后备份时间</Text>
                <Text type="secondary">2024-03-20 02:00</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
