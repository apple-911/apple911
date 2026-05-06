# Phase 4 生态集成规划

## 📋 概述

Phase 4 将实现 MDT 系统与医院生态系统的深度集成，打造真正的智慧医疗平台。

---

## 🏥 1. HIS/EMR 对接 - 医院信息系统集成

### 1.1 集成架构

```
┌─────────────────────────────────────────────────────────┐
│                    MDT 系统                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ 会诊管理 │  │ 患者管理 │  │ 报告管理 │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │             │             │                     │
│  ┌────▼─────────────▼─────────────▼─────┐              │
│  │         MDT 集成网关                  │              │
│  │  - 数据转换  - 协议适配  - 安全认证   │              │
│  └────┬─────────────┬─────────────┬─────┘              │
└───────┼─────────────┼─────────────┼─────────────────────┘
        │             │             │
  ┌─────▼──────┐ ┌───▼──────┐ ┌───▼──────┐
  │ HIS 系统    │ │ EMR 系统  │ │ LIS 系统  │
  │ - 患者登记  │ │ - 电子病历│ │ - 检验结果│
  │ - 医嘱管理  │ │ - 病程记录│ │ - 检查报告│
  │ - 费用结算  │ │ - 诊断信息│ │          │
  └────────────┘ └───────────┘ └──────────┘
```

### 1.2 核心功能

#### A. 患者信息同步
```typescript
// src/services/his/patientService.ts
interface HISPatient {
  patientId: string      // HIS 患者 ID
  mrn: string           // 病历号
  name: string          // 姓名
  gender: string        // 性别
  dateOfBirth: string   // 出生日期
  idCard: string        // 身份证号
  phone: string         // 联系电话
  address: string       // 地址
  insuranceType: string // 医保类型
  admissionDate: string // 入院日期
  department: string    // 科室
  bedNumber: string     // 床号
  diagnosis: string     // 入院诊断
  condition: string     // 病情
}

class HISPatientService {
  // 从 HIS 同步患者信息
  async syncPatient(mrn: string): Promise<HISPatient> {
    const response = await hisApi.get(`/patient/${mrn}`)
    return this.transformPatientData(response.data)
  }

  // 实时查询患者信息
  async queryPatient(patientId: string): Promise<HISPatient> {
    return cache.getOrSet(`his:patient:${patientId}`, async () => {
      return this.syncPatient(patientId)
    }, 5 * 60 * 1000) // 5 分钟缓存
  }

  // 患者信息变更监听
  subscribePatientChange(mrn: string, callback: (patient: HISPatient) => void) {
    hisWebSocket.subscribe(`patient:${mrn}`, callback)
  }
}
```

#### B. 医嘱同步
```typescript
// src/services/his/orderService.ts
interface HISOrder {
  orderId: string
  patientId: string
  orderType: '检查' | '检验' | '治疗' | '用药'
  orderName: string
  orderCode: string
  status: '已开立' | '已执行' | '已停止'
  orderDate: string
  executeDate?: string
  doctor: string
  result?: any
}

class HISOrderService {
  // 获取患者医嘱列表
  async getPatientOrders(patientId: string): Promise<HISOrder[]> {
    const orders = await hisApi.get(`/orders?patientId=${patientId}`)
    return orders.data
  }

  // 同步 MDT 会诊建议到医嘱
  async syncMDTOrder(order: MDTOrder): Promise<void> {
    await hisApi.post('/orders', {
      patientId: order.patientId,
      orderType: this.transformOrderType(order.type),
      orderName: order.name,
      orderContent: order.content,
      doctor: order.doctor,
      note: `MDT 会诊建议 - ${order.consultationId}`
    })
  }
}
```

#### C. 电子病历集成
```typescript
// src/services/emr/emrService.ts
interface EMRRecord {
  recordId: string
  patientId: string
  recordType: '入院记录' | '病程记录' | '会诊记录' | '出院记录'
  content: string
  createTime: string
  doctor: string
  department: string
}

class EMRService {
  // 获取患者病历
  async getPatientRecords(patientId: string): Promise<EMRRecord[]> {
    return emrApi.get(`/records?patientId=${patientId}`)
  }

  // 写入 MDT 会诊记录到 EMR
  async writeMDTRecord(consultation: Consultation): Promise<void> {
    const record = {
      recordType: '会诊记录',
      patientId: consultation.patientId,
      content: this.generateMDTRecord(consultation),
      doctor: consultation.mainExpert,
      department: consultation.department
    }
    await emrApi.post('/records', record)
  }

  // 生成会诊记录
  private generateMDTRecord(consultation: Consultation): string {
    return `
