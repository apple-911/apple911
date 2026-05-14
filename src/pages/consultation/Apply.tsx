import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { Card, Steps, Form, Input, Select, DatePicker, Button, Table, Tag, Space, message, Modal, Upload, List, Avatar, Typography, Row, Col, Spin, Alert, Badge, Divider, Tooltip, Drawer, Progress, Tabs, Radio, Result } from 'antd'
import { SearchOutlined, UserAddOutlined, UploadOutlined, PlusOutlined, CheckCircleOutlined, RobotOutlined, ThunderboltOutlined, FileProtectOutlined, WarningOutlined, CheckCircleFilled, StarFilled, UserOutlined, DatabaseOutlined, SyncOutlined, TeamOutlined, EyeOutlined, FileTextOutlined } from '@ant-design/icons'
import { mockPatients } from '../../mocks/data'
import type { ColumnsType } from 'antd/es/table'
import type { Patient, Expert, UploadedFile } from '../../stores/consultationStore'
import type { MDTNecessityAssessment } from '../../services/integration/ai/aiPatientScreeningService'
import dayjs from 'dayjs'
import intelligentConsultationService, { IntelligentApplication, ExpertMatch } from '../../services/integration/ai/intelligentConsultationService'
import aiPatientScreeningService from '../../services/integration/ai/aiPatientScreeningService'
import PatientInfo from '../../components/PatientInfo'
import MaterialUpload from '../../components/MaterialUpload'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../stores/appStore'
import { generateConsultationCode } from '../../utils/consultationCode'
import { sendSystemNotification } from '../../stores/notificationStore'
import { hasPermission } from '../../utils/helpers'
import { CONSULTATION_STATUS, ROLE, POSITION, URGENCY_LEVEL, CONSULTATION_TYPE } from '../../utils/statusMapping'
import { getUrgencyName, getUrgencyColor, getConsultationTypeName, getConsultationTypeColor } from '../../utils/codeTable'

const { TextArea } = Input
const { Title, Text } = Typography

interface PatientWithAI extends Patient {
  aiAssessment?: MDTNecessityAssessment
}

