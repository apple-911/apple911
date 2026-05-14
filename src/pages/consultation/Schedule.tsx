import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Calendar, Badge, List, Avatar, Tag, Space, Button, Modal, DatePicker, message, Typography, Tabs, Table, Drawer, Result, Select, Input } from 'antd'
import { PlusOutlined, TeamOutlined, CalendarOutlined, EditOutlined, ClockCircleOutlined, CheckCircleOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons'
import { supabase } from '../../lib/supabase'
import dayjs from 'dayjs'
import IntelligentScheduler from '../../components/IntelligentScheduler'
import PatientInfo from '../../components/PatientInfo'
import { hasPermission } from '../../utils/helpers'
import { getUrgencyName } from '../../utils/codeTable'

const { Title, Text } = Typography
const { Option } = Select

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
  auditTime?: string  // 审批时间
}

interface Expert {
  id: string
  name: string
  department: string
  title: string
  status: '空闲' | '忙碌' | '离线'
  specialty: string
}

interface Filters {
  patientName: string
  applyDoctor: string
  urgency: string
  status: string
  department: string
  applyDateStart: dayjs.Dayjs | null
  applyDateEnd: dayjs.Dayjs | null
  auditDateStart: dayjs.Dayjs | null
  auditDateEnd: dayjs.Dayjs | null
}

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs())
  const [scheduledConsultations, setScheduledConsultations] = useState<ScheduleConsultation[]>([])
  const [loading, setLoading] = useState(true)
  const [reschedulingConsultation, setReschedulingConsultation] = useState<ScheduleConsultation | null>(null)
  const [showScheduler, setShowScheduler] = useState(false)
  const [patientDrawerVisible, setPatientDrawerVisible] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [selectedPatientName, setSelectedPatientName] = useState<string>('')
  const [selectedPatientInpatientNo, setSelectedPatientInpatientNo] = useState<string>('')
  const [scheduledEvents, setScheduledEvents] = useState<any[]>([])
  const [expertAvailability, setExpertAvailability] = useState<any[]>([])
  const [filters, setFilters] = useState<Filters>({
    patientName: '',
    applyDoctor: '',
    urgency: '',
    status: 'secretary_pending', // 默认筛选待秘书审核
    department: '',
    applyDateStart: null,
    applyDateEnd: null,
    auditDateStart: null,
    auditDateEnd: null,
  })
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

      // 获取会诊数据（默认只加载待秘书审核的，如果筛选了其他状态则加载所有）
      let query = supabase.from('consultations').select('*')
      
      // 如果筛选状态为空或为"待秘书审核"，则只加载待秘书审核的
      if (!filters.status || filters.status === '待秘书审核') {
        query = query.eq('status', 'secretary_pending')
      }
      
      const { data: allConsultations, error: consultationsError } = await query.order('apply_time', { ascending: false })

      if (consultationsError) throw consultationsError

      const allList: ScheduleConsultation[] = (allConsultations || []).map(c => {
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
          auditTime: c.audit_time ? dayjs(c.audit_time).format('YYYY-MM-DD HH:mm') : '',
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

      setScheduledConsultations(allList)
    } catch (error) {
      console.error('加载排期数据失败:', error)
      message.error('加载排期数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 筛选数据
  const filterData = (data: ScheduleConsultation[]) => {
    return data.filter(item => {
      // 患者姓名筛选
      if (filters.patientName && !item.patientName.toLowerCase().includes(filters.patientName.toLowerCase())) {
        return false
      }
      
      // 申请医生筛选
      if (filters.applyDoctor && !item.applyDoctor.toLowerCase().includes(filters.applyDoctor.toLowerCase())) {
        return false
      }
      
      // 科室筛选
      if (filters.department && !item.department.toLowerCase().includes(filters.department.toLowerCase())) {
        return false
      }
      
      // 紧急程度筛选
      if (filters.urgency && item.urgency !== filters.urgency) {
        return false
      }
      
      // 审批状态筛选
      if (filters.status) {
        // filters.status 是英文状态码，直接比较
        if (item.status !== filters.status) {
          return false
        }
      }
      
      // 申请日期筛选
      if (filters.applyDateStart && dayjs(item.applyTime).isBefore(filters.applyDateStart.startOf('day'))) {
        return false
      }
      if (filters.applyDateEnd && dayjs(item.applyTime).isAfter(filters.applyDateEnd.endOf('day'))) {
        return false
      }
      
      // 审批日期筛选
      if (filters.auditDateStart && item.auditTime && dayjs(item.auditTime).isBefore(filters.auditDateStart.startOf('day'))) {
        return false
      }
      if (filters.auditDateEnd && item.auditTime && dayjs(item.auditTime).isAfter(filters.auditDateEnd.endOf('day'))) {
        return false
      }
      
      return true
    })
  }

  const filteredData = filterData(scheduledConsultations)

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
  const handleConfirmSchedule = async (date: dayjs.Dayjs, time: string, selectedExperts: Expert[]) => {
    if (!reschedulingConsultation) return
    
    try {
      const datetime = date.format('YYYY-MM-DD') + ' ' + time
      
      // 更新会诊排期时间
      const { error: updateError } = await supabase
        .from('consultations')
        .update({ 
          expect_time: datetime,
          schedule_time: datetime,
          status: '待专家确认'
        })
        .eq('id', reschedulingConsultation.id)
      
      if (updateError) throw updateError
      
      // 更新会诊专家关联
      if (selectedExperts.length > 0) {
        // 删除旧的专家关联
        await supabase
          .from('consultation_experts')
          .delete()
          .eq('consultation_id', reschedulingConsultation.id)
        
        // 插入新的专家关联，包含 invite_time
        const consultationExperts = selectedExperts.map(expert => ({
          consultation_id: reschedulingConsultation.id,
          expert_id: expert.id,
          invite_time: new Date().toISOString(),
          status: '待接受', // 初始状态为待接受
        }))
        
        const { error: insertError } = await supabase
          .from('consultation_experts')
          .insert(consultationExperts)
        
        if (insertError) throw insertError
      }
      
      message.success(`排期成功！会诊时间：${datetime}`)
      setShowScheduler(false)
      setReschedulingConsultation(null)
      
      // 重新加载数据
      loadConsultations()
    } catch (error) {
      console.error('排期失败:', error)
      message.error('排期失败')
    }
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

      {/* 筛选条件 */}
      <Card>
        <Space wrap size="middle" style={{ width: '100%' }}>
          <Space>
            <span>患者姓名：</span>
            <Input
              placeholder="请输入患者姓名"
              value={filters.patientName}
              onChange={(e) => setFilters({ ...filters, patientName: e.target.value })}
              style={{ width: 150 }}
              allowClear
            />
          </Space>
          <Space>
            <span>申请医生：</span>
            <Input
              placeholder="请输入申请医生"
              value={filters.applyDoctor}
              onChange={(e) => setFilters({ ...filters, applyDoctor: e.target.value })}
              style={{ width: 150 }}
              allowClear
            />
          </Space>
          <Space>
            <span>科室：</span>
            <Input
              placeholder="请输入科室"
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              style={{ width: 150 }}
              allowClear
            />
          </Space>
          <Space>
            <span>紧急程度：</span>
            <Select
              placeholder="请选择"
              value={filters.urgency || undefined}
              onChange={(value) => setFilters({ ...filters, urgency: value })}
              allowClear
              style={{ width: 120 }}
            >
              <Option value="普通">普通</Option>
              <Option value="紧急">紧急</Option>
              <Option value="特急">特急</Option>
            </Select>
          </Space>
          <Space>
            <span>审批状态：</span>
            <Select
              placeholder="请选择"
              value={filters.status || undefined}
              onChange={(value) => setFilters({ ...filters, status: value })}
              allowClear
              style={{ width: 150 }}
            >
              <Option value="doctor_submit">医生提交</Option>
              <Option value="secretary_pending">待秘书审核</Option>
              <Option value="director_pending">待主任审核</Option>
              <Option value="director_approved">主任通过</Option>
              <Option value="director_rejected">主任驳回</Option>
              <Option value="待专家确认">待专家确认</Option>
              <Option value="专家邀请">专家邀请</Option>
              <Option value="专家确认">专家确认</Option>
              <Option value="待会诊">待会诊</Option>
              <Option value="会诊中">会诊中</Option>
              <Option value="scheduled">已排期</Option>
              <Option value="已完成">已完成</Option>
              <Option value="已归档">已归档</Option>
              <Option value="已取消">已取消</Option>
            </Select>
          </Space>
          <Space>
            <span>申请时间：</span>
            <DatePicker.RangePicker
              value={[filters.applyDateStart, filters.applyDateEnd]}
              onChange={(dates) => {
                setFilters({
                  ...filters,
                  applyDateStart: dates?.[0] || null,
                  applyDateEnd: dates?.[1] || null,
                })
              }}
            />
          </Space>
          <Space>
            <span>审批时间：</span>
            <DatePicker.RangePicker
              value={[filters.auditDateStart, filters.auditDateEnd]}
              onChange={(dates) => {
                setFilters({
                  ...filters,
                  auditDateStart: dates?.[0] || null,
                  auditDateEnd: dates?.[1] || null,
                })
              }}
            />
          </Space>
        </Space>
      </Card>

      {/* 合并后的列表 */}
      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            <span>会诊列表</span>
            <Tag color="blue">{filteredData.length}</Tag>
          </Space>
        }
      >
        <Table
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 1600 }}
          columns={[
            { title: '患者姓名', dataIndex: 'patientName', width: 100 },
            { title: '住院号', dataIndex: 'patientInpatientNo', width: 140 },
            { title: '科室', dataIndex: 'department', width: 120 },
            { title: '诊断', dataIndex: 'mainDiagnosis', ellipsis: true, width: 200 },
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
            {
              title: '审批状态',
              dataIndex: 'status',
              width: 120,
              render: (status: string) => {
                const statusMap: Record<string, string> = {
                  'doctor_submit': '医生提交',
                  'secretary_pending': '待秘书审核',
                  'director_pending': '待主任审核',
                  'director_approved': '主任通过',
                  'director_rejected': '主任驳回',
                  'expert_pending': '待专家确认',
                  '待专家确认': '待专家确认',
                  '专家邀请': '专家邀请',
                  '专家确认': '专家确认',
                  '待会诊': '待会诊',
                  '会诊中': '会诊中',
                  'scheduled': '已排期',
                  '已完成': '已完成',
                  '已归档': '已归档',
                  '已取消': '已取消',
                  'pending_supplement': '待补正',
                  'material_rejected': '材料驳回',
                  'expert_confirmed': '专家已确认',
                  'in_progress': '进行中',
                  'completed': '已完成',
                  'archived': '已归档',
                  'cancelled': '已取消',
                  'rejected': '已驳回',
                }
                const statusColors: Record<string, string> = {
                  'doctor_submit': 'blue',
                  'secretary_pending': 'orange',
                  'director_pending': 'orange',
                  'director_approved': 'green',
                  'director_rejected': 'red',
                  'expert_pending': 'blue',
                  '待专家确认': 'blue',
                  '专家邀请': 'cyan',
                  '专家确认': 'green',
                  '待会诊': 'purple',
                  '会诊中': 'red',
                  'scheduled': 'blue',
                  '已完成': 'green',
                  'completed': 'green',
                  '已归档': 'gray',
                  'archived': 'gray',
                  '已取消': 'default',
                  'cancelled': 'default',
                  'pending_supplement': 'orange',
                  'material_rejected': 'orange',
                  'expert_confirmed': 'green',
                  'in_progress': 'red',
                  'rejected': 'red',
                }
                const label = statusMap[status] || status
                return <Tag color={statusColors[status] || 'default'}>{label}</Tag>
              }
            },
            { title: '申请医生', dataIndex: 'applyDoctor', width: 100 },
            {
              title: '申请时间',
              dataIndex: 'applyTime',
              width: 160,
              render: (t: string) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-'
            },
            {
              title: '审批时间',
              dataIndex: 'auditTime',
              width: 160,
              render: (t: string) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-'
            },
            {
              title: '会诊时间',
              dataIndex: 'scheduleTime',
              width: 160,
              render: (t: string, record: any) => (t || record.expectTime) ? dayjs(t || record.expectTime).format('YYYY-MM-DD HH:mm') : '-'
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
