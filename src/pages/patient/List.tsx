import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Table, Button, Input, Select, Space, Tag, Typography, Modal, message, Badge, Tooltip } from 'antd'
import { SearchOutlined, EyeOutlined, MedicineBoxOutlined, UserOutlined, ThunderboltOutlined, RobotOutlined } from '@ant-design/icons'
import { mockPatients, mockConsultations } from '../../mocks/data'
import type { Patient } from '../../stores/consultationStore'
import type { ColumnsType } from 'antd/es/table'
import aiPatientScreeningService, { MDTNecessityAssessment } from '../../services/integration/ai/aiPatientScreeningService'

const { Title, Text } = Typography

interface PatientWithAI extends Patient {
  aiAssessment?: MDTNecessityAssessment
  aiLoading?: boolean
}

export default function PatientList() {
  const [data, setData] = useState<PatientWithAI[]>(mockPatients)
  const [searchText, setSearchText] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [applyModalVisible, setApplyModalVisible] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<PatientWithAI | null>(null)
  const navigate = useNavigate()

  // 加载 AI 评估
  useEffect(() => {
    loadAIAssessments()
  }, [])

  const loadAIAssessments = async () => {
    // 为所有患者加载 AI MDT 评估
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

  const departments = Array.from(new Set(mockPatients.map(p => p.department)))

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