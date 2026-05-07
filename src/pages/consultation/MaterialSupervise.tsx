import { useState } from 'react'
import { Card, Table, Button, Tag, Space, Typography, Modal, message, Select, DatePicker } from 'antd'
import {
  BellOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title, Text } = Typography

interface MaterialTask {
  id: string
  consultationId: string
  patientName: string
  patientInpatientNo: string
  meetingDate: string
  meetingTime: string
  department: string
  applyDoctor: string
  experts: Array<{ name: string; department: string }>
  status: '待提交' | '待秘书审核' | '待质控审核' | '审核通过' | '已退回'
  submitTime?: string
  rejectReason?: string
}

const mockTasks: MaterialTask[] = [
  {
    id: 'M001',
    consultationId: 'C001',
    patientName: '王建国',
    patientInpatientNo: 'ZY2024001234',
    meetingDate: '2024-03-15',
    meetingTime: '14:00-15:30',
    department: '肿瘤科',
    applyDoctor: '张明华',
    experts: [
      { name: '李芳', department: '胸外科' },
      { name: '王建国', department: '放射科' },
      { name: '刘晓燕', department: '病理科' }
    ],
    status: '待提交'
  },
  {
    id: 'M002',
    consultationId: 'C002',
    patientName: '李秀英',
    patientInpatientNo: 'ZY2024001256',
    meetingDate: '2024-03-14',
    meetingTime: '10:00-11:00',
    department: '乳腺外科',
    applyDoctor: '陈伟',
    experts: [
      { name: '陈伟', department: '乳腺外科' },
      { name: '张明华', department: '肿瘤科' }
    ],
    status: '待秘书审核',
    submitTime: '2024-03-14 15:30'
  },
  {
    id: 'M003',
    consultationId: 'C003',
    patientName: '张伟',
    patientInpatientNo: 'ZY2024001189',
    meetingDate: '2024-03-13',
    meetingTime: '15:00-16:30',
    department: '胃肠外科',
    applyDoctor: '王建国',
    experts: [
      { name: '王建国', department: '胃肠外科' },
      { name: '李芳', department: '肿瘤科' }
    ],
    status: '已退回',
    submitTime: '2024-03-13 18:00',
    rejectReason: '会诊记录过于简单，请补充专家讨论详情'
  },
  {
    id: 'M004',
    consultationId: 'C004',
    patientName: '刘芳',
    patientInpatientNo: 'ZY2024001356',
    meetingDate: '2024-03-12',
    meetingTime: '09:00-10:30',
    department: '消化内科',
    applyDoctor: '周丽萍',
    experts: [
      { name: '张明华', department: '肿瘤科' },
      { name: '周丽萍', department: '营养科' }
    ],
    status: '审核通过',
    submitTime: '2024-03-12 14:00'
  },
]

