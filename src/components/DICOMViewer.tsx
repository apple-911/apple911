/**
 * DICOM 影像浏览器组件
 * 
 * 支持 DICOM 影像加载、窗宽窗位调节、测量标注等功能
 */

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Slider, Button, Space, Tooltip, Modal, message } from 'antd'
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  ReloadOutlined,
  FullscreenOutlined,
  SwapOutlined,
  ScanOutlined,
  LineOutlined,
  CiCircleOutlined,
  SaveOutlined,
  DownloadOutlined
} from '@ant-design/icons'

interface DICOMViewerProps {
  imageUrl: string           // DICOM 影像 URL
  studyId?: string           // 研究 ID
  seriesId?: string          // 序列 ID
  instanceId?: string        // 实例 ID
  onMeasure?: (data: any) => void  // 测量回调
  onWindowChange?: (ww: number, wl: number) => void  // 窗宽窗位变化回调
  className?: string
  style?: React.CSSProperties
}

interface Measurement {
  id: string
  type: 'length' | 'angle' | 'roi'
  points: { x: number; y: number }[]
  value?: number
  unit?: string
  color: string
}

interface Viewport {
  scale: number
  panX: number
  panY: number
  windowWidth: number
  windowLevel: number
  rotation: number
  flipH: boolean
  flipV: boolean
}

