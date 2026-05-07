import { useState } from 'react'
import { Card, Table, Button, Tag, Space, Typography, Modal, Form, Input, Select, DatePicker, Rate, message, Badge, Tabs, Radio, Checkbox, Drawer, Alert, List, Avatar, Divider, Progress } from 'antd'
import { PhoneOutlined, VideoCameraOutlined, MessageOutlined, PlusOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, RobotOutlined, SendOutlined, AudioOutlined, BulbOutlined, ThunderboltOutlined, FileTextOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import intelligentFollowupService from '../../services/integration/ai/intelligentFollowupService'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

// 随访方式
const FOLLOWUP_METHODS = [
  { value: 'phone', label: '电话随访', icon: <PhoneOutlined /> },
  { value: 'video', label: '视频随访', icon: <VideoCameraOutlined /> },
  { value: 'message', label: '消息随访', icon: <MessageOutlined /> },
  { value: 'visit', label: '门诊随访', icon: <CalendarOutlined /> },
]

// 随访评估项目
const ASSESSMENT_ITEMS = [
  { key: 'symptom', label: '症状评估', options: ['无不适', '轻度不适', '中度不适', '重度不适'] },
  { key: 'medication', label: '用药依从性', options: ['完全依从', '部分依从', '不依从'] },
  { key: 'diet', label: '饮食情况', options: ['正常', '一般', '较差'] },
  { key: 'sleep', label: '睡眠情况', options: ['良好', '一般', '较差'] },
  { key: 'mood', label: '情绪状态', options: ['良好', '焦虑', '抑郁'] },
  { key: 'exercise', label: '运动情况', options: ['规律运动', '偶尔运动', '缺乏运动'] },
]

// 随访记录数据类型
interface FollowupRecord {
  id: string
  patientName: string
  planId: string
  followupDate: string
  method: string
  symptom: string
  medication: string
  adherence: number
  notes: string
  nextFollowup: string
  doctor: string
  status: '已完成' | '未完成' | '已取消'
}

// 模拟数据
const mockRecords: FollowupRecord[] = [
  {
    id: '1',
    patientName: '王建国',
    planId: '1',
    followupDate: '2024-03-15',
    method: 'phone',
    symptom: '无不适',
    medication: '完全依从',
    adherence: 5,
    notes: '患者恢复良好，无特殊不适',
    nextFollowup: '2024-04-15',
    doctor: '张明华',
    status: '已完成',
  },
  {
    id: '2',
    patientName: '李秀英',
    planId: '2',
    followupDate: '2024-03-18',
    method: 'video',
    symptom: '轻度不适',
    medication: '部分依从',
    adherence: 3,
    notes: '伤口轻微疼痛，已指导用药',
    nextFollowup: '2024-04-18',
    doctor: '李芳',
    status: '已完成',
  },
  {
    id: '3',
    patientName: '张建国',
    planId: '3',
    followupDate: '2024-03-20',
    method: 'phone',
    symptom: '-',
    medication: '-',
    adherence: 0,
    notes: '-',
    nextFollowup: '2024-04-20',
    doctor: '陈伟',
    status: '未完成',
  },
]

export default function FollowupExecute() {
  const [records, setRecords] = useState(mockRecords)
  const [modalVisible, setModalVisible] = useState(false)
  const [recordType, setRecordType] = useState<'new' | 'reschedule'>('new')
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('pending')
  
  // AI 随访助手相关状态
  const [aiDrawerVisible, setAiDrawerVisible] = useState(false)
  const [aiChatMessages, setAiChatMessages] = useState<Array<{role: 'user' | 'ai', content: string, timestamp?: string}>>([])
  const [aiInput, setAiInput] = useState('')
  const [aiFollowupProgress, setAiFollowupProgress] = useState(0)
  const [aiFollowupComplete, setAiFollowupComplete] = useState(false)
  const [aiFollowupStage, setAiFollowupStage] = useState(0) // 0: 症状评估, 1: 用药情况, 2: 生活质量, 3: 复查安排
  const [aiFollowupData, setAiFollowupData] = useState<any>({
    symptoms: [],
    medications: [],
    qualityOfLife: {},
    nextAppointment: null
  })
  const [isRecording, setIsRecording] = useState(false)
  const [followupReport, setFollowupReport] = useState<any>(null)

  // 执行随访
  const handleExecute = (record: FollowupRecord) => {
    setRecordType('new')
    form.setFieldsValue({
      method: 'phone',
      symptom: '',
      medication: '',
      diet: '',
      sleep: '',
      mood: '',
      exercise: '',
      adherence: 5,
      notes: '',
    })
    setModalVisible(true)
  }

  // 重新预约
  const handleReschedule = (record: FollowupRecord) => {
    setRecordType('reschedule')
    form.setFieldsValue({
      reason: '',
      newDate: dayjs(),
    })
    setModalVisible(true)
  }

  // 提交随访记录
  const handleSubmit = () => {
    form.validateFields().then(values => {
      console.log('随访记录:', values)
      
      if (recordType === 'new') {
        // 完成随访
        const newRecord: FollowupRecord = {
          ...mockRecords.find(r => r.id === '3')!,
          ...values,
          status: '已完成',
          followupDate: dayjs().format('YYYY-MM-DD'),
        }
        setRecords(records.map(r => r.id === '3' ? newRecord : r))
        message.success('随访记录已保存')
      } else {
        // 重新预约
        message.success('已重新预约随访时间')
      }
      
      setModalVisible(false)
      form.resetFields()
    })
  }

  // AI 随访助手 - 发送消息
  const handleAiSendMessage = () => {
    if (!aiInput.trim()) return
    
    const timestamp = dayjs().format('HH:mm:ss')
    
    // 添加用户消息
    setAiChatMessages(prev => [...prev, { role: 'user', content: aiInput, timestamp }])
    const userMessage = aiInput
    setAiInput('')
    
    // 模拟 AI 回复
    setTimeout(() => {
      let aiResponse = ''
      let newProgress = aiFollowupProgress
      let newStage = aiFollowupStage
      const newData = { ...aiFollowupData }
      
      // 根据当前阶段处理用户输入
      switch (aiFollowupStage) {
        case 0: // 症状评估阶段
          if (userMessage.includes('没有') || userMessage.includes('正常') || userMessage.includes('良好')) {
            aiResponse = '很好！看来您的身体状况比较稳定。接下来我想了解一下您的用药情况。请问您是否按照医嘱规律服药？有没有出现药物不良反应？'
            newProgress = 30
            newStage = 1
            newData.symptoms = ['无明显症状', '身体状况稳定']
          } else if (userMessage.includes('有') || userMessage.includes('出现') || userMessage.includes('不适')) {
            aiResponse = '感谢您的反馈。为了更好地了解您的情况，请问具体出现了哪些症状？症状的严重程度如何（轻微、中度、严重）？持续多长时间了？'
            newData.symptoms.push(userMessage)
          } else if (userMessage.includes('严重') || userMessage.includes('加重')) {
            aiResponse = '我理解您的担忧。根据您描述的情况，建议您尽快到医院就诊。我会立即通知您的主治医生，并为您安排急诊。请问您现在方便前往医院吗？'
            newProgress = 25
            newData.symptoms.push('症状严重，需紧急处理')
          } else {
            aiResponse = '感谢您的回复。请问您能具体描述一下目前的症状吗？比如疼痛部位、程度、持续时间等。'
            newData.symptoms.push(userMessage)
          }
          break
          
        case 1: // 用药情况阶段
          if (userMessage.includes('规律') || userMessage.includes('按时') || userMessage.includes('正常')) {
            aiResponse = '非常好！规律服药对治疗效果很重要。接下来我想了解一下您的生活质量。请问您最近的睡眠、饮食、精神状态如何？有没有进行适当的运动？'
            newProgress = 50
            newStage = 2
            newData.medications = ['规律服药', '无明显不良反应']
          } else if (userMessage.includes('不良反应') || userMessage.includes('副作用') || userMessage.includes('不适')) {
            aiResponse = '我记录下了您的不良反应。请问具体是哪种药物引起的不良反应？症状是什么？是否影响了您的日常生活？'
            newData.medications.push('有不良反应: ' + userMessage)
          } else if (userMessage.includes('忘记') || userMessage.includes('漏服')) {
            aiResponse = '我理解有时会忘记服药。建议您设置闹钟提醒，或者将药物放在显眼的位置。如果漏服，请按照医嘱补服。接下来我们聊聊您的生活质量。'
            newProgress = 50
            newStage = 2
            newData.medications = ['偶尔漏服药物']
          } else {
            aiResponse = '感谢您的反馈。请问您目前服用的药物有哪些？服药频率是怎样的？'
            newData.medications.push(userMessage)
          }
          break
          
        case 2: // 生活质量阶段
          if (userMessage.includes('良好') || userMessage.includes('正常') || userMessage.includes('不错')) {
            aiResponse = '太好了！良好的生活质量对康复很有帮助。最后，我们来安排一下下次复查的时间。根据您的病情，建议您在2周后进行复查。您看这个时间合适吗？'
            newProgress = 75
            newStage = 3
            newData.qualityOfLife = { status: '良好', details: userMessage }
          } else if (userMessage.includes('差') || userMessage.includes('不好') || userMessage.includes('困难')) {
            aiResponse = '我理解您遇到了一些困难。建议您与主治医生沟通，我们可以调整治疗方案或提供相应的支持。请问您具体在哪些方面遇到了困难？'
            newData.qualityOfLife = { status: '需要关注', details: userMessage }
          } else {
            aiResponse = '感谢您的分享。为了更好地帮助您，请问您在日常生活中有没有遇到什么困难？比如饮食、睡眠、运动等方面？'
            newData.qualityOfLife = { status: '一般', details: userMessage }
          }
          break
          
        case 3: // 复查安排阶段
          if (userMessage.includes('可以') || userMessage.includes('合适') || userMessage.includes('没问题')) {
            aiResponse = '好的，我已经为您安排了2周后的复查。届时会有短信通知您具体时间。本次随访已经完成，我会生成一份详细的随访报告发送给您的主治医生。感谢您的配合，祝您早日康复！'
            newProgress = 100
            newData.nextAppointment = dayjs().add(14, 'day').format('YYYY-MM-DD')
            setAiFollowupComplete(true)
            generateFollowupReport(newData)
          } else if (userMessage.includes('不行') || userMessage.includes('改时间')) {
            aiResponse = '没问题，请问您希望什么时候进行复查？我会根据您的需求调整时间。'
          } else {
            aiResponse = '感谢您的回复。我会为您安排合适的复查时间，届时会有专人联系您确认。本次随访到此结束，感谢您的配合！'
            newProgress = 100
            newData.nextAppointment = '待定'
            setAiFollowupComplete(true)
            generateFollowupReport(newData)
          }
          break
          
        default:
          aiResponse = '感谢您的回复。我会将您的反馈记录下来并告知您的主治医生。'
      }
      
      setAiChatMessages(prev => [...prev, { role: 'ai', content: aiResponse, timestamp: dayjs().format('HH:mm:ss') }])
      setAiFollowupProgress(newProgress)
      setAiFollowupStage(newStage)
      setAiFollowupData(newData)
    }, 1000)
  }

  // 生成随访报告
  const generateFollowupReport = (data: any) => {
    const report = {
      followupDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      followupType: 'AI智能随访',
      symptoms: data.symptoms,
      medications: data.medications,
      qualityOfLife: data.qualityOfLife,
      nextAppointment: data.nextAppointment,
      summary: '患者整体情况稳定，需继续观察病情变化，按时复查。',
      recommendations: [
        '继续按医嘱服药',
        '注意休息，保持良好生活习惯',
        '如有不适及时就医',
        '按时复查'
      ]
    }
    setFollowupReport(report)
  }

  // 语音输入
  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false)
      message.success('录音已停止')
    } else {
      setIsRecording(true)
      message.info('开始录音，请说话...')
      
      // 模拟语音识别
      setTimeout(() => {
        const recognizedText = '我最近感觉还不错，没有明显的不适症状'
        setAiInput(recognizedText)
        setIsRecording(false)
        message.success('语音识别完成')
      }, 3000)
    }
  }

  // 开始 AI 随访
  const startAiFollowup = () => {
    setAiDrawerVisible(true)
    setAiChatMessages([
      { 
        role: 'ai', 
        content: '您好！我是AI随访助手。我将协助您完成本次随访。请问您最近身体状况如何？有没有出现新的症状或不适？' 
      }
    ])
    setAiFollowupProgress(10)
    setAiFollowupComplete(false)
  }

  // 待随访列表
  const pendingColumns: ColumnsType<FollowupRecord> = [
    {
      title: '患者',
      dataIndex: 'patientName',
      fixed: 'left',
      width: 100,
    },
    {
      title: '计划随访日期',
      dataIndex: 'followupDate',
      sorter: (a, b) => a.followupDate.localeCompare(b.followupDate),
    },
    {
      title: '随访方式',
      render: (_, r) => {
        const method = FOLLOWUP_METHODS.find(m => m.value === r.method)
        return (
          <Tag icon={method?.icon} color="blue">
            {method?.label || '电话随访'}
          </Tag>
        )
      },
    },
    {
      title: '负责医生',
      dataIndex: 'doctor',
    },
    {
      title: '状态',
      render: () => (
        <Badge status="processing" text="待随访" />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space wrap size="small">
          <Button 
            size="small" 
            type="primary"
            icon={<PhoneOutlined />}
            onClick={() => handleExecute(record)}
          >
            执行随访
          </Button>
          <Button 
            size="small"
            icon={<CalendarOutlined />}
            onClick={() => handleReschedule(record)}
          >
            重新预约
          </Button>
        </Space>
      ),
    },
  ]

  // 已完成列表
  const completedColumns: ColumnsType<FollowupRecord> = [
    {
      title: '患者',
      dataIndex: 'patientName',
      fixed: 'left',
      width: 100,
    },
    {
      title: '随访日期',
      dataIndex: 'followupDate',
    },
    {
      title: '随访方式',
      render: (_, r) => {
        const method = FOLLOWUP_METHODS.find(m => m.value === r.method)
        return (
          <Tag icon={method?.icon} color="green">
            {method?.label}
          </Tag>
        )
      },
    },
    {
      title: '症状评估',
      dataIndex: 'symptom',
      render: (text) => <Tag color={text === '无不适' ? 'green' : 'orange'}>{text}</Tag>,
    },
    {
      title: '用药依从性',
      dataIndex: 'medication',
      render: (text) => <Tag color={text === '完全依从' ? 'green' : text === '部分依从' ? 'orange' : 'red'}>{text}</Tag>,
    },
    {
      title: '依从性评分',
      dataIndex: 'adherence',
      render: (score: number) => (
        <Rate disabled value={score} />
      ),
    },
    {
      title: '随访医生',
      dataIndex: 'doctor',
    },
    {
      title: '下次随访',
      dataIndex: 'nextFollowup',
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: '状态',
      render: () => (
        <Badge status="success" text="已完成" />
      ),
    },
  ]

  const tabItems = [
    {
      key: 'pending',
      label: '待随访',
      children: (
        <Table 
          columns={pendingColumns} 
          dataSource={records.filter(r => r.status === '未完成')} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      ),
    },
    {
      key: 'completed',
      label: '已完成',
      children: (
        <Table 
          columns={completedColumns} 
          dataSource={records.filter(r => r.status === '已完成')} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1400 }}
        />
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">随访执行</Title>
        <Space>
          <Button 
            type="primary" 
            ghost
            icon={<RobotOutlined />} 
            onClick={startAiFollowup}
          >
            AI 随访助手
          </Button>
          <Badge count={records.filter(r => r.status === '未完成').length} overflowCount={99}>
            <Button type="primary" icon={<ClockCircleOutlined />}>
              待随访任务
            </Button>
          </Badge>
        </Space>
      </div>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
      </Card>

      {/* 随访记录 Modal */}
      <Modal
        title={recordType === 'new' ? '执行随访' : '重新预约随访'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        width={800}
      >
        {recordType === 'new' ? (
          <Form form={form} layout="vertical">
            <Card title="随访信息" size="small" className="mb-4">
              <Form.Item 
                label="随访方式" 
                name="method" 
                rules={[{ required: true, message: '请选择随访方式' }]}
              >
                <Radio.Group optionType="button" buttonStyle="solid">
                  {FOLLOWUP_METHODS.map(method => (
                    <Radio.Button key={method.value} value={method.value}>
                      {method.icon} {method.label}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </Form.Item>
            </Card>

            <Card title="评估项目" size="small" className="mb-4">
              <div className="grid grid-cols-2 gap-4">
                {ASSESSMENT_ITEMS.map(item => (
                  <Form.Item 
                    key={item.key}
                    label={item.label}
                    name={item.key}
                    className="!mb-3"
                  >
                    <Select allowClear>
                      {item.options.map(opt => (
                        <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                ))}
              </div>
            </Card>

            <Card title="用药依从性" size="small" className="mb-4">
              <Form.Item 
                label="依从性评分" 
                name="adherence"
                initialValue={5}
              >
                <Rate />
              </Form.Item>
              <Form.Item 
                label="用药说明" 
                name="medicationNote"
              >
                <TextArea rows={2} placeholder="患者用药情况说明..." />
              </Form.Item>
            </Card>

            <Card title="随访记录" size="small" className="mb-4">
              <Form.Item 
                label="随访小结" 
                name="notes"
                rules={[{ required: true, message: '请填写随访小结' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="记录患者当前状况、指导建议等..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Card>

            <Card title="下次随访" size="small">
              <Form.Item 
                label="建议下次随访时间" 
                name="nextFollowup"
                rules={[{ required: true, message: '请选择下次随访时间' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Card>
          </Form>
        ) : (
          <Form form={form} layout="vertical">
            <Form.Item 
              label="改期原因" 
              name="reason"
              rules={[{ required: true, message: '请填写改期原因' }]}
            >
              <TextArea rows={3} placeholder="请说明需要改期的原因..." />
            </Form.Item>
            <Form.Item 
              label="新的随访时间" 
              name="newDate"
              rules={[{ required: true, message: '请选择新的随访时间' }]}
            >
              <DatePicker showTime className="w-full" />
            </Form.Item>
          </Form>
        )}
      </Modal>

      {/* AI 随访助手抽屉 */}
      <Drawer
        title={
          <Space>
            <RobotOutlined style={{ color: '#52c41a' }} />
            <span>AI 随访助手</span>
            {aiFollowupComplete && <Badge status="success" text="已完成" />}
          </Space>
        }
        placement="right"
        width={600}
        open={aiDrawerVisible}
        onClose={() => {
          setAiDrawerVisible(false)
          setAiChatMessages([])
          setAiFollowupProgress(0)
          setAiFollowupStage(0)
          setAiFollowupComplete(false)
          setFollowupReport(null)
        }}
      >
        {!aiFollowupComplete ? (
          <>
            <Alert
              type="info"
              message="智能随访助手"
              description="AI助手将协助您完成随访对话，自动记录随访结果并生成报告。"
              showIcon
              className="mb-4"
            />
            
            {/* 随访进度 */}
            <Card size="small" className="mb-4">
              <div className="mb-2">
                <Space>
                  <Text strong>随访进度</Text>
                  <Tag color="blue">
                    {aiFollowupStage === 0 && '症状评估'}
                    {aiFollowupStage === 1 && '用药情况'}
                    {aiFollowupStage === 2 && '生活质量'}
                    {aiFollowupStage === 3 && '复查安排'}
                  </Tag>
                </Space>
              </div>
              <Progress 
                percent={aiFollowupProgress} 
                status="active"
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
              <div className="mt-2">
                <Space split={<Divider type="vertical" />}>
                  <Text type="secondary" className={aiFollowupStage >= 0 ? 'text-blue-500' : ''}>
                    {aiFollowupStage >= 0 ? '✓' : '○'} 症状评估
                  </Text>
                  <Text type="secondary" className={aiFollowupStage >= 1 ? 'text-blue-500' : ''}>
                    {aiFollowupStage >= 1 ? '✓' : '○'} 用药情况
                  </Text>
                  <Text type="secondary" className={aiFollowupStage >= 2 ? 'text-blue-500' : ''}>
                    {aiFollowupStage >= 2 ? '✓' : '○'} 生活质量
                  </Text>
                  <Text type="secondary" className={aiFollowupStage >= 3 ? 'text-blue-500' : ''}>
                    {aiFollowupStage >= 3 ? '✓' : '○'} 复查安排
                  </Text>
                </Space>
              </div>
            </Card>
            
            <Divider />
            
            {/* 对话区域 */}
            <div className="h-96 overflow-y-auto mb-4 p-3 bg-gray-50 rounded">
              <List
                dataSource={aiChatMessages}
                renderItem={(item) => (
                  <div className={`mb-3 ${item.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-md p-3 rounded-lg ${
                      item.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white border shadow-sm'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {item.role === 'ai' && <Avatar size="small" icon={<RobotOutlined />} className="!bg-green-500" />}
                        <Text strong className={item.role === 'user' ? 'text-white' : ''}>
                          {item.role === 'ai' ? 'AI 助手' : '我'}
                        </Text>
                        {item.timestamp && (
                          <Text type="secondary" className="text-xs">
                            {item.timestamp}
                          </Text>
                        )}
                      </div>
                      <Text className={item.role === 'user' ? 'text-white' : ''}>{item.content}</Text>
                    </div>
                  </div>
                )}
              />
            </div>
            
            {/* 输入区域 */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  onPressEnter={handleAiSendMessage}
                  placeholder="输入您的回复..."
                  size="large"
                />
                <Button 
                  type={isRecording ? 'primary' : 'default'}
                  danger={isRecording}
                  icon={<AudioOutlined />}
                  onClick={toggleRecording}
                  size="large"
                >
                  {isRecording ? '停止' : '语音'}
                </Button>
                <Button 
                  type="primary" 
                  icon={<SendOutlined />}
                  onClick={handleAiSendMessage}
                  size="large"
                >
                  发送
                </Button>
              </div>
              <Text type="secondary" className="text-xs">
                提示：您可以点击语音按钮进行语音输入，或直接输入文字回复
              </Text>
            </div>
          </>
        ) : (
          /* 随访完成 - 显示报告 */
          <>
            <Alert
              type="success"
              message="随访已完成"
              description="AI助手已完成本次随访，随访报告已自动生成。"
              showIcon
              className="mb-4"
            />
            
            {followupReport && (
              <Card title="随访报告" className="mb-4">
                <div className="space-y-4">
                  <div>
                    <Text strong>随访时间：</Text>
                    <Text>{followupReport.followupDate}</Text>
                  </div>
                  
                  <Divider />
                  
                  <div>
                    <Text strong className="block mb-2">症状评估：</Text>
                    <Space wrap>
                      {followupReport.symptoms.map((symptom: string, idx: number) => (
                        <Tag key={idx} color="blue">{symptom}</Tag>
                      ))}
                    </Space>
                  </div>
                  
                  <div>
                    <Text strong className="block mb-2">用药情况：</Text>
                    <Space wrap>
                      {followupReport.medications.map((med: string, idx: number) => (
                        <Tag key={idx} color="green">{med}</Tag>
                      ))}
                    </Space>
                  </div>
                  
                  <div>
                    <Text strong className="block mb-2">生活质量：</Text>
                    <Tag color={followupReport.qualityOfLife.status === '良好' ? 'green' : 'orange'}>
                      {followupReport.qualityOfLife.status}
                    </Tag>
                    <Paragraph className="mt-2">{followupReport.qualityOfLife.details}</Paragraph>
                  </div>
                  
                  <div>
                    <Text strong className="block mb-2">下次复查：</Text>
                    <Tag color="purple">{followupReport.nextAppointment}</Tag>
                  </div>
                  
                  <Divider />
                  
                  <div>
                    <Text strong className="block mb-2">随访总结：</Text>
                    <Paragraph>{followupReport.summary}</Paragraph>
                  </div>
                  
                  <div>
                    <Text strong className="block mb-2">建议：</Text>
                    <List
                      size="small"
                      dataSource={followupReport.recommendations}
                      renderItem={(item: string) => (
                        <List.Item>
                          <CheckCircleOutlined className="text-green-500 mr-2" />
                          {item}
                        </List.Item>
                      )}
                    />
                  </div>
                </div>
              </Card>
            )}
            
            <Space direction="vertical" className="w-full">
              <Button 
                type="primary" 
                block 
                size="large"
                icon={<FileTextOutlined />}
                onClick={() => {
                  message.success('随访报告已发送给主治医生')
                  setAiDrawerVisible(false)
                }}
              >
                发送报告给医生
              </Button>
              <Button 
                block 
                size="large"
                onClick={() => {
                  message.success('报告已下载')
                }}
              >
                下载报告
              </Button>
            </Space>
          </>
        )}
      </Drawer>
    </div>
  )
}
