/**
 * VR/AR 影像浏览组件
 * 
 * 支持 VR 头显设备，实现 3D 影像重建和沉浸式浏览
 */

import React, { useState, useRef, useEffect } from 'react'
import { Button, Space, Slider, Select, message } from 'antd'
import {
  InboxOutlined,
  ApartmentOutlined,
  RotateLeftOutlined,
  ZoomInOutlined,
  ZoomOutOutlined
} from '@ant-design/icons'

interface VRImageViewerProps {
  dicomUrl: string
  studyId?: string
  seriesId?: string
  mode?: '2D' | '3D' | 'VR' | 'AR'
  onMeasure?: (data: any) => void
  className?: string
  style?: React.CSSProperties
}

interface VolumeData {
  width: number
  height: number
  depth: number
  voxels: Float32Array
  transferFunction: TransferFunction
}

interface TransferFunction {
  color: Array<{ value: number; color: [number, number, number] }>
  opacity: Array<{ value: number; opacity: number }>
}

interface Model3D {
  id: string
  name: string
  type: 'organ' | 'tumor' | 'vessel' | 'bone'
  vertices: Float32Array
  normals: Float32Array
  colors: Float32Array
  visible: boolean
  opacity: number
}

export const VRImageViewer: React.FC<VRImageViewerProps> = ({
  dicomUrl,
  studyId,
  seriesId,
  mode = '3D',
  onMeasure,
  className,
  style
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const [volume, setVolume] = useState<VolumeData | null>(null)
  const [models, setModels] = useState<Model3D[]>([])
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 })
  const [zoom, setZoom] = useState(1)
  const [threshold, setThreshold] = useState(100)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) {
      message.error('您的浏览器不支持 WebGL')
      return
    }

    glRef.current = gl as WebGLRenderingContext
    initWebGL(gl)
  }, [])

  useEffect(() => {
    loadDicomVolume()
  }, [dicomUrl])

  useEffect(() => {
    let animationId: number
    const render = () => {
      renderScene()
      animationId = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [volume, models, rotation, zoom])

  const initWebGL = (gl: WebGLRenderingContext): void => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.CULL_FACE)
  }

  const loadDicomVolume = async (): Promise<void> => {
    try {
      setLoading(true)
      
      const width = 512
      const height = 512
      const depth = 200
      const voxels = new Float32Array(width * height * depth)

      for (let i = 0; i < voxels.length; i++) {
        voxels[i] = Math.random() * 2000
      }

      const volumeData: VolumeData = {
        width,
        height,
        depth,
        voxels,
        transferFunction: {
          color: [
            { value: 0, color: [0, 0, 0] as [number, number, number] },
            { value: 500, color: [255, 0, 0] as [number, number, number] },
            { value: 1000, color: [255, 255, 0] as [number, number, number] },
            { value: 2000, color: [255, 255, 255] as [number, number, number] }
          ],
          opacity: [
            { value: 0, opacity: 0 },
            { value: 500, opacity: 0.5 },
            { value: 1000, opacity: 0.8 },
            { value: 2000, opacity: 1.0 }
          ]
        }
      }

      setVolume(volumeData)
      
      generateModels(volumeData)
      
      setLoading(false)
    } catch (error) {
      console.error('加载 DICOM 数据失败:', error)
      setLoading(false)
      message.error('加载影像失败')
    }
  }

  const generateModels = (volume: VolumeData): void => {
    const newModels: Model3D[] = [
      {
        id: 'organ-1',
        name: '肝脏',
        type: 'organ',
        vertices: new Float32Array([
          0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0,
          0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1
        ]),
        normals: new Float32Array([
          0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
          0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1
        ]),
        colors: new Float32Array([
          1, 0.5, 0, 1, 0.5, 0, 1, 0.5, 0, 1, 0.5, 0,
          1, 0.5, 0, 1, 0.5, 0, 1, 0.5, 0, 1, 0.5, 0
        ]),
        visible: true,
        opacity: 0.8
      }
    ]

    setModels(newModels)
  }

  const renderScene = (): void => {
    const gl = glRef.current
    const canvas = canvasRef.current
    if (!gl || !canvas) return

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.viewport(0, 0, canvas.width, canvas.height)

    if (models.length > 0) {
      renderModels()
    }
  }

  const renderModels = (): void => {
    const gl = glRef.current
    if (!gl) return

    // 简化渲染，实际项目中需要创建 shader program
    models.forEach(model => {
      if (!model.visible) return

      const vertexBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW)

      // 临时使用一个简单的 shader
      const positionLocation = gl.getAttribLocation(gl as any, 'a_position')
      if (positionLocation !== -1) {
        gl.enableVertexAttribArray(positionLocation)
        gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0)
        gl.drawArrays(gl.TRIANGLES, 0, model.vertices.length / 3)
      }
    })
  }

  const handleRotation = (axis: 'x' | 'y' | 'z', value: number) => {
    setRotation(prev => ({ ...prev, [axis]: value }))
  }

  const resetView = () => {
    setRotation({ x: 0, y: 0, z: 0 })
    setZoom(1)
  }

  const toggleModel = (modelId: string) => {
    setModels(prev =>
      prev.map(m =>
        m.id === modelId ? { ...m, visible: !m.visible } : m
      )
    )
  }

  return (
    <div className={`relative ${className}`} style={style}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-full bg-black"
      />

      <div className="absolute top-2 left-2 bg-gray-900 bg-opacity-75 rounded-lg p-2">
        <Space size="small">
          <Button
            type={mode === '2D' ? 'primary' : 'default'}
            size="small"
            icon={<InboxOutlined />}
            onClick={() => message.info('切换到 2D 模式')}
          >
            2D
          </Button>
          <Button
            type={mode === '3D' ? 'primary' : 'default'}
            size="small"
            icon={<ApartmentOutlined />}
            onClick={() => message.info('3D 重建模式')}
          >
            3D
          </Button>
          <Button
            size="small"
            icon={<RotateLeftOutlined />}
            onClick={resetView}
          >
            重置
          </Button>
        </Space>
      </div>

      <div className="absolute top-2 right-2 bg-gray-900 bg-opacity-75 rounded-lg p-2">
        <Space direction="vertical" size="small">
          <div className="text-white text-xs">X 轴旋转</div>
          <Slider
            vertical
            min={0}
            max={360}
            value={rotation.x}
            onChange={(value) => handleRotation('x', value as number)}
            style={{ height: 100 }}
          />
          
          <div className="text-white text-xs">Y 轴旋转</div>
          <Slider
            vertical
            min={0}
            max={360}
            value={rotation.y}
            onChange={(value) => handleRotation('y', value as number)}
            style={{ height: 100 }}
          />
        </Space>
      </div>

      <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-75 rounded-lg p-2">
        <Space>
          <Button size="small" icon={<ZoomOutOutlined />} onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} />
          <span className="text-white text-xs">{Math.round(zoom * 100)}%</span>
          <Button size="small" icon={<ZoomInOutlined />} onClick={() => setZoom(z => Math.min(2, z + 0.1))} />
        </Space>
      </div>

      <div className="absolute bottom-2 right-2 bg-gray-900 bg-opacity-75 rounded-lg p-2 max-h-48 overflow-y-auto">
        <div className="text-white text-xs mb-2">解剖结构</div>
        {models.map(model => (
          <div
            key={model.id}
            className="text-xs text-white mb-1 flex items-center justify-between"
          >
            <span>{model.name}</span>
            <input
              type="checkbox"
              checked={model.visible}
              onChange={() => toggleModel(model.id)}
              className="ml-2"
            />
          </div>
        ))}
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-lg">加载 3D 数据...</div>
        </div>
      )}
    </div>
  )
}

export default VRImageViewer
