import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Form, Input, Button, Space, Typography, Divider, Tag, Row, Col, message, Modal, Table, Descriptions, Tabs, Drawer, Spin, Alert, Progress, Popover, Checkbox, Select, Badge, List, Collapse, Statistic } from 'antd'
import { SaveOutlined, SendOutlined, CheckCircleOutlined, ArrowLeftOutlined, EyeOutlined, PrinterOutlined, FilePdfOutlined, RobotOutlined, ThunderboltOutlined, AudioOutlined, FileTextOutlined, WarningOutlined, CheckCircleFilled, ExclamationCircleOutlined, BulbOutlined } from '@ant-design/icons'
import { mockReports, mockConsultations, mockPatients } from '../../mocks/data'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select
const { Panel } = Collapse

// 录音信息类型
interface ConsultationRecording {
  id: string
  consultationId: string
  title: string
  url: string
  duration: number
  uploadTime: string
  status: 'uploading' | 'processing' | 'completed' | 'failed'
}

// 转写分段
interface TranscriptionSegment {
  id: string
  startTime: number
  endTime: number
  speaker: string
  text: string
  keywords?: string[]
}

// 报告验证结果类型
interface ValidationIssue {
  id: string
  type: 'error' | 'warning' | 'suggestion'
  field: string
  message: string
  detail: string
  suggestion?: string
}

interface ValidationResult {
  isValid: boolean
  score: number
  issues: ValidationIssue[]
  summary: {
    total: number
    errors: number
    warnings: number
    suggestions: number
  }
}

// 转写结果
interface ConsultationTranscription {
  id: string
  consultationId: string
  recordingUrl: string
  duration: number
  transcription: string
  segments: TranscriptionSegment[]
  speakers: { id: string; name?: string; role?: string; totalDuration: number }[]
  createdAt: string
}

interface ReportFormData {
  chiefComplaint: string
  historyOfPresentIllness: string
  pastHistory: string
  physicalExamination: string
  auxiliaryExamination: string
  consultationOpinion: string
  treatmentSuggestion: string
  followupPlan: string
}

