import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Table, Tag, Space, Typography, Badge, Button, Avatar, Progress, Alert, message } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  WarningOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { useAppStore } from '../../stores/appStore'
import type { ColumnsType } from 'antd/es/table'
import aiPatientScreeningService from '../../services/integration/ai/aiPatientScreeningService'

const { Title, Text } = Typography

interface PendingReview {
  id: string
  patientName: string
  patientId: string
  department: string
  diagnosis: string
  urgency: '常规' | '较急' | '紧急'
  applicant: string
  applyTime: string
  expertCount: number
}

export default function DirectorWorkbench() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalReviews: 0,
    pendingReviews: 0,
    urgentReviews: 0,
    approvedToday: 0,
  })
  const [pendingList, setPendingList] = useState<PendingReview[]>([])
  const [aiAlerts, setAiAlerts] = useState<any[]>([])

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setStats({
        totalReviews: 156,
        pendingReviews: 8,
        urgentReviews: 2,
        approvedToday: 5,
      })

      setPendingList([
        {
          id: 'MDT20240320001',
          patientName: '王建国',
          patientId: 'H001',
          department: '胸外科',
          diagnosis: '左肺鳞癌 III 期',
          urgency: '紧急',
          applicant: '张医生',
          applyTime: '2024-03-20 10:30',
          expertCount: 0,
        },
        {
          id: 'MDT20240320002',
          patientName: '李秀英',
          patientId: 'H002',
          department: '肿瘤科',
          diagnosis: '右肺腺癌 IV 期',
          urgency: '较急',
          applicant: '李医生',
          applyTime: '2024-03-20 09:15',
          expertCount: 0,
        },
        {
          id: 'MDT20240319003',
          patientName: '张贵芳',
          patientId: 'H003',
          department: '放疗科',
          diagnosis: '食管鳞癌 II 期',
          urgency: '常规',
          applicant: '王医生',
          applyTime: '2024-03-19 16:20',
          expertCount: 0,
        },
        {
          id: 'MDT20240319004',
          patientName: '刘志强',
          patientId: 'H004',
          department: '胸外科',
          diagnosis: '纵隔肿瘤',
          urgency: '紧急',
          applicant: '张医生',
          applyTime: '2024-03-19 14:00',
          expertCount: 0,
        },
        {
          id: 'MDT20240319005',
          patientName: '陈桂兰',
          patientId: 'H005',
          department: '肿瘤科',
          diagnosis: '乳腺癌 III 期',
          urgency: '常规',
          applicant: '赵医生',
          applyTime: '2024-03-19 11:30',
          expertCount: 0,
        },
      ])

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

  const columns: ColumnsType<PendingReview> = [
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
      title: '申请科室',
      dataIndex: 'department',
      key: 'department',
      width: 100,
    },
    {
      title: '申请医生',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 100,
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: '申请时间',
      dataIndex: 'applyTime',
      key: 'applyTime',
      width: 150,
      sorter: (a, b) => new Date(a.applyTime).getTime() - new Date(b.applyTime).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/consultation/pending-review?id=${record.id}`)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            className="text-green-600"
            onClick={() => {
              // TODO: 实现确认审核逻辑
              message.success(`已确认通过申请 ${record.id}`)
            }}
          >
            确认
          </Button>
          <Button
            type="link"
            size="small"
            icon={<CloseOutlined />}
            danger
            onClick={() => {
              // TODO: 实现拒绝审核逻辑
              message.warning(`已拒绝申请 ${record.id}`)
            }}
          >
            拒绝
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
      <Card className="bg-gradient-to-r from-blue-600 to-blue-400">
        <div className="flex items-center justify-between">
          <div>
            <Title level={4} className="!mb-2 text-white">
              主任您好，{user?.name || '医生'}！👋
            </Title>
            <Text className="text-white/90">
              您有 {stats.pendingReviews} 个会诊申请待审核，其中 {stats.urgentReviews} 个紧急申请
            </Text>
          </div>
          {stats.urgentReviews > 0 && (
            <Alert
              message={`${stats.urgentReviews}个紧急申请待处理`}
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
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)' }}>
                <FileTextOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">总审核数</div>
                <div className="text-3xl font-bold text-blue-500">{stats.totalReviews}</div>
                <div className="text-xs text-gray-400">累计审核申请数</div>
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
                <div className="text-sm text-gray-500">待审核</div>
                <div className="text-3xl font-bold text-orange-500">{stats.pendingReviews}</div>
                <div className="text-xs text-gray-400">待处理申请</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5222d 0%, #ff4d4f 100%)' }}>
                <WarningOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">紧急申请</div>
                <div className="text-3xl font-bold text-red-500">{stats.urgentReviews}</div>
                <div className="text-xs text-gray-400">需要优先处理</div>
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
                <div className="text-sm text-gray-500">今日通过</div>
                <div className="text-3xl font-bold text-green-500">{stats.approvedToday}</div>
                <div className="text-xs text-gray-400">今天审核通过</div>
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

      {/* 待审核列表 */}
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            <span>待审核申请</span>
          </Space>
        }
        extra={
          <Button type="link" onClick={() => navigate('/consultation/pending-review')}>
            查看全部
          </Button>
        }
      >
        {stats.urgentReviews > 0 && (
          <Alert
            message={`当前有 ${stats.urgentReviews} 个紧急申请，请优先处理`}
            type="warning"
            showIcon
            className="mb-4"
          />
        )}
        <Table
          columns={columns}
          dataSource={pendingList}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 快捷入口 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="快捷操作">
            <div className="grid grid-cols-2 gap-4">
              <Button
                icon={<FileTextOutlined />}
                size="large"
                className="h-16 !border-orange-500 !text-orange-500 hover:!bg-orange-500 hover:!text-white"
                onClick={() => navigate('/consultation/pending-review')}
              >
                待审核
              </Button>
              <Button
                icon={<TeamOutlined />}
                size="large"
                className="h-16 !border-blue-500 !text-blue-500 hover:!bg-blue-500 hover:!text-white"
                onClick={() => navigate('/consultation/schedule')}
              >
                会诊排班
              </Button>
              <Button
                icon={<EyeOutlined />}
                size="large"
                className="h-16 !border-purple-500 !text-purple-500 hover:!bg-purple-500 hover:!text-white"
                onClick={() => navigate('/consultation/tracking')}
              >
                进度跟踪
              </Button>
              <Button
                icon={<ThunderboltOutlined />}
                size="large"
                className="h-16 !border-green-500 !text-green-500 hover:!bg-green-500 hover:!text-white"
                onClick={() => navigate('/ai/screening')}
              >
                AI 筛查
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="审核流程">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileTextOutlined className="text-blue-500" />
                </div>
                <div>
                  <div className="font-medium">查看申请信息</div>
                  <div className="text-sm text-gray-500">查看患者基本信息和病情摘要</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircleOutlined className="text-green-500" />
                </div>
                <div>
                  <div className="font-medium">审核通过</div>
                  <div className="text-sm text-gray-500">确认申请信息完整，批准会诊</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <CloseCircleOutlined className="text-red-500" />
                </div>
                <div>
                  <div className="font-medium">退回补充</div>
                  <div className="text-sm text-gray-500">信息不完整，退回要求补充材料</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
