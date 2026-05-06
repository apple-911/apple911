import { useState } from 'react'
import { Card, Tabs, Tag, Timeline, Button, List, Avatar, Badge } from 'antd'
import { LeftOutlined, MedicineBoxOutlined, ClockCircleOutlined, CheckCircleOutlined, FileTextOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { TabPane } = Tabs

const applications = [
  {
    id: 1,
    department: '肿瘤科',
    disease: '肺癌',
    hospital: '北京协和医院',
    applyDate: '2024-01-05',
    status: 'scheduled',
    consultationDate: '2024-01-15 14:30',
    location: '北京协和医院 3 楼 MDT 会诊室',
    experts: 5,
    progress: [
      { date: '2024-01-05 10:30', status: '申请提交', desc: '您已提交会诊申请' },
      { date: '2024-01-06 15:20', status: '审核通过', desc: 'MDT 秘书已审核通过' },
      { date: '2024-01-08 09:00', status: '已排期', desc: '会诊时间已安排' }
    ]
  },
  {
    id: 2,
    department: '心内科',
    disease: '冠心病',
    hospital: '北京协和医院',
    applyDate: '2024-01-02',
    status: 'completed',
    consultationDate: '2024-01-10 10:00',
    location: '北京协和医院 2 楼 MDT 会诊室',
    experts: 4,
    reportAvailable: true,
    progress: [
      { date: '2024-01-02 09:00', status: '申请提交', desc: '您已提交会诊申请' },
      { date: '2024-01-03 14:00', status: '审核通过', desc: 'MDT 秘书已审核通过' },
      { date: '2024-01-05 16:00', status: '已排期', desc: '会诊时间已安排' },
      { date: '2024-01-10 10:00', status: '会诊完成', desc: '会诊已结束' },
      { date: '2024-01-11 15:00', status: '报告完成', desc: '会诊报告已生成' }
    ]
  }
]

const statusConfig: any = {
  applying: { color: 'blue', text: '申请中', icon: ClockCircleOutlined },
  reviewing: { color: 'orange', text: '审核中', icon: ClockCircleOutlined },
  scheduled: { color: 'green', text: '已安排', icon: CheckCircleOutlined },
  completed: { color: '', text: '已完成', icon: CheckCircleOutlined }
}

const PatientProgress = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('progress')

  const renderProgress = (app: any) => (
    <div className="space-y-4">
      {/* 基本信息 */}
      <Card>
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-lg font-bold">{app.department} - {app.disease}</div>
              <div className="text-sm text-gray-500 mt-1">{app.hospital}</div>
            </div>
            <Tag color={statusConfig[app.status].color}>
              {statusConfig[app.status].text}
            </Tag>
          </div>
          <div className="text-sm text-gray-600">
            <div>申请日期：{app.applyDate}</div>
            {app.consultationDate && <div>会诊时间：{app.consultationDate}</div>}
            {app.location && <div>会诊地点：{app.location}</div>}
            <div>专家人数：{app.experts}人</div>
          </div>
        </div>
      </Card>

      {/* 进度追踪 */}
      <Card title="进度追踪">
        <Timeline
          items={app.progress.map((item: any, index: number) => ({
            color: index === app.progress.length - 1 ? 'green' : 'gray',
            dot: index === app.progress.length - 1 ? <CheckCircleOutlined className="text-lg" /> : undefined,
            children: (
              <div>
                <div className="font-medium">{item.status}</div>
                <div className="text-sm text-gray-500">{item.desc}</div>
                <div className="text-xs text-gray-400 mt-1">{item.date}</div>
              </div>
            )
          }))}
        />
      </Card>

      {/* 会诊专家 */}
      <Card title="会诊专家">
        <List
          dataSource={[
            { name: '李志强', title: '主任医师', department: '肿瘤科' },
            { name: '王建华', title: '主任医师', department: '胸外科' },
            { name: '张明华', title: '副主任医师', department: '放疗科' }
          ]}
          renderItem={(expert) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar style={{ backgroundColor: 'var(--xiehe-green)' }}>{expert.name[0]}</Avatar>}
                title={expert.name}
                description={`${expert.title} | ${expert.department}`}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* 操作按钮 */}
      {app.status === 'scheduled' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4" style={{ borderColor: 'var(--border-light)' }}>
          <Button block type="primary" size="large">
            查看会诊须知
          </Button>
        </div>
      )}

      {app.status === 'completed' && app.reportAvailable && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4" style={{ borderColor: 'var(--border-light)' }}>
          <Button 
            block 
            type="primary" 
            size="large"
            icon={<FileTextOutlined />}
            onClick={() => navigate(`/patient/report/${app.id}`)}
          >
            查看会诊报告
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-default)' }}>
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="h-12 flex items-center px-4">
          <Button type="text" icon={<LeftOutlined />} onClick={() => navigate('/patient/home')}>
            返回
          </Button>
          <span className="flex-1 text-center font-bold">申请进度</span>
          <div className="w-16" />
        </div>
      </div>

      {/* 状态筛选 */}
      <div className="p-4 bg-white">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            { key: 'progress', label: '全部' },
            { key: 'ongoing', label: '进行中' },
            { key: 'completed', label: '已完成' }
          ]}
        />
      </div>

      {/* 申请列表 */}
      <div className="p-4 pb-24 space-y-4">
        {applications.map(app => (
          <Card 
            key={app.id} 
            className="cursor-pointer hover:shadow-md"
            onClick={() => navigate(`/patient/progress/${app.id}`)}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar icon={<MedicineBoxOutlined />} style={{ backgroundColor: 'var(--xiehe-green)' }} />
                  <div>
                    <div className="font-medium">{app.department} - {app.disease}</div>
                    <div className="text-xs text-gray-500">{app.hospital}</div>
                  </div>
                </div>
                <Tag color={statusConfig[app.status].color}>
                  {statusConfig[app.status].text}
                </Tag>
              </div>
              <div className="text-sm text-gray-600">
                <div>申请日期：{app.applyDate}</div>
                {app.consultationDate && <div>会诊时间：{app.consultationDate}</div>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default PatientProgress
