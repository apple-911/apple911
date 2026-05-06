# Phase 4 集成服务配置说明

## 环境变量配置

复制 `.env.example` 为 `.env` 并根据实际情况配置：

```bash
# HIS 系统配置
VITE_HIS_BASE_URL=http://localhost:8080/his/api
VITE_HIS_CLIENT_ID=mdt-system
VITE_HIS_CLIENT_SECRET=mdt-secret

# EMR 系统配置
VITE_EMR_BASE_URL=http://localhost:8080/emr/api
VITE_EMR_CLIENT_ID=mdt-system
VITE_EMR_CLIENT_SECRET=mdt-secret

# PACS 系统配置
VITE_PACS_BASE_URL=http://localhost:8080/pacs/api
VITE_PACS_WADO_URL=http://localhost:8080/wado

# IoT 设备配置
VITE_IOT_BASE_URL=http://localhost:8080/iot/api
VITE_MQTT_WS_URL=ws://localhost:9001/mqtt

# AI 服务配置
VITE_AI_BASE_URL=http://localhost:8080/ai/api

# 应用配置
VITE_APP_NAME=MDT 多学科会诊系统
VITE_APP_VERSION=4.0.0
```

## 服务架构

```
src/services/integration/
├── index.ts              # 统一导出
├── types.ts              # 类型定义
├── examples.ts           # 使用示例
├── his/                  # HIS 集成
│   ├── patientService.ts # 患者同步
│   └── orderService.ts   # 医嘱同步
├── emr/                  # EMR 集成
│   └── emrService.ts     # 电子病历
├── pacs/                 # PACS 集成
│   └── pacsService.ts    # 影像服务
├── iot/                  # IoT 集成
│   └── deviceService.ts  # 设备接入
├── ai/                   # AI 服务
│   └── clinicalService.ts# 临床决策
└── common/               # 公共模块
    ├── dataMapping.ts    # 数据映射
    └── auth.ts           # 认证服务
```

## 快速开始

### 1. HIS 患者同步

```typescript
import { hisPatientService } from '@/services/integration'

// 同步患者信息
const patient = await hisPatientService.syncPatient('123456')

// 转换为 MDT 格式
const mdtPatient = hisPatientService.transformToMDTPatient(patient)

// 订阅患者信息变更
const unsubscribe = hisPatientService.subscribePatientChange(
  '123456',
  (updatedPatient) => {
    console.log('患者信息更新:', updatedPatient)
  }
)
```

### 2. EMR 病历管理

```typescript
import { emrService } from '@/services/integration'

// 获取患者病历
const records = await emrService.getPatientRecords('patient-id')

// 写入 MDT 会诊记录
const record = await emrService.writeMDTRecord({
  patientId: 'patient-id',
  patientName: '张三',
  mainDiagnosis: '肺癌',
  conclusion: '建议手术治疗',
  // ... 其他字段
})
```

### 3. PACS 影像调阅

```typescript
import { pacsService } from '@/services/integration'

// 获取患者影像研究
const studies = await pacsService.getPatientStudies('patient-id')

// 获取研究序列
const series = await pacsService.getStudySeries(studies[0].studyInstanceUid)

// 生成 WADO-RS URL 用于影像浏览
const wadoUrl = pacsService.getWadoRsUrl(studies[0].studyInstanceUid)
```

### 4. IoT 设备监测

```typescript
import { iotDeviceService } from '@/services/integration'

// 获取实时生命体征
const vitals = await iotDeviceService.getRealTimeVitals('patient-id')

// 订阅实时数据
const unsubscribe = iotDeviceService.subscribeVitals(
  'patient-id',
  (data) => {
    console.log('新生命体征数据:', data)
  }
)

// 获取历史数据
const history = await iotDeviceService.getPatientVitalsHistory(
  'patient-id',
  '2024-01-01T00:00:00Z',
  '2024-01-02T00:00:00Z'
)
```

### 5. AI 临床决策

```typescript
import { aiClinicalService } from '@/services/integration'

// 获取诊断建议
const diagnosis = await aiClinicalService.getDiagnosisSuggestions(
  ['咳嗽', '胸痛', '咯血'],
  { age: 65, gender: '男', history: ['吸烟'] }
)

// 获取治疗方案推荐
const treatments = await aiClinicalService.getTreatmentRecommendations(
  '肺癌',
  'IIIA 期',
  { age: 65, performance: 1, comorbidities: [] }
)

// 检查药物相互作用
const interactions = await aiClinicalService.checkDrugInteractions(
  ['顺铂', '紫杉醇', '帕博利珠单抗']
)
```

## 数据映射配置

### 科室映射

