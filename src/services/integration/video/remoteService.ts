/**
 * 远程会诊控制服务
 * 
 * 提供会诊流程控制、权限管理、协作工具等功能
 */

import { EventEmitter } from '../../../utils/EventEmitter'

// 会诊会话
export interface ConsultationSession {
  id: string
  consultationId: string
  title: string
  hostId: string
  participants: SessionParticipant[]
  status: 'preparing' | 'in-progress' | 'paused' | 'completed'
  startTime?: string
  endTime?: string
  agenda: string[]
  currentAgendaIndex: number
  sharedResources: SharedResource[]
  annotations: Annotation[]
  chatHistory: ChatMessage[]
  recording?: boolean
  screenSharing?: string
}

// 参会者
export interface SessionParticipant {
  id: string
  name: string
  role: 'host' | 'presenter' | 'participant' | 'observer'
  department: string
  title: string
  hospital: string
  joinedAt?: string
  videoEnabled: boolean
  audioEnabled: boolean
  speaking: boolean
}

// 共享资源
export interface SharedResource {
  id: string
  type: 'dicom' | 'document' | 'screen' | 'whiteboard' | 'video'
  url: string
  title: string
  uploadedBy: string
  uploadedAt: string
  size?: number
  pageCount?: number
}

// 标注
export interface Annotation {
  id: string
  resourceId: string
  type: 'arrow' | 'circle' | 'rect' | 'text' | 'freehand'
  points: { x: number; y: number }[]
  color: string
  lineWidth: number
  text?: string
  createdBy: string
  createdAt: string
}

// 聊天消息
export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  type: 'text' | 'system'
}

// 投票
export interface Vote {
  id: string
  question: string
  options: string[]
  votes: Map<string, number>
  multiple: boolean
  createdBy: string
  createdAt: string
  deadline?: string
}

export class RemoteConsultationService extends EventEmitter {
  private session: ConsultationSession | null = null
  private peerConnections: Map<string, any> = new Map()
  private annotationLayer: HTMLCanvasElement | null = null

  /**
   * 创建会诊会话
   */
  async createSession(
    consultationId: string,
    title: string,
    agenda: string[]
  ): Promise<ConsultationSession> {
    const session: ConsultationSession = {
      id: `session-${Date.now()}`,
      consultationId,
      title,
      hostId: 'current-user-id',
      participants: [],
      status: 'preparing',
      agenda,
      currentAgendaIndex: 0,
      sharedResources: [],
      annotations: [],
      chatHistory: []
    }

    this.session = session
    this.emit('sessionCreated', session)
    return session
  }

  /**
   * 加入会诊会话
   */
  async joinSession(
    sessionId: string,
    participantInfo: Omit<SessionParticipant, 'id' | 'joinedAt'>
  ): Promise<void> {
    const participant: SessionParticipant = {
      ...participantInfo,
      id: `participant-${Date.now()}`,
      joinedAt: new Date().toISOString()
    }

    if (this.session) {
      this.session.participants.push(participant)
    }

    this.emit('participantJoined', participant)
  }

  /**
   * 开始会诊
   */
  startSession(): void {
    if (!this.session) return

    this.session.status = 'in-progress'
    this.session.startTime = new Date().toISOString()
    this.emit('sessionStarted', this.session)
  }

  /**
   * 暂停会诊
   */
  pauseSession(): void {
    if (!this.session) return

    this.session.status = 'paused'
    this.emit('sessionPaused', this.session)
  }

  /**
   * 恢复会诊
   */
  resumeSession(): void {
    if (!this.session) return

    this.session.status = 'in-progress'
    this.emit('sessionResumed', this.session)
  }

  /**
   * 结束会诊
   */
  endSession(): void {
    if (!this.session) return

    this.session.status = 'completed'
    this.session.endTime = new Date().toISOString()
    this.emit('sessionEnded', this.session)
    this.session = null
  }

  /**
   * 切换议程
   */
  switchAgenda(index: number): void {
    if (!this.session) return

    if (index >= 0 && index < this.session.agenda.length) {
      this.session.currentAgendaIndex = index
      this.emit('agendaSwitched', index, this.session.agenda[index])
    }
  }

  /**
   * 共享资源
   */
  async shareResource(
    resource: Omit<SharedResource, 'id' | 'uploadedAt'>
  ): Promise<SharedResource> {
    if (!this.session) throw new Error('会话不存在')

    const sharedResource: SharedResource = {
      ...resource,
      id: `resource-${Date.now()}`,
      uploadedAt: new Date().toISOString()
    }

    this.session.sharedResources.push(sharedResource)
    this.emit('resourceShared', sharedResource)
    return sharedResource
  }

  /**
   * 移除共享资源
   */
  removeResource(resourceId: string): void {
    if (!this.session) return

    this.session.sharedResources = this.session.sharedResources.filter(
      r => r.id !== resourceId
    )
    this.emit('resourceRemoved', resourceId)
  }

