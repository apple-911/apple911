import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Steps, Form, Input, Select, DatePicker, Button, Table, Tag, Space, message, Modal, Upload, List, Avatar, Typography, Row, Col } from 'antd'
import { SearchOutlined, UserAddOutlined, UploadOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { mockPatients, mockExperts } from '../../mocks/data'
import type { ColumnsType } from 'antd/es/table'
import type { Patient, Expert } from '../../stores/consultationStore'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Title, Text } = Typography

export default function Apply() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedExperts, setSelectedExperts] = useState<Expert[]>([])
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const patientColumns: ColumnsType<Patient> = [
    { title: '姓名', dataIndex: 'name', render: (t) => <a onClick={() => setSelectedPatient(mockPatients.find(p => p.name === t) || null)}>{t}</a> },
    { title: '住院号', dataIndex: 'inpatientNo' },
    { title: '性别', dataIndex: 'gender' },
    { title: '年龄', dataIndex: 'age' },
    { title: '主要诊断', dataIndex: 'mainDiagnosis', ellipsis: true },
    { title: '主治医生', dataIndex: 'doctor' },
  ]

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setCurrentStep(1)
    message.success(`已选择患者: ${patient.name}`)
  }

  const handleExpertSelect = (expert: Expert) => {
    if (!selectedExperts.find(e => e.id === expert.id)) {
      setSelectedExperts([...selectedExperts, expert])
    }
  }

  const handleRemoveExpert = (expertId: string) => {
    setSelectedExperts(selectedExperts.filter(e => e.id !== expertId))
  }

  const handleSubmit = async () => {
    const values = form.getFieldsValue()
    if (!selectedPatient) {
      message.error('请选择患者')
      return
    }
    if (selectedExperts.length === 0) {
      message.error('请至少选择一位会诊专家')
      return
    }
    await new Promise(r => setTimeout(r, 1000))
    message.success('会诊申请提交成功！')
    Modal.confirm({
      title: '申请已提交',
      content: '是否前往查看我的申请列表？',
      onOk: () => navigate('/consultation/my-applies'),
      onCancel: () => navigate('/consultation/my-applies'),
    })
  }

  return (
    <div className="space-y-4">
      <Title level={4}>申请会诊</Title>

      <Steps
        current={currentStep}
        items={[
          { title: '选择患者', icon: <SearchOutlined /> },
          { title: '填写信息', icon: <UserAddOutlined /> },
          { title: '邀请专家', icon: <UserAddOutlined /> },
          { title: '提交申请', icon: <CheckCircleOutlined /> },
        ]}
      />

      <Row gutter={16}>
        <Col span={selectedPatient ? 24 : 24}>
          <Card title="患者检索" className={selectedPatient ? 'border-green-500' : ''}>
            {currentStep === 0 && (
              <>
                <div className="mb-4">
                  <Input.Search
                    placeholder="输入姓名/住院号搜索患者"
                    allowClear
                    onSearch={(value) => {
                      if (!value) return
                      const patient = mockPatients.find(p =>
                        p.name.includes(value) || p.inpatientNo.includes(value)
                      )
                      if (patient) {
                        handlePatientSelect(patient)
                      } else {
                        message.warning('未找到患者')
                      }
                    }}
                  />
                </div>
                <Table
                  columns={patientColumns}
                  dataSource={mockPatients}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  onRow={(record) => ({
                    onClick: () => handlePatientSelect(record),
                    className: 'cursor-pointer hover:bg-blue-50',
                  })}
                />
              </>
            )}

            {selectedPatient && currentStep >= 1 && (
              <Card
                className="!bg-green-50 !border-green-200"
                title={
                  <Space>
                    <CheckCircleOutlined className="text-green-500" />
                    <span>已选患者</span>
                  </Space>
                }
              >
                <Row gutter={16}>
                  <Col span={6}><Text strong>姓名：</Text>{selectedPatient.name}</Col>
                  <Col span={6}><Text strong>住院号：</Text>{selectedPatient.inpatientNo}</Col>
                  <Col span={6}><Text strong>性别/年龄：</Text>{selectedPatient.gender}/{selectedPatient.age}</Col>
                  <Col span={6}><Text strong>主治医生：</Text>{selectedPatient.doctor}</Col>
                </Row>
                <Row gutter={16} className="mt-2">
                  <Col span={24}><Text strong>主要诊断：</Text>{selectedPatient.mainDiagnosis}</Col>
                </Row>
                <Button type="link" onClick={() => setCurrentStep(currentStep - 1)} className="!p-0">
                  重新选择
                </Button>
              </Card>
            )}
          </Card>
        </Col>
      </Row>

      {currentStep >= 1 && (
        <Card title="会诊信息">
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="会诊类型" name="type" initialValue="院内">
                  <Select options={[{ value: '院内', label: '院内会诊' }, { value: '远程', label: '远程会诊' }]} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="紧急程度" name="urgency" initialValue="普通">
                  <Select options={[
                    { value: '普通', label: '普通' },
                    { value: '紧急', label: '紧急' },
                    { value: '特急', label: '特急' },
                  ]} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="期望会诊时间" name="expectTime">
                  <DatePicker showTime className="!w-full" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="病情摘要" name="summary">
                  <TextArea rows={4} placeholder="请详细描述患者病情、会诊目的及需要讨论的问题..." />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="上传资料">
                  <Upload multiple>
                    <Button icon={<UploadOutlined />}>上传病历/影像/PDF</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}>上一步</Button>
            <Button type="primary" onClick={() => setCurrentStep(2)}>下一步</Button>
          </div>
        </Card>
      )}

      {currentStep >= 2 && (
        <Card title="邀请会诊专家">
          <div className="mb-4 flex gap-4">
            <Input.Search placeholder="按科室/职称筛选专家" allowClear />
            <Select placeholder="按科室" allowClear style={{ width: 150 }}>
              {Array.from(new Set(mockExperts.map(e => e.department))).map(d => (
                <Select.Option key={d} value={d}>{d}</Select.Option>
              ))}
            </Select>
          </div>
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <Title level={5}>可选专家</Title>
              <List
                dataSource={mockExperts}
                renderItem={(expert) => (
                  <List.Item
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleExpertSelect(expert)}
                    actions={[
                      <Button key="add" size="small" icon={<PlusOutlined />}>邀请</Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar className={expert.status === '忙碌' ? '!bg-orange-500' : expert.status === '离线' ? '!bg-gray-400' : '!bg-green-500'}>{expert.name[0]}</Avatar>}
                      title={<Space>{expert.name}<Tag>{expert.department}</Tag><Tag>{expert.title}</Tag></Space>}
                      description={expert.specialty}
                    />
                  </List.Item>
                )}
              />
            </Col>
            <Col span={8}>
              <Title level={5}>已选专家 ({selectedExperts.length})</Title>
              <List
                dataSource={selectedExperts}
                renderItem={(expert) => (
                  <List.Item
                    actions={[<Button key="remove" size="small" danger onClick={() => handleRemoveExpert(expert.id)}>移除</Button>]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar className="!bg-medical-blue">{expert.name[0]}</Avatar>}
                      title={expert.name}
                      description={expert.department}
                    />
                  </List.Item>
                )}
              />
            </Col>
          </Row>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setCurrentStep(1)}>上一步</Button>
            <Button type="primary" onClick={() => setCurrentStep(3)} disabled={selectedExperts.length === 0}>
              下一步
            </Button>
          </div>
        </Card>
      )}

      {currentStep >= 3 && (
        <Card title="确认提交">
          <Card type="inner" title="患者信息">
            <Text>姓名：{selectedPatient?.name} | 住院号：{selectedPatient?.inpatientNo} | 诊断：{selectedPatient?.mainDiagnosis}</Text>
          </Card>
          <Card type="inner" title="会诊信息" className="mt-2">
            <Text>类型：{form.getFieldValue('type')} | 紧急程度：{form.getFieldValue('urgency')}</Text>
            <br />
            <Text>期望时间：{form.getFieldValue('expectTime')?.format('YYYY-MM-DD HH:mm')}</Text>
          </Card>
          <Card type="inner" title="邀请专家" className="mt-2">
            <Space wrap>
              {selectedExperts.map(e => <Tag key={e.id} icon={<UserAddOutlined />}>{e.name} - {e.department}</Tag>)}
            </Space>
          </Card>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setCurrentStep(2)}>上一步</Button>
            <Button type="primary" onClick={handleSubmit} className="!bg-medical-blue">提交申请</Button>
          </div>
        </Card>
      )}
    </div>
  )
}