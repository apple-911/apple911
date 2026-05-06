import { useState } from 'react'
import { Card, Table, Button, Tag, Space, Typography, Modal, Form, Input, Select, Rate, message } from 'antd'
import { CheckOutlined, CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

interface QualityTask {
  id: string
  consultationId: string
  patientName: string
  consultationTime: string
  reviewer: string
  status: '待审核' | '已审核' | '已退回'
  score?: number
}

const mockTasks: QualityTask[] = [
  { id: 'Q001', consultationId: 'C001', patientName: '王建国', consultationTime: '2024-03-15', reviewer: '质控员A', status: '待审核' },
  { id: 'Q002', consultationId: 'C002', patientName: '李秀英', consultationTime: '2024-03-14', reviewer: '质控员A', status: '已审核', score: 4.5 },
  { id: 'Q003', consultationId: 'C003', patientName: '张伟', consultationTime: '2024-03-13', reviewer: '质控员B', status: '已退回' },
]

export default function QualityTasks() {
  const [tasks, setTasks] = useState(mockTasks)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedTask, setSelectedTask] = useState<QualityTask | null>(null)
  const [scores, setScores] = useState<Record<string, number>>({
    document: 0,
    guideline: 0,
    participation: 0,
  })
  const [comment, setComment] = useState('')
  const [form] = Form.useForm()

  const handleReview = (task: QualityTask) => {
    setSelectedTask(task)
    setModalVisible(true)
  }

  const handleSubmit = () => {
    const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0) / 3
    setTasks(tasks.map(t => t.id === selectedTask?.id ? { ...t, status: '已审核' as const, score: totalScore } : t))
    setModalVisible(false)
    message.success('质控审核完成')
  }

  const handleReturn = () => {
    setTasks(tasks.map(t => t.id === selectedTask?.id ? { ...t, status: '已退回' as const } : t))
    setModalVisible(false)
    message.warning('已退回要求整改')
  }

  const columns: ColumnsType<QualityTask> = [
    { title: '任务ID', dataIndex: 'id' },
    { title: '会诊ID', dataIndex: 'consultationId', render: t => <Tag>#{t}</Tag> },
    { title: '患者', dataIndex: 'patientName' },
    { title: '会诊时间', dataIndex: 'consultationTime' },
    { title: '审核人', dataIndex: 'reviewer' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (t: string) => (
        <Tag color={t === '待审核' ? 'orange' : t === '已审核' ? 'green' : 'red'}>{t}</Tag>
      )
    },
    {
      title: '评分',
      dataIndex: 'score',
      render: (s?: number) => s ? <Rate disabled defaultValue={s} allowHalf /> : '-'
    },
    {
      title: '操作',
      render: (_, record) => (
        record.status === '待审核' && (
          <Button type="primary" size="small" onClick={() => handleReview(record)}>
            审核
          </Button>
        )
      )
    },
  ]

  return (
    <div className="space-y-4">
      <Title level={4}>质控任务审核</Title>

      <Card>
        <Space className="mb-4">
          <Select placeholder="状态筛选" allowClear style={{ width: 150 }}>
            <Select.Option value="待审核">待审核</Select.Option>
            <Select.Option value="已审核">已审核</Select.Option>
            <Select.Option value="已退回">已退回</Select.Option>
          </Select>
          <Select placeholder="时间段" allowClear style={{ width: 150 }}>
            <Select.Option value="week">本周</Select.Option>
            <Select.Option value="month">本月</Select.Option>
          </Select>
        </Space>

        <Table columns={columns} dataSource={tasks} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined />
            <span>质控评分 - {selectedTask?.consultationId}</span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={600}
        footer={[
          <Button key="return" danger onClick={handleReturn}>
            <CloseOutlined /> 退回整改
          </Button>,
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            <CheckOutlined /> 提交审核
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded">
            <Text strong>会诊信息</Text>
            <div className="mt-2">
              <p>患者：{selectedTask?.patientName}</p>
              <p>会诊时间：{selectedTask?.consultationTime}</p>
            </div>
          </div>

          <Form form={form} layout="vertical">
            <Form.Item label="文书完整性">
              <Space>
                <Rate
                  value={scores.document}
                  onChange={(v) => setScores({ ...scores, document: v })}
                />
                <Text type="secondary">{scores.document}分</Text>
              </Space>
            </Form.Item>
            <Form.Item label="指南依从性">
              <Space>
                <Rate
                  value={scores.guideline}
                  onChange={(v) => setScores({ ...scores, guideline: v })}
                />
                <Text type="secondary">{scores.guideline}分</Text>
              </Space>
            </Form.Item>
            <Form.Item label="专家参与度">
              <Space>
                <Rate
                  value={scores.participation}
                  onChange={(v) => setScores({ ...scores, participation: v })}
                />
                <Text type="secondary">{scores.participation}分</Text>
              </Space>
            </Form.Item>
            <Form.Item label="质控意见">
              <Input.TextArea
                rows={3}
                placeholder="请输入质控意见..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Form.Item>
          </Form>

          <div className="p-4 bg-blue-50 rounded text-center">
            <Text strong>综合评分：</Text>
            <Text className="text-2xl text-medical-blue">
              {(Object.values(scores).reduce((sum, s) => sum + s, 0) / 3).toFixed(1)}
            </Text>
          </div>
        </div>
      </Modal>
    </div>
  )
}