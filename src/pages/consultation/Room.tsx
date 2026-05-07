import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Space, Typography, Avatar, Tag, List, Input, Tooltip, Layout, Typography as Typ, Badge, Drawer, Alert, Divider, Tabs, Collapse, message } from 'antd'
import {
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraOutlined,
  DesktopOutlined,
  StopOutlined,
  MoreOutlined,
  SendOutlined,
  UserOutlined,
  MessageOutlined,
  ShareAltOutlined,
  BgColorsOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  BulbOutlined,
} from '@ant-design/icons'
import { mockConsultations, mockExperts } from '../../mocks/data'

const { Header, Sider, Content } = Layout
const { Text, Title } = Typ
const { Panel } = Collapse

// 转写记录类型
interface TranscriptionSegment {
  id: string
  speaker: string
  text: string
  timestamp: string
  isKeyPoint: boolean
  keywords: string[]
}

// 关键信息类型
interface KeyInformation {
  id: string
  type: '诊断' | '治疗' | '检查' | '用药' | '随访'
  content: string
  speaker: string
  timestamp: string
}

export default function ConsultationRoom() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [audioOn, setAudioOn] = useState(true)
  const [videoOn, setVideoOn] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: '张明华', message: '请大家查看患者的CT影像', time: '14:00' },
    { id: 2, user: '李芳', message: '收到，已调出影像资料', time: '14:01' },
    { id: 3, user: '王建国', message: '影像显示肿瘤有缩小迹象', time: '14:02' },
  ])
  const [newMessage, setNewMessage] = useState('')
  
  // 实时转写相关状态
  const [transcriptionDrawerVisible, setTranscriptionDrawerVisible] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriptionSegments, setTranscriptionSegments] = useState<TranscriptionSegment[]>([])
  const [keyInformation, setKeyInformation] = useState<KeyInformation[]>([])
  const [autoTranscribe, setAutoTranscribe] = useState(true)

  const consultation = mockConsultations.find(c => c.id === id)
  const participants = consultation?.experts || mockExperts.slice(0, 3)

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    setChatMessages([
      ...chatMessages,
      { id: Date.now(), user: '我', message: newMessage, time: new Date().toLocaleTimeString().slice(0, 5) }
    ])
    setNewMessage('')
  }

  // 开始/停止实时转写
  const toggleTranscription = () => {
    if (isTranscribing) {
      setIsTranscribing(false)
      message.success('已停止实时转写')
    } else {
      setIsTranscribing(true)
      setTranscriptionDrawerVisible(true)
      message.success('已开始实时转写')
      
      // 模拟实时转写（实际应接入语音识别 API）
      simulateTranscription()
    }
  }

  // 模拟实时转写
  const simulateTranscription = () => {
    const mockTranscriptions: TranscriptionSegment[] = [
      {
        id: '1',
        speaker: '张明华',
        text: '根据患者的CT影像，我们可以看到右肺上叶有一个约4.5厘米的占位性病变',
        timestamp: '14:05:23',
        isKeyPoint: true,
        keywords: ['CT影像', '右肺上叶', '占位性病变']
      },
      {
        id: '2',
        speaker: '李芳',
        text: '我建议先进行EGFR基因检测，如果阳性可以考虑靶向治疗',
        timestamp: '14:06:15',
        isKeyPoint: true,
        keywords: ['EGFR基因检测', '靶向治疗']
      },
      {
        id: '3',
        speaker: '陈伟',
        text: '从放疗的角度来看，可以考虑局部放疗联合靶向治疗',
        timestamp: '14:07:42',
        isKeyPoint: true,
        keywords: ['放疗', '联合治疗']
      }
    ]

    const mockKeyInfo: KeyInformation[] = [
      {
        id: '1',
        type: '诊断',
        content: '右肺上叶占位性病变，约4.5cm',
        speaker: '张明华',
        timestamp: '14:05:23'
      },
      {
        id: '2',
        type: '检查',
        content: '建议进行EGFR基因检测',
        speaker: '李芳',
        timestamp: '14:06:15'
      },
      {
        id: '3',
        type: '治疗',
        content: '考虑靶向治疗或放疗联合治疗',
        speaker: '陈伟',
        timestamp: '14:07:42'
      }
    ]

    // 逐条添加转写内容（模拟实时效果）
    let index = 0
    const interval = setInterval(() => {
      if (index < mockTranscriptions.length && isTranscribing) {
        setTranscriptionSegments(prev => [...prev, mockTranscriptions[index]])
        setKeyInformation(prev => [...prev, mockKeyInfo[index]])
        index++
      } else {
        clearInterval(interval)
      }
    }, 3000)
  }

  // 标记关键点
  const toggleKeyPoint = (segmentId: string) => {
    setTranscriptionSegments(prev =>
      prev.map(seg =>
        seg.id === segmentId ? { ...seg, isKeyPoint: !seg.isKeyPoint } : seg
      )
    )
  }

  return (
    <Layout className="!h-[calc(100vh-120px)] !bg-gray-900">
      <Sider width={250} className="!bg-gray-800 p-3">
        <div className="mb-4">
          <Text className="text-white font-bold">参会人员</Text>
          <Tag color="processing" className="ml-2">进行中</Tag>
        </div>
        <List
          dataSource={participants}
          renderItem={(expert) => (
            <List.Item className="!py-2 !px-1 hover:bg-gray-700 rounded">
              <List.Item.Meta
                avatar={
                  <Badge status={expert.status === '空闲' ? 'success' : 'warning'} />
                }
                title={<Text className="text-white text-sm">{expert.name}</Text>}
                description={<Text className="text-gray-400 text-xs">{expert.department}</Text>}
              />
              <AudioOutlined className="text-green-400 text-sm" />
            </List.Item>
          )}
        />

        <div className="mt-6 mb-4">
          <Text className="text-white font-bold">聊天区</Text>
        </div>
        <div className="flex flex-col h-64">
          <div className="flex-1 overflow-y-auto space-y-2 mb-2">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`p-2 rounded ${msg.user === '我' ? 'bg-blue-600 ml-4' : 'bg-gray-700 mr-4'}`}>
                <Text className="text-white text-xs">{msg.user} {msg.time}</Text>
                <Text className="text-white block text-sm">{msg.message}</Text>
              </div>
            ))}
          </div>
          <Input.TextArea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onPressEnter={handleSendMessage}
            placeholder="输入消息..."
            className="!bg-gray-700 !border-gray-600 !text-white"
          />
          <Button type="primary" icon={<SendOutlined />} onClick={handleSendMessage} className="mt-2">
            发送
          </Button>
        </div>
      </Sider>

      <Content className="!bg-gray-900 flex flex-col">
        <div className="flex-1 flex items-center justify-center relative">
          <div className="text-center">
            <Avatar size={120} icon={<UserOutlined />} className="!bg-medical-blue mb-4" />
            <Title level={3} className="text-white">{consultation?.patientName}</Title>
            <Text className="text-gray-400">{consultation?.mainDiagnosis}</Text>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Tag color="processing">会诊进行中</Tag>
            </div>
          </div>
        </div>
        
        <div className="h-20 !bg-gray-800 flex items-center justify-center gap-4">
          <Tooltip title={isTranscribing ? '停止实时转写' : '开始实时转写'}>
            <Button 
              type={isTranscribing ? 'primary' : 'default'} 
              shape="circle" 
              size="large"
              icon={<RobotOutlined />}
              onClick={toggleTranscription}
              className={isTranscribing ? '!bg-green-600 text-white' : '!bg-gray-700 text-white'}
            />
          </Tooltip>
          <Tooltip title={audioOn ? '关闭麦克风' : '开启麦克风'}>
            <Button 
              type={audioOn ? 'default' : 'text'} 
              shape="circle" 
              size="large"
              icon={audioOn ? <AudioOutlined /> : <AudioMutedOutlined />}
              onClick={() => setAudioOn(!audioOn)}
              className={audioOn ? '!bg-gray-700 text-white' : '!bg-red-600 text-white'}
            />
          </Tooltip>
          <Tooltip title={videoOn ? '关闭摄像头' : '开启摄像头'}>
            <Button 
              type={videoOn ? 'default' : 'text'} 
              shape="circle" 
              size="large"
              icon={<VideoCameraOutlined />}
              onClick={() => setVideoOn(!videoOn)}
              className={videoOn ? '!bg-gray-700 text-white' : '!bg-red-600 text-white'}
            />
          </Tooltip>
          <Tooltip title={sharing ? '停止共享' : '共享屏幕'}>
            <Button 
              type={sharing ? 'primary' : 'default'} 
              shape="circle" 
              size="large"
              icon={<DesktopOutlined />}
              onClick={() => setSharing(!sharing)}
              className={sharing ? '!bg-blue-600 text-white' : '!bg-gray-700 text-white'}
            />
          </Tooltip>
          <Tooltip title="结束会诊">
            <Button 
              type="text" 
              shape="circle" 
              size="large"
              icon={<StopOutlined />}
              danger
              onClick={() => navigate(`/consultation/detail/${id}`)}
            />
          </Tooltip>
          <Tooltip title="更多">
            <Button 
              type="text" 
              shape="circle" 
              size="large"
              icon={<MoreOutlined />}
              className="text-white"
            />
          </Tooltip>
        </div>
      </Content>

      <Sider width={280} className="!bg-gray-800 p-3">
        <div className="mb-4">
          <Text className="text-white font-bold">资料共享区</Text>
        </div>
        <div className="space-y-2">
          <Card size="small" className="!bg-gray-700 !border-gray-600">
            <Text className="text-white block">CT影像报告.pdf</Text>
            <Text className="text-gray-400 text-xs">已上传 14:00</Text>
          </Card>
          <Card size="small" className="!bg-gray-700 !border-gray-600">
            <Text className="text-white block">病理切片.jpg</Text>
            <Text className="text-gray-400 text-xs">已上传 14:05</Text>
          </Card>
          <Card size="small" className="!bg-gray-700 !border-gray-600">
            <Text className="text-white block">检验报告单.pdf</Text>
            <Text className="text-gray-400 text-xs">已上传 14:10</Text>
          </Card>
        </div>

        <Button block className="mt-4">+ 添加资料</Button>

        <div className="mt-6">
          <Text className="text-white font-bold">实时转写</Text>
          <div className="mt-2 p-2 bg-gray-700 rounded max-h-40 overflow-y-auto">
            <Text className="text-gray-300 text-sm block">张明华：各位请看这里...</Text>
            <Text className="text-gray-300 text-sm block">李芳：这个阴影...</Text>
            <Text className="text-gray-300 text-sm block">王建国：同意李主任意见...</Text>
          </div>
        </div>
      </Sider>

      {/* 实时转写抽屉 */}
      <Drawer
        title={
          <Space>
            <RobotOutlined style={{ color: '#52c41a' }} />
            <span>AI 实时转写</span>
            {isTranscribing && <Badge status="processing" text="转写中" />}
          </Space>
        }
        placement="right"
        width={500}
        open={transcriptionDrawerVisible}
        onClose={() => setTranscriptionDrawerVisible(false)}
      >
        <Tabs
          items={[
            {
              key: 'transcription',
              label: (
                <span>
                  <FileTextOutlined />
                  实时转写
                </span>
              ),
              children: (
                <div>
                  {transcriptionSegments.length === 0 ? (
                    <Alert
                      type="info"
                      message="等待开始转写..."
                      description="点击下方的转写按钮开始实时转写会诊内容"
                      showIcon
                    />
                  ) : (
                    <div className="space-y-3">
                      {transcriptionSegments.map((segment) => (
                        <Card
                          key={segment.id}
                          size="small"
                          className={segment.isKeyPoint ? '!border-green-500 !bg-green-50' : ''}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Space>
                              <Avatar size="small">{segment.speaker[0]}</Avatar>
                              <Text strong>{segment.speaker}</Text>
                              <Text type="secondary" className="text-xs">{segment.timestamp}</Text>
                            </Space>
                            <Button
                              size="small"
                              type={segment.isKeyPoint ? 'primary' : 'default'}
                              icon={<CheckCircleOutlined />}
                              onClick={() => toggleKeyPoint(segment.id)}
                            >
                              {segment.isKeyPoint ? '已标记' : '标记'}
                            </Button>
                          </div>
                          <Text className="block mb-2">{segment.text}</Text>
                          <div>
                            {segment.keywords.map((keyword, idx) => (
                              <Tag key={idx} color="blue" className="mb-1">{keyword}</Tag>
                            ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )
            },
            {
              key: 'keyInfo',
              label: (
                <span>
                  <BulbOutlined />
                  关键信息
                </span>
              ),
              children: (
                <div>
                  {keyInformation.length === 0 ? (
                    <Alert
                      type="info"
                      message="暂无关键信息"
                      description="转写过程中会自动提取关键信息"
                      showIcon
                    />
                  ) : (
                    <Collapse accordion>
                      {['诊断', '治疗', '检查', '用药', '随访'].map(type => {
                        const items = keyInformation.filter(info => info.type === type)
                        if (items.length === 0) return null
                        
                        return (
                          <Panel
                            key={type}
                            header={
                              <Space>
                                <Tag color={
                                  type === '诊断' ? 'red' :
                                  type === '治疗' ? 'blue' :
                                  type === '检查' ? 'green' :
                                  type === '用药' ? 'orange' : 'purple'
                                }>
                                  {type}
                                </Tag>
                                <Text>{items.length} 条</Text>
                              </Space>
                            }
                          >
                            {items.map(item => (
                              <Card key={item.id} size="small" className="mb-2">
                                <Text className="block mb-1">{item.content}</Text>
                                <Text type="secondary" className="text-xs">
                                  {item.speaker} · {item.timestamp}
                                </Text>
                              </Card>
                            ))}
                          </Panel>
                        )
                      })}
                    </Collapse>
                  )}
                </div>
              )
            }
          ]}
        />
        
        <Divider />
        
        <Space direction="vertical" className="w-full">
          <Alert
            type="info"
            message="AI 转写说明"
            description={
              <ul className="ml-4 text-sm">
                <li>自动识别发言人</li>
                <li>自动提取关键词</li>
                <li>智能标记关键决策点</li>
                <li>支持手动标记重要内容</li>
              </ul>
            }
            showIcon
          />
          <Button
            type="primary"
            icon={<RobotOutlined />}
            onClick={toggleTranscription}
            block
            danger={isTranscribing}
          >
            {isTranscribing ? '停止转写' : '开始转写'}
          </Button>
        </Space>
      </Drawer>
    </Layout>
  )
}
