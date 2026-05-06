/**
 * IoT 设备接入服务
 * 
 * 负责接入医疗 IoT 设备，实时采集生命体征数据
 */

import { iotApi } from '../../utils/api'

// 生命体征数据
export interface VitalSigns {
  patientId: string
  timestamp: string
  heartRate: number        // 心率 (bpm)
  bloodPressure: {         // 血压 (mmHg)
    systolic: number
    diastolic: number
  }
  oxygenSaturation: number // 血氧饱和度 (%)
  temperature: number      // 体温 (°C)
  respiratoryRate: number  // 呼吸频率 (bpm)
  ecg?: number[]           // 心电图数据
}

// IoT 设备信息
export interface IoTDevice {
  deviceId: string
  type: '监护仪' | '输液泵' | '呼吸机' | '血糖仪' | '心电图机'
  brand: string
  model: string
  status: 'online' | 'offline' | 'error' | 'maintenance'
  batteryLevel: number
  lastSeen: string
  assignedPatient?: string
  location: string
  firmware: string
  ip: string
  mac: string
}

// 设备告警
export interface DeviceAlert {
  alertId: string
  deviceId: string
  patientId?: string
  type: 'VITAL_ABNORMAL' | 'DEVICE_ERROR' | 'LOW_BATTERY' | 'DISCONNECTED'
  level: 'info' | 'warning' | 'critical'
  message: string
  value?: any
  threshold?: any
  timestamp: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
}

export class IoTDeviceService {
  private mqttClient: any = null
  private vitalSignsCache = new Map<string, { data: VitalSigns; timestamp: number }>()
  private subscribers = new Map<string, Set<(data: VitalSigns) => void>>()
  private readonly CACHE_TTL = 30 * 1000 // 30 秒缓存

  constructor() {
    this.connectMQTT()
  }

  /**
   * 连接 MQTT 服务器
   */
  private connectMQTT(): void {
    if (typeof window === 'undefined') return

    // 使用 WebSocket 连接 MQTT
    const mqttUrl = import.meta.env.VITE_MQTT_WS_URL || 'ws://localhost:9001/mqtt'
    
    // 这里使用简化的实现，实际项目需要引入 mqtt.js
    console.log('MQTT 连接配置:', mqttUrl)
    
    // 模拟连接
    setTimeout(() => {
      console.log('MQTT 已连接')
    }, 1000)
  }

  /**
   * 获取患者实时生命体征
   * @param patientId 患者 ID
   */
  async getRealTimeVitals(patientId: string): Promise<VitalSigns | null> {
    // 检查缓存
    const cached = this.vitalSignsCache.get(patientId)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }

