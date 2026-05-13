import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Calendar, Badge, List, Avatar, Tag, Space, Button, Modal, DatePicker, message, Typography, Tabs, Table, Drawer, Result } from 'antd'
import { PlusOutlined, TeamOutlined, CalendarOutlined, EditOutlined, ClockCircleOutlined, CheckCircleOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons'
import { supabase } from '../../lib/supabase'
import dayjs from 'dayjs'
import IntelligentScheduler from '../../components/IntelligentScheduler'
import PatientInfo from '../../components/PatientInfo'
import { hasPermission } from '../../utils/helpers'
import { getUrgencyName } from '../../utils/codeTable'

const { Title, Text } = Typography

interface ScheduleConsultation {
  id: string
  patientName: string
  patientInpatientNo: string
  patientId: string
  mainDiagnosis: string
  department: string
  applyDoctor: string
  applyTime: string
  urgency: string
  expectTime: string
  scheduleTime?: string
  consultationPurpose?: string
  experts: Expert[]
  status: string
}

interface Expert {
  id: string
  name: string
  department: string
  title: string
  status: '空闲' | '忙碌' | '离线'
  specialty: string
}

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs())
  const [scheduledConsultations, setScheduledConsultations] = useState<ScheduleConsultation[]>([])
  const [pendingConsultations, setPendingConsultations] = useState<ScheduleConsultation[]>([])
  const [loading, setLoading] = useState(true)
  const [reschedulingConsultation, setReschedulingConsultation] = useState<ScheduleConsultation | null>(null)
  const [showScheduler, setShowScheduler] = useState(false)
  const [patientDrawerVisible, setPatientDrawerVisible] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [selectedPatientName, setSelectedPatientName] = useState<string>('')
  const [selectedPatientInpatientNo, setSelectedPatientInpatientNo] = useState<string>('')
  const [scheduledEvents, setScheduledEvents] = useState<any[]>([])
  const [expertAvailability, setExpertAvailability] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    loadConsultations()
  }, [])

  const loadConsultations = async () => {
    try {
      setLoading(true)
      
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

      // 构建会诊ID到专家ID列表的映射
      const consultationExpertMap = new Map<string, string[]>()
      consultationExperts.forEach(ce => {
        if (!consultationExpertMap.has(ce.consultation_id)) {
          consultationExpertMap.set(ce.consultation_id, [])
        }
        consultationExpertMap.get(ce.consultation_id)!.push(ce.expert_id)
      })

      // 获取待排期的会诊（秘书审核通过后，等待排期）
      const { data: pendingData, error: pendingError } = await supabase
        .from('consultations')
        .select('*')
        .eq('status', 'secretary_pending')
        .order('apply_time', { ascending: false })

      if (pendingError) throw pendingError

      const pendingList: ScheduleConsultation[] = (pendingData || []).map(c => {
        console.log('待排期会诊 - 患者:', c.patient_name, 'urgency:', c.urgency, 'status:', c.status)
        
        return {
          id: c.id,
          patientName: c.patient_name,
          patientInpatientNo: c.patient_inpatient_no,
          patientId: c.patient_id,
          mainDiagnosis: c.main_diagnosis,
          department: c.department,
          applyDoctor: c.apply_doctor,
          applyTime: c.apply_time ? dayjs(c.apply_time).format('YYYY-MM-DD HH:mm') : '',
          urgency: getUrgencyName(c.urgency),
          expectTime: c.expect_time ? dayjs(c.expect_time).format('YYYY-MM-DD HH:mm') : '',
          scheduleTime: c.schedule_time ? dayjs(c.schedule_time).format('YYYY-MM-DD HH:mm') : '',
          consultationPurpose: c.summary,
          experts: consultationExpertMap.get(c.id)?.map(eid => {
            const expert = expertMap.get(eid)
            return { 
              id: eid, 
              name: expert?.name || '未知专家', 
              department: expert?.department || '未知科室',
              title: expert?.title || '',
              status: '空闲' as const,
              specialty: expert?.specialty || ''
            }
          }) || [],
          status: c.status
        }
      })

      setPendingConsultations(pendingList)

      // 获取已排期的会诊
      const { data: scheduledData, error: scheduledError } = await supabase
        .from('consultations')
        .select('*')
        .in('status', ['待专家确认', '专家邀请', '专家确认', '待会诊', '会诊中'])
        .order('expect_time', { ascending: true })

      if (scheduledError) throw scheduledError

      const scheduledList: ScheduleConsultation[] = (scheduledData || []).map(c => ({
        id: c.id,
        patientName: c.patient_name,
        patientInpatientNo: c.patient_inpatient_no,
        patientId: c.patient_id,
        mainDiagnosis: c.main_diagnosis,
        department: c.department,
        applyDoctor: c.apply_doctor,
        applyTime: c.apply_time ? dayjs(c.apply_time).format('YYYY-MM-DD HH:mm') : '',
        urgency: c.urgency || '普通',
        expectTime: c.expect_time ? dayjs(c.expect_time).format('YYYY-MM-DD HH:mm') : '',
        scheduleTime: c.schedule_time ? dayjs(c.schedule_time).format('YYYY-MM-DD HH:mm') : '',
        consultationPurpose: c.summary,
        experts: consultationExpertMap.get(c.id)?.map(eid => {
          const expert = expertMap.get(eid)
          return { 
            id: eid, 
            name: expert?.name || '未知专家', 
            department: expert?.department || '未知科室',
            title: expert?.title || '',
            status: '空闲' as const,
            specialty: expert?.specialty || ''
          }
        }) || [],
        status: c.status
      }))

      setScheduledConsultations(scheduledList)
    } catch (error) {
      console.error('加载排期数据失败:', error)
      message.error('加载排期数据失败')
    } finally {
      setLoading(false)
    }
  }

  const getListData = (value: dayjs.Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD')
    return scheduledConsultations
      .filter(c => c.scheduleTime ? c.scheduleTime.startsWith(dateStr) : c.expectTime.startsWith(dateStr))
      .map(c => ({
        id: c.id,
        type: c.urgency === '紧急' ? 'error' : c.urgency === '特急' ? 'warning' : 'success',
        content: `${c.patientName} - ${c.mainDiagnosis.substring(0, 10)}`,
      }))
  }

  const handleDateSelect = (date: dayjs.Dayjs) => {
    setSelectedDate(date)
  }

  const selectedDateConsultations = scheduledConsultations.filter(c =>
    c.scheduleTime ? c.scheduleTime.startsWith(selectedDate.format('YYYY-MM-DD')) : c.expectTime.startsWith(selectedDate.format('YYYY-MM-DD'))
  )

  // 打开智能排期
  const handleSchedule = (consultation: ScheduleConsultation) => {
    setReschedulingConsultation(consultation)
    setShowScheduler(true)
  }

  // 确认排期
  const handleConfirmSchedule = (date: dayjs.Dayjs, time: string, selectedExperts: Expert[]) => {
    const datetime = date.format('YYYY-MM-DD') + ' ' + time
    message.success(`排期成功！会诊时间：${datetime}`)
    setShowScheduler(false)
    setReschedulingConsultation(null)
  }

  const showPatientInfo = (patientId: string, patientName: string, patientInpatientNo: string) => {
    setSelectedPatientId(patientId)
    setSelectedPatientName(patientName)
    setSelectedPatientInpatientNo(patientInpatientNo)
    setPatientDrawerVisible(true)
  }

  // 权限检查
  if (!hasPermission('perm-consultation-schedule')) {
    return (
      <Result
        status="403"
        title="暂无权限"
        subTitle="抱歉，您没有权限访问排期管理页面。如需获取权限，请联系系统管理员。"
        extra={<Button type="primary" onClick={() => navigate(-1)}>返回</Button>}
      />
    )
  }

  return (
    <div className="space-y-4">
      <Title level={4}>会诊排期管理</Title>

      {/* 待排期列表 */}
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            <span>待排期申请</span>
            <Tag color="orange">{pendingConsultations.length}</Tag>
          </Space>
        }
      >
        <Table
          dataSource={pendingConsultations}
          rowKey="id"
          scroll={{ x: 1200 }}
          columns={[
            { title: '患者姓名', dataIndex: 'patientName', width: 100 },
            { title: '住院号', dataIndex: 'patientInpatientNo', width: 140 },
            { title: '科室', dataIndex: 'department', width: 100 },
            { title: '诊断', dataIndex: 'mainDiagnosis', ellipsis: true },
            {
              title: '紧急程度',
              dataIndex: 'urgency',
              width: 90,
              render: (urgency: string) => (
                <Tag color={urgency === '危急' ? 'red' : urgency === '紧急' ? 'orange' : urgency === '普通' ? 'green' : 'default'}>
                  {urgency}
                </Tag>
              )
            },
            { title: '申请医生', dataIndex: 'applyDoctor', width: 100 },
            {
              title: '申请时间',
              dataIndex: 'applyTime',
              width: 160,
              render: (t: string) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-'
            },
            {
              title: '操作',
              key: 'action',
              width: 100,
              fixed: 'right',
              render: (_, record) => (
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/consultation/detail/${record.id}`)}
                  block
                >
                  详情
                </Button>
              )
            }
          ]}
        />
      </Card>

      {/* 已排期列表 */}
      <Card
        title={
          <Space>
            <CheckCircleOutlined />
            <span>已排期会诊</span>
            <Tag color="green">{scheduledConsultations.length}</Tag>
          </Space>
        }
      >
        <Table
          dataSource={scheduledConsultations}
          rowKey="id"
          columns={[
            {
              title: '患者信息',
              dataIndex: 'patientName',
              render: (name, record) => (
                <Space>
                  <Avatar icon={<UserOutlined />} size="small" />
                  <div>
                    <div>{name}</div>
                    <div className="text-xs text-gray-500">{record.patientInpatientNo}</div>
                  </div>
                </Space>
              )
            },
            {
              title: '诊断',
              dataIndex: 'mainDiagnosis',
              ellipsis: true
            },
            {
              title: '会诊时间',
              dataIndex: 'scheduleTime',
              render: (scheduleTime, record: any) => (
                <Space>
                  <CalendarOutlined />
                  {scheduleTime || record.expectTime || '-'}
                </Space>
              )
            },
            {
              title: '会诊专家',
              dataIndex: 'experts',
              render: (experts: Expert[]) => (
                <Space wrap>
                  {experts.slice(0, 3).map(e => (
                    <Tag key={e.id}>{e.name}({e.department})</Tag>
                  ))}
                  {experts.length > 3 && <Tag>+{experts.length - 3}人</Tag>}
                </Space>
              )
            },
            {
              title: '操作',
              key: 'action',
              render: (_, record) => (
                <Space>
                  <Button
                    type="link"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleSchedule(record)}
                  >
                    调整
                  </Button>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => navigate(`/consultation/room/${record.id}`)}
                  >
                    进入
                  </Button>
                </Space>
              )
            }
          ]}
        />
      </Card>

      {/* 智能排期 Modal */}
      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <span>
              {reschedulingConsultation ? `${reschedulingConsultation.patientName} - 会诊排期` : '会诊排期'}
            </span>
          </Space>
        }
        open={showScheduler}
        onCancel={() => {
          setShowScheduler(false)
          setReschedulingConsultation(null)
        }}
        footer={null}
        width={800}
      >
        {reschedulingConsultation && (
          <IntelligentScheduler
            experts={reschedulingConsultation.experts}
            scheduledEvents={scheduledEvents}
            expertAvailability={expertAvailability}
            mode={reschedulingConsultation.status === '待科室审核' ? 'schedule' : 'reschedule'}
            existingConsultation={reschedulingConsultation}
            onSchedule={handleConfirmSchedule}
          />
        )}
      </Modal>

      <Drawer
        title="患者详细信息"
        placement="right"
        width={1200}
        open={patientDrawerVisible}
        onClose={() => setPatientDrawerVisible(false)}
      >
        <PatientInfo
          patientId={selectedPatientId}
          patientName={selectedPatientName}
          patientInpatientNo={selectedPatientInpatientNo}
          compact={false}
        />
      </Drawer>
    </div>
  )
}