MDT 会诊记录

会诊时间：${consultation.time}
会诊地点：${consultation.location}
主持人：${consultation.mainExpert}
参加人员：${consultation.experts.map(e => e.name).join(', ')}

患者信息：
- 姓名：${consultation.patientName}
- 性别：${consultation.patientGender}
- 年龄：${consultation.patientAge}
- 住院号：${consultation.patientMrn}
- 诊断：${consultation.diagnosis}

会诊目的：${consultation.purpose}

讨论记录：
${consultation.discussionRecords.map(r => 
  `${r.doctor}: ${r.opinion}`
).join('\n')}

会诊结论：
${consultation.conclusion}

诊疗建议：
${consultation.recommendations.map(r => `- ${r}`).join('\n')}

记录人：${consultation.recorder}
记录时间：${new Date().toISOString()}
    `.trim()
  }
}
```

### 1.3 数据映射

```typescript
// src/services/integration/dataMapping.ts
const DataMapping = {
  // 性别映射
  gender: {
    'M': '男',
    'F': '女',
    'U': '未知'
  },

  // 诊断编码映射 (ICD-10)
  diagnosis: {
    'C34.9': '肺癌',
    'C18.9': '结直肠癌',
    'C50.9': '乳腺癌',
    // ... 更多映射
  },

  // 科室映射
  department: {
    'ONC': '肿瘤科',
    'TS': '胸外科',
    'GS': '胃肠外科',
    'MED': '消化内科',
    'RESP': '呼吸科',
    // ... 更多映射
  },

  // 转换 HIS 数据到 MDT 格式
  transformPatient(hisPatient: HISPatient): Patient {
    return {
      id: hisPatient.patientId,
      mrn: hisPatient.mrn,
      name: hisPatient.name,
      gender: DataMapping.gender[hisPatient.gender],
      age: this.calculateAge(hisPatient.dateOfBirth),
      diagnosis: DataMapping.diagnosis[hisPatient.diagnosis] || hisPatient.diagnosis,
      department: DataMapping.department[hisPatient.department],
      bedNumber: hisPatient.bedNumber,
      // ... 其他字段
    }
  }
}
```

### 1.4 安全认证

```typescript
// src/services/integration/auth.ts
class HISAuth {
  private token: string | null = null
  private tokenExpiry: number = 0

  // OAuth 2.0 认证
  async authenticate(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token
    }

    const response = await fetch(`${HIS_BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: import.meta.env.VITE_HIS_CLIENT_ID,
        client_secret: import.meta.env.VITE_HIS_CLIENT_SECRET,
        scope: 'patient:read order:read emr:read emr:write'
      })
    })

    const data = await response.json()
    this.token = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000
    
    return this.token
  }

  // 添加认证头
  async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.authenticate()
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }
}
```

---

## 🖼️ 2. PACS 集成 - 医学影像系统对接

### 2.1 DICOM 影像调阅

```typescript
// src/services/pacs/dicomService.ts
import { DicomImage } from './types'

class PACSService {
  // 获取患者影像检查列表
  async getPatientStudies(patientId: string): Promise<DicomStudy[]> {
    const studies = await pacsApi.get(`/studies?patientId=${patientId}`)
    return studies.data
  }

  // 获取影像序列
  async getStudySeries(studyId: string): Promise<DicomSeries[]> {
    return pacsApi.get(`/studies/${studyId}/series`)
  }

  // 获取 DICOM 影像
  async getDicomImage(seriesId: string, instanceId: string): Promise<Blob> {
    const response = await pacsApi.get(
      `/series/${seriesId}/instances/${instanceId}/frames/1`,
      { responseType: 'blob' }
    )
    return response.data
  }

  // 生成 WADO-RS URL
  getWadoRsUrl(studyId: string, options: WadoRsOptions = {}): string {
    const params = new URLSearchParams({
      studyUID: studyId,
      ...options
    })
    return `${PACS_WADO_URL}?${params.toString()}`
  }
}

