import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Table, Tag, Space, Typography, Button, message, Modal, Input, DatePicker, TimePicker, Select, Spin, Statistic, Tabs } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, CalendarOutlined, BellOutlined, EyeOutlined, FileTextOutlined, SearchOutlined, ReloadOutlined, TeamOutlined } from '@ant-design/icons'
import { useAppStore } from '../../stores/appStore'
import { supabase } from '../../lib/supabase'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { getUrgencyName, getDepartmentName, getDepartmentNames, getConsultationTypeName, getConsultationTypeColor, getConsultationStatusName } from '../../utils/codeTable'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

interface PendingReview {
  id: string
  consultationCode: string
  patientName: string
  patientInpatientNo: string
  type: string
  department: string
  diagnosis: string
  urgency: '普通' | '紧急' | '危急'
  applicant: string
  applyTime: string
  expectTime: string
  expertNames: string[]
  status: string
  urgencyCode?: string
}

interface MyApplication {
  id: string
  consultationCode: string
  patientName: string
  type: string
  urgency: string
  createTime: string
  expectTime: string
  meetingTime: string
  diagnosis: string
  expertNames: string[]
  status: string
  department: string
}

interface Filters {
  patientName: string
  applicant: string
  urgency: string
  applyDateStart: dayjs.Dayjs | null
  applyDateEnd: dayjs.Dayjs | null
  status: string
  type: string
}

