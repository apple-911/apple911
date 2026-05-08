import { useState } from 'react'
import { Card, Row, Col, Table, Tag, Space, Typography, Button, Select, Empty, Descriptions, Divider } from 'antd'
import { SwapOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { mockMedicalCases } from '../../mocks/caseData'

const { Title, Text } = Typography

export default function CaseComparison() {
  const [selectedCases, setSelectedCases] = useState<string[]>([])
  const [comparisonData, setComparisonData] = useState<any[]>([])

  const handleAddCase = (caseId: string) => {
    if (selectedCases.length >= 3) {
      return
    }
    if (!selectedCases.includes(caseId)) {
      setSelectedCases([...selectedCases, caseId])
      updateComparison([...selectedCases, caseId])
    }
  }

  const handleRemoveCase = (caseId: string) => {
    const newSelected = selectedCases.filter(id => id !== caseId)
    setSelectedCases(newSelected)
    updateComparison(newSelected)
  }

  const updateComparison = (caseIds: string[]) => {
    const cases = caseIds.map(id => mockMedicalCases.find(c => c.id === id)).filter(Boolean)
    setComparisonData(cases)
  }

  const comparisonColumns = [
    {
      title: '对比项',
      dataIndex: 'field',
      key: 'field',
      width: 150,
      fixed: 'left' as const,
    },
    ...comparisonData.map((caseData: any, index: number) => ({
      title: (
        <div>
          <div>{caseData.caseTitle}</div>
          <Button 
            type="link" 
            size="small" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveCase(caseData.id)}
          >
            移除
          </Button>
        </div>
      ),
      key: caseData.id,
      render: (_: any, record: any) => {
        const value = record[`case_${index}`]
        if (Array.isArray(value)) {
          return (
            <Space wrap>
              {value.map((v: string, i: number) => (
                <Tag key={i} color="blue">{v}</Tag>
              ))}
            </Space>
          )
        }
        return value || '-'
      },
    })),
  ]

  const comparisonRows = comparisonData.length > 0 ? [
    {
      field: '病案ID',
      ...Object.fromEntries(comparisonData.map((c: any, i: number) => [`case_${i}`, c.id])),
    },
    {
      field: '主要诊断',
      ...Object.fromEntries(comparisonData.map((c: any, i: number) => [`case_${i}`, c.diagnosis.primary])),
    },
    {
      field: 'ICD-10编码',
      ...Object.fromEntries(comparisonData.map((c: any, i: number) => [`case_${i}`, c.diagnosis.icd10])),
    },
    {
      field: 'TNM分期',
      ...Object.fromEntries(comparisonData.map((c: any, i: number) => [`case_${i}`, c.diagnosis.tnmStage || '-'])),
    },
    {
      field: '科室',
      ...Object.fromEntries(comparisonData.map((c: any, i: number) => [`case_${i}`, c.diagnosis.department])),
    },
    {
      field: '会诊日期',
      ...Object.fromEntries(comparisonData.map((c: any, i: number) => [`case_${i}`, c.mdtInfo.meetingDate])),
    },
    {
      field: '治疗方案',
      ...Object.fromEntries(comparisonData.map((c: any, i: number) => [`case_${i}`, c.treatmentPlan.primary])),
    },
    {
      field: '用药方案',
      ...Object.fromEntries(comparisonData.map((c: any, i: number) => [`case_${i}`, c.treatmentPlan.medications])),
    },
    {
      field: '随访状态',
      ...Object.fromEntries(comparisonData.map((c: any, i: number) => [`case_${i}`, c.followUp.status])),
    },
    {
      field: '质控评分',
      ...Object.fromEntries(comparisonData.map((c: any, i: number) => [`case_${i}`, c.qualityControl.score])),
    },
    {
      field: '病例标签',
      ...Object.fromEntries(comparisonData.map((c: any, i: number) => [`case_${i}`, c.tags])),
    },
  ] : []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="mb-0">病例对比分析</Title>
        <Space>
          <Select
            placeholder="选择要对比的病例"
            style={{ width: 300 }}
            onChange={handleAddCase}
            disabled={selectedCases.length >= 3}
            options={mockMedicalCases
              .filter(c => !selectedCases.includes(c.id))
              .map(c => ({
                value: c.id,
                label: `${c.id} - ${c.diagnosis.primary}`,
              }))}
          />
          <Button 
            type="primary" 
            icon={<SwapOutlined />}
            disabled={selectedCases.length < 2}
          >
            开始对比
          </Button>
        </Space>
      </div>

      {selectedCases.length > 0 && (
        <Card>
          <div className="mb-4">
            <Text strong>已选病例：</Text>
            <Space>
              {selectedCases.map(id => {
                const caseData = mockMedicalCases.find(c => c.id === id)
                return (
                  <Tag key={id} closable onClose={() => handleRemoveCase(id)}>
                    {caseData?.caseTitle}
                  </Tag>
                )
              })}
            </Space>
          </div>

          {comparisonData.length >= 2 ? (
            <Table
              columns={comparisonColumns}
              dataSource={comparisonRows}
              rowKey="field"
              pagination={false}
              scroll={{ x: 1200 }}
            />
          ) : (
            <Empty description="请至少选择2个病例进行对比" />
          )}
        </Card>
      )}

      <Card title="可选病例列表">
        <Row gutter={[16, 16]}>
          {mockMedicalCases.map(caseData => (
            <Col span={8} key={caseData.id}>
              <Card 
                size="small"
                hoverable
                onClick={() => handleAddCase(caseData.id)}
                className={`cursor-pointer ${selectedCases.includes(caseData.id) ? 'border-2 border-blue-500' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Text strong>{caseData.caseTitle}</Text>
                    <div className="mt-1">
                      <Tag color="red">{caseData.diagnosis.primary}</Tag>
                    </div>
                    <div className="mt-1">
                      <Text type="secondary" className="text-xs">{caseData.mdtInfo.meetingDate}</Text>
                    </div>
                  </div>
                  {selectedCases.includes(caseData.id) && (
                    <Tag color="blue">已选择</Tag>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  )
}
