import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Tabs, Tag, Space, Button, Descriptions, List, Avatar, Typography, Row, Col, Timeline, message, Modal, Badge, Alert, Steps, Empty, Spin, Result, DatePicker, Input, Select, Divider } from 'antd'
import type { Dayjs } from 'dayjs'
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
  AlertOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../stores/appStore'
import type { Patient } from '../../stores/consultationStore'
import type { AuditRecord } from '../../stores/consultationStore'
import { sendSystemNotification } from '../../stores/notificationStore'
import dayjs from 'dayjs'
import { hasPermission } from '../../utils/helpers'
import { getConsultationStatusName, getConsultationStatusColor, getUrgencyName, getUrgencyColor, getAuditNodeName, getAuditResultName, getCodeColor, getConsultationTypeName, getConsultationTypeColor } from '../../utils/codeTable'
import { CONSULTATION_STATUS, ROLE } from '../../utils/statusMapping'
import ExpertSelectorModal from '../../components/ExpertSelectorModal'

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
  
  // 弹窗状态
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false)
  const [directorApproveModalVisible, setDirectorApproveModalVisible] = useState(false)
  const [directorRejectModalVisible, setDirectorRejectModalVisible] = useState(false)
  const [secretaryRejectModalVisible, setSecretaryRejectModalVisible] = useState(false)
  const [revokeModalVisible, setRevokeModalVisible] = useState(false)
  
  // 表单数据
  const [scheduleData, setScheduleData] = useState({ expect_time: '', meeting_room: '', notes: '' })
  const [directorOpinion, setDirectorOpinion] = useState('')
  const [secretaryRejectReason, setSecretaryRejectReason] = useState('')
  
  // 专家数据 用于排期 
  const [expertList, setExpertList] = useState<any[]>([])
  const [selectedExperts, setSelectedExperts] = useState<string[]>([])
  
  // 会诊地点列表 从码表加载 
  const [meetingRooms, setMeetingRooms] = useState<any[]>([])
  
  // 专家选择弹窗状态
  const [expertSelectorVisible, setExpertSelectorVisible] = useState(false)
  const [secretaryExperts, setSecretaryExperts] = useState<any[]>([])
  
  // 提交状态
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadConsultationDetail()
    loadExperts()
    loadMeetingRooms()
  }, [id])

  const loadExperts = async () => {
    const { data } = await supabase.from('experts').select('*').eq('status', 'active')
    if (data) setExpertList(data)
  }

  const loadMeetingRooms = async () => {
    const { data } = await supabase.from('sys_codes').select('*').eq('type_id', 'meeting_room').eq('status', 'active').order('sort_order')
    if (data) setMeetingRooms(data)
  }

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
      
      // 查询会诊专家 关联查询专家表 
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
      
      // 转换数据格式并添加到会诊对象中
      const expertsWithInfo = (expertData || []).map(ce => ({
        ...ce,
        expert_name: ce.expert?.name || null,
        expert_department: ce.expert?.department || null,
        expert_title: ce.expert?.title || null,
      }))
      
      // 将会诊专家数据（秘书安排的）添加到 consultation 对象中 - 只包含秘书邀请的专家
      const secretaryInvitedExperts = expertsWithInfo.filter(ce => ce.invited_by === 'secretary')
      setConsultation((prev: any) => ({
        ...prev,
        consultation_experts: secretaryInvitedExperts
      }))
      
      // 加载拟申请专家（只从 consultation_experts 中加载医生邀请的专家）
      const doctorInvitedExperts = expertsWithInfo
        .filter(ce => ce.invited_by === 'doctor')
        .map(ce => ({
          expert_name: ce.expert_name,
          expert_department: ce.expert_department,
          expert_title: ce.expert_title,
          status: ce.status || '待接受',
        }))
      
      setExperts(doctorInvitedExperts)
    } catch (err) {
      console.error('加载失败:', err)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 主任同意
  const handleDirectorApprove = () => {
    setDirectorApproveModalVisible(true)
  }

  const submitDirectorApprove = async () => {
    // 防止多次提交
    if (submitting) return
    
    // 验证审批意见必填
    if (!directorOpinion || directorOpinion.trim() === '') {
      message.error('请输入审批意见')
      return
    }
    
    setSubmitting(true)
    try {
      console.log('主任同意 - 会诊ID:', id)
      console.log('主任同意 - 用户信息:', user)
      
      // 更新会诊状态
      const updateResult = await supabase
        .from('consultations')
        .update({ status: 'secretary_pending' })
        .eq('id', id)
      
      console.log('状态更新结果', updateResult)
      
      // 插入审核历史
      const auditInsert = {
        consultation_id: id,
        operator_id: user?.id?.toString() || '',
        operator: user?.name || '',
        operator_role: 'director',
        node: 'department_audit',
        operator_type: 'approved',
        result: 'approved',
        opinion: directorOpinion,
        time: new Date().toISOString(),
        next_node: 'secretary_audit'
      }
      
      console.log('审核历史插入数据:', auditInsert)
      
      const auditResult = await supabase.from('audit_history').insert(auditInsert)
      
      console.log('审核历史插入结果:', auditResult)
      
      if (auditResult.error) {
        throw new Error('插入审核历史失败: ' + auditResult.error.message)
      }
      
      // 发送通知给申请医生
      if (consultation?.apply_doctor_id) {
        await sendSystemNotification(
          consultation.apply_doctor_id,
          'success',
          '会诊申请已通过主任审核',
          `您的会诊申请已通过${user?.name || '主任'}审核 患者 ${consultation.patient_name} 进入秘书审核阶段`,
          {
            label: '查看',
            url: `/consultation/my-applies`,
          }
        )
      }
      
      message.success('已同意')
      setDirectorOpinion('')
      setDirectorApproveModalVisible(false)
      loadConsultationDetail()
    } catch (err: any) {
      console.error('主任同意操作失败:', err)
      message.error('操作失败：' + (err.message || err))
    } finally {
      setSubmitting(false)
    }
  }

  // 主任驳回
  const handleDirectorReject = () => {
    setDirectorRejectModalVisible(true)
  }

  const submitDirectorReject = async () => {
    // 防止多次提交
    if (submitting) return
    
    // 验证驳回原因必填
    if (!directorOpinion || directorOpinion.trim() === '') {
      message.error('请输入驳回原因')
      return
    }
    
    setSubmitting(true)
    try {
      await supabase
        .from('consultations')
        .update({ status: 'director_rejected', reject_reason: directorOpinion })
        .eq('id', id)
      
      await supabase.from('audit_history').insert({
        consultation_id: id,
        operator_id: user?.id,
        operator: user?.name || '',
        operator_role: 'director',
        node: 'department_audit',
        operator_type: 'rejected',
        result: '拒绝',
        opinion: directorOpinion,
        time: new Date().toISOString(),
        next_node: 'archive'
      })
      
      // 发送通知给申请医生
      if (consultation?.apply_doctor_id) {
        await sendSystemNotification(
          consultation.apply_doctor_id,
          'error',
          '会诊申请被驳回',
          `您的会诊申请已被${user?.name || '主任'}驳回 患者 ${consultation.patient_name} 原因 ${directorOpinion}`,
          {
            label: '查看',
            url: `/consultation/my-applies`,
          }
        )
      }
      
      message.success('已驳回')
      setDirectorRejectModalVisible(false)
      setDirectorOpinion('')
      loadConsultationDetail()
    } catch (err) {
      console.error('主任驳回操作失败:', err)
      message.error('操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 秘书安排/修改排期
  const handleSchedule = async () => {
    setSecretaryExperts([])
    setSelectedExperts([])
    
    // 如果是已安排的会诊，加载已有的排期数据
    if (consultation?.status === 'scheduled' || consultation?.meeting_time) {
      setScheduleData({ 
        expect_time: consultation.meeting_time || '', 
        meeting_room: consultation.location || '', 
        notes: consultation.reject_reason || '' 
      })
      
      // 加载已安排的会诊专家
      const { data: expertData } = await supabase
        .from('consultation_experts')
        .select(`
          *,
          expert:expert_id (
            id,
            name,
            department,
            title
          )
        `)
        .eq('consultation_id', id)
      
      const scheduledExperts = (expertData || []).map(ce => ({
        id: ce.expert?.id || ce.expert_id,
        name: ce.expert?.name || '未知专家',
        department: ce.expert?.department || '未知科室',
        title: ce.expert?.title || '未知职称',
      }))
      
      setSecretaryExperts(scheduledExperts)
      setSelectedExperts(scheduledExperts.map(e => e.id))
    } else {
      // 首次安排，清空数据
      setScheduleData({ expect_time: '', meeting_room: '', notes: '' })
    }
    
    setScheduleModalVisible(true)
  }
  
  // 打开专家选择弹窗
  const handleOpenExpertSelector = () => {
    setExpertSelectorVisible(true)
  }
  
  // 确认选择专家
  const handleConfirmExpertSelection = (selected: any[]) => {
    setSecretaryExperts(selected)
    setSelectedExperts(selected.map(e => e.id))
    setExpertSelectorVisible(false)
  }

  const submitSchedule = async () => {
    // 防止重复提交
    if (submitting) return
    
    try {
      setSubmitting(true)
      
      // 验证 必须选择至少一位专家
      if (selectedExperts.length === 0) {
        message.warning('请至少选择一位会诊专家')
        return
      }
      
      // 验证 备注（审核意见）必填
      if (!scheduleData.notes || scheduleData.notes.trim() === '') {
        message.warning('请输入审核意见（必填）')
        return
      }
      
      // 更新会诊信息 使用 meeting_time 和 location 存储会诊时间和地点
      await supabase
        .from('consultations')
        .update({ 
          status: 'scheduled',
          meeting_time: scheduleData.expect_time,
          location: scheduleData.meeting_room,
        })
        .eq('id', id)
      
      await supabase.from('audit_history').insert({
        consultation_id: id,
        operator_id: user?.id,
        operator: user?.name || '',
        operator_role: 'secretary',
        node: consultation?.status === 'scheduled' || consultation?.meeting_time ? 'rescheduled' : 'secretary_audit',
        operator_type: consultation?.status === 'scheduled' || consultation?.meeting_time ? 'rescheduled' : 'scheduled',
        result: '已排期',
        opinion: scheduleData.notes,
        time: new Date().toISOString(),
        next_node: 'expert_invitation'
      })
      
      // 删除原有的秘书选择的专家记录，保留医生邀请的专家
      await supabase
        .from('consultation_experts')
        .delete()
        .eq('consultation_id', id)
        .eq('invited_by', 'secretary')
      
      // 保存秘书最终选择的专家 标记为秘书安排
      const expertInserts = selectedExperts.map(expertId => ({
        consultation_id: id,
        expert_id: expertId,
        status: 'pending_meeting',
        invited_by: 'secretary',
      }))
      await supabase.from('consultation_experts').insert(expertInserts)
      
      message.success('已安排')
      setScheduleModalVisible(false)
      setScheduleData({ expect_time: '', meeting_room: '', notes: '' })
      setSelectedExperts([])
      setSecretaryExperts([])
      loadConsultationDetail()
    } catch (err) {
      console.error('安排失败:', err)
      message.error('操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 秘书驳回
  const handleSecretaryReject = () => {
    setSecretaryRejectModalVisible(true)
  }

  const submitSecretaryReject = async () => {
    try {
      await supabase
        .from('consultations')
        .update({ status: 'rejected', reject_reason: secretaryRejectReason })
        .eq('id', id)
      
      await supabase.from('audit_history').insert({
        consultation_id: id,
        operator_id: user?.id,
        operator: user?.name || '',
        operator_role: 'secretary',
        node: 'secretary_audit',
        operator_type: 'rejected',
        result: '拒绝',
        opinion: secretaryRejectReason,
        time: new Date().toISOString(),
        next_node: 'archive'
      })
      
      // 发送通知给申请医生
      if (consultation?.apply_doctor_id) {
        await sendSystemNotification(
          consultation.apply_doctor_id,
          'error',
          '会诊申请被驳回',
          `您的会诊申请已被${user?.name || '秘书'}驳回 患者 ${consultation.patient_name} 原因 ${secretaryRejectReason || '未填写原因'}`,
          {
            label: '查看',
            url: `/consultation/my-applies`,
          }
        )
      }
      
      message.success('已驳回')
      setSecretaryRejectModalVisible(false)
      setSecretaryRejectReason('')
      loadConsultationDetail()
    } catch (err) {
      message.error('操作失败')
    }
  }

  // 医生撤回
  const handleRevoke = () => {
    setRevokeModalVisible(true)
  }

  const submitRevoke = async () => {
    try {
      await supabase
        .from('consultations')
        .update({ status: 'cancelled' })
        .eq('id', id)
      
      await supabase.from('audit_history').insert({
        consultation_id: id,
        operator_id: user?.id,
        operator: user?.name || '',
        operator_role: 'doctor',
        node: 'revoke',
        operator_type: 'revoked',
        result: '已取消',
        opinion: '申请人撤回',
        time: new Date().toISOString(),
        next_node: 'archive'
      })
      
      // 发送通知给主任
      if (consultation?.director_id) {
        await sendSystemNotification(
          consultation.director_id,
          'warning',
          '会诊申请已撤回',
          `${user?.name || '医生'}撤回了会诊申请 患者 ${consultation.patient_name}`,
          {
            label: '查看',
            url: `/consultation/director-confirm`,
          }
        )
      }
      
      // 发送通知给秘书
      if (consultation?.secretary_id) {
        await sendSystemNotification(
          consultation.secretary_id,
          'warning',
          '会诊申请已撤回',
          `${user?.name || '医生'}撤回了会诊申请 患者 ${consultation.patient_name}`,
          {
            label: '查看',
            url: `/consultation/pending-review`,
          }
        )
      }
      
      message.success('已撤回')
      setRevokeModalVisible(false)
      loadConsultationDetail()
    } catch (err) {
      message.error('操作失败')
    }
  }

  if (loading) {
    return (
      <Card>
        <Spin spinning={true} tip="加载中..." />
      </Card>
    )
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
    gender: '',
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
  // 主任医生可以查看待审核的会诊 申请医生可以查看自己的申请
  console.log('权限检查', { 
    userRole: user?.role, 
    consultationStatus: consultation?.status,
    isDirector: user?.role === ROLE.DIRECTOR,
    isDoctorSubmit: consultation?.status === CONSULTATION_STATUS.DOCTOR_SUBMIT,
    isApplyDoctor: user?.id === consultation?.apply_doctor_id
  })
  
  const canAccess = hasPermission('perm-consultation-detail') ||
    (user?.role === ROLE.DIRECTOR && ['doctor_submit', 'director_pending', 'director_rejected', 'secretary_pending', 'rejected', 'cancelled'].includes(consultation?.status)) ||
    (user?.role === ROLE.SECRETARY && ['secretary_pending', 'scheduled', 'pending_meeting', 'expert_confirmed', 'rejected', 'cancelled'].includes(consultation?.status)) ||
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
            {/* 主任角色 同意和驳回按钮 */}
            {user?.role === ROLE.DIRECTOR && ['doctor_submit', 'director_pending'].includes(consultation.status) && (
              <>
                <Button type="primary" onClick={handleDirectorApprove}>同意</Button>
                <Button danger onClick={handleDirectorReject}>驳回</Button>
              </>
            )}
            
            {/* 秘书角色 安排和驳回按钮 */}
            {user?.role === ROLE.SECRETARY && ['secretary_pending'].includes(consultation.status) && (
              <>
                <Button type="primary" onClick={handleSchedule}>排期</Button>
                <Button danger onClick={handleSecretaryReject}>驳回</Button>
              </>
            )}
            
            {/* 秘书角色 修改排期和驳回按钮 */}
            {user?.role === ROLE.SECRETARY && ['scheduled', 'pending_meeting', 'expert_confirmed'].includes(consultation.status) && (
              <>
                <Button type="primary" onClick={handleSchedule}>修改排期</Button>
                <Button danger onClick={handleSecretaryReject}>驳回</Button>
              </>
            )}
            
            {/* 医生角色 撤回按钮 */}
            {user?.role === ROLE.APPLY_DOCTOR && 
              ['doctor_submit', 'director_pending', 'secretary_pending'].includes(consultation.status) && (
              <Button danger onClick={handleRevoke}>撤回</Button>
            )}
            
            {/* 只有申请医生且状态为主任驳回时才显示补正 */}
            {consultation.status === 'director_rejected' && 
              consultation.apply_doctor === user?.name && (
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={() => navigate(`/consultation/apply?id=${id}`)}
              >
                补正
              </Button>
            )}
            {/* 只有申请医生且状态为进行中时才显示进入会诊室 */}
            {consultation.status === 'in_progress' && 
              consultation.apply_doctor === user?.name && (
              <Button type="primary" icon={<VideoCameraOutlined />} onClick={() => navigate(`/consultation/room/${id}`)}>
                进入会诊
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
                <Tag color={getConsultationTypeColor(consultation.type)} style={{ fontSize: '14px', padding: '4px 12px' }}>
                  {getConsultationTypeName(consultation.type)}
                </Tag>
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
                        let urgency = consultation.urgency || consultation.urgency_level || 'normal'
                        
                        // 处理中文值映射为英文代码
                        const chineseToEnglish: Record<string, string> = {
                          '普通': 'normal',
                          '紧急': 'urgent',
                          '特急': 'critical',
                        }
                        if (chineseToEnglish[urgency]) {
                          urgency = chineseToEnglish[urgency]
                        }
                        
                        const color = getUrgencyColor(urgency)
                        const name = getUrgencyName(urgency) || urgency
                        
                        if (urgency === 'critical') {
                          return (
                            <Tag color={color} style={{ fontSize: '14px', padding: '4px 12px', fontWeight: 'bold', animation: 'pulse 1s infinite' }}>
                              <span className="flex items-center gap-1">
                                <AlertOutlined />
                                {name}
                              </span>
                            </Tag>
                          )
                        }
                        
                        if (urgency === 'urgent') {
                          return (
                            <Tag color={color} style={{ fontSize: '14px', padding: '4px 12px', fontWeight: 'bold' }}>
                              <span className="flex items-center gap-1">
                                <ClockCircleOutlined />
                                {name}
                              </span>
                            </Tag>
                          )
                        }
                        
                        return (
                          <Tag color={color} style={{ fontSize: '14px', padding: '4px 12px' }}>
                            {name}
                          </Tag>
                        )
                      })()}
                    </Descriptions.Item>
                    <Descriptions.Item label="状态">
                      <Badge status={
                        consultation.status === 'in_progress' ? 'processing' : 
                        consultation.status === 'director_rejected' || consultation.status === 'rejected' || consultation.status === 'cancelled' ? 'error' : 
                        'default'
                      } text={getConsultationStatusName(consultation.status)} />
                    </Descriptions.Item>
                    <Descriptions.Item label="会诊时间">
                      {consultation.meeting_time ? dayjs(consultation.meeting_time).format('YYYY-MM-DD HH:mm') : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="会诊地点">
                      {consultation.location || '-'}
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
                            <Text strong>主诉</Text>
                            <Text style={{ whiteSpace: 'pre-wrap' }}>{consultation.medical_records.chiefComplaint}</Text>
                          </div>
                        )}
                        {consultation.medical_records.presentIllness && (
                          <div className="mb-3">
                            <Text strong>现病史 </Text>
                            <Text style={{ whiteSpace: 'pre-wrap' }}>{consultation.medical_records.presentIllness}</Text>
                          </div>
                        )}
                        {consultation.medical_records.pastHistory && (
                          <div className="mb-3">
                            <Text strong>既往史 </Text>
                            <Text style={{ whiteSpace: 'pre-wrap' }}>{consultation.medical_records.pastHistory}</Text>
                          </div>
                        )}
                        {consultation.medical_records.physicalExamination && (
                          <div className="mb-3">
                            <Text strong>体格检查 </Text>
                            <Text style={{ whiteSpace: 'pre-wrap' }}>{consultation.medical_records.physicalExamination}</Text>
                          </div>
                        )}
                        {consultation.medical_records.auxiliaryExamination && (
                          <div className="mb-3">
                            <Text strong>辅助检查 </Text>
                            <Text style={{ whiteSpace: 'pre-wrap' }}>{consultation.medical_records.auxiliaryExamination}</Text>
                          </div>
                        )}
                        {consultation.medical_records.initialDiagnosis && (
                          <div className="mb-3">
                            <Text strong>初步诊断</Text>
                            <Text style={{ whiteSpace: 'pre-wrap' }}>{consultation.medical_records.initialDiagnosis}</Text>
                          </div>
                        )}
                        {consultation.medical_records.treatmentPlan && (
                          <div>
                            <Text strong>治疗方案</Text>
                            <Text style={{ whiteSpace: 'pre-wrap' }}>{consultation.medical_records.treatmentPlan}</Text>
                          </div>
                        )}
                      </Card>
                    </>
                  )}

                  {/* 专家团队 Tab 页 */}
                  <div className="mt-6">
                    <Tabs
                      items={[
                        {
                          key: 'meeting-experts',
                          label: '会诊专家',
                          children: consultation.consultation_experts && consultation.consultation_experts.length > 0 ? (
                            <Card size="small" style={{ background: '#f0f9ff' }}>
                              <List
                                dataSource={consultation.consultation_experts}
                                renderItem={(ce: any) => {
                                  const expert = ce.expert || ce
                                  const expertName = expert?.expert_name || expert?.name || '未知专家'
                                  const expertDept = expert?.expert_department || expert?.department || '未知科室'
                                  const expertRole = expert?.expert_role || expert?.title || '未知职称'
                                  const status = ce.status || expert?.status || '待接受'
                                  const statusTextMap: Record<string, string> = {
                                    'pending_meeting': '待会议',
                                    '已接受': '已接受',
                                    '待接受': '待接受',
                                    'confirmed': '已确认',
                                  }
                                  const displayStatus = statusTextMap[status] || status
                                  
                                  return (
                                    <List.Item>
                                      <List.Item.Meta
                                        avatar={<Avatar style={{ backgroundColor: '#1890ff' }}>{expertName[0]}</Avatar>}
                                        title={<Text strong>{expertName}</Text>}
                                        description={
                                          <Space split={<Divider type="vertical" />}>
                                            <Text type="secondary">{expertDept}</Text>
                                            <Text type="secondary">{expertRole}</Text>
                                            <Tag color={displayStatus === '已接受' || displayStatus === '已确认' ? 'green' : displayStatus === '待接受' || displayStatus === '待会议' ? 'orange' : 'gray'} style={{ fontSize: '12px', padding: '2px 8px' }}>
                                              {displayStatus}
                                            </Tag>
                                          </Space>
                                        }
                                      />
                                    </List.Item>
                                  )
                                }}
                              />
                            </Card>
                          ) : (
                            <Empty description="暂无会诊专家" />
                          ),
                        },
                        {
                          key: 'invited-experts',
                          label: '拟申请专家',
                          children: experts && experts.length > 0 ? (
                            <Card size="small" style={{ background: '#fafafa' }}>
                              <List
                                dataSource={experts}
                                renderItem={(expert) => {
                                  const expertName = expert.expert_name || expert.name || '未知专家'
                                  const expertDept = expert.expert_department || expert.department || '未知科室'
                                  const expertRole = expert.expert_title || expert.title || '未知职称'
                                  
                                  return (
                                    <List.Item style={{ padding: '8px 0' }}>
                                      <List.Item.Meta
                                        avatar={<Avatar size="small" style={{ backgroundColor: '#8c8c8c' }}>{expertName[0]}</Avatar>}
                                        title={<Text type="secondary" style={{ fontSize: '13px' }}>{expertName}</Text>}
                                        description={<Text type="secondary" style={{ fontSize: '12px' }}>{expertDept} · {expertRole}</Text>}
                                      />
                                    </List.Item>
                                  )
                                }}
                              />
                            </Card>
                          ) : (
                            <Empty description="暂无拟申请专家" />
                          ),
                        },
                      ]}
                    />
                  </div>

                  {/* 审核流程 */}
                  <div className="mt-6">
                    <Title level={5}>审核流程</Title>
                    {auditHistory && auditHistory.length > 0 ? (
                      <Timeline
                        mode="left"
                        items={auditHistory.map((audit) => {
                          // 使用编码获取显示名称和颜色
                          const resultCode = audit.result || 'unknown'
                          const resultName = getAuditResultName(resultCode)
                          const resultColor = getCodeColor('audit_result', resultCode) || 'gray'
                          
                          const colorMap: Record<string, string> = {
                            'approved': 'green',
                            'scheduled': 'blue',
                            'rescheduled': 'purple',
                            'rejected': 'red',
                            'confirmed': 'green',
                            'cancelled': 'default',
                          }
                          const iconMap: Record<string, React.ReactNode> = {
                            'approved': <CheckCircleOutlined />,
                            'scheduled': <CheckCircleOutlined />,
                            'rescheduled': <CheckCircleOutlined />,
                            'confirmed': <CheckCircleOutlined />,
                            'rejected': <CloseCircleOutlined />,
                            'cancelled': <CloseCircleOutlined />,
                          }
                          return {
                            color: colorMap[resultCode] || resultColor,
                            dot: iconMap[resultCode] || <CheckCircleOutlined />,
                            label: (
                              <div className="flex justify-between items-center">
                                <Space>
                                  <Tag color="blue">
                                    {getAuditNodeName(audit.node) || audit.operator_role}
                                  </Tag>
                                  <Text strong>{audit.operator || '未知'}</Text>
                                </Space>
                                <Tag color={colorMap[resultCode] || resultColor}>
                                  {resultName}
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
              label: '资料',
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
                    { color: 'blue', children: '[14:00] 张明华 患者目前情况稳定 建议先行化疗' },
                    { color: 'green', children: '[14:15] 李芳 同意张主任意见 建议使用GP 方案' },
                    { color: 'blue', children: '[14:20] 王建国 影像学显示肿瘤有所缩小' },
                    { color: 'gray', children: '[14:30] 系统 讨论进行中...' },
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
      
      {/* 主任同意弹窗 */}
      <Modal
        title="同意会诊申请"
        open={directorApproveModalVisible}
        onOk={submitDirectorApprove}
        onCancel={() => {
          setDirectorApproveModalVisible(false)
          setDirectorOpinion('')
        }}
        confirmLoading={submitting}
      >
        <div>
          <p><strong>患者：</strong>{consultation?.patient_name}</p>
          <p><strong>会诊 ID：</strong>{consultation?.consultation_code || consultation?.id}</p>
          <div className="mt-4">
            <strong>审批意见：</strong>
            <Input.TextArea
              rows={4}
              value={directorOpinion}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDirectorOpinion(e.target.value)}
              placeholder="请输入审批意见（必填）..."
            />
          </div>
        </div>
      </Modal>
      
      {/* 主任驳回弹窗 */}
      <Modal
        title="驳回会诊申请"
        open={directorRejectModalVisible}
        onOk={submitDirectorReject}
        onCancel={() => {
          setDirectorRejectModalVisible(false)
          setDirectorOpinion('')
        }}
        confirmLoading={submitting}
      >
        <div>
          <p><strong>患者：</strong>{consultation?.patient_name}</p>
          <p><strong>会诊 ID：</strong>{consultation?.consultation_code || consultation?.id}</p>
          <div className="mt-4">
            <strong>驳回原因：</strong>
            <Input.TextArea
              rows={4}
              value={directorOpinion}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDirectorOpinion(e.target.value)}
              placeholder="请输入驳回原因（必填）..."
            />
          </div>
        </div>
      </Modal>
      
      {/* 秘书安排/修改排期弹窗 */}
      <Modal
        title={consultation?.status === 'scheduled' || consultation?.meeting_time ? '修改会诊排期' : '秘书安排会诊'}
        open={scheduleModalVisible}
        onOk={submitSchedule}
        onCancel={() => {
          setScheduleModalVisible(false)
          setScheduleData({ expect_time: '', meeting_room: '', notes: '' })
          setSelectedExperts([])
          setSecretaryExperts([])
        }}
        width={800}
        okButtonProps={{ loading: submitting }}
      >
        <div className="space-y-4">
          <div>
            <p><strong>患者：</strong>{consultation?.patient_name}</p>
            <p><strong>诊断：</strong>{consultation?.main_diagnosis}</p>
            <p><strong>申请时间：</strong>{consultation?.apply_time ? dayjs(consultation.apply_time).format('YYYY-MM-DD HH:mm') : '-'}</p>
          </div>
          
          <div>
            <strong>医生拟会诊时间：</strong>
            <div className="mt-2 p-2 bg-gray-50 border rounded">
              {consultation?.expect_time ? dayjs(consultation.expect_time).format('YYYY-MM-DD HH:mm') : '未填写'}
            </div>
          </div>
          
          <div>
            <strong>秘书安排会诊时间：</strong>
            <DatePicker
              showTime
              style={{ width: '100%', marginTop: 8 }}
              value={scheduleData.expect_time ? dayjs(scheduleData.expect_time) : null}
              onChange={(date) => setScheduleData({ ...scheduleData, expect_time: date?.toISOString() || '' })}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </div>
          
          <div>
            <strong>会诊地点：</strong>
            <Select
              showSearch
              allowClear
              style={{ width: '100%', marginTop: 8 }}
              placeholder="请选择或输入会诊地点"
              value={scheduleData.meeting_room}
              onChange={(value) => setScheduleData({ ...scheduleData, meeting_room: value })}
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {meetingRooms.map(room => (
                <Select.Option key={room.code} value={room.name}>
                  {room.name}
                </Select.Option>
              ))}
            </Select>
          </div>
          
          <div>
            <strong>医生拟邀请专家 </strong>
            <div className="mt-2 p-2 bg-gray-50 border rounded">
              {experts && experts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {experts.map(expert => (
                    <Tag key={expert.id || expert.expert_id} color="blue">
                      {expert.expert_name || expert.name} - {expert.expert_department || expert.department}
                    </Tag>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400">未邀请专家</span>
              )}
            </div>
          </div>
          
          <div>
            <strong>秘书安排会诊专家：</strong>
            <div className="mt-2 space-y-2">
              {secretaryExperts.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border rounded">
                  {secretaryExperts.map(expert => (
                    <Tag key={expert.id} color="green" closable onClose={() => {
                      const updated = secretaryExperts.filter(e => e.id !== expert.id)
                      setSecretaryExperts(updated)
                      setSelectedExperts(updated.map(e => e.id))
                    }}>
                      {expert.name} - {expert.department} - {expert.title}
                    </Tag>
                  ))}
                </div>
              ) : (
                <div className="p-2 bg-gray-50 border rounded text-center text-gray-400">
                  暂未选择专家
                </div>
              )}
              <Button 
                type="dashed" 
                icon={<PlusOutlined />} 
                onClick={handleOpenExpertSelector}
                block
              >
                {secretaryExperts.length > 0 ? '调整专家' : '选择专家'}
              </Button>
            </div>
          </div>
          
          <div>
            <strong>审核意见 <span style={{ color: 'red' }}>*</span>：</strong>
            <Input.TextArea
              rows={3}
              value={scheduleData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setScheduleData({ ...scheduleData, notes: e.target.value })}
              placeholder="请输入审核意见（必填）..."
              style={{ marginTop: 8 }}
            />
          </div>
        </div>
      </Modal>
      
      {/* 专家选择弹窗 */}
      <ExpertSelectorModal
        open={expertSelectorVisible}
        onCancel={() => setExpertSelectorVisible(false)}
        onConfirm={handleConfirmExpertSelection}
        selectedExperts={secretaryExperts}
      />
      
      {/* 秘书驳回弹窗 */}
      <Modal
        title="驳回会诊申请"
        open={secretaryRejectModalVisible}
        onOk={submitSecretaryReject}
        onCancel={() => {
          setSecretaryRejectModalVisible(false)
          setSecretaryRejectReason('')
        }}
      >
        <div>
          <p><strong>患者：</strong>{consultation?.patient_name}</p>
          <p><strong>会诊 ID：</strong>{consultation?.consultation_code || consultation?.id}</p>
          <div className="mt-4">
            <strong>驳回原因：</strong>
            <Input.TextArea
              rows={4}
              value={secretaryRejectReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSecretaryRejectReason(e.target.value)}
              placeholder="请输入驳回原因..."
            />
          </div>
        </div>
      </Modal>
      
      {/* 医生撤回弹窗 */}
      <Modal
        title="撤回会诊申请"
        open={revokeModalVisible}
        onOk={submitRevoke}
        onCancel={() => setRevokeModalVisible(false)}
      >
        <div>
          <p><strong>患者：</strong>{consultation?.patient_name}</p>
          <p><strong>会诊 ID：</strong>{consultation?.consultation_code || consultation?.id}</p>
          <p className="mt-4 text-red-500">确认要撤回此会诊申请吗？撤回后将无法恢复！</p>
        </div>
      </Modal>
    </Spin>
  )
}
