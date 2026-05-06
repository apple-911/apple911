import { useState } from 'react'
import { Card, Table, Tag, Space, Typography, DatePicker, Select, Input, Button, Badge } from 'antd'
import {
  SafetyOutlined,
  SearchOutlined,
  ExportOutlined,
  FilterOutlined,
} from '@ant-design/icons'
import { useAuditStore, AuditAction, AuditLog } from '../../stores/auditStore'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

export default function AuditLogs() {
  const { logs, getLogs } = useAuditStore()
  const [filters, setFilters] = useState({
    dateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null,
    action: undefined as AuditAction | undefined,
    userId: undefined as string | undefined,
    keyword: '',
  })

  const filteredLogs = getLogs({
    startDate: filters.dateRange?.[0].format('YYYY-MM-DD'),
    endDate: filters.dateRange?.[1].format('YYYY-MM-DD'),
    action: filters.action,
    userId: filters.userId,
  })

  const actionConfig: Record<AuditAction, { label: string; color: string }> = {
    [AuditAction.LOGIN]: { label: '用户登录', color: 'blue' },
    [AuditAction.LOGOUT]: { label: '用户登出', color: 'gray' },
    [AuditAction.VIEW_PATIENT]: { label: '查看患者', color: 'green' },
    [AuditAction.CREATE_CONSULTATION]: { label: '创建会诊', color: 'purple' },
    [AuditAction.APPROVE_CONSULTATION]: { label: '审核通过', color: 'green' },
    [AuditAction.REJECT_CONSULTATION]: { label: '审核拒绝', color: 'red' },
    [AuditAction.START_CONSULTATION]: { label: '开始会诊', color: 'blue' },
    [AuditAction.COMPLETE_CONSULTATION]: { label: '完成会诊', color: 'green' },
    [AuditAction.SIGN_REPORT]: { label: '签名报告', color: 'purple' },
    [AuditAction.MODIFY_REPORT]: { label: '修改报告', color: 'orange' },
    [AuditAction.EXPORT_DATA]: { label: '导出数据', color: 'orange' },
    [AuditAction.DELETE_DATA]: { label: '删除数据', color: 'red' },
    [AuditAction.ELECTRONIC_SIGNATURE]: { label: '电子签名', color: 'purple' },
    [AuditAction.SYSTEM_CONFIG]: { label: '系统配置', color: 'red' },
  }

  const columns = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: number) => (
        <Text className="font-mono">{dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')}</Text>
      ),
      sorter: (a: AuditLog, b: AuditLog) => a.timestamp - b.timestamp,
    },
    {
      title: '用户',
      key: 'user',
      width: 150,
      render: (_: any, record: AuditLog) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.userName}</Text>
          <Text type="secondary" className="text-xs">
            ID: {record.userId}
          </Text>
        </Space>
      ),
    },
    {
      title: '操作类型',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (action: AuditAction) => {
        const config = actionConfig[action] || { label: action, color: 'default' }
        return <Tag color={config.color}>{config.label}</Tag>
      },
      filters: Object.entries(actionConfig).map(([value, config]) => ({
        text: config.label,
        value,
      })),
      onFilter: (value: any, record: AuditLog) => record.action === value,
    },
    {
      title: '目标对象',
      key: 'target',
      width: 200,
      render: (_: any, record: AuditLog) => (
        <Space direction="vertical" size={0}>
          <Text>{record.targetType || '-'}</Text>
          <Text type="secondary" className="text-xs">
            {record.targetId || ''}
          </Text>
        </Space>
      ),
    },
    {
      title: 'IP 地址',
      dataIndex: 'ip',
      key: 'ip',
      width: 140,
      render: (ip: string) => <Text className="font-mono">{ip}</Text>,
    },
    {
      title: '结果',
      dataIndex: 'result',
      key: 'result',
      width: 100,
      render: (result: string) => (
        <Badge
          status={result === 'success' ? 'success' : 'error'}
          text={result === 'success' ? '成功' : '失败'}
        />
      ),
    },
    {
      title: '风险等级',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      width: 100,
      render: (riskLevel: string) => {
        const colorMap: Record<string, string> = {
          low: 'green',
          medium: 'orange',
          high: 'red',
        }
        const labelMap: Record<string, string> = {
          low: '低',
          medium: '中',
          high: '高',
        }
        return (
          <Tag color={colorMap[riskLevel] || 'default'}>
            {labelMap[riskLevel] || riskLevel}
          </Tag>
        )
      },
    },
    {
      title: '详情',
      dataIndex: 'details',
      key: 'details',
      width: 200,
      ellipsis: true,
      render: (details: any) => (
        <Text type="secondary" className="text-xs">
          {details ? JSON.stringify(details) : '-'}
        </Text>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Title level={4} className="!mb-0">
          <SafetyOutlined className="mr-2" />
          审计日志
        </Title>
        <Space>
          <Button icon={<ExportOutlined />}>导出日志</Button>
        </Space>
      </div>

      {/* 筛选条件 */}
      <Card>
        <Space wrap size="large">
          <div>
            <Text strong>时间范围：</Text>
            <RangePicker
              value={filters.dateRange}
              onChange={(value) => setFilters({ ...filters, dateRange: value as any })}
            />
          </div>
          <div>
            <Text strong>操作类型：</Text>
            <Select
              style={{ width: 150 }}
              placeholder="全部"
              allowClear
              onChange={(value) => setFilters({ ...filters, action: value })}
              options={Object.entries(actionConfig).map(([value, config]) => ({
                label: config.label,
                value,
              }))}
            />
          </div>
          <div>
            <Text strong>关键词：</Text>
            <Input
              placeholder="搜索用户、目标 ID"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            />
          </div>
          <Button type="primary" icon={<FilterOutlined />}>
            筛选
          </Button>
        </Space>
      </Card>

      {/* 日志列表 */}
      <Card>
        <Table
          dataSource={filteredLogs}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 统计信息 */}
      <Card className="bg-gray-50">
        <Space split={<span className="text-gray-300">|</span>}>
          <div>
            <Text type="secondary">总记录数：</Text>
            <Text strong>{logs.length}</Text>
          </div>
          <div>
            <Text type="secondary">高风险操作：</Text>
            <Text strong className="text-red-500">
              {logs.filter((l) => l.riskLevel === 'high').length}
            </Text>
          </div>
          <div>
            <Text type="secondary">中风险操作：</Text>
            <Text strong className="text-orange-500">
              {logs.filter((l) => l.riskLevel === 'medium').length}
            </Text>
          </div>
          <div>
            <Text type="secondary">成功率：</Text>
            <Text strong className="text-green-500">
              {logs.length > 0
                ? ((logs.filter((l) => l.result === 'success').length / logs.length) * 100).toFixed(1)
                : 0}%
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  )
}