// 影像组件
const DICOMViewer: React.FC<{ studyId: string }> = ({ studyId }) => {
  const [images, setImages] = useState<DicomImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadImages = async () => {
      const series = await pacsService.getStudySeries(studyId)
      const imagePromises = series.map(s => 
        pacsService.getDicomImage(s.id, s.instances[0])
      )
      const loadedImages = await Promise.all(imagePromises)
      setImages(loadedImages)
      setLoading(false)
    }
    loadImages()
  }, [studyId])

  if (loading) return <Skeleton active />

  return (
    <div className="grid grid-cols-2 gap-2">
      {images.map((img, idx) => (
        <div key={idx} className="border rounded overflow-hidden">
          <img src={URL.createObjectURL(img)} alt={`DICOM ${idx}`} />
        </div>
      ))}
    </div>
  )
}
```

### 2.2 影像浏览器集成

```typescript
// src/components/PACSImageViewer.tsx
import { CornerstoneViewport } from 'react-cornerstone-3d'

interface PACSImageViewerProps {
  studyInstanceUid: string
  seriesInstanceUid?: string
}

export const PACSImageViewer: React.FC<PACSImageViewerProps> = ({
  studyInstanceUid,
  seriesInstanceUid
}) => {
  const viewportData = {
    studyInstanceUid,
    seriesInstanceUid,
    displaySetInstanceUid: generateDisplaySetUid()
  }

  return (
    <div className="pacs-viewer h-[600px]">
      <CornerstoneViewport
        viewportData={viewportData}
        tools={{
          mouseTools: ['Wwwc', 'Zoom', 'Pan', 'Length', 'Angle'],
          touchTools: ['ZoomTouchPinch', 'PanMultiTouch'],
          annotationTools: ['Length', 'Angle', 'Bidirectional'],
        }}
        activeTool="Wwwc"
      />
    </div>
  )
}
```

### 2.3 影像报告关联

```typescript
// src/services/pacs/reportService.ts
interface PACSReport {
  reportId: string
  studyId: string
  patientId: string
  examType: 'CT' | 'MR' | 'X-Ray' | 'PET-CT'
  examPart: string
  findings: string
  impression: string
  reportTime: string
  radiologist: string
  images: DicomImageReference[]
}

class PACSReportService {
  // 获取影像报告
  async getReport(studyId: string): Promise<PACSReport> {
    return pacsApi.get(`/reports/${studyId}`)
  }

  // 在 MDT 会诊中调阅影像报告
  async linkToConsultation(consultationId: string, studyId: string): Promise<void> {
    await mdtApi.post(`/consultations/${consultationId}/pacs-link`, {
      studyId,
      linkTime: new Date().toISOString()
    })
  }
}
```

---

## 📡 3. IoT 设备 - 生命体征监测集成

### 3.1 设备接入架构

```typescript
// src/services/iot/deviceService.ts
interface VitalSigns {
  patientId: string
  timestamp: string
  heartRate: number       // 心率 (bpm)
  bloodPressure: {        // 血压 (mmHg)
    systolic: number
    diastolic: number
  }
  oxygenSaturation: number // 血氧饱和度 (%)
  temperature: number      // 体温 (°C)
  respiratoryRate: number  // 呼吸频率 (bpm)
  ecg?: number[]           // 心电图数据
}

class IoTDeviceService {
  private mqttClient: mqtt.Client
  private vitalSignsCache = new Map<string, VitalSigns>()

  constructor() {
    this.mqttClient = mqtt.connect(MQTT_BROKER_URL)
    this.setupSubscriptions()
  }

  // 订阅设备数据
  private setupSubscriptions() {
    this.mqttClient.subscribe('vitals/+/+')
    this.mqttClient.on('message', (topic, message) => {
      const [, patientId, type] = topic.split('/')
      const data = JSON.parse(message.toString())
      this.handleVitalSigns(patientId, type, data)
    })
  }

  // 处理生命体征数据
  private handleVitalSigns(patientId: string, type: string, data: any) {
    const vital = this.vitalSigns.get(patientId) || { patientId, timestamp: new Date().toISOString() }
    
    switch (type) {
      case 'hr':
        vital.heartRate = data.value
        break
      case 'bp':
        vital.bloodPressure = data
        break
      case 'spo2':
        vital.oxygenSaturation = data.value
        break
      case 'temp':
        vital.temperature = data.value
        break
    }

    this.vitalSigns.set(patientId, vital)
    
    // 触发告警检查
    this.checkAlerts(vital)
  }

  // 获取实时生命体征
  getRealTimeVitals(patientId: string): VitalSigns | null {
    return this.vitalSigns.get(patientId) || null
  }

