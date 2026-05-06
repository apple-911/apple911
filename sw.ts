/**
 * PWA Service Worker
 * 
 * 实现离线缓存、后台同步、推送通知等功能
 */

const CACHE_NAME = 'mdt-cache-v1'
const OFFLINE_URL = '/offline.html'

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico'
]

// API 缓存策略
const API_CACHE_STRATEGY: Record<string, 'cache-first' | 'network-first' | 'stale-while-revalidate'> = {
  '/api/patient': 'stale-while-revalidate',
  '/api/consultation': 'network-first',
  '/api/report': 'cache-first',
  '/api/statistics': 'stale-while-revalidate'
}

// 安装事件
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// 激活事件
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// 获取事件
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)

  // 只处理同源请求
  if (url.origin !== location.origin) {
    return
  }

  // API 请求
  if (request.url.includes('/api/')) {
    event.respondWith(handleAPIRequest(request))
    return
  }

  // 静态资源
  event.respondWith(handleStaticRequest(request))
})

/**
 * 处理 API 请求
 */
async function handleAPIRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const pathname = url.pathname

  // 确定缓存策略
  let strategy: 'network-first' | 'cache-first' | 'stale-while-revalidate' = 'network-first'
  
  for (const [pattern, s] of Object.entries(API_CACHE_STRATEGY)) {
    if (pathname.includes(pattern)) {
      strategy = s
      break
    }
  }

  switch (strategy) {
    case 'cache-first':
      return cacheFirst(request)
    case 'network-first':
      return networkFirst(request)
    case 'stale-while-revalidate':
      return staleWhileRevalidate(request)
  }
}

/**
 * 处理静态资源请求
 */
async function handleStaticRequest(request: Request): Promise<Response> {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    
    // 如果是成功响应，克隆并缓存
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // 网络错误，返回离线页面
    return caches.match(OFFLINE_URL) || new Response('Offline', { status: 503 })
  }
}

/**
 * 缓存优先策略
 */
async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    return new Response('Network error', { status: 503 })
  }
}

/**
 * 网络优先策略
 */
async function networkFirst(request: Request): Promise<Response> {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }
    return new Response('Network error', { status: 503 })
  }
}

/**
 * 过时资源重新验证策略
 */
async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  const networkFetch = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => null)

  return cached || (await networkFetch) || new Response('Network error', { status: 503 })
}

// 后台同步
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'sync-mdt-data') {
    event.waitUntil(syncMDTData())
  }
})

/**
 * 同步 MDT 数据
 */
async function syncMDTData(): Promise<void> {
  // 从 IndexedDB 获取待同步数据
  const pendingData = await getPendingSyncData()
  
  for (const item of pendingData) {
    try {
      await fetch(item.url, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item.data)
      })
      
      // 同步成功，删除待同步记录
      await removePendingSync(item.id)
    } catch (error) {
      console.error('同步失败:', error)
    }
  }
}

/**
 * 获取待同步数据（需要从 IndexedDB 实现）
 */
async function getPendingSyncData(): Promise<Array<{ id: string; url: string; method: string; data: any }>> {
  // TODO: 实现 IndexedDB 读取
  return []
}

/**
 * 删除待同步记录
 */
async function removePendingSync(id: string): Promise<void> {
  // TODO: 实现 IndexedDB 删除
}

// 推送通知
self.addEventListener('push', (event: PushEvent) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'view',
          title: '查看',
          icon: '/icon-192.png'
        },
        {
          action: 'dismiss',
          title: '关闭'
        }
      ]
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// 通知点击事件
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    )
  }
})

// 消息事件
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// 导出类型
export {}
