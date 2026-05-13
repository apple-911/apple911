import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Tabs, Table, Tag, Button, Space, Typography, Empty, List, Avatar, message, Drawer, Descriptions, Tabs as AntdTabs, Badge, Result, Spin } from 'antd'
import { CalendarOutlined, VideoCameraOutlined, TeamOutlined, ClockCircleOutlined, UserOutlined, FileTextOutlined, UploadOutlined, DatabaseOutlined, PictureOutlined, FilePdfOutlined, EyeOutlined } from '@ant-design/icons'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../stores/appStore'
import type { Consultation, UploadedFile } from '../../stores/consultationStore'
import PatientInfo from '../../components/PatientInfo'
import { hasPermission } from '../../utils/helpers'
import dayjs from 'dayjs'

const { Title, Text } = Typography

// 数据库中存储的中文状态到英文状态的映射
const statusMapping: Record<string, string> = {
  '医生提交': 'doctor_submit',
  '待科室审核': 'director_pending',
  '待主任审核': 'director_pending',
  '主任已驳回': 'director_rejected',
  '待秘书审核': 'secretary_pending',
  '待补充材料': 'pending_supplement',
  '退回修改': 'material_rejected',
  'scheduled': 'scheduled',
  '已邀请专家': 'expert_invited',
  '待专家确认': 'expert_confirmed',
  '专家已确认': 'expert_confirmed',
  '待会诊': 'pending_meeting',
  '会诊中': 'in_progress',
  '已完成': 'completed',
  '已归档': 'archived',
  '秘书驳回': 'rejected',
  '已取消': 'cancelled',
}