  // 告警检查
  private checkAlerts(vitals: VitalSigns) {
    const alerts: Alert[] = []

    if (vitals.heartRate > 100 || vitals.heartRate < 60) {
      alerts.push({ type: 'HR_ABNORMAL', value: vitals.heartRate })
    }
    if (vitals.oxygenSaturation < 90) {
      alerts.push({ type: 'SPO2_LOW', value: vitals.oxygenSaturation })
    }
    if (vitals.temperature > 38.5) {
      alerts.push({ type: 'FEVER', value: vitals.temperature })
    }

    if (alerts.length > 0) {
      this.sendAlert(vitals.patientId, alerts)
    }
  }
}
```

### 3.2 实时监护组件

```typescript
// src/components/VitalSignsMonitor.tsx
export const VitalSignsMonitor: React.FC<{ patientId: string }> = ({ patientId }) => {
  const [vitals, setVitals] = useState<VitalSigns | null>(null)
  const [history, setHistory] = useState<VitalSigns[]>([])

  useEffect(() => {
    // 订阅实时数据
    const unsubscribe = iotService.subscribeVitals(patientId, (data) => {
      setVitals(data)
      setHistory(prev => [...prev.slice(-59), data]) // 保留 60 条记录
    })

    return unsubscribe
  }, [patientId])

  if (!vitals) return <Skeleton active />

  return (
    <Card title="实时生命体征">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <VitalCard 
          title="心率" 
          value={vitals.heartRate} 
          unit="bpm"
          icon={<HeartOutlined />}
          normal={[60, 100]}
        />
        <VitalCard 
          title="血压" 
          value={`${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic}`} 
          unit="mmHg"
          icon={<ThunderboltOutlined />}
        />
        <VitalCard 
          title="血氧" 
          value={vitals.oxygenSaturation} 
          unit="%"
          icon={<DashboardOutlined />}
          normal={[95, 100]}
        />
        <VitalCard 
          title="体温" 
          value={vitals.temperature} 
          unit="°C"
          icon={<ThermometerOutlined />}
          normal={[36.0, 37.3]}
        />
      </div>

      {/* 趋势图 */}
      <div className="mt-4">
        <LineChart data={history} />
      </div>
    </Card>
  )
}

