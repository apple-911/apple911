import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Space, Typography, Avatar, Tag, Input, message, Modal } from 'antd'
import {
  AudioOutlined,
  AudioMutedOutlined,
  VideoCameraOutlined,
  StopOutlined,
  DesktopOutlined,
  MessageOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  FullscreenOutlined,
  CameraOutlined,
} from '@ant-design/icons'
import { mockConsultations, mockExperts } from '../../mocks/data'

const { Text, Title } = Typography

export default function MRoom() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [audioOn, setAudioOn] = useState(true)
  const [videoOn, setVideoOn] = useState(true)
  const [sharing, setSharing] = useState(false)
  const [chatVisible, setChatVisible] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: '张明华', message: '请大家查看患者的CT影像' },
    { id: 2, user: '李芳', message: '收到，已调出' },
  ])
  const [newMessage, setNewMessage] = useState('')

  const consultation = mockConsultations.find(c => c.id === id)
  const participants = consultation?.experts || mockExperts.slice(0, 3)

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    setChatMessages([...chatMessages, { id: Date.now(), user: '我', message: newMessage }])
    setNewMessage('')
  }

  const handleEndCall = () => {
    Modal.confirm({
      title: '确认结束',
      content: '确定要结束此次会诊吗？',
      onOk: () => {
        message.success('会诊已结束')
        navigate('/m/home')
      }
    })
  }

  return (
    <div className="min-h-screen !bg-gray-900 flex flex-col">
      <div className="p-3 flex items-center justify-between !bg-gray-800">
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="!text-white"
            onClick={() => navigate('/m/home')}
          />
          <Text className="!text-white">会诊中</Text>
          <Tag color="red" className="animate-pulse">录制</Tag>
        </Space>
        <Button type="primary" danger size="small" onClick={handleEndCall}>
          结束
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center relative">
        <div className="text-center">
          <Avatar size={100} icon={<UserOutlined />} className="!bg-medical-blue mb-4" />
          <Title level={4} className="!text-white">{consultation?.patientName}</Title>
          <Text className="text-gray-400">{consultation?.mainDiagnosis?.substring(0, 20)}...</Text>
        </div>

        <div className="absolute top-4 left-4 right-4 flex justify-between">
          <Tag color="processing">进行中</Tag>
          <Text className="!text-white/60">14:32</Text>
        </div>

        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 max-w-full px-4">
          <Button
            shape="circle"
            size="large"
            icon={audioOn ? <AudioOutlined /> : <AudioMutedOutlined />}
            type={audioOn ? 'primary' : 'default'}
            danger={!audioOn}
            onClick={() => setAudioOn(!audioOn)}
          />
          <Button
            shape="circle"
            size="large"
            icon={videoOn ? <VideoCameraOutlined /> : <StopOutlined />}
            type={videoOn ? 'primary' : 'default'}
            danger={!videoOn}
            onClick={() => setVideoOn(!videoOn)}
          />
          <Button
            shape="circle"
            size="large"
            icon={<DesktopOutlined />}
            type={sharing ? 'primary' : 'default'}
            onClick={() => setSharing(!sharing)}
          />
          <Button
            shape="circle"
            size="large"
            icon={<MessageOutlined />}
            onClick={() => setChatVisible(!chatVisible)}
          />
          <Button
            shape="circle"
            size="large"
            icon={<CameraOutlined />}
          />
        </div>
      </div>

      {chatVisible && (
        <div className="absolute top-16 right-0 w-72 h-96 !bg-gray-800 p-3 flex flex-col shadow-lg">
          <div className="flex justify-between items-center mb-2">
            <Text className="!text-white">聊天</Text>
            <Button type="text" size="small" className="!text-white" onClick={() => setChatVisible(false)}>关闭</Button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 mb-2">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-2 rounded ${msg.user === '我' ? 'bg-blue-600 ml-8' : 'bg-gray-700 mr-8'}`}
              >
                <Text className="text-white text-xs block">{msg.user}</Text>
                <Text className="text-white text-sm">{msg.message}</Text>
              </div>
            ))}
          </div>
          <Space.Compact className="w-full">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onPressEnter={handleSendMessage}
              className="!bg-gray-700 !text-white"
              placeholder="输入消息..."
            />
            <Button type="primary" onClick={handleSendMessage}>发送</Button>
          </Space.Compact>
        </div>
      )}

      <div className="p-3 !bg-gray-800">
        <Text className="!text-white/60 text-xs">参会人员：{participants.map(p => p.name).join('、')}</Text>
      </div>
    </div>
  )
}