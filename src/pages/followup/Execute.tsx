import { useState } from 'react'
import { Card, Table, Button, Tag, Space, Typography, Modal, Form, Input, Select, DatePicker, Rate, message, Badge, Tabs, Radio, Checkbox } from 'antd'
import { PhoneOutlined, VideoCameraOutlined, MessageOutlined, PlusOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { TextArea } = Input

// 随访方式
const FOLLOWUP_METHODS = [
  { value: 'phone', label: '电话随访', icon: <PhoneOutlined /> },
  { value: 'video', label: '视频随访', icon: <VideoCameraOutlined /> },
  { value: 'message', label: '消息随访', icon: <MessageOutlined /> },
  { value: 'visit', label: '门诊随访', icon: <CalendarOutlined /> },
]

// 随访评估项目
const ASSESSMENT_ITEMS = [
  { key: 'symptom', label: '症状评估', options: ['无不适', '轻度不适', '中度不适', '重度不适'] },
  { key: 'medication', label: '用药依从性', options: ['完全依从', '部分依从', '不依从'] },
  { key: 'diet', label: '饮食情况', options: ['正常', '一般', '较差'] },
  { key: 'sleep', label: '睡眠情况', options: ['良好', '一般', '较差'] },
  { key: 'mood', label: '情绪状态', options: ['良好', '焦虑', '抑郁'] },
  { key: 'exercise', label: '运动情况', options: ['规律运动', '偶尔运动', '缺乏运动'] },
]

// 随访记录数据类型
interface FollowupRecord {
  id: string
  patientName: string
  planId: string
  followupDate: string
  method: string
  symptom: string
  medication: string
  adherence: number
  notes: string
  nextFollowup: string
  doctor: string
  status: '已完成' | '未完成' | '已取消'
}

// 模拟数据
const mockRecords: FollowupRecord[] = [
  {
    id: '1',
    patientName: '王建国',
    planId: '1',
    followupDate: '2024-03-15',
    method: 'phone',
    symptom: '无不适',
    medication: '完全依从',
    adherence: 5,
    notes: '患者恢复良好，无特殊不适',
    nextFollowup: '2024-04-15',
    doctor: '张明华',
    status: '已完成',
  },
  {
    id: '2',
    patientName: '李秀英',
    planId: '2',
    followupDate: '2024-03-18',
    method: 'video',
    symptom: '轻度不适',
    medication: '部分依从',
    adherence: 3,
    notes: '伤口轻微疼痛，已指导用药',
    nextFollowup: '2024-04-18',
    doctor: '李芳',
    status: '已完成',
  },
  {
    id: '3',
    patientName: '张建国',
    planId: '3',
    followupDate: '2024-03-20',
    method: 'phone',
    symptom: '-',
    medication: '-',
    adherence: 0,
    notes: '-',
    nextFollowup: '2024-04-20',
    doctor: '陈伟',
    status: '未完成',
  },
]

export default function FollowupExecute() {
  const [records, setRecords] = useState(mockRecords)
  const [modalVisible, setModalVisible] = useState(false)
  const [recordType, setRecordType] = useState<'new' | 'reschedule'>('new')
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('pending')

  // 执行随访
  const handleExecute = (record: FollowupRecord) => {
    setRecordType('new')
    form.setFieldsValue({
      method: 'phone',
      symptom: '',
      medication: '',
      diet: '',
      sleep: '',
      mood: '',
      exercise: '',
      adherence: 5,
      notes: '',
    })
    setModalVisible(true)
  }

  // 重新预约
  const handleReschedule = (record: FollowupRecord) => {
    setRecordType('reschedule')
    form.setFieldsValue({
      reason: '',
      newDate: dayjs(),
    })
    setModalVisible(true)
  }

  // 提交随访记录
  const handleSubmit = () => {
    form.validateFields().then(values => {
      console.log('随访记录:', values)
      
      if (recordType === 'new') {
        // 完成随访
        const newRecord: FollowupRecord = {
          ...mockRecords.find(r => r.id === '3')!,
          ...values,
          status: '已完成',
          followupDate: dayjs().format('YYYY-MM-DD'),
        }
        setRecords(records.map(r => r.id === '3' ? newRecord : r))
        message.success('随访记录已保存')
      } else {
        // 重新预约
        message.success('已重新预约随访时间')
      }
      
      setModalVisible(false)
      form.resetFields()
    })
  }

  // 待随访列表
  const pendingColumns: ColumnsType<FollowupRecord> = [
    {
      title: '患者',
      dataIndex: 'patientName',
      fixed: 'left',
      width: 100,
    },
    {
      title: '计划随访日期',
      dataIndex: 'followupDate',
      sorter: (a, b) => a.followupDate.localeCompare(b.followupDate),
    },
    {
      title: '随访方式',
      render: (_, r) => {
        const method = FOLLOWUP_METHODS.find(m => m.value === r.method)
        return (
          <Tag icon={method?.icon} color="blue">
            {method?.label || '电话随访'}
          </Tag>
        )
      },
    },
    {
      title: '负责医生',
      dataIndex: 'doctor',
    },
    {
      title: '状态',
      render: () => (
        <Badge status="processing" text="待随访" />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space wrap size="small">
          <Button 
            size="small" 
            type="primary"
            icon={<PhoneOutlined />}
            onClick={() => handleExecute(record)}
          >
            执行随访
          </Button>
          <Button 
            size="small"
            icon={<CalendarOutlined />}
            onClick={() => handleReschedule(record)}
          >
            重新预约
          </Button>
        </Space>
      ),
    },
  ]

  // 已完成列表
  const completedColumns: ColumnsType<FollowupRecord> = [
    {
      title: '患者',
      dataIndex: 'patientName',
      fixed: 'left',
      width: 100,
    },
    {
      title: '随访日期',
      dataIndex: 'followupDate',
    },
    {
      title: '随访方式',
      render: (_, r) => {
        const method = FOLLOWUP_METHODS.find(m => m.value === r.method)
        return (
          <Tag icon={method?.icon} color="green">
            {method?.label}
          </Tag>
        )
      },
    },
    {
      title: '症状评估',
      dataIndex: 'symptom',
      render: (text) => <Tag color={text === '无不适' ? 'green' : 'orange'}>{text}</Tag>,
    },
    {
      title: '用药依从性',
      dataIndex: 'medication',
      render: (text) => <Tag color={text === '完全依从' ? 'green' : text === '部分依从' ? 'orange' : 'red'}>{text}</Tag>,
    },
    {
      title: '依从性评分',
      dataIndex: 'adherence',
      render: (score: number) => (
        <Rate disabled value={score} />
      ),
    },
    {
      title: '随访医生',
      dataIndex: 'doctor',
    },
    {
      title: '下次随访',
      dataIndex: 'nextFollowup',
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: '状态',
      render: () => (
        <Badge status="success" text="已完成" />
      ),
    },
  ]

  const tabItems = [
    {
      key: 'pending',
      label: '待随访',
      children: (
        <Table 
          columns={pendingColumns} 
          dataSource={records.filter(r => r.status === '未完成')} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      ),
    },
    {
      key: 'completed',
      label: '已完成',
      children: (
        <Table 
          columns={completedColumns} 
          dataSource={records.filter(r => r.status === '已完成')} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1400 }}
        />
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">随访执行</Title>
        <Space>
          <Badge count={records.filter(r => r.status === '未完成').length} overflowCount={99}>
            <Button type="primary" icon={<ClockCircleOutlined />}>
              待随访任务
            </Button>
          </Badge>
        </Space>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      {/* 随访记录 Modal */}
      <Modal
        title={recordType === 'new' ? '执行随访' : '重新预约随访'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        width={800}
      >
        {recordType === 'new' ? (
          <Form form={form} layout="vertical">
            <Card title="随访信息" size="small" className="mb-4">
              <Form.Item 
                label="随访方式" 
                name="method" 
                rules={[{ required: true, message: '请选择随访方式' }]}
              >
                <Radio.Group optionType="button" buttonStyle="solid">
                  {FOLLOWUP_METHODS.map(method => (
                    <Radio.Button key={method.value} value={method.value}>
                      {method.icon} {method.label}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </Form.Item>
            </Card>

            <Card title="评估项目" size="small" className="mb-4">
              <div className="grid grid-cols-2 gap-4">
                {ASSESSMENT_ITEMS.map(item => (
                  <Form.Item 
                    key={item.key}
                    label={item.label}
                    name={item.key}
                    className="!mb-3"
                  >
                    <Select allowClear>
                      {item.options.map(opt => (
                        <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                ))}
              </div>
            </Card>

            <Card title="用药依从性" size="small" className="mb-4">
              <Form.Item 
                label="依从性评分" 
                name="adherence"
                initialValue={5}
              >
                <Rate />
              </Form.Item>
              <Form.Item 
                label="用药说明" 
                name="medicationNote"
              >
                <TextArea rows={2} placeholder="患者用药情况说明..." />
              </Form.Item>
            </Card>

            <Card title="随访记录" size="small" className="mb-4">
              <Form.Item 
                label="随访小结" 
                name="notes"
                rules={[{ required: true, message: '请填写随访小结' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="记录患者当前状况、指导建议等..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Card>

            <Card title="下次随访" size="small">
              <Form.Item 
                label="建议下次随访时间" 
                name="nextFollowup"
                rules={[{ required: true, message: '请选择下次随访时间' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Card>
          </Form>
        ) : (
          <Form form={form} layout="vertical">
            <Form.Item 
              label="改期原因" 
              name="reason"
              rules={[{ required: true, message: '请填写改期原因' }]}
            >
              <TextArea rows={3} placeholder="请说明需要改期的原因..." />
            </Form.Item>
            <Form.Item 
              label="新的随访时间" 
              name="newDate"
              rules={[{ required: true, message: '请选择新的随访时间' }]}
            >
              <DatePicker showTime className="w-full" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  )
}
