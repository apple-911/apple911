import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Table, Tag, Space, Typography, Button, message, Modal, Input, Spin, Statistic, Radio } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, UsergroupAddOutlined, FileTextOutlined, EyeOutlined } from '@ant-design/icons'
import { useAppStore } from '../../stores/appStore'
import { supabase } from '../../lib/supabase'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title } = Typography
const { TextArea } = Input

interface ExpertInvitation {
  id: string
  consultation_id: string
  patientName: string
  patientInpatientNo: string
  department: string
  diagnosis: string
  expectTime: string
  meetingRoom: string
  status: '待接受' | '已接受' | '已拒绝'
  inviteTime: string
}

export default function ExpertWorkbench() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ pending: 0, accepted: 0, rejected: 0 })
  const [invitations, setInvitations] = useState<ExpertInvitation[]>([])
  const [acceptModalVisible, setAcceptModalVisible] = useState(false)
  const [selectedInvitation, setSelectedInvitation] = useState<any>(null)
  const [acceptLoading, setAcceptLoading] = useState(false)

  useEffect(() => {
    loadInvitations()
  }, [])

  const loadInvitations = async () => {
    try {
      setLoading(true)
      
      // 先查询当前用户对应的专家记录
      const { data: expertRecord, error: expertRecordError } = await supabase
        .from('experts')
        .select('id')
        .eq('user_id', user?.id)
        .single()
      
      if (expertRecordError || !expertRecord) {
        console.warn('当前用户不是专家用户:', user?.id)
        setInvitations([])
        setStats({ pending: 0, accepted: 0, rejected: 0 })
        setLoading(false)
        return
      }
      
      console.log('专家 ID:', expertRecord.id)
      
      // 查询专家被邀请的会诊（包括医生邀请和秘书邀请的）
      const { data: expertData, error: expertError } = await supabase
        .from('consultation_experts')
        .select('*')
        .eq('expert_id', expertRecord.id)
        .order('invite_time', { ascending: false })
      
      if (expertError) {
        console.error('consultation_experts 查询失败:', expertError)
        // 表可能不存在，设置为空
        setInvitations([])
        setStats({ pending: 0, accepted: 0, rejected: 0 })
        setLoading(false)
        return
      }
      
      console.log('专家邀请数据:', expertData)
      console.log('invited_by 分布:', expertData?.map(e => e.invited_by))
      
      if (!expertData || expertData.length === 0) {
        setInvitations([])
        setStats({ pending: 0, accepted: 0, rejected: 0 })
        setLoading(false)
        return
      }
      
      // 获取会诊详情
      const consultationIds = expertData.map(e => e.consultation_id)
      const { data: consultations, error: consultError } = await supabase
        .from('consultations')
        .select('*')
        .in('id', consultationIds)
      
      if (consultError) {
        console.error('consultations查询失败:', consultError)
        // 表可能不存在，设置为空
        setInvitations([])
        setStats({ pending: 0, accepted: 0, rejected: 0 })
        setLoading(false)
        return
      }
      
      const invitationsList: ExpertInvitation[] = expertData.map(expert => {
        const consultation = consultations?.find(c => c.id === expert.consultation_id)
        return {
          id: expert.id,
          consultation_id: expert.consultation_id,
          patientName: consultation?.patient_name || '',
          patientInpatientNo: consultation?.patient_inpatient_no || '',
          department: consultation?.department || '',
          diagnosis: consultation?.main_diagnosis || '',
          expectTime: consultation?.expect_time || '',
          meetingRoom: consultation?.meeting_room || '',
          status: expert.status as '待接受' | '已接受' | '已拒绝',
          inviteTime: expert.invite_time,
        }
      })
      
      setInvitations(invitationsList)
      setStats({
        pending: invitationsList.filter(i => i.status === '待接受').length,
        accepted: invitationsList.filter(i => i.status === '已接受').length,
        rejected: invitationsList.filter(i => i.status === '已拒绝').length,
      })
    } catch (err) {
      console.error('加载失败:', err)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = (invitation: any) => {
    setSelectedInvitation(invitation)
    setAcceptModalVisible(true)
  }

  const submitResponse = async (action: '接受' | '拒绝') => {
    if (!selectedInvitation) return
    
    try {
      setAcceptLoading(true)
      
      // 更新专家邀请状态
      await supabase
        .from('consultation_experts')
        .update({ 
          status: action === '接受' ? '已接受' : '已拒绝',
          response_time: new Date().toISOString(),
        })
        .eq('id', selectedInvitation.id)
      
      if (action === '接受') {
        // 如果是接受，更新会诊状态为待会诊（如果还没有专家接受）
        await supabase
          .from('consultations')
          .update({ status: '待会诊' })
          .eq('id', selectedInvitation.consultation_id)
      }
      
      // 插入审核历史
      const auditInsert: {
        consultation_id: string
        operator?: string
        operator_id?: string
        operator_role: string
        node: string
        result: string
        time: string
      } = {
        consultation_id: selectedInvitation.consultation_id,
        operator: user?.name,
        operator_role: '会诊专家',
        node: '专家响应',
        result: action === '接受' ? '已接受' : '已拒绝',
        time: new Date().toISOString(),
      }
      
      // 如果用户有 ID 且是 UUID 格式，才添加 operator_id
      if (user?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id)) {
        auditInsert.operator_id = user.id
      }
      
      await supabase
        .from('audit_history')
        .insert(auditInsert)
      
      message.success(`${action === '接受' ? '已接受邀请' : '已拒绝邀请'}`)
      setAcceptModalVisible(false)
      loadInvitations()
    } catch (err) {
      console.error('响应失败:', err)
      message.error('操作失败')
    } finally {
      setAcceptLoading(false)
    }
  }

  const columns: ColumnsType<ExpertInvitation> = [
    { title: '患者姓名', dataIndex: 'patientName', width: 100 },
    { title: '住院号', dataIndex: 'patientInpatientNo', width: 120 },
    { title: '科室', dataIndex: 'department', width: 100 },
    { title: '诊断', dataIndex: 'diagnosis', ellipsis: true },
    { 
      title: '会诊时间', 
      dataIndex: 'expectTime',
      width: 160,
      render: (t) => t ? dayjs(t).format('YYYY-MM-DD HH:mm') : '待安排'
    },
    { title: '会诊地点', dataIndex: 'meetingRoom', width: 120 },
    { 
      title: '邀请状态', 
      dataIndex: 'status',
      width: 90,
      render: (status) => (
        <Tag color={status === '已接受' ? 'green' : status === '已拒绝' ? 'red' : 'orange'}>
          {status}
        </Tag>
      )
    },
    { 
      title: '邀请时间', 
      dataIndex: 'inviteTime',
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
            onClick={() => navigate(`/consultation/detail/${record.consultation_id}`)}
          >
            详情
          </Button>
          {record.status === '待接受' && (
            <>
              <Button
                size="small"
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => handleAccept(record)}
              >
                接受
              </Button>
              <Button
                size="small"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => {
                  setSelectedInvitation(record)
                  setAcceptModalVisible(true)
                }}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      )
    },
  ]

  return (
    <Spin spinning={loading}>
      <div className="space-y-4">
        <Title level={4}>专家会诊工作台</Title>

        {/* 统计卡片 */}
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic 
                title="待接受邀请" 
                value={stats.pending} 
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic 
                title="已接受" 
                value={stats.accepted} 
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic 
                title="已拒绝" 
                value={stats.rejected} 
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        {/* 邀请列表 */}
        <Card title="我的会诊邀请">
          <Table
            columns={columns}
            dataSource={invitations}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* 响应弹窗 */}
        <Modal
          title="响应会诊邀请"
          open={acceptModalVisible}
          onOk={() => submitResponse('接受')}
          onCancel={() => setAcceptModalVisible(false)}
          confirmLoading={acceptLoading}
        >
          {selectedInvitation && (
            <div className="space-y-4">
              <div>
                <p><strong>患者：</strong>{selectedInvitation.patientName}</p>
                <p><strong>诊断：</strong>{selectedInvitation.diagnosis}</p>
                <p><strong>会诊时间：</strong>{selectedInvitation.expectTime ? dayjs(selectedInvitation.expectTime).format('YYYY-MM-DD HH:mm') : '待安排'}</p>
                <p><strong>会诊地点：</strong>{selectedInvitation.meetingRoom || '待安排'}</p>
              </div>
              <div>
                <strong>请选择：</strong>
                <div style={{ marginTop: 8 }}>
                  <Radio.Group defaultValue="accept">
                    <Radio value="accept">接受邀请</Radio>
                    <Radio value="reject">拒绝邀请</Radio>
                  </Radio.Group>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Spin>
  )
}
