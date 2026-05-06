import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Button, Tag, Space, Input, Select, DatePicker, Modal, message, Typography } from 'antd'
import { EyeOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import { mockConsultations } from '../../mocks/data'
import type { ColumnsType } from 'antd/es/table'
import type { Consultation } from '../../stores/consultationStore'
import dayjs from 'dayjs'

const { Title } = Typography

export default function MyApplies() {
  const [data, setData] = useState(mockConsultations)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const navigate = useNavigate()

  const filteredData = data.filter(d => {
    if (statusFilter && d.status !== statusFilter) return false
    if (typeFilter && d.type !== typeFilter) return false
    return true
  })

  const handleRevoke = (id: string) => {
    Modal.confirm({
      title: '确认撤销',
      content: '确定要撤销这条会诊申请吗？',
      onOk: () => {
        setData(data.map(d => d.id === id ? { ...d, status: '已拒绝' as const } : d))
        message.success('已撤销申请')
      }
    })
  }

  const columns: ColumnsType<Consultation> = [
    { title: '申请单号', dataIndex: 'id', render: (t) => <Tag>#{t}</Tag> },
    { title: '患者姓名', dataIndex: 'patientName' },
    { title: '会诊类型', dataIndex: 'type', render: (t) => <Tag color={t === '院内' ? 'blue' : 'green'}>{t}</Tag> },
    { title: '申请时间', dataIndex: 'applyTime' },
    { title: '期望时间', dataIndex: 'expectTime' },
    { title: '主要诊断', dataIndex: 'mainDiagnosis', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      render: (t: Consultation['status']) => {
        const colors: Record<string, string> = {
          '待审核': 'orange',
          '已通过': 'green',
          '已拒绝': 'red',
          '已完成': 'blue',
          '进行中': 'processing',
        }
        return <Tag color={colors[t]}>{t}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space wrap size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/consultation/detail/${record.id}`)}
          >
            详情
          </Button>
          {record.status === '待审核' && (
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRevoke(record.id)}
            >
              撤销
            </Button>
          )}
        </Space>
      )
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">我的申请列表</Title>
        <Button type="primary" icon={<ReloadOutlined />} onClick={() => setData([...mockConsultations])}>
          刷新
        </Button>
      </div>

      <Card>
        <Space className="mb-4" wrap>
          <Select
            placeholder="状态筛选"
            allowClear
            style={{ width: 150 }}
            value={statusFilter || undefined}
            onChange={(v) => setStatusFilter(v || '')}
            options={[
              { value: '待审核', label: '待审核' },
              { value: '已通过', label: '已通过' },
              { value: '已拒绝', label: '已拒绝' },
              { value: '已完成', label: '已完成' },
            ]}
          />
          <Select
            placeholder="类型筛选"
            allowClear
            style={{ width: 120 }}
            value={typeFilter || undefined}
            onChange={(v) => setTypeFilter(v || '')}
            options={[
              { value: '院内', label: '院内' },
              { value: '远程', label: '远程' },
            ]}
          />
          <DatePicker.RangePicker />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>
    </div>
  )
}