export default function SecretaryWorkbench() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ pending: 0, scheduled: 0, completed: 0 })
  const [pendingList, setPendingList] = useState<PendingReview[]>([])
  const [myApplications, setMyApplications] = useState<MyApplication[]>([])
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null)
  const [scheduleData, setScheduleData] = useState({
    expect_time: '',
    meeting_room: '',
    notes: '',
  })
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [experts, setExperts] = useState<any[]>([])
  const [selectedExperts, setSelectedExperts] = useState<string[]>([])
  
  // 我的申请筛选
  const [filters, setFilters] = useState<Filters>({
    patientName: '',
    applicant: '',
    urgency: '',
    applyDateStart: null,
    applyDateEnd: null,
    status: '',
    type: '',
  })
  const [filterLoading, setFilterLoading] = useState(false)
  
  // 待秘书审核筛选
  const [pendingFilters, setPendingFilters] = useState<Filters>({
    patientName: '',
    applicant: '',
    urgency: '',
    applyDateStart: null,
    applyDateEnd: null,
    status: '',
    type: '',
  })
  const [pendingFilterLoading, setPendingFilterLoading] = useState(false)

  useEffect(() => {
    loadPendingReviews()
    loadExperts()
    loadMyApplications()
  }, [])

  const loadExperts = async () => {
    const { data } = await supabase.from('experts').select('*').eq('status', 'active')
    if (data) setExperts(data)
  }

  const loadMyApplications = async () => {
    try {
      setFilterLoading(true)
      
      // 查询秘书提交的会诊申请
      const { data: consultations, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('source', 'secretary')
        .order('apply_time', { ascending: false })
      
      if (error) throw error
      
      // 批量获取科室名称
      const orgIds = consultations.map(c => c.department).filter(Boolean)
      const deptNameMap = await getDepartmentNames(orgIds)
      
      // 获取会诊专家关联和专家信息
      const consultationIds = consultations.map(c => c.id)
      const { data: consultationExperts, error: ceError } = await supabase
        .from('consultation_experts')
        .select('consultation_id, expert_id')
        .in('consultation_id', consultationIds)
      
      const expertIds = consultationExperts?.map(ce => ce.expert_id) || []
      const { data: experts, error: expertsError } = await supabase
        .from('experts')
        .select('id, name')
        .in('id', expertIds)
      
      const expertMap = new Map(experts?.map(e => [e.id, e.name]) || [])
      const consultationExpertMap = new Map<string, string[]>()
      consultationExperts?.forEach(ce => {
        if (!consultationExpertMap.has(ce.consultation_id)) {
          consultationExpertMap.set(ce.consultation_id, [])
        }
        const expertName = expertMap.get(ce.expert_id)
        if (expertName) {
          consultationExpertMap.get(ce.consultation_id)!.push(expertName)
        }
      })
      
      const applications: MyApplication[] = (consultations || []).map(item => {
        console.log('会诊记录:', item.id, 'meeting_time:', item.meeting_time, 'expect_time:', item.expect_time)
        return {
          id: item.id,
          consultationCode: item.consultation_code || '',
          patientName: item.patient_name,
          type: getConsultationTypeName(item.type || 'inhospital'),
          urgency: getUrgencyName(item.urgency),
          createTime: item.apply_time,
          expectTime: item.expect_time ? dayjs(item.expect_time).format('YYYY-MM-DD HH:mm') : '-',
          meetingTime: item.meeting_time ? dayjs(item.meeting_time).format('YYYY-MM-DD HH:mm') : '-',
          diagnosis: item.main_diagnosis,
          expertNames: consultationExpertMap.get(item.id) || [],
          status: getConsultationStatusName(item.status),
          department: deptNameMap.get(item.department) || item.department || '',
        }
      })
      
      setMyApplications(applications)
    } catch (err) {
      console.error('加载我的申请失败:', err)
    } finally {
      setFilterLoading(false)
    }
  }

  const loadPendingReviews = async () => {
    try {
      setLoading(true)
      
      // 查询待秘书审核的会诊（支持中文和英文状态码）
      const { data: consultations, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('status', 'secretary_pending')
        .order('apply_time', { ascending: false })
      
      if (error) throw error
      
      // 批量获取科室名称
      const orgIds = consultations.map(c => c.department).filter(Boolean)
      const deptNameMap = await getDepartmentNames(orgIds)
      
      // 获取会诊专家关联和专家信息
      const consultationIds = consultations.map(c => c.id)
      const { data: consultationExperts, error: ceError } = await supabase
        .from('consultation_experts')
        .select('consultation_id, expert_id')
        .in('consultation_id', consultationIds)
      
      const expertIds = consultationExperts?.map(ce => ce.expert_id) || []
      const { data: experts, error: expertsError } = await supabase
        .from('experts')
        .select('id, name')
        .in('id', expertIds)
      
      const expertMap = new Map(experts?.map(e => [e.id, e.name]) || [])
      const consultationExpertMap = new Map<string, string[]>()
      consultationExperts?.forEach(ce => {
        if (!consultationExpertMap.has(ce.consultation_id)) {
          consultationExpertMap.set(ce.consultation_id, [])
        }
        const expertName = expertMap.get(ce.expert_id)
        if (expertName) {
          consultationExpertMap.get(ce.consultation_id)!.push(expertName)
        }
      })
      
      const pendingReviews: PendingReview[] = (consultations || []).map(item => ({
        id: item.id,
        consultationCode: item.consultation_code || '',
        patientName: item.patient_name,
        patientInpatientNo: item.patient_inpatient_no,
        type: getConsultationTypeName(item.type || 'inhospital'),
        department: deptNameMap.get(item.department) || item.department || '',
        diagnosis: item.main_diagnosis,
        urgency: getUrgencyName(item.urgency) as '普通' | '紧急' | '危急',
        applicant: item.apply_doctor,
        applyTime: item.apply_time,
        expectTime: item.expect_time ? dayjs(item.expect_time).format('YYYY-MM-DD HH:mm') : '-',
        expertNames: consultationExpertMap.get(item.id) || [],
        status: getConsultationStatusName(item.status),
        urgencyCode: item.urgency,
      }))
      
      // 前端排序：先按紧急程度（危急 > 紧急 > 普通），再按申请时间（新的在前）
      const urgencyPriority: Record<string, number> = {
        'critical': 3,  // 危急
        'urgent': 2,    // 紧急
        'normal': 1,    // 普通
      }
      
      pendingReviews.sort((a, b) => {
        // 先按紧急程度排序
        const urgencyDiff = (urgencyPriority[b.urgencyCode || 'normal'] || 1) - (urgencyPriority[a.urgencyCode || 'normal'] || 1)
        if (urgencyDiff !== 0) return urgencyDiff
        
        // 紧急程度相同，按申请时间排序（新的在前）
        return new Date(b.applyTime).getTime() - new Date(a.applyTime).getTime()
      })
      
      // 移除排序用的 urgencyCode 字段
      const sortedReviews = pendingReviews.map(({ urgencyCode, ...rest }) => rest)
      
      setPendingList(sortedReviews)
      setStats({
        pending: consultations?.length || 0,
        scheduled: 0,
        completed: 0,
      })
    } catch (err) {
      console.error('加载失败:', err)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSchedule = (consultation: any) => {
    setSelectedConsultation(consultation)
    setScheduleModalVisible(true)
  }

  const handleCancelApplication = async (consultationId: string) => {
    Modal.confirm({
      title: '确认撤销',
      content: '确定要撤销该会诊申请吗？',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          await supabase
            .from('consultations')
            .update({ status: 'cancelled' })
            .eq('id', consultationId)
          
          message.success('申请已撤销')
          loadMyApplications()
        } catch (err) {
          console.error('撤销申请失败:', err)
          message.error('撤销申请失败')
        }
      },
    })
  }

  // 筛选我的申请
  const filterApplications = () => {
    let filtered = [...myApplications]
    
    // 患者名称筛选
    if (filters.patientName) {
      filtered = filtered.filter(app => 
        app.patientName.toLowerCase().includes(filters.patientName.toLowerCase())
      )
    }
    
    // 申请医生筛选
    if (filters.applicant) {
      filtered = filtered.filter(app => 
        app.department.toLowerCase().includes(filters.applicant.toLowerCase())
      )
    }
    
    // 紧急程度筛选
    if (filters.urgency) {
      filtered = filtered.filter(app => app.urgency === filters.urgency)
    }
    
    // 申请日期筛选
    if (filters.applyDateStart) {
      const startDate = filters.applyDateStart.startOf('day')
      filtered = filtered.filter(app => 
        dayjs(app.createTime).isAfter(startDate) || dayjs(app.createTime).isSame(startDate)
      )
    }
    if (filters.applyDateEnd) {
      const endDate = filters.applyDateEnd.endOf('day')
      filtered = filtered.filter(app => 
        dayjs(app.createTime).isBefore(endDate) || dayjs(app.createTime).isSame(endDate)
      )
    }
    
    // 会诊类型筛选
    if (filters.type) {
      filtered = filtered.filter(app => app.type === filters.type)
    }
    
    return filtered
  }

  const resetFilters = () => {
    setFilters({
      patientName: '',
      applicant: '',
      urgency: '',
      applyDateStart: null,
      applyDateEnd: null,
      status: '',
      type: '',
    })
  }

  // 筛选待秘书审核
  const filterPendingReviews = () => {
    let filtered = [...pendingList]
    
    // 患者名称筛选
    if (pendingFilters.patientName) {
      filtered = filtered.filter(app => 
        app.patientName.toLowerCase().includes(pendingFilters.patientName.toLowerCase())
      )
    }
    
    // 申请医生筛选
    if (pendingFilters.applicant) {
      filtered = filtered.filter(app => 
        app.applicant.toLowerCase().includes(pendingFilters.applicant.toLowerCase())
      )
    }
    
    // 紧急程度筛选
    if (pendingFilters.urgency) {
      filtered = filtered.filter(app => app.urgency === pendingFilters.urgency)
    }
    
    // 申请日期筛选
    if (pendingFilters.applyDateStart) {
      const startDate = pendingFilters.applyDateStart.startOf('day')
      filtered = filtered.filter(app => 
        dayjs(app.applyTime).isAfter(startDate) || dayjs(app.applyTime).isSame(startDate)
      )
    }
    if (pendingFilters.applyDateEnd) {
      const endDate = pendingFilters.applyDateEnd.endOf('day')
      filtered = filtered.filter(app => 
        dayjs(app.applyTime).isBefore(endDate) || dayjs(app.applyTime).isSame(endDate)
      )
    }
    
    // 审批状态筛选
    if (pendingFilters.status) {
      filtered = filtered.filter(app => app.status === pendingFilters.status)
    }
    
    // 会诊类型筛选
    if (pendingFilters.type) {
      filtered = filtered.filter(app => app.type === pendingFilters.type)
    }
    
    return filtered
  }

  const resetPendingFilters = () => {
    setPendingFilters({
      patientName: '',
      applicant: '',
      urgency: '',
      applyDateStart: null,
      applyDateEnd: null,
      status: '',
      type: '',
    })
  }

  const submitSchedule = async () => {
    if (!selectedConsultation) return
    
    try {
      setScheduleLoading(true)
      
      // 更新会诊状态和时间
      await supabase
        .from('consultations')
        .update({ 
          status: 'pending_meeting',
          expect_time: scheduleData.expect_time,
          meeting_room: scheduleData.meeting_room,
        })
        .eq('id', selectedConsultation.id)
      
      // 插入审核历史
      const auditInsert: {
        consultation_id: string
        operator?: string
        operator_id?: string
        operator_role: string
        node: string
        operator_type: string
        result: string
        opinion?: string
        time: string
        next_node: string
      } = {
        consultation_id: selectedConsultation.id,
        operator: user?.name,
        operator_role: 'MDT 秘书',
        node: '秘书审核',
        operator_type: '通过',
        result: '通过',
        opinion: scheduleData.notes,
        time: new Date().toISOString(),
        next_node: '会诊中',
      }
      
      // 如果用户有 ID 且是 UUID 格式，才添加 operator_id
      if (user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
        auditInsert.operator_id = user.id
      }
      
      await supabase
        .from('audit_history')
        .insert(auditInsert)

      // 保存选中的专家
      if (selectedExperts.length > 0) {
        const expertInserts = selectedExperts.map(expertId => ({
          consultation_id: selectedConsultation.id,
          expert_id: expertId,
          status: 'pending_meeting',
        }))
        await supabase.from('consultation_experts').insert(expertInserts)
      }

      message.success('会诊已安排')
      setScheduleModalVisible(false)
      setScheduleData({ expect_time: '', meeting_room: '', notes: '' })
      setSelectedExperts([])
      loadPendingReviews()
    } catch (err) {
      console.error('安排失败:', err)
      message.error('安排会诊失败')
    } finally {
      setScheduleLoading(false)
    }
  }

  const pendingColumns: ColumnsType<PendingReview> = [
    {
      title: '会诊 ID',
      dataIndex: 'consultationCode',
      key: 'consultationCode',
      width: 120,
      render: (code) => <Tag color="blue">{code || '-'}</Tag>,
    },
    { title: '患者姓名', dataIndex: 'patientName', width: 100 },
    { 
      title: '会诊类型', 
      dataIndex: 'type', 
      key: 'type', 
      width: 100,
      render: (t) => {
        const color = t === '院内会诊' ? 'blue' : 'green'
        return <Tag color={color}>{t}</Tag>
      }
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 90,
      render: (urgency) => {
        const colorMap: Record<string, string> = {
          '危急': 'red',
          '紧急': 'orange',
          '普通': 'green',
        }
        const color = colorMap[urgency] || 'default'
        return <Tag color={color}>{urgency}</Tag>
      },
    },
    { 
      title: '申请时间', 
      dataIndex: 'applyTime', 
      key: 'applyTime', 
      width: 150,
      render: (t) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
    { 
      title: '期望时间', 
      dataIndex: 'expectTime', 
      key: 'expectTime', 
      width: 150,
      render: (t) => t || '-',
    },
    { title: '主要诊断', dataIndex: 'diagnosis', key: 'diagnosis', ellipsis: true, width: 150 },
    {
      title: '邀请专家',
      dataIndex: 'expertNames',
      key: 'expertNames',
      width: 150,
      render: (names: string[]) => {
        if (!names || names.length === 0) return <Text type="secondary">未邀请</Text>
        return (
          <Space wrap>
            {names.map((name: string, idx: number) => (
              <Tag key={idx} color="blue">{name}</Tag>
            ))}
          </Space>
        )
      },
    },
    {
      title: '审批状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap: Record<string, string> = {
          '医生提交': 'blue',
          '待主任审核': 'orange',
          '主任通过': 'green',
          '主任驳回': 'red',
          '秘书审核': 'purple',
          '待补正': 'orange',
          '已排期': 'blue',
          '会诊中': 'processing',
          '已完成': 'green',
        }
        return <Tag color={statusMap[status] || 'default'}>{status}</Tag>
      },
    },
    { title: '申请医生', dataIndex: 'applicant', width: 100 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/consultation/detail/${record.id}`)}
          >
            详情
          </Button>
        </Space>
      )
    },
  ]

  const applicationColumns: ColumnsType<MyApplication> = [
    {
      title: '会诊 ID',
      dataIndex: 'consultationCode',
      key: 'consultationCode',
      width: 120,
      render: (code) => <Tag color="blue">{code || '-'}</Tag>,
    },
    { title: '患者姓名', dataIndex: 'patientName', key: 'patientName', width: 100 },
    { 
      title: '会诊类型', 
      dataIndex: 'type', 
      key: 'type', 
      width: 100,
      render: (t) => {
        const color = t === '院内会诊' ? 'blue' : 'green'
        return <Tag color={color}>{t}</Tag>
      }
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 90,
      render: (urgency) => {
        const colorMap: Record<string, string> = {
          '危急': 'red',
          '紧急': 'orange',
          '普通': 'green',
        }
        const color = colorMap[urgency] || 'default'
        return <Tag color={color}>{urgency}</Tag>
      },
    },
    { 
      title: '申请时间', 
      dataIndex: 'createTime', 
      key: 'createTime', 
      width: 150,
      render: (t) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-',
    },
    { 
      title: '会诊时间', 
      dataIndex: 'meetingTime', 
      key: 'meetingTime', 
      width: 150,
      render: (t) => t || '-',
    },
    { title: '主要诊断', dataIndex: 'diagnosis', key: 'diagnosis', ellipsis: true, width: 150 },
    {
      title: '邀请专家',
      dataIndex: 'expertNames',
      key: 'expertNames',
      width: 150,
      render: (names: string[]) => {
        if (!names || names.length === 0) return <Text type="secondary">未邀请</Text>
        return (
          <Space wrap>
            {names.map((name: string, idx: number) => (
              <Tag key={idx} color="blue">{name}</Tag>
            ))}
          </Space>
        )
      },
    },
    {
          title: '操作',
          key: 'action',
          width: 120,
          fixed: 'right',
          render: (_, record) => (
            <Space size="small">
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/consultation/detail/${record.id}`)}
              >
                详情
              </Button>
            </Space>
          ),
        },
  ]

  return (
    <Spin spinning={loading}>
      <div className="space-y-4">
        <Title level={4}>MDT 秘书工作台</Title>

        {/* 统计卡片 */}
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic 
                title="待安排会诊" 
                value={stats.pending} 
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic 
                title="已安排会诊" 
                value={stats.scheduled} 
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic 
                title="已完成" 
                value={stats.completed} 
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 待安排列表 */}
        <Card title="待秘书审核会诊">
          {/* 筛选器 */}
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Row gutter={[16, 16]}>
                <Col span={4}>
                  <Input
                    placeholder="患者名称"
                    value={pendingFilters.patientName}
                    onChange={(e) => setPendingFilters({ ...pendingFilters, patientName: e.target.value })}
                    prefix={<SearchOutlined />}
                    allowClear
                  />
                </Col>
                <Col span={3}>
                  <Input
                    placeholder="申请医生"
                    value={pendingFilters.applicant}
                    onChange={(e) => setPendingFilters({ ...pendingFilters, applicant: e.target.value })}
                    prefix={<SearchOutlined />}
                    allowClear
                  />
                </Col>
                <Col span={3}>
                  <Select
                    placeholder="紧急程度"
                    value={pendingFilters.urgency || undefined}
                    onChange={(value) => setPendingFilters({ ...pendingFilters, urgency: value })}
                    allowClear
                    style={{ width: '100%' }}
                  >
                    <Option value="危急">危急</Option>
                    <Option value="紧急">紧急</Option>
                    <Option value="普通">普通</Option>
                  </Select>
                </Col>
                <Col span={6}>
                  <Space.Compact style={{ width: '100%' }}>
                    <DatePicker
                      value={pendingFilters.applyDateStart}
                      onChange={(date) => setPendingFilters({ ...pendingFilters, applyDateStart: date })}
                      placeholder="开始日期"
                      style={{ width: '50%' }}
                    />
                    <span className="px-2 text-gray-400">-</span>
                    <DatePicker
                      value={pendingFilters.applyDateEnd}
                      onChange={(date) => setPendingFilters({ ...pendingFilters, applyDateEnd: date })}
                      placeholder="结束日期"
                      style={{ width: '50%' }}
                    />
                  </Space.Compact>
                </Col>
                <Col span={3}>
                  <Select
                    placeholder="审批状态"
                    value={pendingFilters.status || undefined}
                    onChange={(value) => setPendingFilters({ ...pendingFilters, status: value })}
                    allowClear
                    style={{ width: '100%' }}
                  >
                    <Option value="医生提交">医生提交</Option>
                    <Option value="待主任审核">待主任审核</Option>
                    <Option value="主任通过">主任通过</Option>
                    <Option value="主任驳回">主任驳回</Option>
                    <Option value="秘书审核">秘书审核</Option>
                    <Option value="待补正">待补正</Option>
                    <Option value="已排期">已排期</Option>
                    <Option value="会诊中">会诊中</Option>
                    <Option value="已完成">已完成</Option>
                  </Select>
                </Col>
                <Col span={3}>
                  <Select
                    placeholder="会诊类型"
                    value={pendingFilters.type || undefined}
                    onChange={(value) => setPendingFilters({ ...pendingFilters, type: value })}
                    allowClear
                    style={{ width: '100%' }}
                  >
                    <Option value="院内会诊">院内会诊</Option>
                    <Option value="远程会诊">远程会诊</Option>
                  </Select>
                </Col>
                <Col span={2}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<SearchOutlined />}
                      onClick={() => loadPendingReviews()}
                    >
                      查询
                    </Button>
                    <Button 
                      icon={<ReloadOutlined />}
                      onClick={resetPendingFilters}
                    >
                      重置
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Space>
          </div>

          {/* 待审核列表表格 */}
          <Table
            columns={pendingColumns}
            dataSource={filterPendingReviews()}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1400 }}
            loading={pendingFilterLoading}
          />
        </Card>

        {/* 我的申请列表 */}
        <Card
          title={
            <Space>
              <FileTextOutlined />
              <span>我的申请</span>
            </Space>
          }
        >
          {/* 筛选器 */}
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Row gutter={[16, 16]}>
                <Col span={4}>
                  <Input
                    placeholder="患者名称"
                    value={filters.patientName}
                    onChange={(e) => setFilters({ ...filters, patientName: e.target.value })}
                    prefix={<SearchOutlined />}
                    allowClear
                  />
                </Col>
                <Col span={3}>
                  <Select
                    placeholder="紧急程度"
                    value={filters.urgency || undefined}
                    onChange={(value) => setFilters({ ...filters, urgency: value })}
                    allowClear
                    style={{ width: '100%' }}
                  >
                    <Option value="危急">危急</Option>
                    <Option value="紧急">紧急</Option>
                    <Option value="普通">普通</Option>
                  </Select>
                </Col>
                <Col span={6}>
                  <Space.Compact style={{ width: '100%' }}>
                    <DatePicker
                      value={filters.applyDateStart}
                      onChange={(date) => setFilters({ ...filters, applyDateStart: date })}
                      placeholder="申请日期"
                      style={{ width: '50%' }}
                    />
                    <span className="px-2 text-gray-400">-</span>
                    <DatePicker
                      value={filters.applyDateEnd}
                      onChange={(date) => setFilters({ ...filters, applyDateEnd: date })}
                      placeholder="申请日期"
                      style={{ width: '50%' }}
                    />
                  </Space.Compact>
                </Col>
                <Col span={3}>
                  <Select
                    placeholder="会诊类型"
                    value={filters.type || undefined}
                    onChange={(value) => setFilters({ ...filters, type: value })}
                    allowClear
                    style={{ width: '100%' }}
                  >
                    <Option value="院内会诊">院内会诊</Option>
                    <Option value="远程会诊">远程会诊</Option>
                  </Select>
                </Col>
                <Col span={5}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<SearchOutlined />}
                      onClick={() => loadMyApplications()}
                    >
                      查询
                    </Button>
                    <Button 
                      icon={<ReloadOutlined />}
                      onClick={resetFilters}
                    >
                      重置
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Space>
          </div>

          {/* 申请列表表格 */}
          <Table
            columns={applicationColumns}
            dataSource={filterApplications()}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1200 }}
            loading={filterLoading}
          />
        </Card>

        {/* 安排会诊弹窗 */}
        <Modal
          title="安排会诊"
          open={scheduleModalVisible}
          onOk={submitSchedule}
          onCancel={() => {
            setScheduleModalVisible(false)
            setScheduleData({ expect_time: '', meeting_room: '', notes: '' })
            setSelectedExperts([])
          }}
          confirmLoading={scheduleLoading}
          width={700}
        >
          <div className="space-y-4">
            {selectedConsultation && (
              <div>
                <p><strong>患者：</strong>{selectedConsultation.patientName}</p>
                <p><strong>诊断：</strong>{selectedConsultation.diagnosis}</p>
                <p><strong>申请科室：</strong>{selectedConsultation.department}</p>
              </div>
            )}
            <div>
              <strong>会诊时间：</strong>
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
              <Input
                placeholder="请输入会诊地点"
                value={scheduleData.meeting_room}
                onChange={(e) => setScheduleData({ ...scheduleData, meeting_room: e.target.value })}
                style={{ marginTop: 8 }}
              />
            </div>
            <div>
              <strong>选择专家：</strong>
              <Select
                mode="multiple"
                style={{ width: '100%', marginTop: 8 }}
                placeholder="请选择会诊专家"
                value={selectedExperts}
                onChange={setSelectedExperts}
                showSearch
                filterOption={(input, option) =>
                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                }
              >
                {experts.map(expert => (
                  <Select.Option key={expert.id} value={expert.id}>
                    {expert.name} - {expert.department} - {expert.title}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div>
              <strong>备注：</strong>
              <TextArea
                rows={3}
                value={scheduleData.notes}
                onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                placeholder="请输入备注信息..."
                style={{ marginTop: 8 }}
              />
            </div>
          </div>
        </Modal>
      </div>
    </Spin>
  )
}
