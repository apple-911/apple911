import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Button, Input, Select, Space, Tag, Typography, Modal, message, Badge, Tooltip, Result } from 'antd'
import { SearchOutlined, EyeOutlined, MedicineBoxOutlined, UserOutlined, ThunderboltOutlined, RobotOutlined } from '@ant-design/icons'
import { supabase } from '../../lib/supabase'
import type { ColumnsType } from 'antd/es/table'
import aiPatientScreeningService, { MDTNecessityAssessment } from '../../services/integration/ai/aiPatientScreeningService'
import dayjs from 'dayjs'
import { hasPermission } from '../../utils/helpers'

const { Title, Text } = Typography

interface PatientWithAI {
  id: string
  name: string
  gender: string
  age: number
  inpatientNo: string
  mainDiagnosis: string
  department: string
  doctor: string
  lastConsultationTime?: string
  aiAssessment?: MDTNecessityAssessment
  aiLoading?: boolean
}

export default function PatientList() {
  const [data, setData] = useState<PatientWithAI[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [applyModalVisible, setApplyModalVisible] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<PatientWithAI | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadPatients()
  }, [])

  useEffect(() => {
    if (data.length > 0) {
      loadAIAssessments()
    }
  }, [data])

  const loadPatients = async () => {
    try {
      setLoading(true)

      const { data: patients, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const { data: consultations, error: cError } = await supabase
        .from('consultations')
        .select('patient_id, apply_time')
        .order('apply_time', { ascending: false })

      if (cError) throw cError

      const lastConsultationMap = new Map<string, string>()
      consultations?.forEach(c => {
        if (!lastConsultationMap.has(c.patient_id)) {
          lastConsultationMap.set(c.patient_id, c.apply_time)
        }
      })

      const patientsWithConsultation: PatientWithAI[] = (patients || []).map(p => ({
        id: p.id,
        name: p.name,
        gender: p.gender || '未知',
        age: p.age || 0,
        inpatientNo: p.inpatient_no || '',
        mainDiagnosis: p.main_diagnosis || '',
        department: p.department || '',
        doctor: p.doctor || '',
        lastConsultationTime: lastConsultationMap.get(p.id)
          ? dayjs(lastConsultationMap.get(p.id)).format('YYYY-MM-DD')
          : undefined,
      }))

      setData(patientsWithConsultation)
    } catch (err) {
      console.error('加载患者数据失败:', err)
      message.error('加载患者数据失败')
    } finally {
      setLoading(false)
    }
  }

  const loadAIAssessments = async () => {
    const updatedData = [...data]
    for (let i = 0; i < updatedData.length; i++) {
      try {
        updatedData[i].aiLoading = true
        setData([...updatedData])

        const assessment = await aiPatientScreeningService.assessMDTNecessity(updatedData[i].id)
        updatedData[i].aiAssessment = assessment
        updatedData[i].aiLoading = false
      } catch (error) {
        console.error(`加载患者 ${updatedData[i].id} 的 AI 评估失败:`, error)
        updatedData[i].aiLoading = false
      }
    }
    setData([...updatedData])
  }

  const filteredData = data.filter(p => {
    if (searchText) {
      const lower = searchText.toLowerCase()
      if (!p.name.toLowerCase().includes(lower) &&
          !p.inpatientNo.toLowerCase().includes(lower) &&
          !p.mainDiagnosis.toLowerCase().includes(lower)) {
        return false
      }
    }
    if (departmentFilter && p.department !== departmentFilter) return false
    return true
  })

  const handleApplyConsultation = (patient: PatientWithAI) => {
    setSelectedPatient(patient)
    setApplyModalVisible(true)
  }

  const handleConfirmApply = () => {
    setApplyModalVisible(false)
    message.success(`已为 ${selectedPatient?.name} 提交会诊申请`)
  }

  const columns: ColumnsType<PatientWithAI> = [
    {
      title: '姓名',
      dataIndex: 'name',
      render: (t, record) => (
        <a onClick={() => navigate(`/patient/360/${record.id}`)}>{t}</a>
      )
    },
    { title: '性别', dataIndex: 'gender' },
    { title: '年龄', dataIndex: 'age' },
    { title: '住院号', dataIndex: 'inpatientNo' },
    { title: '主要诊断', dataIndex: 'mainDiagnosis', ellipsis: true },
    { title: '科室', dataIndex: 'department' },
    { title: '主治医生', dataIndex: 'doctor' },
    {
      title: '最近会诊',
      dataIndex: 'lastConsultationTime',
      render: (t) => t ? <Tag>{t}</Tag> : <Text type="secondary">暂无</Text>
    },
    {
      title: 'AI MDT 预判',
      key: 'aiAssessment',
      width: 140,
      render: (_, record) => {
        if (record.aiLoading) {
          return <Badge color="processing" text="AI 评估中..." />
        }
        if (!record.aiAssessment) {
          return <Text type="secondary">未评估</Text>
        }
        
        const score = record.aiAssessment.necessityScore
        const level = record.aiAssessment.recommendationLevel
        
        let color = 'default'
        let text = level as string
        let icon = null
        
        if (level === '强烈推荐') {
          color = 'red'
          text = `强烈推荐`
          icon = <ThunderboltOutlined />
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
          <Tooltip title={
            <div style={{ padding: '4px 0' }}>
              <div><strong>评分：</strong>{score}分</div>
              <div><strong>置信度：</strong>{record.aiAssessment.confidence}%</div>
              <div><strong>推荐类型：</strong>{record.aiAssessment.recommendedType}</div>
              <div><strong>紧急程度：</strong>{record.aiAssessment.urgency}</div>
            </div>
          }>
            <Tag color={color} style={{ minWidth: '80px', textAlign: 'center' }}>
              {icon && <span style={{ marginRight: 4 }}>{icon}</span>}
              {text}
            </Tag>
          </Tooltip>
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => {
        const showAIAlert = record.aiAssessment && record.aiAssessment.necessityScore >= 80
        
        return (
          <Space wrap size="small">
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/patient/360/${record.id}`)}
            >
              查看 360
            </Button>
            
            {showAIAlert ? (
              <Button
                size="small"
                type="primary"
                danger
                icon={<ThunderboltOutlined />}
                onClick={() => handleApplyConsultation(record)}
              >
                发起会诊
              </Button>
            ) : (
              <Button
                size="small"
                type="primary"
                icon={<MedicineBoxOutlined />}
                onClick={() => handleApplyConsultation(record)}
              >
                发起会诊
              </Button>
            )}
          </Space>
        )
      }
    },
  ]

  const departments = Array.from(new Set(data.map(p => p.department).filter(Boolean)))

  // 权限检查
  if (!hasPermission('perm-patient-list')) {
    return (
      <Result
        status="403"
        title="暂无权限"
        subTitle="抱歉，您没有权限访问患者档案库。如需获取权限，请联系系统管理员。"
        extra={<Button type="primary" onClick={() => navigate(-1)}>返回</Button>}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">患者档案库</Title>
      </div>

      <Card>
        <Space className="mb-4" wrap>
          <Input.Search
            placeholder="搜索姓名/住院号/诊断"
            allowClear
            style={{ width: 250 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="筛选科室"
            allowClear
            style={{ width: 150 }}
            value={departmentFilter || undefined}
            onChange={(v) => setDepartmentFilter(v || '')}
            options={departments.map(d => ({ value: d, label: d }))}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>

      <Modal
        title="发起会诊"
        open={applyModalVisible}
        onCancel={() => setApplyModalVisible(false)}
        onOk={handleConfirmApply}
      >
        {selectedPatient && (
          <div className="space-y-4">
            <div>
              <Text strong>患者信息</Text>
              <div className="mt-2 p-3 bg-gray-50 rounded">
                <p>姓名：{selectedPatient.name}</p>
                <p>住院号：{selectedPatient.inpatientNo}</p>
                <p>诊断：{selectedPatient.mainDiagnosis}</p>
              </div>
            </div>
            <div>
              <Text strong>会诊类型</Text>
              <Space className="mt-2">
                <Tag color="blue" className="cursor-pointer" onClick={() => {}}>院内会诊</Tag>
                <Tag className="cursor-pointer" onClick={() => {}}>远程会诊</Tag>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}