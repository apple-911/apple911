/**
 * 实时音视频会诊服�? * 
 * 基于 WebRTC 实现多方视频会议、屏幕共享、会诊协作等功能
 */

import { EventEmitter } from '../../../utils/EventEmitter'

// 参会者信�?export interface Participant {
  id: string
  name: string
  role: 'host' | 'presenter' | 'participant'
  department: string
  title: string
  videoEnabled: boolean
  audioEnabled: boolean
  screenSharing: boolean
  joinedAt: string
  mediaStream?: MediaStream
}

// 会议信息
export interface Meeting {
  id: string
  title: string
  consultationId: string
  hostId: string
  participants: Participant[]
  startTime?: string
  endTime?: string
  status: 'waiting' | 'in-progress' | 'ended'
  recording?: boolean
}

// 聊天消息
export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  type: 'text' | 'image' | 'file' | 'system'
}

// 白板标注
export interface WhiteboardAnnotation {
  id: string
  type: 'line' | 'rect' | 'circle' | 'text' | 'arrow'
  points: { x: number; y: number }[]
  color: string
  lineWidth: number
  text?: string
  timestamp: string
}

export class VideoConferenceService extends EventEmitter {
  private localStream: MediaStream | null = null
  private peerConnections: Map<string, RTCPeerConnection> = new Map()
  private dataChannel: RTCDataChannel | null = null
  private meeting: Meeting | null = null
  private screenStream: MediaStream | null = null
  
