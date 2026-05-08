import { useState } from 'react'
import { Card, Table, Tag, Button, Space, Modal, message, Typography, Descriptions, Input, Badge, Tabs, Statistic, Row, Col, Timeline, Calendar, List, Avatar, Tabs as AntdTabs } from 'antd'
import { CheckOutlined, CloseOutlined, EyeOutlined, ClockCircleOutlined, CalendarOutlined, UserOutlined, FileTextOutlined, PhoneOutlined, MedicineBoxOutlined, UploadOutlined, DatabaseOutlined, PictureOutlined, FilePdfOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { mockPatients } from '../../mocks/data'
import type { UploadedFile } from '../../stores/consultationStore'
import PatientInfo from '../../components/PatientInfo'

const { Title, Text } = Typography
const { TextArea } = Input

interface ExpertInvitation {
  id: string
  consultationId: string
  patientId: string
  patientName: string
  patientInpatientNo: string
  mainDiagnosis: string
  urgency: '普通' | '紧急' | '特急'
  department: string
  applyDoctor: string
  inviteTime: string
  expectTime: string
  status: '待确认' | '已接受' | '已拒绝'
  consultationPurpose: string
  otherExperts: Array<{ name: string; department: string; title: string }>
  materials: Array<{ name: string; type: string; uploaded: boolean }>
  // 新增字段
  medicalRecords?: {
    chiefComplaint?: string
    presentIllness?: string
    pastHistory?: string
    physicalExamination?: string
    auxiliaryExamination?: string
    initialDiagnosis?: string
    treatmentPlan?: string
  }
  uploadedFiles?: UploadedFile[]
  hisDataSynced?: boolean
  hisSyncTime?: string
}

const mockInvitations: ExpertInvitation[] = [
  {
    id: 'INV001',
    consultationId: 'C001',
    patientId: 'P001',
    patientName: '王建国',
    patientInpatientNo: 'ZY2024001234',
    mainDiagnosis: '左肺鳞癌 III 期',
    urgency: '紧急',
    department: '胸外科',
    applyDoctor: '张明华',
    inviteTime: '2024-03-15 10:00',
    expectTime: '2024-03-20 14:00',
    status: '待确认',
    consultationPurpose: '明确分期及后续治疗方案',
    otherExperts: [
      { name: '王建国', department: '放射科', title: '主任医师' },
      { name: '刘晓燕', department: '病理科', title: '主任医师' }
    ],
    materials: [
      { name: 'CT 影像报告', type: '影像', uploaded: true },
      { name: '病理报告', type: '病理', uploaded: true },
      { name: '既往病史', type: '病历', uploaded: true },
      { name: '检验报告', type: '检验', uploaded: false }
    ],
    medicalRecords: {
      chiefComplaint: '咳嗽、咳痰 3 个月，加重伴痰中带血 2 周',
      presentIllness: '患者 3 个月前无明显诱因出现咳嗽、咳痰，为阵发性刺激性干咳。2 周前症状加重，出现痰中带血。',
      pastHistory: '高血压病史 5 年，规律服药',
      physicalExamination: 'T 36.5℃ P 82 次/分 R 18 次/分 BP 135/85mmHg',
      auxiliaryExamination: '胸部 CT 示：左肺上叶占位性病变',
      initialDiagnosis: '左肺鳞癌 III 期',
      treatmentPlan: '拟行新辅助化疗后手术'
    },
    uploadedFiles: [
      {
        id: 'F001',
        fileName: '入院记录.pdf',
        fileType: '病历',
        fileSize: 524288,
        uploadTime: '2024-03-15 09:00',
        uploadUrl: '/files/001.pdf',
        fromHIS: true
      },
      {
        id: 'F002',
        fileName: '胸部 CT 报告.pdf',
        fileType: '检查报告',
        fileSize: 1048576,
        uploadTime: '2024-03-15 09:05',
        uploadUrl: '/files/002.pdf',
        fromHIS: true
      },
      {
        id: 'F003',
        fileName: '病理活检报告.pdf',
        fileType: '病理报告',
        fileSize: 768000,
        uploadTime: '2024-03-15 09:10',
        uploadUrl: '/files/003.pdf',
        fromHIS: false
      }
    ],
    hisDataSynced: true,
    hisSyncTime: '2024-03-15 08:55'
  },
  {
    id: 'INV002',
    consultationId: 'C006',
    patientId: 'P002',
    patientName: '李秀英',
    patientInpatientNo: 'ZY2024001256',
    mainDiagnosis: '乳腺癌改良根治术后辅助治疗',
    urgency: '普通',
    department: '乳腺外科',
    applyDoctor: '陈伟',
    inviteTime: '2024-03-15 15:00',
    expectTime: '2024-03-22 10:00',
    status: '待确认',
    consultationPurpose: '制定术后辅助化疗方案',
    otherExperts: [
      { name: '陈伟', department: '肿瘤科', title: '副主任医师' }
    ],
    materials: [
      { name: '手术记录', type: '病历', uploaded: true },
      { name: '病理报告', type: '病理', uploaded: true },
      { name: '免疫组化结果', type: '病理', uploaded: true }
    ],
    medicalRecords: {
      chiefComplaint: '乳腺癌术后 1 个月，要求辅助治疗',
      presentIllness: '患者 1 个月前因"右乳癌"行改良根治术，术后恢复良好。',
      pastHistory: '骨质疏松症病史 3 年',
      physicalExamination: 'T 36.3℃ P 76 次/分 R 16 次/分 BP 120/75mmHg',
      auxiliaryExamination: '术后病理：右乳浸润性导管癌，pT2N1M0',
      initialDiagnosis: '右乳癌术后 pT2N1M0 IIB 期',
      treatmentPlan: '拟行辅助化疗 + 内分泌治疗'
    },
    uploadedFiles: [
      {
        id: 'F006',
        fileName: '手术记录.pdf',
        fileType: '病历',
        fileSize: 614400,
        uploadTime: '2024-03-15 14:00',
        uploadUrl: '/files/006.pdf',
        fromHIS: true
      },
      {
        id: 'F007',
        fileName: '术后病理报告.pdf',
        fileType: '病理报告',
        fileSize: 921600,
        uploadTime: '2024-03-15 14:05',
        uploadUrl: '/files/007.pdf',
        fromHIS: true
      }
    ],
    hisDataSynced: true,
    hisSyncTime: '2024-03-15 13:55'
  },
  {
    id: 'INV003',
    consultationId: 'C010',
    patientId: 'P003',
    patientName: '周明',
    patientInpatientNo: 'ZY2024001289',
    mainDiagnosis: '肝癌介入治疗后复查',
    urgency: '普通',
    department: '肝胆外科',
    applyDoctor: '刘洋',
    inviteTime: '2024-03-14 09:00',
    expectTime: '2024-03-21 15:00',
    status: '已接受',
    consultationPurpose: '评估介入治疗效果及后续治疗方案',
    otherExperts: [
      { name: '张伟', department: '肿瘤科', title: '主任医师' },
      { name: '赵红梅', department: '影像科', title: '副主任医师' }
    ],
    materials: [
      { name: '介入手术记录', type: '病历', uploaded: true },
      { name: 'MRI 影像', type: '影像', uploaded: true },
      { name: '肿瘤标志物检测', type: '检验', uploaded: true }
    ],
    medicalRecords: {
      chiefComplaint: '肝癌介入治疗后 3 个月，要求复查',
      presentIllness: '患者 3 个月前因"原发性肝癌"行肝动脉介入治疗，术后恢复良好。',
      pastHistory: '乙肝病史 20 年，肝硬化病史 5 年',
      physicalExamination: 'T 36.4℃ P 78 次/分 R 17 次/分 BP 125/80mmHg',
      auxiliaryExamination: '腹部 MRI 示：肝右叶介入治疗后改变，碘油沉积良好',
      initialDiagnosis: '原发性肝癌介入治疗后 TACE 术后',
      treatmentPlan: '继续随访观察，必要时再次介入治疗'
    },
    uploadedFiles: [
      {
        id: 'F010',
        fileName: '介入手术记录.pdf',
        fileType: '病历',
        fileSize: 716800,
        uploadTime: '2024-03-14 08:00',
        uploadUrl: '/files/010.pdf',
        fromHIS: true
      },
      {
        id: 'F011',
        fileName: 'MRI 影像报告.pdf',
        fileType: '检查报告',
        fileSize: 1228800,
        uploadTime: '2024-03-14 08:05',
        uploadUrl: '/files/011.pdf',
        fromHIS: true
      },
      {
        id: 'F012',
        fileName: '肿瘤标志物检测结果.pdf',
        fileType: '检验报告',
        fileSize: 409600,
        uploadTime: '2024-03-14 08:10',
        uploadUrl: '/files/012.pdf',
        fromHIS: true
      }
    ],
    hisDataSynced: true,
    hisSyncTime: '2024-03-14 07:55'
  }
]

const urgencyConfig = {
  '普通': { color: 'default' },
  '紧急': { color: 'orange' },
  '特急': { color: 'red' },
}

const statusConfig = {
  '待确认': { color: 'orange', label: '待确认' },
  '已接受': { color: 'green', label: '已接受' },
  '已拒绝': { color: 'red', label: '已拒绝' },
}

export default function ExpertConfirm() {
  const [data] = useState<ExpertInvitation[]>(mockInvitations)
  const [detailVisible, setDetailVisible] = useState(false)
  const [rejectVisible, setRejectVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ExpertInvitation | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [activeTab, setActiveTab] = useState('pending')
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false)

  const pendingData = data.filter(item => item.status === '待确认')
  const processedData = data.filter(item => item.status !== '待确认')

  const getPatientInfo = (patientId: string) => {
    return mockPatients.find(p => p.id === patientId)
  }

  const handleAccept = (item: ExpertInvitation) => {
    Modal.confirm({
      title: '确认参加会诊',
      content: `确认参加患者 ${item.patientName} 的会诊？`,
      okText: '确认参加',
      cancelText: '取消',
      onOk: () => {
        message.success(`已确认参加 ${item.patientName} 的会诊`)
        setScheduleModalVisible(true)
      }
    })
  }

  const handleReject = (item: ExpertInvitation) => {
    setSelectedItem(item)
    setRejectReason('')
    setRejectVisible(true)
  }

  const submitReject = () => {
    if (!rejectReason.trim()) {
      message.warning('请填写拒绝原因')
      return
    }
    message.success(`已拒绝 ${selectedItem?.patientName} 的会诊邀请`)
    setRejectVisible(false)
    setSelectedItem(null)
    setRejectReason('')
  }

  const handleViewDetail = (item: ExpertInvitation) => {
    setSelectedItem(item)
    setDetailVisible(true)
  }

  const columns: ColumnsType<ExpertInvitation> = [
    {
      title: '邀请ID',
      dataIndex: 'id',
      width: 100,
      render: (id: string) => <Tag color="blue">{id}</Tag>
    },
    {
      title: '会诊ID',
      dataIndex: 'consultationId',
      width: 100,
      render: (id: string) => <Tag>{id}</Tag>
    },
    {
      title: '患者信息',
      key: 'patient',
      width: 150,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <UserOutlined />
            <Text strong>{record.patientName}</Text>
          </Space>
          <Text type="secondary" className="text-xs">{record.patientInpatientNo}</Text>
        </Space>
      )
    },
    {
      title: '主要诊断',
      dataIndex: 'mainDiagnosis',
      ellipsis: true,
      width: 200,
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      width: 100,
      render: (urgency: string) => <Tag color={urgencyConfig[urgency as keyof typeof urgencyConfig]?.color}>{urgency}</Tag>
    },
    {
      title: '申请医生',
      dataIndex: 'applyDoctor',
      width: 120,
    },
    {
      title: '邀请时间',
      dataIndex: 'inviteTime',
      width: 150,
    },
    {
      title: '期望会诊时间',
      dataIndex: 'expectTime',
      width: 150,
      render: (time: string) => (
        <Space>
          <CalendarOutlined />
          <Text>{time}</Text>
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => (
        <Badge
          status={statusConfig[status as keyof typeof statusConfig]?.color as any}
          text={statusConfig[status as keyof typeof statusConfig]?.label}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === '待确认' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                className="text-green-600"
                onClick={() => handleAccept(record)}
              >
                接受
              </Button>
              <Button
                type="link"
                size="small"
                icon={<CloseOutlined />}
                danger
                onClick={() => handleReject(record)}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <div className="space-y-4">
      <Title level={4}>专家会诊确认</Title>

      <Row gutter={16} className="mb-4">
        <Col span={6}>
          <Card>
            <Statistic
              title="待确认"
              value={pendingData.length}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已接受"
              value={data.filter(d => d.status === '已接受').length}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已拒绝"
              value={data.filter(d => d.status === '已拒绝').length}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="接受率"
              value={Math.round(data.filter(d => d.status === '已接受').length / data.length * 100)}
              suffix="%"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'pending',
              label: <span><Badge count={pendingData.length} offset={[5, 0]} /> 待确认</span>,
              children: (
                <Table
                  columns={columns}
                  dataSource={pendingData}
                  rowKey="id"
                  scroll={{ x: 1400 }}
                  pagination={{ pageSize: 10 }}
                />
              )
            },
            {
              key: 'processed',
              label: '已处理',
              children: (
                <Table
                  columns={columns}
                  dataSource={processedData}
                  rowKey="id"
                  scroll={{ x: 1400 }}
                  pagination={{ pageSize: 10 }}
                />
              )
            }
          ]}
        />
      </Card>

      <Modal
        title="会诊邀请详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
          selectedItem?.status === '待确认' && (
            <Button
              key="reject"
              danger
              icon={<CloseOutlined />}
              onClick={() => {
                setDetailVisible(false)
                handleReject(selectedItem)
              }}
            >
              拒绝
            </Button>
          ),
          selectedItem?.status === '待确认' && (
            <Button
              key="accept"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                setDetailVisible(false)
                handleAccept(selectedItem)
              }}
            >
              接受邀请
            </Button>
          )
        ]}
        width={1200}
      >
        {selectedItem && (() => {
          const patientInfo = getPatientInfo(selectedItem.patientId)
          return (
            <div className="space-y-4">
              {/* 患者基本信息 */}
              <PatientInfo
                patientId={selectedItem.patientId}
                patientName={selectedItem.patientName}
                patientInpatientNo={selectedItem.patientInpatientNo}
                compact={false}
              />

              {/* 会诊邀请信息 */}
              <Card size="small" title={<Space><FileTextOutlined />会诊邀请信息</Space>}>
                <Descriptions bordered column={3} size="small">
                  <Descriptions.Item label="邀请 ID">{selectedItem.id}</Descriptions.Item>
                  <Descriptions.Item label="会诊 ID">{selectedItem.consultationId}</Descriptions.Item>
                  <Descriptions.Item label="紧急程度">
                    <Tag color={urgencyConfig[selectedItem.urgency]?.color}>{selectedItem.urgency}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="状态">
                    <Badge
                      status={statusConfig[selectedItem.status as keyof typeof statusConfig]?.color as any}
                      text={statusConfig[selectedItem.status as keyof typeof statusConfig]?.label}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="申请医生">{selectedItem.applyDoctor}</Descriptions.Item>
                  <Descriptions.Item label="邀请时间">{selectedItem.inviteTime}</Descriptions.Item>
                  <Descriptions.Item label="期望会诊时间" span={3}>
                    <Space>
                      <CalendarOutlined />
                      <Text strong>{selectedItem.expectTime}</Text>
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="主要诊断" span={3}>
                    <Tag color="orange">{selectedItem.mainDiagnosis}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="会诊目的" span={3}>{selectedItem.consultationPurpose}</Descriptions.Item>
                  <Descriptions.Item label="其他参会专家" span={3}>
                    <Space wrap>
                      {selectedItem.otherExperts.map(e => (
                        <Tag key={e.name} color="cyan">{e.name} - {e.department} - {e.title}</Tag>
                      ))}
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* 病历资料 + 附件材料 */}
              <AntdTabs
                size="small"
                type="card"
                items={[
                  {
                    key: 'records',
                    label: (
                      <Space>
                        <FileTextOutlined />
                        <span>病历资料</span>
                      </Space>
                    ),
                    children: (
                      <Card 
                        size="small" 
                        title={
                          <Space>
                            <FileTextOutlined />
                            <span>结构化病历</span>
                            {selectedItem.hisDataSynced && (
                              <Tag color="green" icon={<DatabaseOutlined />}>
                                HIS 已同步 {selectedItem.hisSyncTime}
                              </Tag>
                            )}
                          </Space>
                        }
                        className="bg-green-50 border-green-200"
                      >
                        <Descriptions column={2} size="small">
                          <Descriptions.Item label="主诉" span={2}>
                            <div className="whitespace-pre-wrap text-sm">{selectedItem.medicalRecords?.chiefComplaint || '-'}</div>
                          </Descriptions.Item>
                          <Descriptions.Item label="现病史" span={2}>
                            <div className="whitespace-pre-wrap text-sm">{selectedItem.medicalRecords?.presentIllness || '-'}</div>
                          </Descriptions.Item>
                          <Descriptions.Item label="既往史" span={2}>
                            <div className="whitespace-pre-wrap text-sm">{selectedItem.medicalRecords?.pastHistory || '-'}</div>
                          </Descriptions.Item>
                          <Descriptions.Item label="体格检查" span={2}>
                            <div className="whitespace-pre-wrap text-sm">{selectedItem.medicalRecords?.physicalExamination || '-'}</div>
                          </Descriptions.Item>
                          <Descriptions.Item label="辅助检查" span={2}>
                            <div className="whitespace-pre-wrap text-sm">{selectedItem.medicalRecords?.auxiliaryExamination || '-'}</div>
                          </Descriptions.Item>
                          <Descriptions.Item label="初步诊断" span={2}>
                            <div className="whitespace-pre-wrap text-sm font-medium text-blue-600">{selectedItem.medicalRecords?.initialDiagnosis || '-'}</div>
                          </Descriptions.Item>
                          <Descriptions.Item label="治疗方案" span={2}>
                            <div className="whitespace-pre-wrap text-sm">{selectedItem.medicalRecords?.treatmentPlan || '-'}</div>
                          </Descriptions.Item>
                        </Descriptions>
                      </Card>
                    )
                  },
                  {
                    key: 'attachments',
                    label: (
                      <Space>
                        <UploadOutlined />
                        <span>附件材料</span>
                        {selectedItem.uploadedFiles && (
                          <Badge count={selectedItem.uploadedFiles.length} size="small" />
                        )}
                      </Space>
                    ),
                    children: (
                      <Card size="small" title={<Space><UploadOutlined />上传的附件（共 {selectedItem.uploadedFiles?.length || 0} 份）</Space>}>
                        {selectedItem.uploadedFiles && selectedItem.uploadedFiles.length > 0 ? (
                          <Tabs
                            size="small"
                            type="card"
                            items={(() => {
                              const filesByType = selectedItem.uploadedFiles?.reduce((acc, file) => {
                                if (!acc[file.fileType]) {
                                  acc[file.fileType] = []
                                }
                                acc[file.fileType].push(file)
                                return acc
                              }, {} as Record<string, typeof selectedItem.uploadedFiles>) || {}

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
                        ) : (
                          <div className="text-center py-8 text-gray-400">
                            <UploadOutlined className="text-4xl mb-2" />
                            <div>暂无附件材料</div>
                          </div>
                        )}
                      </Card>
                    )
                  }
                ]}
              />
            </div>
          )
        })()}
      </Modal>

      <Modal
        title="拒绝原因"
        open={rejectVisible}
        onOk={submitReject}
        onCancel={() => setRejectVisible(false)}
        okText="提交"
        cancelText="取消"
      >
        <div className="space-y-2">
          <Text>会诊邀请：{selectedItem?.patientName} ({selectedItem?.consultationId})</Text>
          <TextArea
            rows={4}
            placeholder="请输入拒绝原因，将反馈给申请医生和秘书"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        title="选择可参会时间"
        open={scheduleModalVisible}
        onCancel={() => setScheduleModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setScheduleModalVisible(false)}>
            关闭
          </Button>,
          <Button key="confirm" type="primary">
            确认时间
          </Button>
        ]}
        width={600}
      >
        <div className="space-y-4">
          <Text>请选择您可以参会的时间段：</Text>
          <Calendar
            fullscreen={false}
            onSelect={(date) => {
              message.info(`已选择日期：${date?.format('YYYY-MM-DD')}`)
            }}
          />
          <div className="space-y-2">
            <Text strong>可选时间段：</Text>
            <Space wrap>
              <Button>09:00-10:00</Button>
              <Button>10:00-11:00</Button>
              <Button type="primary">14:00-15:00</Button>
              <Button>15:00-16:00</Button>
              <Button>16:00-17:00</Button>
            </Space>
          </div>
        </div>
      </Modal>
    </div>
  )
}
