import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Checkbox, message, Select, Divider, Card } from 'antd'
import { 
  UserOutlined, 
  LockOutlined, 
  SafetyOutlined, 
  QqOutlined, 
  WechatOutlined
} from '@ant-design/icons'
import { useAppStore, Role } from '../../stores/appStore'

interface LoginForm {
  username: string
  password: string
  role: Role
}

const roleOptions: { value: Role; label: string }[] = [
  { value: '申请医生', label: '申请医生' },
  { value: '主任医生', label: '主任医生' },
  { value: 'MDT 秘书', label: 'MDT 秘书' },
  { value: '会诊专家', label: '会诊专家' },
  { value: '质控员', label: '质控员' },
  { value: '系统管理员', label: '系统管理员' },
  { value: '超级管理员', label: '超级管理员' },
]

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { setUser, setRole } = useAppStore()

  const handleSubmit = async (values: LoginForm) => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setUser({
      id: '1',
      name: values.username || '张明华',
      role: values.role,
      department: '肿瘤科',
    })
    setRole(values.role)
    message.success('登录成功')
    setLoading(false)
    navigate('/dashboard')
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden" style={{ 
      background: 'linear-gradient(135deg, #045126 0%, #0d7a3d 50%, #0a6b35 100%)'
    }}>
      {/* 背景装饰 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
        
        {/* 网格背景 */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* 内容区 */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-8 overflow-auto">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          
          {/* 左侧品牌信息 */}
          <div className="text-white hidden lg:block text-center lg:text-left">
            {/* Logo - 使用 SVG 绘制 */}
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto lg:mx-0 mb-4 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-20 h-20">
                  <circle cx="50" cy="50" r="45" fill="white" stroke="#045126" strokeWidth="2"/>
                  <text x="50" y="45" textAnchor="middle" fill="#045126" fontSize="14" fontWeight="bold">PUMC</text>
                  <text x="50" y="62" textAnchor="middle" fill="#045126" fontSize="10">1917</text>
                </svg>
              </div>
            </div>
            
            {/* 校名 */}
            <h1 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight">
              中国医学科学院<br/>
              北京协和医学院
            </h1>
            
            {/* 系统名称 */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-1 opacity-90">MDT 多学科会诊系统</h2>
              <p className="text-base opacity-70">Multi-Disciplinary Team Consultation System</p>
            </div>

            {/* 分隔线 */}
            <div className="w-16 h-0.5 bg-white/30 mb-6 mx-auto lg:mx-0"></div>

            {/* 特性数据 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-3xl font-bold mb-1">500+</div>
                <div className="text-sm opacity-70">专家团队</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">10000+</div>
                <div className="text-sm opacity-70">会诊案例</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">98%</div>
                <div className="text-sm opacity-70">满意度</div>
              </div>
            </div>
          </div>

          {/* 右侧登录卡片 */}
          <div className="flex justify-center lg:justify-end">
            <Card 
              className="w-full max-w-sm shadow-xl"
              style={{ 
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                padding: '32px'
              }}
            >
              {/* Logo 移动端显示 */}
              <div className="lg:hidden text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-3 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-12 h-12">
                    <circle cx="50" cy="50" r="45" fill="white" stroke="#045126" strokeWidth="2"/>
                    <text x="50" y="45" textAnchor="middle" fill="#045126" fontSize="14" fontWeight="bold">PUMC</text>
                    <text x="50" y="62" textAnchor="middle" fill="#045126" fontSize="10">1917</text>
                  </svg>
                </div>
                <h1 className="text-xl font-bold mb-1" style={{ color: '#045126' }}>中国医学科学院</h1>
                <h1 className="text-xl font-bold mb-4" style={{ color: '#045126' }}>北京协和医学院</h1>
              </div>

              {/* 标题 */}
              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-2xl font-bold mb-1" style={{ color: '#045126' }}>欢迎登录</h2>
                <p className="text-sm text-gray-500">MDT 多学科会诊系统</p>
              </div>

              <Form
                form={form}
                layout="horizontal"
                onFinish={handleSubmit}
                initialValues={{ role: '申请医生' }}
                size="large"
              >
                <Form.Item name="role" label={<span className="font-medium text-gray-700 text-sm whitespace-nowrap">选择角色</span>} className="mb-3">
                  <Select 
                    options={roleOptions} 
                    size="large"
                    className="rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  name="username"
                  label={<span className="font-medium text-gray-700 text-sm whitespace-nowrap">用户名</span>}
                  rules={[{ required: true, message: '请输入用户名' }]}
                  className="mb-3"
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="请输入用户名/手机号"
                    size="large"
                    className="rounded-lg"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span className="font-medium text-gray-700 text-sm whitespace-nowrap">密码</span>}
                  rules={[{ required: true, message: '请输入密码' }]}
                  className="mb-3"
                >
                  <Input.Password
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="请输入密码"
                    size="large"
                    className="rounded-lg"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>

                <Form.Item className="mb-4">
                  <div className="flex justify-between items-center">
                    <Checkbox className="text-sm">记住密码</Checkbox>
                    <a 
                      className="hover:underline text-sm"
                      style={{ color: '#045126' }}
                    >
                      忘记密码？
                    </a>
                  </div>
                </Form.Item>

                <Form.Item className="mb-4">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    size="large"
                    className="rounded-lg font-semibold"
                    style={{ 
                      background: '#045126',
                      borderColor: '#045126',
                      color: '#ffffff',
                      height: '44px',
                      borderRadius: '8px'
                    }}
                  >
                    立即登录
                  </Button>
                </Form.Item>

                <Divider className="!text-gray-400 !my-4 text-sm">其他登录方式</Divider>
                
                <div className="flex justify-center gap-4 mb-4">
                  <QqOutlined className="text-2xl text-gray-400 cursor-pointer hover:text-[#045126] transition-colors" />
                  <WechatOutlined className="text-2xl text-gray-400 cursor-pointer hover:text-[#045126] transition-colors" />
                  <SafetyOutlined className="text-2xl text-gray-400 cursor-pointer hover:text-[#045126] transition-colors" />
                </div>

                <div className="text-center">
                  <Button 
                    type="link" 
                    className="font-medium text-sm"
                    style={{ color: '#045126' }}
                    onClick={() => navigate('/patient/home')}
                  >
                    患者端入口 →
                  </Button>
                </div>
              </Form>

              {/* 底部说明 */}
              <div className="mt-4 text-center text-xs text-gray-400">
                <p className="mb-2">演示账号：选择不同角色可体验不同权限的菜单</p>
                <div className="flex items-center justify-center gap-3">
                  <a className="hover:underline" style={{ color: '#045126' }}>使用帮助</a>
                  <span>|</span>
                  <a className="hover:underline" style={{ color: '#045126' }}>技术支持</a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