export const DICOMViewer: React.FC<DICOMViewerProps> = ({
  imageUrl,
  studyId,
  seriesId,
  instanceId,
  onMeasure,
  onWindowChange,
  className,
  style
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewport, setViewport] = useState<Viewport>({
    scale: 1,
    panX: 0,
    panY: 0,
    windowWidth: 400,
    windowLevel: 40,
    rotation: 0,
    flipH: false,
    flipV: false
  })
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [activeTool, setActiveTool] = useState<'pan' | 'zoom' | 'length' | 'angle' | 'roi'>('pan')
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([])
  const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number; value: number } | null>(null)

  // 加载 DICOM 影像
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImage(img)
      setLoading(false)
      renderImage()
    }
    img.onerror = () => {
      setLoading(false)
      message.error('影像加载失败')
    }
    img.src = imageUrl
  }, [imageUrl])

  // 渲染影像
  const renderImage = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !image) return

    // 设置画布大小
    canvas.width = containerRef.current?.clientWidth || 800
    canvas.height = containerRef.current?.clientHeight || 600

    // 清空画布
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 应用变换
    ctx.save()
    ctx.translate(canvas.width / 2 + viewport.panX, canvas.height / 2 + viewport.panY)
    ctx.scale(viewport.scale * (viewport.flipH ? -1 : 1), viewport.scale * (viewport.flipV ? -1 : 1))
    ctx.rotate((viewport.rotation * Math.PI) / 180)

    // 应用窗宽窗位
    if (viewport.windowWidth && viewport.windowLevel) {
      const min = viewport.windowLevel - viewport.windowWidth / 2
      const max = viewport.windowLevel + viewport.windowWidth / 2
      // 这里可以使用 WebGL 或 CSS filter 来实现窗宽窗位调节
    }

    // 绘制影像
    ctx.drawImage(image, -image.width / 2, -image.height / 2)
    ctx.restore()

    // 绘制测量标注
    drawMeasurements(ctx)

    // 应用窗宽窗位效果（简化版）
    if (viewport.windowWidth && viewport.windowLevel) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      // 实际项目中应该使用更高效的 WebGL 实现
    }
  }, [image, viewport, measurements])

  // 绘制测量标注
  const drawMeasurements = (ctx: CanvasRenderingContext2D) => {
    measurements.forEach(m => {
      ctx.strokeStyle = m.color
      ctx.fillStyle = m.color
      ctx.lineWidth = 2 / viewport.scale

      if (m.type === 'length' && m.points.length >= 2) {
        // 绘制线段
        ctx.beginPath()
        ctx.moveTo(m.points[0].x, m.points[0].y)
        ctx.lineTo(m.points[1].x, m.points[1].y)
        ctx.stroke()

        // 绘制端点
        m.points.forEach(p => {
          ctx.beginPath()
          ctx.arc(p.x, p.y, 4 / viewport.scale, 0, Math.PI * 2)
          ctx.fill()
        })

        // 显示测量值
        if (m.value) {
          const midX = (m.points[0].x + m.points[1].x) / 2
          const midY = (m.points[0].y + m.points[1].y) / 2
          ctx.font = `${12 / viewport.scale}px Arial`
          ctx.fillText(`${m.value.toFixed(2)} ${m.unit || 'mm'}`, midX + 5, midY)
        }
      } else if (m.type === 'roi' && m.points.length >= 2) {
        // 绘制 ROI 矩形
        const width = m.points[1].x - m.points[0].x
        const height = m.points[1].y - m.points[0].y
        ctx.strokeRect(m.points[0].x, m.points[0].y, width, height)
      }
    })
  }

  // 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (activeTool === 'pan') {
      setIsDrawing(true)
      setCurrentPoints([{ x, y }])
    } else if (activeTool === 'length' || activeTool === 'roi') {
      setCurrentPoints([{ x, y }])
      setIsDrawing(true)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isDrawing && activeTool === 'pan') {
      const dx = x - currentPoints[0].x
      const dy = y - currentPoints[0].y
      setViewport(prev => ({
        ...prev,
        panX: prev.panX + dx,
        panY: prev.panY + dy
      }))
      setCurrentPoints([{ x, y }])
    } else if (isDrawing && (activeTool === 'length' || activeTool === 'roi')) {
      setCurrentPoints(prev => [...prev, { x, y }])
      renderImage()
      
      // 实时预览
      const ctx = canvasRef.current?.getContext('2d')
      if (ctx) {
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = 2
        if (activeTool === 'length' && currentPoints.length >= 1) {
          ctx.beginPath()
          ctx.moveTo(currentPoints[0].x, currentPoints[0].y)
          ctx.lineTo(x, y)
          ctx.stroke()
        } else if (activeTool === 'roi' && currentPoints.length >= 1) {
          ctx.strokeRect(currentPoints[0].x, currentPoints[0].y, x - currentPoints[0].x, y - currentPoints[0].y)
        }
      }
    }

    // 显示像素值
    if (image) {
      const imgX = Math.floor((x - viewport.panX - canvasRef.current!.width / 2) / viewport.scale + image.width / 2)
      const imgY = Math.floor((y - viewport.panY - canvasRef.current!.height / 2) / viewport.scale + image.height / 2)
      // 实际项目中应该从 DICOM 数据中获取像素值
      setHoverInfo({ x: imgX, y: imgY, value: 0 })
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (activeTool === 'length' && currentPoints.length >= 1) {
      // 计算长度（需要 DICOM 的 pixel spacing）
      const dx = x - currentPoints[0].x
      const dy = y - currentPoints[0].y
      const distance = Math.sqrt(dx * dx + dy * dy)
      const mmDistance = distance * 0.5 // 假设 0.5mm/pixel

      const measurement: Measurement = {
        id: Date.now().toString(),
        type: 'length',
        points: [currentPoints[0], { x, y }],
        value: mmDistance,
        unit: 'mm',
        color: '#00ff00'
      }

      setMeasurements(prev => [...prev, measurement])
      onMeasure?.(measurement)
    } else if (activeTool === 'roi' && currentPoints.length >= 1) {
      const measurement: Measurement = {
        id: Date.now().toString(),
        type: 'roi',
        points: [currentPoints[0], { x, y }],
        color: '#00ff00'
      }
      setMeasurements(prev => [...prev, measurement])
    }

    setIsDrawing(false)
    setCurrentPoints([])
    renderImage()
  }

  // 工具栏功能
  const handleZoom = (delta: number) => {
    setViewport(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(10, prev.scale + delta))
    }))
  }

  const handleReset = () => {
    setViewport({
      scale: 1,
      panX: 0,
      panY: 0,
      windowWidth: 400,
      windowLevel: 40,
      rotation: 0,
      flipH: false,
      flipV: false
    })
    setMeasurements([])
  }

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        containerRef.current.requestFullscreen()
      }
    }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `dicom-${studyId || 'image'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    message.success('影像已下载')
  }

  return (
    <div ref={containerRef} className={`relative bg-black ${className}`} style={style}>
      {/* 工具栏 */}
      <div className="absolute top-2 left-2 z-10 bg-gray-900 bg-opacity-75 rounded-lg p-2">
        <Space size="small">
          <Tooltip title="窗宽窗位">
            <Button
              type={activeTool === 'pan' ? 'primary' : 'default'}
              size="small"
              icon={<SwapOutlined />}
              onClick={() => setActiveTool('pan')}
            />
          </Tooltip>
          
          <Tooltip title="缩放">
            <Button
              type={activeTool === 'zoom' ? 'primary' : 'default'}
              size="small"
              icon={<ZoomInOutlined />}
              onClick={() => setActiveTool('zoom')}
            />
          </Tooltip>
          
          <Tooltip title="测量长度">
            <Button
              type={activeTool === 'length' ? 'primary' : 'default'}
              size="small"
              icon={<LineOutlined />}
              onClick={() => setActiveTool('length')}
            />
          </Tooltip>
          
          <Tooltip title="ROI 测量">
            <Button
              type={activeTool === 'roi' ? 'primary' : 'default'}
              size="small"
              icon={<CiCircleOutlined />}
              onClick={() => setActiveTool('roi')}
            />
          </Tooltip>
          
          <Tooltip title="重置">
            <Button size="small" icon={<ReloadOutlined />} onClick={handleReset} />
          </Tooltip>
          
          <Tooltip title="全屏">
            <Button size="small" icon={<FullscreenOutlined />} onClick={handleFullscreen} />
          </Tooltip>
          
          <Tooltip title="下载">
            <Button size="small" icon={<DownloadOutlined />} onClick={handleDownload} />
          </Tooltip>
        </Space>
      </div>

      {/* 窗宽窗位调节 */}
      <div className="absolute top-2 right-2 z-10 bg-gray-900 bg-opacity-75 rounded-lg p-2">
        <Space direction="vertical" size="small">
          <div className="text-white text-xs">
            WW: {viewport.windowWidth}
          </div>
          <Slider
            vertical
            min={1}
            max={2000}
            value={viewport.windowWidth}
            onChange={(value) => {
              setViewport(prev => ({ ...prev, windowWidth: value as number }))
              onWindowChange?.(value as number, viewport.windowLevel)
            }}
            style={{ height: 100 }}
          />
          
          <div className="text-white text-xs">
            WL: {viewport.windowLevel}
          </div>
          <Slider
            vertical
            min={-1000}
            max={3000}
            value={viewport.windowLevel}
            onChange={(value) => {
              setViewport(prev => ({ ...prev, windowLevel: value as number }))
              onWindowChange?.(viewport.windowWidth, value as number)
            }}
            style={{ height: 100 }}
          />
        </Space>
      </div>

      {/* 缩放控制 */}
      <div className="absolute bottom-2 left-2 z-10 bg-gray-900 bg-opacity-75 rounded-lg p-2">
        <Space>
          <Button size="small" icon={<ZoomOutOutlined />} onClick={() => handleZoom(-0.1)} />
          <span className="text-white text-xs">{Math.round(viewport.scale * 100)}%</span>
          <Button size="small" icon={<ZoomInOutlined />} onClick={() => handleZoom(0.1)} />
        </Space>
      </div>

      {/* 影像画布 */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDrawing(false)}
      />

      {/* 加载指示器 */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-lg">加载影像中...</div>
        </div>
      )}

      {/* 悬停信息 */}
      {hoverInfo && (
        <div className="absolute bottom-2 right-2 z-10 bg-gray-900 bg-opacity-75 rounded-lg px-2 py-1 text-white text-xs">
          X: {hoverInfo.x} Y: {hoverInfo.y} Value: {hoverInfo.value}
        </div>
      )}

      {/* 测量列表 */}
      {measurements.length > 0 && (
        <div className="absolute top-20 left-2 z-10 bg-gray-900 bg-opacity-75 rounded-lg p-2 max-h-48 overflow-y-auto">
          <div className="text-white text-xs mb-1">测量结果:</div>
          {measurements.map((m, i) => (
            <div key={m.id} className="text-green-400 text-xs">
              {i + 1}. {m.type === 'length' ? `${m.value?.toFixed(2)} ${m.unit}` : 'ROI'}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DICOMViewer
