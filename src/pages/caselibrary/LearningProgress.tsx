import { useState } from 'react'
import { Card, Row, Col, Table, Tag, Space, Typography, Button, DatePicker, Select, Empty, Progress } from 'antd'
import { EyeOutlined, BookOutlined, DownloadOutlined, FilterOutlined } from '@ant-design/icons'
import { useCaseLibraryStore } from '../../stores/caseLibraryStore'
import { mockMedicalCases } from '../../mocks/caseData'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

export default function LearningProgress() {
  const { learningProgress, recentViews } = useCaseLibraryStore()
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const getCaseInfo = (caseId: string) => {
    return mockMedicalCases.find(c => c.id === caseId)
  }

  const progressColumns = [
    {
      title: '病案ID',
      dataIndex: 'caseId',
      key: 'caseId',
      width: 120,
      render: (id: string) => {
        const caseInfo = getCaseInfo(id)
        return (
          <Button type="link" onClick={() => window.location.href = `/case-library/detail/${id}`}>
            {id}
          </Button>
        )
      },
    },
    {
      title: '病案标题',
      key: 'caseTitle',
      ellipsis: true,
      render: (_: any, record: any) => {
        const caseInfo = getCaseInfo(record.caseId)
        return caseInfo?.caseTitle || '-'
      },
    },
    {
      title: '诊断',
      key: 'diagnosis',
      width: 200,
      render: (_: any, record: any) => {
        const caseInfo = getCaseInfo(record.caseId)
        return caseInfo ? <Tag color="red">{caseInfo.diagnosis.primary}</Tag> : '-'
      },
    },
    {
      title: '学习时长',
      dataIndex: 'viewDuration',
      key: 'viewDuration',
      width: 120,
      render: (seconds: number) => `${Math.floor(seconds / 60)}分钟`,
    },
    {
      title: '完成状态',
      dataIndex: 'completed',
      key: 'completed',
      width: 120,
      render: (completed: boolean) => (
        <Tag color={completed ? 'green' : 'orange'}>
          {completed ? '已完成' : '学习中'}
        </Tag>
      ),
    },
    {
      title: '笔记',
      dataIndex: 'notes',
      key: 'notes',
      width: 200,
      ellipsis: true,
      render: (text: string) => text ? <Text type="secondary">{text}</Text> : '-',
    },
    {
      title: '最后学习',
      dataIndex: 'viewedAt',
      key: 'viewedAt',
      width: 120,
    },
  ]

  const recentColumns = [
    {
      title: '病案ID',
      dataIndex: 'caseId',
      key: 'caseId',
      width: 120,
      render: (id: string) => (
        <Button type="link" onClick={() => window.location.href = `/case-library/detail/${id}`}>
          {id}
        </Button>
      ),
    },
    {
      title: '病案标题',
      key: 'caseTitle',
      render: (id: string) => {
        const caseInfo = getCaseInfo(id)
        return caseInfo?.caseTitle || '-'
      },
    },
    {
      title: '诊断',
      key: 'diagnosis',
      width: 200,
      render: (id: string) => {
        const caseInfo = getCaseInfo(id)
        return caseInfo ? <Tag color="red">{caseInfo.diagnosis.primary}</Tag> : '-'
      },
    },
  ]

  const completedCount = learningProgress.filter(p => p.completed).length
  const totalCount = learningProgress.length
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="mb-0">学习进度</Title>
        <Space>
          <Button icon={<DownloadOutlined />}>导出学习记录</Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <div className="text-center">
              <Text type="secondary">已学习病案</Text>
              <div className="text-3xl font-bold text-blue-600 mt-2">{totalCount}</div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div className="text-center">
              <Text type="secondary">已完成</Text>
              <div className="text-3xl font-bold text-green-600 mt-2">{completedCount}</div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div className="text-center">
              <Text type="secondary">完成率</Text>
              <div className="mt-2">
                <Progress type="circle" percent={completionRate} size={80} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="学习记录">
        {learningProgress.length > 0 ? (
          <Table
            columns={progressColumns}
            dataSource={learningProgress}
            rowKey="caseId"
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Empty description="暂无学习记录" />
        )}
      </Card>

      <Card title="最近浏览">
        {recentViews.length > 0 ? (
          <Table
            columns={recentColumns}
            dataSource={recentViews.map(id => ({ caseId: id }))}
            rowKey="caseId"
            pagination={false}
            size="small"
          />
        ) : (
          <Empty description="暂无浏览记录" />
        )}
      </Card>
    </div>
  )
}
