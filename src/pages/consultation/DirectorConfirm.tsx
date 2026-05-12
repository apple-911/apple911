import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Tag, Button, Space, Modal, message, Typography, Descriptions, Input, Badge, Tabs, Statistic, Row, Col, Divider, List, Avatar, Timeline, Tabs as AntdTabs, Result } from 'antd'
import { CheckOutlined, CloseOutlined, EyeOutlined, ClockCircleOutlined, UserOutlined, PhoneOutlined, MedicineBoxOutlined, FileTextOutlined, UploadOutlined, DatabaseOutlined, PictureOutlined, FilePdfOutlined, HeartOutlined, ExperimentOutlined, ToolOutlined, RiseOutlined, FileProtectOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadedFile } from '../../stores/consultationStore'
import PatientInfo from '../../components/PatientInfo'
import { supabase } from '../../lib/supabase'
import { useAppStore } from '../../stores/appStore'
import { sendSystemNotification } from '../../stores/notificationStore'
import { hasPermission } from '../../utils/helpers'
import { CONSULTATION_STATUS, ROLE, POSITION } from '../../utils/statusMapping'

const { Title, Text } = Typography
const { TextArea } = Input

interface ConsultationApplication {
  id: string  // UUID，数据库主键
  consultationCode?: string  // 会诊编码，如 HZ260420001
  patientId: string
  patientName: string
  patientInpatientNo: string
  age: number
  gender: '男' | '女'
  department: string
  applyDoctor: string
  applyTime: string
  mainDiagnosis: string
  otherDiagnoses: string[]
  consultationPurpose: string
  urgency: '普通' | '紧急' | '特急'
  status: '医生提交' | '待主任审核' | '秘书审核' | '主任驳回'
  experts: Array<{ id: string; name: string; department: string; title: string }>
  // 材料相关字段
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

const mockPendingApplications: ConsultationApplication[] = [
  {
    id: 'C001',
    patientId: 'P001',
    patientName: '王建国',
    patientInpatientNo: 'ZY2024001234',
    age: 62,
    gender: '男',
    department: '肿瘤科',
    applyDoctor: '张明华',
    applyTime: '2024-03-15 09:30',
    mainDiagnosis: '左肺鳞癌 III 期',
    otherDiagnoses: ['高血压 2 级', '2 型糖尿病'],
    consultationPurpose: '明确分期及后续治疗方案',
    urgency: '紧急',
    status: '待主任审核',
    experts: [
      { id: '1', name: '李芳', department: '胸外科', title: '副主任医师' },
      { id: '3', name: '王建国', department: '放射科', title: '主任医师' },
      { id: '4', name: '刘晓燕', department: '病理科', title: '主任医师' }
    ],
    // 材料信息
    hisDataSynced: true,
    hisSyncTime: '2024-03-15 08:55',
    medicalRecords: {
      chiefComplaint: '咳嗽、痰中带血 2 个月，加重伴气促 1 周',
      presentIllness: '患者 2 月前无明显诱因出现咳嗽，痰中带血丝，伴右侧胸痛。1 周前症状加重，活动后气促明显。',
      pastHistory: '高血压病史 5 年，最高 180/110mmHg；2 型糖尿病史 3 年，口服降糖药治疗',
      physicalExamination: 'T 36.5℃, P 88 次/分，R 20 次/分，BP 145/90mmHg。神清，右肺呼吸音低，可闻及湿啰音',
      auxiliaryExamination: '胸部 CT：左肺上叶占位性病变，大小约 4.5cm×3.8cm，伴纵隔淋巴结肿大',
      initialDiagnosis: '左肺鳞癌 cT2N2M0 IIIA 期',
      treatmentPlan: '拟行新辅助化疗 + 免疫治疗后评估手术'
    },
    uploadedFiles: [
      {
        id: 'HIS001',
        fileName: '入院记录.pdf',
        fileType: '病历',
        fileSize: 524288,
        uploadTime: '2024-03-15 08:55',
        uploadUrl: '/his/records/001.pdf',
        fromHIS: true
      },
      {
        id: 'HIS002',
        fileName: '胸部 CT 增强报告.pdf',
        fileType: '检查报告',
        fileSize: 1048576,
        uploadTime: '2024-03-15 08:56',
        uploadUrl: '/his/reports/ct001.pdf',
        fromHIS: true
      },
      {
        id: 'HIS003',
        fileName: '病理活检报告.pdf',
        fileType: '病理报告',
        fileSize: 768000,
        uploadTime: '2024-03-15 08:57',
        uploadUrl: '/his/reports/path001.pdf',
        fromHIS: true
      },
      {
        id: 'HIS004',
        fileName: '肿瘤标志物检查结果.pdf',
        fileType: '检验报告',
        fileSize: 512000,
        uploadTime: '2024-03-15 08:58',
        uploadUrl: '/his/reports/lab001.pdf',
        fromHIS: true
      },
      {
        id: 'F001',
        fileName: '患者既往手术记录.pdf',
        fileType: '病历',
        fileSize: 384000,
        uploadTime: '2024-03-15 09:20',
        uploadUrl: '/files/001.pdf',
        fromHIS: false
      },
      {
        id: 'F002',
        fileName: '外院 PET-CT 报告.pdf',
        fileType: '影像资料',
        fileSize: 2097152,
        uploadTime: '2024-03-15 09:25',
        uploadUrl: '/files/002.pdf',
        fromHIS: false
      }
    ]
  },
  {
    id: 'C008',
    patientId: 'P002',
    patientName: '赵小红',
    patientInpatientNo: 'ZY2024001267',
    age: 48,
    gender: '女',
    department: '胃肠外科',
    applyDoctor: '李明',
    applyTime: '2024-03-16 14:20',
    mainDiagnosis: '胃癌术后复发',
    otherDiagnoses: ['贫血'],
    consultationPurpose: '评估二次手术可行性',
    urgency: '紧急',
    status: '待主任审核',
    experts: [
      { id: '2', name: '张伟', department: '胃肠外科', title: '主任医师' },
      { id: '5', name: '陈伟', department: '肿瘤科', title: '副主任医师' }
    ],
    hisDataSynced: true,
    hisSyncTime: '2024-03-16 14:00',
    medicalRecords: {
      chiefComplaint: '胃癌根治术后 1 年，发现腹腔转移 2 周',
      presentIllness: '患者 1 年前行胃癌根治术，术后病理：低分化腺癌。2 周前复查 CT 提示腹腔多发转移灶',
      pastHistory: '胃癌根治术后 1 年，曾行 6 周期辅助化疗',
      physicalExamination: '一般情况可，腹软，全腹未触及明显包块，移动性浊音阴性',
      auxiliaryExamination: '腹部 CT：腹腔多发淋巴结肿大，最大约 2.5cm×2.0cm',
      initialDiagnosis: '胃癌术后腹腔转移',
      treatmentPlan: '评估二次手术 + 腹腔热灌注化疗可行性'
    },
    uploadedFiles: [
      {
        id: 'HIS005',
        fileName: '入院记录.pdf',
        fileType: '病历',
        fileSize: 458752,
        uploadTime: '2024-03-16 14:00',
        uploadUrl: '/his/records/005.pdf',
        fromHIS: true
      },
      {
        id: 'HIS006',
        fileName: '腹部 CT 报告.pdf',
        fileType: '检查报告',
        fileSize: 983040,
        uploadTime: '2024-03-16 14:01',
        uploadUrl: '/his/reports/ct005.pdf',
        fromHIS: true
      },
      {
        id: 'F003',
        fileName: '首次手术记录.pdf',
        fileType: '病历',
        fileSize: 614400,
        uploadTime: '2024-03-16 14:15',
        uploadUrl: '/files/003.pdf',
        fromHIS: false
      }
    ]
  },
  {
    id: 'C009',
    patientId: 'P003',
    patientName: '孙志强',
    patientInpatientNo: 'ZY2024001278',
    age: 72,
    gender: '男',
    department: '呼吸科',
    applyDoctor: '王芳',
    applyTime: '2024-03-17 10:15',
    mainDiagnosis: '慢性阻塞性肺疾病急性加重',
    otherDiagnoses: ['冠心病', '高血压 3 级'],
    consultationPurpose: '多学科综合治疗方案制定',
    urgency: '普通',
    status: '待主任审核',
    experts: [
      { id: '6', name: '赵红梅', department: '呼吸科', title: '主任医师' },
      { id: '7', name: '刘洋', department: '心内科', title: '副主任医师' }
    ],
    hisDataSynced: false,
    medicalRecords: {
      chiefComplaint: '反复咳嗽、咳痰 20 年，加重伴呼吸困难 3 天',
      presentIllness: '患者 20 年前诊断为 COPD，长期吸入药物治疗。3 天前受凉后症状加重，静息状态下亦感呼吸困难',
      pastHistory: 'COPD 20 年，冠心病 5 年，高血压 3 级（极高危）',
      physicalExamination: 'T 37.8℃, P 102 次/分，R 28 次/分，BP 165/95mmHg。口唇紫绀，桶状胸，双肺可闻及干湿啰音',
      auxiliaryExamination: '血气分析：pH 7.32, PaO2 55mmHg, PaCO2 68mmHg。胸片：双肺纹理增粗，透亮度增加',
      initialDiagnosis: 'AECOPD 合并Ⅱ型呼吸衰竭',
      treatmentPlan: '抗感染、平喘、化痰、无创通气支持治疗'
    },
    uploadedFiles: [
      {
        id: 'F004',
        fileName: '胸片报告.jpg',
        fileType: '影像资料',
        fileSize: 262144,
        uploadTime: '2024-03-17 10:00',
        uploadUrl: '/files/004.jpg',
        fromHIS: false
      },
      {
        id: 'F005',
        fileName: '心电图.pdf',
        fileType: '检查报告',
        fileSize: 204800,
        uploadTime: '2024-03-17 10:05',
        uploadUrl: '/files/005.pdf',
        fromHIS: false
      }
    ]
  }
]

const urgencyConfig = {
  '普通': { color: 'default' },
  '紧急': { color: 'orange' },
  '特急': { color: 'red' },
}

export default function DirectorConfirm() {
  const { user } = useAppStore()
  const [data, setData] = useState<ConsultationApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [detailVisible, setDetailVisible] = useState(false)
  const [rejectVisible, setRejectVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ConsultationApplication | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [activeTab, setActiveTab] = useState('pending')
  const [submitting, setSubmitting] = useState(false)
  const [todayConfirmed, setTodayConfirmed] = useState(0)
  const [todayRejected, setTodayRejected] = useState(0)
  const navigate = useNavigate()

  // 加载会诊申请数据和统计信息
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // 获取今日日期范围（UTC时间）
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const todayEnd = new Date()
      todayEnd.setHours(23, 59, 59, 999)

      // 获取当前主任所在的科室（通过 org_id 关联 organizations 表）
      let directorDepartment = ''
      if (user?.org_id) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', user.org_id)
          .maybeSingle()
        
        if (orgError) {
          console.error('查询科室失败:', orgError)
        } else if (orgData) {
          directorDepartment = orgData.name || ''
          console.log('查询到科室:', directorDepartment)
        } else {
          console.warn('未找到科室，org_id:', user.org_id)
        }
      } else {
        console.warn('用户没有 org_id')
      }
      
      console.log('主任所在科室:', directorDepartment)
      console.log('查询条件 - status:', CONSULTATION_STATUS.DOCTOR_SUBMIT)
      console.log('查询条件 - department:', directorDepartment)
      
      // 并行获取所有数据
      const [
        { data: consultations, error: consultationError },
        { data: allExperts, error: expertsError },
        { data: consultationExperts, error: ceError },
        { data: auditHistory, error: auditError }
      ] = await Promise.all([
        // 查询待科室审核的会诊（只查询主任所在科室的申请）
        supabase
          .from('consultations')
          .select('*')
          .eq('status', CONSULTATION_STATUS.DOCTOR_SUBMIT)
          .eq('department', directorDepartment)
          .order('urgency', { ascending: false })
          .order('apply_time', { ascending: false }),
        supabase
          .from('experts')
          .select('*'),
        supabase
          .from('consultation_experts')
          .select('consultation_id, expert_id'),
        supabase
          .from('audit_history')
          .select('*')
          .gte('time', todayStart.toISOString())
          .lte('time', todayEnd.toISOString())
          .eq('operator_role', ROLE.DIRECTOR)
      ])
      
      // 错误处理
      if (consultationError) throw consultationError
      if (expertsError) throw expertsError
      if (ceError) throw ceError
      if (auditError) throw auditError

      // 计算今日确认和拒绝数量
      const todayConfirmedCount = auditHistory.filter(a => a.result === '通过').length
      const todayRejectedCount = auditHistory.filter(a => a.result === '拒绝').length
      setTodayConfirmed(todayConfirmedCount)
      setTodayRejected(todayRejectedCount)

      const expertMap = new Map(allExperts.map(e => [e.id, e]))

      // 构建会诊ID到专家ID列表的映射
      const consultationExpertMap = new Map<string, string[]>()
      consultationExperts.forEach(ce => {
        if (!consultationExpertMap.has(ce.consultation_id)) {
          consultationExpertMap.set(ce.consultation_id, [])
        }
        consultationExpertMap.get(ce.consultation_id)!.push(ce.expert_id)
      })

      // 在代码中过滤：只显示当前主任负责的会诊
      let filteredConsultations = consultations || []
      if (user?.org_id && user?.position?.includes('主任')) {
        filteredConsultations = filteredConsultations.filter(c => {
          // 1. 如果是主要责任人（director_id），显示
          if (c.director_id === user.id) return true
          
          // 2. 如果是同科室的主任，也能看到和审批
          // 将科室名称转换为 org_id 进行比较
          const consultationOrgId = c.department ? `org-${c.department.toLowerCase()}` : null
          if (consultationOrgId === user.org_id) return true
          
          return false
        })
      }
      
      // 使用过滤后的数据构建应用程序数据
      const applications: ConsultationApplication[] = filteredConsultations.map(c => {
        // 从 consultation_experts 表获取专家ID列表
        const expertIds = consultationExpertMap.get(c.id) || []
        const experts = expertIds.map((id: string) => {
          const expert = expertMap.get(id)
          return expert ? {
            id: expert.id,
            name: expert.name,
            department: expert.department,
            title: expert.title,
          } : {
            id,
            name: '未知专家',
            department: '未知科室',
            title: '职称',
          }
        })

        return {
          id: c.id,
          consultationCode: c.consultation_code,  // 添加会诊编码
          patientId: c.patient_id,
          patientName: c.patient_name,
          patientInpatientNo: c.patient_inpatient_no,
          age: 50, // 需要从 patients 表关联查询
          gender: '男', // 需要从 patients 表关联查询
          department: c.department,
          applyDoctor: c.apply_doctor,
          applyTime: new Date(c.apply_time).toLocaleString('zh-CN'),
          mainDiagnosis: c.main_diagnosis,
          otherDiagnoses: c.other_diagnoses || [],
          consultationPurpose: c.consultation_purpose,
          urgency: c.urgency,
          status: c.status,
          experts,
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

  const pendingData = data.filter(item => item.status === '医生提交')
  const processedData = data.filter(item => item.status !== '医生提交')

  const getPatientInfo = async (patientId: string) => {
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single()
    
    if (error) {
      console.error('加载患者信息失败:', error)
      return null
    }
    
    return patient
  }

  const handleConfirm = (item: ConsultationApplication) => {
    Modal.confirm({
      title: '确认会诊申请',
      content: `确认通过患者 ${item.patientName} 的会诊申请？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          setSubmitting(true)
          // 更新会诊状态
          await supabase
            .from('consultations')
            .update({ status: '待秘书审核' })
            .eq('id', item.id)
          
          // 添加审核历史
          const auditInsert: any = {
            consultation_id: item.id,
            operator: user?.name,
            operator_role: '主任医生',
            node: '科室审核',
            result: '通过',
            time: new Date().toISOString(),
          }
          
          // 如果用户有 ID 且是 UUID 格式，才添加 operator_id
          if (user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
            auditInsert.operator_id = user.id
          }
          
          await supabase
            .from('audit_history')
            .insert(auditInsert)
          
          // 发送通知给申请医生
          try {
            // 查询申请医生用户
            const { data: doctors } = await supabase
              .from('users')
              .select('id')
              .eq('name', item.applyDoctor)
              .limit(1)

            if (doctors && doctors.length > 0) {
              await sendSystemNotification(
                doctors[0].id,
                'success',
                '会诊申请已通过主任确认',
                `您提交的 ${item.patientName} 会诊申请已通过主任确认，进入秘书审核阶段`,
                {
                  label: '查看',
                  url: `/consultation/my-applies`,
                }
              )
            }
          } catch (notificationError) {
            console.error('发送通知失败:', notificationError)
          }
          
          // 发送通知给 MDT 秘书
          try {
            // 查询 MDT 秘书用户
            const { data: secretaries } = await supabase
              .from('users')
              .select('id')
              .eq('role', POSITION.MDT_SECRETARY)
              .returns<{ id: string }[]>()

            if (secretaries && secretaries.length > 0) {
              for (const secretary of secretaries) {
                await sendSystemNotification(
                  secretary.id,
                  'info',
                  '新会诊申请待审核',
                  `主任已确认患者 ${item.patientName} 的会诊申请，请进行审核`,
                  {
                    label: '审核',
                    url: `/consultation/pending-review`,
                  }
                )
              }
            }
          } catch (notificationError) {
            console.error('发送通知给秘书失败:', notificationError)
          }
          
          message.success(`已确认 ${item.patientName} 的会诊申请，已流转至秘书审核`)
          loadData()
        } catch (err) {
          console.error('确认失败:', err)
          message.error('确认失败，请重试')
        } finally {
          setSubmitting(false)
        }
      }
    })
  }

  const handleReject = (item: ConsultationApplication) => {
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
      if (!selectedItem) return
      
      // 更新会诊状态
      await supabase
        .from('consultations')
        .update({ 
          status: '主任驳回',
          reject_reason: rejectReason
        })
        .eq('id', selectedItem.id)
      
      // 添加审核历史
      const auditInsert: any = {
        consultation_id: selectedItem.id,
        operator: user?.name,
        operator_role: '主任医生',
        node: '科室审核',
        result: '拒绝',
        opinion: rejectReason,
        time: new Date().toISOString(),
      }
      
      // 如果用户有 ID 且是 UUID 格式，才添加 operator_id
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
          .eq('name', selectedItem.applyDoctor)
          .limit(1)

        if (doctors && doctors.length > 0) {
          await sendSystemNotification(
            doctors[0].id,
            'error',
            '会诊申请被主任驳回',
            `您提交的 ${selectedItem.patientName} 会诊申请已被主任驳回，原因：${rejectReason}`,
            {
              label: '查看',
              url: `/consultation/my-applies`,
            }
          )
        }
      } catch (notificationError) {
        console.error('发送通知失败:', notificationError)
      }
      
      message.success(`已拒绝 ${selectedItem?.patientName} 的会诊申请`)
      setRejectVisible(false)
      setSelectedItem(null)
      setRejectReason('')
      loadData()
    } catch (err) {
      console.error('拒绝失败:', err)
      message.error('拒绝失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewDetail = (item: ConsultationApplication) => {
    // 跳转到统一的详情页面
    navigate(`/consultation/detail/${item.id}`)
  }

  const columns: ColumnsType<ConsultationApplication> = [
    {
      title: '会诊 ID',
      dataIndex: 'consultationCode',
      width: 120,
      render: (code: string, record: ConsultationApplication) => <Tag color="blue">{code || record.id}</Tag>
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
      title: '性别/年龄',
      key: 'demographics',
      width: 100,
      render: (_, record) => `${record.gender} / ${record.age}岁`
    },
    {
      title: '申请科室',
      dataIndex: 'department',
      width: 120,
    },
    {
      title: '申请医生',
      dataIndex: 'applyDoctor',
      width: 120,
    },
    {
      title: '申请时间',
      dataIndex: 'applyTime',
      width: 150,
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
      title: '拟邀专家',
      dataIndex: 'experts',
      width: 200,
      render: (experts: Array<{ name: string; department: string }>) => (
        <Space wrap>
          {experts.slice(0, 2).map(e => (
            <Tag key={e.name} color="cyan">{e.name}({e.department})</Tag>
          ))}
          {experts.length > 2 && <Tag>+{experts.length - 2}</Tag>}
        </Space>
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
          <Button
            size="small"
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => handleConfirm(record)}
          >
            确认
          </Button>
          <Button
            size="small"
            danger
            icon={<CloseOutlined />}
            onClick={() => handleReject(record)}
          >
            拒绝
          </Button>
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
        subTitle="抱歉，您没有权限访问主任确认页面。如需获取权限，请联系系统管理员。"
        extra={<Button type="primary" onClick={() => navigate(-1)}>返回</Button>}
      />
    )
  }

  return (
    <div className="space-y-4">
      <Title level={4}>主任医生确认</Title>

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
              title="今日已确认"
              value={todayConfirmed}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日已拒绝"
              value={todayRejected}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="确认率"
              value={todayConfirmed + todayRejected > 0 ? Math.round((todayConfirmed / (todayConfirmed + todayRejected)) * 100) : 0}
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
        title="会诊申请详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailVisible(false)}>
            关闭
          </Button>,
          selectedItem && (
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
          selectedItem && (
            <Button
              key="confirm"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                setDetailVisible(false)
                handleConfirm(selectedItem)
              }}
            >
              确认通过
            </Button>
          )
        ]}
        width={1200}
      >
        {selectedItem && (
            <div className="space-y-4">
              {/* 患者基本信息 - 使用 PatientInfo 组件 */}
              <PatientInfo patientId={selectedItem.patientId} compact={false} />

              {/* 会诊申请信息 */}
              <Card size="small" title={<Space><FileTextOutlined />会诊申请信息</Space>}>
                <Descriptions bordered column={3} size="small">
                  <Descriptions.Item label="会诊 ID">{selectedItem.id}</Descriptions.Item>
                  <Descriptions.Item label="紧急程度">
                    <Tag color={urgencyConfig[selectedItem.urgency]?.color}>{selectedItem.urgency}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="申请医生">{selectedItem.applyDoctor}</Descriptions.Item>
                  <Descriptions.Item label="申请时间">{selectedItem.applyTime}</Descriptions.Item>
                  <Descriptions.Item label="会诊目的" span={3}>{selectedItem.consultationPurpose}</Descriptions.Item>
                  <Descriptions.Item label="主要诊断" span={3}>
                    <Tag color="orange">{selectedItem.mainDiagnosis}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="其他诊断" span={3}>
                    <Space wrap>
                      {selectedItem.otherDiagnoses.map(d => <Tag key={d}>{d}</Tag>)}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="拟邀专家" span={3}>
                    <Space wrap>
                      {selectedItem.experts.map(e => (
                        <Tag key={e.id} color="cyan">{e.name} - {e.department} - {e.title}</Tag>
                      ))}
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* 病历资料 + 附件 */}
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
                            <div className="whitespace-pre-wrap">{selectedItem.medicalRecords?.chiefComplaint || '-'}</div>
                          </Descriptions.Item>
                          <Descriptions.Item label="现病史" span={2}>
                            <div className="whitespace-pre-wrap">{selectedItem.medicalRecords?.presentIllness || '-'}</div>
                          </Descriptions.Item>
                          <Descriptions.Item label="既往史" span={2}>
                            <div className="whitespace-pre-wrap">{selectedItem.medicalRecords?.pastHistory || '-'}</div>
                          </Descriptions.Item>
                          <Descriptions.Item label="体格检查" span={2}>
                            <div className="whitespace-pre-wrap">{selectedItem.medicalRecords?.physicalExamination || '-'}</div>
                          </Descriptions.Item>
                          <Descriptions.Item label="辅助检查" span={2}>
                            <div className="whitespace-pre-wrap">{selectedItem.medicalRecords?.auxiliaryExamination || '-'}</div>
                          </Descriptions.Item>
                          <Descriptions.Item label="初步诊断" span={2}>
                            <div className="whitespace-pre-wrap font-medium text-blue-600">{selectedItem.medicalRecords?.initialDiagnosis || '-'}</div>
                          </Descriptions.Item>
                          <Descriptions.Item label="治疗方案" span={2}>
                            <div className="whitespace-pre-wrap">{selectedItem.medicalRecords?.treatmentPlan || '-'}</div>
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
        }
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
          <Text>会诊申请：{selectedItem?.patientName} ({selectedItem?.id})</Text>
          <TextArea
            rows={4}
            placeholder="请输入拒绝原因，将反馈给申请医生"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  )
}
