import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Tag, Space, Modal, message, Avatar, Typography, Empty, Select, DatePicker, Input, Badge, Tooltip, Result } from 'antd'
import { CheckOutlined, CloseOutlined, CalendarOutlined, ExclamationCircleOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../stores/appStore'
import { sendSystemNotification } from '../../stores/notificationStore'
import { hasPermission } from '../../utils/helpers'

const { Title, Text } = Typography
const { TextArea } = Input

type ApplicationSource = 'doctor' | 'patient'

interface ExtendedConsultation {
  id: string
  patientId: string
  patientName: string
  patientInpatientNo: string
  age?: number
  gender?: 'male' | 'female'
  type: '院内' | '远程'
  applyTime: string
  applyDate?: string
  expectTime?: string
  status: string
  urgency: '普通' | '紧急' | '特急'
  department: string
  applyDoctor: string
  experts: Array<{ id: string; name: string; department: string; title: string; status?: string; specialty?: string }>
  mainDiagnosis: string
  otherDiagnoses?: string[]
  consultationPurpose?: string
  source?: ApplicationSource
  sourceDetail?: string
  medicalRecords?: {
    chiefComplaint?: string
    presentIllness?: string
    pastHistory?: string
    physicalExamination?: string
    auxiliaryExamination?: string
    initialDiagnosis?: string
    treatmentPlan?: string
  }
  uploadedFiles?: Array<{
    id: string
    fileName: string
    fileType: string
    fileSize: number
    uploadTime: string
    uploadUrl: string
    fromHIS: boolean
  }>
  hisDataSynced?: boolean
  hisSyncTime?: string
  consultationCode?: string
}

export default function PendingReview() {
  const [data, setData] = useState<ExtendedConsultation[]>([])
  const [loading, setLoading] = useState(true)
  const [schedulingConsultation, setSchedulingConsultation] = useState<ExtendedConsultation | null>(null)
  
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { user } = useAppStore()

  useEffect(() => {
    loadConsultations()
  }, [])

  const loadConsultations = async () => {
    try {
      setLoading(true)
      
      // 获取所有状态符合条件的会诊
      const { data: allConsultations, error: consultationError } = await supabase
        .from('consultations')
        .select('*')
        .in('status', ['秘书审核', '待秘书审核'])
        .order('apply_time', { ascending: false })

      console.log('秘书待审核查询结果:', allConsultations, consultationError)
      if (consultationError) throw consultationError
      
      // 过滤：只显示当前秘书负责的会诊
      let consultations = allConsultations || []
      if (user?.position === 'MDT 秘书') {
        // 如果是秘书，只处理自己负责的会诊
        // 后续可以添加 secretary_id 字段来精确控制
        // 目前所有秘书都能看到和审核
      }

      // 获取所有专家信息
      const { data: allExperts, error: expertsError } = await supabase
        .from('experts')
        .select('*')

      if (expertsError) throw expertsError

      const expertMap = new Map(allExperts.map(e => [e.id, e]))

      // 获取会诊专家关联表
      const { data: consultationExperts, error: ceError } = await supabase
        .from('consultation_experts')
        .select('consultation_id, expert_id')

      if (ceError) throw ceError

      // 构建会诊 ID 到专家 ID 列表的映射
      const consultationExpertMap = new Map<string, string[]>()
      consultationExperts.forEach(ce => {
        if (!consultationExpertMap.has(ce.consultation_id)) {
          consultationExpertMap.set(ce.consultation_id, [])
        }
        consultationExpertMap.get(ce.consultation_id)!.push(ce.expert_id)
      })

      const applications: ExtendedConsultation[] = consultations.map(c => {
        // 从 consultation_experts 表获取专家ID列表
        const expertIds = consultationExpertMap.get(c.id) || []
        const experts = expertIds.map((id: string) => {
          const expert = expertMap.get(id)
          return expert ? {
            id: expert.id,
            name: expert.name,
            department: expert.department,
            title: expert.title,
            status: '空闲',
            specialty: expert.specialty || '专业'
          } : {
            id,
            name: '未知专家',
            department: '未知科室',
            title: '职称',
            status: '空闲',
            specialty: '专业'
          }
        })

        return {
          id: c.id,
          consultationCode: c.consultation_code,
          patientId: c.patient_id,
          patientName: c.patient_name,
          patientInpatientNo: c.patient_inpatient_no,
          type: c.type as '院内' | '远程',
          applyTime: new Date(c.apply_time).toLocaleString('zh-CN'),
          expectTime: c.expect_time ? new Date(c.expect_time).toLocaleString('zh-CN') : undefined,
          status: c.status,
          urgency: c.urgency as '普通' | '紧急' | '特急',
          department: c.department,
          applyDoctor: c.apply_doctor,
          experts,
          mainDiagnosis: c.main_diagnosis || '',
          otherDiagnoses: c.other_diagnoses || [],
          consultationPurpose: c.consultation_purpose,
          source: 'doctor',
          sourceDetail: `${c.department}${c.apply_doctor}医生申请`,
        }
      })

      setData(applications)
    } catch (err) {
      console.error('加载会诊申请失败:', err)
      message.error('加载会诊申请失败')
    } finally {
      setLoading(false)
    }
  }

  const getSourceBadge = (source: ApplicationSource | undefined) => {
    if (source === 'patient') {
      return (
        <Tag icon={<UserOutlined />} color="success">
          患者申请
        </Tag>
      )
    }
    return null
  }

  const handleApprove = async (consultation: ExtendedConsultation) => {
    Modal.confirm({
      title: '确认通过',
      content: `确认通过患者 ${consultation.patientName} 的会诊申请？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          setSubmitting(true)
          
          // 更新会诊状态
          await supabase
            .from('consultations')
            .update({ status: '专家邀请' })
            .eq('id', consultation.id)
        
          // 添加审核历史
          const auditInsert: any = {
            consultation_id: consultation.id,
            operator: user?.name,
            operator_role: 'MDT 秘书',
            node: '秘书审核',
            result: '通过',
            time: new Date().toISOString(),
          }
          
          if (user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
            auditInsert.operator_id = user.id
          }
          
          await supabase
            .from('audit_history')
            .insert(auditInsert)
          
          // 发送通知给申请医生
          try {
            const { data: doctors } = await supabase
              .from('users')
              .select('id')
              .eq('name', consultation.applyDoctor)
              .limit(1)

            if (doctors && doctors.length > 0) {
              await sendSystemNotification(
                doctors[0].id,
                'success',
                '会诊申请已通过',
                `您提交的 ${consultation.patientName} 会诊申请已通过审核，进入专家邀请阶段`,
                {
                  label: '查看',
                  url: `/consultation/my-applies`,
                }
              )
            }

            // 发送通知给专家
            if (consultation.experts && consultation.experts.length > 0) {
              for (const expert of consultation.experts) {
                const { data: expertUsers } = await supabase
                  .from('users')
                  .select('id')
                  .eq('name', expert.name)
                  .limit(1)

                if (expertUsers && expertUsers.length > 0) {
                  await sendSystemNotification(
                    expertUsers[0].id,
                    'info',
                    '新会诊邀请',
                    `您收到新的会诊邀请，患者：${consultation.patientName}，诊断：${consultation.mainDiagnosis}`,
                    {
                      label: '确认',
                      url: `/consultation/expert-confirm`,
                    }
                  )
                }
              }
            }
          } catch (notificationError) {
            console.error('发送通知失败:', notificationError)
          }
          
          message.success(`已通过 ${consultation.patientName} 的会诊申请`)
          loadConsultations()
        } catch (err) {
          console.error('审核失败:', err)
          message.error('审核失败，请重试')
        } finally {
          setSubmitting(false)
        }
      }
    })
  }

  const handleReject = (consultation: ExtendedConsultation) => {
    Modal.confirm({
      title: '选择处理方式',
      content: (
        <div>
          <p>确定要处理 {consultation.patientName} 的会诊申请吗？</p>
          <p className="text-gray-500 mt-2">申请来源：{getSourceLabel(consultation.source)}</p>
        </div>
      ),
      icon: <ExclamationCircleOutlined />,
      okText: '拒绝申请',
      cancelText: '退回补充材料',
      onOk: () => {
        Modal.confirm({
          title: '确认拒绝',
          content: `确定要拒绝 ${consultation.patientName} 的会诊申请吗？\n\n申请来源：${getSourceLabel(consultation.source)}`,
          onOk: async () => {
            try {
              setSubmitting(true)
              
              await supabase
                .from('consultations')
                .update({ status: '申请终止', reject_reason: '秘书审核拒绝' })
                .eq('id', consultation.id)
              
              const auditInsert: any = {
                consultation_id: consultation.id,
                operator: user?.name,
                operator_role: 'MDT 秘书',
                node: '秘书审核',
                result: '拒绝',
                opinion: '秘书审核拒绝',
                time: new Date().toISOString(),
              }
              
              if (user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
                auditInsert.operator_id = user.id
              }
              
              await supabase
                .from('audit_history')
                .insert(auditInsert)
              
              // 发送通知给申请医生
              try {
                const { data: doctors } = await supabase
                  .from('users')
                  .select('id')
                  .eq('name', consultation.applyDoctor)
                  .limit(1)

                if (doctors && doctors.length > 0) {
                  await sendSystemNotification(
                    doctors[0].id,
                    'error',
                    '会诊申请被拒绝',
                    `您提交的 ${consultation.patientName} 会诊申请已被秘书拒绝，申请已终止`,
                    {
                      label: '查看',
                      url: `/consultation/my-applies`,
                    }
                  )
                }
              } catch (notificationError) {
                console.error('发送通知失败:', notificationError)
              }
              
              message.success('已拒绝申请')
              loadConsultations()
            } catch (err) {
              console.error('拒绝失败:', err)
              message.error('拒绝失败，请重试')
            } finally {
              setSubmitting(false)
            }
          }
        })
      },
      onCancel: () => {
        showRejectWithReasonModal(consultation)
      }
    })
  }

  const showRejectWithReasonModal = (consultation: ExtendedConsultation) => {
    let rejectReason = ''
    
    Modal.confirm({
      title: '退回补充材料',
      content: (
        <div>
          <p className="mb-2">请说明需要补充的材料：</p>
          <TextArea
            rows={4}
            placeholder="例如：请补充患者近期影像学检查报告（CT/MRI）、病理报告、实验室检查结果等..."
            onChange={(e) => rejectReason = e.target.value}
            autoFocus
          />
        </div>
      ),
      okText: '确认退回',
      cancelText: '取消',
      onOk: async () => {
        if (!rejectReason.trim()) {
          message.warning('请填写退回原因')
          return false
        }
        
        try {
          setSubmitting(true)
          
          await supabase
            .from('consultations')
            .update({ status: '退回修改', reject_reason: rejectReason })
            .eq('id', consultation.id)
          
          const auditInsert: any = {
            consultation_id: consultation.id,
            operator: user?.name,
            operator_role: 'MDT 秘书',
            node: '秘书审核',
            result: '退回修改',
            opinion: rejectReason,
            time: new Date().toISOString(),
          }
          
          if (user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
            auditInsert.operator_id = user.id
          }
          
          await supabase
            .from('audit_history')
            .insert(auditInsert)
          
          // 发送通知给申请医生
          try {
            const { data: doctors } = await supabase
              .from('users')
              .select('id')
              .eq('name', consultation.applyDoctor)
              .limit(1)

            if (doctors && doctors.length > 0) {
              await sendSystemNotification(
                doctors[0].id,
                'warning',
                '会诊申请需补充材料',
                `您提交的 ${consultation.patientName} 会诊申请需要补充材料：${rejectReason}，请修改后重新提交`,
                {
                  label: '修改',
                  url: `/consultation/apply?id=${consultation.id}`,
                }
              )
            }
          } catch (notificationError) {
            console.error('发送通知失败:', notificationError)
          }
          
          message.success(`已退回申请，已通知医生补充材料`)
          loadConsultations()
        } catch (err) {
          console.error('退回失败:', err)
          message.error('退回失败，请重试')
        } finally {
          setSubmitting(false)
        }
      }
    })
  }

  const handleSchedule = (consultation: ExtendedConsultation) => {
    setSchedulingConsultation(consultation)
    Modal.confirm({
      title: '快速排期',
      content: (
        <div>
          <p>为 {consultation.patientName} 选择会诊时间：</p>
          <DatePicker showTime className="!w-full mt-2" />
        </div>
      ),
      onOk: () => {
        message.success('已排期，将通知专家')
        navigate('/consultation/schedule')
      }
    })
  }

  const getSourceLabel = (source: ApplicationSource | undefined) => {
    return source === 'patient' ? '患者申请' : '医生申请'
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case '紧急': return 'red'
      case '特急': return 'orange'
      default: return 'default'
    }
  }

  // 权限检查
  if (!hasPermission('perm-consultation-pending-review')) {
    return (
      <Result
        status="403"
        title="暂无权限"
        subTitle="抱歉，您没有权限访问待审核页面。如需获取权限，请联系系统管理员。"
        extra={<Button type="primary" onClick={() => navigate(-1)}>返回</Button>}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center" style={{ background: '#e6ffed' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--xiehe-green)' }}>{data.length}</div>
          <div className="text-xs text-gray-500 mt-1">待审核总数</div>
        </Card>
        <Card className="text-center" style={{ background: '#e6f7ff' }}>
          <div className="text-2xl font-bold" style={{ color: '#1890ff' }}>
            {data.filter(d => d.source === 'doctor').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">医生申请</div>
        </Card>
        <Card className="text-center" style={{ background: '#f6ffed' }}>
          <div className="text-2xl font-bold" style={{ color: '#52c41a' }}>
            {data.filter(d => d.source === 'patient').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">患者申请</div>
        </Card>
        <Card className="text-center" style={{ background: '#fff7e6' }}>
          <div className="text-2xl font-bold" style={{ color: '#fa8c16' }}>
            {data.filter(d => d.urgency === '紧急' || d.urgency === '特急').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">紧急申请</div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">待审核列表</Title>
        <Space>
          <Text>共 {data.length} 条待审</Text>
          <Select placeholder="排序" style={{ width: 150 }} defaultValue="all">
            <Select.Option value="all">全部来源</Select.Option>
            <Select.Option value="doctor">仅医生申请</Select.Option>
            <Select.Option value="patient">仅患者申请</Select.Option>
          </Select>
          <Select placeholder="排序" style={{ width: 120 }} defaultValue="urgency">
            <Select.Option value="urgency">按紧急程度</Select.Option>
            <Select.Option value="time">按申请时间</Select.Option>
          </Select>
        </Space>
      </div>

      {loading ? (
        <Card loading>
          <Empty description="加载中..." />
        </Card>
      ) : data.length === 0 ? (
        <Card>
          <Empty description="暂无待审核申请" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.map(consultation => (
            <Card
              key={consultation.id}
              className="hover:shadow-lg transition-shadow"
              title={
                <Space>
                  <Avatar icon={<ExclamationCircleOutlined />} className="!bg-orange-500" size="small" />
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-sm">
                      {consultation.patientName} {consultation.age ? `${consultation.age}岁` : ''} {consultation.gender === 'male' ? '男' : consultation.gender === 'female' ? '女' : ''}
                    </div>
                    <div className="text-xs text-gray-500">{consultation.patientInpatientNo}</div>
                  </div>
                  <Tag color={getUrgencyColor(consultation.urgency)}>{consultation.urgency}</Tag>
                  {getSourceBadge(consultation.source)}
                </Space>
              }
              extra={
                <Space>
                  <Text type="secondary">会诊编号：</Text>
                  <Tag color="blue">{consultation.consultationCode}</Tag>
                </Space>
              }
              size="small"
            >
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <Text type="secondary">申请科室：</Text>
                  <Text>{consultation.department}</Text>
                </div>
                <div>
                  <Text type="secondary">申请医生：</Text>
                  <Text>{consultation.applyDoctor}</Text>
                </div>
                <div>
                  <Text type="secondary">申请时间：</Text>
                  <Text>{consultation.applyTime}</Text>
                </div>
                <div>
                  <Text type="secondary">期望时间：</Text>
                  <Text>{consultation.expectTime || '-'}</Text>
                </div>
                <div>
                  <Text type="secondary">来源：</Text>
                  <Text>{consultation.sourceDetail}</Text>
                </div>
                <div>
                  <Text type="secondary">会诊类型：</Text>
                  <Text className="text-red-500 font-medium">{consultation.type}</Text>
                </div>
              </div>
            
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="mb-2">
                  <Text strong>主要诊断：</Text>
                  <Text>{consultation.mainDiagnosis}</Text>
                </div>
                {consultation.otherDiagnoses && consultation.otherDiagnoses.length > 0 && (
                  <div className="mb-2">
                    <Text strong>其他诊断：</Text>
                    <Text className="text-xs text-gray-600">{consultation.otherDiagnoses.join('、')}</Text>
                  </div>
                )}
                {consultation.consultationPurpose && (
                  <div className="mb-2">
                    <Text strong>会诊目的：</Text>
                    <Text>{consultation.consultationPurpose}</Text>
                  </div>
                )}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="mb-2">
                  <Text strong>拟邀专家：</Text>
                </div>
                {consultation.experts && consultation.experts.length > 0 ? (
                  <Space wrap>
                    {consultation.experts.map(e => (
                      <Tag key={e.id} color="blue">
                        {e.name}
                        <br />
                        <span className="text-xs">{e.department}</span>
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  <div className="flex items-center text-gray-400">
                    <ExclamationCircleOutlined className="mr-2" />
                    <Text>暂未选择专家，请点击下方"邀请专家"按钮添加</Text>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <Button onClick={() => navigate(`/consultation/detail/${consultation.id}`)}>
                  <EyeOutlined className="mr-1" />
                  会诊详情
                </Button>
                <Space>
                  <Button 
                    danger 
                    icon={<CloseOutlined />} 
                    onClick={() => handleReject(consultation)}
                    loading={submitting}
                  >
                    拒绝
                  </Button>
                  <Button 
                    icon={<CalendarOutlined />} 
                    onClick={() => handleSchedule(consultation)}
                    loading={submitting}
                  >
                    修改排期
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<UserOutlined />}
                    onClick={() => navigate(`/consultation/expert-invite/${consultation.id}`)}
                  >
                    拟邀专家
                  </Button>
                  <Button 
                    type="primary" 
                    icon={<CheckOutlined />} 
                    className="!bg-green-500 !border-green-500" 
                    onClick={() => handleApprove(consultation)}
                    loading={submitting}
                  >
                    通过
                  </Button>
                </Space>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}