  private readonly config: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      // 生产环境应使用自己的 STUN/TURN 服务�?      {
        urls: 'turn:your-turn-server.com',
        username: 'user',
        credential: 'pass'
      }
    ]
  }

  /**
   * 初始化本地媒体流
   */
  async initLocalStream(video = true, audio = true): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        video: video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        } : false,
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      this.localStream = stream
      
      this.emit('localStreamReady', stream)
      return stream
    } catch (error) {
      console.error('获取媒体流失�?', error)
      throw new Error('无法访问摄像头或麦克�?)
    }
  }

  /**
   * 创建会议
   */
  async createMeeting(title: string, consultationId: string): Promise<Meeting> {
    const meeting: Meeting = {
      id: `meeting-${Date.now()}`,
      title,
      consultationId,
      hostId: 'current-user-id', // 实际应从认证信息获取
      participants: [],
      status: 'waiting'
    }

    this.meeting = meeting
    this.emit('meetingCreated', meeting)
    return meeting
  }

  /**
   * 加入会议
   */
  async joinMeeting(meetingId: string, participantInfo: Omit<Participant, 'id' | 'joinedAt'>): Promise<void> {
    try {
      const participant: Participant = {
        ...participantInfo,
        id: 'participant-' + Date.now(),
        joinedAt: new Date().toISOString()
      }

      // 添加本地参会�?      if (this.meeting) {
        this.meeting.participants.push(participant)
      }

      // 初始化本地媒体流
      await this.initLocalStream(participant.videoEnabled, participant.audioEnabled)

      this.emit('participantJoined', participant)
    } catch (error) {
      console.error('加入会议失败:', error)
      throw error
    }
  }

  /**
   * 邀请参会�?   */
  async inviteParticipant(participant: Omit<Participant, 'id' | 'joinedAt'>): Promise<void> {
    // 实际项目中应该通过信使服务器发送邀�?    console.log('邀请参会�?', participant)
    this.emit('participantInvited', participant)
  }

  /**
   * 建立 Peer 连接
   */
  async createPeerConnection(participantId: string): Promise<RTCPeerConnection> {
    const pc = new RTCPeerConnection(this.config)

    // 添加本地媒体轨道
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!)
      })
    }

    // 处理远程轨道
    pc.ontrack = (event) => {
      this.emit('remoteStreamAdded', participantId, event.streams[0])
    }

    // 处理 ICE 候�?    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.emit('iceCandidate', participantId, event.candidate)
      }
    }

    // 处理连接状�?    pc.onconnectionstatechange = () => {
      console.log(`连接状�?[${participantId}]:`, pc.connectionState)
      this.emit('connectionStateChange', participantId, pc.connectionState)
    }

    this.peerConnections.set(participantId, pc)
    return pc
  }

  /**
   * 创建 Offer
   */
  async createOffer(participantId: string): Promise<RTCSessionDescriptionInit> {
    const pc = await this.createPeerConnection(participantId)
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    
    return offer
  }

  /**
   * 处理 Answer
   */
  async handleAnswer(participantId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const pc = this.peerConnections.get(participantId)
    if (pc) {
      await pc.setRemoteDescription(answer)
    }
  }

  /**
   * 添加 ICE 候�?   */
  async addIceCandidate(participantId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const pc = this.peerConnections.get(participantId)
    if (pc) {
      await pc.addIceCandidate(candidate)
    }
  }

  /**
   * 开始屏幕共�?   */
  async startScreenShare(): Promise<MediaStream> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      })

      this.screenStream = screenStream

      // 替换视频轨道
      if (this.localStream) {
        const screenTrack = screenStream.getVideoTracks()[0]
        const localVideoTrack = this.localStream.getVideoTracks()[0]
        
        if (localVideoTrack) {
          this.peerConnections.forEach(pc => {
            const sender = pc.getSenders().find(s => s.track?.kind === 'video')
            if (sender) {
              sender.replaceTrack(screenTrack)
            }
          })
        }
      }

      // 监听屏幕共享结束
      screenTrack.onended = () => {
        this.stopScreenShare()
      }

      this.emit('screenShareStarted', screenStream)
      return screenStream
    } catch (error) {
      console.error('屏幕共享失败:', error)
      throw error
    }
  }

  /**
   * 停止屏幕共享
   */
  stopScreenShare(): void {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop())
      this.screenStream = null
    }

    // 恢复摄像�?    if (this.localStream) {
      const localVideoTrack = this.localStream.getVideoTracks()[0]
      if (localVideoTrack) {
        this.peerConnections.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video')
          if (sender) {
            sender.replaceTrack(localVideoTrack)
          }
        })
      }
    }

    this.emit('screenShareStopped')
  }

  /**
   * 切换摄像�?   */
  async toggleVideo(enabled: boolean): Promise<void> {
    if (!this.localStream) return

    const videoTrack = this.localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = enabled
      this.emit('videoToggled', enabled)
    }
  }

  /**
   * 切换麦克�?   */
  async toggleAudio(enabled: boolean): Promise<void> {
    if (!this.localStream) return

    const audioTrack = this.localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = enabled
      this.emit('audioToggled', enabled)
    }
  }

  /**
   * 切换摄像头设�?   */
  async switchCamera(deviceId: string): Promise<void> {
    if (!this.localStream) return

    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } }
    })

    const newVideoTrack = newStream.getVideoTracks()[0]
    const oldVideoTrack = this.localStream.getVideoTracks().find(t => t.kind === 'video')

    if (oldVideoTrack && newVideoTrack) {
      // 替换轨道
      this.localStream.removeTrack(oldVideoTrack)
      oldVideoTrack.stop()
      this.localStream.addTrack(newVideoTrack)

      this.peerConnections.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video')
        if (sender) {
          sender.replaceTrack(newVideoTrack)
        }
      })

      this.emit('cameraSwitched', deviceId)
    }
  }

  /**
   * 获取可用摄像头列�?   */
  async getCameras(): Promise<MediaDeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter(d => d.kind === 'videoinput')
  }

  /**
   * 获取可用麦克风列�?   */
  async getMicrophones(): Promise<MediaDeviceInfo[]> {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter(d => d.kind === 'audioinput')
  }

  /**
   * 发送聊天消�?   */
  sendChatMessage(content: string, type: 'text' | 'image' | 'file' = 'text'): void {
    const message: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'current-user-id',
      senderName: '�?,
      content,
      timestamp: new Date().toISOString(),
      type
    }

    // 通过 data channel 发�?    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify({ type: 'chat', data: message }))
    }

    this.emit('chatMessageSent', message)
  }

  /**
   * 开始录�?   */
  async startRecording(): Promise<void> {
    if (!this.meeting) return

    this.meeting.recording = true
    this.emit('recordingStarted')
  }

  /**
   * 停止录制
   */
  stopRecording(): void {
    if (!this.meeting) return

    this.meeting.recording = false
    this.emit('recordingStopped')
  }

  /**
   * 离开会议
   */
  async leaveMeeting(): Promise<void> {
    // 关闭所�?Peer 连接
    this.peerConnections.forEach(pc => {
      pc.close()
    })
    this.peerConnections.clear()

    // 停止本地媒体�?    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop())
      this.localStream = null
    }

    // 停止屏幕共享
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => track.stop())
      this.screenStream = null
    }

    // 更新会议状�?    if (this.meeting) {
      this.meeting.status = 'ended'
      this.meeting.endTime = new Date().toISOString()
      this.emit('meetingEnded', this.meeting)
      this.meeting = null
    }
  }

  /**
   * 获取会议信息
   */
  getMeeting(): Meeting | null {
    return this.meeting
  }

  /**
   * 获取本地媒体�?   */
  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  /**
   * 获取参会者列�?   */
  getParticipants(): Participant[] {
    return this.meeting?.participants || []
  }
}

// 导出单例
export const videoConferenceService = new VideoConferenceService()