const VitalCard: React.FC<VitalCardProps> = ({ title, value, unit, icon, normal }) => {
  const isAbnormal = normal && (value < normal[0] || value > normal[1])

  return (
    <div className={`p-4 rounded-lg border ${isAbnormal ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <Text type="secondary">{title}</Text>
      </div>
      <div className="flex items-baseline gap-1">
        <Text className="text-2xl font-bold">{value}</Text>
        <Text type="secondary" className="text-sm">{unit}</Text>
      </div>
      {isAbnormal && <Text type="danger" className="text-xs">异常</Text>}
    </div>
  )
}
```

### 3.3 设备管理

```typescript
// src/services/iot/deviceManagement.ts
interface IoTDevice {
  deviceId: string
  type: '监护仪' | '输液泵' | '呼吸机' | '血糖仪'
  brand: string
  model: string
  status: 'online' | 'offline' | 'error'
  batteryLevel: number
  lastSeen: string
  assignedPatient?: string
  location: string
}

class DeviceManagementService {
  // 获取设备列表
  async getDevices(status?: string): Promise<IoTDevice[]> {
    const params = status ? `?status=${status}` : ''
    return iotApi.get(`/devices${params}`)
  }

  // 分配设备给患者
  async assignDevice(deviceId: string, patientId: string): Promise<void> {
    await iotApi.post(`/devices/${deviceId}/assign`, { patientId })
  }

  // 设备状态监控
  monitorDeviceStatus(deviceId: string, callback: (status: string) => void) {
    return iotWebSocket.subscribe(`device:${deviceId}:status`, callback)
  }
}
```

---

## 📲 4. PWA 支持 - 离线优先架构

### 4.1 Service Worker

```typescript
// src/service-worker.ts
/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-core'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { BackgroundSyncPlugin } from 'workbox-background-sync'

// 预缓存静态资源
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// 页面导航 - 网络优先
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'pages',
      networkTimeoutSeconds: 3
    })
  )
)

// API 请求 - 网络优先，失败回缓存
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 天
      })
    ]
  })
)

// 影像资源 - 缓存优先
registerRoute(
  ({ url }) => url.pathname.includes('/pacs/'),
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60 // 7 天
      })
    ]
  })
)

// 静态资源 - 缓存优先
registerRoute(
  ({ request, url }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'static-resources'
  })
)

// 离线队列 - 会诊记录提交
const bgSyncPlugin = new BackgroundSyncPlugin('mdtQueue', {
  maxRetentionTime: 24 * 60 // 24 小时
})

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/consultations/'),
  new NetworkFirst({
    plugins: [bgSyncPlugin]
  }),
  'POST'
)

// 离线提示
self.addEventListener('offline', () => {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ type: 'OFFLINE' })
    })
  })
})
```

### 4.2 PWA Manifest

```json
// public/manifest.json
{
  "name": "MDT 多学科会诊系统",
  "short_name": "MDT",
  "description": "智慧医疗多学科会诊平台",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2c6e9e",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "categories": ["medical", "health"],
  "shortcuts": [
    {
      "name": "申请会诊",
      "short_name": "申请",
      "description": "快速申请 MDT 会诊",
      "url": "/consultation/apply",
      "icons": [{ "src": "/icons/shortcut-apply.png", "sizes": "96x96" }]
    },
    {
      "name": "我的待办",
      "short_name": "待办",
      "description": "查看待办事项",
      "url": "/dashboard",
      "icons": [{ "src": "/icons/shortcut-todo.png", "sizes": "96x96" }]
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/dashboard.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

### 4.3 离线数据同步

```typescript
// src/hooks/useOfflineSync.ts
import { useSyncExternalStore } from 'react'

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingChanges, setPendingChanges] = useState<number>(0)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      syncPendingChanges()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // 同步待处理变更
  const syncPendingChanges = async () => {
    const queue = await getPendingQueue()
    setPendingChanges(queue.length)

    for (const item of queue) {
      try {
        await api.post(item.url, item.data)
        await removeFromQueue(item.id)
      } catch (error) {
        console.error('Sync failed:', error)
      }
    }

    setPendingChanges(0)
  }

  return { isOnline, pendingChanges }
}

// 离线存储
class OfflineStorage {
  private db: IDBDatabase | null = null

  async init() {
    this.db = await this.openDB()
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MDTOffline', 1)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('pendingChanges')) {
          db.createObjectStore('pendingChanges', { keyPath: 'id' })
        }
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async addPendingChange(change: PendingChange) {
    if (!this.db) await this.init()
    
    const tx = this.db!.transaction('pendingChanges', 'readwrite')
    tx.objectStore('pendingChanges').add(change)
    await tx.complete
  }
}
```

### 4.4 安装提示

```typescript
// src/components/PWAInstallPrompt.tsx
export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    
    setDeferredPrompt(null)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 md:bottom-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <Text strong>安装 MDT 应用</Text>
          <Text type="secondary" className="text-sm block">
            安装到桌面，离线也能使用
          </Text>
        </div>
        <Space>
          <Button size="small" onClick={() => setShowPrompt(false)}>
            稍后
          </Button>
          <Button size="small" type="primary" onClick={handleInstall}>
            安装
          </Button>
        </Space>
      </div>
    </div>
  )
}
```

---

## 🤖 5. 高级 AI - 智能诊断辅助

### 5.1 医学影像 AI 分析

```typescript
// src/services/ai/imaging.ts
interface AIImagingAnalysis {
  studyId: string
  findings: AIFinding[]
  likelihood: number
  suggestions: string[]
  references: string[]
}

interface AIFinding {
  type: '结节' | '肿块' | '浸润' | '积液'
  location: string
  size?: {
    length: number
    width: number
    height: number
  }
  characteristics: string[]
  malignancyRisk: '低' | '中' | '高'
}

