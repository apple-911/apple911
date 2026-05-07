import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Card, 
  Table, 
  Tag, 
  Space, 
  Button, 
  Typography, 
  Badge, 
  Progress, 
  Alert,
  Modal,
  Descriptions,
  Divider,
  Input,
  Select,
  DatePicker,
  Statistic,
  Row,
  Col,
  Tooltip,
  message,
  InputNumber
} from 'antd'
import {
  WarningOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RobotOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  ExportOutlined,
  EyeOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import aiPatientScreeningService, { 
  ScreeningAlert, 
  MDTNecessityAssessment 
} from '../services/integration/ai/aiPatientScreeningService'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Search } = Input

interface PatientScreeningAlertsProps {
  department?: string
  onPatientSelect?: (patientId: string) => void
  levelFilter?: ScreeningAlert['level']
}

/**
 * 患者 MDT 需求 AI 预警组件
 * 
 * 功能：
 * 1. 自动筛查需要 MDT 的患者
 * 2. 显示预警列表和详细信息
 * 3. 支持审核和导出
 * 4. 统计分析
 */
export default function PatientScreeningAlerts({ 
  department,
  onPatientSelect,
  levelFilter
}: PatientScreeningAlertsProps) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [alerts, setAlerts] = useState<ScreeningAlert[]>([])
  const [selectedAlert, setSelectedAlert] = useState<ScreeningAlert | null>(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [filterVisible, setFilterVisible] = useState(false)
  
  // 筛选条件
  const [filters, setFilters] = useState<{
    type?: ScreeningAlert['type']
    level?: ScreeningAlert['level']
    reviewed?: boolean
    dateRange?: [dayjs.Dayjs, dayjs.Dayjs]
    search?: string
    department?: string
    scoreRange?: {
      min: number
      max: number
    }
  }>({})

  // 统计数据
  const [statistics, setStatistics] = useState({
    total: 0,
    mdtNeeded: 0,
    mdtNotNeeded: 0,
    needsReview: 0,
    urgent: 0
  })

  useEffect(() => {
    loadAlerts()
  }, [filters, department, levelFilter])

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const alertFilters: any = {
        ...filters,
        department
      }
      
      // 应用级别筛选
      if (levelFilter) {
        alertFilters.level = levelFilter
      }
      
      if (filters.dateRange) {
        alertFilters.dateRange = {
          start: filters.dateRange[0].toISOString(),
          end: filters.dateRange[1].toISOString()
        }
      }

      const data = await aiPatientScreeningService.getAlerts(alertFilters)
      
      // 应用评分范围筛选
      let filteredData = data
      if (filters.scoreRange) {
        filteredData = data.filter(alert => 
          alert.score >= filters.scoreRange!.min && 
          alert.score <= filters.scoreRange!.max
        )
      }
      
      setAlerts(filteredData)

      // 计算统计数据
      setStatistics({
        total: filteredData.length,
        mdtNeeded: filteredData.filter(a => a.type === 'mdt_needed').length,
        mdtNotNeeded: filteredData.filter(a => a.type === 'mdt_not_needed').length,
        needsReview: filteredData.filter(a => !a.reviewed).length,
        urgent: filteredData.filter(a => a.level === 'urgent').length
      })
    } catch (error) {
      console.error('加载预警失败:', error)
      message.error('加载预警失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (alertId: string, approved: boolean, comment?: string) => {
    try {
      await aiPatientScreeningService.reviewAlert(alertId, {
        approved,
        comment,
        reviewerId: 'current-user-id' // 实际应从用户上下文获取
      })
      message.success('审核成功')
      loadAlerts()
    } catch (error) {
      console.error('审核失败:', error)
      message.error('审核失败')
    }
  }

  const handleExport = async () => {
    try {
      const result = await aiPatientScreeningService.exportReport({
        format: 'excel',
        dateRange: filters.dateRange ? {
          start: filters.dateRange[0].toISOString(),
          end: filters.dateRange[1].toISOString()
        } : undefined,
        includeDetails: true
      })
      
      // 下载文件
      window.open(result.downloadUrl)
      message.success('导出成功')
    } catch (error) {
      console.error('导出失败:', error)
      message.error('导出失败')
    }
  }

  const getLevelColor = (level: ScreeningAlert['level']) => {
    switch (level) {
      case 'urgent': return 'red'
      case 'warning': return 'orange'
      case 'info': return 'blue'
      default: return 'default'
    }
  }

  const getTypeColor = (type: ScreeningAlert['type']) => {
    switch (type) {
      case 'mdt_needed': return 'green'
      case 'mdt_not_needed': return 'gray'
      case 'needs_review': return 'orange'
      default: return 'default'
    }
  }

  const getTypeText = (type: ScreeningAlert['type']) => {
    switch (type) {
      case 'mdt_needed': return '建议 MDT'
      case 'mdt_not_needed': return '无需 MDT'
      case 'needs_review': return '需要审核'
      default: return '未知'
    }
  }

  const columns: ColumnsType<ScreeningAlert> = [
    {
      title: '预警级别',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: ScreeningAlert['level']) => (
        <Badge
          status={level === 'urgent' ? 'error' : level === 'warning' ? 'warning' : 'success'}
          text={level === 'urgent' ? '紧急' : level === 'warning' ? '警告' : '提示'}
        />
      )
    },
    {
      title: '患者信息',
      key: 'patient',
      width: 200,
      render: (_, record) => (
        <div>
          <Text strong>{record.patientName}</Text>
          <br />
          <Text type="secondary">{record.patientId}</Text>
        </div>
      )
    },
    {
      title: '科室',
      dataIndex: 'department',
      key: 'department',
      width: 120,
      filters: [
        { text: '呼吸内科', value: '呼吸内科' },
        { text: '胸外科', value: '胸外科' },
        { text: '肿瘤内科', value: '肿瘤内科' },
      ],
      onFilter: (value, record) => record.department === value
    },
    {
      title: 'MDT 评分',
      dataIndex: 'score',
      key: 'score',
      width: 150,
      sorter: (a, b) => a.score - b.score,
      render: (score: number) => (
        <Progress
          percent={score}
          strokeColor={{
            '0%': score >= 80 ? '#ff4d4f' : score >= 60 ? '#fa8c16' : '#52c41a',
            '100%': score >= 80 ? '#ff7875' : score >= 60 ? '#ffc53d' : '#95de64',
          }}
          format={() => (
            <Text strong>{score}</Text>
          )}
          size="small"
        />
      )
    },
    {
      title: '推荐',
      dataIndex: 'recommendation',
      key: 'recommendation',
      width: 120,
      render: (recommendation: string, record: ScreeningAlert) => (
        <Tag color={getTypeColor(record.type)}>
          {getTypeText(record.type)}
        </Tag>
      )
    },
    {
      title: '预警内容',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      responsive: ['lg']
    },
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      sorter: (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      render: (timestamp: string) => dayjs(timestamp).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '状态',
      dataIndex: 'reviewed',
      key: 'reviewed',
      width: 80,
      filters: [
        { text: '待审核', value: false },
        { text: '已审核', value: true },
      ],
      onFilter: (value, record) => record.reviewed === value,
      render: (reviewed: boolean) => (
        reviewed ? (
          <CheckCircleOutlined className="text-green-500" />
        ) : (
          <ExclamationCircleOutlined className="text-orange-500" />
        )
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              navigate(`/ai/screening/${record.id}`)
            }}
          >
            详情
          </Button>
          {!record.reviewed && (
            <>
              <Button
                type="link"
                size="small"
                className="text-green-600"
                onClick={() => handleReview(record.id, true)}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleReview(record.id, false)}
              >
                驳回
              </Button>
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <div className="space-y-4">
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总预警数"
              value={statistics.total}
              prefix={<RobotOutlined className="text-medical-blue" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="建议 MDT"
              value={statistics.mdtNeeded}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待审核"
              value={statistics.needsReview}
              prefix={<ExclamationCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="紧急预警"
              value={statistics.urgent}
              prefix={<ThunderboltOutlined className="text-red-500" />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选区域 */}
      <Card bodyStyle={{ padding: '16px 24px' }}>
        {/* 第一行：搜索 + 操作按钮 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Search
            placeholder="搜索患者姓名、ID 或科室"
            allowClear
            style={{ flex: 1, maxWidth: 400 }}
            onSearch={(value) => setFilters({ ...filters, search: value })}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <div style={{ flex: 1 }} />
          <Button
            icon={<FilterOutlined />}
            onClick={() => setFilterVisible(!filterVisible)}
          >
            高级筛选
          </Button>
          <Button
            type="primary"
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            导出
          </Button>
        </div>

        {/* 第二行：快捷筛选标签 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Text type="secondary" style={{ marginRight: 4 }}>快捷筛选：</Text>
          
          <Tag.CheckableTag
            checked={!filters.level}
            onChange={() => setFilters({ ...filters, level: undefined })}
            style={{ padding: '2px 10px', borderRadius: 4 }}
          >
            全部
          </Tag.CheckableTag>
          <Tag.CheckableTag
            checked={filters.level === 'urgent'}
            onChange={(checked) => setFilters({ ...filters, level: checked ? 'urgent' : undefined })}
            style={{ padding: '2px 10px', borderRadius: 4, borderColor: '#ff4d4f' }}
          >
            <span style={{ color: filters.level === 'urgent' ? '#ff4d4f' : undefined }}>● 紧急</span>
          </Tag.CheckableTag>
          <Tag.CheckableTag
            checked={filters.level === 'warning'}
            onChange={(checked) => setFilters({ ...filters, level: checked ? 'warning' : undefined })}
            style={{ padding: '2px 10px', borderRadius: 4, borderColor: '#fa8c16' }}
          >
            <span style={{ color: filters.level === 'warning' ? '#fa8c16' : undefined }}>● 警告</span>
          </Tag.CheckableTag>
          <Tag.CheckableTag
            checked={filters.level === 'info'}
            onChange={(checked) => setFilters({ ...filters, level: checked ? 'info' : undefined })}
            style={{ padding: '2px 10px', borderRadius: 4, borderColor: '#52c41a' }}
          >
            <span style={{ color: filters.level === 'info' ? '#52c41a' : undefined }}>● 提示</span>
          </Tag.CheckableTag>

          <Divider type="vertical" style={{ height: 20, margin: '0 4px' }} />

          <Tag.CheckableTag
            checked={!filters.type}
            onChange={() => setFilters({ ...filters, type: undefined })}
            style={{ padding: '2px 10px', borderRadius: 4 }}
          >
            全部类型
          </Tag.CheckableTag>
          <Tag.CheckableTag
            checked={filters.type === 'mdt_needed'}
            onChange={(checked) => setFilters({ ...filters, type: checked ? 'mdt_needed' : undefined })}
            style={{ padding: '2px 10px', borderRadius: 4 }}
          >
            建议 MDT
          </Tag.CheckableTag>
          <Tag.CheckableTag
            checked={filters.type === 'needs_review'}
            onChange={(checked) => setFilters({ ...filters, type: checked ? 'needs_review' : undefined })}
            style={{ padding: '2px 10px', borderRadius: 4 }}
          >
            需要审核
          </Tag.CheckableTag>
          <Tag.CheckableTag
            checked={filters.type === 'mdt_not_needed'}
            onChange={(checked) => setFilters({ ...filters, type: checked ? 'mdt_not_needed' : undefined })}
            style={{ padding: '2px 10px', borderRadius: 4 }}
          >
            无需 MDT
          </Tag.CheckableTag>

          <Divider type="vertical" style={{ height: 20, margin: '0 4px' }} />

          <Tag.CheckableTag
            checked={filters.reviewed === undefined}
            onChange={() => setFilters({ ...filters, reviewed: undefined })}
            style={{ padding: '2px 10px', borderRadius: 4 }}
          >
            全部状态
          </Tag.CheckableTag>
          <Tag.CheckableTag
            checked={filters.reviewed === false}
            onChange={(checked) => setFilters({ ...filters, reviewed: checked ? false : undefined })}
            style={{ padding: '2px 10px', borderRadius: 4 }}
          >
            待审核
          </Tag.CheckableTag>
          <Tag.CheckableTag
            checked={filters.reviewed === true}
            onChange={(checked) => setFilters({ ...filters, reviewed: checked ? true : undefined })}
            style={{ padding: '2px 10px', borderRadius: 4 }}
          >
            已审核
          </Tag.CheckableTag>
        </div>
      </Card>

      {/* 高级筛选面板 */}
      {filterVisible && (
        <Card 
          bodyStyle={{ padding: '16px 24px', background: '#fafafa' }}
          style={{ border: '1px dashed #d9d9d9' }}
        >
          <Row gutter={[24, 12]} align="middle">
            <Col>
              <Space>
                <Text type="secondary">评分范围</Text>
                <InputNumber 
                  placeholder="最低" 
                  min={0} 
                  max={100} 
                  style={{ width: 80 }}
                  size="small"
                  onChange={(value) => {
                    setFilters({ 
                      ...filters, 
                      scoreRange: { min: value || 0, max: filters.scoreRange?.max || 100 }
                    })
                  }}
                />
                <Text type="secondary">~</Text>
                <InputNumber 
                  placeholder="最高" 
                  min={0} 
                  max={100} 
                  style={{ width: 80 }}
                  size="small"
                  onChange={(value) => {
                    setFilters({ 
                      ...filters, 
                      scoreRange: { min: filters.scoreRange?.min || 0, max: value || 100 }
                    })
                  }}
                />
              </Space>
            </Col>
            <Col>
              <Space>
                <Text type="secondary">科室</Text>
                <Select
                  placeholder="选择科室"
                  allowClear
                  style={{ width: 130 }}
                  size="small"
                  onChange={(value) => setFilters({ ...filters, department: value })}
                >
                  <Select.Option value="呼吸内科">呼吸内科</Select.Option>
                  <Select.Option value="胸外科">胸外科</Select.Option>
                  <Select.Option value="肿瘤内科">肿瘤内科</Select.Option>
                  <Select.Option value="放疗科">放疗科</Select.Option>
                  <Select.Option value="病理科">病理科</Select.Option>
                  <Select.Option value="影像科">影像科</Select.Option>
                </Select>
              </Space>
            </Col>
            <Col>
              <Space>
                <Text type="secondary">日期范围</Text>
                <DatePicker.RangePicker
                  size="small"
                  onChange={(dates) => setFilters({ ...filters, dateRange: dates as any })}
                />
              </Space>
            </Col>
            <Col flex="auto" style={{ textAlign: 'right' }}>
              <Button
                size="small"
                type="link"
                onClick={() => {
                  setFilters({})
                  message.success('已重置所有筛选条件')
                }}
              >
                重置全部
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* 预警列表 */}
      <Card
        title={
          <Space>
            <WarningOutlined className="text-orange-500" />
            <span>AI 筛查预警列表</span>
            <Badge count={statistics.needsReview} showZero />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={alerts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`
          }}
          scroll={{ x: 1500 }}
          size="middle"
        />
      </Card>

      {/* 详情弹窗 */}
      {selectedAlert && (
        <Modal
          title={
            <Space>
              <RobotOutlined className="text-medical-blue" />
              <span>AI 筛查详情</span>
            </Space>
          }
          visible={detailVisible}
          onCancel={() => setDetailVisible(false)}
          width={900}
          footer={[
            <Button key="close" onClick={() => setDetailVisible(false)}>
              关闭
            </Button>,
            !selectedAlert.reviewed && (
              <Button
                key="approve"
                type="primary"
                onClick={() => {
                  handleReview(selectedAlert.id, true)
                  setDetailVisible(false)
                }}
              >
                通过
              </Button>
            ),
            !selectedAlert.reviewed && (
              <Button
                key="reject"
                danger
                onClick={() => {
                  handleReview(selectedAlert.id, false)
                  setDetailVisible(false)
                }}
              >
                驳回
              </Button>
            )
          ]}
        >
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="患者姓名">{selectedAlert.patientName}</Descriptions.Item>
            <Descriptions.Item label="患者 ID">{selectedAlert.patientId}</Descriptions.Item>
            <Descriptions.Item label="科室">{selectedAlert.department}</Descriptions.Item>
            <Descriptions.Item label="预警级别">
              <Tag color={getLevelColor(selectedAlert.level)}>
                {selectedAlert.level === 'urgent' ? '紧急' : selectedAlert.level === 'warning' ? '警告' : '提示'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="MDT 评分">
              <Progress
                percent={selectedAlert.score}
                strokeColor={selectedAlert.score >= 80 ? '#ff4d4f' : selectedAlert.score >= 60 ? '#fa8c16' : '#52c41a'}
                format={() => <Text strong>{selectedAlert.score}分</Text>}
              />
            </Descriptions.Item>
            <Descriptions.Item label="推荐">
              <Tag color={getTypeColor(selectedAlert.type)}>
                {getTypeText(selectedAlert.type)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="预警内容" span={2}>
              {selectedAlert.message}
            </Descriptions.Item>
            <Descriptions.Item label="原因" span={2}>
              <ul className="list-disc list-inside">
                {selectedAlert.reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </Descriptions.Item>
            <Descriptions.Item label="建议措施" span={2}>
              <ul className="list-disc list-inside">
                {selectedAlert.suggestedActions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </Descriptions.Item>
            <Descriptions.Item label="时间">{dayjs(selectedAlert.timestamp).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
            <Descriptions.Item label="状态">
              {selectedAlert.reviewed ? (
                <Tag color="green">已审核</Tag>
              ) : (
                <Tag color="orange">待审核</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>

          <Divider />
          
          <Alert
            message="AI 辅助决策声明"
            description="本系统提供的 AI 筛查结果仅供参考，不构成医疗诊断或治疗建议。最终诊疗决策应由执业医师根据患者具体情况独立判断。"
            type="warning"
            showIcon
          />
        </Modal>
      )}
    </div>
  )
}
