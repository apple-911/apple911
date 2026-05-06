/**
 * 浏览器环境的事件发射器
 * 
 * 替代 Node.js 的 events 模块
 */

export type EventListener = (...args: any[]) => void

export class EventEmitter {
  private events: Map<string, EventListener[]> = new Map()

  on(event: string, listener: EventListener): this {
    const listeners = this.events.get(event) || []
    listeners.push(listener)
    this.events.set(event, listeners)
    return this
  }

  off(event: string, listener: EventListener): this {
    const listeners = this.events.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
      this.events.set(event, listeners)
    }
    return this
  }

  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events.get(event)
    if (listeners && listeners.length > 0) {
      listeners.forEach(listener => {
        try {
          listener(...args)
        } catch (error) {
          console.error(`Event listener error for "${event}":`, error)
        }
      })
      return true
    }
    return false
  }

  once(event: string, listener: EventListener): this {
    const onceListener = (...args: any[]) => {
      this.off(event, onceListener)
      listener(...args)
    }
    return this.on(event, onceListener)
  }

  removeAllListeners(event?: string): this {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
    return this
  }

  listenerCount(event: string): number {
    const listeners = this.events.get(event)
    return listeners ? listeners.length : 0
  }
}