export default function ReportEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [activeTab, setActiveTab] = useState('edit')
  const printRef = useRef<HTMLDivElement>(null)

  // AI 生成相关状态
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false)
  const [recordings, setRecordings] = useState<ConsultationRecording[]>([])
  const [selectedRecording, setSelectedRecording] = useState<ConsultationRecording | null>(null)
  const [transcription, setTranscription] = useState<ConsultationTranscription | null>(null)
  const [loadingTranscription, setLoadingTranscription] = useState(false)
  const [selectedSegments, setSelectedSegments] = useState<string[]>([])
  const [aiConfidence, setAiConfidence] = useState<number>(0)
  
  // 智能验证相关状态
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [showValidationPanel, setShowValidationPanel] = useState(false)

  const report = mockReports.find(r => r.id === id)
  const consultation = report ? mockConsultations.find(c => c.id === report.consultationId) : null
  const patient = consultation ? mockPatients.find(p => p.id === consultation.patientId) : null

  // 加载录音列表
  useEffect(() => {
    if (consultation?.id) {
      // 模拟加载录音
      setRecordings([
        {
          id: 'REC001',
          consultationId: consultation.id,
          title: 'MDT 会诊全程录音',
          url: 'https://example.com/recording.mp3',
          duration: 2850,
          uploadTime: '2024-03-19 10:00',
          status: 'completed'
        }
      ])
    }
  }, [consultation])

  const handleSave = async () => {
    setSaving(true)
    try {
      const values = form.getFieldsValue()
      // TODO: 调用 API 保存报告
      await new Promise(r => setTimeout(r, 800))
      message.success('报告已保存')
    } catch (error) {
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  // 智能验证报告
  const handleValidate = async () => {
    setValidating(true)
    try {
      const values = form.getFieldsValue()
      
      // 模拟 AI 验证过程
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 模拟验证结果
      const issues: ValidationIssue[] = []
      
      // 检查主诉
      if (!values.chiefComplaint || values.chiefComplaint.length < 10) {
        issues.push({
          id: '1',
          type: 'error',
          field: 'chiefComplaint',
          message: '主诉描述过于简短',
          detail: '主诉应包含主要症状、持续时间等关键信息',
          suggestion: '建议补充症状持续时间、诱因、加重缓解因素等'
        })
      }
      
      // 检查现病史
      if (!values.historyOfPresentIllness || values.historyOfPresentIllness.length < 50) {
        issues.push({
          id: '2',
          type: 'warning',
          field: 'historyOfPresentIllness',
          message: '现病史描述不够详细',
          detail: '现病史应详细描述疾病发生、发展过程及诊疗经过',
          suggestion: '建议补充发病过程、既往检查结果、治疗经过等'
        })
      }
      
      // 检查会诊意见
      if (!values.consultationOpinion) {
        issues.push({
          id: '3',
          type: 'error',
          field: 'consultationOpinion',
          message: '缺少会诊意见',
          detail: '会诊意见是报告的核心内容，必须填写',
          suggestion: '请填写明确的诊断意见和治疗建议'
        })
      } else {
        // 检查会诊意见的逻辑一致性
        if (values.consultationOpinion.includes('手术') && 
            !values.treatmentSuggestion?.includes('手术')) {
          issues.push({
            id: '4',
            type: 'warning',
            field: 'treatmentSuggestion',
            message: '治疗建议与会诊意见不一致',
            detail: '会诊意见提到手术，但治疗建议中未体现',
            suggestion: '建议在治疗建议中补充手术相关内容'
          })
        }
      }
      
      // 检查随访计划
      if (!values.followupPlan) {
        issues.push({
          id: '5',
          type: 'suggestion',
          field: 'followupPlan',
          message: '建议添加随访计划',
          detail: '完善的随访计划有助于患者管理和疗效评估',
          suggestion: '建议制定定期复查和随访安排'
        })
      }
      
      // 检查辅助检查
      if (!values.auxiliaryExamination) {
        issues.push({
          id: '6',
          type: 'warning',
          field: 'auxiliaryExamination',
          message: '缺少辅助检查结果',
          detail: '辅助检查结果是诊断的重要依据',
          suggestion: '建议补充相关检查结果'
        })
      }
      
      const result: ValidationResult = {
        isValid: issues.filter(i => i.type === 'error').length === 0,
        score: Math.max(0, 100 - issues.reduce((sum, i) => {
          return sum + (i.type === 'error' ? 20 : i.type === 'warning' ? 10 : 5)
        }, 0)),
        issues,
        summary: {
          total: issues.length,
          errors: issues.filter(i => i.type === 'error').length,
          warnings: issues.filter(i => i.type === 'warning').length,
          suggestions: issues.filter(i => i.type === 'suggestion').length
        }
      }
      
      setValidationResult(result)
      setShowValidationPanel(true)
      
      if (result.isValid) {
        message.success(`验证通过！报告质量评分：${result.score}分`)
      } else {
        message.warning(`发现 ${result.summary.errors} 个错误，请检查`)
      }
    } catch (error) {
      message.error('验证失败，请重试')
    } finally {
      setValidating(false)
    }
  }

  const handleSubmit = () => {
    const values = form.getFieldsValue()
    if (!values.consultationOpinion) {
      message.error('请填写会诊意见')
      return
    }
    
    Modal.confirm({
      title: '确认提交',
      content: '确定要提交报告进行审核吗？提交后将通知其他专家进行签名。',
      onOk: () => {
        message.success('报告已提交，等待专家签名')
        navigate('/report/list')
      }
    })
  }

  // AI 生成报告
  const handleAIGenerate = async () => {
    if (!consultation || !patient) {
      message.error('缺少会诊或患者信息')
      return
    }

    setAiGenerating(true)
    try {
      // 模拟 AI 生成报告
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const aiReport = {
        chiefComplaint: '咳嗽、咳痰伴痰中带血 3 个月',
        historyOfPresentIllness: '患者 3 个月前无明显诱因出现咳嗽、咳痰，痰中带血丝，伴右侧胸痛、气促。在外院行胸部 CT 示：右肺上叶占位，考虑肺癌可能性大。支气管镜检查：右肺上叶新生物，病理示：肺腺癌。',
        pastHistory: '吸烟史 20 年，20 支/天。否认高血压、糖尿病史。无手术外伤史。',
        physicalExamination: 'T 36.8℃, P 82 次/分，R 20 次/分，BP 128/82mmHg。神清，精神可。全身浅表淋巴结未触及肿大。气管居中，右肺呼吸音稍低，未闻及干湿啰音。心率 82 次/分，律齐，无杂音。',
        auxiliaryExamination: '胸部 CT：右肺上叶占位（约 4.5cm×3.8cm），伴右侧肺门及纵隔淋巴结肿大。头颅 MRI 未见明显转移灶。腹部 B 超：肝、胆、胰、脾、双肾未见明显异常。骨扫描：未见骨转移征象。',
        consultationOpinion: '1. 诊断：右肺上叶肺腺癌 cT2aN2M0，IIIA 期\n2. EGFR 基因突变检测：19 号外显子缺失突变阳性\n3. 建议行靶向治疗联合局部放疗',
        treatmentSuggestion: '1. 靶向治疗：奥希替尼 80mg qd 口服\n2. 局部放疗：建议行右肺病灶及纵隔淋巴结调强放疗\n3. 定期复查胸部 CT、肿瘤标志物\n4. 戒烟，加强营养支持',
        followupPlan: '1. 每 4 周复查血常规、肝肾功能\n2. 每 8 周复查胸部 CT 评估疗效\n3. 每 12 周复查头颅 MRI\n4. 监测靶向药物不良反应（皮疹、腹泻等）\n5. 定期随访，如有不适及时就诊',
        confidence: 0.92
      }
      
      // 填充表单
      form.setFieldsValue(aiReport)
      setAiConfidence(aiReport.confidence)
      
      message.success(`AI 报告生成成功！置信度：${(aiReport.confidence * 100).toFixed(1)}%`)
      setAiDrawerOpen(false)
    } catch (error) {
      message.error('AI 生成失败，请重试')
    } finally {
      setAiGenerating(false)
    }
  }

  // 加载转写
  const loadTranscription = async (recording: ConsultationRecording) => {
    setLoadingTranscription(true)
    try {
      // 模拟加载转写
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const trans: ConsultationTranscription = {
        id: 'T001',
        consultationId: consultation!.id,
        recordingUrl: recording.url,
        duration: recording.duration,
        transcription: '完整的会诊录音转写文本...',
        segments: [
          {
            id: 'S001',
            startTime: 0,
            endTime: 120,
            speaker: 'SPK001',
            text: '张明华：下面开始今天的 MDT 会诊。患者张伟，男性，58 岁，因"咳嗽、咳痰伴痰中带血 3 个月"入院...',
            keywords: ['咳嗽', '咳痰', '痰中带血']
          },
          {
            id: 'S002',
            startTime: 120,
            endTime: 300,
            speaker: 'SPK002',
            text: '李芳：我汇报一下病史。患者 3 个月前无明显诱因出现咳嗽、咳痰，痰中带血丝...',
            keywords: ['病史', '咳嗽', '血丝']
          },
          {
            id: 'S003',
            startTime: 300,
            endTime: 480,
            speaker: 'SPK003',
            text: '王建国：影像学检查显示右肺上叶占位，约 4.5cm×3.8cm，伴右侧肺门及纵隔淋巴结肿大...',
            keywords: ['影像学', '占位', '淋巴结肿大']
          }
        ],
        speakers: [
          { id: 'SPK001', name: '张明华', role: '会诊专家', totalDuration: 850 },
          { id: 'SPK002', name: '李芳', role: '申请医生', totalDuration: 620 },
          { id: 'SPK003', name: '王建国', role: '会诊专家', totalDuration: 730 }
        ],
        createdAt: '2024-03-19 10:00'
      }
      
      setTranscription(trans)
      setSelectedRecording(recording)
      message.success('转写加载成功')
    } catch (error) {
      message.error('加载转写失败')
    } finally {
      setLoadingTranscription(false)
    }
  }

  // 切换分段选择
  const toggleSegmentSelection = (segmentId: string) => {
    if (selectedSegments.includes(segmentId)) {
      setSelectedSegments(selectedSegments.filter(id => id !== segmentId))
    } else {
      setSelectedSegments([...selectedSegments, segmentId])
    }
  }

  // 插入选中片段到指定字段
  const insertSelectedSegments = (fieldName: keyof ReportFormData) => {
    if (!transcription || selectedSegments.length === 0) {
      message.warning('请先选择要插入的片段')
      return
    }

    const selectedText = transcription.segments
      .filter(seg => selectedSegments.includes(seg.id))
      .map(seg => seg.text)
      .join('\n')

    const currentValues = form.getFieldsValue()
    const currentValue = currentValues[fieldName] || ''
    
    form.setFieldsValue({
      [fieldName]: currentValue + (currentValue ? '\n' : '') + selectedText
    })

    message.success(`已插入 ${selectedSegments.length} 个片段`)
  }

  const handlePrint = () => {
    const printContent = printRef.current
    if (printContent) {
      const printWindow = window.open('', '_blank')
      printWindow?.document.write(`
        <html>
          <head>
            <title>MDT 会诊报告 - ${report?.patientName}</title>
            <style>
              body { font-family: 'SimSun', serif; padding: 40px; }
              h1 { text-align: center; font-size: 24px; margin-bottom: 10px; }
              .subtitle { text-align: center; color: #666; margin-bottom: 30px; }
              .section { margin: 20px 0; }
              .section-title { font-weight: bold; font-size: 16px; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 5px; }
              .content { line-height: 1.8; text-align: justify; }
              .signature { margin-top: 40px; text-align: right; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              td, th { border: 1px solid #000; padding: 8px; }
              @media print {
                body { padding: 20px; }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `)
      printWindow?.document.close()
      printWindow?.focus()
      setTimeout(() => {
        printWindow?.print()
        printWindow?.close()
      }, 250)
    }
  }

  const renderReportContent = () => {
    const values = form.getFieldsValue()
    return (
      <div ref={printRef} className="bg-white p-8">
        <div className="text-center mb-6">
          <Title level={3} className="!mb-2">MDT 多学科会诊报告</Title>
          <Text type="secondary">报告编号：{report?.id}</Text>
        </div>

        <Divider />

        <div className="section">
          <div className="section-title">患者基本信息</div>
          <Table
            size="small"
            pagination={false}
            columns={[
              { title: '姓名', dataIndex: 'name', width: '25%' },
              { title: '性别', dataIndex: 'gender', width: '25%' },
              { title: '年龄', dataIndex: 'age', width: '25%' },
              { title: '住院号', dataIndex: 'inpatientNo', width: '25%' },
            ]}
            dataSource={[{
              name: patient?.name,
              gender: patient?.gender,
              age: patient?.age,
              inpatientNo: patient?.inpatientNo,
            }]}
            showHeader={false}
            bordered
          />
          <div className="mt-2">
            <Text strong>科室：</Text>{patient?.department} | <Text strong>主治医生：</Text>{patient?.doctor}
          </div>
          <div>
            <Text strong>主要诊断：</Text><Tag color="red">{patient?.mainDiagnosis}</Tag>
          </div>
        </div>

        <Divider />

        <div className="section">
          <div className="section-title">会诊信息</div>
          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="会诊时间">{report?.consultationTime}</Descriptions.Item>
            <Descriptions.Item label="会诊类型">{consultation?.type}</Descriptions.Item>
            <Descriptions.Item label="会诊地点" span={2}>{consultation?.location}</Descriptions.Item>
            <Descriptions.Item label="负责专家" span={2}>{report?.responsibleExpert}</Descriptions.Item>
          </Descriptions>
        </div>

        <Divider />

        <div className="section">
          <div className="section-title">病情摘要</div>
          <div className="content">
            <div className="mb-3">
              <Text strong>主诉：</Text>
              <Paragraph>{values.chiefComplaint || '（待填写）'}</Paragraph>
            </div>
            <div className="mb-3">
              <Text strong>现病史：</Text>
              <Paragraph>{values.historyOfPresentIllness || '（待填写）'}</Paragraph>
            </div>
            <div className="mb-3">
              <Text strong>既往史：</Text>
              <Paragraph>{values.pastHistory || '（待填写）'}</Paragraph>
            </div>
            <div className="mb-3">
              <Text strong>体格检查：</Text>
              <Paragraph>{values.physicalExamination || '（待填写）'}</Paragraph>
            </div>
            <div className="mb-3">
              <Text strong>辅助检查：</Text>
              <Paragraph>{values.auxiliaryExamination || '（待填写）'}</Paragraph>
            </div>
          </div>
        </div>

        <Divider />

        <div className="section">
          <div className="section-title">会诊意见</div>
          <div className="content">
            <Paragraph className="bg-blue-50 p-3 border-l-4 border-blue-500">
              {values.consultationOpinion || '（待填写）'}
            </Paragraph>
          </div>
        </div>

        <Divider />

        <div className="section">
          <div className="section-title">诊疗建议</div>
          <div className="content">
            <Paragraph>{values.treatmentSuggestion || '（待填写）'}</Paragraph>
          </div>
        </div>

        <Divider />

        <div className="section">
          <div className="section-title">随访计划</div>
          <div className="content">
            <Paragraph>{values.followupPlan || '（待填写）'}</Paragraph>
          </div>
        </div>

        <Divider />

        <div className="section signature">
          <div className="mb-4">
            <Text strong>参与会诊专家：</Text>
            <Space wrap className="mt-2">
              {consultation?.experts?.map(e => (
                <Tag key={e.id} color="blue">{e.name} {e.title}</Tag>
              ))}
            </Space>
          </div>
          <div className="mt-6">
            <Text strong>报告生成日期：</Text>{new Date().toLocaleDateString('zh-CN')}
          </div>
        </div>
      </div>
    )
  }

  // 格式化时间（秒 -> mm:ss）
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
          <Title level={4} className="!mb-0">报告编辑</Title>
          <Tag color={report?.status === '草稿' ? 'default' : 'processing'}>{report?.status}</Tag>
        </Space>
        <Space>
          <Button 
            icon={<RobotOutlined />} 
            type="primary"
            ghost
            onClick={() => setAiDrawerOpen(true)}
          >
            AI 辅助生成
          </Button>
          <Button 
            icon={<CheckCircleOutlined />} 
            type="primary"
            ghost
            onClick={handleValidate}
            loading={validating}
          >
            智能验证
          </Button>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => setPreviewVisible(true)}
          >
            预览
          </Button>
          <Button 
            icon={<PrinterOutlined />} 
            onClick={handlePrint}
          >
            打印
          </Button>
          <Button icon={<SaveOutlined />} loading={saving} onClick={handleSave}>暂存草稿</Button>
          <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit}>提交审核</Button>
        </Space>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'edit',
            label: '编辑报告',
            children: (
              <Row gutter={16}>
                <Col span={16}>
                  <Card 
                    title="病情摘要" 
                    className="mb-4"
                    extra={
                      <Button 
                        type="link" 
                        icon={<RobotOutlined />}
                        onClick={() => {
                          setAiDrawerOpen(true)
                          message.info('请点击"AI 生成报告"按钮')
                        }}
                      >
                        AI 生成
                      </Button>
                    }
                  >
                    <Form form={form} layout="vertical">
                      <Form.Item 
                        label="主诉" 
                        name="chiefComplaint"
                        rules={[{ required: true, message: '请填写主诉' }]}
                      >
                        <TextArea 
                          rows={3} 
                          placeholder="请输入患者主要症状和体征，如：咳嗽、咳痰伴痰中带血 3 个月"
                        />
                      </Form.Item>
                      <Form.Item 
                        label="现病史" 
                        name="historyOfPresentIllness"
                        rules={[{ required: true, message: '请填写现病史' }]}
                      >
                        <TextArea 
                          rows={6} 
                          placeholder="请输入发病情况、发病时间、主要症状特点、病情发展演变、诊疗经过等"
                        />
                      </Form.Item>
                      <Form.Item 
                        label="既往史" 
                        name="pastHistory"
                      >
                        <TextArea 
                          rows={4} 
                          placeholder="请输入既往健康状况、疾病史、手术史、外伤史、输血史、过敏史等"
                        />
                      </Form.Item>
                      <Form.Item 
                        label="体格检查" 
                        name="physicalExamination"
                      >
                        <TextArea 
                          rows={4} 
                          placeholder="请输入体温、脉搏、呼吸、血压及专科查体情况"
                        />
                      </Form.Item>
                      <Form.Item 
                        label="辅助检查" 
                        name="auxiliaryExamination"
                      >
                        <TextArea 
                          rows={4} 
                          placeholder="请输入实验室检查、影像学检查、病理学检查等结果"
                        />
                      </Form.Item>
                    </Form>
                  </Card>

                  <Card 
                    title="会诊意见" 
                    className="mb-4"
                    extra={
                      <Button 
                        type="link" 
                        icon={<ThunderboltOutlined />}
                        onClick={() => {
                          setAiDrawerOpen(true)
                          message.info('AI 将根据会诊录音自动生成会诊意见')
                        }}
                      >
                        AI 总结
                      </Button>
                    }
                  >
                    <Form form={form} layout="vertical">
                      <Form.Item 
                        label="会诊意见" 
                        name="consultationOpinion"
                        rules={[{ required: true, message: '请填写会诊意见' }]}
                      >
                        <TextArea 
                          rows={6} 
                          placeholder="请输入综合会诊意见，包括诊断、分期、分级等"
                          style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}
                        />
                      </Form.Item>
                      <Form.Item 
                        label="诊疗建议" 
                        name="treatmentSuggestion"
                        rules={[{ required: true, message: '请填写诊疗建议' }]}
                      >
                        <TextArea 
                          rows={6} 
                          placeholder="请输入治疗方案建议，包括手术、化疗、放疗、靶向治疗、免疫治疗等"
                        />
                      </Form.Item>
                      <Form.Item 
                        label="随访计划" 
                        name="followupPlan"
                      >
                        <TextArea 
                          rows={4} 
                          placeholder="请输入随访时间、随访内容、复查项目等"
                        />
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>

                <Col span={8}>
                  <Card title="基本信息" className="mb-4">
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="患者">{patient?.name}</Descriptions.Item>
                      <Descriptions.Item label="住院号">{patient?.inpatientNo}</Descriptions.Item>
                      <Descriptions.Item label="科室">{patient?.department}</Descriptions.Item>
                      <Descriptions.Item label="诊断">
                        <Tag color="red">{patient?.mainDiagnosis}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="会诊时间">{report?.consultationTime}</Descriptions.Item>
                      <Descriptions.Item label="负责专家">{report?.responsibleExpert}</Descriptions.Item>
                    </Descriptions>
                  </Card>

                  <Card title="专家签名" className="mb-4">
                    <div className="space-y-3">
                      {consultation?.experts?.map((expert, index) => (
                        <div key={expert.id} className="p-3 border rounded hover:bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                              <Text strong>{expert.name}</Text>
                              <Tag color="blue">{expert.title}</Tag>
                            </div>
                            {index === 0 ? (
                              <Tag color="green" icon={<CheckCircleOutlined />}>已签名</Tag>
                            ) : (
                              <Tag>待签名</Tag>
                            )}
                          </div>
                          <Text type="secondary" className="text-xs">{expert.dept}</Text>
                          {index > 0 && (
                            <Button 
                              size="small" 
                              className="mt-2 w-full"
                              onClick={() => message.success(`${expert.name} 签名成功`)}
                            >
                              代签名
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Divider />
                    <Text type="secondary" className="text-xs">
                      说明：所有专家签名完成后，报告将自动归档
                    </Text>
                  </Card>

                  <Card title="操作提示">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <RobotOutlined className="text-blue-500 mt-0.5" />
                        <Text type="secondary">使用 AI 辅助生成，快速完成报告</Text>
                      </div>
                      <div className="flex items-start gap-2">
                        <AudioOutlined className="text-green-500 mt-0.5" />
                        <Text type="secondary">可播放会诊录音，查看转写内容</Text>
                      </div>
                      <div className="flex items-start gap-2">
                        <FileTextOutlined className="text-orange-500 mt-0.5" />
                        <Text type="secondary">填写完整的病情摘要和会诊意见</Text>
                      </div>
                      <div className="flex items-start gap-2">
                        <EyeOutlined className="text-purple-500 mt-0.5" />
                        <Text type="secondary">完成后可预览和打印报告</Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            ),
          },
          {
            key: 'preview',
            label: '报告预览',
            children: renderReportContent(),
          },
        ]}
      />

      {/* 预览弹窗 */}
      <Modal
        title="报告预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>关闭</Button>,
          <Button key="print" icon={<PrinterOutlined />} onClick={handlePrint}>打印</Button>,
          <Button key="export" icon={<FilePdfOutlined />} onClick={() => message.info('导出 PDF 功能开发中')}>
            导出 PDF
          </Button>,
        ]}
      >
        {renderReportContent()}
      </Modal>

      {/* AI 辅助生成抽屉 */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <RobotOutlined className="text-blue-500" />
            <span>AI 辅助报告生成</span>
          </div>
        }
        placement="right"
        width={600}
        open={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        footer={
          <Space>
            <Button onClick={() => setAiDrawerOpen(false)}>取消</Button>
            <Button 
              type="primary" 
              icon={<ThunderboltOutlined />}
              loading={aiGenerating}
              onClick={handleAIGenerate}
              disabled={!selectedRecording}
            >
              AI 生成报告
            </Button>
          </Space>
        }
      >
        <div className="space-y-4">
          <Alert
            message="AI 辅助生成说明"
            description="AI 将基于会诊录音转写内容，自动生成病情摘要和会诊意见。生成后可手动修改完善。"
            type="info"
            showIcon
            className="mb-4"
          />

          {/* 录音列表 */}
          <Card title="会诊录音" size="small">
            {recordings.length === 0 ? (
              <Text type="secondary">暂无录音文件</Text>
            ) : (
              <div className="space-y-2">
                {recordings.map(recording => (
                  <div 
                    key={recording.id}
                    className={`p-3 border rounded cursor-pointer hover:bg-blue-50 ${selectedRecording?.id === recording.id ? 'bg-blue-50 border-blue-300' : ''}`}
                    onClick={() => loadTranscription(recording)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AudioOutlined className="text-green-500" />
                        <Text strong>{recording.title}</Text>
                      </div>
                      <Tag color={recording.status === 'completed' ? 'green' : 'default'}>
                        {recording.status === 'completed' ? '已完成' : recording.status}
                      </Tag>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      时长：{Math.floor(recording.duration / 60)} 分钟 | 
                      上传时间：{recording.uploadTime}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* 转写内容 */}
          {loadingTranscription && (
            <div className="text-center py-8">
              <Spin size="large" tip="正在加载转写内容..." />
            </div>
          )}

          {transcription && !loadingTranscription && (
            <>
              <Card 
                title="录音转写内容" 
                size="small"
                extra={
                  <Space>
                    <Text type="secondary">已选 {selectedSegments.length} 段</Text>
                    <Popover
                      content={
                        <Space direction="vertical">
                          <Button size="small" onClick={() => insertSelectedSegments('chiefComplaint')}>插入到主诉</Button>
                          <Button size="small" onClick={() => insertSelectedSegments('historyOfPresentIllness')}>插入到现病史</Button>
                          <Button size="small" onClick={() => insertSelectedSegments('consultationOpinion')}>插入到会诊意见</Button>
                        </Space>
                      }
                      trigger="click"
                    >
                      <Button size="small" type="primary" disabled={selectedSegments.length === 0}>
                        插入到字段
                      </Button>
                    </Popover>
                  </Space>
                }
              >
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {transcription.segments.map(segment => (
                    <div 
                      key={segment.id}
                      className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${selectedSegments.includes(segment.id) ? 'bg-blue-50 border-blue-300' : ''}`}
                      onClick={() => toggleSegmentSelection(segment.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Space>
                          <Tag color="blue">{segment.speaker}</Tag>
                          <Text type="secondary" className="text-xs">{formatTime(segment.startTime)} - {formatTime(segment.endTime)}</Text>
                        </Space>
                        <Checkbox 
                          checked={selectedSegments.includes(segment.id)}
                          onChange={() => toggleSegmentSelection(segment.id)}
                        />
                      </div>
                      <Text className="text-sm">{segment.text}</Text>
                      {segment.keywords && (
                        <div className="mt-1">
                          {segment.keywords.map((keyword, idx) => (
                            <Tag key={idx} className="mr-1">{keyword}</Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Divider />
                <Text type="secondary" className="text-xs">
                  点击片段可多选，然后插入到报告对应字段
                </Text>
              </Card>

              {/* AI 置信度 */}
              {aiConfidence > 0 && (
                <Card title="AI 生成质量" size="small">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Text>置信度</Text>
                      <Text strong>{(aiConfidence * 100).toFixed(1)}%</Text>
                    </div>
                    <Progress 
                      percent={aiConfidence * 100} 
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                      }}
                      showInfo={false}
                    />
                    <Text type="secondary" className="text-xs">
                      置信度越高，表示 AI 生成的内容越可靠
                    </Text>
                  </div>
                </Card>
              )}
            </>
          )}

          {!transcription && !loadingTranscription && recordings.length > 0 && (
            <Card size="small">
              <div className="text-center py-8">
                <AudioOutlined className="text-4xl text-gray-300 mb-2" />
                <Text type="secondary">请选择一个录音文件加载转写内容</Text>
              </div>
            </Card>
          )}
        </div>
      </Drawer>

      {/* 智能验证结果抽屉 */}
      <Drawer
        title={
          <Space>
            <CheckCircleOutlined style={{ color: validationResult?.isValid ? '#52c41a' : '#ff4d4f' }} />
            <span>AI 智能验证结果</span>
            {validationResult && (
              <Badge 
                count={validationResult.isValid ? '通过' : '未通过'} 
                style={{ backgroundColor: validationResult.isValid ? '#52c41a' : '#ff4d4f' }}
              />
            )}
          </Space>
        }
        placement="right"
        width={600}
        open={showValidationPanel}
        onClose={() => setShowValidationPanel(false)}
      >
        {validationResult && (
          <>
            {/* 验证评分 */}
            <Card className="mb-4">
              <div className="text-center">
                <Progress
                  type="circle"
                  percent={validationResult.score}
                  format={(percent) => (
                    <div>
                      <div className="text-3xl font-bold">{percent}</div>
                      <div className="text-sm text-gray-500">质量评分</div>
                    </div>
                  )}
                  strokeColor={{
                    '0%': '#ff4d4f',
                    '50%': '#faad14',
                    '100%': '#52c41a',
                  }}
                  size={120}
                />
              </div>
              
              <Divider />
              
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic 
                    title="错误" 
                    value={validationResult.summary.errors}
                    valueStyle={{ color: '#ff4d4f' }}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="警告" 
                    value={validationResult.summary.warnings}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<WarningOutlined />}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="建议" 
                    value={validationResult.summary.suggestions}
                    valueStyle={{ color: '#1890ff' }}
                    prefix={<BulbOutlined />}
                  />
                </Col>
              </Row>
            </Card>

            {/* 验证问题列表 */}
            {validationResult.issues.length > 0 && (
              <Card title="验证问题详情" className="mb-4">
                <Collapse accordion>
                  {validationResult.issues.map((issue) => (
                    <Panel
                      key={issue.id}
                      header={
                        <Space>
                          {issue.type === 'error' && <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                          {issue.type === 'warning' && <WarningOutlined style={{ color: '#faad14' }} />}
                          {issue.type === 'suggestion' && <BulbOutlined style={{ color: '#1890ff' }} />}
                          <Text strong>{issue.message}</Text>
                          <Tag color={
                            issue.type === 'error' ? 'red' :
                            issue.type === 'warning' ? 'orange' : 'blue'
                          }>
                            {issue.field}
                          </Tag>
                        </Space>
                      }
                    >
                      <div className="space-y-3">
                        <div>
                          <Text type="secondary" strong>问题描述：</Text>
                          <Paragraph className="mb-2">{issue.detail}</Paragraph>
                        </div>
                        
                        {issue.suggestion && (
                          <div>
                            <Text type="secondary" strong>改进建议：</Text>
                            <Paragraph className="mb-2">{issue.suggestion}</Paragraph>
                          </div>
                        )}
                        
                        <Button 
                          type="primary" 
                          size="small"
                          icon={<CheckCircleOutlined />}
                          onClick={() => {
                            // 滚动到对应字段
                            const fieldElement = document.querySelector(`[name="${issue.field}"]`)
                            if (fieldElement) {
                              fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                              message.info('已定位到问题字段')
                            }
                          }}
                        >
                          定位到字段
                        </Button>
                      </div>
                    </Panel>
                  ))}
                </Collapse>
              </Card>
            )}

            {/* 验证说明 */}
            <Alert
              type="info"
              message="验证说明"
              description={
                <div>
                  <p>• <strong>错误</strong>：必须修复的问题，会影响报告质量</p>
                  <p>• <strong>警告</strong>：建议修复的问题，可能影响报告完整性</p>
                  <p>• <strong>建议</strong>：优化建议，可提升报告质量</p>
                  <p className="mt-2">评分规则：错误-20分，警告-10分，建议-5分</p>
                </div>
              }
              showIcon
            />

            <Divider />

            {/* 操作按钮 */}
            <Space direction="vertical" className="w-full">
              <Button 
                type="primary" 
                block 
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setShowValidationPanel(false)
                  message.success('验证结果已记录，请根据提示修改报告')
                }}
              >
                开始修改
              </Button>
              <Button 
                block 
                onClick={() => {
                  setValidationResult(null)
                  setShowValidationPanel(false)
                }}
              >
                关闭
              </Button>
            </Space>
          </>
        )}
      </Drawer>
    </div>
  )
}