export default function MyMeetings() {
  const [activeTab, setActiveTab] = useState('today')
  const [patientDrawerVisible, setPatientDrawerVisible] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [selectedPatientName, setSelectedPatientName] = useState<string>('')
  const [selectedPatientInpatientNo, setSelectedPatientInpatientNo] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [meetings, setMeetings] = useState<Consultation[]>([])
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null)
  const navigate = useNavigate()
  const { user } = useAppStore()

  const todayStr = new Date().toISOString().split('T')[0]

  useEffect(() => {
    loadMeetings()
  }, [])

  const loadMeetings = async () => {
    try {
      setLoading(true)
      
      // 根据用户角色查询不同状态的会诊
      let statuses: string[] = []
      
      if (user?.role === 'secretary') {
        statuses = ['secretary_pending', 'pending_meeting', 'in_progress']
      } else if (user?.role === 'expert') {
        statuses = ['expert_pending', 'pending_meeting', 'in_progress']
      } else if (user?.role === 'director') {
        statuses = ['director_pending', 'secretary_pending', 'pending_meeting', 'in_progress']
      } else {
        statuses = ['director_pending', 'secretary_pending', 'expert_pending', 'pending_meeting', 'in_progress']
      }
      
      const { data: consultations, error } = await supabase
        .from('consultations')
        .select('*')
        .in('status', statuses)
        .order('expect_time', { ascending: true })
      
      if (error) throw error
      
      // 转换数据格式
      const formattedMeetings: Consultation[] = (consultations || []).map(item => ({
        id: item.id,
        consultationCode: item.consultation_code,
        patientId: item.patient_id || '',
        patientName: item.patient_name || '',
        patientInpatientNo: item.patient_inpatient_no || '',
        mainDiagnosis: item.main_diagnosis || '',
        department: item.department || '',
        applyDoctor: item.apply_doctor || '',
        applyTime: item.apply_time || '',
        expectTime: item.expect_time ? dayjs(item.expect_time).format('YYYY-MM-DD HH:mm') : '',
        status: (statusMapping[item.status] || item.status) as Consultation['status'],
        type: (item.type as Consultation['type']) || '院内',
        urgency: (item.urgency as Consultation['urgency']) || '普通',
        meetingRoom: item.meeting_room || '',
        experts: item.experts ? JSON.parse(item.experts) : [],
        medicalRecords: item.medical_records ? JSON.parse(item.medical_records) : null,
        uploadedFiles: item.uploaded_files ? JSON.parse(item.uploaded_files) : [],
      }))
      
      setMeetings(formattedMeetings)
    } catch (err) {
      console.error('加载会议失败:', err)
      message.error('加载会议数据失败')
    } finally {
      setLoading(false)
    }
  }

  const todayMeetings = meetings.filter(c => {
    if (!c.expectTime) return false
    return c.expectTime.startsWith(todayStr)
  })

  const weekMeetings = meetings.filter(c => {
    if (!c.expectTime) return false
    const meetingDate = dayjs(c.expectTime)
    const today = dayjs()
    const startOfWeek = today.day() === 0 ? today.clone() : today.clone().day(1)
    const endOfWeek = today.day() === 0 ? today.clone() : today.clone().day(7)
    return meetingDate.isAfter(startOfWeek.startOf('day')) && meetingDate.isBefore(endOfWeek.endOf('day'))
  })

  const futureMeetings = meetings.filter(c => {
    if (!c.expectTime) return false
    return dayjs(c.expectTime).isAfter(dayjs(), 'day')
  })

  const handlePreOpinion = (item: Consultation) => {
    message.info('预审功能开发中')
  }

  const showPatientInfo = (patientId: string, patientName: string, patientInpatientNo: string, consultation: Consultation) => {
    setSelectedPatientId(patientId)
    setSelectedPatientName(patientName)
    setSelectedPatientInpatientNo(patientInpatientNo)
    setSelectedConsultation(consultation)
    setPatientDrawerVisible(true)
  }

  const columns = [
    { 
      title: '会诊 ID', 
      dataIndex: 'consultationCode', 
      render: (code: string, record: Consultation) => <Tag color="blue">{code || record.id}</Tag>
    },
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
            onClick={() => showPatientInfo(record.patientId, record.patientName, record.patientInpatientNo, record)}
          >
            查看
          </Button>
        </Space>
      ) 
    },
    { title: '时间', dataIndex: 'expectTime' },
    { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color={t === '院内' ? 'blue' : 'green'}>{t}</Tag> },
    { title: '状态', dataIndex: 'status', render: (t: string) => <Tag color={t === 'in_progress' ? 'processing' : 'default'}>{t}</Tag> },
    {
      title: '操作',
      render: (_: any, record: Consultation) => (
        <Space>
          {record.status === 'in_progress' && (
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

  const renderMeetingList = (meetingList: Consultation[]) => {
    if (meetingList.length === 0) {
      return <Empty description="暂无会诊" />
    }
    return (
      <List
        dataSource={meetingList}
        renderItem={(item) => (
          <List.Item
            className="hover:bg-gray-50 cursor-pointer"
            onClick={() => navigate(`/consultation/detail/${item.id}`)}
            actions={[
              item.status === 'in_progress' ? (
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
              title={<Space>{item.mainDiagnosis}<Tag color={item.status === 'in_progress' ? 'processing' : 'default'}>{item.status}</Tag></Space>}
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">{item.patientName} | {item.expectTime}</Text>
                  <Space>
                    {item.experts.slice(0, 3).map((e: any) => <Tag key={e.id || e.name} className="!m-0">{e.name}</Tag>)}
                  </Space>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    )
  }

  // 权限检查
  if (!hasPermission('perm-consultation-my-meetings')) {
    return (
      <Result
        status="403"
        title="暂无权限"
        subTitle="抱歉，您没有权限访问我的待参会页面。如需获取权限，请联系系统管理员。"
        extra={<Button type="primary" onClick={() => navigate(-1)}>返回</Button>}
      />
    )
  }

  return (
    <Spin spinning={loading}>
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
          <Table columns={columns} dataSource={meetings} rowKey="id" size="small" pagination={false} />
        </Card>

        <Drawer
          title="患者详细信息"
          placement="right"
          width={1200}
          open={patientDrawerVisible}
          onClose={() => setPatientDrawerVisible(false)}
        >
          {selectedPatientId && selectedConsultation && (
            <div className="space-y-4">
              {/* 患者基本信息 */}
              <PatientInfo
                patientId={selectedPatientId}
                patientName={selectedPatientName}
                patientInpatientNo={selectedPatientInpatientNo}
                compact={false}
              />

              {/* 病历资料 */}
              {selectedConsultation.medicalRecords && (
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
              {selectedConsultation.uploadedFiles && selectedConsultation.uploadedFiles.length > 0 && (
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
                      const filesByType = selectedConsultation.uploadedFiles?.reduce((acc: Record<string, UploadedFile[]>, file) => {
                        if (!acc[file.fileType]) {
                          acc[file.fileType] = []
                        }
                        acc[file.fileType].push(file)
                        return acc
                      }, {})

                      return Object.entries(filesByType).map(([type, files]) => ({
                        key: type,
                        label: type,
                        children: (
                          <div className="space-y-2">
                            {files.map((file) => (
                              <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <Space>
                                  {file.fileType === '影像资料' ? <PictureOutlined /> : <FilePdfOutlined />}
                                  <span className="text-sm">{file.fileName}</span>
                                </Space>
                                <Button size="small" icon={<EyeOutlined />}>查看</Button>
                              </div>
                            ))}
                          </div>
                        ),
                      }))
                    })()}
                  />
                </Card>
              )}
            </div>
          )}
        </Drawer>
      </div>
    </Spin>
  )
}