import { useState } from 'react'
import { Card, Table, Input, Select, Space, Typography, Tag, DatePicker } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { mockLogs } from '../../mocks/data'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

export default function Logs() {
  const [data] = useState(mockLogs)

  const columns: ColumnsType<typeof mockLogs[0]> = [
    { title: '时间', dataIndex: 'time', width: 180 },
    { title: '操作人', dataIndex: 'user' },
    { title: 'IP地址', dataIndex: 'ip', width: 120 },
    { title: '操作行为', dataIndex: 'action' },
    {
      title: '结果',
      dataIndex: 'result',
      render: (t: string) => (
        <Tag color={t === '成功' ? 'green' : 'red'}>{t}</Tag>
      )
    },
  ]

  return (
    <div className="space-y-4">
      <Title level={4}>系统日志</Title>

      <Card>
        <Space className="mb-4" wrap>
          <Input.Search
            placeholder="搜索操作人/操作内容"
            allowClear
            style={{ width: 250 }}
            prefix={<SearchOutlined />}
          />
          <Select placeholder="操作类型" allowClear style={{ width: 150 }}>
            <Select.Option value="login">登录</Select.Option>
            <Select.Option value="consultation">会诊</Select.Option>
            <Select.Option value="report">报告</Select.Option>
          </Select>
          <DatePicker.RangePicker />
        </Space>

        <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 15 }} />
      </Card>
    </div>
  )
}