在 `dataMapping.ts` 中配置医院科室编码：

```typescript
export const departmentMap: Record<string, string> = {
  'ONC': '肿瘤科',
  'TS': '胸外科',
  // 根据医院实际编码配置
}
```

### 诊断编码映射

```typescript
export const diagnosisMap: Record<string, string> = {
  'C34.9': '肺癌',
  'C18.9': '结直肠癌',
  // ICD-10 编码映射
}
```

## 安全认证

### OAuth 2.0 配置

系统使用 OAuth 2.0 client_credentials 授权模式：

```typescript
import { hisAuth } from '@/services/integration'

// 获取访问令牌
const token = await hisAuth.getToken()

// 获取认证头
const headers = await hisAuth.getAuthHeaders()

// 监听令牌过期
const unsubscribe = hisAuth.onTokenExpiring(() => {
  console.log('令牌即将过期，准备刷新')
})
```

## PWA 配置

### Service Worker 注册

在 `main.tsx` 中注册 Service Worker：

```typescript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('SW registered:', registration)
      })
      .catch(error => {
        console.log('SW registration failed:', error)
      })
  })
}
```

### 推送通知权限

```typescript
// 请求通知权限
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    console.log('通知权限已授予')
  }
})
```

## 离线支持

### 后台同步

```typescript
// 注册后台同步
if ('serviceWorker' in navigator && 'sync' in window.SyncManager) {
  const registration = await navigator.serviceWorker.ready
  await registration.sync.register('sync-mdt-data')
}
```

### 离线数据缓存

```typescript
// 缓存关键数据
const cache = await caches.open('mdt-data-v1')
await cache.put('/api/patient/123', response)
```

## 错误处理

### 统一错误处理

```typescript
try {
  const patient = await hisPatientService.syncPatient('123456')
} catch (error) {
  if (error.message.includes('认证失败')) {
    // 处理认证错误
    redirectToLogin()
  } else if (error.message.includes('网络错误')) {
    // 处理网络错误
    showOfflineMode()
  } else {
    // 其他错误
    showError(error.message)
  }
}
```

## 性能优化

### 数据缓存

```typescript
// 使用缓存减少网络请求
const cached = await caches.match('/api/patient/123')
if (cached) {
  const data = await cached.json()
  return data
}
```

### 请求去重

```typescript
// 避免重复请求
if (!pendingRequests.has(patientId)) {
  pendingRequests.set(patientId, fetchPatient(patientId))
}
const patient = await pendingRequests.get(patientId)
pendingRequests.delete(patientId)
```

## 测试

### 单元测试

```typescript
import { hisPatientService } from '@/services/integration'

describe('HIS Patient Service', () => {
  it('should sync patient successfully', async () => {
    const patient = await hisPatientService.syncPatient('123456')
    expect(patient.mrn).toBe('123456')
  })
})
```

### 集成测试

```typescript
describe('Integration Flow', () => {
  it('should complete full consultation flow', async () => {
    // 1. 同步患者
    // 2. 获取病历
    // 3. 获取影像
    // 4. AI 分析
    // 5. 写入 EMR
  })
})
```

## 监控与日志

### 性能监控

```typescript
// 记录 API 响应时间
const start = performance.now()
await hisPatientService.syncPatient('123456')
const duration = performance.now() - start
console.log('API 响应时间:', duration, 'ms')
```

### 错误追踪

```typescript
// 上报错误到监控系统
try {
  await apiCall()
} catch (error) {
  errorTracker.captureException(error, {
    context: 'HIS_PATIENT_SYNC',
    patientId: '123456'
  })
}
```

## 部署

### Docker 配置

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### 环境变量

在生产环境中使用环境变量或配置中心管理敏感信息。

## 常见问题

### Q: 如何处理 HIS 系统超时？

A: 配置重试机制和超时时间：

```typescript
const response = await hisApi.get('/patient/123', {
  timeout: 10000,
  retry: 3
})
```

### Q: 如何处理数据格式不一致？

A: 使用数据映射层进行转换：

```typescript
const mdtPatient = DataMapping.transformPatient(hisPatient)
```

### Q: 如何保证数据安全？

A: 使用 HTTPS、OAuth 2.0 认证、数据加密等多重安全措施。

## 更新日志

### v4.0.0 (2024-01-01)
- ✅ HIS/EMR 基础集成
- ✅ PACS 影像集成
- ✅ IoT 设备接入
- ✅ PWA 离线支持
- ✅ AI 临床决策

### 后续版本规划
- [ ] DICOM 影像直接浏览
- [ ] 实时音视频会诊
- [ ] 区块链病历存证
- [ ] 5G 远程医疗
