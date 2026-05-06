/**
 * PWA Service Worker
 * 
 * 实现离线缓存、后台同步、推送通知等功能
 */

const CACHE_NAME = 'mdt-cache-v1'
const OFFLINE_PAGE = '/offline.html'

// 需要预缓存的资源
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
]

// API 路由缓存策略
const CACHE_STRATEGIES = {
  // 网络优先，失败时缓存
  'api/his': 'networkFirst',
  'api/emr': 'networkFirst',
  'api/pacs': 'networkFirst',
  'api/iot': 'networkFirst',
  
  // 缓存优先，后台更新
  'api/patient': 'cacheFirst',
  'api/consultation': 'cacheFirst',
  
  // 静态资源：缓存优先
  'static': 'cacheFirst',
  
  // 图片：缓存优先
  'images': 'cacheFirst'
}

// 安装事件
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[Service Worker] 安装')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] 预缓存资源')
        return cache.addAll(PRECACHE_ASSETS)
      })
      .then(() => {
        console.log('[Service Worker] 预缓存完成')
        return self.skipWaiting()
      })
  )
})

// 激活事件
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[Service Worker] 激活')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('[Service Worker] 删除旧缓存:', name)
              return caches.delete(name)
            })
        )
      })
      .then(() => {
        console.log('[Service Worker] 接管所有客户端')
        return self.clients.claim()
      })
  )
})

// 获取事件
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)
  
  // 只处理同源请求
  if (url.origin !== location.origin) {
    return
  }
  
  // 确定缓存策略
  let strategy = 'networkFirst'
  
  if (request.url.includes('/api/his') || 
      request.url.includes('/api/emr') ||
      request.url.includes('/api/pacs') ||
      request.url.includes('/api/iot')) {
    strategy = 'networkFirst'
  } else if (request.url.includes('/api/')) {
    strategy = 'cacheFirst'
  } else if (request.destination === 'image') {
    strategy = 'cacheFirst'
  } else if (request.destination === 'script' || request.destination === 'style') {
    strategy = 'cacheFirst'
  }
  
  // 应用缓存策略
  event.respondWith(
    strategy === 'networkFirst'
      ? networkFirst(request)
      : cacheFirst(request)
  )
})

/**
 * 网络优先策略
 */
async function networkFirst(request: Request): Promise<Response> {
  try {
    const response = await fetch(request)
    
    // 克隆响应并缓存
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('[Service Worker] 网络失败，使用缓存:', request.url)
    
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }
    
    // 如果是导航请求，返回离线页面
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_PAGE) || new Response('Offline', { status: 503 })
    }
    
    return new Response('Network error', { status: 503 })
  }
}

/**
 * 缓存优先策略
 */
async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request)
  
  if (cached) {
    console.log('[Service Worker] 使用缓存:', request.url)
    
    // 后台更新缓存
    fetch(request)
      .then(response => {
        if (response.ok) {
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, response.clone()))
        }
      })
      .catch(() => {
        // 忽略网络错误
      })
    
    return cached
  }
  
  try {
    return await fetch(request)
  } catch (error) {
    console.log('[Service Worker] 缓存和网络都失败:', request.url)
    
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_PAGE) || new Response('Offline', { status: 503 })
    }
    
    return new Response('Not found', { status: 404 })
  }
}

/**
 * 后台同步
 */
self.addEventListener('sync', (event: SyncEvent) => {
  console.log('[Service Worker] 后台同步:', event.tag)
  
  if (event.tag === 'sync-mdt-data') {
    event.waitUntil(syncMDTData())
  }
})

/**
 * 同步 MDT 数据
 */
async function syncMDTData(): Promise<void> {
  try {
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
        
        // 同步成功后删除待同步数据
        await removePendingSyncItem(item.id)
      } catch (error) {
        console.error('[Service Worker] 同步失败:', item.id, error)
      }
    }
  } catch (error) {
    console.error('[Service Worker] 同步过程出错:', error)
  }
}

/**
 * 获取待同步数据（需要从 IndexedDB 实现）
 */
async function getPendingSyncData(): Promise<Array<{
  id: string
  url: string
  method: string
  data: any
}>> {
  // 简化实现，实际需要使用 IndexedDB
  return []
}

/**
 * 删除待同步项
 */
async function removePendingSyncItem(id: string): Promise<void> {
  // 简化实现
}

/**
 * 推送通知
 */
self.addEventListener('push', (event: PushEvent) => {
  console.log('[Service Worker] 收到推送')
  
  const data = event.data?.json() || {}
  const { title, body, icon, badge, data: notificationData } = data
  
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || '/logo192.png',
      badge: badge || '/logo192.png',
      data: notificationData,
      timestamp: Date.now(),
      actions: [
        { action: 'view', title: '查看' },
        { action: 'dismiss', title: '关闭' }
      ]
    })
  )
})

/**
 * 通知点击事件
 */
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  
  if (event.action === 'view') {
    const urlToOpen = event.notification.data?.url || '/'
    
    event.waitUntil(
      clients.matchAll({ type: 'window' })
        .then(windowClients => {
          // 检查是否有已打开的窗口
          for (const client of windowClients) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus()
            }
          }
          // 打开新窗口
          if (clients.openWindow) {
            return clients.openWindow(urlToOpen)
          }
        })
    )
  }
})

/**
 * 消息事件
 */
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  console.log('[Service Worker] 收到消息:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CLIENTS_COUNT') {
    event.waitUntil(
      clients.matchAll().then(clients => {
        event.source?.postMessage({
          type: 'CLIENTS_COUNT',
          count: clients.length
        })
      })
    )
  }
})
