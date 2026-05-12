import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Tag, Button, Space, Modal, message, Typography, Descriptions, Input, Badge, Tabs, Statistic, Row, Col, Timeline, Calendar, List, Avatar, Tabs as AntdTabs, Result } from 'antd'
import { CheckOutlined, CloseOutlined, EyeOutlined, ClockCircleOutlined, CalendarOutlined, UserOutlined, FileTextOutlined, PhoneOutlined, MedicineBoxOutlined, UploadOutlined, DatabaseOutlined, PictureOutlined, FilePdfOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../stores/appStore'
import type { UploadedFile } from '../../stores/consultationStore'
import PatientInfo from '../../components/PatientInfo'
import { sendSystemNotification } from '../../stores/notificationStore'
import { hasPermission } from '../../utils/helpers'

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
  consultationCode?: string
}

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
  const navigate = useNavigate()
  const [data, setData] = useState<ExpertInvitation[]>([])
  const [loading, setLoading] = useState(true)
  const [detailVisible, setDetailVisible] = useState(false)
  const [rejectVisible, setRejectVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ExpertInvitation | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [activeTab, setActiveTab] = useState('pending')
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAppStore()

  useEffect(() => {
    loadInvitations()
  }, [])

  const loadInvitations = async () => {
    try {
      setLoading(true)
      const { data: consultations, error } = await supabase
        .from('consultations')
        .select('*')
        .in('status', ['专家邀请', '专家确认'])
        .order('apply_time', { ascending: false })

      if (error) throw error

      const invitations: ExpertInvitation[] = consultations.map(c => ({
        id: `INV${c.id.substring(0, 8).toUpperCase()}`,
        consultationId: c.id,
        consultationCode: c.consultation_code,
        patientId: c.patient_id,
        patientName: c.patient_name,
        patientInpatientNo: c.patient_inpatient_no,
        mainDiagnosis: c.main_diagnosis || '',
        urgency: c.urgency as '普通' | '紧急' | '特急',
        department: c.department,
        applyDoctor: c.apply_doctor,
        inviteTime: new Date(c.apply_time).toLocaleString('zh-CN'),
        expectTime: c.expect_time ? new Date(c.expect_time).toLocaleString('zh-CN') : '',
        status: c.status === '专家邀请' ? '待确认' : '已接受',
        consultationPurpose: c.consultation_purpose || '',
        otherExperts: c.expert_ids ? c.expert_ids.slice(0, 3).map((id: string) => ({ 
          name: '专家', 
          department: '科室', 
          title: '主任医师' 
        })) : [],
        materials: [
          { name: '病历资料', type: '病历', uploaded: true },
          { name: '检查报告', type: '检查', uploaded: true },
        ],
      }))

      setData(invitations)
    } catch (err) {
      console.error('加载会诊邀请失败:', err)
      message.error('加载会诊邀请失败')
    } finally {
      setLoading(false)
    }
  }

  const pendingData = data.filter(item => item.status === '待确认')
  const processedData = data.filter(item => item.status !== '待确认')

  const handleAccept = (item: ExpertInvitation) => {
    console.log('点击接受按钮, item:', item)
    Modal.confirm({
      title: '确认参加会诊',
      content: `确认参加患者 ${item.patientName} 的会诊？`,
      okText: '确认参加',
      cancelText: '取消',
      onOk: async () => {
        try {
          console.log('开始确认会诊, consultationId:', item.consultationId)
          setSubmitting(true)

          const { error: updateError } = await supabase
            .from('consultations')
            .update({ status: '专家确认' })
            .eq('id', item.consultationId)

          if (updateError) {
            console.error('更新会诊状态失败:', updateError)
            throw updateError
          }

          console.log('会诊状态更新成功')

          const auditInsert: any = {
            consultation_id: item.consultationId,
            operator: user?.name || '专家',
            operator_role: '会诊专家',
            node: '专家确认',
            result: '接受',
            time: new Date().toISOString(),
          }

          if (user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
            auditInsert.operator_id = user.id
          }

          const { error: auditError } = await supabase
            .from('audit_history')
            .insert(auditInsert)

          if (auditError) {
            console.error('插入审核历史失败:', auditError)
          }

          // 发送通知给秘书和申请医生
          try {
            // 通知 MDT 秘书
            const { data: secretaries } = await supabase
              .from('users')
              .select('id')
              .eq('role', 'MDT 秘书')
              .limit(1)
              .returns<{ id: string }[]>()

            if (secretaries && secretaries.length > 0) {
              await sendSystemNotification(
                secretaries[0].id,
                'success',
                '专家已确认会诊',
                `${user?.name || '专家'}已确认参加患者 ${item.patientName} 的会诊`,
                {
                  label: '查看',
                  url: `/consultation/expert-confirm`,
                }
              )
            }

            // 通知申请医生
            const { data: doctors } = await supabase
              .from('users')
              .select('id')
              .eq('name', item.applyDoctor)
              .limit(1)

            if (doctors && doctors.length > 0) {
              await sendSystemNotification(
                doctors[0].id,
                'success',
                '专家已确认会诊',
                `专家 ${user?.name} 已确认参加您提交的 ${item.patientName} 会诊申请`,
                {
                  label: '查看',
                  url: `/consultation/my-applies`,
                }
              )
            }
          } catch (notificationError) {
            console.error('发送通知失败:', notificationError)
          }

          console.log('审核历史插入成功')
          message.success(`已确认参加 ${item.patientName} 的会诊`)
          loadInvitations()
        } catch (err) {
          console.error('接受失败:', err)
          message.error('接受失败，请重试')
        } finally {
          setSubmitting(false)
        }
      }
    })
  }

  const handleReject = (item: ExpertInvitation) => {
    setSelectedItem(item)
    setRejectReason('')
    setRejectVisible(true)
  }

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      message.warning('请填写拒绝原因')
      return
    }
    
    try {
      setSubmitting(true)
      
      await supabase
        .from('consultations')
        .update({ status: '申请终止', reject_reason: rejectReason })
        .eq('id', selectedItem?.consultationId)
      
      const auditInsert: any = {
        consultation_id: selectedItem?.consultationId,
        operator: user?.name,
        operator_role: '会诊专家',
        node: '专家确认',
        result: '拒绝',
        opinion: rejectReason,
        time: new Date().toISOString(),
      }
      
      if (user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
        auditInsert.operator_id = user.id
      }
      
      await supabase
        .from('audit_history')
        .insert(auditInsert)
      
      message.success(`已拒绝 ${selectedItem?.patientName} 的会诊邀请`)
      loadInvitations()
    } catch (err) {
      console.error('拒绝失败:', err)
      message.error('拒绝失败，请重试')
    } finally {
      setSubmitting(false)
      setRejectVisible(false)
      setSelectedItem(null)
      setRejectReason('')
    }
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
      title: '会诊编码',
      dataIndex: 'consultationCode',
      width: 120,
      render: (code: string) => <Tag color="green">{code}</Tag>
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
          <Text>{time || '-'}</Text>
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
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space wrap size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          {record.status === '待确认' && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleAccept(record)}
                loading={submitting}
              >
                接受
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record)}
                loading={submitting}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      )
    }
  ]

  // 权限检查
  if (!hasPermission('perm-consultation-confirm')) {
    return (
      <Result
        status="403"
        title="暂无权限"
        subTitle="抱歉，您没有权限访问专家确认页面。如需获取权限，请联系系统管理员。"
        extra={<Button type="primary" onClick={() => navigate(-1)}>返回</Button>}
      />
    )
  }

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
              value={data.length > 0 ? Math.round(data.filter(d => d.status === '已接受').length / data.length * 100) : 0}
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
                  loading={loading}
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
                  loading={loading}
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
        {selectedItem && (
          <div className="space-y-4">
            <PatientInfo
              patientId={selectedItem.patientId}
              patientName={selectedItem.patientName}
              patientInpatientNo={selectedItem.patientInpatientNo}
              compact={false}
            />

            <Card size="small" title={<Space><FileTextOutlined />会诊邀请信息</Space>}>
              <Descriptions bordered column={3} size="small">
                <Descriptions.Item label="邀请 ID">{selectedItem.id}</Descriptions.Item>
                <Descriptions.Item label="会诊编码">
                  <Tag color="green">{selectedItem.consultationCode}</Tag>
                </Descriptions.Item>
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
                    {selectedItem.otherExperts.map((e, idx) => (
                      <Tag key={idx} color="cyan">{e.name} - {e.department} - {e.title}</Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>

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
        )}
      </Modal>

      <Modal
        title="拒绝原因"
        open={rejectVisible}
        onOk={submitReject}
        onCancel={() => setRejectVisible(false)}
        confirmLoading={submitting}
        okText="提交"
        cancelText="取消"
      >
        <div className="space-y-2">
          <Text>会诊邀请：{selectedItem?.patientName} ({selectedItem?.consultationCode})</Text>
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