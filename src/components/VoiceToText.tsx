import { useState, useEffect, useRef } from 'react'
import { Card, Button, Space, Typography, Badge, Tooltip, Tag } from 'antd'
import {
  FieldTimeOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  StopOutlined,
  SoundOutlined,
  FileTextOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

interface TranscriptionItem {
  id: string
  text: string
  speaker?: string
  timestamp: number
  tags?: string[]
}

interface VoiceToTextProps {
  onTranscription?: (items: TranscriptionItem[]) => void
  autoTag?: boolean
  realtime?: boolean
}

/**
 * 语音转文字组件
 * 支持实时转写和关键信息提取
 */
export default function VoiceToText({
  onTranscription,
  autoTag = true,
  realtime = true,
}: VoiceToTextProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcriptions, setTranscriptions] = useState<TranscriptionItem[]>([])
  const [recordingTime, setRecordingTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 模拟语音识别
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      // 模拟实时转写
      if (realtime) {
        simulateRealtimeTranscription()
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording])

  // 模拟实时转写
  const simulateRealtimeTranscription = () => {
    const mockTranscriptions = [
      {
        text: '建议使用 GP 方案化疗，吉西他滨 1000mg/m² d1, d8',
        tags: ['治疗方案', '用药'],
      },
      {
        text: '先行胸部增强 CT 检查，评估病灶变化',
        tags: ['检查'],
      },
      {
        text: '患者 ECOG 评分 1 分，耐受性良好',
        tags: ['评估'],
      },
      {
        text: '建议 3 周期后复查，评估疗效',
        tags: ['随访'],
      },
    ]

    const randomIndex = Math.floor(Math.random() * mockTranscriptions.length)
    const newItem: TranscriptionItem = {
      id: `${Date.now()}`,
      text: mockTranscriptions[randomIndex].text,
      speaker: `专家${Math.floor(Math.random() * 3) + 1}`,
      timestamp: Date.now(),
      tags: autoTag ? mockTranscriptions[randomIndex].tags : undefined,
    }

    setTranscriptions((prev) => [...prev, newItem])
    onTranscription?.([...transcriptions, newItem])
  }

  // 开始录音
  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)
    setTranscriptions([])
  }

  // 暂停/继续录音
  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  // 停止录音
  const stopRecording = () => {
    setIsRecording(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 提取关键信息
  const extractKeyInfo = () => {
    const info = {
      drugs: [] as string[],
      exams: [] as string[],
      diagnoses: [] as string[],
      followups: [] as string[],
    }

    transcriptions.forEach((item) => {
      if (item.tags?.includes('用药')) {
        info.drugs.push(item.text)
      }
      if (item.tags?.includes('检查')) {
        info.exams.push(item.text)
      }
      if (item.tags?.includes('治疗方案')) {
        info.diagnoses.push(item.text)
      }
      if (item.tags?.includes('随访')) {
        info.followups.push(item.text)
      }
    })

    return info
  }

  const keyInfo = extractKeyInfo()

  return (
    <Card
      title={
        <Space>
          <SoundOutlined className="text-medical-blue" />
          <span>语音转写</span>
          {isRecording && (
            <Badge color="red" text="录音中" />
          )}
        </Space>
      }
      extra={
        <Space>
          <Tooltip title={isRecording ? '暂停' : '开始'}>
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={isRecording ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={isRecording ? toggleRecording : startRecording}
            />
          </Tooltip>
          <Tooltip title="停止">
            <Button
              danger
              shape="circle"
              size="large"
              icon={<StopOutlined />}
              onClick={stopRecording}
              disabled={!isRecording && transcriptions.length === 0}
            />
          </Tooltip>
        </Space>
      }
    >
      <div className="space-y-4">
        {/* 录音时长 */}
        <div className="flex items-center justify-center gap-2 py-4 bg-gray-50 rounded">
          <FieldTimeOutlined className="text-2xl text-medical-blue" />
          <Text className="text-2xl font-bold">{formatTime(recordingTime)}</Text>
        </div>

        {/* 转写内容 */}
        {transcriptions.length > 0 && (
          <div className="space-y-3">
            <Title level={5}>
              <FileTextOutlined className="mr-2" />
              转写内容
            </Title>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transcriptions.map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded">
                  <div className="flex items-start justify-between mb-1">
                    <Text strong>{item.speaker}</Text>
                    <Text type="secondary" className="text-xs">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </Text>
                  </div>
                  <Text>{item.text}</Text>
                  {item.tags && (
                    <div className="mt-2 space-x-1">
                      {item.tags.map((tag, index) => (
                        <Tag key={index} color="blue" className="text-xs">
                          {tag}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 关键信息提取 */}
        {autoTag && transcriptions.length > 0 && (
          <div className="space-y-3">
            <Title level={5}>关键信息提取</Title>
            <div className="grid grid-cols-2 gap-3">
              {keyInfo.drugs.length > 0 && (
                <div className="p-3 bg-blue-50 rounded">
                  <Text strong className="text-blue-600">
                    💊 用药方案
                  </Text>
                  <ul className="mt-2 space-y-1">
                    {keyInfo.drugs.map((item, index) => (
                      <li key={index}>
                        <Text className="text-sm">{item}</Text>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {keyInfo.exams.length > 0 && (
                <div className="p-3 bg-green-50 rounded">
                  <Text strong className="text-green-600">
                    📋 检查项目
                  </Text>
                  <ul className="mt-2 space-y-1">
                    {keyInfo.exams.map((item, index) => (
                      <li key={index}>
                        <Text className="text-sm">{item}</Text>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {!isRecording && transcriptions.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <SoundOutlined className="text-6xl mb-4" />
            <div>
              <Text className="text-lg">点击开始进行语音转写</Text>
              <br />
              <Text type="secondary" className="text-sm">
                支持实时转写和关键信息自动提取
              </Text>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}