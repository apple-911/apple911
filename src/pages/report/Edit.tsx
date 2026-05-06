import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Space, Typography, Divider, Tag, Row, Col, message, Modal } from 'antd'
import { SaveOutlined, SendOutlined, CheckCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { mockReports, mockConsultations } from '../../mocks/data'

const { Title, Text } = Typography
const { TextArea } = Input

export default function ReportEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [content, setContent] = useState('')

  const report = mockReports.find(r => r.id === id)
  const consultation = report ? mockConsultations.find(c => c.id === report.consultationId) : null

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    message.success('报告已保存')
  }

  const handleSubmit = () => {
    Modal.confirm({
      title: '确认提交',
      content: '确定要提交报告进行审核吗？提交后将通知其他专家进行签名。',
      onOk: () => {
        message.success('报告已提交，等待专家签名')
        navigate('/report/list')
      }
    })
  }

  const handleSign = () => {
    Modal.confirm({
      title: '电子签名确认',
      content: '请确认您的电子签名（模拟）',
      onOk: () => {
        message.success('签名成功')
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
          <Title level={4} className="!mb-0">报告编辑</Title>
          <Tag color={report?.status === '草稿' ? 'default' : 'processing'}>{report?.status}</Tag>
        </Space>
        <Space>
          <Button icon={<SaveOutlined />} loading={saving} onClick={handleSave}>暂存草稿</Button>
          <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit}>提交审核</Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="报告内容">
            <Form form={form} layout="vertical">
              <Form.Item label="会诊意见">
                <TextArea rows={4} placeholder="请输入会诊意见..." />
              </Form.Item>
              <Form.Item label="诊疗建议">
                <TextArea rows={4} placeholder="请输入诊疗建议..." />
              </Form.Item>
              <Form.Item label="随访建议">
                <TextArea rows={3} placeholder="请输入随访建议..." />
              </Form.Item>
            </Form>

            <Divider />

            <Title level={5}>完整报告预览</Title>
            <Card className="!bg-gray-50">
              <div className="space-y-4">
                <div className="text-center">
                  <Title level={4}>MDT多学科会诊报告</Title>
                  <Text type="secondary">报告编号：{report?.id}</Text>
                </div>
                <Divider />
                <div>
                  <Text strong>患者信息</Text>
                  <p>姓名：{consultation?.patientName} | 住院号：{consultation?.patientInpatientNo}</p>
                  <p>诊断：{consultation?.mainDiagnosis}</p>
                </div>
                <div>
                  <Text strong>会诊信息</Text>
                  <p>会诊时间：{report?.consultationTime}</p>
                  <p>会诊类型：{consultation?.type}</p>
                </div>
                <div>
                  <Text strong>会诊意见</Text>
                  <p>{content || '（待填写）'}</p>
                </div>
                <div>
                  <Text strong>诊疗建议</Text>
                  <p>（待填写）</p>
                </div>
              </div>
            </Card>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="签名区">
            <div className="space-y-4">
              <div className="p-3 border rounded">
                <Space>
                  <CheckCircleOutlined className="text-green-500" />
                  <Text>张明华</Text>
                  <Tag color="green">已签名</Tag>
                </Space>
              </div>
              <div className="p-3 border rounded">
                <Space>
                  <Text>李芳</Text>
                  <Tag>待签名</Tag>
                </Space>
                <Button size="small" className="ml-4" onClick={handleSign}>签名</Button>
              </div>
              <div className="p-3 border rounded">
                <Space>
                  <Text>王建国</Text>
                  <Tag>待签名</Tag>
                </Space>
                <Button size="small" className="ml-4" onClick={handleSign}>签名</Button>
              </div>
            </div>
            <Divider />
            <Text type="secondary" className="text-xs">
              说明：所有专家签名完成后，报告将自动归档
            </Text>
          </Card>

          <Card title="会诊信息" className="mt-4">
            <div className="space-y-2">
              <p><Text type="secondary">患者：</Text>{consultation?.patientName}</p>
              <p><Text type="secondary">会诊时间：</Text>{report?.consultationTime}</p>
              <p><Text type="secondary">参与专家：</Text></p>
              <Space wrap>
                {consultation?.experts?.map(e => <Tag key={e.id}>{e.name}</Tag>)}
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}