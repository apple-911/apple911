/**
 * API 请求工具
 * 
 * 封装 axios，提供统一的请求拦截和错误处理
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// 创建 axios 实例
const createAxiosInstance = (baseURL: string, timeout: number = 10000): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 添加认证头（如果需要）
      const token = localStorage.getItem('integration_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      console.error('请求错误:', error)
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  instance.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (error.response) {
        // 服务器返回错误
        const { status, data } = error.response
        console.error(`API 错误 [${status}]:`, data)
        
        // 401 未授权
        if (status === 401) {
          localStorage.removeItem('integration_token')
          window.location.href = '/login'
        }
        
        // 403 禁止访问
        if (status === 403) {
          console.error('没有访问权限')
        }
        
        // 404 未找到
        if (status === 404) {
          console.error('资源不存在')
        }
        
        // 500 服务器错误
        if (status === 500) {
          console.error('服务器错误')
        }
      } else if (error.request) {
        // 请求已发送但没有响应
        console.error('网络错误，请检查网络连接')
      } else {
        // 请求配置错误
        console.error('请求配置错误:', error.message)
      }
      
      return Promise.reject(error)
    }
  )

  return instance
}

// HIS API 实例
export const hisApi = createAxiosInstance(
  import.meta.env.VITE_HIS_BASE_URL || 'http://localhost:8080/his/api'
)

// EMR API 实例
export const emrApi = createAxiosInstance(
  import.meta.env.VITE_EMR_BASE_URL || 'http://localhost:8080/emr/api'
)

// PACS API 实例
export const pacsApi = createAxiosInstance(
  import.meta.env.VITE_PACS_BASE_URL || 'http://localhost:8080/pacs/api'
)

// AI 服务 API 实例
export const aiApi = createAxiosInstance(
  import.meta.env.VITE_AI_BASE_URL || 'http://localhost:8080/ai/api',
  30000 // AI 服务可能需要更长时间
)

// IoT 服务 API 实例
export const iotApi = createAxiosInstance(
  import.meta.env.VITE_IOT_BASE_URL || 'http://localhost:8080/iot/api'
)

// 通用 API 实例
export const api = createAxiosInstance('/api')

/**
 * 封装请求方法
 */
export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return api.get(url, config)
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return api.post(url, data, config)
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return api.put(url, data, config)
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return api.delete(url, config)
  },

  upload<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return api.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}
