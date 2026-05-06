import { useState, useEffect } from 'react'
import { Card, Button, Badge, List, Avatar, Tabs, Tag, Timeline, Statistic, Row, Col, message } from 'antd'
import {
  FileTextOutlined,
  CalendarOutlined,
  BellOutlined,
  UserOutlined,
  FileDoneOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  ScheduleOutlined,
  FileProtectOutlined,
  MedicineBoxOutlined,
  PhoneOutlined,
  RightOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { TabPane } = Tabs

// 患者登录检查
const PatientGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(false)

  useEffect(() => {
    const patientUser = localStorage.getItem('patientUser')
    if (!patientUser) {
      message.warning('请先登录')
      navigate('/patient/login')
      return
    }
    setIsLogin(true)
  }, [navigate])

  if (!isLogin) return null
  return <>{children}</>
}

// Mock 数据
const patientInfo = {
  name: '张建国',
  age: 58,
  gender: '男',
  idCard: '11010119650101****',
  phone: '138****5678',
  medicalCard: 'M123456789',
  address: '北京市东城区****'
}

const applyData = {
  applying: 1,
  reviewing: 0,
  scheduled: 1,
  completed: 3
}

const recentApplications = [
  {
    id: 1,
    department: '肿瘤科',
    disease: '肺癌',
    status: 'scheduled',
    date: '2024-01-15',
    hospital: '北京协和医院',
    experts: 5
  },
  {
    id: 2,
    department: '心内科',
    disease: '冠心病',
    status: 'completed',
    date: '2024-01-10',
    hospital: '北京协和医院',
    experts: 4
  },
  {
    id: 3,
    department: '神经外科',
    disease: '脑膜瘤',
    status: 'completed',
    date: '2023-12-20',
    hospital: '北京协和医院',
    experts: 6
  }
]

const upcomingEvents = [
  {
    id: 1,
    type: 'consultation',
    title: 'MDT 会诊',
    time: '2024-01-15 14:30',
    location: '北京协和医院 3 楼 MDT 会诊室',
    department: '肿瘤科'
  },
  {
    id: 2,
    type: 'followup',
    title: '随访提醒',
    time: '2024-01-20 09:00',
    location: '线上随访',
    department: '肿瘤科'
  }
]

const messages = [
  {
    id: 1,
    title: '会诊安排通知',
    content: '您的 MDT 会诊已安排在 2024 年 1 月 15 日 14:30',
    time: '2024-01-08 10:30',
    read: false
  },
  {
    id: 2,
    title: '报告已完成',
    content: '您的会诊报告已完成，请查看',
    time: '2024-01-05 16:20',
    read: false
  },
  {
    id: 3,
    title: '随访提醒',
    content: '您有一次随访需要在 1 月 20 日前完成',
    time: '2024-01-03 09:00',
    read: true
  }
]

const statusMap: any = {
  applying: { color: 'blue', text: '申请中' },
  reviewing: { color: 'orange', text: '审核中' },
  scheduled: { color: 'green', text: '已安排' },
  completed: { color: '', text: '已完成' }
}

