import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Input, Select, Space, Button, Table, Tag, Typography, Row, Col, Badge, message } from 'antd'
import { SearchOutlined, FilterOutlined, ExportOutlined, StarOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { mockMedicalCases, type MedicalCase } from '../../mocks/caseData'

const { Title, Text } = Typography

export default function CaseSearch() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [filters, setFilters] = useState({
    department: undefined as string | undefined,
    diseaseType: undefined as string | undefined,
    status: undefined as string | undefined,
  })

  const handleExport = () => {
    try {
      const exportData = filteredCases.map(c => ({
        '病案ID': c.id,
        '病例标题': c.caseTitle,
        '主要诊断': c.diagnosis.primary,
        'ICD-10': c.diagnosis.icd10,
        '患者姓名': c.patientInfo.name,
        '性别': c.patientInfo.gender,
        '年龄': c.patientInfo.age,
        '科室': c.diagnosis.department,
        '会诊日期': c.mdtInfo.meetingDate,
        '会诊结论': c.mdtInfo.conclusion,
        '治疗方案': c.treatmentPlan.primary,
        '随访状态': c.followUp.status,
        '质控评分': c.qualityControl.score,
        '标签': c.tags.join(', '),
      }))

      const jsonStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `病例导出_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      message.success(`成功导出 ${filteredCases.length} 条病例数据`)
    } catch (error) {
      message.error('导出失败，请重试')
    }
  }

  const filteredCases = mockMedicalCases.filter((c) => {
    const matchKeyword = !keyword || 
      c.diagnosis.primary.includes(keyword) ||
      c.patientInfo.name.includes(keyword) ||
      c.mdtInfo.conclusion.includes(keyword)
    
    const matchDepartment = !filters.department || c.diagnosis.department === filters.department
    const matchStatus = !filters.status || c.followUp.status === filters.status
    
    return matchKeyword && matchDepartment && matchStatus
  })

  const columns: ColumnsType<MedicalCase> = [
    {
      title: '病案ID',
      dataIndex: 'id',
      width: 100,
      render: (id: string) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: '主要诊断',
      dataIndex: 'diagnosis',
      render: (diagnosis: MedicalCase['diagnosis']) => (
        <div>
          <div className="font-medium">{diagnosis.primary}</div>
          <div className="text-xs text-gray-500">{diagnosis.icd10}</div>
        </div>
      ),
    },
    {
      title: '患者信息',
      key: 'patient',
      render: (_, record) => (
        <div>
          <div>{record.patientInfo.name}</div>
          <div className="text-xs text-gray-500">
            {record.patientInfo.gender} | {record.patientInfo.age}岁
          </div>
        </div>
      ),
    },
    {
      title: '申请科室',
      dataIndex: 'patientInfo',
      render: (info: MedicalCase['patientInfo']) => info.department,
    },
    {
      title: '会诊日期',
      dataIndex: 'mdtInfo',
      render: (info: MedicalCase['mdtInfo']) => info.meetingDate,
    },
    {
      title: '质控评分',
      dataIndex: 'qualityControl',
      render: (qc: MedicalCase['qualityControl']) => (
        <Badge
          count={qc.score}
          style={{
            backgroundColor: qc.score >= 95 ? '#52c41a' : qc.score >= 90 ? '#faad14' : '#ff4d4f',
          }}
        />
      ),
    },
    {
      title: '随访状态',
      dataIndex: 'followUp',
      render: (followUp: MedicalCase['followUp']) => (
        <Tag
          color={
            followUp.status === '已完成' ? 'green' :
            followUp.status === '进行中' ? 'blue' : 'default'
          }
        >
          {followUp.status}
        </Tag>
      ),
    },
    {
      title: '标签',
      dataIndex: 'tags',
      render: (tags: string[]) => (
        <Space size={[0, 4]} wrap>
          {tags.includes('典型病例') && <Tag color="gold">典型病例</Tag>}
          {tags.includes('疑难病例') && <Tag color="red">疑难病例</Tag>}
          {tags.includes('教学示范') && <Tag color="green">教学示范</Tag>}
          {tags.includes('科研价值') && <Tag color="purple">科研价值</Tag>}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/case-library/detail/${record.id}`)}
        >
          查看详情
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <Title level={4}>病案检索</Title>

      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="输入关键词搜索疾病名称、诊断、治疗方案..."
              prefix={<SearchOutlined />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              allowClear
              size="large"
            />
            <Button type="primary" icon={<SearchOutlined />} size="large">
              搜索
            </Button>
          </Space.Compact>

          <Space wrap>
            <Select
              placeholder="申请科室"
              allowClear
              style={{ width: 150 }}
              value={filters.department}
              onChange={(v) => setFilters({ ...filters, department: v })}
            >
              <Select.Option value="肿瘤科">肿瘤科</Select.Option>
              <Select.Option value="乳腺外科">乳腺外科</Select.Option>
              <Select.Option value="肛肠外科">肛肠外科</Select.Option>
              <Select.Option value="消化内科">消化内科</Select.Option>
              <Select.Option value="泌尿外科">泌尿外科</Select.Option>
            </Select>

            <Select
              placeholder="随访状态"
              allowClear
              style={{ width: 150 }}
              value={filters.status}
              onChange={(v) => setFilters({ ...filters, status: v })}
            >
              <Select.Option value="未开始">未开始</Select.Option>
              <Select.Option value="进行中">进行中</Select.Option>
              <Select.Option value="已完成">已完成</Select.Option>
            </Select>

            <Button icon={<ExportOutlined />} onClick={handleExport}>导出结果</Button>
          </Space>
        </Space>
      </Card>

      <Card>
        <div className="mb-4">
          <Text>共找到 <Text strong style={{ color: '#045126' }}>{filteredCases.length}</Text> 个病例</Text>
        </div>
        <Table
          columns={columns}
          dataSource={filteredCases}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </Card>
    </div>
  )
}
