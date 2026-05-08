import { useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Space, Typography, Button, Badge, Select, Modal, Descriptions, message } from 'antd'
import { BarChartOutlined, WarningOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, SendOutlined, EyeOutlined } from '@ant-design/icons'
import { Column, Line, Pie } from '@ant-design/plots'
import type { ColumnsType } from 'antd/es/table'
import { mockQualityMetrics, mockQualityAlerts, mockDepartmentQuality, mockQualityTrend, type QualityAlert } from '../../mocks/qualityMetrics'

const { Title, Text } = Typography

export default function QualityDashboard() {
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [taskModalVisible, setTaskModalVisible] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState<QualityAlert | null>(null)

  const filteredAlerts = mockQualityAlerts.filter((alert) => {
    const matchSeverity = filterSeverity === 'all' || alert.severity === filterSeverity
    const matchStatus = filterStatus === 'all' || alert.status === filterStatus
    return matchSeverity && matchStatus
  })

  const alertColumns: ColumnsType<QualityAlert> = [
    {
      title: '预警ID',
      dataIndex: 'id',
      width: 100,
      render: (id: string) => <Tag color="orange">{id}</Tag>,
    },
    {
      title: '患者信息',
      key: 'patient',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.patientName}</div>
          <div className="text-xs text-gray-500">{record.caseId}</div>
        </div>
      ),
    },
    {
      title: '科室',
      dataIndex: 'department',
      width: 120,
    },
    {
      title: '预警类型',
      dataIndex: 'alertType',
      width: 120,
      render: (type: string) => {
        const config = {
          timeout: { color: 'red', label: '超时' },
          missing_followup: { color: 'orange', label: '随访缺失' },
          low_score: { color: 'yellow', label: '评分过低' },
          deviation: { color: 'blue', label: '方案偏离' },
        }
        const c = config[type as keyof typeof config] || { color: 'default', label: type }
        return <Tag color={c.color}>{c.label}</Tag>
      },
    },
    {
      title: '严重程度',
      dataIndex: 'severity',
      width: 100,
      render: (severity: string) => (
        <Badge
          status={severity === 'high' ? 'error' : severity === 'medium' ? 'warning' : 'default'}
          text={severity === 'high' ? '高' : severity === 'medium' ? '中' : '低'}
        />
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={
          status === 'resolved' ? 'green' :
          status === 'processing' ? 'blue' : 'default'
        }>
          {status === 'resolved' ? '已解决' : status === 'processing' ? '处理中' : '待处理'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedAlert(record)
              setTaskModalVisible(true)
            }}
          >
            详情
          </Button>
          {record.status === 'pending' && (
            <Button type="link" size="small" icon={<SendOutlined />}>
              创建任务
            </Button>
          )}
        </Space>
      ),
    },
  ]

  const departmentConfig = {
    data: mockDepartmentQuality.map((d) => ({
      department: d.department,
      passRate: d.passRate,
      avgScore: d.avgScore,
    })),
    xField: 'department',
    yField: 'passRate',
    color: (datum: any) => {
      if (datum.passRate >= 90) return '#52c41a'
      if (datum.passRate >= 85) return '#faad14'
      return '#ff4d4f'
    },
    label: {
      position: 'top',
      content: (datum: any) => `${datum.passRate}%`,
    },
    height: 250,
    padding: [20, 20, 40, 60],
  }

  const trendConfig = {
    data: mockQualityTrend.map((t) => ({
      date: t.date,
      score: t.score,
      type: '质控评分',
    })),
    xField: 'date',
    yField: 'score',
    smooth: true,
    color: '#045126',
    height: 250,
    padding: [20, 20, 40, 60],
  }

  const alertTypeData = [
    { type: '超时', value: mockQualityAlerts.filter(a => a.alertType === 'timeout').length },
    { type: '随访缺失', value: mockQualityAlerts.filter(a => a.alertType === 'missing_followup').length },
    { type: '评分过低', value: mockQualityAlerts.filter(a => a.alertType === 'low_score').length },
    { type: '方案偏离', value: mockQualityAlerts.filter(a => a.alertType === 'deviation').length },
  ]

  const alertTypeConfig = {
    data: alertTypeData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {value}',
    },
    color: ['#ff4d4f', '#faad14', '#1890ff', '#722ed1'],
    height: 250,
    padding: [20, 20, 20, 20],
  }

  return (
    <div className="space-y-4">
      <Title level={4}>实时质控仪表盘</Title>

      <Row gutter={[16, 16]}>
        <Col span={4}>
          <Card>
            <Statistic
              title="今日会诊"
              value={mockQualityMetrics.todayCount}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#045126' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="会诊及时率"
              value={mockQualityMetrics.timelinessRate}
              suffix="%"
              precision={1}
              valueStyle={{ color: mockQualityMetrics.timelinessRate >= 95 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="质控合格率"
              value={mockQualityMetrics.passRate}
              suffix="%"
              precision={1}
              valueStyle={{ color: mockQualityMetrics.passRate >= 90 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="随访完成率"
              value={mockQualityMetrics.followupRate}
              suffix="%"
              precision={1}
              valueStyle={{ color: mockQualityMetrics.followupRate >= 85 ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="超时未完成"
              value={mockQualityMetrics.timeoutCount}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="本月会诊"
              value={mockQualityMetrics.monthCount}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <WarningOutlined style={{ color: '#ff4d4f' }} />
                <span>实时预警列表</span>
                <Badge count={mockQualityAlerts.filter(a => a.status === 'pending').length} style={{ backgroundColor: '#ff4d4f' }} />
              </div>
            }
            extra={
              <Space>
                <Select
                  value={filterSeverity}
                  onChange={setFilterSeverity}
                  style={{ width: 120 }}
                  size="small"
                  options={[
                    { value: 'all', label: '全部级别' },
                    { value: 'high', label: '高级别' },
                    { value: 'medium', label: '中级别' },
                    { value: 'low', label: '低级别' },
                  ]}
                />
                <Select
                  value={filterStatus}
                  onChange={setFilterStatus}
                  style={{ width: 120 }}
                  size="small"
                  options={[
                    { value: 'all', label: '全部状态' },
                    { value: 'pending', label: '待处理' },
                    { value: 'processing', label: '处理中' },
                    { value: 'resolved', label: '已解决' },
                  ]}
                />
              </Space>
            }
          >
            <Table
              columns={alertColumns}
              dataSource={filteredAlerts}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>

        <Col span={8}>
          <Card title="预警类型分布">
            <Pie {...alertTypeConfig} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="科室质控合格率">
            <Column {...departmentConfig} />
          </Card>
        </Col>

        <Col span={12}>
          <Card title="质控评分趋势">
            <Line {...trendConfig} />
          </Card>
        </Col>
      </Row>

      <Modal
        title="预警详情"
        open={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        footer={[
          selectedAlert?.status === 'pending' && (
            <Button
              key="create"
              type="primary"
              icon={<SendOutlined />}
              onClick={() => {
                message.success('质控任务已创建')
                setTaskModalVisible(false)
              }}
            >
              创建整改任务
            </Button>
          ),
          <Button key="close" onClick={() => setTaskModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {selectedAlert && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="预警ID">{selectedAlert.id}</Descriptions.Item>
            <Descriptions.Item label="患者姓名">{selectedAlert.patientName}</Descriptions.Item>
            <Descriptions.Item label="病案ID">{selectedAlert.caseId}</Descriptions.Item>
            <Descriptions.Item label="科室">{selectedAlert.department}</Descriptions.Item>
            <Descriptions.Item label="预警类型">
              <Tag color="orange">{selectedAlert.alertType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="严重程度">
              <Badge
                status={selectedAlert.severity === 'high' ? 'error' : selectedAlert.severity === 'medium' ? 'warning' : 'default'}
                text={selectedAlert.severity === 'high' ? '高' : selectedAlert.severity === 'medium' ? '中' : '低'}
              />
            </Descriptions.Item>
            <Descriptions.Item label="描述">{selectedAlert.description}</Descriptions.Item>
            <Descriptions.Item label="发现时间">{selectedAlert.detectedAt}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={
                selectedAlert.status === 'resolved' ? 'green' :
                selectedAlert.status === 'processing' ? 'blue' : 'default'
              }>
                {selectedAlert.status === 'resolved' ? '已解决' : selectedAlert.status === 'processing' ? '处理中' : '待处理'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}
