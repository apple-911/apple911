import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button, Tag, Space, Modal, message, Typography, Descriptions, Input, Badge, Tabs, Statistic, Row, Col, Table, Select, Checkbox, Avatar } from 'antd'
import { CheckOutlined, CloseOutlined, UserOutlined, SearchOutlined, SendOutlined, PlusOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../stores/appStore'
import PatientInfo from '../../components/PatientInfo'

const { Title, Text } = Typography

interface Expert {
  id: string
  name: string
  department: string
  title: string
  specialty: string
  available: boolean
  expertise: string[]
}

interface ConsultationDetail {
  id: string
  consultationCode: string
  patientId: string
  patientName: string
  patientInpatientNo: string
  mainDiagnosis: string
  urgency: string
  department: string
  applyDoctor: string
  applyTime: string
  consultationPurpose: string
  expert_ids: string[]
}

export default function ExpertInvite() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAppStore()
  
  const [consultation, setConsultation] = useState<ConsultationDetail | null>(null)
  const [experts, setExperts] = useState<Expert[]>([])
  const [selectedExperts, setSelectedExperts] = useState<string[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // 获取会诊详情
      if (id) {
        const { data: consultationData, error: consultationError } = await supabase
          .from('consultations')
          .select('*')
          .eq('id', id)
          .single()

        if (consultationError) throw consultationError
        setConsultation(consultationData)
        setSelectedExperts(consultationData.expert_ids || [])
      }

      // 获取专家列表
      const { data: expertsData, error: expertsError } = await supabase
        .from('experts')
        .select('*')

      if (expertsError) throw expertsError
      
      const expertList: Expert[] = expertsData.map(e => ({
        id: e.id,
        name: e.name,
        department: e.department,
        title: e.title,
        specialty: e.specialty || '',
        available: true,
        expertise: e.expertise ? e.expertise.split(',') : []
      }))
      
      setExperts(expertList)
    } catch (err) {
      console.error('加载数据失败:', err)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const filteredExperts = experts.filter(expert => {
    const matchKeyword = !searchKeyword || 
      expert.name.includes(searchKeyword) || 
      expert.department.includes(searchKeyword) ||
      expert.specialty.includes(searchKeyword)
    
    const matchDepartment = !selectedDepartment || expert.department === selectedDepartment
    
    return matchKeyword && matchDepartment
  })

  const toggleExpert = (expertId: string) => {
    setSelectedExperts(prev => 
      prev.includes(expertId) 
        ? prev.filter(id => id !== expertId)
        : [...prev, expertId]
    )
  }

  const selectAll = () => {
    if (selectedExperts.length === filteredExperts.length) {
      setSelectedExperts([])
    } else {
      setSelectedExperts(filteredExperts.map(e => e.id))
    }
  }

  const handleSubmit = async () => {
    if (selectedExperts.length === 0) {
      message.warning('请至少选择一位专家')
      return
    }

    Modal.confirm({
      title: '确认邀请专家',
      content: `确认邀请 ${selectedExperts.length} 位专家参加会诊？`,
      okText: '确认邀请',
      cancelText: '取消',
      onOk: async () => {
        try {
          setSubmitting(true)
          
          await supabase
            .from('consultations')
            .update({ 
              expert_ids: selectedExperts,
              status: '专家邀请'
            })
            .eq('id', id)
          
          // 添加审核历史
          const auditInsert: any = {
            consultation_id: id,
            operator: user?.name,
            operator_role: 'MDT 秘书',
            node: '专家邀请',
            result: '已邀请',
            opinion: `已邀请 ${selectedExperts.length} 位专家`,
            time: new Date().toISOString(),
          }
          
          if (user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
            auditInsert.operator_id = user.id
          }
          
          await supabase
            .from('audit_history')
            .insert(auditInsert)
          
          message.success('专家邀请成功')
          setShowSuccessModal(true)
        } catch (err) {
          console.error('邀请专家失败:', err)
          message.error('邀请专家失败，请重试')
        } finally {
          setSubmitting(false)
        }
      }
    })
  }

  const departments = [...new Set(experts.map(e => e.department))]

  const columns: ColumnsType<Expert> = [
    {
      title: (
        <Checkbox 
          checked={selectedExperts.length === filteredExperts.length && filteredExperts.length > 0}
          onChange={selectAll}
        />
      ),
      width: 60,
      render: (_, record) => (
        <Checkbox 
          checked={selectedExperts.includes(record.id)}
          onChange={() => toggleExpert(record.id)}
        />
      )
    },
    {
      title: '专家信息',
      key: 'info',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Avatar icon={<UserOutlined />} size="small" />
            <div>
              <div className="font-medium">{record.name}</div>
              <div className="text-xs text-gray-500">{record.title}</div>
            </div>
          </Space>
        </Space>
      )
    },
    {
      title: '科室',
      dataIndex: 'department',
      width: 120,
      render: (dept: string) => <Tag color="blue">{dept}</Tag>
    },
    {
      title: '专业领域',
      dataIndex: 'specialty',
      width: 150,
      ellipsis: true
    },
    {
      title: '擅长方向',
      key: 'expertise',
      width: 200,
      render: (_, record) => (
        <Space wrap>
          {record.expertise.map((e, idx) => (
            <Tag key={idx} color="cyan">{e}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'available',
      width: 80,
      render: (available: boolean) => (
        <Badge 
          status={available ? 'success' : 'error'} 
          text={available ? '可预约' : '忙碌'}
        />
      )
    },
    {
      title: '操作',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => toggleExpert(record.id)}
          className={selectedExperts.includes(record.id) ? 'text-green-600' : ''}
        >
          {selectedExperts.includes(record.id) ? '取消选择' : '选择'}
        </Button>
      )
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4}>邀请专家</Title>
        <Button 
          onClick={() => navigate('/consultation/pending-review')}
          icon={<CloseOutlined />}
        >
          返回
        </Button>
      </div>

      {consultation && (
        <Card>
          <Row gutter={16}>
            <Col span={16}>
              <Descriptions bordered column={4} size="small">
                <Descriptions.Item label="会诊编码">
                  <Tag color="green">{consultation.consultationCode}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="患者姓名">{consultation.patientName}</Descriptions.Item>
                <Descriptions.Item label="住院号">{consultation.patientInpatientNo}</Descriptions.Item>
                <Descriptions.Item label="紧急程度">
                  <Tag color={consultation.urgency === '紧急' ? 'orange' : consultation.urgency === '特急' ? 'red' : 'default'}>
                    {consultation.urgency}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="主要诊断" span={4}>
                  <Tag color="orange">{consultation.mainDiagnosis}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="会诊目的" span={4}>
                  {consultation.consultationPurpose}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={8}>
              <PatientInfo
                patientId={consultation.patientId}
                patientName={consultation.patientName}
                patientInpatientNo={consultation.patientInpatientNo}
                compact={true}
              />
            </Col>
          </Row>
        </Card>
      )}

      <Card title={
        <Space>
          <UserOutlined />
          <span>专家列表</span>
          <Badge count={selectedExperts.length} color="green" />
        </Space>
      }>
        <div className="flex justify-between items-center mb-4">
          <Space>
            <Input
              placeholder="搜索专家姓名、科室或专业"
              prefix={<SearchOutlined />}
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              placeholder="筛选科室"
              value={selectedDepartment}
              onChange={setSelectedDepartment}
              style={{ width: 150 }}
              allowClear
            >
              {departments.map(dept => (
                <Select.Option key={dept} value={dept}>{dept}</Select.Option>
              ))}
            </Select>
          </Space>
          <Statistic
            title="已选专家"
            value={selectedExperts.length}
            suffix={`/ ${experts.length}`}
            valueStyle={{ color: '#1890ff' }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredExperts}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      </Card>

      <div className="flex justify-end">
        <Space>
          <Button onClick={() => navigate('/consultation/pending-review')}>
            取消
          </Button>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSubmit}
            loading={submitting}
            disabled={selectedExperts.length === 0}
          >
            发送邀请 ({selectedExperts.length})
          </Button>
        </Space>
      </div>

      <Modal
        title="邀请成功"
        open={showSuccessModal}
        footer={null}
        onCancel={() => {
          setShowSuccessModal(false)
          navigate('/consultation/pending-review')
        }}
      >
        <div className="text-center py-8">
          <div className="text-6xl mb-4">
            <CheckOutlined className="text-green-500" />
          </div>
          <Title level={3}>专家邀请成功</Title>
          <p className="text-gray-500 mt-2">
            已向 {selectedExperts.length} 位专家发送会诊邀请
          </p>
          <p className="text-gray-400 text-sm mt-4">
            专家将在系统中收到邀请通知，请等待专家确认
          </p>
          <Button
            type="primary"
            size="large"
            className="mt-6"
            onClick={() => {
              setShowSuccessModal(false)
              navigate('/consultation/pending-review')
            }}
          >
            返回待审核列表
          </Button>
        </div>
      </Modal>
    </div>
  )
}