  /**
   * 添加标注
   */
  addAnnotation(annotation: Omit<Annotation, 'id' | 'createdAt'>): Annotation {
    if (!this.session) throw new Error('会话不存在')

    const newAnnotation: Annotation = {
      ...annotation,
      id: `annotation-${Date.now()}`,
      createdAt: new Date().toISOString()
    }

    this.session.annotations.push(newAnnotation)
    this.emit('annotationAdded', newAnnotation)
    return newAnnotation
  }

  /**
   * 移除标注
   */
  removeAnnotation(annotationId: string): void {
    if (!this.session) return

    this.session.annotations = this.session.annotations.filter(
      a => a.id !== annotationId
    )
    this.emit('annotationRemoved', annotationId)
  }

  /**
   * 清除所有标注
   */
  clearAnnotations(): void {
    if (!this.session) return

    this.session.annotations = []
    this.emit('annotationsCleared')
  }

  /**
   * 发送聊天消息
   */
  sendChatMessage(content: string, type: 'text' | 'system' = 'text'): ChatMessage {
    if (!this.session) throw new Error('会话不存在')

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'current-user-id',
      senderName: '我',
      content,
      timestamp: new Date().toISOString(),
      type
    }

    this.session.chatHistory.push(message)
    this.emit('chatMessageSent', message)
    return message
  }

  /**
   * 发起投票
   */
  createVote(vote: Omit<Vote, 'id' | 'createdAt' | 'votes'>): Vote {
    const newVote: Vote = {
      ...vote,
      id: `vote-${Date.now()}`,
      votes: new Map(),
      createdAt: new Date().toISOString()
    }

    this.emit('voteCreated', newVote)
    return newVote
  }

  /**
   * 投票
   */
  castVote(voteId: string, option: string): void {
    this.emit('voteCast', voteId, option)
  }

  /**
   * 获取投票结果
   */
  getVoteResults(voteId: string): Map<string, number> {
    // 实际项目中应该从服务器获取
    return new Map()
  }

  /**
   * 请求发言
   */
  requestToSpeak(): void {
    this.emit('speakRequest', 'current-user-id')
  }

  /**
   * 允许发言
   */
  grantSpeech(participantId: string): void {
    this.emit('speechGranted', participantId)
  }

  /**
   * 静音参会者
   */
  muteParticipant(participantId: string): void {
    this.emit('participantMuted', participantId)
  }

  /**
   * 移除参会者
   */
  removeParticipant(participantId: string, reason?: string): void {
    if (!this.session) return

    this.session.participants = this.session.participants.filter(
      p => p.id !== participantId
    )
    this.emit('participantRemoved', participantId, reason)
  }

  /**
   * 获取会诊记录
   */
  getSessionRecord(): ConsultationSession | null {
    return this.session
  }

  /**
   * 导出会诊记录
   */
  async exportRecord(format: 'pdf' | 'doc' | 'html'): Promise<Blob> {
    if (!this.session) throw new Error('会话不存在')

    // 实际项目中应该调用服务器 API
    const content = JSON.stringify(this.session, null, 2)
    return new Blob([content], { type: 'application/json' })
  }

  /**
   * 保存标注
   */
  async saveAnnotations(): Promise<void> {
    if (!this.session) return

    // 保存到服务器
    this.emit('annotationsSaved', this.session.annotations)
  }

  /**
   * 加载历史标注
   */
  loadAnnotations(resourceId: string): Annotation[] {
    if (!this.session) return []

    return this.session.annotations.filter(a => a.resourceId === resourceId)
  }

  /**
   * 设置标注画布
   */
  setAnnotationCanvas(canvas: HTMLCanvasElement): void {
    this.annotationLayer = canvas
  }

  /**
   * 获取参会者统计
   */
  getParticipantStats(): {
    total: number
    host: number
    presenter: number
    participant: number
    observer: number
  } {
    if (!this.session) {
      return { total: 0, host: 0, presenter: 0, participant: 0, observer: 0 }
    }

    return {
      total: this.session.participants.length,
      host: this.session.participants.filter(p => p.role === 'host').length,
      presenter: this.session.participants.filter(p => p.role === 'presenter').length,
      participant: this.session.participants.filter(p => p.role === 'participant').length,
      observer: this.session.participants.filter(p => p.role === 'observer').length
    }
  }

  /**
   * 更新参会者状态
   */
  updateParticipantStatus(
    participantId: string,
    status: Partial<SessionParticipant>
  ): void {
    if (!this.session) return

    const participant = this.session.participants.find(p => p.id === participantId)
    if (participant) {
      Object.assign(participant, status)
      this.emit('participantStatusUpdated', participantId, status)
    }
  }
}

// 导出单例
export const remoteConsultationService = new RemoteConsultationService()
