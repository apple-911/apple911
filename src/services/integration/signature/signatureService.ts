/**
 * 电子签名服务
 * 
 * 支持手写签名、CA 证书签名、时间戳等功能
 */

import { api } from '../../utils/api'

// 签名数据
export interface Signature {
  id: string
  type: 'handwritten' | 'digital' | 'biometric'
  signerId: string
  signerName: string
  signerRole: string
  documentId: string
  documentType: string
  signatureData: string  // Base64 编码的签名图像或数字签名
  certificateId?: string
  timestamp: string
  verified: boolean
  metadata: {
    ipAddress?: string
    userAgent?: string
    location?: string
    reason?: string
    contactInfo?: string
  }
}

// CA 证书信息
export interface CACertificate {
  certificateId: string
  subject: string
  issuer: string
  serialNumber: string
  validFrom: string
  validTo: string
  publicKey: string
  algorithm: string
  status: 'active' | 'expired' | 'revoked'
}

// 签名验证结果
export interface VerificationResult {
  valid: boolean
  signerName: string
  signedTime: string
  certificateStatus?: string
  integrityCheck: boolean
  timestampValid: boolean
  warnings: string[]
}

export class ElectronicSignatureService {
  private canvas: HTMLCanvasElement | null = null
  private isDrawing = false
  private lastPoint: { x: number; y: number } | null = null

  /**
   * 初始化签名画布
   */
  initCanvas(canvasId: string): void {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement
    if (!this.canvas) return

    const ctx = this.canvas.getContext('2d')
    if (ctx) {
      ctx.strokeStyle = '#000'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
    }

    // 绑定事件
    this.canvas.addEventListener('mousedown', this.handleMouseDown)
    this.canvas.addEventListener('mousemove', this.handleMouseMove)
    this.canvas.addEventListener('mouseup', this.handleMouseUp)
    this.canvas.addEventListener('mouseout', this.handleMouseUp)

    // 触摸设备支持
    this.canvas.addEventListener('touchstart', this.handleTouchStart)
    this.canvas.addEventListener('touchmove', this.handleTouchMove)
    this.canvas.addEventListener('touchend', this.handleTouchEnd)
  }

  /**
   * 鼠标按下
   */
  private handleMouseDown = (e: MouseEvent) => {
    this.isDrawing = true
    this.lastPoint = { x: e.offsetX, y: e.offsetY }
  }

  /**
   * 鼠标移动
   */
  private handleMouseMove = (e: MouseEvent) => {
    if (!this.isDrawing || !this.canvas) return

    const ctx = this.canvas.getContext('2d')
    if (!ctx || !this.lastPoint) return

    ctx.beginPath()
    ctx.moveTo(this.lastPoint.x, this.lastPoint.y)
    ctx.lineTo(e.offsetX, e.offsetY)
    ctx.stroke()

    this.lastPoint = { x: e.offsetX, y: e.offsetY }
  }

  /**
   * 鼠标抬起
   */
  private handleMouseUp = () => {
    this.isDrawing = false
    this.lastPoint = null
  }

