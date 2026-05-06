import { useState } from 'react'
import { Card, Form, Input, Button, Select, DatePicker, Upload, message, Steps, Radio } from 'antd'
import { UploadOutlined, LeftOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { TextArea } = Input
const { Option } = Select

const PatientApply = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)

  const handleSubmit = async () => {
    try {
      await form.validateFields()
      message.success('申请提交成功！请等待审核')
      navigate('/patient/progress')
    } catch (error) {
      message.error('请填写完整信息')
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-default)' }}>
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 bg-white border-b" style={{ borderColor: 'var(--border-light)' }}>
        <div className="h-12 flex items-center px-4">
          <Button type="text" icon={<LeftOutlined />} onClick={() => navigate('/patient/home')}>
            返回
          </Button>
          <span className="flex-1 text-center font-bold">申请 MDT 会诊</span>
          <div className="w-16" />
        </div>
      </div>

      {/* 步骤条 */}
      <div className="p-4 bg-white">
        <Steps
          current={currentStep}
          items={[
            { title: '基本信息' },
            { title: '病情资料' },
            { title: '确认提交' }
          ]}
          size="small"
        />
      </div>

      {/* 内容区域 */}
      <div className="p-4">
        <Form form={form} layout="vertical" className="space-y-4">
          {currentStep === 0 && (
            <>
              <Card title="患者信息">
                <Form.Item label="姓名" name="name" rules={[{ required: true, message: '请输入姓名' }]}>
                  <Input placeholder="请输入患者姓名" />
                </Form.Item>
                <Form.Item label="性别" name="gender" rules={[{ required: true, message: '请选择性别' }]}>
                  <Radio.Group>
                    <Radio value="male">男</Radio>
                    <Radio value="female">女</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item label="年龄" name="age" rules={[{ required: true, message: '请输入年龄' }]}>
                  <Input type="number" placeholder="请输入年龄" />
                </Form.Item>
                <Form.Item label="联系电话" name="phone" rules={[{ required: true, message: '请输入联系电话' }]}>
                  <Input placeholder="请输入联系电话" />
                </Form.Item>
                <Form.Item label="就诊卡号" name="medicalCard">
                  <Input placeholder="请输入就诊卡号（选填）" />
                </Form.Item>
              </Card>

              <Card title="申请信息">
                <Form.Item label="期望会诊医院" name="hospital" rules={[{ required: true, message: '请选择医院' }]}>
                  <Select placeholder="请选择医院">
                    <Option value="北京协和医院">北京协和医院</Option>
                    <Option value="北京医院">北京医院</Option>
                    <Option value="北京大学第一医院">北京大学第一医院</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="期望科室" name="department" rules={[{ required: true, message: '请选择科室' }]}>
                  <Select placeholder="请选择科室">
                    <Option value="肿瘤科">肿瘤科</Option>
                    <Option value="心内科">心内科</Option>
                    <Option value="神经外科">神经外科</Option>
                    <Option value="呼吸科">呼吸科</Option>
                  </Select>
                </Form.Item>
                <Form.Item label="会诊类型" name="type" rules={[{ required: true, message: '请选择会诊类型' }]}>
                  <Radio.Group>
                    <Radio value="normal">普通会诊（3 个工作日）</Radio>
                    <Radio value="urgent">急会诊（24 小时）</Radio>
                  </Radio.Group>
                </Form.Item>
              </Card>
            </>
          )}

          {currentStep === 1 && (
            <>
              <Card title="病情摘要">
                <Form.Item 
                  label="主诉" 
                  name="chiefComplaint" 
                  rules={[{ required: true, message: '请输入主诉' }]}
                >
                  <TextArea rows={3} placeholder="主要症状、持续时间等" />
                </Form.Item>
                <Form.Item 
                  label="现病史" 
                  name="presentIllness" 
                  rules={[{ required: true, message: '请输入现病史' }]}
                >
                  <TextArea rows={4} placeholder="详细病程发展、治疗经过等" />
                </Form.Item>
                <Form.Item label="既往史" name="pastHistory">
                  <TextArea rows={3} placeholder="过往病史、手术史、过敏史等" />
                </Form.Item>
                <Form.Item label="初步诊断" name="diagnosis" rules={[{ required: true, message: '请输入初步诊断' }]}>
                  <Input placeholder="医院初步诊断结果" />
                </Form.Item>
              </Card>

              <Card title="检查资料">
                <Form.Item label="上传检查报告">
                  <Upload multiple>
                    <Button icon={<UploadOutlined />}>点击上传</Button>
                  </Upload>
                </Form.Item>
                <Form.Item label="上传影像资料">
                  <Upload multiple>
                    <Button icon={<UploadOutlined />}>点击上传</Button>
                  </Upload>
                </Form.Item>
              </Card>
            </>
          )}

          {currentStep === 2 && (
            <Card title="确认信息">
              <div className="space-y-4">
                <div>
                  <div className="font-medium mb-2">患者信息</div>
                  <div className="text-sm text-gray-600">
                    <div>姓名：张三</div>
                    <div>性别：男</div>
                    <div>年龄：58 岁</div>
                    <div>电话：138****5678</div>
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-2">会诊信息</div>
                  <div className="text-sm text-gray-600">
                    <div>医院：北京协和医院</div>
                    <div>科室：肿瘤科</div>
                    <div>类型：普通会诊</div>
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-2">病情摘要</div>
                  <div className="text-sm text-gray-600">
                    <div>主诉：咳嗽、咳痰 2 个月</div>
                    <div>诊断：肺部占位</div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-3 rounded">
                  <div className="text-sm text-yellow-800">
                    <strong>提示：</strong> 提交后 MDT 秘书将在 1 个工作日内审核，审核通过后会安排会诊时间。
                  </div>
                </div>
              </div>
            </Card>
          )}
        </Form>
      </div>

      {/* 底部按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4" style={{ borderColor: 'var(--border-light)' }}>
        <div className="flex gap-3">
          {currentStep > 0 && (
            <Button 
              block 
              size="large"
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              上一步
            </Button>
          )}
          {currentStep < 2 ? (
            <Button 
              block 
              type="primary" 
              size="large"
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              下一步
            </Button>
          ) : (
            <Button 
              block 
              type="primary" 
              size="large"
              onClick={handleSubmit}
            >
              提交申请
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientApply
