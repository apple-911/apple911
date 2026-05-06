import { useState } from 'react'
import { Card, Table, Button, Tag, Space, Typography, Modal, Form, Input, Select, Upload, Avatar, message, InputNumber } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons'
import { mockExperts } from '../../mocks/data'
import type { Expert } from '../../stores/consultationStore'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

export default function ExpertList() {
  const [data, setData] = useState(mockExperts)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null)
  const [form] = Form.useForm()

  const handleAdd = () => {
    setEditingExpert(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (expert: Expert) => {
    setEditingExpert(expert)
    form.setFieldsValue(expert)
    setModalVisible(true)
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (editingExpert) {
        setData(data.map(e => e.id === editingExpert.id ? { ...e, ...values } : e))
        message.success('专家信息已更新')
      } else {
        setData([...data, { id: String(Date.now()), ...values }])
        message.success('专家已添加')
      }
      setModalVisible(false)
    })
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该专家吗？',
      onOk: () => {
        setData(data.filter(e => e.id !== id))
        message.success('已删除')
      }
    })
  }

  const columns: ColumnsType<Expert> = [
    {
      title: '姓名',
      dataIndex: 'name',
      render: (t, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} className="!bg-medical-blue" />
          {t}
        </Space>
      )
    },
    { title: '科室', dataIndex: 'department' },
    { title: '职称', dataIndex: 'title' },
    { title: '专业擅长', dataIndex: 'specialty', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'status',
      render: (t) => (
        <Tag color={t === '空闲' ? 'green' : t === '忙碌' ? 'orange' : 'gray'}>{t}</Tag>
      )
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>禁用</Button>
        </Space>
      )
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">专家库管理</Title>
        <Space>
          <Button icon={<UploadOutlined />}>导入</Button>
          <Button icon={<UploadOutlined />}>导出</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增专家</Button>
        </Space>
      </div>

      <Card>
        <Space className="mb-4">
          <Input.Search placeholder="搜索专家姓名/科室" allowClear style={{ width: 250 }} />
          <Select placeholder="筛选科室" allowClear style={{ width: 150 }}>
            <Select.Option value="肿瘤科">肿瘤科</Select.Option>
            <Select.Option value="胸外科">胸外科</Select.Option>
            <Select.Option value="放射科">放射科</Select.Option>
          </Select>
          <Select placeholder="筛选状态" allowClear style={{ width: 120 }}>
            <Select.Option value="空闲">空闲</Select.Option>
            <Select.Option value="忙碌">忙碌</Select.Option>
            <Select.Option value="离线">离线</Select.Option>
          </Select>
        </Space>

        <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editingExpert ? '编辑专家' : '新增专家'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="姓名" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Space style={{ width: '100%' }}>
            <Form.Item label="科室" name="department" rules={[{ required: true }]} className="flex-1">
              <Select>
                <Select.Option value="肿瘤科">肿瘤科</Select.Option>
                <Select.Option value="胸外科">胸外科</Select.Option>
                <Select.Option value="放射科">放射科</Select.Option>
                <Select.Option value="病理科">病理科</Select.Option>
                <Select.Option value="呼吸科">呼吸科</Select.Option>
                <Select.Option value="放疗科">放疗科</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="职称" name="title" rules={[{ required: true }]} className="flex-1">
              <Select>
                <Select.Option value="主任医师">主任医师</Select.Option>
                <Select.Option value="副主任医师">副主任医师</Select.Option>
                <Select.Option value="主治医师">主治医师</Select.Option>
              </Select>
            </Form.Item>
          </Space>
          <Form.Item label="专业擅长" name="specialty" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="状态" name="status" initialValue="空闲">
            <Select>
              <Select.Option value="空闲">空闲</Select.Option>
              <Select.Option value="忙碌">忙碌</Select.Option>
              <Select.Option value="离线">离线</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="执业证书">
            <Upload>
              <Button icon={<UploadOutlined />}>上传证书</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}