export default function Apply() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const { user } = useAppStore()
  // 如果是编辑模式（有 id 参数），直接从步骤 1 开始（填写会诊信息）
  const consultationId = searchParams.get('id')
  const [currentStep, setCurrentStep] = useState(consultationId ? 1 : 0)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedExperts, setSelectedExperts] = useState<Expert[]>([])
  const [form] = Form.useForm()
  const navigate = useNavigate()
  
  // 判断用户角色
  const isSecretary = user?.position === POSITION.MDT_SECRETARY || user?.role === ROLE.SECRETARY
  
  // 搜索和筛选状态
  const [searchText, setSearchText] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [aiFilter, setAiFilter] = useState('') // AI 预判筛选
  const [allDepartments, setAllDepartments] = useState<string[]>([]) // 所有科室列表
  
  // AI 辅助相关状态
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<IntelligentApplication | null>(null)
  const [showAiPanel, setShowAiPanel] = useState(false)
  
  // 智能匹配专家相关状态
  const [matchDrawerVisible, setMatchDrawerVisible] = useState(false)
  const [matchedExperts, setMatchedExperts] = useState<ExpertMatch[]>([])
  const [matchLoading, setMatchLoading] = useState(false)
  
  // 患者信息抽屉相关状态
  const [patientDrawerVisible, setPatientDrawerVisible] = useState(false)
  
  // 材料上传相关状态
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [medicalRecords, setMedicalRecords] = useState<any>([])
  const [hisDataSynced, setHisDataSynced] = useState(false)
  const [hisSyncLoading, setHisSyncLoading] = useState(false)
  
  // 患者数据（带 AI 评估）
  const [patientsWithAI, setPatientsWithAI] = useState<PatientWithAI[]>([])
  const [patientsLoading, setPatientsLoading] = useState(false)
  
  // 专家数据（从数据库加载）
  const [expertsData, setExpertsData] = useState<Expert[]>([])
  const [submitting, setSubmitting] = useState(false)

  // 会议室数据（从数据库加载）
  const [meetingRooms, setMeetingRooms] = useState<any[]>([])

  // 从数据库加载患者数据
  useEffect(() => {
    const loadPatients = async () => {
      setPatientsLoading(true)
      try {
        // 1. 先加载所有患者
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (patientsError) throw patientsError
        
        // 2. 加载所有会诊申请
        const { data: allConsultations } = await supabase
          .from('consultations')
          .select('patient_inpatient_no, status')
        
        // 3. 找出有活跃会诊的患者（状态不是已完成、已取消、秘书驳回、待质检审核、待归档的）
        const activePatientNos = new Set(
          (allConsultations || [])
            .filter(c => !['completed', 'archived', 'rejected', 'cancelled'].includes(c.status))
            .map(c => c.patient_inpatient_no)
        )
        
        // 4. 过滤掉有活跃会诊的患者，只显示可以申请的患者
        const availablePatients = (patientsData || []).filter(p => !activePatientNos.has(p.inpatient_no))
        
        // 4. 将数据库数据转换为 PatientWithAI 格式
        const patientsDataWithAI: PatientWithAI[] = availablePatients.map(p => ({
          id: p.id,
          name: p.name,
          gender: p.gender,
          age: p.age,
          inpatientNo: p.inpatient_no,
          phone: p.phone,
          mainDiagnosis: p.main_diagnosis,
          lastConsultationTime: p.last_consultation_time,
          admissionTime: p.admission_time,
          department: p.department,
          doctor: p.doctor,
          allergies: p.allergies,
          history: p.history,
          imagingExams: p.imaging_exams,
          // 添加病历相关字段
          physicalExamination: p.physical_exam,
          initialDiagnosis: p.initial_diagnosis,
          treatmentPlan: p.treatment_plan,
          chiefComplaint: p.chief_complaint,
          presentIllness: p.present_illness,
          pastHistory: p.past_history,
          auxiliaryExamination: p.auxiliary_examination,
        }))
        
        setPatientsWithAI(patientsDataWithAI)
        
        // 5. 提取所有科室列表
        const departments = Array.from(new Set(availablePatients.map(p => p.department).filter(Boolean)))
        setAllDepartments(departments)
        
        // 6. 默认筛选当前医生的科室（秘书角色除外）
        if (user?.department && departments.length > 0 && !isSecretary) {
          // 如果医生有科室信息且不是秘书，默认筛选该科室
          setDepartmentFilter(user.department)
        }
      } catch (err) {
        console.error('加载患者数据失败:', err)
      } finally {
        setPatientsLoading(false)
      }
    }
    
    loadPatients()
  }, [user?.department])

  // 从数据库加载专家数据
  useEffect(() => {
    const loadExperts = async () => {
      try {
        const { data, error } = await supabase
          .from('experts')
          .select('*')
          .order('name')
        
        if (error) throw error
        
        // 将数据库数据转换为 Expert 格式
        const expertsList: Expert[] = (data || []).map(e => ({
          id: e.id,
          name: e.name,
          department: e.department,
          title: e.title,
          specialty: e.specialty,
          status: e.status as '空闲' | '忙碌' | '离线',
        }))
        
        setExpertsData(expertsList)
      } catch (err) {
        console.error('加载专家数据失败:', err)
      }
    }
    
    loadExperts()
  }, [])

  // 从数据库加载会议室数据
  useEffect(() => {
    const loadMeetingRooms = async () => {
      try {
        const { data, error } = await supabase
          .from('sys_codes')
          .select('*')
          .eq('type_id', 'meeting_room')
          .eq('status', 'active')
          .order('sort_order')
        
        if (error) throw error
        setMeetingRooms(data || [])
      } catch (err) {
        console.error('加载会议室数据失败:', err)
      }
    }
    
    loadMeetingRooms()
  }, [])

  // 从 URL 参数中获取患者 ID 或随访信息并自动选择患者
  useEffect(() => {
    const patientId = searchParams.get('patientId')
    const followupId = searchParams.get('followupId')
    const mdtType = searchParams.get('mdtType')
    const consultationId = searchParams.get('id') // 编辑驳回的申请
    
    // 如果是编辑驳回的申请
    if (consultationId) {
      loadRejectedConsultation(consultationId)
      return
    }
    
    // 如果是筛查推荐的 MDT，从 location.state 获取筛查数据
    if (mdtType === 'screening' && location.state?.screeningData) {
      const screeningData = location.state.screeningData
      // 根据患者姓名查找患者
      const patient = mockPatients.find(p => p.name === screeningData.patientName)
      if (patient) {
        handlePatientSelect(patient)
        // 自动填充会诊信息
        setTimeout(() => {
          form.setFieldsValue({
            summary: `AI 筛查推荐 MDT - ${screeningData.recommendations.join('；')}`,
            type: CONSULTATION_TYPE.INHOSPITAL,
            urgency: screeningData.level === 'urgent' ? URGENCY_LEVEL.URGENT : URGENCY_LEVEL.NORMAL
          })
        }, 500)
      }
    }
    // 如果是二次 MDT，从 location.state 获取随访数据
    else if (mdtType === 'secondary' && location.state?.followupData) {
      const followupData = location.state.followupData
      // 根据患者姓名查找患者
      const patient = mockPatients.find(p => p.name === followupData.patientName)
      if (patient) {
        handlePatientSelect(patient)
        // 自动填充会诊信息
        setTimeout(() => {
          form.setFieldsValue({
            summary: `二次 MDT 会诊 - ${followupData.mdtReason}`,
            type: CONSULTATION_TYPE.INHOSPITAL,
            urgency: followupData.urgency === 'emergency' ? URGENCY_LEVEL.URGENT : followupData.urgency === 'urgent' ? URGENCY_LEVEL.URGENT : URGENCY_LEVEL.NORMAL
          })
        }, 500)
      }
    } else if (patientId) {
      // 普通患者选择
      const patient = mockPatients.find(p => p.id === patientId)
      if (patient) {
        handlePatientSelect(patient)
      }
    }
  }, [searchParams, location.state])

  // 加载驳回的会诊申请用于编辑
  const loadRejectedConsultation = async (id: string) => {
    try {
      const { data: consultation, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      
      // 检查是否为可编辑状态（包含中文和英文状态码）
      const editableStatuses = ['director_rejected', 'material_rejected', 'pending_supplement']
      if (!editableStatuses.includes(consultation.status)) {
        message.error('该申请不是驳回状态，无法编辑')
        navigate('/consultation/my-applies')
        return
      }
      
      // 确保患者数据已加载
      if (patientsWithAI.length === 0) {
        // 等待患者数据加载
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      // 查找对应的患者（通过住院号匹配）
      const patient = patientsWithAI.find(p => p.inpatientNo === consultation.patient_inpatient_no)
      if (patient) {
        setSelectedPatient(patient)
        // 直接跳转到 Step 1（填写申请信息），而不是 Step 0（选择患者）
        setCurrentStep(1)
        
        // 自动填充表单
        form.setFieldsValue({
          summary: `患者${patient.name}，${patient.gender}，${patient.age}岁。主要诊断：${patient.mainDiagnosis}。`,
          type: consultation.type,
          urgency: consultation.urgency,
          expectTime: consultation.meeting_time ? dayjs(consultation.meeting_time) : (consultation.expect_time ? dayjs(consultation.expect_time) : null),  // 优先加载 meeting_time（秘书提交的），没有则加载 expect_time
          location: consultation.location || null,  // 加载会诊地点
        })
        
        // 自动同步 HIS 数据
        setTimeout(() => {
          handleHISDataSync(patient)
        }, 300)
        
        message.info('正在编辑驳回的申请，请修改后重新提交')
      } else {
        // 如果找不到患者，尝试直接从数据库加载
        const { data: patientData } = await supabase
          .from('patients')
          .select('*')
          .eq('inpatient_no', consultation.patient_inpatient_no)
          .single()
        
        if (patientData) {
          // 转换为 Patient 格式
          const patient: Patient = {
            id: patientData.id,
            name: patientData.name,
            gender: patientData.gender,
            age: patientData.age,
            inpatientNo: patientData.inpatient_no,
            phone: patientData.phone,
            mainDiagnosis: patientData.main_diagnosis,
            lastConsultationTime: patientData.last_consultation_time,
            admissionTime: patientData.admission_time,
            department: patientData.department,
            doctor: patientData.doctor,
            allergies: patientData.allergies || [],
            history: patientData.history || [],
            // 添加病历相关字段
            physicalExamination: patientData.physical_exam,
            initialDiagnosis: patientData.initial_diagnosis,
            treatmentPlan: patientData.treatment_plan,
            chiefComplaint: patientData.chief_complaint,
            presentIllness: patientData.present_illness,
            pastHistory: patientData.past_history,
            auxiliaryExamination: patientData.auxiliary_examination,
          }
          
          setSelectedPatient(patient)
          setCurrentStep(1)
          
          form.setFieldsValue({
            summary: `患者${patient.name}，${patient.gender}，${patient.age}岁。主要诊断：${patient.mainDiagnosis}。`,
            type: consultation.type,
            urgency: consultation.urgency,
            expectTime: consultation.meeting_time ? dayjs(consultation.meeting_time) : (consultation.expect_time ? dayjs(consultation.expect_time) : null),  // 优先加载 meeting_time（秘书提交的），没有则加载 expect_time
            location: consultation.location || null,  // 加载会诊地点
          })
          
          setTimeout(() => {
            handleHISDataSync(patient)
          }, 300)
          
          message.info('正在编辑驳回的申请，请修改后重新提交')
        } else {
          message.error('未找到患者信息')
          navigate('/consultation/my-applies')
        }
      }
    } catch (err) {
      console.error('加载失败:', err)
      message.error('加载申请信息失败')
      navigate('/consultation/my-applies')
    }
  }

  const patientColumns: ColumnsType<PatientWithAI> = [
    { 
      title: '姓名', 
      dataIndex: 'name', 
      render: (t, record) => (
        <Space>
          <a onClick={(e) => {
            e.stopPropagation()
            handlePatientSelect(record)
          }}>{t}</a>
          <Tooltip title="查看患者 360 视图">
            <Button 
              type="link" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/patient/360/${record.id}`)
              }}
            />
          </Tooltip>
        </Space>
      )
    },
    { title: '住院号', dataIndex: 'inpatientNo' },
    { title: '性别', dataIndex: 'gender' },
    { title: '年龄', dataIndex: 'age' },
    { title: '主要诊断', dataIndex: 'mainDiagnosis', ellipsis: true },
    { title: '科室', dataIndex: 'department' },
    { title: '主治医生', dataIndex: 'doctor' },
    {
      title: '最近会诊',
      dataIndex: 'lastConsultationTime',
      width: 120,
      render: (text) => text ? <Text type="secondary">{text}</Text> : <Text type="secondary">无</Text>
    },
    {
      title: 'AI MDT 预判',
      key: 'aiAssessment',
      width: 220,
      render: (_, record) => {
        if (!record.aiAssessment) {
          return (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Tag 
                style={{ 
                  margin: 0, 
                  height: '28px',
                  lineHeight: '26px',
                  padding: '0 8px',
                  fontSize: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '100px',
                  color: '#999',
                  border: '1px solid #d9d9d9',
                  background: '#fafafa'
                }}
              >
                未评估
              </Tag>
              <Button 
                type="primary"
                ghost
                size="small"
                style={{ 
                  height: '28px',
                  fontSize: '12px',
                  padding: '0 8px',
                  width: '100px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={async (e) => {
                  e.stopPropagation()
                  message.loading('AI 评估中...', 0)
                  try {
                    const assessment = await aiPatientScreeningService.assessMDTNecessity(record.id)
                    const updated = patientsWithAI.map(p => 
                      p.id === record.id ? { ...p, aiAssessment: assessment } : p
                    )
                    setPatientsWithAI(updated)
                    message.success('AI 评估完成')
                  } catch (error) {
                    message.error('AI 评估失败')
                  } finally {
                    message.destroy()
                  }
                }}
              >
                AI 评估
              </Button>
            </div>
          )
        }
        
        const score = record.aiAssessment.necessityScore
        const level = record.aiAssessment.recommendationLevel
        
        let color = 'default'
        let text = level as string
        
        if (level === '强烈推荐') {
          color = 'red'
          text = `强烈推荐`
        } else if (level === '推荐') {
          color = 'orange'
          text = '推荐'
        } else if (level === '可考虑') {
          color = 'blue'
          text = '可考虑'
        } else {
          color = 'green'
          text = '不推荐'
        }
        
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Tooltip title={
              <div style={{ padding: '4px 0' }}>
                <div><strong>评分：</strong>{score}分</div>
                <div><strong>置信度：</strong>{record.aiAssessment.confidence}%</div>
                <div><strong>推荐类型：</strong>{record.aiAssessment.recommendedType}</div>
                <div><strong>紧急程度：</strong>{record.aiAssessment.urgency}</div>
              </div>
            }>
              <Tag 
                color={color} 
                style={{ 
                  margin: 0, 
                  cursor: 'pointer',
                  height: '28px',
                  lineHeight: '26px',
                  padding: '0 8px',
                  fontSize: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '100px'
                }}
              >
                {text}
              </Tag>
            </Tooltip>
            <Button 
              type="primary"
              ghost
              size="small"
              style={{ 
                height: '28px',
                fontSize: '12px',
                padding: '0 8px',
                width: '100px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={async (e) => {
                e.stopPropagation()
                message.loading('重新评估中...', 0)
                try {
                  const assessment = await aiPatientScreeningService.assessMDTNecessity(record.id)
                  const updated = patientsWithAI.map(p => 
                    p.id === record.id ? { ...p, aiAssessment: assessment } : p
                  )
                  setPatientsWithAI(updated)
                  message.success('重新评估完成')
                } catch (error) {
                  message.error('重新评估失败')
                } finally {
                  message.destroy()
                }
              }}
            >
              重新评估
            </Button>
          </div>
        )
      }
    },
  ]

  
  // 筛选患者数据
  const filteredPatients = patientsWithAI.filter(p => {
    if (searchText) {
      const lower = searchText.toLowerCase()
      if (!p.name.toLowerCase().includes(lower) &&
          !p.inpatientNo.toLowerCase().includes(lower) &&
          !p.mainDiagnosis.toLowerCase().includes(lower)) {
        return false
      }
    }
    if (departmentFilter && p.department !== departmentFilter) return false
    if (aiFilter && p.aiAssessment?.recommendationLevel !== aiFilter) return false
    return true
  })

  const handlePatientSelect = (patient: Patient) => {
    // 防止重复点击
    if (selectedPatient?.id === patient.id) {
      return
    }
    
    setSelectedPatient(patient)
    setCurrentStep(1)
    
    // 自动填充病情摘要
    setTimeout(() => {
      form.setFieldsValue({
        summary: `患者${patient.name}，${patient.gender}，${patient.age}岁。主要诊断：${patient.mainDiagnosis}。`
      })
    }, 300)
    
    // 自动同步 HIS 数据
    setTimeout(() => {
      handleHISDataSync(patient)
    }, 600)
    
    message.success(`已选择患者：${patient.name}，系统将自动填充病情摘要并同步 HIS 数据`)
  }

  const handleExpertSelect = (expert: Expert) => {
    if (!selectedExperts.find(e => e.id === expert.id)) {
      setSelectedExperts([...selectedExperts, expert])
    }
  }

  const handleRemoveExpert = (expertId: string) => {
    setSelectedExperts(selectedExperts.filter(e => e.id !== expertId))
  }

  // AI 智能辅助填写
  const handleAIAssist = async () => {
    if (!selectedPatient) {
      message.warning('请先选择患者')
      return
    }

    setAiLoading(true)
    try {
      // 调用 AI 服务获取智能建议
      const suggestion = await intelligentConsultationService.getIntelligentApplication(selectedPatient.id)
      setAiSuggestion(suggestion)
      setShowAiPanel(true)
      
      // 自动填充表单
      if (suggestion.summary) {
        form.setFieldsValue({
          summary: suggestion.summary,
          type: suggestion.recommendedType || CONSULTATION_TYPE.INHOSPITAL,
          urgency: URGENCY_LEVEL.URGENT
        })
      }

      message.success('AI 智能分析完成！已自动填充部分信息')
    } catch (error) {
      console.error('AI 辅助失败:', error)
      message.error('AI 分析失败，请稍后重试')
    } finally {
      setAiLoading(false)
    }
  }

  // 应用 AI 推荐的专家
  const handleApplyAIExperts = () => {
    if (!aiSuggestion) return
    
    const recommendedExpertIds = aiSuggestion.recommendedExperts.map(e => e.id)
    const expertsToAdd = expertsData.filter(e => recommendedExpertIds.includes(e.id))
    
    setSelectedExperts([...selectedExperts, ...expertsToAdd])
    message.success(`已添加 ${expertsToAdd.length} 位推荐专家`)
    setShowAiPanel(false)
  }

  // 计算专家与患者的匹配度
  const calculateMatchScore = (patient: Patient, expert: Expert): number => {
    const diagnosis = patient.mainDiagnosis.toLowerCase()
    const specialty = expert.specialty.toLowerCase()
    
    // 基础匹配分
    let score = 50
    
    // 关键词匹配
    const keywords = diagnosis.split(/[,\s]+/).filter(k => k.length > 1)
    keywords.forEach(keyword => {
      if (specialty.includes(keyword)) {
        score += 10
      }
    })
    
    // 科室匹配
    if (expert.department.includes('肿瘤') && diagnosis.includes('癌')) {
      score += 15
    }
    if (expert.department.includes('胸外') && (diagnosis.includes('肺') || diagnosis.includes('食管'))) {
      score += 15
    }
    if (expert.department.includes('消化') && diagnosis.includes('胃') || diagnosis.includes('肠')) {
      score += 15
    }
    
    // 职称加成
    if (expert.title === '主任医师') {
      score += 5
    } else if (expert.title === '副主任医师') {
      score += 3
    }
    
    // 限制最高 95 分
    return Math.min(95, Math.max(30, score))
  }

  // 智能匹配专家
  const handleSmartMatchExperts = async () => {
    if (!selectedPatient) {
      message.warning('请先选择患者')
      return
    }
    
    setMatchLoading(true)
    setMatchDrawerVisible(true)
    
    try {
      const result = await intelligentConsultationService.recommendExperts({
        diagnosis: selectedPatient.mainDiagnosis,
        condition: selectedPatient.mainDiagnosis,
        urgency: form.getFieldValue('urgency') || '常规',
        preferredDepartments: form.getFieldValue('departments') || []
      })
      
      setMatchedExperts(result)
    } catch (error) {
      message.error('智能匹配失败，请重试')
      setMatchDrawerVisible(false)
    } finally {
      setMatchLoading(false)
    }
  }

  // 从匹配结果中选择专家
  const handleSelectMatchedExpert = (expert: ExpertMatch) => {
    const fullExpert = expertsData.find(e => e.id === expert.expertId)
    if (fullExpert && !selectedExperts.find(e => e.id === fullExpert.id)) {
      setSelectedExperts([...selectedExperts, fullExpert])
      message.success(`已添加专家：${expert.name}`)
    } else if (selectedExperts.find(e => e.id === expert.expertId)) {
      message.info('该专家已在邀请列表中')
    }
  }

  // HIS 数据同步
  const handleHISDataSync = async (patient?: Patient) => {
    // 如果已经在同步中，直接返回，防止重复调用
    if (hisSyncLoading) {
      return
    }
    
    const targetPatient = patient || selectedPatient
    if (!targetPatient) {
      message.warning('请先选择患者')
      return
    }

    setHisSyncLoading(true)
    try {
      // 模拟 HIS 系统数据同步
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // 从患者数据中提取病历资料（优先使用数据库中的真实数据）
      const syncedRecords = {
        chiefComplaint: targetPatient.chiefComplaint || targetPatient.mainDiagnosis,
        presentIllness: targetPatient.presentIllness || `患者因"${targetPatient.mainDiagnosis}"入院，详细病史...`,
        pastHistory: targetPatient.pastHistory || targetPatient.history?.join('；') || '无特殊既往史',
        physicalExamination: targetPatient.physicalExamination || '',
        auxiliaryExamination: targetPatient.auxiliaryExamination || `影像学检查：${targetPatient.imagingExams?.length || 0}项；实验室检查：${targetPatient.labTests?.length || 0}项`,
        initialDiagnosis: targetPatient.initialDiagnosis || targetPatient.mainDiagnosis,
        treatmentPlan: targetPatient.treatmentPlan || '',
        hisSyncTime: new Date().toISOString()
      }
      
      setMedicalRecords(syncedRecords)
      setHisDataSynced(true)
      
      // 模拟从 HIS 获取文件
      const hisFiles: UploadedFile[] = [
        {
          id: 'HIS001',
          fileName: '入院记录.pdf',
          fileType: '病历',
          fileSize: 524288,
          uploadTime: new Date().toISOString(),
          uploadUrl: '/his/records/001.pdf',
          fromHIS: true
        },
        {
          id: 'HIS002',
          fileName: 'CT 检查报告.pdf',
          fileType: '检查报告',
          fileSize: 1048576,
          uploadTime: new Date().toISOString(),
          uploadUrl: '/his/reports/ct001.pdf',
          fromHIS: true
        }
      ]
      
      setUploadedFiles(hisFiles)
      message.success('HIS 数据同步成功！已获取病历资料和检查报告')
    } catch (error) {
      console.error('HIS 同步失败:', error)
      message.error('HIS 数据同步失败，请重试')
    } finally {
      setHisSyncLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (submitting) return
    setSubmitting(true)
    const values = form.getFieldsValue()
    console.log('表单 values:', values)
    console.log('直接获取 urgency:', form.getFieldValue('urgency'))
    console.log('直接获取 type:', form.getFieldValue('type'))
    if (!selectedPatient) {
      message.error('请选择患者')
      setSubmitting(false)
      return
    }
    if (selectedExperts.length === 0) {
      message.error('请至少选择一位会诊专家')
      setSubmitting(false)
      return
    }
    if (uploadedFiles.length === 0 && !hisDataSynced) {
      Modal.confirm({
        title: '未上传材料',
        content: '您还没有上传任何病历资料，确定要提交申请吗？',
        onOk: () => submitApplication(values)
      })
      setSubmitting(false)
      return
    }
    await submitApplication(values)
  }

  const submitApplication = async (values: any) => {
    try {
      console.log('submitApplication 接收到的 values:', values)
      
      // 直接从 form 获取值，不依赖 values 参数
      const urgency = form.getFieldValue('urgency') || URGENCY_LEVEL.NORMAL
      const type = form.getFieldValue('type') || 'inhospital'
      const expectTime = form.getFieldValue('expectTime')
      console.log('直接获取 - urgency:', urgency, 'type:', type)
      
      // 根据用户职位确定初始状态和审核流程
      const isDirector = user?.position?.includes('主任') || user?.role === ROLE.DIRECTOR
      // isSecretary 已在组件顶层定义
      
      // 主任提交：状态直接设为待秘书审核，自动完成主任审批留痕
      // 秘书提交：状态设为待专家确认，选的专家就是拟选专家
      // 普通医生提交：状态设为待主任审核，需要主任审批流程
      let initialStatus: string = CONSULTATION_STATUS.DIRECTOR_PENDING
      let submitNodeName = '申请提交'
      let autoDirectorApprove = false // 是否自动完成主任审批留痕
      
      if (isDirector) {
        initialStatus = CONSULTATION_STATUS.SECRETARY_PENDING // 主任提交直接到秘书审核
        submitNodeName = '主任提交'
        autoDirectorApprove = true // 主任提交时自动留痕主任审批记录
      } else if (isSecretary) {
        initialStatus = CONSULTATION_STATUS.EXPERT_PENDING // 秘书提交直接到待专家确认
        submitNodeName = '秘书提交'
      } else {
        initialStatus = CONSULTATION_STATUS.DIRECTOR_PENDING
        submitNodeName = '申请提交'
      }
      
      const consultationId = searchParams.get('id') // 检查是否是编辑驳回的申请
      const location = form.getFieldValue('location')
      
      if (consultationId) {
        // 更新驳回的申请
        const updateData = {
          status: initialStatus,
          urgency: urgency,
          type: type,
          expect_time: expectTime ? expectTime.toISOString() : null, // 期望时间（秘书提交时也填写）
          meeting_time: isSecretary ? (expectTime ? expectTime.toISOString() : null) : null, // 秘书提交时填写会诊时间
          location: location || null,
          reject_reason: null,
          updated_at: new Date().toISOString(),
        }
        console.log('更新数据:', updateData)
        
        const { error } = await supabase
          .from('consultations')
          .update(updateData)
          .eq('id', consultationId)
        
        if (error) throw error
        
        // 插入审核历史记录（重新提交）
        const auditInsert: {
          consultation_id: string
          operator?: string
          operator_id?: string
          operator_role: string
          node: string
          result: string
          time: string
        } = {
          consultation_id: consultationId,
          operator: user?.name,
          operator_role: user?.role || '申请医生',
          node: '重新提交',
          result: '已提交',
          time: new Date().toISOString(),
        }
        
        // 如果用户有 ID 且是 UUID 格式，才添加 operator_id
        if (user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
          auditInsert.operator_id = user.id
        }
        
        await supabase
          .from('audit_history')
          .insert(auditInsert)
        
        message.success('会诊申请已重新提交！')
        Modal.confirm({
          title: '申请已重新提交',
          content: '是否前往查看我的申请列表？',
          onOk: () => navigate('/consultation/my-applies'),
          onCancel: () => navigate('/consultation/my-applies'),
        })
      } else {
        // 生成会诊编码
        const consultationCode = generateConsultationCode()
        
        // 从表单获取病情摘要
        const summary = form.getFieldValue('summary') || ''
        
        // 获取申请医生的科室名称
        let doctorDepartment = user?.department || ''
        if (user?.org_id && !doctorDepartment) {
          const { data: orgData } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', user.org_id)
            .single()
          if (orgData) {
            doctorDepartment = orgData.name || ''
          }
        }
        
        // 获取会诊地点
        const location = form.getFieldValue('location')
        
        const insertData = {
          patient_id: selectedPatient?.id,
          patient_name: selectedPatient?.name,
          patient_inpatient_no: selectedPatient?.inpatientNo,
          type: type, // 使用直接从 form 获取的值
          status: initialStatus, // 使用根据角色计算的初始状态
          urgency: urgency, // 使用直接从 form 获取的值
          department: doctorDepartment, // 使用申请医生的科室
          apply_doctor: user?.name,
          apply_doctor_id: user?.id,  // 添加申请医生 ID
          main_diagnosis: selectedPatient?.mainDiagnosis,
          apply_time: new Date().toISOString(),
          expect_time: isSecretary ? null : (expectTime ? expectTime.toISOString() : null), // 期望时间（仅医生/主任提交时填写）
          meeting_time: isSecretary ? (expectTime ? expectTime.toISOString() : null) : null, // 会诊时间（仅秘书提交时填写）
          location: location || null, // 会诊地点（仅秘书提交时填写）
          source: isSecretary ? 'secretary' : 'doctor', // 秘书提交时设置 source 为 secretary
          consultation_code: consultationCode,
          summary: summary, // 病情摘要
          medical_records: medicalRecords, // 病历资料
          uploaded_files: uploadedFiles, // 上传的文件列表
          director_id: null as string | null,  // 先设为 null，后面会根据医生关联的主任自动填充
          secretary_id: null as string | null,  // 先设为 null，后面会设置秘书负责人
        }
        console.log('插入数据:', insertData)
        
        // 查询申请医生的上级主任（支持多个）
        let directorId: string | null = null
        const directorIds: string[] = []
        
        if (user?.id) {
          // 1. 先从 user_managers 表查询所有上级主任
          const { data: managersData } = await supabase
            .from('user_managers')
            .select('manager_id, is_primary')
            .eq('user_id', user.id)
          
          if (managersData && managersData.length > 0) {
            // 找到主要责任人
            const primaryManager = managersData.find(m => m.is_primary)
            if (primaryManager) {
              directorId = primaryManager.manager_id
              if (directorId) {
                directorIds.push(directorId)
                console.log('找到主要责任主任:', directorId)
              }
            }
            
            // 添加其他主任
            managersData.forEach(m => {
              if (m.manager_id !== directorId) {
                directorIds.push(m.manager_id)
              }
            })
          }
          
          // 2. 如果没有找到上级，尝试使用 manager_id 字段
          if (!directorId) {
            const { data: doctorData } = await supabase
              .from('users')
              .select('manager_id')
              .eq('id', user.id)
              .single()
            
            if (doctorData?.manager_id) {
              directorId = doctorData.manager_id
              if (directorId) {
                directorIds.push(directorId)
                console.log('找到直属主任:', directorId)
              }
            }
          }
          
          // 3. 如果还是没有，尝试根据科室查找所有主任
          if (directorIds.length === 0) {
            const { data: directorsData } = await supabase
              .from('users')
              .select('id')
              .eq('org_id', selectedPatient?.department ? `org-${selectedPatient.department.toLowerCase()}` : null)
              .in('position', ['主任医师', '副主任医师'])
            
            if (directorsData && directorsData.length > 0) {
              directorIds.push(...directorsData.map(d => d.id))
              directorId = directorsData[0].id  // 默认使用第一个主任
              console.log('根据科室找到主任:', directorIds)
            }
          }
        }
        
        // 设置主审核主任 ID
        if (directorId) {
          insertData.director_id = directorId
        }
        
        // 查询 MDT 秘书，设置秘书负责人
        const { data: secretariesData } = await supabase
          .from('users')
          .select('id, manager_id')
          .eq('position', POSITION.MDT_SECRETARY)
          .eq('status', 'active')
          .returns<{ id: string; manager_id: string | null }[]>()
        
        if (secretariesData && secretariesData.length > 0) {
          // 找到秘书组长（主要责任人）
          const chiefSecretary = secretariesData.find(s => s.id === secretariesData[0].manager_id) || secretariesData[0]
          insertData.secretary_id = chiefSecretary.id
          console.log('设置秘书负责人:', chiefSecretary.id)
        }
        
        // 插入会诊申请到数据库（不指定 id，让数据库自动生成 UUID）
        const { data, error } = await supabase
          .from('consultations')
          .insert(insertData)
          .select() // 返回插入的数据以获取生成的 ID
        
        if (error) throw error
        
        const consultationId = data[0].id
        
        // 构建审核历史记录数组
        const auditInserts: any[] = []
        
        // 第一条：提交记录
        const submitAudit: any = {
          consultation_id: consultationId,
          operator: user?.name,
          operator_role: isDirector ? ROLE.DIRECTOR : (isSecretary ? ROLE.SECRETARY : (user?.role || '申请医生')),
          node: submitNodeName,
          result: '已提交',
          time: new Date().toISOString(),
        }
        
        // 如果用户有 ID 且是 UUID 格式，才添加 operator_id
        if (user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
          submitAudit.operator_id = user.id
        }
        
        auditInserts.push(submitAudit)
        
        // 如果是主任提交，自动添加主任审批记录（留痕）
        if (autoDirectorApprove) {
          const directorApproveAudit: any = {
            consultation_id: consultationId,
            operator: user?.name,
            operator_role: ROLE.DIRECTOR,
            node: '主任审批',
            operator_type: 'approved',
            result: '通过',
            opinion: '同意',
            time: new Date().toISOString(),
            next_node: '秘书审核'
          }
          
          if (user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
            directorApproveAudit.operator_id = user.id
          }
          
          auditInserts.push(directorApproveAudit)
        }
        
        // 如果是秘书提交，添加秘书审核记录（直接通过并指派专家）
        if (isSecretary) {
          const secretaryAudit: any = {
            consultation_id: consultationId,
            operator: user?.name,
            operator_role: ROLE.SECRETARY,
            node: '秘书审核',
            operator_type: '通过',
            result: '通过',
            opinion: '已指派专家，待专家确认',
            time: new Date().toISOString(),
            next_node: '待专家确认'
          }
          
          if (user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
            secretaryAudit.operator_id = user.id
          }
          
          auditInserts.push(secretaryAudit)
        }
        
        // 批量插入审核历史记录
        await supabase
          .from('audit_history')
          .insert(auditInserts)
        
        // 如果有选择专家，插入会诊专家记录
        if (selectedExperts && selectedExperts.length > 0) {
          const expertInserts = selectedExperts.map(expert => ({
            consultation_id: consultationId,
            expert_id: expert.id,
            status: 'pending_meeting', // 待专家确认
            invited_by: isSecretary ? 'secretary' : 'doctor', // 秘书指派或医生邀请
          }))
          
          const { error: expertError } = await supabase
            .from('consultation_experts')
            .insert(expertInserts)
          
          if (expertError) {
            console.error('插入专家邀请失败:', expertError)
            console.log('专家邀请表可能缺少字段，需要完善表结构')
            // 专家插入失败不影响主流程，会诊申请已成功
          }
        }
        
        // 发送通知给相关人
        try {
          // 1. 发送通知给 MDT 秘书（支持多个秘书）
          const { data: secretaries } = await supabase
            .from('users')
            .select('id, position, manager_id')
            .eq('position', POSITION.MDT_SECRETARY)
            .eq('status', 'active')
            .returns<{ id: string; position: string; manager_id: string | null }[]>()
          
          if (secretaries && secretaries.length > 0) {
            // 找到秘书组长（主要责任人）
            const chiefSecretary = secretaries.find(s => s.id === secretaries[0].manager_id) || secretaries[0]
            
            for (const secretary of secretaries) {
              const isChief = secretary.id === chiefSecretary.id
              await sendSystemNotification(
                secretary.id,
                'info',
                isChief ? '待审核会诊申请' : '会诊申请（抄送）',
                `${user?.name || '医生'}提交了会诊申请，患者：${selectedPatient?.name}，${isChief ? '请您及时安排审核' : '请知悉'}`,
                {
                  label: '审核',
                  url: `/consultation/pending-review`,
                }
              )
            }
          }
          
          // 2. 发送通知给所有相关主任（主要责任人 + 其他主任）
          if (directorIds.length > 0) {
            for (const dirId of directorIds) {
              const isPrimary = dirId === directorId
              await sendSystemNotification(
                dirId,
                'info',
                isPrimary ? '待审核会诊申请' : '会诊申请（抄送）',
                `${user?.name || '医生'}提交了会诊申请，患者：${selectedPatient?.name}，${isPrimary ? '请您及时审核' : '请知悉'}`,
                {
                  label: '审核',
                  url: `/consultation/director-confirm`,
                }
              )
            }
          }

          // 3. 查询所有主任医生角色的用户（通过 user_roles 表关联）
          const { data: roleData } = await supabase.from('roles').select('id').eq('code', 'DIRECTOR').single()
          console.log('主任角色 ID:', roleData)
          
          const { data: directorUsers, error: directorUsersError } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role_id', roleData?.id)

          console.log('主任用户列表:', { directorUsers, error: directorUsersError })

          if (directorUsers && directorUsers.length > 0) {
            // 给每个主任发送通知
            for (const directorUser of directorUsers) {
              console.log('发送通知给主任:', directorUser.user_id)
              await sendSystemNotification(
                directorUser.user_id,
                'info',
                '新会诊申请',
                `${user?.name || '医生'}提交了新的会诊申请，患者：${selectedPatient?.name}`,
                {
                  label: '确认',
                  url: `/consultation/director-confirm`,
                }
              )
            }
          }
        } catch (notificationError) {
          console.error('发送通知失败:', notificationError)
        }
        
        message.success('会诊申请提交成功！')
        setSubmitting(false)
        Modal.confirm({
          title: '申请已提交',
          content: '是否前往查看我的申请列表？',
          onOk: () => navigate('/consultation/my-applies'),
          onCancel: () => navigate('/consultation/my-applies'),
        })
      }
    } catch (err) {
      console.error('提交失败:', err)
      console.error('错误详情:', err)
      
      // 提取更详细的错误信息
      let errorMessage = '提交失败，请重试'
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'object' && err !== null) {
        const error = err as any
        if (error.message) {
          errorMessage = error.message
        }
        if (error.details) {
          console.error('错误详情:', error.details)
          errorMessage += ' - ' + error.details
        }
        if (error.hint) {
          console.error('错误提示:', error.hint)
        }
      }
      
      message.error(errorMessage)
      setSubmitting(false)
    }
  }

  // 权限检查
  if (!hasPermission('perm-consultation-apply')) {
    return (
      <Result
        status="403"
        title="暂无权限"
        subTitle="抱歉，您没有权限访问会诊申请页面。如需获取权限，请联系系统管理员。"
        extra={<Button type="primary" onClick={() => navigate(-1)}>返回</Button>}
      />
    )
  }

  return (
    <div className="space-y-4">
      <Title level={4}>申请会诊</Title>

      {/* MDT 来源提示 */}
      {searchParams.get('mdtType') === 'screening' && location.state?.screeningData && (
        <Alert
          type="success"
          message="AI 筛查推荐 MDT"
          description={
            <div>
              <p className="mb-2">
                <strong>来源：</strong>AI 患者 MDT 需求筛查
                <Tag color={location.state.screeningData.level === 'urgent' ? 'red' : 'orange'} className="ml-2">
                  {location.state.screeningData.level === 'urgent' ? '紧急' : '推荐'}
                </Tag>
              </p>
              <p className="mb-1">
                <strong>患者：</strong>{location.state.screeningData.patientName}
              </p>
              <p>
                <strong>AI 建议：</strong>
                <ul className="list-disc list-inside mt-1">
                  {location.state.screeningData.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </p>
            </div>
          }
          showIcon
          className="mb-4"
        />
      )}

      {/* 二次 MDT 提示 */}
      {searchParams.get('mdtType') === 'secondary' && location.state?.followupData && (
        <Alert
          type="warning"
          message="二次 MDT 会诊申请"
          description={
            <div>
              <p className="mb-2">
                <strong>来源：</strong>随访 AI 分析预警
                <Tag color="red" className="ml-2">紧急</Tag>
              </p>
              <p className="mb-1">
                <strong>AI 分析原因：</strong>{location.state.followupData.mdtReason}
              </p>
              <p>
                <strong>紧急程度：</strong>
                <Tag color={
                  location.state.followupData.urgency === 'emergency' ? 'red' :
                  location.state.followupData.urgency === 'urgent' ? 'orange' : 'blue'
                }>
                  {location.state.followupData.urgency === 'emergency' ? '紧急' :
                   location.state.followupData.urgency === 'urgent' ? '较急' : '常规'}
                </Tag>
              </p>
            </div>
          }
          showIcon
          className="mb-4"
        />
      )}

      <div className="mb-4">
        <Card className="mb-2" bodyStyle={{ padding: '12px 24px' }}>
          {isSecretary ? (
            // 秘书快速申请模式
            <Steps
              current={currentStep}
              size="small"
              items={[
                { title: '选择患者', icon: <UserOutlined /> },
                { title: '填写信息', icon: <FileProtectOutlined /> },
                { title: '确认提交', icon: <CheckCircleOutlined /> },
              ]}
            />
          ) : (
            // 医生/主任标准申请模式
            <Steps
              current={currentStep}
              size="small"
              items={[
                { title: '选择患者', icon: <UserOutlined /> },
                { title: '填写信息', icon: <FileProtectOutlined /> },
                { title: '选择专家', icon: <TeamOutlined /> },
                { title: '确认提交', icon: <CheckCircleOutlined /> },
              ]}
            />
          )}
        </Card>
        {currentStep === 0 && (
          <Alert
            message="温馨提示：点击患者姓名可直接选择，点击 360 按钮可查看详细病历，AI 预判帮助快速识别需 MDT 会诊的患者。"
            type="info"
            showIcon
            style={{ fontSize: '12px' }}
          />
        )}
      </div>

      {currentStep === 0 && (
        <Card title="选择患者">
          <div className="mb-4 space-y-4">
            <div className="flex justify-between items-center">
              <Space wrap size="middle">
                <Input.Search
                  placeholder="搜索姓名/住院号/诊断"
                  allowClear
                  style={{ width: 250 }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <Select
                  placeholder={user?.department ? `默认：${user.department}` : '筛选科室'}
                  allowClear
                  style={{ width: 180 }}
                  value={departmentFilter || undefined}
                  onChange={(v) => setDepartmentFilter(v || '')}
                  options={allDepartments.map(d => ({ value: d, label: d }))}
                />
                <Select
                  placeholder="AI 预判"
                  allowClear
                  style={{ width: 150 }}
                  value={aiFilter || undefined}
                  onChange={(v) => setAiFilter(v || '')}
                  options={[
                    { value: '强烈推荐', label: '🔴 强烈推荐' },
                    { value: '推荐', label: '🟠 推荐' },
                    { value: '可考虑', label: '🔵 可考虑' },
                  ]}
                />
              </Space>
              <Button 
                type="primary" 
                icon={<ThunderboltOutlined />} 
                onClick={() => {
                  navigate('/followup/list')
                }}
              >
                从随访列表选择
              </Button>
            </div>
          </div>
          
          <Table
            rowKey="id"
            columns={patientColumns}
            dataSource={filteredPatients}
            loading={patientsLoading}
            onRow={(record) => ({
              onClick: (e) => {
                e.stopPropagation()
                handlePatientSelect(record)
              }
            })}
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        </Card>
      )}

      {currentStep === 1 && selectedPatient && (
        <div className="space-y-4">
          <Card title="患者信息">
            <PatientInfo
              patientId={selectedPatient.id}
              patientName={selectedPatient.name}
              patientInpatientNo={selectedPatient.inpatientNo}
              compact={true}
              patientData={selectedPatient}
            />
          </Card>

            <Card title="会诊信息">
              <Form form={form} layout="vertical">
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="会诊类型" name="type" initialValue={CONSULTATION_TYPE.INHOSPITAL}>
                      <Select options={[
                        { value: CONSULTATION_TYPE.INHOSPITAL, label: '院内会诊' }, 
                        { value: CONSULTATION_TYPE.REMOTE, label: '远程会诊' }
                      ]} />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="紧急程度" name="urgency" initialValue={URGENCY_LEVEL.NORMAL}>
                      <Select options={[
                        { value: URGENCY_LEVEL.NORMAL, label: '普通' },
                        { value: URGENCY_LEVEL.URGENT, label: '紧急' },
                        { value: URGENCY_LEVEL.CRITICAL, label: '特急' },
                      ]} />
                    </Form.Item>
                  </Col>
                  {isSecretary && (
                    <Col span={8}>
                      <Form.Item label="会诊地点" name="location">
                        <Select 
                          placeholder="请选择会诊地点"
                          allowClear
                          showSearch
                          options={meetingRooms.map(room => ({
                            value: room.name,
                            label: room.name,
                          }))}
                          filterOption={(input, option) =>
                            (option?.label as string)?.toLowerCase().includes(input.toLowerCase())
                          }
                        />
                      </Form.Item>
                    </Col>
                  )}
                  <Col span={24}>
                    <Form.Item 
                      label={isSecretary ? "会诊时间" : "期望会诊时间"} 
                      name="expectTime"
                      rules={[
                        { 
                          required: isSecretary, 
                          message: isSecretary ? '请选择会诊时间' : '请选择期望会诊时间',
                          type: 'object',
                          transform: (value) => {
                            if (!value) return value;
                            return dayjs.isDayjs(value) ? value : dayjs(value);
                          }
                        }
                      ]}
                    >
                      <DatePicker showTime className="!w-full" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item 
                      label={
                        <Space>
                          <span>病情摘要</span>
                          {aiSuggestion && (
                            <Tag color="green" icon={<CheckCircleFilled />}>AI 已生成</Tag>
                          )}
                        </Space>
                      } 
                      name="summary"
                    >
                      <TextArea rows={4} placeholder="请详细描述患者病情、会诊目的及需要讨论的问题..." />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>

            <Card 
              title={
                <Space>
                  <span>病历资料</span>
                  {hisDataSynced && (
                    <Space>
                      <Tag color="green" icon={<CheckCircleOutlined />}>
                        HIS 已同步 {new Date(medicalRecords.hisSyncTime).toLocaleString()}
                      </Tag>
                      <Button
                        type="primary"
                        icon={<SyncOutlined spin={hisSyncLoading} />}
                        onClick={() => handleHISDataSync()}
                        loading={hisSyncLoading}
                        size="small"
                      >
                        重新同步
                      </Button>
                    </Space>
                  )}
                </Space>
              }
            >
              <MaterialUpload
                patient={selectedPatient}
                uploadedFiles={uploadedFiles}
                medicalRecords={medicalRecords}
                onFilesChange={setUploadedFiles}
                onMedicalRecordsChange={setMedicalRecords}
                hisDataSynced={hisDataSynced}
                onHISDataSync={handleHISDataSync}
              />
            </Card>

            {/* 秘书快速申请模式：在步骤 1 就选择专家 */}
            {isSecretary && (
              <Card title="邀请会诊专家（快速申请）">
                <Alert
                  type="info"
                  message="秘书快速申请"
                  description="请选择拟邀请的专家，提交后专家将直接进入待确认状态。"
                  showIcon
                  className="mb-4"
                />
                
                <div className="mb-4 flex justify-between items-center">
                  <div className="flex gap-4">
                    <Input.Search placeholder="按科室/职称筛选专家" allowClear style={{ width: 250 }} />
                    <Select placeholder="按科室" allowClear style={{ width: 150 }}>
                      {Array.from(new Set(expertsData.map(e => e.department))).map(d => (
                        <Select.Option key={d} value={d}>{d}</Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
                
                <Table
                  rowKey="id"
                  dataSource={expertsData}
                  pagination={{
                    pageSize: 5,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `共 ${total} 位专家`,
                  }}
                  scroll={{ y: 400 }}
                  columns={[
                    {
                      title: '专家',
                      key: 'expert',
                      width: 300,
                      render: (_, expert) => (
                        <Space>
                          <Avatar className="!bg-medical-blue" size={48}>{expert.name[0]}</Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <Text strong className="text-base">{expert.name}</Text>
                              {expert.rating && expert.rating >= 4.8 && (
                                <StarFilled className="text-yellow-400 text-sm" />
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {expert.department} · {expert.title}
                            </div>
                          </div>
                        </Space>
                      ),
                    },
                    {
                      title: '专长',
                      dataIndex: 'specialty',
                      key: 'specialty',
                      ellipsis: true,
                      width: 250,
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 100,
                      render: (_, expert) => (
                        <Button
                          type={selectedExperts.find(e => e.id === expert.id) ? 'primary' : 'default'}
                          size="small"
                          onClick={() => {
                            if (selectedExperts.find(e => e.id === expert.id)) {
                              setSelectedExperts(selectedExperts.filter(e => e.id !== expert.id))
                            } else {
                              setSelectedExperts([...selectedExperts, expert])
                            }
                          }}
                        >
                          {selectedExperts.find(e => e.id === expert.id) ? '已选' : '选择'}
                        </Button>
                      ),
                    },
                  ]}
                />
                
                {selectedExperts.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <Text strong>已选专家 ({selectedExperts.length}位)：</Text>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedExperts.map(expert => (
                        <Tag key={expert.id} color="blue" closable onClose={() => {
                          setSelectedExperts(selectedExperts.filter(e => e.id !== expert.id))
                        }}>
                          {expert.name} - {expert.department}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            <div className="flex justify-between">
              <Button onClick={() => setCurrentStep(0)}>上一步</Button>
              {isSecretary ? (
                <Button type="primary" onClick={() => setCurrentStep(2)}>下一步：确认提交</Button>
              ) : (
                <Button type="primary" onClick={() => setCurrentStep(2)}>下一步：选择专家</Button>
              )}
            </div>
          </div>
        )}

      {/* 步骤 2：秘书模式显示确认提交，医生/主任模式显示选择专家 */}
      {currentStep === 2 && selectedPatient && (
        <>
          {isSecretary ? (
            // 秘书快速申请：步骤 2 直接确认提交
            <Card 
              title={
                <Space>
                  <CheckCircleOutlined className="text-green-500" />
                  <span>确认提交</span>
                </Space>
              }
            >
              <div className="space-y-4">
                {/* 患者信息 */}
                <Card 
                  type="inner" 
                  title={
                    <Space>
                      <UserOutlined />
                      <span>患者信息</span>
                    </Space>
                  }
                  size="small"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Text type="secondary" className="text-xs">姓名：</Text>
                      <Text strong>{selectedPatient?.name}</Text>
                    </div>
                    <div>
                      <Text type="secondary" className="text-xs">住院号：</Text>
                      <Text strong>{selectedPatient?.inpatientNo}</Text>
                    </div>
                    <div>
                      <Text type="secondary" className="text-xs">科室：</Text>
                      <Text>{selectedPatient?.department}</Text>
                    </div>
                    <div>
                      <Text type="secondary" className="text-xs">诊断：</Text>
                      <Text ellipsis>{selectedPatient?.mainDiagnosis}</Text>
                    </div>
                  </div>
                </Card>

                {/* 会诊信息 */}
                <Card 
                  type="inner" 
                  title={
                    <Space>
                      <FileTextOutlined />
                      <span>会诊信息</span>
                    </Space>
                  }
                  size="small"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Text type="secondary" className="text-xs">会诊类型：</Text>
                      <Tag>{getConsultationTypeName(form.getFieldValue('type') || 'inhospital')}</Tag>
                    </div>
                    <div>
                      <Text type="secondary" className="text-xs">紧急程度：</Text>
                      <Tag color={getUrgencyColor(form.getFieldValue('urgency') || 'normal')}>
                        {getUrgencyName(form.getFieldValue('urgency') || 'normal')}
                      </Tag>
                    </div>
                    <div className="col-span-2">
                      <Text type="secondary" className="text-xs">期望会诊时间：</Text>
                      <Text strong>
                        {form.getFieldValue('expectTime') ? 
                          form.getFieldValue('expectTime').format('YYYY-MM-DD HH:mm') : 
                          <Text type="warning">未设置</Text>
                        }
                      </Text>
                    </div>
                    <div className="col-span-2">
                      <Text type="secondary" className="text-xs">病情摘要：</Text>
                      <div className="mt-1 p-3 bg-gray-50 rounded border border-gray-200">
                        <Text className="text-sm">{form.getFieldValue('summary') || '无'}</Text>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* 已选专家 */}
                {selectedExperts.length > 0 && (
                  <Card 
                    type="inner" 
                    title={
                      <Space>
                        <TeamOutlined />
                        <span>拟邀专家（{selectedExperts.length}位）</span>
                      </Space>
                    }
                    size="small"
                  >
                    <div className="flex flex-wrap gap-2">
                      {selectedExperts.map(expert => (
                        <Tag key={expert.id} color="blue" className="text-sm">
                          {expert.name} - {expert.department} - {expert.title}
                        </Tag>
                      ))}
                    </div>
                  </Card>
                )}

                {/* 病历资料 */}
                <Card 
                  type="inner" 
                  title={
                    <Space>
                      <FileProtectOutlined />
                      <span>病历资料</span>
                    </Space>
                  }
                  size="small"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Text type="secondary" className="text-xs">上传文件：</Text>
                      <Text>{uploadedFiles.length} 个</Text>
                    </div>
                    <div>
                      <Text type="secondary" className="text-xs">HIS 同步：</Text>
                      {hisDataSynced ? (
                        <Tag color="green">已同步</Tag>
                      ) : (
                        <Tag>未同步</Tag>
                      )}
                    </div>
                  </div>
                </Card>

                <div className="flex justify-between mt-4">
                  <Button onClick={() => setCurrentStep(1)}>上一步</Button>
                  <Button 
                    type="primary" 
                    onClick={handleSubmit}
                    loading={submitting}
                    disabled={selectedExperts.length === 0}
                  >
                    确认提交
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            // 医生/主任标准申请：步骤 2 选择专家
            <Card title="邀请会诊专家">
          <div className="mb-4 flex justify-between items-center">
            <div className="flex gap-4">
              <Input.Search placeholder="按科室/职称筛选专家" allowClear style={{ width: 250 }} />
              <Select placeholder="按科室" allowClear style={{ width: 150 }}>
                {Array.from(new Set(expertsData.map(e => e.department))).map(d => (
                  <Select.Option key={d} value={d}>{d}</Select.Option>
                ))}
              </Select>
            </div>
          </div>
          
          <Alert
            type="info"
            message="专家推荐说明"
            description="基于患者病情、专家专长、历史案例、可用时间等多维度进行智能匹配，推荐最合适的专家组合。匹配度越高表示专家越适合该病例。"
            showIcon
            className="mb-4"
            closable
          />
          
          <Row gutter={[16, 16]}>
            <Col span={16}>
              <div className="flex items-center justify-between mb-2">
                <Title level={5} className="mb-0">可选专家</Title>
                <div className="flex gap-2">
                  <Text type="secondary" className="text-sm">共 {expertsData.length} 位专家</Text>
                  <Button
                    type="primary"
                    size="small"
                    icon={<ThunderboltOutlined />}
                    onClick={() => {
                      message.success('已重新计算匹配度')
                      // 强制刷新匹配度
                      window.dispatchEvent(new Event('storage'))
                    }}
                  >
                    重新匹配
                  </Button>
                </div>
              </div>
              <Table
                rowKey="id"
                dataSource={expertsData}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 位专家`,
                }}
                scroll={{ y: 600 }}
                columns={[
                  {
                    title: '专家',
                    key: 'expert',
                    width: 300,
                    render: (_, expert) => (
                      <Space>
                        <Avatar className="!bg-medical-blue" size={48}>{expert.name[0]}</Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <Text strong className="text-base">{expert.name}</Text>
                            {expert.rating && expert.rating >= 4.8 && (
                              <StarFilled className="text-yellow-400 text-sm" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {expert.department} · {expert.title}
                          </div>
                        </div>
                      </Space>
                    ),
                  },
                  {
                    title: '专长',
                    dataIndex: 'specialty',
                    key: 'specialty',
                    ellipsis: true,
                    width: 250,
                  },
                  {
                    title: '匹配度',
                    key: 'match',
                    width: 150,
                    render: (_, expert) => {
                      const matchScore = selectedPatient ? calculateMatchScore(selectedPatient, expert) : 0
                      return (
                        <div>
                          <Progress 
                            percent={matchScore} 
                            size="small" 
                            strokeColor={
                              matchScore >= 80 ? '#52c41a' :
                              matchScore >= 60 ? '#1890ff' :
                              matchScore >= 40 ? '#faad14' : '#ff4d4f'
                            }
                          />
                          {matchScore >= 80 && <Tag color="red">高匹配</Tag>}
                        </div>
                      )
                    },
                  },
                  {
                    title: '状态',
                    dataIndex: 'status',
                    key: 'status',
                    width: 100,
                    render: (status) => (
                      <Tag color={status === '空闲' ? 'green' : status === '忙碌' ? 'orange' : 'default'}>
                        {status}
                      </Tag>
                    ),
                  },
                  {
                    title: '会诊经验',
                    key: 'experience',
                    width: 120,
                    render: (_, expert) => (
                      <Space direction="vertical" size={0}>
                        <Text className="text-xs">
                          <span className="text-gray-500">会诊:</span> <strong>{expert.consultation_count || 0}次</strong>
                        </Text>
                        <Text className="text-xs">
                          <span className="text-gray-500">评分:</span> <strong className="text-yellow-500">★{expert.rating?.toFixed(1) || 'N/A'}</strong>
                        </Text>
                      </Space>
                    ),
                  },
                  {
                    title: '操作',
                    key: 'action',
                    width: 120,
                    fixed: 'right',
                    render: (_, expert) => (
                      <Button 
                        type="primary" 
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => handleExpertSelect(expert)}
                        disabled={expert.status === '离线' || !!selectedExperts.find(e => e.id === expert.id)}
                      >
                        {expert.status === '离线' ? '暂不可用' : selectedExperts.find(e => e.id === expert.id) ? '已添加' : '邀请'}
                      </Button>
                    ),
                  },
                ]}
              />
            </Col>
            <Col span={8}>
              <Title level={5}>已选专家 ({selectedExperts.length})</Title>
              {selectedExperts.length > 0 ? (
                <Card size="small" className="bg-blue-50 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <Text strong>邀请列表</Text>
                    <Button 
                      type="link" 
                      onClick={() => setSelectedExperts([])} 
                      danger 
                      size="small"
                      disabled={selectedExperts.length === 0}
                    >
                      清空全部
                    </Button>
                  </div>
                  <List
                    dataSource={selectedExperts}
                    size="small"
                    renderItem={(expert) => {
                      const matchScore = selectedPatient ? calculateMatchScore(selectedPatient, expert) : 0
                      return (
                        <List.Item
                          className="bg-white rounded mb-2"
                          actions={[
                            <Button 
                              key="remove" 
                              danger 
                              size="small" 
                              onClick={() => handleRemoveExpert(expert.id)}
                            >
                              移除
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Avatar className="!bg-medical-blue" size={40}>
                                {expert.name[0]}
                              </Avatar>
                            }
                            title={
                              <div className="flex items-center gap-2">
                                <Text strong>{expert.name}</Text>
                                <Tag color={expert.title === '主任医师' ? 'gold' : 'blue'}>
                                  {expert.title}
                                </Tag>
                              </div>
                            }
                            description={
                              <div className="space-y-1 mt-1">
                                <div className="text-xs">
                                  <Text type="secondary">科室：</Text>
                                  <Tag>{expert.department}</Tag>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <Text type="secondary">匹配度：</Text>
                                  <Progress 
                                    percent={matchScore} 
                                    size="small" 
                                    style={{ width: 80 }}
                                    strokeColor={
                                      matchScore >= 80 ? '#52c41a' :
                                      matchScore >= 60 ? '#1890ff' :
                                      matchScore >= 40 ? '#faad14' : '#ff4d4f'
                                    }
                                  />
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      )
                    }}
                  />
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                      <Text type="secondary">共 {selectedExperts.length} 位专家</Text>
                      <Space>
                        <Text type="secondary">科室分布：</Text>
                        <Tag color="blue">{Array.from(new Set(selectedExperts.map(e => e.department))).length} 个</Tag>
                      </Space>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card size="small" className="bg-gray-50 border border-gray-200">
                  <div className="text-center py-8">
                    <UserAddOutlined className="text-4xl text-gray-300 mb-2" />
                    <Text type="secondary">暂无已选专家</Text>
                    <div className="text-xs text-gray-400 mt-2">
                      请点击左侧专家卡片中的"邀请"按钮
                    </div>
                  </div>
                </Card>
              )}
            </Col>
          </Row>
          <div className="flex justify-between mt-4">
            <Button onClick={() => setCurrentStep(1)}>上一步</Button>
            <Button type="primary" onClick={() => setCurrentStep(3)} disabled={selectedExperts.length === 0}>
              下一步
            </Button>
          </div>
        </Card>
        )}
        </>
      )}

      {currentStep === 3 && selectedPatient && (
        <Card 
          title={
            <Space>
              <CheckCircleOutlined className="text-green-500" />
              <span>确认提交</span>
            </Space>
          }
        >
          <div className="space-y-4">
            {/* 患者信息 */}
            <Card 
              type="inner" 
              title={
                <Space>
                  <UserOutlined />
                  <span>患者信息</span>
                </Space>
              }
              size="small"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text type="secondary" className="text-xs">姓名：</Text>
                  <Text strong>{selectedPatient?.name}</Text>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">住院号：</Text>
                  <Text strong>{selectedPatient?.inpatientNo}</Text>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">性别：</Text>
                  <Text>{selectedPatient?.gender}</Text>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">年龄：</Text>
                  <Text>{selectedPatient?.age}岁</Text>
                </div>
                <div className="col-span-2">
                  <Text type="secondary" className="text-xs">主要诊断：</Text>
                  <Tag color="blue">{selectedPatient?.mainDiagnosis}</Tag>
                </div>
              </div>
            </Card>

            {/* 会诊信息 */}
            <Card 
              type="inner" 
              title={
                <Space>
                  <FileTextOutlined />
                  <span>会诊信息</span>
                </Space>
              }
              size="small"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text type="secondary" className="text-xs">会诊类型：</Text>
                  <Tag color={getConsultationTypeColor(form.getFieldValue('type'))}>
                    {getConsultationTypeName(form.getFieldValue('type'))}
                  </Tag>
                </div>
                <div>
                  <Text type="secondary" className="text-xs">紧急程度：</Text>
                  <Tag color={getUrgencyColor(form.getFieldValue('urgency'))}>
                    {getUrgencyName(form.getFieldValue('urgency'))}
                  </Tag>
                </div>
                {isSecretary && (
                  <div className="col-span-2">
                    <Text type="secondary" className="text-xs">会诊地点：</Text>
                    <Text strong className="text-base">
                      {form.getFieldValue('location') || <Text type="warning">未设置</Text>}
                    </Text>
                  </div>
                )}
                <div className="col-span-2">
                  <Text type="secondary" className="text-xs">{isSecretary ? "会诊时间：" : "期望会诊时间："}</Text>
                  <Text strong className="text-base">
                    {form.getFieldValue('expectTime') ? 
                      form.getFieldValue('expectTime').format('YYYY-MM-DD HH:mm') : 
                      <Text type="warning">未设置</Text>
                    }
                  </Text>
                </div>
                <div className="col-span-2">
                  <Text type="secondary" className="text-xs">病情摘要：</Text>
                  <div className="mt-1 p-3 bg-gray-50 rounded border border-gray-200">
                    <Text className="text-sm">{form.getFieldValue('summary') || '无'}</Text>
                  </div>
                </div>
              </div>
            </Card>

            {/* 邀请专家 */}
            <Card 
              type="inner" 
              title={
                <Space>
                  <TeamOutlined />
                  <span>邀请专家 ({selectedExperts.length}位)</span>
                </Space>
              }
              size="small"
            >
              <div className="space-y-2">
                {selectedExperts.map((expert, index) => {
                  const matchScore = calculateMatchScore(selectedPatient, expert)
                  return (
                    <div 
                      key={expert.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                    >
                      <Space>
                        <Avatar className="!bg-medical-blue" size={32}>
                          {expert.name[0]}
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <Text strong>{expert.name}</Text>
                            <Tag color={expert.title === '主任医师' ? 'gold' : 'blue'}>
                              {expert.title}
                            </Tag>
                            <Tag>{expert.department}</Tag>
                            {matchScore >= 80 && <Tag color="red">高匹配</Tag>}
                          </div>
                          <div className="text-xs text-gray-500">
                            <Text type="secondary">擅长：</Text>
                            <Text className="text-xs">{expert.specialty}</Text>
                          </div>
                        </div>
                      </Space>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-xs text-gray-500">匹配度</div>
                          <Progress 
                            percent={matchScore} 
                            size="small" 
                            style={{ width: 80 }}
                            strokeColor={
                              matchScore >= 80 ? '#52c41a' :
                              matchScore >= 60 ? '#1890ff' :
                              matchScore >= 40 ? '#faad14' : '#ff4d4f'
                            }
                            format={(percent) => `${percent}%`}
                          />
                        </div>
                        <Button 
                          size="small" 
                          danger 
                          onClick={() => {
                            handleRemoveExpert(expert.id)
                            message.warning('已移除该专家，请确认后再提交')
                          }}
                        >
                          移除
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* 提交提示 */}
            <Alert
              type="success"
              message="提交确认"
              description="提交后将通知各位专家进行会诊确认，请确保以上信息准确无误。"
              showIcon
              className="mt-4"
            />

            <div className="flex justify-between pt-4 border-t border-gray-200">
              <Button onClick={() => setCurrentStep(2)}>上一步</Button>
              <Button 
                type="primary" 
                onClick={handleSubmit} 
                className="!bg-medical-blue"
                icon={<CheckCircleOutlined />}
                loading={submitting}
              >
                确认提交申请
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 智能匹配专家抽屉 */}
      <Drawer
        title={
          <Space>
            <RobotOutlined style={{ color: '#1890ff' }} />
            <span>AI 智能匹配专家</span>
            {selectedPatient && <Tag color="blue">{selectedPatient.name}</Tag>}
          </Space>
        }
        placement="right"
        width={700}
        open={matchDrawerVisible}
        onClose={() => {
          setMatchDrawerVisible(false)
          setMatchedExperts([])
        }}
      >
        {matchLoading ? (
          <div className="text-center py-20">
            <Progress type="circle" percent={100} status="active" />
            <div className="mt-4">
              <Text type="secondary">正在进行智能匹配...</Text>
            </div>
          </div>
        ) : matchedExperts.length > 0 ? (
          <>
            <Alert
              type="info"
              message="智能匹配结果"
              description="基于患者病情、专家专长、历史案例、可用时间等多维度进行智能匹配，推荐最合适的专家组合。"
              showIcon
              className="mb-4"
            />
            
            <List
              dataSource={matchedExperts}
              renderItem={(expert) => (
                <List.Item
                  actions={[
                    <Button 
                      key="add" 
                      type="primary" 
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => handleSelectMatchedExpert(expert)}
                      disabled={!!selectedExperts.find(e => e.id === expert.expertId)}
                    >
                      {selectedExperts.find(e => e.id === expert.expertId) ? '已添加' : '邀请'}
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div className="relative">
                        <Avatar className="!bg-medical-blue" size={48}>{expert.name[0]}</Avatar>
                        {expert.recommended && (
                          <div className="absolute -top-1 -right-1">
                            <StarFilled className="text-yellow-400 text-sm" />
                          </div>
                        )}
                      </div>
                    }
                    title={
                      <Space>
                        <Text strong>{expert.name}</Text>
                        <Tag>{expert.department}</Tag>
                        <Tag color={expert.title === '主任医师' ? 'gold' : 'blue'}>{expert.title}</Tag>
                        {expert.recommended && <Tag color="red">推荐</Tag>}
                      </Space>
                    }
                    description={
                      <div className="space-y-2">
                        <Text type="secondary">{expert.specialty}</Text>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Text type="secondary" className="text-xs">匹配度：</Text>
                            <Progress 
                              percent={expert.matchScore} 
                              size="small" 
                              style={{ width: 100 }}
                              strokeColor={
                                expert.matchScore >= 90 ? '#52c41a' :
                                expert.matchScore >= 80 ? '#1890ff' :
                                expert.matchScore >= 70 ? '#faad14' : '#ff4d4f'
                              }
                            />
                          </div>
                          <Tag color={expert.availability === '空闲' ? 'green' : expert.availability === '忙碌' ? 'orange' : 'default'}>
                            {expert.availability}
                          </Tag>
                        </div>
                        
                        <div className="mt-2">
                          <Text type="secondary" className="text-xs">匹配原因：</Text>
                          <ul className="mt-1 space-y-1">
                            {expert.matchReasons?.map((reason, idx) => (
                              <li key={idx} className="text-xs text-gray-600">• {reason}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex gap-4 mt-2 text-xs">
                          <Text type="secondary">近期案例：{expert.recentCases}例</Text>
                          <Text type="secondary">成功率：{expert.successRate}%</Text>
                          <Text type="secondary">平均评分：{expert.averageRating}分</Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </>
        ) : (
          <Alert
            type="warning"
            message="未找到匹配专家"
            description="请确保已选择患者并填写了会诊信息，然后重新尝试智能匹配。"
            showIcon
          />
        )}
      </Drawer>

      <Drawer
        title="患者信息"
        placement="right"
        width={1200}
        open={patientDrawerVisible}
        onClose={() => setPatientDrawerVisible(false)}
      >
        {selectedPatient && (
          <PatientInfo
            patientId={selectedPatient.id}
            patientName={selectedPatient.name}
            patientInpatientNo={selectedPatient.inpatientNo}
            compact={false}
            patientData={selectedPatient}
          />
        )}
      </Drawer>
    </div>
  )
}