import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Statistic, Table, Tag, Space, Typography, Badge, Button, Progress, Timeline, Avatar, Alert, message } from 'antd'
import {
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  BookOutlined,
  WarningOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useAppStore } from '../../stores/appStore'
import { supabase } from '../../lib/supabase'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { getConsultationStatusName, getConsultationStatusColor, getUrgencyName, getUrgencyColor } from '../../utils/codeTable'

const { Title, Text } = Typography

interface MyApplication {
  id: string
  dbId: string
  consultationCode: string
  patientName: string
  patientId: string
  patientInpatientNo: string
  department: string
  diagnosis: string
  status: string
  originalStatus: string
  urgency: string
  type: string
  expectTime: string
  createTime: string
  expertCount: number
  rejectReason: string
}

export default function DoctorWorkbench() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalApplications: 0,
    ongoingConsultations: 0,
    pendingSupplement: 0,
    completedToday: 0,
  })
  const [applications, setApplications] = useState<MyApplication[]>([])

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      setLoading(true)
      
      // 查询当前医生提交的会诊申请
      const { data: consultations, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('apply_doctor', user?.name || '')
        .order('apply_time', { ascending: false })
      
      if (error) throw error
      
      // 获取会诊专家关联
      const { data: consultationExperts, error: ceError } = await supabase
        .from('consultation_experts')
        .select('consultation_id, expert_id')
      
      if (ceError) throw ceError
      
      // 构建会诊ID到专家数量的映射
      const expertCountMap = new Map<string, number>();
      (consultationExperts || []).forEach((ce: { consultation_id: string }) => {
        expertCountMap.set(ce.consultation_id, (expertCountMap.get(ce.consultation_id) || 0) + 1)
      })
      
      // 转换数据格式
      const allApplications: MyApplication[] = (consultations || []).map(c => {
        return {
          id: c.consultation_code || c.id,
          dbId: c.id,
          consultationCode: c.consultation_code || '',
          patientName: c.patient_name,
          patientId: c.patient_id,
          patientInpatientNo: c.patient_inpatient_no,
          department: c.department,
          diagnosis: c.main_diagnosis || '',
          status: getConsultationStatusName(c.status),
          originalStatus: c.status,
          urgency: getUrgencyName(c.urgency || c.urgency_level || 'normal'),
          type: c.type || '院内',
          expectTime: c.expect_time ? dayjs(c.expect_time).format('YYYY-MM-DD HH:mm') : '-',
          createTime: dayjs(c.apply_time).format('YYYY-MM-DD HH:mm'),
          expertCount: expertCountMap.get(c.id) || 0,
          rejectReason: c.reject_reason || '',
        }
      })
      
      // 按时间倒序排序，取前 5 条
      const sortedApplications = allApplications
        .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
        .slice(0, 5)
      
      // 统计数据
      const today = dayjs().format('YYYY-MM-DD')
      const completedToday = allApplications.filter(a => 
        ['completed', 'archived', 'rejected', 'cancelled'].includes(a.originalStatus) && a.createTime.startsWith(today)
      ).length
      
      setStats({
        totalApplications: allApplications.length,
        ongoingConsultations: allApplications.filter(a => a.originalStatus === 'in_progress').length,
        pendingSupplement: allApplications.filter(a => ['pending_supplement', 'material_rejected'].includes(a.originalStatus)).length,
        completedToday,
      })
      
      setApplications(sortedApplications)
    } catch (err) {
      console.error('加载申请失败:', err)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const columns: ColumnsType<MyApplication> = [
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
      sorter: (a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime(),
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
          <Text>{count}位</Text>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status, record: MyApplication) => {
        const colors: Record<string, string> = {
          'doctor_submit': 'blue',
          'director_pending': 'orange',
          'director_rejected': 'red',
          'secretary_pending': 'purple',
          'pending_supplement': 'orange',
          'material_rejected': 'orange',
          'scheduled': 'blue',
          'expert_confirmed': 'cyan',
          'pending_meeting': 'blue',
          'in_progress': 'processing',
          'completed': 'green',
          'archived': 'green',
          'rejected': 'red',
          'cancelled': 'default',
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
        }
        const texts: Record<string, string> = {
          'doctor_submit': '已提交',
          'director_pending': '主任审核',
          'director_rejected': '主任驳回',
          'secretary_pending': '秘书审核',
          'pending_supplement': '待补正',
          'material_rejected': '退回修改',
          'scheduled': '已排期',
          'expert_confirmed': '专家确认',
          'pending_meeting': '待会诊',
          'in_progress': '会诊中',
          'completed': '已完成',
          'archived': '已归档',
          '医生提交': '已提交',
          '待主任审核': '主任审核',
          '主任驳回': '主任驳回',
          '秘书审核': '秘书审核',
          '待补正': '待补正',
          '退回修改': '退回修改',
          '已排期': '已排期',
          '专家确认': '专家确认',
          '待会诊': '待会诊',
          '会诊中': '会诊中',
          '已完成': '已完成',
          '已归档': '已归档',
        }
        const displayStatus = record.originalStatus || status;
        return <Tag color={colors[displayStatus] || 'default'}>{texts[displayStatus] || displayStatus}</Tag>
      },
    },
    {
      title: '拒绝原因',
      dataIndex: 'rejectReason',
      key: 'rejectReason',
      ellipsis: true,
      width: 200,
      render: (text: string, record: MyApplication) => {
        if ((['director_rejected', 'pending_supplement', 'material_rejected', '主任驳回', '待补正', '退回修改'].includes(record.originalStatus)) && text) {
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
            onClick={() => navigate(`/consultation/detail/${record.dbId}`)}
          >
            详情
          </Button>
          {/* 在专家确认前都可以撤销 */}
          {(['doctor_submit', 'director_pending', 'director_rejected', 'secretary_pending', 'pending_supplement', 'material_rejected', '医生提交', '待主任审核', '主任驳回', '秘书审核', '待补正', '退回修改'].includes(record.originalStatus)) && (
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRevoke(record.dbId)}
            >
              撤销
            </Button>
          )}
          {/* 主任驳回后可以修改重提 */}
          {(['director_rejected', '主任驳回'].includes(record.originalStatus)) && (
            <Button
              size="small"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/consultation/apply/${record.dbId}`)}
            >
              修改重提
            </Button>
          )}
          {/* 秘书退回待补正 */}
          {(['pending_supplement', 'material_rejected', '待补正', '退回修改'].includes(record.originalStatus)) && (
            <Button
              size="small"
              type="primary"
              icon={<ReloadOutlined />}
              onClick={() => navigate(`/consultation/apply/${record.dbId}`)}>
              补正
            </Button>
          )}
        </Space>
      ),
    },
  ]

  // 撤销申请
  const handleRevoke = async (consultationId: string) => {
    try {
      const { error } = await supabase
        .from('consultations')
        .update({ 
          status: '已取消',
          updated_at: new Date().toISOString()
        })
        .eq('id', consultationId)
      
      if (error) throw error
      
      message.success('申请已撤销')
      loadApplications()
    } catch (err) {
      console.error('撤销申请失败:', err)
      message.error('撤销申请失败')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-gray-400">加载中...</div></div>
  }

  return (
    <div className="space-y-4">
      {/* 顶部欢迎语 */}
      <Card className="bg-gradient-to-r from-medical-green to-medical-blue-light">
        <div className="flex items-center justify-between">
          <div>
            <Title level={4} className="!mb-2 text-white">
              早上好，{user?.name || '医生'}！👋
            </Title>
            <Text className="text-white/90">
              您有 {stats.ongoingConsultations} 个会诊正在进行，{stats.pendingSupplement} 个申请需要补充材料
            </Text>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            className="shadow-lg hover:shadow-xl"
            style={{ 
              background: 'linear-gradient(135deg, #045126 0%, #0d7a3d 100%)',
              border: 'none',
              fontWeight: 600
            }}
            onClick={() => navigate('/consultation/apply')}
          >
            新建会诊申请
          </Button>
        </div>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #045126 0%, #0d7a3d 100%)' }}>
                <FileTextOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">我的申请</div>
                <div className="text-3xl font-bold" style={{ color: 'var(--xiehe-green)' }}>
                  {stats.totalApplications}
                </div>
                <div className="text-xs text-gray-400">总会诊申请数</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)' }}>
                <ClockCircleOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">进行中</div>
                <div className="text-3xl font-bold text-blue-500">{stats.ongoingConsultations}</div>
                <div className="text-xs text-gray-400">正在进行的会诊</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fa8c16 0%, #ffc069 100%)' }}>
                <ThunderboltOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">待补充</div>
                <div className="text-3xl font-bold text-orange-500">{stats.pendingSupplement}</div>
                <div className="text-xs text-gray-400">需要补充材料</div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' }}>
                <CheckCircleOutlined className="text-2xl text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-500">今日完成</div>
                <div className="text-3xl font-bold text-green-500">{stats.completedToday}</div>
                <div className="text-xs text-gray-400">今天完成的会诊</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

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
        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 快捷入口 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card title="快捷操作">
            <div className="grid grid-cols-3 gap-4">
              <Button
                icon={<PlusOutlined />}
                size="large"
                className="h-16 !text-medical-green !border-medical-green hover:!bg-medical-green hover:!text-white"
                onClick={() => navigate('/consultation/apply')}
              >
                新建申请
              </Button>
              <Button
                icon={<TeamOutlined />}
                size="large"
                className="h-16 !border-purple-500 !text-purple-500 hover:!bg-purple-500 hover:!text-white"
                onClick={() => navigate('/patient/list')}
              >
                患者列表
              </Button>
              <Button
                icon={<EyeOutlined />}
                size="large"
                className="h-16 !border-orange-500 !text-orange-500 hover:!bg-orange-500 hover:!text-white"
                onClick={() => navigate('/report/list')}
              >
                查看报告
              </Button>
              <Button
                icon={<FileTextOutlined />}
                size="large"
                className="h-16 !border-cyan-500 !text-cyan-500 hover:!bg-cyan-500 hover:!text-white"
                onClick={() => navigate('/consultation/submit-material')}
              >
                材料归档
              </Button>
              <Button
                icon={<BookOutlined />}
                size="large"
                className="h-16 !border-pink-500 !text-pink-500 hover:!bg-pink-500 hover:!text-white"
                onClick={() => navigate('/case-library')}
              >
                病案库
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card title="会诊流程">
            <Timeline
              mode="left"
              items={[
                {
                  label: '提交申请',
                  color: 'green',
                  children: <div className="pl-2">填写会诊申请信息</div>,
                },
                {
                  label: '主任审核',
                  color: 'blue',
                  children: <div className="pl-2">主任医生审核申请</div>,
                },
                {
                  label: '秘书审核',
                  color: 'purple',
                  children: <div className="pl-2">MDT 秘书安排会诊事宜</div>,
                },
                {
                  label: '补充材料',
                  color: 'orange',
                  children: <div className="pl-2">根据要求补充材料（如需）</div>,
                },
                {
                  label: '会诊进行',
                  color: 'cyan',
                  children: <div className="pl-2">专家进行多学科会诊</div>,
                },
                {
                  label: '完成会诊',
                  color: 'gray',
                  children: <div className="pl-2">生成会诊报告</div>,
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
