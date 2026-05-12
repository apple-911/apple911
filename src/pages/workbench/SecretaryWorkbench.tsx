import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Table, Tag, Space, Typography, Button, message, Modal, Input, DatePicker, TimePicker, Select, Spin, Statistic } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, CalendarOutlined, BellOutlined, EyeOutlined } from '@ant-design/icons'
import { useAppStore } from '../../stores/appStore'
import { supabase } from '../../lib/supabase'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

interface PendingReview {
  id: string
  patientName: string
  patientInpatientNo: string
  department: string
  diagnosis: string
  urgency: '普通' | '紧急' | '特急'
  applicant: string
  applyTime: string
}

export default function SecretaryWorkbench() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ pending: 0, scheduled: 0, completed: 0 })
  const [pendingList, setPendingList] = useState<PendingReview[]>([])
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false)
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null)
  const [scheduleData, setScheduleData] = useState({
    expect_time: '',
    meeting_room: '',
    notes: '',
  })
  const [scheduleLoading, setScheduleLoading] = useState(false)

  useEffect(() => {
    loadPendingReviews()
  }, [])

  const loadPendingReviews = async () => {
    try {
      setLoading(true)
      
      const { data: consultations, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('status', '待秘书审核')
        .order('urgency', { ascending: false })
        .order('apply_time', { ascending: false })
      
      if (error) throw error
      
      const pendingReviews: PendingReview[] = (consultations || []).map(item => ({
        id: item.id,
        patientName: item.patient_name,
        patientInpatientNo: item.patient_inpatient_no,
        department: item.department,
        diagnosis: item.main_diagnosis,
        urgency: item.urgency as '普通' | '紧急' | '特急',
        applicant: item.apply_doctor,
        applyTime: item.apply_time,
      }))
      
      setPendingList(pendingReviews)
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

  const submitSchedule = async () => {
    if (!selectedConsultation) return
    
    try {
      setScheduleLoading(true)
      
      // 更新会诊状态和时间
      await supabase
        .from('consultations')
        .update({ 
          status: '待会诊',
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
      
      message.success('会诊已安排')
      setScheduleModalVisible(false)
      setScheduleData({ expect_time: '', meeting_room: '', notes: '' })
      loadPendingReviews()
    } catch (err) {
      console.error('安排失败:', err)
      message.error('安排会诊失败')
    } finally {
      setScheduleLoading(false)
    }
  }

  const columns: ColumnsType<PendingReview> = [
    { title: '患者姓名', dataIndex: 'patientName', width: 100 },
    { title: '住院号', dataIndex: 'patientInpatientNo', width: 120 },
    { title: '科室', dataIndex: 'department', width: 100 },
    { title: '诊断', dataIndex: 'diagnosis', ellipsis: true },
    { 
      title: '紧急程度', 
      dataIndex: 'urgency',
      width: 90,
      render: (urgency) => (
        <Tag color={urgency === '特急' ? 'red' : urgency === '紧急' ? 'orange' : 'default'}>
          {urgency}
        </Tag>
      )
    },
    { title: '申请医生', dataIndex: 'applicant', width: 100 },
    { 
      title: '申请时间', 
      dataIndex: 'applyTime',
      width: 160,
      render: (t) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
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
          <Button
            size="small"
            type="primary"
            icon={<CalendarOutlined />}
            onClick={() => handleSchedule(record)}
          >
            安排会诊
          </Button>
        </Space>
      )
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
          <Table
            columns={columns}
            dataSource={pendingList}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1000 }}
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
          }}
          confirmLoading={scheduleLoading}
          width={600}
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
