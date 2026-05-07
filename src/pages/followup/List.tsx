import { useState } from 'react'
import { Card, Table, Button, Tag, Space, Typography, Modal, Form, Select, DatePicker, Input, message, Badge, Drawer, Alert, List, Progress, Divider, Statistic, Row, Col } from 'antd'
import { PlusOutlined, EditOutlined, StopOutlined, CalendarOutlined, RobotOutlined, WarningOutlined, CheckCircleOutlined, ExclamationCircleOutlined, ThunderboltOutlined, TeamOutlined } from '@ant-design/icons'
import { mockFollowupPlans } from '../../mocks/data'
import type { FollowupPlan } from '../../stores/consultationStore'
import type { ColumnsType } from 'antd/es/table'
import intelligentFollowupService, { FollowupAnalysisResult } from '../../services/integration/ai/intelligentFollowupService'
import dayjs from 'dayjs'

const { Title, Text } = Typography

export default function FollowupList() {
  const [data, setData] = useState(mockFollowupPlans)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<FollowupPlan | null>(null)
  const [form] = Form.useForm()
  
  // AI 分析相关状态
  const [analysisDrawerVisible, setAnalysisDrawerVisible] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<FollowupAnalysisResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedFollowup, setSelectedFollowup] = useState<FollowupPlan | null>(null)

  const handleAdd = () => {
    setEditingRecord(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: FollowupPlan) => {
    setEditingRecord(record)
    setModalVisible(true)
    form.setFieldsValue({
      patient: record.patientName,
      purpose: record.purpose,
      doctor: record.doctor,
    })
  }

  const handleSubmit = () => {
    form.validateFields().then(values => {
      console.log(values)
      message.success('随访计划创建成功')
      setModalVisible(false)
      form.resetFields()
    })
  }

  const handleTerminate = (id: string) => {
    Modal.confirm({
      title: '确认终止',
      content: '确定要终止该随访计划吗？',
      onOk: () => {
        setData(data.map(d => d.id === id ? { ...d, status: '已终止' as const } : d))
        message.success('已终止')
      }
    })
  }

  // AI 分析随访
  const handleAnalyze = async (record: FollowupPlan) => {
    setSelectedFollowup(record)
    setAnalyzing(true)
    setAnalysisDrawerVisible(true)
    
    try {
      // 模拟随访数据
      const mockFollowupData = {
        symptoms: ['无明显症状', '身体状况稳定'],
        medications: ['规律服药', '无明显不良反应'],
        qualityOfLife: { status: '良好', details: '睡眠、饮食正常' }
      }
      
      const result = await intelligentFollowupService.analyzeFollowup(record.id, mockFollowupData)
      setAnalysisResult(result)
    } catch (error) {
      message.error('分析失败，请重试')
      setAnalysisDrawerVisible(false)
    } finally {
      setAnalyzing(false)
    }
  }

  // 发起二次MDT
  const handleInitiateMDT = () => {
    if (analysisResult?.needSecondaryMDT) {
      message.success('已发起二次MDT会诊申请')
      setAnalysisDrawerVisible(false)
    }
  }

  const columns: ColumnsType<FollowupPlan> = [
    { title: '患者', dataIndex: 'patientName' },
    { title: '随访目的', dataIndex: 'purpose', ellipsis: true },
    { title: '计划周期', render: (_, r) => `${r.startDate} ~ ${r.endDate}` },
    { title: '下次随访', dataIndex: 'nextFollowup' },
    { title: '负责医生', dataIndex: 'doctor' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (t) => <Tag color={t === '进行中' ? 'green' : t === '已完成' ? 'blue' : 'red'}>{t}</Tag>
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
            type="primary"
            ghost
            icon={<RobotOutlined />}
            onClick={() => handleAnalyze(record)}
          >
            AI分析
          </Button>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.status === '进行中' && (
            <Button size="small" danger icon={<StopOutlined />} onClick={() => handleTerminate(record.id)}>
              终止
            </Button>
          )}
        </Space>
      )
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">随访计划管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新建随访计划
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={editingRecord ? "编辑随访计划" : "新建随访计划"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="选择患者" name="patient" rules={[{ required: true }]}>
            <Select placeholder="请选择患者">
              <Select.Option value="P001">王建国</Select.Option>
              <Select.Option value="P002">李秀英</Select.Option>
              <Select.Option value="P003">张伟</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="随访目的" name="purpose" rules={[{ required: true }]}>
            <Input placeholder="请输入随访目的" />
          </Form.Item>
          <Form.Item label="计划周期" rules={[{ required: true }]}>
            <Space>
              <Form.Item name="startDate" noStyle>
                <DatePicker placeholder="开始日期" />
              </Form.Item>
              <Text>至</Text>
              <Form.Item name="endDate" noStyle>
                <DatePicker placeholder="结束日期" />
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item label="随访节点" name="nodes">
            <Select mode="tags" placeholder="添加随访时间点，如：1个月、3个月、6个月">
              <Select.Option value="1个月">1个月</Select.Option>
              <Select.Option value="3个月">3个月</Select.Option>
              <Select.Option value="6个月">6个月</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="执行医生" name="doctor" rules={[{ required: true }]}>
            <Select placeholder="选择执行医生">
              <Select.Option value="张明华">张明华</Select.Option>
              <Select.Option value="李芳">李芳</Select.Option>
              <Select.Option value="陈伟">陈伟</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* AI 分析结果抽屉 */}
      <Drawer
        title={
          <Space>
            <RobotOutlined style={{ color: '#1890ff' }} />
            <span>AI 随访智能分析</span>
            {selectedFollowup && <Tag color="blue">{selectedFollowup.patientName}</Tag>}
          </Space>
        }
        placement="right"
        width={700}
        open={analysisDrawerVisible}
        onClose={() => {
          setAnalysisDrawerVisible(false)
          setAnalysisResult(null)
          setSelectedFollowup(null)
        }}
      >
        {analyzing ? (
          <div className="text-center py-20">
            <Progress type="circle" percent={100} status="active" />
            <div className="mt-4">
              <Text type="secondary">正在进行AI智能分析...</Text>
            </div>
          </div>
        ) : analysisResult ? (
          <>
            {/* 风险评估 */}
            <Card className="mb-4">
              <div className="text-center mb-4">
                <Progress
                  type="circle"
                  percent={analysisResult.riskScore}
                  format={(percent) => (
                    <div>
                      <div className="text-3xl font-bold" style={{ color: intelligentFollowupService.getRiskColor(analysisResult.riskLevel) }}>
                        {percent}
                      </div>
                      <div className="text-sm text-gray-500">风险评分</div>
                    </div>
                  )}
                  strokeColor={intelligentFollowupService.getRiskColor(analysisResult.riskLevel)}
                  size={120}
                />
              </div>
              
              <Divider />
              
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="风险等级"
                    value={intelligentFollowupService.getRiskText(analysisResult.riskLevel)}
                    valueStyle={{ color: intelligentFollowupService.getRiskColor(analysisResult.riskLevel), fontSize: '18px' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="预警数量"
                    value={analysisResult.warnings.length}
                    valueStyle={{ color: analysisResult.warnings.length > 0 ? '#ff4d4f' : '#52c41a' }}
                    prefix={analysisResult.warnings.length > 0 ? <WarningOutlined /> : <CheckCircleOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="需要二次MDT"
                    value={analysisResult.needSecondaryMDT ? '是' : '否'}
                    valueStyle={{ color: analysisResult.needSecondaryMDT ? '#ff4d4f' : '#52c41a', fontSize: '18px' }}
                    prefix={analysisResult.needSecondaryMDT ? <ExclamationCircleOutlined /> : <CheckCircleOutlined />}
                  />
                </Col>
              </Row>
            </Card>

            {/* 二次MDT提示 */}
            {analysisResult.needSecondaryMDT && (
              <Alert
                type="error"
                message="需要发起二次MDT会诊"
                description={
                  <div>
                    <p><strong>原因：</strong>{analysisResult.mdtReason}</p>
                    <p><strong>紧急程度：</strong>
                      <Tag color={
                        analysisResult.urgency === 'emergency' ? 'red' :
                        analysisResult.urgency === 'urgent' ? 'orange' : 'blue'
                      }>
                        {analysisResult.urgency === 'emergency' ? '紧急' :
                         analysisResult.urgency === 'urgent' ? '较急' : '常规'}
                      </Tag>
                    </p>
                  </div>
                }
                showIcon
                className="mb-4"
                action={
                  <Button type="primary" danger icon={<TeamOutlined />} onClick={handleInitiateMDT}>
                    发起二次MDT
                  </Button>
                }
              />
            )}

            {/* 预警列表 */}
            {analysisResult.warnings.length > 0 && (
              <Card title={<><WarningOutlined className="text-red-500 mr-2" />预警信息</>} className="mb-4">
                <List
                  dataSource={analysisResult.warnings}
                  renderItem={(warning) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            warning.severity === 'critical' ? 'bg-red-100' :
                            warning.severity === 'error' ? 'bg-orange-100' :
                            warning.severity === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                          }`}>
                            {warning.severity === 'critical' && <ExclamationCircleOutlined className="text-red-500" />}
                            {warning.severity === 'error' && <WarningOutlined className="text-orange-500" />}
                            {warning.severity === 'warning' && <WarningOutlined className="text-yellow-500" />}
                            {warning.severity === 'info' && <CheckCircleOutlined className="text-blue-500" />}
                          </div>
                        }
                        title={
                          <Space>
                            <Text strong>{warning.title}</Text>
                            <Tag color={
                              warning.severity === 'critical' ? 'red' :
                              warning.severity === 'error' ? 'orange' :
                              warning.severity === 'warning' ? 'gold' : 'blue'
                            }>
                              {warning.severity === 'critical' ? '严重' :
                               warning.severity === 'error' ? '错误' :
                               warning.severity === 'warning' ? '警告' : '提示'}
                            </Tag>
                          </Space>
                        }
                        description={
                          <div>
                            <p>{warning.description}</p>
                            <p className="text-blue-600"><strong>建议：</strong>{warning.suggestion}</p>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {/* AI 建议 */}
            <Card title={<><ThunderboltOutlined className="text-blue-500 mr-2" />AI 建议</>} className="mb-4">
              <List
                dataSource={analysisResult.recommendations}
                renderItem={(item) => (
                  <List.Item>
                    <CheckCircleOutlined className="text-green-500 mr-2" />
                    {item}
                  </List.Item>
                )}
              />
            </Card>

            {/* 下一步行动 */}
            <Card title="下一步行动">
              <List
                dataSource={analysisResult.nextActions}
                renderItem={(action) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Tag color={
                          action.priority === 'high' ? 'red' :
                          action.priority === 'medium' ? 'orange' : 'blue'
                        }>
                          {action.priority === 'high' ? '高' :
                           action.priority === 'medium' ? '中' : '低'}
                        </Tag>
                      }
                      title={action.action}
                      description={
                        <Space split={<Divider type="vertical" />}>
                          {action.deadline && <Text type="secondary">期限：{action.deadline}</Text>}
                          {action.responsible && <Text type="secondary">负责人：{action.responsible}</Text>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </>
        ) : null}
      </Drawer>
    </div>
  )
}