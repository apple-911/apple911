import { useState } from 'react'
import { Card, Table, Button, Tag, Space, Typography, Modal, Form, Input, Select, Upload, Avatar, message, InputNumber, Drawer, Alert, Progress, Divider, Badge, List, Collapse, Spin } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, UserOutlined, RobotOutlined, ThunderboltOutlined, CheckCircleOutlined, StarOutlined, TeamOutlined } from '@ant-design/icons'
import { mockExperts } from '../../mocks/data'
import type { Expert } from '../../stores/consultationStore'
import type { ColumnsType } from 'antd/es/table'
import intelligentConsultationService, { ExpertMatch } from '../../services/integration/ai/intelligentConsultationService'

const { Title, Text } = Typography
const { Panel } = Collapse

// 专家匹配请求参数
interface MatchRequest {
  diagnosis: string
  condition: string
  urgency: '紧急' | '常规' | '择期'
  preferredDepartments?: string[]
}

export default function ExpertList() {
  const [data, setData] = useState(mockExperts)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingExpert, setEditingExpert] = useState<Expert | null>(null)
  const [form] = Form.useForm()
  
  // 智能匹配相关状态
  const [matchDrawerVisible, setMatchDrawerVisible] = useState(false)
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchRequest, setMatchRequest] = useState<MatchRequest>({
    diagnosis: '',
    condition: '',
    urgency: '常规'
  })
  const [matchedExperts, setMatchedExperts] = useState<ExpertMatch[]>([])
  const [matchForm] = Form.useForm()

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

  // 智能专家匹配
  const handleSmartMatch = async () => {
    try {
      const values = await matchForm.validateFields()
      setMatchLoading(true)
      
      // 调用 AI 服务进行专家匹配
      const result = await intelligentConsultationService.recommendExperts({
        diagnosis: values.diagnosis,
        condition: values.condition,
        urgency: values.urgency,
        preferredDepartments: values.preferredDepartments
      })
      
      setMatchedExperts(result)
      message.success(`找到 ${result.length} 位匹配专家`)
    } catch (error) {
      console.error('专家匹配失败:', error)
      message.error('匹配失败，请重试')
    } finally {
      setMatchLoading(false)
    }
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
          <Button 
            type="primary" 
            ghost
            icon={<RobotOutlined />} 
            onClick={() => setMatchDrawerVisible(true)}
          >
            智能匹配
          </Button>
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

      {/* 智能专家匹配抽屉 */}
      <Drawer
        title={
          <Space>
            <RobotOutlined style={{ color: '#1890ff' }} />
            <span>AI 智能专家匹配</span>
          </Space>
        }
        placement="right"
        width={600}
        open={matchDrawerVisible}
        onClose={() => {
          setMatchDrawerVisible(false)
          setMatchedExperts([])
        }}
      >
        <Alert
          type="info"
          message="智能匹配说明"
          description="基于患者病情、专家专长、历史案例、可用时间等多维度进行智能匹配，推荐最合适的专家组合。"
          showIcon
          className="mb-4"
        />
        
        <Form form={matchForm} layout="vertical">
          <Form.Item 
            label="患者诊断" 
            name="diagnosis"
            rules={[{ required: true, message: '请输入患者诊断' }]}
          >
            <Input.TextArea 
              rows={2} 
              placeholder="例如：右肺上叶肺腺癌 cT2aN2M0, IIIA期" 
            />
          </Form.Item>
          
          <Form.Item 
            label="病情描述" 
            name="condition"
            rules={[{ required: true, message: '请描述患者病情' }]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="详细描述患者病情、治疗需求、会诊目的等" 
            />
          </Form.Item>
          
          <Form.Item label="紧急程度" name="urgency" initialValue="常规">
            <Select>
              <Select.Option value="紧急">紧急</Select.Option>
              <Select.Option value="常规">常规</Select.Option>
              <Select.Option value="择期">择期</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="优先科室（可选）" name="preferredDepartments">
            <Select mode="multiple" placeholder="选择优先考虑的科室">
              <Select.Option value="肿瘤科">肿瘤科</Select.Option>
              <Select.Option value="胸外科">胸外科</Select.Option>
              <Select.Option value="放射科">放射科</Select.Option>
              <Select.Option value="病理科">病理科</Select.Option>
              <Select.Option value="呼吸科">呼吸科</Select.Option>
              <Select.Option value="放疗科">放疗科</Select.Option>
            </Select>
          </Form.Item>
          
          <Button 
            type="primary" 
            icon={<ThunderboltOutlined />}
            onClick={handleSmartMatch}
            loading={matchLoading}
            block
            size="large"
          >
            开始智能匹配
          </Button>
        </Form>
        
        {matchedExperts.length > 0 && (
          <>
            <Divider />
            <div className="mb-3">
              <Space>
                <TeamOutlined style={{ color: '#52c41a' }} />
                <Text strong>匹配结果（共 {matchedExperts.length} 位专家）</Text>
              </Space>
            </div>
            
            <List
              dataSource={matchedExperts}
              renderItem={(expert) => (
                <Card 
                  key={expert.expertId}
                  className="mb-3"
                  hoverable
                  actions={[
                    <Button type="link" icon={<StarOutlined />}>
                      收藏
                    </Button>,
                    <Button type="link" icon={<CheckCircleOutlined />}>
                      选择
                    </Button>
                  ]}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Space>
                      <Avatar size="large" className="!bg-medical-blue">
                        {expert.name[0]}
                      </Avatar>
                      <div>
                        <Text strong className="block">{expert.name}</Text>
                        <Text type="secondary">{expert.department} · {expert.title}</Text>
                      </div>
                    </Space>
                    <Badge 
                      count={`${(expert.matchScore * 100).toFixed(0)}%`} 
                      style={{ backgroundColor: '#52c41a' }}
                    />
                  </div>
                  
                  <div className="mb-2">
                    <Text type="secondary">专业擅长：</Text>
                    <Text>{expert.specialty}</Text>
                  </div>
                  
                  <div className="mb-2">
                    <Text type="secondary">匹配维度：</Text>
                    <div className="mt-1">
                      <Progress 
                        percent={expert.matchDimensions.specialtyMatch * 100} 
                        size="small" 
                        format={() => `专业匹配 ${expert.matchDimensions.specialtyMatch * 100}%`}
                      />
                      <Progress 
                        percent={expert.matchDimensions.availabilityMatch * 100} 
                        size="small" 
                        format={() => `时间匹配 ${expert.matchDimensions.availabilityMatch * 100}%`}
                      />
                      <Progress 
                        percent={expert.matchDimensions.workloadMatch * 100} 
                        size="small" 
                        format={() => `工作量匹配 ${expert.matchDimensions.workloadMatch * 100}%`}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Space split={<Divider type="vertical" />}>
                      <Text type="secondary">近期案例：{expert.recentCases} 例</Text>
                      <Text type="secondary">平均评分：{expert.averageRating.toFixed(1)} 分</Text>
                      <Text type="secondary">响应时间：{expert.responseTime} 小时</Text>
                    </Space>
                  </div>
                </Card>
              )}
            />
          </>
        )}
      </Drawer>
    </div>
  )
}