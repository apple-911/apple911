/**
 * 视频会议组件
 * 
 * 提供多方视频通话、屏幕共享、聊天、白板等功能
 */

import React, { useState, useEffect, useRef } from 'react'
import { Button, Space, Tooltip, Badge, Modal, Input, message } from 'antd'
import {
  VideoCameraOutlined,
  VideoCameraInvertedOutlined,
  MicOutlined,
  MicOffOutlined,
  ScreenShareOutlined,
  StopOutlined,
  PhoneOutlined,
  PhoneExitOutlined,
  MessageOutlined,
  SettingOutlined,
  RecordOutlined
} from '@ant-design/icons'
import { videoConferenceService, Participant, ChatMessage } from '../../services/integration/video/conferenceService'

interface VideoConferenceProps {
  meetingId: string
  onLeave?: () => void
  className?: string
}

export const VideoConference: React.FC<VideoConferenceProps> = ({
  meetingId,
  onLeave,
  className
}) => {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map())
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [screenSharing, setScreenSharing] = useState(false)
  const [recording, setRecording] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideosRef = useRef<Map<string, HTMLVideoElement>>(new Map())

  // 初始化会议
  useEffect(() => {
    initConference()
    setupEventListeners()

    return () => {
      cleanup()
    }
  }, [meetingId])

  // 本地视频流渲染
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
  }, [localStream])

  // 远程视频流渲染
  useEffect(() => {
    remoteStreams.forEach((stream, participantId) => {
      const videoElement = remoteVideosRef.current.get(participantId)
      if (videoElement) {
        videoElement.srcObject = stream
      }
    })
  }, [remoteStreams])

  const initConference = async () => {
    try {
      // 加入会议
      await videoConferenceService.joinMeeting(meetingId, {
        name: '当前用户',
        role: 'participant',
        department: '科室',
        title: '职称',
        videoEnabled: true,
        audioEnabled: true,
        screenSharing: false
      })

      // 获取本地流
      const stream = videoConferenceService.getLocalStream()
      setLocalStream(stream)
    } catch (error) {
      console.error('初始化会议失败:', error)
      message.error('加入会议失败')
    }
  }

  const setupEventListeners = () => {
    // 监听参会者变化
    videoConferenceService.on('participantJoined', (participant: Participant) => {
      setParticipants(prev => [...prev, participant])
      message.info(`${participant.name} 加入会议`)
    })

    // 监听远程流
    videoConferenceService.on('remoteStreamAdded', (participantId: string, stream: MediaStream) => {
      setRemoteStreams(prev => new Map(prev).set(participantId, stream))
    })

    // 监听聊天消息
    videoConferenceService.on('chatMessageSent', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message])
    })

    // 监听录制状态
    videoConferenceService.on('recordingStarted', () => {
      setRecording(true)
      message.success('开始录制')
    })

    videoConferenceService.on('recordingStopped', () => {
      setRecording(false)
      message.success('录制已停止')
    })

    // 监听会议结束
    videoConferenceService.on('meetingEnded', () => {
      message.info('会议已结束')
      onLeave?.()
    })
  }

  const cleanup = () => {
    videoConferenceService.removeAllListeners()
  }

  const handleToggleVideo = async () => {
    try {
      await videoConferenceService.toggleVideo(!videoEnabled)
      setVideoEnabled(!videoEnabled)
    } catch (error) {
      console.error('切换摄像头失败:', error)
    }
  }

  const handleToggleAudio = async () => {
    try {
      await videoConferenceService.toggleAudio(!audioEnabled)
      setAudioEnabled(!audioEnabled)
    } catch (error) {
      console.error('切换麦克风失败:', error)
    }
  }

  const handleScreenShare = async () => {
    try {
      if (screenSharing) {
        videoConferenceService.stopScreenShare()
        setScreenSharing(false)
      } else {
        await videoConferenceService.startScreenShare()
        setScreenSharing(true)
        message.success('开始屏幕共享')
      }
    } catch (error) {
      console.error('屏幕共享失败:', error)
      message.error('屏幕共享失败')
    }
  }

  const handleRecording = async () => {
    if (recording) {
      videoConferenceService.stopRecording()
    } else {
      await videoConferenceService.startRecording()
    }
  }

  const handleLeave = async () => {
    Modal.confirm({
      title: '确认离开',
      content: '确定要离开会议吗？',
      onOk: async () => {
        await videoConferenceService.leaveMeeting()
        onLeave?.()
      }
    })
  }

  const handleSendChat = () => {
    if (!chatInput.trim()) return

    videoConferenceService.sendChatMessage(chatInput.trim())
    setChatInput('')
  }

  return (
    <div className={`flex h-full ${className}`}>
      {/* 视频区域 */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {/* 顶部栏 */}
        <div className="h-14 bg-gray-800 flex items-center justify-between px-4">
          <div className="text-white font-semibold">MDT 远程会诊</div>
          <div className="flex items-center space-x-2">
            <Badge count={participants.length + 1} overflowCount={99}>
              <span className="text-white text-sm">参会者</span>
            </Badge>
            {recording && (
              <Badge dot color="red">
                <span className="text-white text-sm">录制中</span>
              </Badge>
            )}
          </div>
        </div>

        {/* 视频网格 */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {/* 本地视频 */}
            <div className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                我 {videoEnabled ? '' : '(摄像头已关)'}
              </div>
              {!videoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <VideoCameraInvertedOutlined className="text-6xl text-gray-600" />
                </div>
              )}
            </div>

            {/* 远程视频 */}
            {Array.from(remoteStreams.entries()).map(([participantId, stream]) => (
              <div key={participantId} className="relative bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={el => {
                    if (el) remoteVideosRef.current.set(participantId, el)
                    else remoteVideosRef.current.delete(participantId)
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  参会者 {participants.find(p => p.id === participantId)?.name || ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 底部控制栏 */}
        <div className="h-16 bg-gray-800 flex items-center justify-center space-x-4 px-4">
          <Tooltip title={videoEnabled ? '关闭摄像头' : '开启摄像头'}>
            <Button
              type={videoEnabled ? 'default' : 'primary'}
              danger={!videoEnabled}
              size="large"
              icon={videoEnabled ? <VideoCameraOutlined /> : <VideoCameraInvertedOutlined />}
              onClick={handleToggleVideo}
            />
          </Tooltip>

          <Tooltip title={audioEnabled ? '静音' : '取消静音'}>
            <Button
              type={audioEnabled ? 'default' : 'primary'}
              danger={!audioEnabled}
              size="large"
              icon={audioEnabled ? <MicOutlined /> : <MicOffOutlined />}
              onClick={handleToggleAudio}
            />
          </Tooltip>

          <Tooltip title={screenSharing ? '停止共享' : '屏幕共享'}>
            <Button
              type={screenSharing ? 'primary' : 'default'}
              size="large"
              icon={screenSharing ? <StopOutlined /> : <ScreenShareOutlined />}
              onClick={handleScreenShare}
            />
          </Tooltip>

          <Tooltip title={recording ? '停止录制' : '开始录制'}>
            <Button
              type={recording ? 'primary' : 'default'}
              danger={recording}
              size="large"
              icon={<RecordOutlined />}
              onClick={handleRecording}
            />
          </Tooltip>

          <Tooltip title="聊天">
            <Button
              size="large"
              icon={<MessageOutlined />}
              onClick={() => setShowChat(!showChat)}
            />
          </Tooltip>

          <Tooltip title="设置">
            <Button size="large" icon={<SettingOutlined />} />
          </Tooltip>

          <div className="border-l border-gray-600 h-8 mx-2" />

          <Tooltip title="离开会议">
            <Button
              danger
              size="large"
              icon={<PhoneExitOutlined />}
              onClick={handleLeave}
            />
          </Tooltip>
        </div>
      </div>

      {/* 聊天面板 */}
      {showChat && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4">
            <span className="font-semibold">会议聊天</span>
            <Button type="text" size="small" onClick={() => setShowChat(false)}>
              关闭
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chatMessages.map(msg => (
              <div key={msg.id} className="bg-gray-100 rounded-lg p-2">
                <div className="text-xs text-gray-500 mb-1">
                  {msg.senderName} {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
                <div className="text-sm">{msg.content}</div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200">
            <Input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onPressEnter={handleSendChat}
              placeholder="输入消息..."
              allowClear
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoConference
