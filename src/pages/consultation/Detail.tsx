import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Tabs, Tag, Space, Button, Descriptions, List, Avatar, Typography, Row, Col, Timeline, message, Modal, Badge } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  HistoryOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import { mockConsultations, mockPatients, mockReports } from '../../mocks/data'
import type { Patient } from '../../stores/consultationStore'

const { Title, Text } = Typography

export default function ConsultationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('info')

  const consultation = mockConsultations.find(c => c.id === id)
  const patient = consultation ? mockPatients.find(p => p.id === consultation.patientId) : null
  const report = consultation ? mockReports.find(r => r.consultationId === consultation.id) : null

  if (!consultation) {
    return (
      <Card>
        <Empty description="未找到会诊记录" />
        <Button onClick={() => navigate(-1)}>返回</Button>
      </Card>
    )
  }

  const patientInfo: Patient = patient || {
    id: consultation.patientId,
    name: consultation.patientName,
    gender: '男',
    age: 60,
    inpatientNo: consultation.patientInpatientNo,
    phone: '138****5678',
    mainDiagnosis: consultation.mainDiagnosis,
    admissionTime: '2024-03-01',
    department: consultation.department,
    doctor: consultation.applyDoctor,
    allergies: [],
    history: [],
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
          <Title level={4} className="!mb-0">会诊详情 #{consultation.id}</Title>
          <Tag color={consultation.status === '进行中' ? 'processing' : consultation.status === '已完成' ? 'success' : 'default'}>
            {consultation.status}
          </Tag>
        </Space>
        <Space>
          {consultation.status === '进行中' && (
            <Button type="primary" icon={<VideoCameraOutlined />} onClick={() => navigate(`/consultation/room/${id}`)}>
              进入会诊室
            </Button>
          )}
          {report && (
            <Button icon={<DownloadOutlined />}>下载报告</Button>
          )}
        </Space>
      </div>

      {/* 患者信息卡片 */}
      <Card 
        className="shadow-md"
        styles={{
          body: {
            background: 'linear-gradient(135deg, #f0f5ff 0%, #e6f4ff 100%)',
            padding: '24px',
            borderRadius: '8px'
          }
        }}
      >
        <Row gutter={24}>
          <Col span={6}>
            <div className="flex items-center gap-2 mb-1">
              <UserOutlined style={{ color: '#1890ff' }} />
              <Text className="!text-gray-600 !font-medium">患者姓名</Text>
            </div>
            <Title level={3} className="!text-gray-800 !mt-0 !mb-0">{consultation.patientName}</Title>
          </Col>
          <Col span={6}>
            <div className="flex items-center gap-2 mb-1">
              <FileTextOutlined style={{ color: '#1890ff' }} />
              <Text className="!text-gray-600 !font-medium">住院号</Text>
            </div>
            <Title level={3} className="!text-gray-800 !mt-0 !mb-0">{consultation.patientInpatientNo}</Title>
          </Col>
          <Col span={6}>
            <div className="flex items-center gap-2 mb-1">
              <TeamOutlined style={{ color: '#1890ff' }} />
              <Text className="!text-gray-600 !font-medium">主要诊断</Text>
            </div>
            <Title level={4} className="!text-gray-800 !mt-0 !mb-0" style={{ fontSize: '16px' }}>{consultation.mainDiagnosis}</Title>
          </Col>
          <Col span={6}>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="!bg-blue-500" />
              <Text className="!text-gray-600 !font-medium">会诊类型</Text>
            </div>
            <Title level={3} className="!text-gray-800 !mt-0 !mb-0">
              <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>{consultation.type}</Tag>
            </Title>
          </Col>
        </Row>
        <div className="mt-4 flex gap-4">
          <Button type="primary" ghost onClick={() => navigate(`/patient/360/${patientInfo.id}`)}>
            查看患者 360 视图
          </Button>
        </div>
      </Card>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'info',
              label: '会诊信息',
              children: (
                <div className="space-y-4">
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="申请医生">{consultation.applyDoctor}</Descriptions.Item>
                    <Descriptions.Item label="申请科室">{consultation.department}</Descriptions.Item>
                    <Descriptions.Item label="申请时间">{consultation.applyTime}</Descriptions.Item>
                    <Descriptions.Item label="期望时间">{consultation.expectTime}</Descriptions.Item>
                    <Descriptions.Item label="紧急程度">
                      <Tag color={consultation.urgency === '紧急' ? 'red' : consultation.urgency === '特急' ? 'orange' : 'default'}>
                        {consultation.urgency}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="状态">
                      <Badge status={consultation.status === '进行中' ? 'processing' : 'default'} text={consultation.status} />
                    </Descriptions.Item>
                  </Descriptions>

                  <Title level={5}>专家团队</Title>
                  <List
                    dataSource={consultation.experts}
                    renderItem={(expert) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar className={expert.status === '忙碌' ? '!bg-orange-500' : '!bg-green-500'}>{expert.name[0]}</Avatar>}
                          title={expert.name}
                          description={`${expert.department} - ${expert.title} | ${expert.specialty}`}
                        />
                        <Tag color={expert.status === '空闲' ? 'green' : expert.status === '忙碌' ? 'orange' : 'gray'}>
                          {expert.status === '空闲' ? '已签到' : expert.status === '忙碌' ? '参与中' : '未签到'}
                        </Tag>
                      </List.Item>
                    )}
                  />
                </div>
              )
            },
            {
              key: 'records',
              label: '资料库',
              children: (
                <div className="text-center py-8 text-gray-400">
                  <PictureOutlined className="text-4xl mb-2" />
                  <p>暂无上传资料</p>
                  <Button type="link">上传资料</Button>
                </div>
              )
            },
            {
              key: 'discussion',
              label: '讨论记录',
              children: (
                <Timeline
                  items={[
                    { color: 'blue', children: '[14:00] 张明华：患者目前情况稳定，建议先行化疗' },
                    { color: 'green', children: '[14:15] 李芳：同意张主任意见，建议使用GP方案' },
                    { color: 'blue', children: '[14:20] 王建国：影像学显示肿瘤有所缩小' },
                    { color: 'gray', children: '[14:30] 系统：讨论进行中...' },
                  ]}
                />
              )
            },
            {
              key: 'report',
              label: '报告',
              children: (
                report ? (
                  <Card type="inner" title="会诊报告">
                    <Descriptions column={1}>
                      <Descriptions.Item label="报告状态">
                        <Tag color={report.status === '已签名' ? 'green' : 'orange'}>{report.status}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="负责专家">{report.responsibleExpert}</Descriptions.Item>
                      <Descriptions.Item label="会诊时间">{report.consultationTime}</Descriptions.Item>
                    </Descriptions>
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                      <Text>{report.content || '报告内容暂无'}</Text>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button icon={<EditOutlined />}>编辑报告</Button>
                      <Button icon={<DownloadOutlined />}>导出PDF</Button>
                    </div>
                  </Card>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <FileTextOutlined className="text-4xl mb-2" />
                    <p>暂无会诊报告</p>
                    <Button type="link" onClick={() => navigate(`/report/edit/${consultation.id}`)}>编写报告</Button>
                  </div>
                )
              )
            },
          ]}
        />
      </Card>
    </div>
  )
}

function Empty({ description }: { description: string }) {
  return (
    <div className="text-center py-8 text-gray-400">
      <FileTextOutlined className="text-4xl mb-2" />
      <p>{description}</p>
    </div>
  )
}