/**
 * HIS/EMR 系统安全认证
 * 
 * 实现 OAuth 2.0 认证流程，获取和管理访问令牌
 */

import { api } from '../../utils/api'

interface TokenResponse {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  refresh_token?: string
  scope: string
}

interface AuthConfig {
  baseUrl: string
  clientId: string
  clientSecret: string
  scope: string
  tokenEndpoint: string
}

export class HISAuth {
  private accessToken: string | null = null
  private tokenExpiry: number = 0
  private refreshToken: string | null = null
  private refreshPromise: Promise<string> | null = null
  private readonly config: AuthConfig

  constructor(config: AuthConfig) {
    this.config = config
  }

  /**
   * 获取访问令牌（自动刷新）
   */
  async getToken(): Promise<string> {
    // 检查 token 是否有效
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    // 避免重复刷新
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.refreshTokenLogic()
    
    try {
      return await this.refreshPromise
    } finally {
      this.refreshPromise = null
    }
  }

  /**
   * 刷新令牌
   */
  private async refreshTokenLogic(): Promise<string> {
    try {
      // 尝试使用 refresh_token
      if (this.refreshToken) {
        return await this.refreshWithRefreshToken()
      }

      // 使用 client_credentials 授权
      return await this.requestNewToken()
    } catch (error) {
      console.error('Token 刷新失败:', error)
      throw new Error('认证失败，请重新登录')
    }
  }

  /**
   * 使用 refresh_token 刷新
   */
  private async refreshWithRefreshToken(): Promise<string> {
    const response = await api.post<TokenResponse>(`${this.config.tokenEndpoint}`, {
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret
    })

    const data = response.data
    this.setToken(data)
    return data.access_token
  }

  /**
   * 请求新令牌（client_credentials）
   */
  private async requestNewToken(): Promise<string> {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      scope: this.config.scope
    })

    const response = await api.post<TokenResponse>(
      `${this.config.baseUrl}/${this.config.tokenEndpoint}`,
      params,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    const data = response.data
    this.setToken(data)
    return data.access_token
  }

  /**
   * 设置令牌
   */
  private setToken(data: TokenResponse): void {
    this.accessToken = data.access_token
    this.refreshToken = data.refresh_token || null
    // 提前 5 分钟过期
    this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000
    
    console.log('Token 已更新，过期时间:', new Date(this.tokenExpiry).toLocaleString())
  }

  /**
   * 获取认证头
   */
  async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.getToken()
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  /**
   * 登出（清除令牌）
   */
  async logout(): Promise<void> {
    try {
      // 通知服务端撤销令牌
      if (this.accessToken) {
        await api.post(`${this.config.baseUrl}/oauth/revoke`, {
          token: this.accessToken,
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret
        })
      }
    } catch (error) {
      console.error('登出时撤销令牌失败:', error)
    } finally {
      this.clearToken()
    }
  }

  /**
   * 清除令牌
   */
  clearToken(): void {
    this.accessToken = null
    this.refreshToken = null
    this.tokenExpiry = 0
  }

  /**
   * 检查令牌是否有效
   */
  isTokenValid(): boolean {
    return !!(this.accessToken && Date.now() < this.tokenExpiry)
  }

  /**
   * 获取令牌过期时间
   */
  getTokenExpiry(): Date | null {
    return this.tokenExpiry > 0 ? new Date(this.tokenExpiry) : null
  }

  /**
   * 监听令牌过期
   * @param callback 过期回调
   */
  onTokenExpiring(callback: () => void, thresholdMinutes: number = 5): () => void {
    const checkInterval = setInterval(() => {
      if (this.tokenExpiry > 0) {
        const remaining = this.tokenExpiry - Date.now()
        const threshold = thresholdMinutes * 60 * 1000
        
        if (remaining > 0 && remaining <= threshold) {
          callback()
        }
      }
    }, 60 * 1000) // 每分钟检查一次

    return () => clearInterval(checkInterval)
  }
}

// 创建 HIS 和 EMR 的认证实例
export const hisAuth = new HISAuth({
  baseUrl: import.meta.env.VITE_HIS_BASE_URL || 'http://localhost:8080/his',
  clientId: import.meta.env.VITE_HIS_CLIENT_ID || 'mdt-system',
  clientSecret: import.meta.env.VITE_HIS_CLIENT_SECRET || 'mdt-secret',
  scope: 'patient:read order:read emr:read emr:write',
  tokenEndpoint: '/oauth/token'
})

export const emrAuth = new HISAuth({
  baseUrl: import.meta.env.VITE_EMR_BASE_URL || 'http://localhost:8080/emr',
  clientId: import.meta.env.VITE_EMR_CLIENT_ID || 'mdt-system',
  clientSecret: import.meta.env.VITE_EMR_CLIENT_SECRET || 'mdt-secret',
  scope: 'record:read record:write',
  tokenEndpoint: '/oauth/token'
})