  /**
   * 触摸开始
   */
  private handleTouchStart = (e: TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    if (!this.canvas) return

    const rect = this.canvas.getBoundingClientRect()
    this.isDrawing = true
    this.lastPoint = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    }
  }

  /**
   * 触摸移动
   */
  private handleTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    if (!this.isDrawing || !this.canvas) return

    const ctx = this.canvas.getContext('2d')
    if (!ctx || !this.lastPoint) return

    const touch = e.touches[0]
    const rect = this.canvas.getBoundingClientRect()
    const currentPoint = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    }

    ctx.beginPath()
    ctx.moveTo(this.lastPoint.x, this.lastPoint.y)
    ctx.lineTo(currentPoint.x, currentPoint.y)
    ctx.stroke()

    this.lastPoint = currentPoint
  }

  /**
   * 触摸结束
   */
  private handleTouchEnd = () => {
    this.isDrawing = false
    this.lastPoint = null
  }

  /**
   * 获取签名图像
   */
  getSignatureImage(format: 'png' | 'jpeg' = 'png'): string {
    if (!this.canvas) return ''
    return this.canvas.toDataURL(`image/${format}`)
  }

  /**
   * 清空签名画布
   */
  clearCanvas(): void {
    if (!this.canvas) return
    const ctx = this.canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }
  }

  /**
   * 创建手写签名
   */
  async createHandwrittenSignature(
    signerInfo: {
      signerId: string
      signerName: string
      signerRole: string
    },
    documentInfo: {
      documentId: string
      documentType: string
    },
    metadata?: Signature['metadata']
  ): Promise<Signature> {
    const signatureData = this.getSignatureImage()
    if (!signatureData) {
      throw new Error('请先签名')
    }

    const signature: Signature = {
      id: `sig-${Date.now()}`,
      type: 'handwritten',
      signerId: signerInfo.signerId,
      signerName: signerInfo.signerName,
      signerRole: signerInfo.signerRole,
      documentId: documentInfo.documentId,
      documentType: documentInfo.documentType,
      signatureData,
      timestamp: new Date().toISOString(),
      verified: false,
      metadata: metadata || {}
    }

    // 保存到服务器
    const response = await api.post('/signatures', signature)
    return response.data as Signature
  }

  /**
   * 申请 CA 证书
   */
  async applyCACertificate(
    userInfo: {
      name: string
      idCard: string
      organization: string
      department: string
      email: string
      phone: string
    }
  ): Promise<CACertificate> {
    const response = await api.post('/ca/certificates/apply', userInfo)
    return response.data as CACertificate
  }

  /**
   * 使用 CA 证书进行数字签名
   */
  async createDigitalSignature(
    documentId: string,
    documentHash: string,
    certificateId: string,
    signerInfo: {
      signerId: string
      signerName: string
      signerRole: string
    },
    reason?: string
  ): Promise<Signature> {
    // 调用 CA 服务进行数字签名
    const response = await api.post('/ca/sign', {
      documentId,
      documentHash,
      certificateId,
      reason
    })

    const signatureData = response.data.signature

    const signature: Signature = {
      id: `sig-${Date.now()}`,
      type: 'digital',
      signerId: signerInfo.signerId,
      signerName: signerInfo.signerName,
      signerRole: signerInfo.signerRole,
      documentId,
      documentType: 'medical_record',
      signatureData,
      certificateId,
      timestamp: new Date().toISOString(),
      verified: true,
      metadata: {
        reason
      }
    }

    // 保存签名
    const saveResponse = await api.post('/signatures', signature)
    return saveResponse.data as Signature
  }

  /**
   * 批量签名
   */
  async batchSign(
    signatures: Array<{
      documentId: string
      documentType: string
      signerId: string
      signerName: string
      signerRole: string
    }>
  ): Promise<Signature[]> {
    const results: Signature[] = []
    
    for (const sig of signatures) {
      try {
        const signatureData = this.getSignatureImage()
        const signature: Signature = {
          id: `sig-${Date.now()}-${sig.documentId}`,
          type: 'handwritten',
          signerId: sig.signerId,
          signerName: sig.signerName,
          signerRole: sig.signerRole,
          documentId: sig.documentId,
          documentType: sig.documentType,
          signatureData,
          timestamp: new Date().toISOString(),
          verified: false,
          metadata: {}
        }
        
        const response = await api.post('/signatures', signature)
        results.push(response.data as Signature)
      } catch (error) {
        console.error(`签名失败 [${sig.documentId}]:`, error)
      }
    }
    
    return results
  }

  /**
   * 验证签名
   */
  async verifySignature(signatureId: string): Promise<VerificationResult> {
    const response = await api.get(`/signatures/${signatureId}/verify`)
    return response.data as VerificationResult
  }

  /**
   * 验证文档完整性
   */
  async verifyDocumentIntegrity(
    documentId: string,
    documentHash: string
  ): Promise<boolean> {
    const response = await api.post('/signatures/verify-integrity', {
      documentId,
      documentHash
    })
    return response.data.valid
  }

  /**
   * 获取签名列表
   */
  async getSignatures(documentId?: string): Promise<Signature[]> {
    const params = documentId ? `?documentId=${documentId}` : ''
    const response = await api.get(`/signatures${params}`)
    return response.data as Signature[]
  }

  /**
   * 删除签名
   */
  async deleteSignature(signatureId: string): Promise<void> {
    await api.delete(`/signatures/${signatureId}`)
  }

  /**
   * 导出签名证书
   */
  async exportSignature(signatureId: string, format: 'pdf' | 'xml'): Promise<Blob> {
    const response = await api.get(`/signatures/${signatureId}/export`, {
      params: { format },
      responseType: 'blob'
    })
    return response.data as Blob
  }

  /**
   * 添加时间戳
   */
  async addTimestamp(signatureId: string): Promise<string> {
    const response = await api.post(`/signatures/${signatureId}/timestamp`)
    return response.data.timestamp
  }

  /**
   * 销毁画布
   */
  destroyCanvas(): void {
    if (!this.canvas) return

    this.canvas.removeEventListener('mousedown', this.handleMouseDown)
    this.canvas.removeEventListener('mousemove', this.handleMouseMove)
    this.canvas.removeEventListener('mouseup', this.handleMouseUp)
    this.canvas.removeEventListener('mouseout', this.handleMouseUp)
    this.canvas.removeEventListener('touchstart', this.handleTouchStart)
    this.canvas.removeEventListener('touchmove', this.handleTouchMove)
    this.canvas.removeEventListener('touchend', this.handleTouchEnd)
    
    this.canvas = null
  }
}

// 导出单例
export const electronicSignatureService = new ElectronicSignatureService()
