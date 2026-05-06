/**
 * 区块链病历存证服务
 * 
 * 基于区块链技术实现病历数据的不可篡改存证、验证和追溯
 */

import { api } from '../../utils/api'

// 区块信息
export interface Block {
  blockNumber: number
  blockHash: string
  previousHash: string
  timestamp: string
  transactions: Transaction[]
  merkleRoot: string
  nonce: number
  validator: string
}

// 交易记录
export interface Transaction {
  txHash: string
  type: 'record_store' | 'record_access' | 'record_modify' | 'consent'
  patientId: string
  documentId: string
  documentHash: string
  operator: string
  operation: string
  timestamp: string
  signature: string
  metadata?: {
    institution: string
    department: string
    purpose?: string
    consentId?: string
  }
}

// 存证记录
export interface EvidenceRecord {
  evidenceId: string
  patientId: string
  documentId: string
  documentType: string
  documentHash: string
  txHash: string
  blockNumber: number
  storeTime: string
  storeOperator: string
  status: 'active' | 'revoked'
  proof?: MerkleProof
}

// 默克尔证明
export interface MerkleProof {
  leaf: string
  root: string
  path: string[]
  position: 'left' | 'right'
}

// 授权记录
export interface AccessConsent {
  consentId: string
  patientId: string
  granteeId: string
  granteeName: string
  granteeType: 'doctor' | 'institution' | 'researcher' | 'insurance'
  documentTypes: string[]
  purpose: '诊疗' | '科研' | '医保' | '其他'
  validFrom: string
  validTo: string
  txHash: string
  status: 'active' | 'expired' | 'revoked'
  revokeTime?: string
}

// 访问日志
export interface AccessLog {
  logId: string
  patientId: string
  documentId: string
  accessorId: string
  accessorName: string
  accessTime: string
  accessPurpose: string
  consentId: string
  txHash: string
  ipAddress?: string
  result: 'success' | 'denied'
}

