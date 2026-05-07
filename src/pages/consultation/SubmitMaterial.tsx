import { useState, useEffect } from 'react'
import { Card, Table, Button, Tag, Space, Typography, Modal, Form, Input, Upload, message, Steps, Divider, Select, Tabs, Descriptions } from 'antd'
import {
  FileTextOutlined,
  UploadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  AudioOutlined,
  PlayCircleOutlined,
  EditOutlined,
  EyeOutlined,
  BookOutlined,
  UserOutlined,
  TeamOutlined,
  CheckSquareOutlined,
  SafetyOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

interface MaterialTask {
  id: string
  consultationId: string
  patientName: string
  patientInpatientNo: string
  meetingDate: string
  meetingTime: string
  department: string
  applyDoctor: string
  experts: Array<{ name: string; department: string }>
  status: '待提交' | '待秘书审核' | '待质控审核' | '审核通过' | '已退回'
  submitTime?: string
  meetingRecord?: string
  consultationReport?: string
  recommendations?: string[]
  recordingUrl?: string
  videoUrl?: string
  recordingDuration?: string
  videoDuration?: string
  rejectReason?: string
  // 审批记录相关字段
  secretaryAuditTime?: string  // 秘书审核时间
  secretaryAuditResult?: string  // 秘书审核结果
  secretaryComment?: string  // 秘书意见
  qualityAuditTime?: string  // 质控审核时间
  qualityReviewer?: string  // 质控审核人
  qualityScore?: number  // 质控评分
  qualityResult?: string  // 质控审核结果
  qualityComment?: string  // 质控意见
}

const mockTasks: MaterialTask[] = [
  {
    id: 'M001',
    consultationId: 'C001',
    patientName: '王建国',
    patientInpatientNo: 'ZY2024001234',
    meetingDate: '2024-03-15',
    meetingTime: '14:00-15:30',
    department: '肿瘤科',
    applyDoctor: '张明华',
    experts: [
      { name: '李芳', department: '胸外科' },
      { name: '王建国', department: '放射科' },
      { name: '刘晓燕', department: '病理科' }
    ],
    status: '待提交',
    meetingRecord: `2024-03-15 14:00-15:30 在 MDT 会诊中心召开多学科会诊。

参加专家：
- 胸外科：李芳 副主任医师
- 放射科：王建国 主任医师
- 病理科：刘晓燕 主任医师
- 肿瘤科：张明华 主任医师

会诊过程：
1. 申请科室汇报病史：患者王建国，65 岁，因"咳嗽、咳痰 3 个月"入院
2. 病理科汇报：（左肺穿刺）鳞癌，低分化
3. 放射科汇报：PET-CT 显示左肺上叶占位，伴纵隔淋巴结转移
4. 胸外科汇报：患者目前无手术指征
5. 各科专家讨论后一致同意行同步放化疗`,
    consultationReport: `一、诊断
左肺鳞癌 III 期（cT4N2M0）

二、治疗方案
1. 首选治疗方案：同步放化疗
   - 放疗：根治性放疗，DT 60-66Gy/30-33f
   - 化疗：紫杉醇 + 卡铂方案

2. 备选治疗方案：免疫治疗联合化疗
   - PD-1 抑制剂 + 紫杉醇 + 卡铂

三、随访计划
治疗结束后 4 周复查胸部 CT，之后每 3 个月复查一次。`,
    recommendations: [
      '完善基因检测',
      '评估心肺功能',
      '营养支持治疗',
      '定期复查血常规、肝肾功能'
    ],
    recordingUrl: '/recordings/C001_audio.mp3',
    videoUrl: '/recordings/C001_video.mp4',
    recordingDuration: '1:30:25',
    videoDuration: '1:28:15'
  },
  {
    id: 'M002',
    consultationId: 'C002',
    patientName: '李秀英',
    patientInpatientNo: 'ZY2024001256',
    meetingDate: '2024-03-14',
    meetingTime: '10:00-11:00',
    department: '乳腺外科',
    applyDoctor: '陈伟',
    experts: [
      { name: '陈伟', department: '乳腺外科' },
      { name: '张明华', department: '肿瘤科' }
    ],
    status: '待质控审核',
    submitTime: '2024-03-14 15:30',
    meetingRecord: '2024-03-14 10:00-11:00 完成多学科会诊',
    consultationReport: '术后辅助化疗方案：TC 方案× 4 周期',
    secretaryAuditTime: '2024-03-14 16:00',
    secretaryAuditResult: '通过',
    secretaryComment: '材料完整，符合规范'
  },
  {
    id: 'M003',
    consultationId: 'C003',
    patientName: '张伟',
    patientInpatientNo: 'ZY2024001189',
    meetingDate: '2024-03-13',
    meetingTime: '15:00-16:30',
    department: '胃肠外科',
    applyDoctor: '王建国',
    experts: [
      { name: '王建国', department: '胃肠外科' },
      { name: '李芳', department: '肿瘤科' }
    ],
    status: '已退回',
    submitTime: '2024-03-13 18:00',
    rejectReason: '会诊记录过于简单，请补充专家讨论详情',
    secretaryAuditTime: '2024-03-13 19:00',
    secretaryAuditResult: '通过',
    secretaryComment: '材料已审核'
  },
  {
    id: 'M004',
    consultationId: 'C004',
    patientName: '刘芳',
    patientInpatientNo: 'ZY2024001356',
    meetingDate: '2024-03-12',
    meetingTime: '09:00-10:30',
    department: '消化内科',
    applyDoctor: '周丽萍',
    experts: [
      { name: '张明华', department: '肿瘤科' },
      { name: '周丽萍', department: '营养科' }
    ],
    status: '审核通过',
    submitTime: '2024-03-12 14:00',
    secretaryAuditTime: '2024-03-12 15:00',
    secretaryAuditResult: '通过',
    secretaryComment: '材料完整规范',
    qualityAuditTime: '2024-03-12 16:30',
    qualityReviewer: '质控员 A',
    qualityScore: 4.5,
    qualityResult: '通过',
    qualityComment: '会诊记录详细，诊疗方案规范，符合指南要求'
  },
]

export default function SubmitMaterial() {
  const [tasks, setTasks] = useState(mockTasks)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedTask, setSelectedTask] = useState<MaterialTask | null>(null)
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)

  const handleSubmit = (task: MaterialTask) => {
    setSelectedTask(task)
    setCurrentStep(0)
    setModalVisible(true)
  }

  // 当 Modal 打开且 selectedTask 变化时，智能填充表单
  useEffect(() => {
    if (modalVisible && selectedTask && (selectedTask.status === '待提交' || selectedTask.status === '已退回')) {
      // 延迟填充，确保表单已初始化
      setTimeout(() => {
        form.setFieldsValue({
          meetingRecord: selectedTask.meetingRecord || '',
          consultationReport: selectedTask.consultationReport || '',
          recommendations: selectedTask.recommendations?.join('\n') || ''
        })
      }, 200)
    }
  }, [modalVisible, selectedTask])

  const handleView = (task: MaterialTask) => {
    setSelectedTask(task)
    setModalVisible(true)
  }

  const handleUpload = () => {
    form.validateFields().then(values => {
      if (currentStep < 2) {
        setCurrentStep(currentStep + 1)
      } else {
        // 提交
        setTasks(tasks.map(t => t.id === selectedTask?.id ? {
          ...t,
          status: '待秘书审核' as const,
          submitTime: new Date().toLocaleString('zh-CN', { hour12: false }),
          meetingRecord: values.meetingRecord,
          consultationReport: values.consultationReport,
          recommendations: values.recommendations?.split('\n').filter((r: string) => r.trim())
        } : t))
        setModalVisible(false)
        message.success('材料已提交，等待秘书审核')
      }
    })
  }

  const handleResubmit = () => {
    form.validateFields().then(values => {
      setTasks(tasks.map(t => t.id === selectedTask?.id ? {
        ...t,
        status: '待秘书审核' as const,
        submitTime: new Date().toLocaleString('zh-CN', { hour12: false }),
        meetingRecord: values.meetingRecord,
        consultationReport: values.consultationReport,
        recommendations: values.recommendations?.split('\n').filter((r: string) => r.trim()),
        rejectReason: undefined
      } : t))
      setModalVisible(false)
      message.success('材料已重新提交')
    })
  }

  const columns: ColumnsType<MaterialTask> = [
    { title: '任务 ID', dataIndex: 'id', width: 80 },
    {
      title: '会诊 ID',
      dataIndex: 'consultationId',
      width: 100,
      render: t => <Tag color="blue">#{t}</Tag>
    },
    {
      title: '患者信息',
      key: 'patient',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.patientName}</div>
          <div className="text-xs text-gray-500">{record.patientInpatientNo}</div>
        </div>
      )
    },
    {
      title: '会诊时间',
      key: 'meetingTime',
      width: 150,
      render: (_, record) => (
        <div>
          <div>{record.meetingTime}</div>
          <div className="text-xs text-gray-500">{record.meetingDate}</div>
        </div>
      )
    },
    { title: '申请科室', dataIndex: 'department', width: 120 },
    {
      title: '参会专家',
      dataIndex: 'experts',
      width: 200,
      render: (experts: Array<{ name: string; department: string }>) => (
        <Space direction="vertical" size={0}>
          {experts.slice(0, 2).map((e, i) => (
            <div key={i} className="text-xs">
              {e.name}({e.department})
            </div>
          ))}
          {experts.length > 2 && (
            <Tag color="gray">+{experts.length - 2}人</Tag>
          )}
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      render: (status: string) => {
        const config = {
          '待提交': { color: 'orange', icon: <ClockCircleOutlined /> },
          '待秘书审核': { color: 'blue', icon: <FileTextOutlined /> },
          '待质控审核': { color: 'purple', icon: <ExclamationCircleOutlined /> },
          '审核通过': { color: 'green', icon: <CheckCircleOutlined /> },
          '已退回': { color: 'red', icon: <ExclamationCircleOutlined /> }
        }
        const c = config[status as keyof typeof config]
        return (
          <Tag color={c.color} icon={c.icon}>
            {status}
          </Tag>
        )
      }
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      width: 160,
      render: (t?: string) => t ? <Text className="text-xs">{t}</Text> : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.status === '待提交' && (
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleSubmit(record)}
              block
            >
              提交材料
            </Button>
          )}
          {record.status === '已退回' && (
            <Button
              type="primary"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleSubmit(record)}
              block
            >
              修改重提
            </Button>
          )}
          {['待秘书审核', '待质控审核', '审核通过'].includes(record.status) && (
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              block
            >
              查看
            </Button>
          )}
        </Space>
      )
    },
  ]

  const isEditMode = selectedTask?.status === '待提交' || selectedTask?.status === '已退回'

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4}>MDT 材料归档</Title>
        <Space>
          <Text type="secondary">
            会诊结束后 24-48 小时内提交材料
          </Text>
        </Space>
      </div>

      <Card>
        <Space className="mb-4">
          <Select placeholder="状态筛选" allowClear style={{ width: 150 }}>
            <Select.Option value="待提交">待提交</Select.Option>
            <Select.Option value="待秘书审核">待秘书审核</Select.Option>
            <Select.Option value="待质控审核">待质控审核</Select.Option>
            <Select.Option value="审核通过">审核通过</Select.Option>
            <Select.Option value="已退回">已退回</Select.Option>
          </Select>
          <Select placeholder="时间段" allowClear style={{ width: 150 }}>
            <Select.Option value="week">本周</Select.Option>
            <Select.Option value="month">本月</Select.Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={
          <Space>
            <FileTextOutlined />
            <span>
              {selectedTask?.status === '待提交' ? '提交会诊材料' :
               selectedTask?.status === '已退回' ? '修改并重新提交' :
               '查看会诊材料'} - {selectedTask?.consultationId}
            </span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={900}
        footer={isEditMode ? [
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          currentStep > 0 && (
            <Button key="prev" onClick={() => setCurrentStep(currentStep - 1)}>
              上一步
            </Button>
          ),
          currentStep < 2 ? (
            <Button
              key="next"
              type="primary"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              下一步
            </Button>
          ) : (
            <Button
              key="submit"
              type="primary"
              onClick={selectedTask?.status === '已退回' ? handleResubmit : handleUpload}
            >
              {selectedTask?.status === '已退回' ? '重新提交' : '提交'}
            </Button>
          ),
        ] : [
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {isEditMode ? (
          <Steps
            current={currentStep}
            items={[
              {
                title: '填写会诊记录',
                icon: <FileTextOutlined />
              },
              {
                title: '填写会诊报告',
                icon: <EditOutlined />
              },
              {
                title: '确认提交',
                icon: <CheckCircleOutlined />
              }
            ]}
            className="mb-6"
          />
        ) : (
          <Divider>会诊信息</Divider>
        )}

        {isEditMode && currentStep === 0 && (
          <div className="space-y-4">
            <Card title="基本信息" size="small" className="bg-gray-50">
              <Space direction="vertical">
                <div><Text strong>患者：</Text>{selectedTask?.patientName} ({selectedTask?.patientInpatientNo})</div>
                <div><Text strong>会诊时间：</Text>{selectedTask?.meetingDate} {selectedTask?.meetingTime}</div>
                <div><Text strong>参会专家：</Text>
                  <Space wrap>
                    {selectedTask?.experts.map((e, i) => (
                      <Tag key={i}>{e.name}({e.department})</Tag>
                    ))}
                  </Space>
                </div>
              </Space>
            </Card>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <Space>
                <ExclamationCircleOutlined className="text-blue-600" />
                <Text className="text-blue-800">
                  系统已自动填充会诊信息，您可以根据实际情况修改完善
                </Text>
              </Space>
            </div>

            <Form form={form} layout="vertical">
              <Form.Item
                name="meetingRecord"
                label="会诊记录"
                rules={[{ required: true, message: '请输入会诊记录' }]}
                tooltip="详细记录会诊过程，包括专家讨论内容"
                extra={selectedTask?.meetingRecord ? 
                  <Tag color="blue">已自动填充</Tag> : 
                  <Tag>需手动填写</Tag>
                }
              >
                <Input.TextArea
                  rows={8}
                  placeholder={`请输入会诊记录，包括：
1. 申请科室汇报病史
2. 各科专家检查汇报
3. 专家讨论意见
4. 最终诊疗方案`}
                />
              </Form.Item>
            </Form>

            {selectedTask?.recordingUrl && (
              <Card title={<><AudioOutlined /> 会诊录音（参考）</>} size="small" className="bg-blue-50">
                <div className="space-y-3">
                  <audio controls className="w-full" src={selectedTask.recordingUrl}>
                    您的浏览器不支持音频播放
                  </audio>
                  <div className="text-sm text-gray-600">
                    <Space>
                      <Tag icon={<PlayCircleOutlined />} color="blue">时长：{selectedTask.recordingDuration}</Tag>
                      <Tag color="green">格式：MP3</Tag>
                    </Space>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {isEditMode && currentStep === 1 && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              <Space>
                <ExclamationCircleOutlined className="text-blue-600" />
                <Text className="text-blue-800">
                  系统已自动填充会诊报告和建議，您可以根据实际情况修改完善
                </Text>
              </Space>
            </div>

            <Form form={form} layout="vertical">
              <Form.Item
                name="consultationReport"
                label="会诊报告"
                rules={[{ required: true, message: '请输入会诊报告' }]}
                tooltip="最终形成的诊疗方案"
                extra={selectedTask?.consultationReport ? 
                  <Tag color="blue">已自动填充</Tag> : 
                  <Tag>需手动填写</Tag>
                }
              >
                <Input.TextArea
                  rows={6}
                  placeholder={`请输入会诊报告，包括：
一、诊断
二、治疗方案
三、随访计划`}
                />
              </Form.Item>

              <Form.Item
                name="recommendations"
                label="会诊建议"
                tooltip="给患者的后续治疗建议，每行一条"
                extra={selectedTask?.recommendations && selectedTask.recommendations.length > 0 ? 
                  <Tag color="blue">已自动填充 {selectedTask.recommendations.length} 条</Tag> : 
                  <Tag>需手动填写</Tag>
                }
              >
                <Input.TextArea
                  rows={4}
                  placeholder="请输入会诊建议，每行一条，例如：
完善基因检测
评估心肺功能
营养支持治疗"
                />
              </Form.Item>
            </Form>
          </div>
        )}

        {isEditMode && currentStep === 2 && (
          <div className="space-y-4">
            <Card 
              title={<><CheckCircleOutlined className="text-green-600" /> 请确认以下信息</>} 
              size="small"
              className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
            >
              <div className="space-y-4">
                {/* 基本信息 */}
                <div className="flex items-start gap-3 pb-3 border-b border-green-200">
                  <UserOutlined className="text-green-600 mt-1" />
                  <div className="flex-1">
                    <div className="mb-2">
                      <Text className="text-gray-600">患者：</Text>
                      <Text strong className="text-lg">{selectedTask?.patientName}</Text>
                      <Tag className="ml-2">{selectedTask?.patientInpatientNo}</Tag>
                    </div>
                    <div>
                      <Text className="text-gray-600">会诊时间：</Text>
                      <Text>{selectedTask?.meetingDate} {selectedTask?.meetingTime}</Text>
                    </div>
                  </div>
                </div>

                {/* 会诊记录 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileTextOutlined className="text-blue-600" />
                    <Text strong className="text-base">会诊记录</Text>
                    <Tag color="blue" icon={<CheckCircleOutlined />}>已填写</Tag>
                  </div>
                  <div className="ml-6 p-3 bg-white rounded border border-blue-100 text-sm max-h-48 overflow-y-auto shadow-sm">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {form.getFieldValue('meetingRecord')?.substring(0, 500)}
                      {form.getFieldValue('meetingRecord')?.length > 500 ? '...' : ''}
                    </div>
                  </div>
                </div>

                {/* 会诊报告 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileTextOutlined className="text-purple-600" />
                    <Text strong className="text-base">会诊报告</Text>
                    <Tag color="purple" icon={<CheckCircleOutlined />}>已填写</Tag>
                  </div>
                  <div className="ml-6 p-3 bg-white rounded border border-purple-100 text-sm max-h-48 overflow-y-auto shadow-sm">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {form.getFieldValue('consultationReport')?.substring(0, 500)}
                      {form.getFieldValue('consultationReport')?.length > 500 ? '...' : ''}
                    </div>
                  </div>
                </div>

                {/* 会诊建议 */}
                {form.getFieldValue('recommendations') && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckSquareOutlined className="text-orange-600" />
                      <Text strong className="text-base">会诊建议</Text>
                      <Tag color="orange" icon={<CheckCircleOutlined />}>
                        {form.getFieldValue('recommendations').split('\n').filter((r: string) => r.trim()).length} 条
                      </Tag>
                    </div>
                    <div className="ml-6 p-3 bg-white rounded border border-orange-100 shadow-sm">
                      <ul className="space-y-1">
                        {form.getFieldValue('recommendations').split('\n').filter((r: string) => r.trim()).map((rec: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-orange-500 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-lg shadow-sm">
              <Space>
                <ExclamationCircleOutlined className="text-amber-600 text-lg" />
                <Text className="text-amber-800 font-medium">
                  请确认信息无误后提交，提交后将进入审核流程
                </Text>
              </Space>
            </div>
          </div>
        )}

        {!isEditMode && (
          <div className="space-y-4">
            {/* 基本信息卡片 */}
            <Card 
              title={<><UserOutlined className="text-blue-600" /> 基本信息</>} 
              size="small"
              className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3 pb-3 border-b border-blue-100">
                  <UserOutlined className="text-blue-600 mt-1" />
                  <div className="flex-1">
                    <div className="mb-2">
                      <Text className="text-gray-600">患者：</Text>
                      <Text strong className="text-lg">{selectedTask?.patientName}</Text>
                      <Tag className="ml-2">{selectedTask?.patientInpatientNo}</Tag>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <Text className="text-gray-600">会诊日期：</Text>
                        <Text>{selectedTask?.meetingDate}</Text>
                      </div>
                      <div>
                        <Text className="text-gray-600">会诊时间：</Text>
                        <Text>{selectedTask?.meetingTime}</Text>
                      </div>
                      <div>
                        <Text className="text-gray-600">申请科室：</Text>
                        <Text>{selectedTask?.department}</Text>
                      </div>
                      <div>
                        <Text className="text-gray-600">申请医生：</Text>
                        <Text>{selectedTask?.applyDoctor}</Text>
                      </div>
                      {selectedTask?.submitTime && (
                        <div>
                          <Text className="text-gray-600">提交时间：</Text>
                          <Text>{selectedTask.submitTime}</Text>
                        </div>
                      )}
                      <div>
                        <Text className="text-gray-600">状态：</Text>
                        <Tag color={selectedTask?.status === '审核通过' ? 'green' : 'blue'}>
                          {selectedTask?.status}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 参会专家 */}
                <div className="flex items-start gap-3">
                  <TeamOutlined className="text-blue-600 mt-1" />
                  <div className="flex-1">
                    <Text strong className="text-gray-700">参会专家：</Text>
                    <Space wrap className="mt-2">
                      {selectedTask?.experts.map((e, i) => (
                        <Tag key={i} color="blue" className="text-sm">
                          {e.name}({e.department})
                        </Tag>
                      ))}
                    </Space>
                  </div>
                </div>
              </div>
            </Card>

            {/* 会诊记录 */}
            {selectedTask?.meetingRecord && (
              <Card 
                title={<><FileTextOutlined className="text-indigo-600" /> 会诊记录</>} 
                size="small"
                className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200"
              >
                <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed max-h-96 overflow-y-auto p-3 bg-white rounded border border-indigo-100 shadow-sm">
                  {selectedTask.meetingRecord}
                </div>
              </Card>
            )}

            {/* 会诊报告 */}
            {selectedTask?.consultationReport && (
              <Card 
                title={<><FileTextOutlined className="text-purple-600" /> 会诊报告</>} 
                size="small"
                className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
              >
                <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed max-h-96 overflow-y-auto p-3 bg-white rounded border border-purple-100 shadow-sm">
                  {selectedTask.consultationReport}
                </div>
              </Card>
            )}

            {/* 会诊建议 */}
            {selectedTask?.recommendations && selectedTask.recommendations.length > 0 && (
              <Card 
                title={<><CheckSquareOutlined className="text-orange-600" /> 会诊建议</>} 
                size="small"
                className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200"
              >
                <div className="p-3 bg-white rounded border border-orange-100 shadow-sm">
                  <ul className="space-y-2">
                    {selectedTask.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}

            {/* 会诊录音 */}
            {selectedTask?.recordingUrl && (
              <Card 
                title={<><AudioOutlined className="text-green-600" /> 会诊录音</>} 
                size="small"
                className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
              >
                <div className="space-y-3">
                  <audio controls className="w-full" src={selectedTask.recordingUrl}>
                    您的浏览器不支持音频播放
                  </audio>
                  <div className="text-sm text-gray-600">
                    <Space>
                      <Tag icon={<PlayCircleOutlined />} color="blue">时长：{selectedTask.recordingDuration || '未知'}</Tag>
                      <Tag color="green">格式：MP3</Tag>
                    </Space>
                  </div>
                </div>
              </Card>
            )}

            {/* 会诊录像 */}
            {selectedTask?.videoUrl && (
              <Card 
                title={<><PlayCircleOutlined className="text-red-600" /> 会诊录像</>} 
                size="small"
                className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200"
              >
                <div className="space-y-3">
                  <video controls className="w-full rounded-lg bg-black" style={{ maxHeight: '400px' }} src={selectedTask.videoUrl}>
                    您的浏览器不支持视频播放
                  </video>
                  <div className="text-sm text-gray-600">
                    <Space>
                      <Tag icon={<PlayCircleOutlined />} color="blue">时长：{selectedTask.videoDuration || '未知'}</Tag>
                      <Tag color="green">格式：MP4</Tag>
                    </Space>
                  </div>
                </div>
              </Card>
            )}

            {/* 审批记录 */}
            {(selectedTask?.secretaryAuditTime || selectedTask?.qualityAuditTime || selectedTask?.rejectReason) && (
              <Card 
                title={<><CheckCircleOutlined className="text-cyan-600" /> 审批记录</>} 
                size="small"
                className="bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200"
              >
                <div className="space-y-4">
                  {/* 秘书审核记录 */}
                  {selectedTask?.secretaryAuditTime ? (
                    <div className={`p-3 rounded border ${selectedTask.secretaryAuditResult === '通过' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <FileTextOutlined className={selectedTask.secretaryAuditResult === '通过' ? 'text-green-600' : 'text-red-600'} />
                        <Text strong>MDT 秘书审核</Text>
                        <Tag color={selectedTask.secretaryAuditResult === '通过' ? 'green' : 'red'}>
                          {selectedTask.secretaryAuditResult}
                        </Tag>
                      </div>
                      <div className="text-sm space-y-1 ml-6">
                        <div><Text className="text-gray-600">审核时间：</Text>{selectedTask.secretaryAuditTime}</div>
                        <div><Text className="text-gray-600">审核意见：</Text>{selectedTask.secretaryComment || '-'}</div>
                      </div>
                    </div>
                  ) : null}

                  {/* 质控审核记录 */}
                  {selectedTask?.qualityAuditTime ? (
                    <div className={`p-3 rounded border ${selectedTask.qualityResult === '通过' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <SafetyOutlined className={selectedTask.qualityResult === '通过' ? 'text-green-600' : 'text-red-600'} />
                        <Text strong>质控员审核</Text>
                        <Tag color={selectedTask.qualityResult === '通过' ? 'green' : 'red'}>
                          {selectedTask.qualityResult}
                        </Tag>
                      </div>
                      <div className="text-sm space-y-1 ml-6">
                        <div><Text className="text-gray-600">审核时间：</Text>{selectedTask.qualityAuditTime}</div>
                        <div><Text className="text-gray-600">审核人：</Text>{selectedTask.qualityReviewer || '-'}</div>
                        <div><Text className="text-gray-600">质控评分：</Text>
                          {selectedTask.qualityScore ? (
                            <Space>
                              <Rate disabled defaultValue={selectedTask.qualityScore} allowHalf size="small" />
                              <Text>{selectedTask.qualityScore}分</Text>
                            </Space>
                          ) : '-'}
                        </div>
                        <div><Text className="text-gray-600">质控意见：</Text>{selectedTask.qualityComment || '-'}</div>
                      </div>
                    </div>
                  ) : null}

                  {/* 退回原因 */}
                  {selectedTask?.rejectReason && (
                    <div className="p-3 bg-red-50 border-2 border-red-200 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <ExclamationCircleOutlined className="text-red-600" />
                        <Text strong>退回原因</Text>
                      </div>
                      <div className="ml-6 text-red-700 text-sm">
                        {selectedTask.rejectReason}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
