import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, message, Tabs } from 'antd'
import { 
  UserOutlined, 
  LockOutlined, 
  PhoneOutlined, 
  SafetyOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons'

interface PatientLoginForm {
  phone: string
  password: string
  verifyCode?: string
}

export default function PatientLogin() {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('phone')
  const [form] = Form.useForm()
  const navigate = useNavigate()

  const handleSubmit = async (values: PatientLoginForm) => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    
    // 模拟登录成功
    localStorage.setItem('patientUser', JSON.stringify({
      id: 'P001',
      name: '张建国',
      phone: values.phone,
      role: 'patient'
    }))
    
    message.success('登录成功')
    setLoading(false)
    navigate('/patient/home')
  }

  const handleSendCode = () => {
    message.success('验证码已发送：123456')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ 
      background: 'linear-gradient(135deg, #045126 0%, #0d7a3d 100%)'
    }}>
      <Card 
        className="w-full max-w-md shadow-2xl"
        style={{ 
          borderRadius: '16px',
          border: 'none'
        }}
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-14 h-14">
              <circle cx="50" cy="50" r="45" fill="white" stroke="#045126" strokeWidth="2"/>
              <text x="50" y="45" textAnchor="middle" fill="#045126" fontSize="14" fontWeight="bold">PUMC</text>
              <text x="50" y="62" textAnchor="middle" fill="#045126" fontSize="10">1917</text>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#045126' }}>患者端</h1>
          <p className="text-gray-500 text-sm">MDT 多学科会诊系统</p>
        </div>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: 'phone',
              label: '手机号登录',
              children: (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  size="large"
                >
                  <Form.Item
                    name="phone"
                    rules={[
                      { required: true, message: '请输入手机号' },
                      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined className="text-gray-400" />}
                      placeholder="请输入手机号"
                      size="large"
                      maxLength={11}
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: '请输入密码' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="请输入密码"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item>
                    <div className="flex justify-between items-center mb-4">
                      <a className="text-sm" style={{ color: '#045126' }}>忘记密码？</a>
                    </div>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      size="large"
                      style={{ 
                        background: '#045126',
                        borderColor: '#045126'
                      }}
                    >
                      登录
                    </Button>
                  </Form.Item>

                  <div className="text-center text-sm text-gray-500">
                    还没有账号？<a style={{ color: '#045126' }}>立即注册</a>
                  </div>
                </Form>
              )
            },
            {
              key: 'code',
              label: '验证码登录',
              children: (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  size="large"
                >
                  <Form.Item
                    name="phone"
                    rules={[
                      { required: true, message: '请输入手机号' },
                      { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined className="text-gray-400" />}
                      placeholder="请输入手机号"
                      size="large"
                      maxLength={11}
                    />
                  </Form.Item>

                  <Form.Item
                    name="verifyCode"
                    rules={[{ required: true, message: '请输入验证码' }]}
                  >
                    <div className="flex gap-2">
                      <Input
                        prefix={<SafetyOutlined className="text-gray-400" />}
                        placeholder="请输入验证码"
                        size="large"
                        maxLength={6}
                      />
                      <Button 
                        onClick={handleSendCode}
                        style={{ minWidth: '100px' }}
                      >
                        获取验证码
                      </Button>
                    </div>
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      block
                      size="large"
                      style={{ 
                        background: '#045126',
                        borderColor: '#045126'
                      }}
                    >
                      登录
                    </Button>
                  </Form.Item>

                  <div className="text-center text-sm text-gray-500">
                    未注册手机号验证后将自动创建账号
                  </div>
                </Form>
              )
            }
          ]}
        />

        {/* 底部说明 */}
        <div className="mt-6 text-center text-xs text-gray-400">
          <div className="flex items-center justify-center gap-4 mb-2">
            <a className="hover:underline" style={{ color: '#045126' }}>使用帮助</a>
            <span>|</span>
            <a className="hover:underline" style={{ color: '#045126' }}>隐私政策</a>
            <span>|</span>
            <a className="hover:underline" style={{ color: '#045126' }}>联系客服</a>
          </div>
          <p>© 2024 北京协和医院 MDT 会诊系统</p>
        </div>

        {/* 返回 PC 端 */}
        <div className="mt-4 text-center">
          <Button 
            type="link" 
            size="small"
            style={{ color: '#045126' }}
            onClick={() => navigate('/login')}
          >
            ← 返回医生端登录
          </Button>
        </div>
      </Card>
    </div>
  )
}