export class BlockchainService {
  /**
   * 计算文档哈希
   * @param content 文档内容
   */
  async hashDocument(content: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(content)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  /**
   * 存储病历到区块链
   * @param record 病历信息
   */
  async storeRecord(record: {
    patientId: string
    documentId: string
    documentType: string
    content: string
    operator: string
    institution: string
    department: string
  }): Promise<EvidenceRecord> {
    // 计算文档哈希
    const documentHash = await this.hashDocument(record.content)

    // 创建交易
    const tx: Omit<Transaction, 'txHash' | 'signature'> = {
      type: 'record_store',
      patientId: record.patientId,
      documentId: record.documentId,
      documentHash,
      operator: record.operator,
      operation: 'store',
      timestamp: new Date().toISOString(),
      metadata: {
        institution: record.institution,
        department: record.department
      }
    }

    // 签名交易
    const signature = await this.signTransaction(tx)
    
    // 发送到区块链
    const response = await api.post('/blockchain/transactions', {
      ...tx,
      signature
    })

    const evidence: EvidenceRecord = {
      evidenceId: `evd-${Date.now()}`,
      patientId: record.patientId,
      documentId: record.documentId,
      documentType: record.documentType,
      documentHash,
      txHash: response.data.txHash,
      blockNumber: response.data.blockNumber,
      storeTime: new Date().toISOString(),
      storeOperator: record.operator,
      status: 'active'
    }

    return evidence
  }

  /**
   * 验证病历完整性
   * @param documentId 文档 ID
   * @param content 当前内容
   */
  async verifyRecord(documentId: string, content: string): Promise<{
    valid: boolean
    evidence: EvidenceRecord
    message: string
  }> {
    // 获取存证记录
    const evidence = await this.getEvidence(documentId)
    if (!evidence) {
      return { valid: false, evidence: null as any, message: '未找到存证记录' }
    }

    // 计算当前内容哈希
    const currentHash = await this.hashDocument(content)

    // 比较哈希值
    if (currentHash === evidence.documentHash) {
      return { valid: true, evidence, message: '验证通过，文档完整' }
    } else {
      return { valid: false, evidence, message: '验证失败，文档可能被篡改' }
    }
  }

  /**
   * 获取存证记录
   * @param documentId 文档 ID
   */
  async getEvidence(documentId: string): Promise<EvidenceRecord | null> {
    const response = await api.get(`/blockchain/evidence/${documentId}`)
    return response.data as EvidenceRecord
  }

  /**
   * 获取区块信息
   * @param blockNumber 区块号
   */
  async getBlock(blockNumber: number): Promise<Block> {
    const response = await api.get(`/blockchain/blocks/${blockNumber}`)
    return response.data as Block
  }

  /**
   * 获取交易详情
   * @param txHash 交易哈希
   */
  async getTransaction(txHash: string): Promise<Transaction> {
    const response = await api.get(`/blockchain/transactions/${txHash}`)
    return response.data as Transaction
  }

  /**
   * 创建访问授权
   * @param consent 授权信息
   */
  async createConsent(consent: {
    patientId: string
    granteeId: string
    granteeName: string
    granteeType: AccessConsent['granteeType']
    documentTypes: string[]
    purpose: AccessConsent['purpose']
    validFrom: string
    validTo: string
  }): Promise<AccessConsent> {
    const tx: Omit<Transaction, 'txHash' | 'signature'> = {
      type: 'consent',
      patientId: consent.patientId,
      documentId: '*',
      documentHash: '',
      operator: consent.patientId,
      operation: 'grant_access',
      timestamp: new Date().toISOString(),
      metadata: {
        purpose: consent.purpose,
        consentId: `consent-${Date.now()}`
      }
    }

    const signature = await this.signTransaction(tx)
    
    const response = await api.post('/blockchain/consents', {
      consent,
      tx: { ...tx, signature }
    })

    return response.data as AccessConsent
  }

  /**
   * 撤销授权
   * @param consentId 授权 ID
   */
  async revokeConsent(consentId: string): Promise<void> {
    await api.post(`/blockchain/consents/${consentId}/revoke`, {
      revokeTime: new Date().toISOString()
    })
  }

  /**
   * 验证访问权限
   * @param patientId 患者 ID
   * @param accessorId 访问者 ID
   * @param documentType 文档类型
   */
  async verifyAccess(
    patientId: string,
    accessorId: string,
    documentType: string
  ): Promise<{
    allowed: boolean
    consent?: AccessConsent
    message: string
  }> {
    const response = await api.post('/blockchain/consents/verify', {
      patientId,
      accessorId,
      documentType
    })
    return response.data
  }

  /**
   * 记录访问日志
   * @param log 访问日志
   */
  async logAccess(log: {
    patientId: string
    documentId: string
    accessorId: string
    accessorName: string
    accessPurpose: string
    consentId: string
    result: 'success' | 'denied'
    ipAddress?: string
  }): Promise<AccessLog> {
    const tx: Omit<Transaction, 'txHash' | 'signature'> = {
      type: 'record_access',
      patientId: log.patientId,
      documentId: log.documentId,
      documentHash: '',
      operator: log.accessorId,
      operation: 'access',
      timestamp: new Date().toISOString(),
      metadata: {
        purpose: log.accessPurpose,
        consentId: log.consentId
      }
    }

    const signature = await this.signTransaction(tx)

    const response = await api.post('/blockchain/access-logs', {
      log,
      tx: { ...tx, signature }
    })

    return response.data as AccessLog
  }

  /**
   * 获取患者授权列表
   * @param patientId 患者 ID
   */
  async getPatientConsents(patientId: string): Promise<AccessConsent[]> {
    const response = await api.get(`/blockchain/consents/patient/${patientId}`)
    return response.data as AccessConsent[]
  }

  /**
   * 获取访问历史
   * @param patientId 患者 ID
   */
  async getAccessHistory(patientId: string): Promise<AccessLog[]> {
    const response = await api.get(`/blockchain/access-logs/patient/${patientId}`)
    return response.data as AccessLog[]
  }

  /**
   * 获取病历修改历史
   * @param documentId 文档 ID
   */
  async getRecordHistory(documentId: string): Promise<Transaction[]> {
    const response = await api.get(`/blockchain/history/${documentId}`)
    return response.data as Transaction[]
  }

  /**
   * 签名交易
   * @param transaction 交易
   */
  private async signTransaction(transaction: Omit<Transaction, 'txHash' | 'signature'>): Promise<string> {
    // 实际项目中应该使用私钥签名
    // 这里简化为计算哈希
    const content = JSON.stringify(transaction)
    return this.hashDocument(content)
  }

  /**
   * 生成存证证书
   * @param evidenceId 存证 ID
   */
  async generateCertificate(evidenceId: string): Promise<Blob> {
    const response = await api.get(`/blockchain/certificates/${evidenceId}`, {
      responseType: 'blob'
    })
    return response.data as Blob
  }

  /**
   * 批量存证
   * @param records 记录列表
   */
  async batchStoreRecords(records: Array<{
    patientId: string
    documentId: string
    documentType: string
    content: string
    operator: string
    institution: string
    department: string
  }>): Promise<EvidenceRecord[]> {
    const results: EvidenceRecord[] = []

    for (const record of records) {
      try {
        const evidence = await this.storeRecord(record)
        results.push(evidence)
      } catch (error) {
        console.error(`存证失败 [${record.documentId}]:`, error)
      }
    }

    return results
  }

  /**
   * 获取区块链统计信息
   */
  async getStatistics(): Promise<{
    totalBlocks: number
    totalTransactions: number
    totalRecords: number
    totalConsents: number
    totalAccessLogs: number
    averageBlockTime: number
    networkHashRate: string
  }> {
    const response = await api.get('/blockchain/statistics')
    return response.data
  }

  /**
   * 导出患者完整区块链记录
   * @param patientId 患者 ID
   */
  async exportPatientRecords(patientId: string): Promise<{
    evidence: EvidenceRecord[]
    consents: AccessConsent[]
    accessLogs: AccessLog[]
    exportTime: string
  }> {
    const [evidence, consents, accessLogs] = await Promise.all([
      api.get(`/blockchain/evidence/patient/${patientId}`),
      api.get(`/blockchain/consents/patient/${patientId}`),
      api.get(`/blockchain/access-logs/patient/${patientId}`)
    ])

    return {
      evidence: evidence.data as EvidenceRecord[],
      consents: consents.data as AccessConsent[],
      accessLogs: accessLogs.data as AccessLog[],
      exportTime: new Date().toISOString()
    }
  }
}

// 导出单例
export const blockchainService = new BlockchainService()
