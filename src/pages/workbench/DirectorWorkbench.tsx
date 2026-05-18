import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Table, Tag, Space, Typography, Button, message, Modal, Input, Spin, Statistic, Select, DatePicker } from 'antd'
import { AlertOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, EyeOutlined, FileTextOutlined, FireOutlined, TeamOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { useAppStore } from '../../stores/appStore'
import { supabase } from '../../lib/supabase'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { getUrgencyName, getUrgencyColor, getConsultationStatusName } from '../../utils/codeTable'
import { CONSULTATION_STATUS, ROLE } from '../../utils/statusMapping'

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

interface Filters {
  patientName: string
  applicant: string
  urgency: string
  applyDateStart: dayjs.Dayjs | null
  applyDateEnd: dayjs.Dayjs | null
  status: string
  type: string
}

interface PendingReview {
  id: string
  consultationCode: string
  patientName: string
  patientInpatientNo?: string
  department?: string
  diagnosis: string
  type?: string
  urgency: string
  applicant: string
  applyTime: string
  expectTime?: string
  expertCount?: number
  status: string
  directorAuditStatus?: string // 主任审批状态
}

interface MyApplication {
  id: string
  consultationCode: string
  patientName: string
  type: string
  urgency: string
  createTime: string
  expectTime: string
  diagnosis: string
  expertCount: number
  status: string
  directorAuditStatus?: string // 主任审批状态
}

export default function DirectorWorkbench() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ pending: 0, urgent: 0, approved: 0, myApplications: 0 })
  const [pendingList, setPendingList] = useState<PendingReview[]>([])
  const [applications, setApplications] = useState<MyApplication[]>([])
  const [auditModalVisible, setAuditModalVisible] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null)
  const [auditComment, setAuditComment] = useState('')
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditAction, setAuditAction] = useState<'通过' | '拒绝'>('通过')

  // 待审核筛选
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

  // 我的申请筛选
  const [applicationFilters, setApplicationFilters] = useState<Filters>({
    patientName: '',
    applicant: '',
    urgency: '',
    applyDateStart: null,
    applyDateEnd: null,
    status: '',
    type: '',
  })
  const [applicationFilterLoading, setApplicationFilterLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      console.log('当前登录用户:', {
        id: user?.id,
        name: user?.name,
        org_id: user?.org_id,
        department: user?.department,
        role: user?.role,
        position: user?.position
      })
      
      // 获取当前主任所在的科室 org_id
      let directorOrgId = user?.org_id || ''
      
      console.log('主任所在科室 org_id:', directorOrgId)
      console.log('查询条件:', { 
        status: CONSULTATION_STATUS.DOCTOR_SUBMIT,
        department: directorOrgId,
        userRole: user?.role,
        userName: user?.name
      })
      
      // 并行加载两个列表
      const [pendingResult, applicationResult] = await Promise.all([
        supabase
          .from('consultations')
          .select('*')
          .eq('status', CONSULTATION_STATUS.DIRECTOR_PENDING)  // 查询待主任审核的会诊
          .eq('department', directorOrgId)
          .order('urgency', { ascending: false })
          .order('apply_time', { ascending: false }),
        supabase
          .from('consultations')
          .select('*')
          .eq('apply_doctor', user?.name)
          .order('apply_time', { ascending: false })
      ])
      
      console.log('查询结果:', { 
        pendingCount: pendingResult.data?.length, 
        myCount: applicationResult.data?.length,
        directorOrgId,
        pendingData: pendingResult.data?.map(c => ({ 
          patient: c.patient_name, 
          department: c.department, 
          status: c.status 
        })),
        allConsultations: pendingResult.data?.map(c => ({
          patient: c.patient_name,
          applyDoctor: c.apply_doctor,
          department: c.department,
          status: c.status
        }))
      })

      // 处理待审核列表
      if (pendingResult.error) throw pendingResult.error
      
      // 过滤：只显示当前主任负责的会诊
      let filteredConsultations = pendingResult.data || []
      if (user?.org_id && user?.position?.includes('主任')) {
        filteredConsultations = filteredConsultations.filter((c: any) => {
          // 1. 如果是主要责任人（director_id），显示
          if (c.director_id === user.id) return true
          
          // 2. 如果是同科室的主任，也能看到和审批
          if (c.department === user.org_id) return true
          
          return false
        })
      }
      
      // 批量查询科室名称
      const orgIds = new Set<string>()
      filteredConsultations.forEach((c: any) => {
        if (c.department) orgIds.add(c.department)
      })
      
      const orgNameMap: Record<string, string> = {}
      if (orgIds.size > 0) {
        const { data: orgData } = await supabase
          .from('organizations')
          .select('id, name')
          .in('id', Array.from(orgIds))
        
        if (orgData) {
          orgData.forEach(org => {
            orgNameMap[org.id] = org.name
          })
        }
      }
      
      const pendingReviews: PendingReview[] = filteredConsultations.map((item: any) => ({
        id: item.id,
        consultationCode: item.consultation_code || item.id,
        patientName: item.patient_name,
        patientInpatientNo: item.patient_inpatient_no,
        department: orgNameMap[item.department] || item.department, // 使用科室名称显示
        diagnosis: item.main_diagnosis,
        type: item.type === 'internal' ? '院内' : '院外',
        urgency: item.urgency || item.urgency_level || 'normal',
        applicant: item.apply_doctor,
        applyTime: item.apply_time,
        expectTime: item.expect_time ? dayjs(item.expect_time).format('YYYY-MM-DD HH:mm') : '-',
        expertCount: item.experts ? JSON.parse(item.experts).length : 0,
        status: getConsultationStatusName(item.status) || item.status, // 转换为中文
        directorAuditStatus: '待审核', // 待审核列表中的都是待审核状态
      }))
      setPendingList(pendingReviews)
      setStats({
        pending: filteredConsultations.length || 0,
        urgent: filteredConsultations.filter((c: any) => c.urgency === 'urgent' || c.urgency === 'critical').length || 0,
        approved: 0,
        myApplications: applicationResult.data?.length || 0,
      })

      // 处理我的申请列表
      if (applicationResult.error) throw applicationResult.error
      const myApplications: MyApplication[] = (applicationResult.data || []).map((item: any) => {
        // 判断主任审批状态
        let directorAuditStatus = '待审核'
        if (item.status === 'director_rejected') {
          directorAuditStatus = '已驳回'
        } else if (item.status === 'secretary_pending' || item.status === 'expert_pending' || item.status === 'scheduled') {
          directorAuditStatus = '已通过'
        }
        
        return {
          id: item.id,
          consultationCode: item.consultation_code || item.id,
          patientName: item.patient_name,
          type: item.type === 'internal' ? '院内' : '院外',
          urgency: getUrgencyName(item.urgency || item.urgency_level || 'normal'),
          createTime: item.apply_time,
          expectTime: item.expect_time ? dayjs(item.expect_time).format('YYYY-MM-DD HH:mm') : '-',
          diagnosis: item.main_diagnosis,
          expertCount: item.experts ? JSON.parse(item.experts).length : 0,
          status: getConsultationStatusName(item.status) || item.status, // 转换为中文
          directorAuditStatus,
        }
      })
      setApplications(myApplications)

    } catch (err) {
      console.error('加载失败:', err)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 筛选待审核会诊
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

  // 筛选我的申请
  const filterApplications = () => {
    let filtered = [...applications]
    
    // 患者名称筛选
    if (applicationFilters.patientName) {
      filtered = filtered.filter(app => 
        app.patientName.toLowerCase().includes(applicationFilters.patientName.toLowerCase())
      )
    }
    
    // 紧急程度筛选
    if (applicationFilters.urgency) {
      filtered = filtered.filter(app => app.urgency === applicationFilters.urgency)
    }
    
    // 申请日期筛选
    if (applicationFilters.applyDateStart) {
      const startDate = applicationFilters.applyDateStart.startOf('day')
      filtered = filtered.filter(app => 
        dayjs(app.createTime).isAfter(startDate) || dayjs(app.createTime).isSame(startDate)
      )
    }
    if (applicationFilters.applyDateEnd) {
      const endDate = applicationFilters.applyDateEnd.endOf('day')
      filtered = filtered.filter(app => 
        dayjs(app.createTime).isBefore(endDate) || dayjs(app.createTime).isSame(endDate)
      )
    }
    
    // 会诊类型筛选
    if (applicationFilters.type) {
      filtered = filtered.filter(app => app.type === applicationFilters.type)
    }
    
    return filtered
  }

  const resetApplicationFilters = () => {
    setApplicationFilters({
      patientName: '',
      applicant: '',
      urgency: '',
      applyDateStart: null,
      applyDateEnd: null,
      status: '',
      type: '',
    })
  }

  const handleApprove = (consultation: any) => {
    setSelectedConsultation(consultation)
    setAuditAction('通过')
    setAuditModalVisible(true)
  }

  const submitAudit = async (action: '通过' | '拒绝') => {
    if (!selectedConsultation) return
    
    try {
      setAuditLoading(true)
      
      const newStatus = action === '通过' ? 'secretary_pending' : 'rejected'
      await supabase
        .from('consultations')
        .update({ status: newStatus, reject_reason: action === '拒绝' ? auditComment : null })
        .eq('id', selectedConsultation.id)
      
      await supabase
        .from('audit_history')
        .insert({
          consultation_id: selectedConsultation.id,
          operator_id: user?.id,
          operator: user?.name,
          operator_role: 'director',
          node: 'department_audit',
          operator_type: action === '通过' ? 'approved' : 'rejected',
          result: action === '通过' ? 'approved' : 'rejected',
          opinion: auditComment,
          time: new Date().toISOString(),
          next_node: action === '通过' ? 'secretary_audit' : 'archive',
        })
      
      message.success(`${action === '通过' ? '审核通过' : '已驳回'}`)
      setAuditModalVisible(false)
      setAuditComment('')
      loadData()
    } catch (err) {
      console.error('审核失败:', err)
      message.error('审核失败')
    } finally {
      setAuditLoading(false)
    }
  }

  const columns: ColumnsType<PendingReview> = [
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
        const type = t || '院内'
        const color = type === '院内' || type === '院内会诊' ? 'blue' : 'green'
        return <Tag color={color}>{type}</Tag> 
      }
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 100,
      render: (urgency) => {
        // 处理中文值映射为英文代码
        let level = urgency
        const chineseToEnglish: Record<string, string> = {
          '普通': 'normal',
          '紧急': 'urgent',
          '特急': 'critical',
        }
        if (chineseToEnglish[urgency]) {
          level = chineseToEnglish[urgency]
        }
        
        const color = getUrgencyColor(level)
        const name = getUrgencyName(level) || urgency
        
        return <Tag color={color} style={{ fontSize: '12px', padding: '2px 8px' }}>{name}</Tag>
      }
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
      render: (t) => t && t !== '-' ? t : '-',
    },
    { title: '主要诊断', dataIndex: 'diagnosis', key: 'diagnosis', ellipsis: true, width: 200 },
    {
      title: '邀请专家',
      dataIndex: 'expertCount',
      key: 'expertCount',
      width: 100,
      render: (count) => (
        <Space>
          <TeamOutlined />
          <span>{count || 0}位</span>
        </Space>
      ),
    },
    {
      title: '审批状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const colors: Record<string, string> = {
          '医生提交': 'blue',
          '待主任审核': 'orange',
          '主任驳回': 'red',
          '秘书审核': 'purple',
          '待补正': 'orange',
          '退回修改': 'orange',
          '已排期': 'blue',
          '专家确认': 'cyan',
          '待会诊': 'blue',
          '会诊中': 'processing',
          '已完成': 'green',
          '已归档': 'green',
          '秘书驳回': 'red',
          '已取消': 'default',
        }
        return <Tag color={colors[status] || 'default'}>{status}</Tag>
      },
    },
    { title: '申请医生', dataIndex: 'applicant', key: 'applicant', width: 100 },
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
      render: (t) => <Tag color={t === '院内' ? 'blue' : 'green'}>{t}</Tag> 
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      key: 'urgency',
      width: 100,
      render: (urgency) => {
        const color = urgency === '特急' ? 'red' : urgency === '紧急' ? 'orange' : 'green'
        if (urgency === '特急') {
          return <Tag color={color}><strong>{urgency}</strong></Tag>
        }
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
      title: '期望时间', 
      dataIndex: 'expectTime', 
      key: 'expectTime', 
      width: 150,
      render: (t) => t && t !== '-' ? t : '-',
    },
    { title: '主要诊断', dataIndex: 'diagnosis', key: 'diagnosis', ellipsis: true, width: 200 },
    {
      title: '邀请专家',
      dataIndex: 'expertCount',
      key: 'expertCount',
      width: 100,
      render: (count) => (
        <Space>
          <TeamOutlined />
          <span>{count}位</span>
        </Space>
      ),
    },
    {
      title: '审批状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const colors: Record<string, string> = {
          '医生提交': 'blue',
          '待主任审核': 'orange',
          '主任驳回': 'red',
          '秘书审核': 'purple',
          '待补正': 'orange',
          '退回修改': 'orange',
          '已排期': 'blue',
          '专家确认': 'cyan',
          '待会诊': 'blue',
          '会诊中': 'processing',
          '已完成': 'green',
          '已归档': 'green',
          '秘书驳回': 'red',
          '已取消': 'default',
        }
        return <Tag color={colors[status] || 'default'}>{status}</Tag>
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
        <Title level={4}>主任医生工作台</Title>

        {/* 统计卡片 */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic 
                title="待审核会诊" 
                value={stats.pending} 
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="紧急会诊" 
                value={stats.urgent} 
                prefix={<FireOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="已通过" 
                value={stats.approved} 
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="我的申请" 
                value={stats.myApplications} 
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 待审核列表 */}
        <Card title="待科室审核会诊">
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
                    <Option value="院内">院内</Option>
                    <Option value="院外">院外</Option>
                  </Select>
                </Col>
                <Col span={2}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<SearchOutlined />}
                      onClick={() => loadData()}
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
            columns={columns}
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
          extra={
            <Button type="link" onClick={() => navigate('/consultation/my-applies')}>
              查看全部
            </Button>
          }
        >
          {/* 筛选器 */}
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Row gutter={[16, 16]}>
                <Col span={4}>
                  <Input
                    placeholder="患者名称"
                    value={applicationFilters.patientName}
                    onChange={(e) => setApplicationFilters({ ...applicationFilters, patientName: e.target.value })}
                    prefix={<SearchOutlined />}
                    allowClear
                  />
                </Col>
                <Col span={3}>
                  <Select
                    placeholder="紧急程度"
                    value={applicationFilters.urgency || undefined}
                    onChange={(value) => setApplicationFilters({ ...applicationFilters, urgency: value })}
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
                      value={applicationFilters.applyDateStart}
                      onChange={(date) => setApplicationFilters({ ...applicationFilters, applyDateStart: date })}
                      placeholder="申请日期"
                      style={{ width: '50%' }}
                    />
                    <span className="px-2 text-gray-400">-</span>
                    <DatePicker
                      value={applicationFilters.applyDateEnd}
                      onChange={(date) => setApplicationFilters({ ...applicationFilters, applyDateEnd: date })}
                      placeholder="申请日期"
                      style={{ width: '50%' }}
                    />
                  </Space.Compact>
                </Col>
                <Col span={3}>
                  <Select
                    placeholder="会诊类型"
                    value={applicationFilters.type || undefined}
                    onChange={(value) => setApplicationFilters({ ...applicationFilters, type: value })}
                    allowClear
                    style={{ width: '100%' }}
                  >
                    <Option value="院内">院内</Option>
                    <Option value="院外">院外</Option>
                  </Select>
                </Col>
                <Col span={8}>
                  <Space>
                    <Button 
                      type="primary" 
                      icon={<SearchOutlined />}
                      onClick={() => loadData()}
                    >
                      查询
                    </Button>
                    <Button 
                      icon={<ReloadOutlined />}
                      onClick={resetApplicationFilters}
                    >
                      重置
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Space>
          </div>

          {/* 我的申请列表表格 */}
          <Table
            columns={applicationColumns}
            dataSource={filterApplications()}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1200 }}
            loading={applicationFilterLoading}
          />
        </Card>

        {/* 审核弹窗 */}
        <Modal
          title={auditAction === '通过' ? '审核会诊申请' : '拒绝会诊申请'}
          open={auditModalVisible}
          footer={[
            <Button
              key="back"
              onClick={() => {
                setAuditModalVisible(false)
                setAuditComment('')
              }}
            >
              取消
            </Button>,
            auditAction === '通过' ? (
              <Button
                key="approve"
                type="primary"
                loading={auditLoading}
                onClick={() => submitAudit('通过')}
              >
                通过
              </Button>
            ) : (
              <Button
                key="reject"
                danger
                loading={auditLoading}
                onClick={() => submitAudit('拒绝')}
              >
                拒绝
              </Button>
            ),
          ]}
        >
          <div className="space-y-4">
            {selectedConsultation && (
              <div>
                <p><strong>患者：</strong>{selectedConsultation.patientName}</p>
                <p><strong>会诊ID：</strong>{selectedConsultation.consultationCode}</p>
                <p><strong>诊断：</strong>{selectedConsultation.diagnosis}</p>
                <p><strong>申请医生：</strong>{selectedConsultation.applicant}</p>
              </div>
            )}
            <div>
              <strong>审核意见：</strong>
              <TextArea
                rows={4}
                value={auditComment}
                onChange={(e) => setAuditComment(e.target.value)}
                placeholder="请输入审核意见..."
              />
            </div>
          </div>
        </Modal>
      </div>
    </Spin>
  )
}
