import { useState } from 'react'
import { Card, Table, Button, Tag, Space, Typography, Modal, Form, Select, DatePicker, Input, message } from 'antd'
import { PlusOutlined, EditOutlined, StopOutlined, CalendarOutlined } from '@ant-design/icons'
import { mockFollowupPlans } from '../../mocks/data'
import type { FollowupPlan } from '../../stores/consultationStore'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function FollowupList() {
  const [data, setData] = useState(mockFollowupPlans)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<FollowupPlan | null>(null)
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: FollowupPlan) => {
    setEditingRecord(record)
    setModalVisible(true)
    form.setFieldsValue({
      patient: record.patientName,
      purpose: record.purpose,
      doctor: record.doctor,
    })
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      console.log(values)
      message.success('随访计划创建成功')
      setModalVisible(false)
      form.resetFields()
    })
  }

  const handleTerminate = (id: string) => {
    Modal.confirm({
      title: '确认终止',
      content: '确定要终止该随访计划吗？',
      onOk: () => {
        setData(data.map(d => d.id === id ? { ...d, status: '已终止' as const } : d))
        message.success('已终止')
      }
    })
  }

  const columns: ColumnsType<FollowupPlan> = [
    { title: '患者', dataIndex: 'patientName' },
    { title: '随访目的', dataIndex: 'purpose', ellipsis: true },
    { title: '计划周期', render: (_, r) => `${r.startDate} ~ ${r.endDate}` },
    { title: '下次随访', dataIndex: 'nextFollowup' },
    { title: '负责医生', dataIndex: 'doctor' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (t) => <Tag color={t === '进行中' ? 'green' : t === '已完成' ? 'blue' : 'red'}>{t}</Tag>
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
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.status === '进行中' && (
            <Button size="small" danger icon={<StopOutlined />} onClick={() => handleTerminate(record.id)}>
              终止
            </Button>
          )}
        </Space>
      )
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">随访计划管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建随访计划
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editingRecord ? "编辑随访计划" : "新建随访计划"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="选择患者" name="patient" rules={[{ required: true }]}>
            <Select placeholder="请选择患者">
              <Select.Option value="P001">王建国</Select.Option>
              <Select.Option value="P002">李秀英</Select.Option>
              <Select.Option value="P003">张伟</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="随访目的" name="purpose" rules={[{ required: true }]}>
            <Input placeholder="请输入随访目的" />
          </Form.Item>
          <Form.Item label="计划周期" rules={[{ required: true }]}>
            <Space>
              <Form.Item name="startDate" noStyle>
                <DatePicker placeholder="开始日期" />
              </Form.Item>
              <Text>至</Text>
              <Form.Item name="endDate" noStyle>
                <DatePicker placeholder="结束日期" />
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item label="随访节点" name="nodes">
            <Select mode="tags" placeholder="添加随访时间点，如：1个月、3个月、6个月">
              <Select.Option value="1个月">1个月</Select.Option>
              <Select.Option value="3个月">3个月</Select.Option>
              <Select.Option value="6个月">6个月</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="执行医生" name="doctor" rules={[{ required: true }]}>
            <Select placeholder="选择执行医生">
              <Select.Option value="张明华">张明华</Select.Option>
              <Select.Option value="李芳">李芳</Select.Option>
              <Select.Option value="陈伟">陈伟</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}