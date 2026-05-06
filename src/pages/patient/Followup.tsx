import { useState } from 'react'
import { Card, Button, List, Calendar, Badge, Modal, Form, Input, Rate } from 'antd'
import { LeftOutlined, PlusOutlined, PhoneOutlined, VideoCameraOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

const followupPlans = [
  {
    id: 1,
    title: '术后首次复查',
    date: '2024-01-20',
    type: '门诊',
    department: '肿瘤科',
    doctor: '李志强',
    status: 'pending',
    items: ['血常规', '肝功能', '胸部 CT']
  },
  {
    id: 2,
    title: '化疗后随访',
    date: '2024-02-15',
    type: '电话',
    department: '肿瘤科',
    doctor: '张明华',
    status: 'scheduled',
    items: ['症状评估', '不良反应记录']
  }
]

const followupRecords = [
  {
    id: 1,
    date: '2023-12-15',
    title: '术后复查',
    result: '恢复良好',
    doctor: '李志强'
  },
  {
    id: 2,
    date: '2023-11-10',
    title: '电话随访',
    result: '无明显不适',
    doctor: '张明华'
  }
]

const PatientFollowup = () => {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()

  const handleSubmitFollowup = () => {
    form.validateFields().then(() => {
      // 提交随访记录
      setVisible(false)
    })
  }

  const startVideoFollowup = () => {
    // 开始视频随访
    navigate('/m/room/1')
  }

  const startPhoneFollowup = () => {
    // 开始电话随访
    window.location.href = 'tel:400-123-4567'
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-default)' }}>
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="h-12 flex items-center px-4">
          <Button type="text" icon={<LeftOutlined />} onClick={() => navigate('/patient/home')}>
            返回
          </Button>
          <span className="flex-1 text-center font-bold">随访管理</span>
          <div className="w-16" />
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-4 space-y-4 pb-24">
        {/* 待随访提醒 */}
        <Card 
          title="待随访"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setVisible(true)}>
              填写随访
            </Button>
          }
        >
          <List
            dataSource={followupPlans.filter(p => p.status === 'pending')}
            renderItem={(plan) => (
              <List.Item
                actions={[
                  <Button type="link" icon={<PhoneOutlined />} onClick={startPhoneFollowup}>电话随访</Button>,
                  <Button type="link" icon={<VideoCameraOutlined />} onClick={startVideoFollowup}>视频随访</Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <div className="flex justify-between items-center">
                      <span>{plan.title}</span>
                      <Badge status="processing" text="待随访" />
                    </div>
                  }
                  description={
                    <div className="text-sm">
                      <div>日期：{plan.date}</div>
                      <div>类型：{plan.type} | 医生：{plan.doctor}</div>
                      <div>检查项目：{plan.items.join('、')}</div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        {/* 随访计划 */}
        <Card title="随访计划">
          <List
            dataSource={followupPlans.filter(p => p.status === 'scheduled')}
            renderItem={(plan) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <div className="flex justify-between items-center">
                      <span>{plan.title}</span>
                      <Badge color="blue" text="已安排" />
                    </div>
                  }
                  description={
                    <div className="text-sm">
                      <div>日期：{plan.date}</div>
                      <div>类型：{plan.type} | 科室：{plan.department}</div>
                      <div>医生：{plan.doctor}</div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        {/* 随访日历 */}
        <Card title="随访日历">
          <Calendar
            fullscreen={false}
            dateCellRender={(date) => {
              const plan = followupPlans.find(p => p.date === date.format('YYYY-MM-DD'))
              if (plan) {
                return (
                  <div className="text-xs">
                    <Badge color="green" text={plan.title} />
                  </div>
                )
              }
              return null
            }}
          />
        </Card>

        {/* 随访记录 */}
        <Card title="随访记录">
          <List
            dataSource={followupRecords}
            renderItem={(record) => (
              <List.Item>
                <List.Item.Meta
                  title={record.title}
                  description={
                    <div className="text-sm">
                      <div>日期：{record.date}</div>
                      <div>医生：{record.doctor}</div>
                      <div>结果：{record.result}</div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        {/* 满意度评价 */}
        <Card title="满意度评价" className="bg-green-50">
          <div className="text-center py-4">
            <div className="text-sm text-gray-600 mb-3">您对本次 MDT 会诊服务满意吗？</div>
            <Rate className="text-lg" style={{ color: 'var(--xiehe-green)' }} defaultValue={5} />
            <div className="mt-4">
              <Button type="primary" size="small">提交评价</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* 填写随访 Modal */}
      <Modal
        title="填写随访记录"
        open={visible}
        onOk={handleSubmitFollowup}
        onCancel={() => setVisible(false)}
        okText="提交"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            label="当前症状" 
            name="symptoms"
            rules={[{ required: true, message: '请输入当前症状' }]}
          >
            <Input.TextArea rows={3} placeholder="请描述当前症状" />
          </Form.Item>
          <Form.Item 
            label="用药情况" 
            name="medication"
          >
            <Input.TextArea rows={2} placeholder="目前使用的药物" />
          </Form.Item>
          <Form.Item 
            label="不良反应" 
            name="sideEffects"
          >
            <Input.TextArea rows={2} placeholder="是否有不良反应" />
          </Form.Item>
          <Form.Item 
            label="其他说明" 
            name="remarks"
          >
            <Input.TextArea rows={2} placeholder="其他需要说明的情况" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PatientFollowup