class AIImagingService {
  // CT 影像肺结节检测
  async analyzeCTNodule(dicomImages: Blob[]): Promise<AIImagingAnalysis> {
    const formData = new FormData()
    dicomImages.forEach((img, idx) => {
      formData.append('images', img, `slice_${idx}.dcm`)
    })

    const response = await aiApi.post('/imaging/ct-nodule', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return response.data
  }

  // MRI 影像分析
  async analyzeMRI(imageData: Blob, bodyPart: string): Promise<AIImagingAnalysis> {
    return aiApi.post('/imaging/mri', {
      image: imageData,
      bodyPart
    }, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }

  // 生成 AI 报告
  generateReport(analysis: AIImagingAnalysis): string {
    return `
AI 影像学分析报告

检查 ID: ${analysis.studyId}

影像所见:
${analysis.findings.map(f => `
- ${f.type}
  位置：${f.location}
  大小：${f.size ? `${f.size.length}×${f.size.width}×${f.size.height}mm` : 'N/A'}
  特征：${f.characteristics.join(', ')}
  恶性风险：${f.malignancyRisk}
`).join('\n')}

综合评估:
恶性可能性：${(analysis.likelihood * 100).toFixed(1)}%

建议:
${analysis.suggestions.map(s => `- ${s}`).join('\n')}

参考文献:
${analysis.references.map(r => `- ${r}`).join('\n')}
    `.trim()
  }
}
```

### 5.2 病理图像识别

```typescript
// src/services/ai/pathology.ts
interface PathologyAnalysis {
  slideId: string
  tissueType: string
  findings: PathologyFinding[]
  diagnosis: string
  grade?: string
  stage?: string
  markers: Biomarker[]
  confidence: number
}

interface PathologyFinding {
  cellType: string
  abnormality: string
  location: string
  percentage: number
}

interface Biomarker {
  name: string
  status: '阳性' | '阴性'
  value?: number
  unit?: string
}

class AIPathologyService {
  // 全切片图像分析
  async analyzeWSI(slideImage: Blob): Promise<PathologyAnalysis> {
    const response = await aiApi.post('/pathology/wsi-analysis', slideImage, {
      headers: { 'Content-Type': 'image/png' }
    })
    return response.data
  }

  // 免疫组化分析
  async analyzeIHC(images: Blob[]): Promise<Biomarker[]> {
    const formData = new FormData()
    images.forEach((img, idx) => {
      formData.append('images', img, `ihc_${idx}.png`)
    })

    const response = await aiApi.post('/pathology/ihc', formData)
    return response.data.markers
  }

  // 生成病理报告
  generatePathologyReport(analysis: PathologyAnalysis): string {
    return `
AI 病理学分析报告

标本 ID: ${analysis.slideId}
组织类型：${analysis.tissueType}

病理发现:
${analysis.findings.map(f => `
- ${f.cellType}
  异常：${f.abnormality}
  位置：${f.location}
  占比：${(f.percentage * 100).toFixed(1)}%
`).join('\n')}

病理诊断: ${analysis.diagnosis}
${analysis.grade ? `分级：${analysis.grade}` : ''}
${analysis.stage ? `分期：${analysis.stage}` : ''}

免疫组化:
${analysis.markers.map(m => `- ${m.name}: ${m.status}${m.value ? ` (${m.value}${m.unit})` : ''}`).join('\n')}

置信度：${(analysis.confidence * 100).toFixed(1)}%
    `.trim()
  }
}
```

### 5.3 临床决策支持

```typescript
// src/services/ai/cds.ts
interface ClinicalDecision {
  diagnosis: string
  differentialDiagnosis: DifferentialDiagnosis[]
  recommendedTests: RecommendedTest[]
  treatmentOptions: TreatmentOption[]
  guidelines: Guideline[]
  drugInteractions: DrugInteraction[]
  riskScore: number
}

interface DifferentialDiagnosis {
  disease: string
  probability: number
  supportingEvidence: string[]
  refutingEvidence: string[]
}

interface TreatmentOption {
  name: string
  type: '化疗' | '放疗' | '手术' | '靶向' | '免疫'
  indication: string
  efficacy: number
  sideEffects: string[]
  contraindications: string[]
  cost: number
}

class AIClinicalDecisionSupport {
  // 基于患者数据生成诊疗建议
  async generateRecommendations(patientData: PatientData): Promise<ClinicalDecision> {
    const response = await aiApi.post('/cds/recommendations', {
      demographics: patientData.demographics,
      diagnosis: patientData.diagnosis,
      history: patientData.history,
      labResults: patientData.labResults,
      imaging: patientData.imaging,
      pathology: patientData.pathology
    })

    return response.data
  }

  // 药物相互作用检查
  async checkDrugInteractions(drugs: string[]): Promise<DrugInteraction[]> {
    const response = await aiApi.post('/cds/drug-interactions', { drugs })
    return response.data.interactions
  }

  // 指南匹配
  async matchGuidelines(diagnosis: string, stage?: string): Promise<Guideline[]> {
    const response = await aiApi.post('/cds/guidelines', { diagnosis, stage })
    return response.data.guidelines
  }

  // 生成 MDT 讨论要点
  generateDiscussionPoints(decision: ClinicalDecision): string[] {
    const points: string[] = []

    // 诊断要点
    points.push(`主要诊断：${decision.diagnosis}`)
    points.push(`鉴别诊断：${decision.differentialDiagnosis.map(d => d.disease).join(', ')}`)

    // 检查建议
    if (decision.recommendedTests.length > 0) {
      points.push(`建议完善检查：${decision.recommendedTests.map(t => t.name).join(', ')}`)
    }

    // 治疗方案
    points.push('治疗方案选择：')
    decision.treatmentOptions.forEach((opt, idx) => {
      points.push(`  ${idx + 1}. ${opt.name} (有效率：${(opt.efficacy * 100).toFixed(0)}%)`)
    })

    // 注意事项
    if (decision.drugInteractions.length > 0) {
      points.push('⚠️ 药物相互作用警示')
    }

    return points
  }
}
```

### 5.4 AI 助手界面

```typescript
// src/components/AIAssistant.tsx
export const AIAssistant: React.FC<{ patientId: string }> = ({ patientId }) => {
  const [analysis, setAnalysis] = useState<ClinicalDecision | null>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const patientData = await patientService.getFullData(patientId)
      const result = await aiCDS.generateRecommendations(patientData)
      setAnalysis(result)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card 
      title="AI 诊疗助手"
      extra={<Button type="primary" onClick={handleAnalyze} loading={loading}>
        生成建议
      </Button>}
    >
      {loading && <Skeleton active />}
      
      {analysis && (
        <div className="space-y-4">
          <Alert 
            message={`诊断：${analysis.diagnosis}`}
            description={`风险评分：${(analysis.riskScore * 100).toFixed(0)}%`}
            type="info"
            showIcon
          />

          <Collapse>
            <Collapse.Panel header="鉴别诊断" key="1">
              <List
                dataSource={analysis.differentialDiagnosis}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={`${item.disease} (${(item.probability * 100).toFixed(0)}%)`}
                      description={
                        <Space direction="vertical" size="small">
                          <div>
                            <Text strong>支持:</Text> {item.supportingEvidence.join(', ')}
                          </div>
                          <div>
                            <Text strong>不支持:</Text> {item.refutingEvidence.join(', ')}
                          </div>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Collapse.Panel>

            <Collapse.Panel header="治疗方案" key="2">
              <List
                dataSource={analysis.treatmentOptions}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag>{item.type}</Tag>
                          {item.name}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size="small">
                          <Text>有效率：{(item.efficacy * 100).toFixed(0)}%</Text>
                          <Text type="secondary">副作用：{item.sideEffects.join(', ')}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Collapse.Panel>

            <Collapse.Panel header="指南推荐" key="3">
              <List
                dataSource={analysis.guidelines}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.title}
                      description={`${item.organization} - ${item.year}`}
                    />
                  </List.Item>
                )}
              />
            </Collapse.Panel>
          </Collapse>
        </div>
      )}
    </Card>
  )
}
```

---

## 📊 实施路线图

### Phase 4.1 (1-2 个月)
- [ ] HIS/EMR 基础对接
- [ ] 患者信息同步
- [ ] 电子病历读写
- [ ] PWA 基础架构

### Phase 4.2 (2-3 个月)
- [ ] PACS 影像集成
- [ ] DICOM 影像浏览
- [ ] IoT 设备接入
- [ ] 离线数据同步

### Phase 4.3 (3-4 个月)
- [ ] AI 影像分析
- [ ] 病理识别
- [ ] 临床决策支持
- [ ] 完整 PWA 支持

---

## 🔒 安全与合规

### 数据安全
- ✅ 传输加密 (HTTPS/TLS)
- ✅ 数据脱敏
- ✅ 访问控制
- ✅ 审计日志

### 隐私保护
- ✅ 患者知情同意
- ✅ 数据最小化
- ✅ 目的限制
- ✅ 存储限制

### 合规要求
- ✅ 等保 2.0 三级
- ✅ HIPAA (如适用)
- ✅ GDPR (如适用)
- ✅ 医疗器械软件注册

---

**Phase 4 规划完成!** 🎉

这将为 MDT 系统带来真正的智慧医疗能力，实现与医院生态系统的无缝集成。
