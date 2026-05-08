import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Tabs, Table, Tag, Button, Space, Typography, Empty, List, Avatar, message, Drawer, Descriptions, Tabs as AntdTabs, Badge } from 'antd'
import { CalendarOutlined, VideoCameraOutlined, TeamOutlined, ClockCircleOutlined, UserOutlined, FileTextOutlined, UploadOutlined, DatabaseOutlined, PictureOutlined, FilePdfOutlined, EyeOutlined } from '@ant-design/icons'
import { mockConsultations } from '../../mocks/data'
import type { Consultation, UploadedFile } from '../../stores/consultationStore'
import PatientInfo from '../../components/PatientInfo'

const { Title, Text } = Typography

export default function MyMeetings() {
  const [activeTab, setActiveTab] = useState('today')
  const [patientDrawerVisible, setPatientDrawerVisible] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [selectedPatientName, setSelectedPatientName] = useState<string>('')
  const [selectedPatientInpatientNo, setSelectedPatientInpatientNo] = useState<string>('')
  const navigate = useNavigate()

  const todayStr = new Date().toISOString().split('T')[0]

  const todayMeetings = mockConsultations.filter(c => c.status === '进行中')
  const weekMeetings = mockConsultations.filter(c => ['已通过', '进行中'].includes(c.status))
  const futureMeetings = mockConsultations.filter(c => c.status === '已通过')

  const handlePreOpinion = (item: Consultation) => {
    message.info('预审功能开发中')
  }

  const showPatientInfo = (patientId: string, patientName: string, patientInpatientNo: string) => {
    setSelectedPatientId(patientId)
    setSelectedPatientName(patientName)
    setSelectedPatientInpatientNo(patientInpatientNo)
    setPatientDrawerVisible(true)
  }

  const columns = [
    { title: '会诊主题', dataIndex: 'mainDiagnosis', ellipsis: true },
    { 
      title: '患者', 
      dataIndex: 'patientName', 
      render: (t: string, record: Consultation) => (
        <Space direction="vertical" size={0}>
          <Tag>{t}</Tag>
          <Button
            type="link"
            size="small"
            className="!p-0"
            icon={<UserOutlined />}
            onClick={() => showPatientInfo(record.patientId, record.patientName, record.patientInpatientNo)}
          >
            查看
          </Button>
        </Space>
      ) 
    },
    { title: '时间', dataIndex: 'expectTime' },
    { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color={t === '院内' ? 'blue' : 'green'}>{t}</Tag> },
    { title: '状态', dataIndex: 'status', render: (t: string) => <Tag color={t === '进行中' ? 'processing' : 'default'}>{t}</Tag> },
    {
      title: '操作',
      render: (_: any, record: Consultation) => (
        <Space>
          {record.status === '进行中' && (
            <Button
              type="primary"
              icon={<VideoCameraOutlined />}
              onClick={() => navigate(`/consultation/room/${record.id}`)}
            >
              进入会诊室
            </Button>
          )}
        </Space>
      )
    },
  ]

  const renderMeetingList = (meetings: Consultation[]) => {
    if (meetings.length === 0) {
      return <Empty description="暂无会诊" />
    }
    return (
      <List
        dataSource={meetings}
        renderItem={(item) => (
          <List.Item
            className="hover:bg-gray-50 cursor-pointer"
            onClick={() => navigate(`/consultation/detail/${item.id}`)}
            actions={[
              item.status === '进行中' ? (
                <Button key="enter" type="primary" size="small" onClick={(e) => { e.stopPropagation(); navigate(`/consultation/room/${item.id}`) }}>
                  进入
                </Button>
              ) : (
                <Button key="opinion" size="small" onClick={(e) => { e.stopPropagation(); handlePreOpinion(item) }}>
                  预审
                </Button>
              )
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<TeamOutlined />} style={{ background: 'var(--xiehe-green)' }} />}
              title={<Space>{item.mainDiagnosis}<Tag color={item.status === '进行中' ? 'processing' : 'default'}>{item.status}</Tag></Space>}
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">{item.patientName} | {item.expectTime}</Text>
                  <Space>
                    {item.experts.slice(0, 3).map(e => <Tag key={e.id} className="!m-0">{e.name}</Tag>)}
                  </Space>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    )
  }

  return (
    <div className="space-y-4">
      <Title level={4}>我的待参会</Title>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'today',
              label: <span><ClockCircleOutlined /> 今日</span>,
              children: renderMeetingList(todayMeetings),
            },
            {
              key: 'week',
              label: <span><CalendarOutlined /> 本周</span>,
              children: renderMeetingList(weekMeetings),
            },
            {
              key: 'future',
              label: <span><CalendarOutlined /> 未来</span>,
              children: renderMeetingList(futureMeetings),
            },
          ]}
        />
      </Card>

      <Card title="会诊列表">
        <Table columns={columns} dataSource={mockConsultations} rowKey="id" size="small" pagination={false} />
      </Card>

      <Drawer
        title="患者详细信息"
        placement="right"
        width={1200}
        open={patientDrawerVisible}
        onClose={() => setPatientDrawerVisible(false)}
      >
        {selectedPatientId && (() => {
          // 查找当前选中的会诊
          const selectedConsultation = mockConsultations.find(c => c.patientId === selectedPatientId)
          
          return (
            <div className="space-y-4">
              {/* 患者基本信息 */}
              <PatientInfo
                patientId={selectedPatientId}
                patientName={selectedPatientName}
                patientInpatientNo={selectedPatientInpatientNo}
                compact={false}
              />

              {/* 病历资料 */}
              {selectedConsultation?.medicalRecords && (
                <Card 
                  size="small" 
                  title={
                    <Space>
                      <FileTextOutlined />
                      <span>病历资料</span>
                      {selectedConsultation.hisDataSynced && (
                        <Tag color="green" icon={<DatabaseOutlined />}>
                          HIS 已同步
                        </Tag>
                      )}
                    </Space>
                  }
                  className="bg-green-50 border-green-200"
                >
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="主诉" span={2}>
                      <div className="whitespace-pre-wrap text-sm">{selectedConsultation.medicalRecords.chiefComplaint || '-'}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="现病史" span={2}>
                      <div className="whitespace-pre-wrap text-sm">{selectedConsultation.medicalRecords.presentIllness || '-'}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="既往史" span={2}>
                      <div className="whitespace-pre-wrap text-sm">{selectedConsultation.medicalRecords.pastHistory || '-'}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="体格检查" span={2}>
                      <div className="whitespace-pre-wrap text-sm">{selectedConsultation.medicalRecords.physicalExamination || '-'}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="辅助检查" span={2}>
                      <div className="whitespace-pre-wrap text-sm">{selectedConsultation.medicalRecords.auxiliaryExamination || '-'}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="初步诊断" span={2}>
                      <div className="whitespace-pre-wrap text-sm font-medium text-blue-600">{selectedConsultation.medicalRecords.initialDiagnosis || '-'}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="治疗方案" span={2}>
                      <div className="whitespace-pre-wrap text-sm">{selectedConsultation.medicalRecords.treatmentPlan || '-'}</div>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}

              {/* 附件材料 */}
              {selectedConsultation?.uploadedFiles && selectedConsultation.uploadedFiles.length > 0 && (
                <Card 
                  size="small" 
                  title={
                    <Space>
                      <UploadOutlined />
                      <span>附件材料（共 {selectedConsultation.uploadedFiles.length} 份）</span>
                    </Space>
                  }
                >
                  <AntdTabs
                    size="small"
                    type="card"
                    items={(() => {
                      const filesByType = selectedConsultation.uploadedFiles?.reduce((acc, file) => {
                        if (!acc[file.fileType]) {
                          acc[file.fileType] = []
                        }
                        acc[file.fileType].push(file)
                        return acc
                      }, {} as Record<string, typeof selectedConsultation.uploadedFiles>) || {}

                      return Object.keys(filesByType).map(type => ({
                        key: type,
                        label: (
                          <Space>
                            <span>{type}</span>
                            <Badge count={filesByType[type].length} size="small" />
                          </Space>
                        ),
                        children: (
                          <List
                            dataSource={filesByType[type]}
                            renderItem={(file) => (
                              <List.Item
                                actions={[
                                  <Space key="actions">
                                    <Button 
                                      type="link" 
                                      size="small" 
                                      icon={<EyeOutlined />}
                                      onClick={() => window.open(file.uploadUrl, '_blank')}
                                    >
                                      查看
                                    </Button>
                                    <Button 
                                      type="link" 
                                      size="small" 
                                      icon={<UploadOutlined />}
                                      onClick={() => {
                                        const link = document.createElement('a')
                                        link.href = file.uploadUrl
                                        link.download = file.fileName
                                        link.click()
                                      }}
                                    >
                                      下载
                                    </Button>
                                  </Space>
                                ]}
                              >
                                <List.Item.Meta
                                  avatar={
                                    <Avatar 
                                      icon={
                                        file.fileType.includes('影像') || file.fileType.includes('图片') ? 
                                          <PictureOutlined /> : 
                                          file.fileType.includes('病理') || file.fileName.endsWith('.pdf') ? 
                                            <FilePdfOutlined /> : 
                                            <FileTextOutlined />
                                      }
                                      size={40}
                                      style={{ backgroundColor: file.fromHIS ? '#52c41a' : '#1890ff' }}
                                    />
                                  }
                                  title={
                                    <Space>
                                      <Text strong>{file.fileName}</Text>
                                      {file.fromHIS && (
                                        <Tag color="green" icon={<DatabaseOutlined />}>HIS</Tag>
                                      )}
                                      <Tag color="default">{(file.fileSize / 1024).toFixed(1)} KB</Tag>
                                    </Space>
                                  }
                                  description={
                                    <div className="text-xs text-gray-500">
                                      上传时间：{new Date(file.uploadTime).toLocaleString()}
                                    </div>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        )
                      }))
                    })()}
                  />
                </Card>
              )}
            </div>
          )
        })()}
      </Drawer>
    </div>
  )
}