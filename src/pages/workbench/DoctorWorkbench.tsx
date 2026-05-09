import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Statistic, Table, Tag, Space, Typography, Badge, Button, Progress, Timeline, Avatar, Alert } from 'antd'
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  BookOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { useAppStore } from '../../stores/appStore'
import type { ColumnsType } from 'antd/es/table'
import aiPatientScreeningService from '../../services/integration/ai/aiPatientScreeningService'

const { Title, Text } = Typography

interface MyApplication {
  id: string
  patientName: string
  patientId: string
  department: string
  diagnosis: string
  status: '待科室审核' | '待秘书审核' | '待补充材料' | '待会诊' | '进行中' | '已完成'
  urgency: '常规' | '较急' | '紧急'
  createTime: string
  expertCount: number
}

export default function DoctorWorkbench() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalApplications: 0,
    ongoingConsultations: 0,
    pendingSupplement: 0,
    completedToday: 0,
  })
  const [applications, setApplications] = useState<MyApplication[]>([])
  const [aiAlerts, setAiAlerts] = useState<any[]>([])

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setStats({
        totalApplications: 45,
        ongoingConsultations: 3,
        pendingSupplement: 2,
        completedToday: 1,
      })

      const allApplications: MyApplication[] = [
        {
          id: 'MDT20240320001',
          patientName: '王建国',
          patientId: 'P001',
          department: '胸外科',
          diagnosis: '左肺鳞癌 III 期',
          status: '待科室审核',
          urgency: '紧急',
          createTime: '2024-03-20 10:30',
          expertCount: 0,
        },
        {
          id: 'MDT20240319002',
          patientName: '李秀英',
          patientId: 'P002',
          department: '肿瘤科',
          diagnosis: '右肺腺癌 IV 期',
          status: '待秘书审核',
          urgency: '较急',
          createTime: '2024-03-19 15:20',
          expertCount: 3,
        },
        {
          id: 'MDT20240318003',
          patientName: '张贵芳',
          patientId: 'P003',
          department: '呼吸内科',
          diagnosis: '肺结节病 IV 期',
          status: '待会诊',
          urgency: '常规',
          createTime: '2024-03-18 09:15',
          expertCount: 5,
        },
        {
          id: 'MDT20240317004',
          patientName: '刘志强',
          patientId: 'P004',
          department: '普外科',
          diagnosis: '胰腺癌 III 期',
          status: '待补充材料',
          urgency: '常规',
          createTime: '2024-03-17 14:30',
          expertCount: 6,
        },
        {
          id: 'MDT20240316005',
          patientName: '陈桂兰',
          patientId: 'P005',
          department: '肿瘤科',
          diagnosis: '乳腺癌 III 期',
          status: '进行中',
          urgency: '常规',
          createTime: '2024-03-16 11:30',
          expertCount: 7,
        },
        {
          id: 'MDT20240315006',
          patientName: '赵志强',
          patientId: 'P006',
          department: '肝胆外科',
          diagnosis: '肝癌 II 期',
          status: '已完成',
          urgency: '常规',
          createTime: '2024-03-15 09:00',
          expertCount: 5,
        },
        {
          id: 'MDT20240314007',
          patientName: '孙丽萍',
          patientId: 'P007',
          department: '神经内科',
          diagnosis: '胶质母细胞瘤 IV 期',
          status: '待科室审核',
          urgency: '紧急',
          createTime: '2024-03-14 16:45',
          expertCount: 0,
        },
        {
          id: 'MDT20240313008',
          patientName: '周建华',
          patientId: 'P008',
          department: '泌尿外科',
          diagnosis: '肾细胞癌 III 期',
          status: '待秘书审核',
          urgency: '较急',
          createTime: '2024-03-13 14:20',
          expertCount: 4,
        },
        {
          id: 'MDT20240312009',
          patientName: '吴桂英',
          patientId: 'P009',
          department: '妇科',
          diagnosis: '卵巢癌 IV 期',
          status: '待补充材料',
          urgency: '常规',
          createTime: '2024-03-12 10:15',
          expertCount: 6,
        },
        {
          id: 'MDT20240311010',
          patientName: '郑国强',
          patientId: 'P010',
          department: '骨科',
          diagnosis: '骨肉瘤 III 期',
          status: '待会诊',
          urgency: '常规',
          createTime: '2024-03-11 08:30',
          expertCount: 5,
        },
      ]

      // 按时间倒序排序，取前 5 条
      const sortedApplications = allApplications
        .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
        .slice(0, 5)

      setApplications(sortedApplications)
      setLoading(false)
    }, 500)
  }, [])

  // 加载 AI 预警
  useEffect(() => {
    loadAIAlerts()
  }, [])

  const loadAIAlerts = async () => {
    try {
      const alerts = await aiPatientScreeningService.getAlerts({ level: 'urgent' })
      setAiAlerts(alerts.slice(0, 3)) // 只显示前 3 条紧急预警
    } catch (error) {
      console.error('加载 AI 预警失败:', error)
      setAiAlerts([])
    }
  }

  const columns: ColumnsType<MyApplication> = [
    {
      title: '申请单号',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (text) => <Text code>{text}</Text>,
    },
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
            <a onClick={() => navigate(`/patient/360/${record.patientId}`)} className="font-medium">
              {record.patientName}
            </a>
            <div className="text-xs text-gray-400">{record.patientId}</div>
          </div>
        </Space>
      ),
    },
    {
      title: '诊断',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      width: 200,
      ellipsis: true,
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 80,
      render: (urgency) => (
        <Tag color={urgency === '紧急' ? 'red' : urgency === '较急' ? 'orange' : 'green'}>
          {urgency}
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
          '待科室审核': { color: 'orange', text: '科室审核' },
          '待秘书审核': { color: 'purple', text: '秘书审核' },
          '待补充材料': { color: 'red', text: '待补充' },
          '待会诊': { color: 'blue', text: '待会诊' },
          '进行中': { color: 'processing', text: '进行中' },
          '已完成': { color: 'success', text: '已完成' },
        }
        const config = statusMap[status] || { color: 'default', text: status }
        return <Badge color={config.color} text={config.text} />
      },
    },
    {
      title: '邀请专家',
      dataIndex: 'expertCount',
      key: 'expertCount',
      width: 80,
      render: (count) => (
        <Space>
          <TeamOutlined />
          <Text>{count}位</Text>
        </Space>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      sorter: (a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/consultation/detail/${record.id}`)}
          >
            查看
          </Button>
          {record.status === '待补充材料' && (
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => navigate(`/consultation/supplement-material/${record.id}`)}
            >
              补充
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
      <Card className="bg-gradient-to-r from-medical-green to-medical-blue-light">
        <div className="flex items-center justify-between">
          <div>
            <Title level={4} className="!mb-2 text-white">
              早上好，{user?.name || '医生'}！👋
            </Title>
            <Text className="text-white/90">
              您有 {stats.ongoingConsultations} 个会诊正在进行，{stats.pendingSupplement} 个申请需要补充材料
            </Text>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            className="shadow-lg hover:shadow-xl"
            style={{ 
              background: 'linear-gradient(135deg, #045126 0%, #0d7a3d 100%)',
              border: 'none',
              fontWeight: 600
            }}
            onClick={() => navigate('/consultation/apply')}
          >
            新建会诊申请
          </Button>
        </div>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #045126 0%, #0d7a3d 100%)' }}>
                <FileTextOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">我的申请</div>
                <div className="text-3xl font-bold" style={{ color: 'var(--xiehe-green)' }}>
                  {stats.totalApplications}
                </div>
                <div className="text-xs text-gray-400">总会诊申请数</div>
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
                <div className="text-sm text-gray-500">进行中</div>
                <div className="text-3xl font-bold text-blue-500">{stats.ongoingConsultations}</div>
                <div className="text-xs text-gray-400">正在进行的会诊</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fa8c16 0%, #ffc069 100%)' }}>
                <ThunderboltOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">待补充</div>
                <div className="text-3xl font-bold text-orange-500">{stats.pendingSupplement}</div>
                <div className="text-xs text-gray-400">需要补充材料</div>
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
                <div className="text-sm text-gray-500">今日完成</div>
                <div className="text-3xl font-bold text-green-500">{stats.completedToday}</div>
                <div className="text-xs text-gray-400">今天完成的会诊</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* AI MDT 预警卡片 */}
      {aiAlerts.length > 0 && (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card 
              title={
                <div className="flex items-center gap-2">
                  <ThunderboltOutlined className="text-yellow-500" style={{ fontSize: '18px' }} />
                  <span className="font-semibold">AI MDT 紧急预警</span>
                  <Badge count={aiAlerts.length} style={{ backgroundColor: '#faad14' }} />
                </div>
              }
              headStyle={{ 
                borderBottom: '2px solid #f0f0f0', 
                paddingBottom: '12px',
                background: 'linear-gradient(to right, #fffbe6, #fff)'
              }}
              extra={
                <Button 
                  type="primary" 
                  size="small"
                  icon={<ThunderboltOutlined />}
                  onClick={() => navigate('/ai/screening')}
                >
                  查看全部
                </Button>
              }
            >
              <div className="space-y-3">
                {aiAlerts.map((alert) => (
                  <Alert
                    key={alert.id}
                    type="warning"
                    showIcon
                    icon={<WarningOutlined />}
                    message={
                      <div className="flex items-center justify-between">
                        <div>
                          <Text strong>{alert.patientName}</Text>
                          <Text className="ml-2">({alert.department})</Text>
                          <Tag color="red" className="ml-2">评分：{alert.score}</Tag>
                        </div>
                        <Button
                          type="link"
                          size="small"
                          onClick={() => navigate(`/ai/screening/${alert.id}`)}
                        >
                          处理
                        </Button>
                      </div>
                    }
                    description={
                      <div className="mt-1">
                        <Text type="secondary">{alert.message}</Text>
                        <div className="mt-1">
                          {(alert.indications || []).slice(0, 2).map((reason: string, index: number) => (
                            <Tag key={index} color="orange" className="mr-1">{reason}</Tag>
                          ))}
                        </div>
                      </div>
                    }
                    style={{ 
                      border: '1px solid #ffe58f',
                      background: 'linear-gradient(to right, #fffbe6, #fff)'
                    }}
                  />
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* 我的申请列表 */}
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>我的申请</span>
          </Space>
        }
        extra={
          <Button type="link" onClick={() => navigate('/consultation/my-applies')}>
            查看全部
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 快捷入口 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="快捷操作">
            <div className="grid grid-cols-3 gap-4">
              <Button
                icon={<PlusOutlined />}
                size="large"
                className="h-16 !text-medical-green !border-medical-green hover:!bg-medical-green hover:!text-white"
                onClick={() => navigate('/consultation/apply')}
              >
                新建申请
              </Button>
              <Button
                icon={<TeamOutlined />}
                size="large"
                className="h-16 !border-purple-500 !text-purple-500 hover:!bg-purple-500 hover:!text-white"
                onClick={() => navigate('/patient/list')}
              >
                患者列表
              </Button>
              <Button
                icon={<EyeOutlined />}
                size="large"
                className="h-16 !border-orange-500 !text-orange-500 hover:!bg-orange-500 hover:!text-white"
                onClick={() => navigate('/report/list')}
              >
                查看报告
              </Button>
              <Button
                icon={<FileTextOutlined />}
                size="large"
                className="h-16 !border-cyan-500 !text-cyan-500 hover:!bg-cyan-500 hover:!text-white"
                onClick={() => navigate('/consultation/submit-material')}
              >
                材料归档
              </Button>
              <Button
                icon={<BookOutlined />}
                size="large"
                className="h-16 !border-pink-500 !text-pink-500 hover:!bg-pink-500 hover:!text-white"
                onClick={() => navigate('/case-library')}
              >
                病案库
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="会诊流程">
            <Timeline
              mode="left"
              items={[
                {
                  label: '提交申请',
                  color: 'green',
                  children: <div className="pl-2">填写会诊申请信息</div>,
                },
                {
                  label: '主任审核',
                  color: 'blue',
                  children: <div className="pl-2">主任医生审核申请</div>,
                },
                {
                  label: '秘书审核',
                  color: 'purple',
                  children: <div className="pl-2">MDT 秘书安排会诊事宜</div>,
                },
                {
                  label: '补充材料',
                  color: 'orange',
                  children: <div className="pl-2">根据要求补充材料（如需）</div>,
                },
                {
                  label: '会诊进行',
                  color: 'cyan',
                  children: <div className="pl-2">专家进行多学科会诊</div>,
                },
                {
                  label: '完成会诊',
                  color: 'gray',
                  children: <div className="pl-2">生成会诊报告</div>,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