export default function MaterialSupervise() {
  const [tasks, setTasks] = useState(mockTasks)
  const [selectedTask, setSelectedTask] = useState<MaterialTask | null>(null)
  const [reminderVisible, setReminderVisible] = useState(false)

  const handleRemind = (task: MaterialTask) => {
    setSelectedTask(task)
    setReminderVisible(true)
  }

  const sendReminder = () => {
    // TODO: 发送通知
    message.success(`已提醒 ${selectedTask?.department} ${selectedTask?.applyDoctor} 医生提交会诊材料`)
    setReminderVisible(false)
  }

  const handleAudit = (task: MaterialTask) => {
    setSelectedTask(task)
    // TODO: 跳转到审核页面
    message.info('审核功能开发中...')
  }

  const columns: ColumnsType<MaterialTask> = [
    { title: '任务 ID', dataIndex: 'id', width: 80 },
    {
      title: '会诊 ID',
      dataIndex: 'consultationId',
      width: 100,
      render: t => <Tag color="blue">#{t}</Tag>
    },
    {
      title: '患者信息',
      key: 'patient',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.patientName}</div>
          <div className="text-xs text-gray-500">{record.patientInpatientNo}</div>
        </div>
      )
    },
    {
      title: '会诊时间',
      key: 'meetingTime',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.meetingTime}</div>
          <div className="text-xs text-gray-500">{record.meetingDate}</div>
        </div>
      )
    },
    { title: '申请科室', dataIndex: 'department', width: 120 },
    { title: '申请医生', dataIndex: 'applyDoctor', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (status: string) => {
        const config = {
          '待提交': { color: 'orange', icon: <ClockCircleOutlined /> },
          '待秘书审核': { color: 'blue', icon: <FileTextOutlined /> },
          '待质控审核': { color: 'purple', icon: <ExclamationCircleOutlined /> },
          '审核通过': { color: 'green', icon: <CheckCircleOutlined /> },
          '已退回': { color: 'red', icon: <ExclamationCircleOutlined /> }
        }
        const c = config[status as keyof typeof config]
        return (
          <Tag color={c.color} icon={c.icon}>
            {status}
          </Tag>
        )
      }
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      width: 160,
      render: (t?: string) => t ? <Text className="text-xs">{t}</Text> : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.status === '待提交' && (
            <Button
              type="primary"
              size="small"
              icon={<BellOutlined />}
              onClick={() => handleRemind(record)}
              block
            >
              提醒提交
            </Button>
          )}
          {record.status === '待秘书审核' && (
            <Button
              type="primary"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleAudit(record)}
              block
            >
              审核
            </Button>
          )}
          {['待质控审核', '审核通过', '已退回'].includes(record.status) && (
            <Button
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleAudit(record)}
              block
            >
              查看
            </Button>
          )}
        </Space>
      )
    },
  ]

  const pendingCount = tasks.filter(t => t.status === '待提交').length
  const auditingCount = tasks.filter(t => t.status === '待秘书审核').length

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4}>会诊材料督办</Title>
        <Space>
          <Text type="secondary">
            待提交：{pendingCount} 待审核：{auditingCount}
          </Text>
        </Space>
      </div>

      <Card>
        <Space className="mb-4">
          <Select placeholder="状态筛选" allowClear style={{ width: 150 }}>
            <Select.Option value="待提交">待提交</Select.Option>
            <Select.Option value="待秘书审核">待秘书审核</Select.Option>
            <Select.Option value="待质控审核">待质控审核</Select.Option>
            <Select.Option value="审核通过">审核通过</Select.Option>
            <Select.Option value="已退回">已退回</Select.Option>
          </Select>
          <Select placeholder="申请科室" allowClear style={{ width: 150 }}>
            <Select.Option value="肿瘤科">肿瘤科</Select.Option>
            <Select.Option value="胸外科">胸外科</Select.Option>
            <Select.Option value="乳腺外科">乳腺外科</Select.Option>
          </Select>
          <DatePicker placeholder="会诊日期" style={{ width: 150 }} />
        </Space>

        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={<><BellOutlined /> 提醒提交材料</>}
        open={reminderVisible}
        onCancel={() => setReminderVisible(false)}
        onOk={sendReminder}
        okText="发送提醒"
        cancelText="取消"
      >
        <div className="space-y-4">
          <p>
            确定要提醒 <Text strong>{selectedTask?.department}</Text> 的{' '}
            <Text strong>{selectedTask?.applyDoctor}</Text> 医生提交会诊材料吗？
          </p>
          <div className="p-4 bg-blue-50 rounded">
            <div className="space-y-2 text-sm">
              <div><Text strong>患者：</Text>{selectedTask?.patientName}</div>
              <div><Text strong>会诊时间：</Text>{selectedTask?.meetingDate} {selectedTask?.meetingTime}</div>
              <div><Text strong>会诊 ID：</Text>#{selectedTask?.consultationId}</div>
            </div>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <Text type="warning">提醒将通过系统消息和短信发送给申请医生</Text>
          </div>
        </div>
      </Modal>
    </div>
  )
}
