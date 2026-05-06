import { useState } from 'react'
import { Card, Steps, Form, Select, InputNumber, Button, Typography, Result, message, Space, Table } from 'antd'
import { UserOutlined, CalculatorOutlined, CheckCircleOutlined, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

export default function Assessment() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [form] = Form.useForm()
  const [scores, setScores] = useState<Record<string, number>>({})

  const patients = [
    { id: 'P001', name: '王建国', diagnosis: '左肺鳞癌III期' },
    { id: 'P002', name: '李秀英', diagnosis: '乳腺癌术后' },
    { id: 'P003', name: '张伟', diagnosis: '直肠癌伴肝转移' },
  ]

  const assessmentItems = [
    { id: 'target', name: '靶病灶大小', maxScore: 4 },
    { id: 'nonTarget', name: '非靶病灶', maxScore: 3 },
    { id: 'newLesion', name: '新病灶', maxScore: 2 },
  ]

  const calculateTotal = () => {
    const total = Object.values(scores).reduce((sum, s) => sum + (s || 0), 0)
    if (total === 0) return 'CR (完全缓解)'
    if (total === 1) return 'PR (部分缓解)'
    if (total <= 4) return 'SD (疾病稳定)'
    return 'PD (疾病进展)'
  }

  const handleSubmit = () => {
    message.success('评估已保存')
    setCurrentStep(2)
  }

  return (
    <div className="space-y-4">
      <Space>
        <Button icon={<ArrowLeftOutlined />} onClick={() => window.history.back()}>返回</Button>
        <Title level={4} className="!mb-0">疗效评估录入</Title>
      </Space>

      <Steps
        current={currentStep}
        items={[
          { title: '选择患者', icon: <UserOutlined /> },
          { title: '填写评估', icon: <CalculatorOutlined /> },
          { title: '完成', icon: <CheckCircleOutlined /> },
        ]}
      />

      {currentStep === 0 && (
        <Card title="选择随访患者">
          <Table
            dataSource={patients}
            columns={[
              { title: '姓名', dataIndex: 'name' },
              { title: '诊断', dataIndex: 'diagnosis' },
              {
                title: '操作',
                render: (_, record) => (
                  <Button
                    type={selectedPatient === record.id ? 'primary' : 'default'}
                    onClick={() => setSelectedPatient(record.id)}
                  >
                    {selectedPatient === record.id ? '已选择' : '选择'}
                  </Button>
                )
              }
            ]}
            rowKey="id"
            pagination={false}
          />
          <div className="mt-4 flex justify-end">
            <Button
              type="primary"
              disabled={!selectedPatient}
              onClick={() => setCurrentStep(1)}
            >
              下一步 <ArrowRightOutlined />
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 1 && (
        <Card title="RECIST疗效评估">
          <Form form={form} layout="vertical">
            <Form.Item label="评估日期" name="date" rules={[{ required: true }]}>
              <Input type="date" />
            </Form.Item>
            <Form.Item label="评估量表" name="scale">
              <Select
                defaultValue="RECIST"
                options={[
                  { value: 'RECIST', label: 'RECIST 1.1' },
                  { value: 'WHO', label: 'WHO标准' },
                  { value: 'KPS', label: 'Karnofsky评分' },
                ]}
              />
            </Form.Item>
          </Form>

          <div className="mt-4">
            <Text strong>靶病灶评估</Text>
            <div className="space-y-3 mt-2">
              {assessmentItems.map(item => (
                <div key={item.id} className="flex items-center gap-4">
                  <Text className="w-32">{item.name}</Text>
                  <Select
                    placeholder="选择评分"
                    style={{ width: 200 }}
                    value={scores[item.id]}
                    onChange={(v) => setScores({ ...scores, [item.id]: v })}
                    options={Array.from({ length: item.maxScore + 1 }, (_, i) => ({
                      value: i,
                      label: i === 0 ? 'CR (完全缓解)' : i === 1 ? 'PR (部分缓解)' : i === 2 ? 'SD (疾病稳定)' : 'PD (疾病进展)'
                    }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded">
            <Space>
              <Text strong>总体评价：</Text>
              <Text>{calculateTotal()}</Text>
            </Space>
          </div>

          <div className="mt-4 flex justify-between">
            <Button onClick={() => setCurrentStep(0)}><ArrowLeftOutlined /> 上一步</Button>
            <Button type="primary" onClick={handleSubmit}>提交评估</Button>
          </div>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <Result
            status="success"
            title="评估已完成"
            subTitle="评估结果已保存到患者360视图"
            extra={[
              <Button type="primary" key="back" onClick={() => window.history.back()}>
                返回
              </Button>,
              <Button key="new" onClick={() => { setCurrentStep(0); setScores({}); setSelectedPatient('') }}>
                新建评估
              </Button>
            ]}
          />
        </Card>
      )}
    </div>
  )
}