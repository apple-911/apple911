import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Space, Typography, Avatar, Tag, List, Input, Tooltip, Layout, Typography as Typ, Badge } from 'antd'
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
} from '@ant-design/icons'
import { mockConsultations, mockExperts } from '../../mocks/data'

const { Header, Sider, Content } = Layout
const { Text, Title } = Typ

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
    </Layout>
  )
}
