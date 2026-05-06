import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Space, Typography, Badge, Row, Col, Modal, message, Statistic } from 'antd'
import {
  VideoCameraOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  AimOutlined,
  CameraOutlined,
  MonitorOutlined,
  HeartOutlined,
  ArrowLeftOutlined,
  FullscreenOutlined,
  CompressOutlined,
} from '@ant-design/icons'
import { mockConsultations } from '../../mocks/data'

const { Title, Text } = Typography

export default function Bedside() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [audioOn, setAudioOn] = useState(true)
  const [cameraMoving, setCameraMoving] = useState('')
  const [fullscreen, setFullscreen] = useState(true)
  const [showVitalSigns, setShowVitalSigns] = useState(true)

  const consultation = mockConsultations.find(c => c.id === id)

  const handleCameraMove = (direction: string) => {
    setCameraMoving(direction)
    message.info(`正在向${direction}移动摄像头`)
    setTimeout(() => setCameraMoving(''), 500)
  }

  const handleCapture = () => {
    Modal.confirm({
      title: '拍照上传',
      content: '确定要上传当前体征照片到会诊室吗？',
      onOk: () => message.success('已上传到会诊室')
    })
  }

  return (
    <div className="min-h-screen !bg-gray-900">
      <div className="p-4 flex items-center justify-between !bg-gray-800">
        <Space>
          <Button icon={<ArrowLeftOutlined />} className="!text-white" type="text" onClick={() => navigate(-1)} />
          <Title level={5} className="!text-white !mb-0">床边会诊辅助</Title>
          <Badge status="processing" text={<Text className="text-white">进行中</Text>} />
        </Space>
        <Space>
          <Button icon={fullscreen ? <CompressOutlined /> : <FullscreenOutlined />} className="!text-white" onClick={() => setFullscreen(!fullscreen)}>
            {fullscreen ? '退出全屏' : '全屏'}
          </Button>
          <Button type="primary" onClick={() => navigate(`/consultation/room/${id}`)}>
            切换到虚拟会诊室
          </Button>
        </Space>
      </div>

      <div className="relative">
        <div className="h-[60vh] bg-black flex items-center justify-center relative">
          <div className="text-center">
            <VideoCameraOutlined className="text-8xl text-gray-600" />
            <Title level={3} className="!text-white !mt-4">{consultation?.patientName}</Title>
            <Text className="text-gray-400">{consultation?.mainDiagnosis}</Text>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            <Button
              type={audioOn ? 'primary' : 'default'}
              shape="circle"
              size="large"
              icon={audioOn ? <AudioOutlined /> : <AudioMutedOutlined />}
              danger={!audioOn}
              onClick={() => setAudioOn(!audioOn)}
            />
            <Button type="primary" shape="circle" size="large" icon={<CameraOutlined />} onClick={handleCapture} />
            <Button type="primary" shape="circle" size="large" icon={<MonitorOutlined />} />
          </div>

          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button className="!bg-gray-700" onClick={() => setShowVitalSigns(!showVitalSigns)}>
              {showVitalSigns ? '隐藏' : '显示'}生命体征
            </Button>
          </div>

          {showVitalSigns && (
            <Card className="absolute top-4 left-4 !w-64">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="心率"
                    value={78}
                    prefix={<HeartOutlined className="text-red-500" />}
                    suffix="bpm"
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="血压"
                    value={128}
                    suffix="/80"
                  />
                </Col>
              </Row>
              <Row gutter={16} className="mt-2">
                <Col span={12}>
                  <Statistic title="血氧" value={97} suffix="%" />
                </Col>
                <Col span={12}>
                  <Statistic title="体温" value={36.6} suffix="°C" />
                </Col>
              </Row>
            </Card>
          )}

          <Card className="absolute bottom-20 right-4 !w-48">
            <Title level={5}>远程控制</Title>
            <div className="grid grid-cols-3 gap-1">
              <div />
              <Button size="small" onClick={() => handleCameraMove('上')}>上</Button>
              <div />
              <Button size="small" onClick={() => handleCameraMove('左')}>左</Button>
              <Button size="small" type="primary" icon={<AimOutlined />} />
              <Button size="small" onClick={() => handleCameraMove('右')}>右</Button>
              <div />
              <Button size="small" onClick={() => handleCameraMove('下')}>下</Button>
              <div />
            </div>
            <div className="mt-2 text-center">
              <Text type="secondary" className="text-xs">云台控制</Text>
            </div>
          </Card>
        </div>

        <div className="p-4 !bg-gray-800">
          <Row gutter={16}>
            <Col span={6}>
              <Card hoverable>
                <Statistic title="会诊时长" value={35} suffix="分钟" />
              </Card>
            </Col>
            <Col span={6}>
              <Card hoverable>
                <Statistic title="在线专家" value={3} suffix="人" />
              </Card>
            </Col>
            <Col span={6}>
              <Card hoverable>
                <Statistic title="已上传照片" value={2} suffix="张" />
              </Card>
            </Col>
            <Col span={6}>
              <Card hoverable>
                <Statistic title="会诊类型" value={consultation?.type || '院内'} />
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  )
}