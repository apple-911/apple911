import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Tabs, Tag, Space, Button, Descriptions, List, Avatar, Typography, Row, Col, Timeline, message, Modal, Badge, Alert, Steps, Empty, Spin, Result } from 'antd'
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
  ThunderboltOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  FileOutlined,
  FileImageOutlined,
} from '@ant-design/icons'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../stores/appStore'
import type { Patient } from '../../stores/consultationStore'
import type { AuditRecord } from '../../stores/consultationStore'
import dayjs from 'dayjs'
import { hasPermission } from '../../utils/helpers'
import { getConsultationStatusName, getConsultationStatusColor, getUrgencyName, getUrgencyColor } from '../../utils/codeTable'
import { CONSULTATION_STATUS } from '../../utils/statusMapping'

const { Title, Text } = Typography

export default function ConsultationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(true)
  const [consultation, setConsultation] = useState<any>(null)
  const [patient, setPatient] = useState<any>(null)
  const [auditHistory, setAuditHistory] = useState<any[]>([])
  const [experts, setExperts] = useState<any[]>([])

  useEffect(() => {
    loadConsultationDetail()
  }, [id])

  const loadConsultationDetail = async () => {
    try {
      setLoading(true)
      
      // 查询会诊详情
      const { data: consultationData, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error || !consultationData) {
        message.error('未找到会诊记录')
        return
      }
      
      console.log('会诊详情数据:', consultationData)
      setConsultation(consultationData)
      
      // 查询患者信息
      if (consultationData.patient_id) {
        const { data: patientData } = await supabase
          .from('patients')
          .select('*')
          .eq('id', consultationData.patient_id)
          .single()
        
        setPatient(patientData)
      }
      
      // 查询审核历史
      const { data: auditData } = await supabase
        .from('audit_history')
        .select('*')
        .eq('consultation_id', id)
        .order('time', { ascending: false })
      
      setAuditHistory(auditData || [])
      
      // 查询会诊专家（关联查询专家表）
      const { data: expertData } = await supabase
        .from('consultation_experts')
        .select(`
          *,
          expert:expert_id (
            name,
            department,
            title,
            specialty
          )
        `)
        .eq('consultation_id', id)
      
      // 转换数据格式
      const expertsWithInfo = (expertData || []).map(ce => ({
        ...ce,
        name: ce.expert?.name || null,
        department: ce.expert?.department || null,
        title: ce.expert?.title || null,
      }))
      
      setExperts(expertsWithInfo)
    } catch (err) {
      console.error('加载失败:', err)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

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

  // 权限检查
  // 主任医生可以查看待审核的会诊，申请医生可以查看自己的申请
  console.log('权限检查:', { 
    userRole: user?.role, 
    consultationStatus: consultation?.status,
    isDirector: user?.role === ROLE.DIRECTOR,
    isDoctorSubmit: consultation?.status === CONSULTATION_STATUS.DOCTOR_SUBMIT,
    isApplyDoctor: user?.id === consultation?.apply_doctor_id
  })
  
  const canAccess = hasPermission('perm-consultation-detail') || 
    (user?.role === ROLE.DIRECTOR && consultation?.status === CONSULTATION_STATUS.DOCTOR_SUBMIT) ||
    (user?.id === consultation?.apply_doctor_id)
  
  if (!canAccess) {
    return (
      <Result
        status="403"
        title="暂无权限"
        subTitle="抱歉，您没有权限访问会诊详情页面。如需获取权限，请联系系统管理员。"
        extra={<Button type="primary" onClick={() => navigate(-1)}>返回</Button>}
      />
    )
  }

  return (
    <Spin spinning={loading}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
            <Title level={4} className="!mb-0">
              会诊详情 #{consultation.consultation_code}
            </Title>
            <Tag color={getConsultationStatusColor(consultation.status)}>
              {getConsultationStatusName(consultation.status)}
            </Tag>
          </Space>
          <Space>
            {/* 只有申请医生且状态为主任驳回时才显示修改重提 */}
            {consultation.status === 'director_rejected' && 
              consultation.apply_doctor === user?.name && (
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={() => navigate(`/consultation/apply?id=${id}`)}
              >
                修改重提
              </Button>
            )}
            {/* 只有申请医生且状态为进行中时才显示进入会诊室 */}
            {consultation.status === 'in_progress' && 
              consultation.apply_doctor === user?.name && (
              <Button type="primary" icon={<VideoCameraOutlined />} onClick={() => navigate(`/consultation/room/${id}`)}>
                进入会诊室
              </Button>
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
              <Title level={3} className="!text-gray-800 !mt-0 !mb-0">{consultation.patient_name}</Title>
            </Col>
            <Col span={6}>
              <div className="flex items-center gap-2 mb-1">
                <FileTextOutlined style={{ color: '#1890ff' }} />
                <Text className="!text-gray-600 !font-medium">住院号</Text>
              </div>
              <Title level={3} className="!text-gray-800 !mt-0 !mb-0">{consultation.patient_inpatient_no}</Title>
            </Col>
            <Col span={6}>
              <div className="flex items-center gap-2 mb-1">
                <TeamOutlined style={{ color: '#1890ff' }} />
                <Text className="!text-gray-600 !font-medium">主要诊断</Text>
              </div>
              <Title level={4} className="!text-gray-800 !mt-0 !mb-0" style={{ fontSize: '16px' }}>{consultation.main_diagnosis}</Title>
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
            <Button type="primary" ghost onClick={() => navigate(`/patient/360/${patient?.id || ''}`)}>
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
                    <Descriptions.Item label="申请医生">{consultation.apply_doctor}</Descriptions.Item>
                    <Descriptions.Item label="申请科室">{consultation.department}</Descriptions.Item>
                    <Descriptions.Item label="申请时间">{consultation.apply_time ? dayjs(consultation.apply_time).format('YYYY-MM-DD HH:mm') : '-'}</Descriptions.Item>
                    <Descriptions.Item label="期望时间">{consultation.expect_time ? dayjs(consultation.expect_time).format('YYYY-MM-DD HH:mm') : '-'}</Descriptions.Item>
                    <Descriptions.Item label="紧急程度">
                      {(() => {
                        const urgency = consultation.urgency || consultation.urgency_level || 'normal'
                        const color = getUrgencyColor(urgency)
                        if (urgency === 'critical') {
                          return <Tag color={color}><strong>{getUrgencyName(urgency)}</strong></Tag>
                        }
                        return <Tag color={color}>{getUrgencyName(urgency)}</Tag>
                      })()}
                    </Descriptions.Item>
                    <Descriptions.Item label="状态">
                      <Badge status={
                        consultation.status === 'in_progress' ? 'processing' : 
                        consultation.status === 'director_rejected' || consultation.status === 'rejected' || consultation.status === 'cancelled' ? 'error' : 
                        'default'
                      } text={getConsultationStatusName(consultation.status)} />
                    </Descriptions.Item>
                  </Descriptions>

                  {consultation.summary && (
                    <>
                      <Title level={5}>病情摘要</Title>
                      <Card size="small" className="mb-4">
                        <Text style={{ whiteSpace: 'pre-wrap' }}>{consultation.summary}</Text>
                      </Card>
                    </>
                  )}

                  {consultation.medical_records && (
                    <>
                      <Title level={5}>病历资料</Title>
                      <Card size="small" className="mb-4">
                        {consultation.medical_records.chiefComplaint && (
                          <div className="mb-3">
                            <Text strong>主诉：</Text>
                            <Text style={{ whiteSpace: 'pre-wrap' }}>{consultation.medical_records.chiefComplaint}</Text>
                          </div>
                        )}
                        {consultation.medical_records.presentIllness && (
                          <div className="mb-3">
                            <Text strong>现病史：</Text>
                            <Text style={{ whiteSpace: 'pre-wrap' }}>{consultation.medical_records.presentIllness}</Text>
                          </div>
                        )}
                        {consultation.medical_records.pastHistory && (
                          <div className="mb-3">
                            <Text strong>既往史：</Text>
                            <Text style={{ whiteSpace: 'pre-wrap' }}>{consultation.medical_records.pastHistory}</Text>
                          </div>
                        )}
                        {consultation.medical_records.physicalExamination && (
                          <div className="mb-3">
                            <Text strong>体格检查：</Text>
                            <Text style={{ whiteSpace: 'pre-wrap' }}>{consultation.medical_records.physicalExamination}</Text>
                          </div>
                        )}
                        {consultation.medical_records.auxiliaryExamination && (
                          <div className="mb-3">
                            <Text strong>辅助检查：</Text>
                            <Text style={{ whiteSpace: 'pre-wrap' }}>{consultation.medical_records.auxiliaryExamination}</Text>
                          </div>
                        )}
                        {consultation.medical_records.initialDiagnosis && (
                          <div className="mb-3">
                            <Text strong>初步诊断：</Text>
                            <Text style={{ whiteSpace: 'pre-wrap' }}>{consultation.medical_records.initialDiagnosis}</Text>
                          </div>
                        )}
                        {consultation.medical_records.treatmentPlan && (
                          <div>
                            <Text strong>治疗方案：</Text>
                            <Text style={{ whiteSpace: 'pre-wrap' }}>{consultation.medical_records.treatmentPlan}</Text>
                          </div>
                        )}
                      </Card>
                    </>
                  )}

                  <Title level={5}>专家团队</Title>
                  {experts && experts.length > 0 ? (
                    <List
                      dataSource={experts}
                      renderItem={(expert) => {
                        const expertName = expert.expert_name || expert.name || '未知专家'
                        const expertDept = expert.expert_department || expert.department || '未知科室'
                        const expertRole = expert.expert_role || expert.title || '未知职称'
                        const expertStatus = expert.status || '待接受'
                        
                        return (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<Avatar className={expertStatus === '已接受' ? '!bg-green-500' : '!bg-gray-500'}>{expertName[0]}</Avatar>}
                              title={expertName}
                              description={`${expertDept} - ${expertRole}`}
                            />
                            <Tag color={expertStatus === '已接受' ? 'green' : expertStatus === '待接受' ? 'orange' : 'gray'}>
                              {expertStatus === '已接受' ? '已接受' : expertStatus}
                            </Tag>
                          </List.Item>
                        )
                      }}
                    />
                  ) : (
                    <Empty description="暂无专家" />
                  )}

                  {/* 审核流程 */}
                  <div className="mt-6">
                    <Title level={5}>审核流程</Title>
                    {auditHistory && auditHistory.length > 0 ? (
                      <Timeline
                        mode="left"
                        items={auditHistory.map((audit) => {
                          const colorMap: Record<string, string> = {
                            '通过': 'green',
                            '接受': 'green',
                            '已提交': 'blue',
                            '已接受': 'green',
                            '已拒绝': 'red',
                            '拒绝': 'red',
                            '待审核': 'blue',
                            '退回修改': 'orange',
                          }
                          const iconMap: Record<string, React.ReactNode> = {
                            '通过': <CheckCircleOutlined />,
                            '接受': <CheckCircleOutlined />,
                            '已提交': <CheckCircleOutlined />,
                            '已接受': <CheckCircleOutlined />,
                            '已拒绝': <CloseCircleOutlined />,
                            '拒绝': <CloseCircleOutlined />,
                            '待审核': <ClockCircleOutlined />,
                            '退回修改': <ExclamationCircleOutlined />,
                          }
                          return {
                            color: colorMap[audit.result] || 'gray',
                            dot: iconMap[audit.result] || <CheckCircleOutlined />,
                            label: (
                              <div className="flex justify-between items-center">
                                <Space>
                                  <Tag color="blue">
                                    {audit.node || audit.operator_role}
                                  </Tag>
                                  <Text strong>{audit.operator || '未知'}</Text>
                                </Space>
                                <Tag color={colorMap[audit.result] || 'gray'}>
                                  {audit.result || '未知'}
                                </Tag>
                              </div>
                            ),
                            children: (
                              <div className="ml-2">
                                <div className="text-sm text-gray-500 mb-1">{audit.time || audit.audit_time ? dayjs(audit.time || audit.audit_time).format('YYYY-MM-DD HH:mm') : '-'}</div>
                                {audit.opinion && (
                                  <div className="text-sm">
                                    <Text strong>审核意见：</Text>
                                    <Text>{audit.opinion}</Text>
                                  </div>
                                )}
                              </div>
                            ),
                          }
                        })}
                      />
                    ) : (
                      <Empty description="暂无审核记录" />
                    )}
                  </div>
                </div>
              )
            },
            {
              key: 'records',
              label: '资料库',
              children: (
                consultation.uploaded_files && consultation.uploaded_files.length > 0 ? (
                  <List
                    grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
                    dataSource={consultation.uploaded_files}
                    renderItem={(file: any) => (
                      <List.Item>
                        <Card
                          hoverable
                          size="small"
                          cover={file.fileType === '影像资料' ? <FileImageOutlined className="text-4xl p-4" /> : <FileOutlined className="text-4xl p-4" />}
                          actions={[
                            <Button type="link" size="small" icon={<DownloadOutlined />}>下载</Button>
                          ]}
                        >
                          <Card.Meta
                            title={file.fileName}
                            description={
                              <div>
                                <Tag color="blue">{file.fileType || '其他'}</Tag>
                                <Text type="secondary" className="d-block">
                                  {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                                </Text>
                                <Text type="secondary" className="d-block">
                                  {file.uploadTime ? dayjs(file.uploadTime).format('YYYY-MM-DD HH:mm') : ''}
                                </Text>
                                {file.fromHIS && <Tag color="green" className="d-block mt-1">来自HIS</Tag>}
                              </div>
                            }
                          />
                        </Card>
                      </List.Item>
                    )}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <PictureOutlined className="text-4xl mb-2" />
                    <p>暂无上传资料</p>
                  </div>
                )
              )
            },
            {
              key: 'discussion',
              label: '讨论记录',
              children: (
                <Timeline
                  items={[
                    { color: 'blue', children: '[14:00] 张明华：患者目前情况稳定，建议先行化疗' },
                    { color: 'green', children: '[14:15] 李芳：同意张主任意见，建议使用 GP 方案' },
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
                <div className="text-center py-8 text-gray-400">
                  <FileTextOutlined className="text-4xl mb-2" />
                  <p>暂无会诊报告</p>
                </div>
              )
            },
          ]}
        />
      </Card>
    </div>
    </Spin>
  )
}