    try {
      const response = await iotApi.get(`/vitals/${patientId}/latest`)
      const vitals = response.data as VitalSigns
      
      // 更新缓存
      this.vitalSignsCache.set(patientId, {
        data: vitals,
        timestamp: Date.now()
      })

      return vitals
    } catch (error) {
      console.error('获取生命体征失败:', error)
      return null
    }
  }

  /**
   * 订阅患者生命体征数据
   * @param patientId 患者 ID
   * @param callback 数据回调
   */
  subscribeVitals(
    patientId: string,
    callback: (data: VitalSigns) => void
  ): () => void {
    // 添加订阅者
    if (!this.subscribers.has(patientId)) {
      this.subscribers.set(patientId, new Set())
    }
    this.subscribers.get(patientId)!.add(callback)

    // 取消订阅函数
    return () => {
      const subs = this.subscribers.get(patientId)
      if (subs) {
        subs.delete(callback)
        if (subs.size === 0) {
          this.subscribers.delete(patientId)
        }
      }
    }
  }

  /**
   * 处理接收到的生命体征数据
   * @param patientId 患者 ID
   * @param data 生命体征数据
   */
  handleVitalSignsData(patientId: string, data: VitalSigns): void {
    // 更新缓存
    this.vitalSignsCache.set(patientId, {
      data,
      timestamp: Date.now()
    })

    // 通知订阅者
    const subs = this.subscribers.get(patientId)
    if (subs) {
      subs.forEach(callback => callback(data))
    }

    // 检查异常
    this.checkAlerts(patientId, data)
  }

  /**
   * 检查生命体征异常
   * @param patientId 患者 ID
   * @param vitals 生命体征数据
   */
  private checkAlerts(patientId: string, vitals: VitalSigns): void {
    const alerts: Partial<DeviceAlert>[] = []

    // 心率异常
    if (vitals.heartRate > 100 || vitals.heartRate < 60) {
      alerts.push({
        type: 'VITAL_ABNORMAL',
        level: 'warning',
        message: `心率异常：${vitals.heartRate} bpm`,
        value: vitals.heartRate
      })
    }

    // 血氧低
    if (vitals.oxygenSaturation < 90) {
      alerts.push({
        type: 'VITAL_ABNORMAL',
        level: 'critical',
        message: `血氧饱和度低：${vitals.oxygenSaturation}%`,
        value: vitals.oxygenSaturation
      })
    }

    // 发热
    if (vitals.temperature > 38.5) {
      alerts.push({
        type: 'VITAL_ABNORMAL',
        level: 'warning',
        message: `发热：${vitals.temperature}°C`,
        value: vitals.temperature
      })
    }

    // 血压异常
    if (vitals.bloodPressure.systolic > 140 || vitals.bloodPressure.systolic < 90) {
      alerts.push({
        type: 'VITAL_ABNORMAL',
        level: 'warning',
        message: `血压异常：${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg`,
        value: vitals.bloodPressure
      })
    }

    // 发送告警
    alerts.forEach(alert => {
      this.sendAlert(patientId, alert as DeviceAlert)
    })
  }

  /**
   * 发送告警
   * @param patientId 患者 ID
   * @param alert 告警信息
   */
  private sendAlert(patientId: string, alert: DeviceAlert): void {
    console.warn('⚠️ 生命体征告警:', alert)
    
    // 发送到服务器
    iotApi.post('/alerts', {
      ...alert,
      patientId,
      timestamp: new Date().toISOString()
    }).catch(error => {
      console.error('发送告警失败:', error)
    })

    // 浏览器通知
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('生命体征告警', {
        body: alert.message,
        icon: '/warning-icon.png',
        tag: alert.alertId
      })
    }
  }

  /**
   * 获取设备列表
   * @param status 可选，设备状态筛选
   */
  async getDevices(status?: string): Promise<IoTDevice[]> {
    const params = status ? `?status=${status}` : ''
    const response = await iotApi.get(`/devices${params}`)
    return response.data as IoTDevice[]
  }

  /**
   * 获取设备详情
   * @param deviceId 设备 ID
   */
  async getDeviceDetail(deviceId: string): Promise<IoTDevice> {
    const response = await iotApi.get(`/devices/${deviceId}`)
    return response.data as IoTDevice
  }

  /**
   * 分配设备给患者
   * @param deviceId 设备 ID
   * @param patientId 患者 ID
   */
  async assignDevice(deviceId: string, patientId: string): Promise<void> {
    await iotApi.post(`/devices/${deviceId}/assign`, { patientId })
  }

  /**
   * 解除设备绑定
   * @param deviceId 设备 ID
   */
  async unassignDevice(deviceId: string): Promise<void> {
    await iotApi.post(`/devices/${deviceId}/unassign`)
  }

  /**
   * 获取设备历史数据
   * @param deviceId 设备 ID
   * @param startTime 开始时间
   * @param endTime 结束时间
   */
  async getDeviceHistory(
    deviceId: string,
    startTime: string,
    endTime: string
  ): Promise<VitalSigns[]> {
    const response = await iotApi.get(`/devices/${deviceId}/history`, {
      params: { startTime, endTime }
    })
    return response.data as VitalSigns[]
  }

  /**
   * 获取设备告警列表
   * @param deviceId 设备 ID
   * @param options 查询选项
   */
  async getDeviceAlerts(
    deviceId: string,
    options?: {
      level?: string
      acknowledged?: boolean
      startDate?: string
      endDate?: string
    }
  ): Promise<DeviceAlert[]> {
    const params = new URLSearchParams()
    if (options?.level) params.append('level', options.level)
    if (options?.acknowledged !== undefined) params.append('acknowledged', String(options.acknowledged))
    if (options?.startDate) params.append('startDate', options.startDate)
    if (options?.endDate) params.append('endDate', options.endDate)

    const response = await iotApi.get(`/devices/${deviceId}/alerts?${params.toString()}`)
    return response.data as DeviceAlert[]
  }

  /**
   * 确认告警
   * @param alertId 告警 ID
   * @param userId 用户 ID
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    await iotApi.post(`/alerts/${alertId}/acknowledge`, {
      userId,
      acknowledgedAt: new Date().toISOString()
    })
  }

  /**
   * 获取患者历史生命体征
   * @param patientId 患者 ID
   * @param startTime 开始时间
   * @param endTime 结束时间
   */
  async getPatientVitalsHistory(
    patientId: string,
    startTime: string,
    endTime: string
  ): Promise<VitalSigns[]> {
    const response = await iotApi.get(`/vitals/${patientId}/history`, {
      params: { startTime, endTime }
    })
    return response.data as VitalSigns[]
  }
}

// 导出单例
export const iotDeviceService = new IoTDeviceService()
