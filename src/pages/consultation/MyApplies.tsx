import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Button, Tag, Space, Select, Modal, message, Typography, Spin, Result, Input, DatePicker } from 'antd'
import { EyeOutlined, DeleteOutlined, EditOutlined, ReloadOutlined, TeamOutlined, FilterOutlined } from '@ant-design/icons'
import { supabase } from '../../lib/supabase'
import type { ColumnsType } from 'antd/es/table'
import type { Consultation } from '../../stores/consultationStore'
import dayjs from 'dayjs'
import { useAppStore } from '../../stores/appStore'
import { hasPermission } from '../../utils/helpers'
import { getConsultationStatusName, getConsultationStatusColor, getUrgencyName, getUrgencyColor, getConsultationTypeName, getConsultationTypeColor } from '../../utils/codeTable'

const { Title, Text } = Typography

export default function MyApplies() {
  const [data, setData] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [patientNameFilter, setPatientNameFilter] = useState<string>('')
  const [urgencyFilter, setUrgencyFilter] = useState<string>('')
  const [dateFilter, setDateFilter] = useState<any>(null)
  const navigate = useNavigate()
  const { user } = useAppStore()

  // 从数据库加载会诊数据
  useEffect(() => {
    loadConsultations()
  }, [])

  const loadConsultations = async () => {
    try {
      setLoading(true)
      
      // 查询会诊数据
      const { data: consultations, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('apply_doctor', user?.name || '')
        .order('apply_time', { ascending: false })
      
      console.log('MyApplies 原始会诊数据:', consultations?.map(c => ({ id: c.id, patient_name: c.patient_name, status: c.status })))
      
      if (error) {
        console.error('加载会诊数据失败:', error)
        message.error('加载数据失败')
        return
      }
      
      // 获取会诊专家关联
      const { data: consultationExperts, error: ceError } = await supabase
        .from('consultation_experts')
        .select('consultation_id, expert_id')
      
      if (ceError) {
        console.error('加载专家数据失败:', ceError)
      }
      
      // 构建会诊ID到专家数量的映射
      const expertCountMap = new Map<string, number>();
      (consultationExperts || []).forEach((ce: { consultation_id: string }) => {
        expertCountMap.set(ce.consultation_id, (expertCountMap.get(ce.consultation_id) || 0) + 1)
      })
      
      // 转换数据格式
      const formattedData: Consultation[] = (consultations || []).map(item => ({
        id: item.id,
        consultationCode: item.consultation_code,  // 添加会诊编码
        patientId: item.patient_id,
        patientName: item.patient_name,
        patientInpatientNo: item.patient_inpatient_no,
        type: item.type as '院内' | '远程',
        applyTime: item.apply_time,
        expectTime: item.expect_time,
        status: item.status as Consultation['status'],
        urgency: item.urgency as '普通' | '紧急' | '特急',
        department: item.department,
        applyDoctor: item.apply_doctor,
        experts: Array.from({ length: expertCountMap.get(item.id) || 0 }, (_, i) => ({ id: `expert-${i}`, name: `专家${i + 1}`, department: '', dept: '', title: '', specialty: '', status: '空闲' as const })),
        mainDiagnosis: item.main_diagnosis || '',
        reject_reason: item.reject_reason,
      }))
      
      setData(formattedData)
    } catch (err) {
      console.error('加载失败:', err)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const filteredData = data.filter(d => {
    if (statusFilter && d.status !== statusFilter) return false
    if (typeFilter && d.type !== typeFilter) return false
    if (patientNameFilter && !d.patientName.toLowerCase().includes(patientNameFilter.toLowerCase())) return false
    if (urgencyFilter && d.urgency !== urgencyFilter) return false
    if (dateFilter) {
      const selectedDate = dayjs(dateFilter).format('YYYY-MM-DD')
      const applyDate = dayjs(d.applyTime).format('YYYY-MM-DD')
      if (applyDate !== selectedDate) return false
    }
    return true
  })

  const handleRevoke = (id: string) => {
    Modal.confirm({
      title: '确认撤销',
      content: '确定要撤销这条会诊申请吗？',
      onOk: async () => {
        try {
          const { error } = await supabase
            .from('consultations')
            .update({ status: 'cancelled' })
            .eq('id', id)
          
          if (error) throw error
          
          // 插入审核历史
          const auditInsert = {
            consultation_id: id,
            operator: user?.name,
            operator_role: '申请医生',
            node: '申请撤销',
            result: '已撤销',
            time: new Date().toISOString(),
          }
          
          await supabase
            .from('audit_history')
            .insert(auditInsert)
          
          message.success('已撤销申请')
          loadConsultations()
        } catch (err) {
          console.error('撤销失败:', err)
          message.error('撤销失败')
        }
      }
    })
  }

  const handleEdit = (record: Consultation) => {
    // 跳转到申请页面，带上会诊 ID 进行编辑
    navigate(`/consultation/apply?id=${record.id}`)
  }

  const columns: ColumnsType<Consultation> = [
    { 
      title: '会诊 ID', 
      dataIndex: 'consultationCode', 
      width: 120,
      render: (code) => <Tag color="blue">{code || '-'}</Tag> 
    },
    { title: '患者姓名', dataIndex: 'patientName', width: 100 },
    { 
      title: '会诊类型', 
      dataIndex: 'type', 
      width: 100, 
      render: (t) => {
        // t 是编码（inhospital/remote），需要转换为中文
        const typeName = getConsultationTypeName(t)
        const typeColor = getConsultationTypeColor(t)
        return <Tag color={typeColor}>{typeName}</Tag>
      }
    },
    {
      title: '紧急程度',
      dataIndex: 'urgency',
      width: 100,
      render: (urgency) => {
        // urgency 是编码（critical/urgent/normal），需要转换为中文
        const urgencyName = getUrgencyName(urgency)
        const urgencyColor = getUrgencyColor(urgency)
        if (urgencyName === '危急') {
          return <Tag color={urgencyColor}><strong>{urgencyName}</strong></Tag>
        }
        return <Tag color={urgencyColor}>{urgencyName}</Tag>
      },
    },
    { title: '申请时间', dataIndex: 'applyTime', width: 150, render: (t) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-' },
    { title: '期望时间', dataIndex: 'expectTime', width: 150, render: (t) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-' },
    { title: '主要诊断', dataIndex: 'mainDiagnosis', ellipsis: true, width: 200 },
    {
      title: '邀请专家',
      dataIndex: 'experts',
      width: 100,
      render: (experts) => {
        if (!experts || experts.length === 0) return '-';
        return (
          <Space>
            <TeamOutlined />
            <Text>{experts.length}位</Text>
          </Space>
        );
      },
    },
    {
      title: '审批状态',
      dataIndex: 'status',
      width: 120,
      render: (t: Consultation['status']) => {
        console.log('MyApplies 审批状态 render:', { status: t, name: getConsultationStatusName(t), color: getConsultationStatusColor(t) })
        const name = getConsultationStatusName(t);
        const color = getConsultationStatusColor(t);
        return <Tag color={color}>{name}</Tag>;
      }
    },
    {
      title: '拒绝原因',
      dataIndex: 'reject_reason',
      ellipsis: true,
      width: 200,
      render: (text: string, record: any) => {
        // 只有在拒绝/驳回状态下才显示拒绝原因
        const rejectStatuses = ['director_rejected', 'pending_supplement', 'material_rejected'];
        // 过滤掉状态值被错误写入的情况
        const statusValues = ['医生提交', '待主任审核', '主任驳回', '秘书审核', '待补正', '退回修改', '已排期', '专家确认', '待会诊', '会诊中', '已完成', '已归档', '秘书驳回', '已取消', 'doctor_submit', 'director_pending', 'director_rejected', 'secretary_pending', 'pending_supplement', 'material_rejected', 'scheduled', 'expert_confirmed', 'pending_meeting', 'in_progress', 'completed', 'archived', 'rejected', 'cancelled'];
        
        if (rejectStatuses.includes(record.status) && text && !statusValues.includes(text)) {
          return <Text type="warning" ellipsis>{text}</Text>
        }
        return '-'
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space wrap size="small">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/consultation/detail/${record.id}`)}
          >
            详情
          </Button>
          {/* 在专家确认前都可以撤销 */}
          {(['doctor_submit', 'director_pending', 'director_rejected', 'secretary_pending', 'pending_supplement', 'material_rejected'].includes(record.status)) && (
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRevoke(record.id)}
            >
              撤销
            </Button>
          )}
          {/* 主任驳回后可以修改重提 */}
          {(['director_rejected'].includes(record.status)) && (
            <Button
              size="small"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              补正
            </Button>
          )}
          {/* 秘书退回待补正 */}
          {(['pending_supplement', 'material_rejected'].includes(record.status)) && (
            <Button
              size="small"
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => handleEdit(record)}
            >
              补正
            </Button>
          )}
        </Space>
      )
    },
  ]

  // 权限检查
  if (!hasPermission('perm-consultation-my-applies')) {
    return (
      <Result
        status="403"
        title="暂无权限"
        subTitle="抱歉，您没有权限访问我的申请页面。如需获取权限，请联系系统管理员。"
        extra={<Button type="primary" onClick={() => navigate(-1)}>返回</Button>}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">我的申请列表</Title>
        <Button type="primary" icon={<ReloadOutlined />} onClick={loadConsultations}>
          刷新
        </Button>
      </div>

      {/* 筛选器 */}
      <Card>
        <Space size="middle" wrap>
          <span style={{ fontWeight: 500 }}><FilterOutlined /> 筛选：</span>
          <Input
            placeholder="患者姓名"
            value={patientNameFilter}
            onChange={(e) => setPatientNameFilter(e.target.value)}
            style={{ width: 150 }}
            allowClear
          />
          <Select
            placeholder="紧急程度"
            allowClear
            style={{ width: 120 }}
            value={urgencyFilter || undefined}
            onChange={setUrgencyFilter}
            options={[
              { value: 'normal', label: '普通' },
              { value: 'urgent', label: '紧急' },
              { value: 'critical', label: '特急' },
            ]}
          />
          <DatePicker
            placeholder="申请时间"
            value={dateFilter}
            onChange={setDateFilter}
            style={{ width: 150 }}
            allowClear
          />
          <Select
            placeholder="按状态筛选"
            allowClear
            style={{ width: 150 }}
            value={statusFilter || undefined}
            onChange={setStatusFilter}
            options={[
              { value: 'doctor_submit', label: '医生提交' },
              { value: 'director_pending', label: '待主任审核' },
              { value: 'director_rejected', label: '主任驳回' },
              { value: 'secretary_pending', label: '秘书审核' },
              { value: 'pending_supplement', label: '待补正' },
              { value: 'scheduled', label: '已排期' },
              { value: 'expert_confirmed', label: '专家确认' },
              { value: 'pending_meeting', label: '待会诊' },
              { value: 'in_progress', label: '会诊中' },
              { value: 'completed', label: '已完成' },
              { value: 'archived', label: '已归档' },
              { value: 'rejected', label: '秘书驳回' },
              { value: 'cancelled', label: '已取消' },
            ]}
          />
          <Select
            placeholder="按类型筛选"
            allowClear
            style={{ width: 140 }}
            value={typeFilter || undefined}
            onChange={setTypeFilter}
            options={[
              { value: 'inhospital', label: '院内会诊' },
              { value: 'remote', label: '远程会诊' },
            ]}
          />
          {(patientNameFilter || urgencyFilter || dateFilter || statusFilter || typeFilter) && (
            <Button 
              size="small" 
              onClick={() => {
                setPatientNameFilter('')
                setUrgencyFilter('')
                setDateFilter(null)
                setStatusFilter('')
                setTypeFilter('')
              }}
            >
              重置
            </Button>
          )}
        </Space>
      </Card>

      {/* 数据表格 */}
      <Spin spinning={loading}>
        <Card>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </Spin>
    </div>
  )
}