const PatientHome = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('home')
  const [patientUser, setPatientUser] = useState<any>(null)

  useEffect(() => {
    const user = localStorage.getItem('patientUser')
    if (user) {
      setPatientUser(JSON.parse(user))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('patientUser')
    message.success('已退出登录')
    navigate('/patient/login')
  }

  const getStatusBadge = (status: string) => {
    const config = statusMap[status] || { color: 'default', text: status }
    return <Badge color={config.color} text={config.text} />
  }

  const renderHome = () => (
    <div className="space-y-4">
      {/* 患者信息卡片 */}
      <Card className="text-white" styles={{ body: { padding: '16px' } }} style={{ background: 'linear-gradient(to right, var(--xiehe-green), var(--xiehe-green-light))' }}>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-white/80" style={{ fontSize: '14px' }}>欢迎</div>
            <div className="text-white text-xl font-bold mt-1">{patientInfo.name}</div>
            <div className="text-white/80 mt-2" style={{ fontSize: '13px' }}>
              {patientInfo.gender} | {patientInfo.age}岁 | {patientInfo.medicalCard}
            </div>
          </div>
          <Avatar size={56} icon={<UserOutlined />} className="bg-white" style={{ color: 'var(--xiehe-green)' }} />
        </div>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={12}>
        <Col span={12}>
          <Card className="text-center" style={{ background: 'var(--xiehe-green-bg)' }}>
            <Statistic
              title="总会诊"
              value={applyData.completed}
              prefix={<FileDoneOutlined style={{ color: 'var(--xiehe-green)' }} />}
              valueStyle={{ color: 'var(--xiehe-green)', fontSize: '24px', fontWeight: 600 }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card className="text-center" style={{ background: 'var(--primary-50)' }}>
            <Statistic
              title="进行中"
              value={applyData.applying + applyData.reviewing + applyData.scheduled}
              prefix={<ClockCircleOutlined style={{ color: 'var(--xiehe-green)' }} />}
              valueStyle={{ color: 'var(--xiehe-green)', fontSize: '24px', fontWeight: 600 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 快捷入口 */}
      <Card title="快捷服务" className="mb-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center cursor-pointer" onClick={() => navigate('/patient/apply')}>
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-1" style={{ background: 'var(--xiehe-green-bg)' }}>
              <FileTextOutlined style={{ fontSize: '24px', color: 'var(--xiehe-green)' }} />
            </div>
            <div className="text-xs" style={{ color: 'var(--text-primary)' }}>申请会诊</div>
          </div>
          <div className="text-center cursor-pointer" onClick={() => navigate('/patient/progress')}>
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-1" style={{ background: 'var(--primary-50)' }}>
              <CalendarOutlined style={{ fontSize: '24px', color: 'var(--xiehe-green)' }} />
            </div>
            <div className="text-xs" style={{ color: 'var(--text-primary)' }}>进度查询</div>
          </div>
          <div className="text-center cursor-pointer" onClick={() => navigate('/patient/report')}>
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-1" style={{ background: 'var(--primary-50)' }}>
              <FileProtectOutlined style={{ fontSize: '24px', color: 'var(--xiehe-green)' }} />
            </div>
            <div className="text-xs" style={{ color: 'var(--text-primary)' }}>报告查看</div>
          </div>
          <div className="text-center cursor-pointer" onClick={() => navigate('/patient/followup')}>
            <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-1" style={{ background: 'var(--primary-50)' }}>
              <PhoneOutlined style={{ fontSize: '24px', color: 'var(--xiehe-green)' }} />
            </div>
            <div className="text-xs" style={{ color: 'var(--text-primary)' }}>随访管理</div>
          </div>
        </div>
      </Card>

      {/* 最近申请 */}
      <Card 
        title="最近申请" 
        className="mb-4"
        extra={
          <Button type="link" onClick={() => navigate('/patient/progress')}>
            查看全部 <RightOutlined />
          </Button>
        }
      >
        <List
          dataSource={recentApplications.slice(0, 3)}
          renderItem={(item) => (
            <List.Item className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/patient/progress/${item.id}`)}>
              <List.Item.Meta
                avatar={
                  <Avatar icon={<MedicineBoxOutlined />} style={{ backgroundColor: 'var(--xiehe-green)' }} />
                }
                title={
                  <div className="flex justify-between items-center">
                    <span>{item.department} - {item.disease}</span>
                    {getStatusBadge(item.status)}
                  </div>
                }
                description={
                  <div className="text-xs text-gray-500 mt-1">
                    <div>{item.hospital}</div>
                    <div>{item.experts}位专家 | {item.date}</div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* 日程提醒 */}
      <Card title="日程提醒" className="mb-4">
        <Timeline
          items={upcomingEvents.map(event => ({
            color: event.type === 'consultation' ? 'green' : 'blue',
            children: (
              <div>
                <div className="font-medium">{event.title}</div>
                <div className="text-xs text-gray-500 mt-1">
                  <div>时间：{event.time}</div>
                  <div>地点：{event.location}</div>
                  <div>科室：{event.department}</div>
                </div>
              </div>
            )
          }))}
        />
      </Card>

      {/* 消息通知 */}
      <Card 
        title="消息通知" 
        className="mb-4"
        extra={
          <Button type="link" onClick={() => navigate('/patient/message')}>
            查看全部 <RightOutlined />
          </Button>
        }
      >
        <List
          dataSource={messages.filter(m => !m.read).slice(0, 3)}
          renderItem={(item) => (
            <List.Item className="cursor-pointer hover:bg-gray-50">
              <List.Item.Meta
                avatar={<Badge dot><Avatar icon={<BellOutlined />} /></Badge>}
                title={
                  <div className="flex justify-between">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-xs text-gray-400">{item.time.split(' ')[0]}</span>
                  </div>
                }
                description={
                  <div className="text-xs text-gray-500 truncate">{item.content}</div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )

  const renderApplications = () => (
    <div className="space-y-4">
      <Card>
        <Row gutter={12}>
          <Col span={6}>
            <div className="text-center p-3" style={{ background: 'var(--xiehe-green-bg)', borderRadius: '8px' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--xiehe-green)' }}>{applyData.applying}</div>
              <div className="text-xs text-gray-500 mt-1">申请中</div>
            </div>
          </Col>
          <Col span={6}>
            <div className="text-center p-3" style={{ background: 'var(--primary-50)', borderRadius: '8px' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--xiehe-green)' }}>{applyData.reviewing}</div>
              <div className="text-xs text-gray-500 mt-1">审核中</div>
            </div>
          </Col>
          <Col span={6}>
            <div className="text-center p-3" style={{ background: 'var(--primary-50)', borderRadius: '8px' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--xiehe-green)' }}>{applyData.scheduled}</div>
              <div className="text-xs text-gray-500 mt-1">已安排</div>
            </div>
          </Col>
          <Col span={6}>
            <div className="text-center p-3" style={{ background: 'var(--primary-50)', borderRadius: '8px' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--xiehe-green)' }}>{applyData.completed}</div>
              <div className="text-xs text-gray-500 mt-1">已完成</div>
            </div>
          </Col>
        </Row>
      </Card>

      <Card>
        <List
          dataSource={recentApplications}
          renderItem={(item) => (
            <List.Item 
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/patient/progress/${item.id}`)}
            >
              <List.Item.Meta
                avatar={
                  <Avatar icon={<MedicineBoxOutlined />} style={{ backgroundColor: 'var(--xiehe-green)' }} />
                }
                title={
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.department} - {item.disease}</span>
                    {getStatusBadge(item.status)}
                  </div>
                }
                description={
                  <div className="text-xs text-gray-500 mt-2">
                    <div>{item.hospital}</div>
                    <div className="mt-1">
                      <Tag color="blue">{item.experts}位专家</Tag>
                      <Tag>{item.date}</Tag>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )

  const renderMessages = () => (
    <div className="space-y-4">
      <Card>
        <Tabs defaultActiveKey="all">
          <TabPane tab="全部消息" key="all" />
          <TabPane tab="未读" key="unread" />
          <TabPane tab="已读" key="read" />
        </Tabs>
      </Card>

      <List
        dataSource={messages}
        renderItem={(item) => (
          <Card className="mb-3 cursor-pointer hover:shadow-md">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge dot count={item.read ? 0 : 1} />
                  <span className="font-medium">{item.title}</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">{item.content}</div>
                <div className="text-xs text-gray-400">{item.time}</div>
              </div>
              <RightOutlined className="text-gray-400" />
            </div>
          </Card>
        )}
      />
    </div>
  )

  const renderProfile = () => (
    <div className="space-y-4">
      <Card className="text-white" styles={{ body: { padding: '20px' } }} style={{ background: 'linear-gradient(to right, var(--xiehe-green), var(--xiehe-green-light))' }}>
        <div className="flex items-center gap-4">
          <Avatar size={64} icon={<UserOutlined />} className="bg-white" style={{ color: 'var(--xiehe-green)' }} />
          <div>
            <div className="text-xl font-bold">{patientUser?.name || patientInfo.name}</div>
            <div className="text-white/80 mt-1">
              {patientInfo.gender} | {patientInfo.age}岁
            </div>
          </div>
        </div>
      </Card>

      <Card title="个人信息">
        <List
          dataSource={[
            { label: '姓名', value: patientInfo.name },
            { label: '性别', value: patientInfo.gender },
            { label: '年龄', value: patientInfo.age },
            { label: '身份证号', value: patientInfo.idCard },
            { label: '联系电话', value: patientInfo.phone },
            { label: '就诊卡号', value: patientInfo.medicalCard },
            { label: '联系地址', value: patientInfo.address }
          ]}
          renderItem={(item) => (
            <List.Item>
              <div className="w-24 text-gray-500">{item.label}</div>
              <div className="flex-1">{item.value}</div>
            </List.Item>
          )}
        />
      </Card>

      <Card>
        <div className="space-y-3">
          <Button block icon={<FileProtectOutlined />} size="large">
            健康档案
          </Button>
          <Button block icon={<ClockCircleOutlined />} size="large">
            就诊记录
          </Button>
          <Button block icon={<CheckCircleOutlined />} size="large">
            处方记录
          </Button>
          <Button block icon={<FileTextOutlined />} size="large">
            检查报告
          </Button>
        </div>
      </Card>

      <Card>
        <div className="space-y-3">
          <Button block icon={<BellOutlined />} size="large" onClick={() => navigate('/patient/message')}>
            消息设置
          </Button>
          <Button block icon={<UserOutlined />} size="large">
            账户安全
          </Button>
          <Button 
            block 
            danger 
            size="large"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            退出登录
          </Button>
        </div>
      </Card>
    </div>
  )

  return (
    <PatientGuard>
    <div className="min-h-screen" style={{ background: 'var(--bg-default)' }}>
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="h-12 flex items-center justify-center" style={{ background: 'var(--xiehe-green)' }}>
          <span className="text-white font-bold text-lg">MDT 患者端</span>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-4 pb-24">
        {activeTab === 'home' && renderHome()}
        {activeTab === 'applications' && renderApplications()}
        {activeTab === 'messages' && renderMessages()}
        {activeTab === 'profile' && renderProfile()}
      </div>

      {/* 底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t" style={{ borderColor: 'var(--border-light)' }}>
        <div className="flex justify-around items-center py-2 safe-area-bottom">
          <div 
            className="text-center cursor-pointer" 
            onClick={() => setActiveTab('home')}
          >
            <HomeOutlined className={`text-xl ${activeTab === 'home' ? 'text-green-700' : 'text-gray-400'}`} />
            <div className={`text-xs mt-1 ${activeTab === 'home' ? 'text-green-700' : 'text-gray-400'}`}>首页</div>
          </div>
          <div 
            className="text-center cursor-pointer" 
            onClick={() => setActiveTab('applications')}
          >
            <ScheduleOutlined className={`text-xl ${activeTab === 'applications' ? 'text-green-700' : 'text-gray-400'}`} />
            <div className={`text-xs mt-1 ${activeTab === 'applications' ? 'text-green-700' : 'text-gray-400'}`}>申请</div>
          </div>
          <div 
            className="text-center cursor-pointer" 
            onClick={() => setActiveTab('messages')}
          >
            <BellOutlined className={`text-xl ${activeTab === 'messages' ? 'text-green-700' : 'text-gray-400'}`} />
            <div className={`text-xs mt-1 ${activeTab === 'messages' ? 'text-green-700' : 'text-gray-400'}`}>消息</div>
          </div>
          <div 
            className="text-center cursor-pointer" 
            onClick={() => setActiveTab('profile')}
          >
            <UserOutlined className={`text-xl ${activeTab === 'profile' ? 'text-green-700' : 'text-gray-400'}`} />
            <div className={`text-xs mt-1 ${activeTab === 'profile' ? 'text-green-700' : 'text-gray-400'}`}>我的</div>
          </div>
        </div>
      </div>
    </div>
    </PatientGuard>
  )
}

export default PatientHome
