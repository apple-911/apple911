import { useState } from 'react'
import { Card, Row, Col, Statistic, Typography, Select, Space, Table, Progress } from 'antd'
import {
  CalendarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  RiseOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

const monthlyData = [
  { month: '1月', count: 45 },
  { month: '2月', count: 52 },
  { month: '3月', count: 61 },
  { month: '4月', count: 58 },
  { month: '5月', count: 70 },
  { month: '6月', count: 75 },
]

const departmentData = [
  { department: '肿瘤科', count: 85, avgTime: 2.3 },
  { department: '胸外科', count: 42, avgTime: 1.8 },
  { department: '消化内科', count: 38, avgTime: 2.8 },
  { department: '呼吸科', count: 35, avgTime: 2.1 },
  { department: '泌尿外科', count: 28, avgTime: 3.2 },
]

const consultationTypeData = [
  { type: '院内会诊', value: 65, color: '#2c6e9e' },
  { type: '远程会诊', value: 35, color: '#52c41a' },
]

export default function Statistics() {
  const [timeRange, setTimeRange] = useState('month')

  const columns: ColumnsType<{ department: string; count: number; avgTime: number }> = [
    { title: '科室', dataIndex: 'department' },
    { title: '会诊量', dataIndex: 'count', sorter: (a, b) => a.count - b.count },
    {
      title: '平均完成时间(天)',
      dataIndex: 'avgTime',
      sorter: (a, b) => a.avgTime - b.avgTime,
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">统计分析看板</Title>
        <Select
          value={timeRange}
          onChange={setTimeRange}
          options={[
            { value: 'week', label: '本周' },
            { value: 'month', label: '本月' },
            { value: 'quarter', label: '本季度' },
            { value: 'year', label: '本年' },
          ]}
        />
      </div>

      <Row gutter={16}>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="会诊总数"
              value={328}
              prefix={<CalendarOutlined className="text-blue-500" />}
              suffix="例"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="平均响应时间"
              value={2.5}
              prefix={<ClockCircleOutlined className="text-green-500" />}
              suffix="小时"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="专家参与率"
              value={87}
              prefix={<TeamOutlined className="text-purple-500" />}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card hoverable>
            <Statistic
              title="较上月增长"
              value={12}
              prefix={<RiseOutlined className="text-red-500" />}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title={<Space><BarChartOutlined /> 每月会诊量趋势</Space>}>
            <div className="space-y-4">
              {monthlyData.map(item => (
                <div key={item.month} className="flex items-center gap-4">
                  <Text className="w-8">{item.month}</Text>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 relative">
                    <div
                      className="bg-medical-blue h-6 rounded-full"
                      style={{ width: `${(item.count / 80) * 100}%` }}
                    />
                    <Text className="absolute right-2 top-1 text-xs">{item.count}例</Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card title={<Space><PieChartOutlined /> 会诊类型分布</Space>}>
            <div className="space-y-4">
              {consultationTypeData.map(item => (
                <div key={item.type}>
                  <div className="flex justify-between mb-1">
                    <Text>{item.type}</Text>
                    <Text>{item.value}%</Text>
                  </div>
                  <Progress percent={item.value} showInfo={false} strokeColor={item.color} />
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Text type="secondary">总占比</Text>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card title="申请科室排名">
            <Space direction="vertical" className="w-full">
              {departmentData.slice(0, 5).map((item, index) => (
                <div key={item.department} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                    index === 0 ? '!bg-yellow-500' : index === 1 ? '!bg-gray-400' : index === 2 ? '!bg-orange-400' : '!bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <Text className="flex-1">{item.department}</Text>
                  <Text type="secondary">{item.count}例</Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="各科室平均报告完成时间">
        <Table columns={columns} dataSource={departmentData} rowKey="department" pagination={false} />
      </Card>
    </div>
  )
}