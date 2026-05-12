import { useState } from 'react'
import { Card, Table, Button, Tag, Space, Typography, Modal, Form, Input, Select, Rate, message, Tabs, Descriptions, Divider } from 'antd'
import { CheckOutlined, CloseOutlined, ExclamationCircleOutlined, FileTextOutlined, BookOutlined, UserOutlined, TeamOutlined, PlayCircleOutlined, AudioOutlined, MedicineBoxOutlined, CheckCircleOutlined, SafetyOutlined, ApiOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { supabase } from '../../lib/supabase'
import { sendSystemNotification } from '../../stores/notificationStore'

const { Title, Text } = Typography

interface QualityTask {
  id: string
  consultationId: string
  patientName: string
  patientInpatientNo: string
  age?: number
  gender?: 'male' | 'female'
  meetingDate: string  // 会诊日期
  consultationTime: string  // 会诊时间段（如：14:00-15:30）
  reviewer: string
  status: '待审核' | '已审核' | '已退回'
  score?: number
  mainDiagnosis?: string
  otherDiagnoses?: string[]
  consultationPurpose?: string
  chiefComplaint?: string  // 主诉
  presentIllness?: string  // 现病史
  pastHistory?: string  // 既往史
  physicalExamination?: string  // 体格检查
  auxiliaryExamination?: string  // 辅助检查
  experts?: Array<{ name: string; department: string; title: string }>
  meetingRecord?: string  // 会诊过程记录
  consultationReport?: string  // 会诊报告
  recommendations?: string[]
  recordingUrl?: string
  videoUrl?: string
  recordingDuration?: string
  videoDuration?: string
}

const mockTasks: QualityTask[] = [
  { 
    id: 'Q001', 
    consultationId: 'C001', 
    patientName: '王建国', 
    patientInpatientNo: 'ZY2024001234',
    age: 65,
    gender: 'male',
    consultationTime: '2024-03-15 14:00-15:30', 
    meetingDate: '2024-03-15',
    reviewer: '质控员 A', 
    status: '待审核',
    mainDiagnosis: '左肺鳞癌 III 期',
    otherDiagnoses: ['高血压 2 级', '2 型糖尿病'],
    consultationPurpose: '明确分期及后续治疗方案',
    chiefComplaint: '反复咳嗽、咳痰 3 月，加重伴咯血 1 周',
    presentIllness: `患者 3 月前无明显诱因出现咳嗽、咳痰，为白色粘痰，无发热、胸痛。
1 周前症状加重，出现痰中带血，每日约 5-10ml，鲜红色。
外院胸部 CT 示：左肺上叶占位性病变，伴纵隔淋巴结肿大。
为求进一步诊治来我院，门诊以"左肺占位"收入院。
发病以来，患者精神可，饮食睡眠欠佳，大小便正常，体重下降约 3kg。`,
    pastHistory: `高血压病史 10 年，最高 180/100mmHg，目前服用氨氯地平 5mg qd，血压控制在 140/90mmHg 左右。
2 型糖尿病史 5 年，目前服用二甲双胍 0.5g tid，空腹血糖控制在 7-8mmol/L。
否认冠心病、脑血管病史。
否认手术、外伤史。
否认药物、食物过敏史。`,
    physicalExamination: `T 36.5℃，P 78 次/分，R 18 次/分，BP 145/85mmHg
一般情况：神志清楚，精神可，发育正常，营养中等，自主体位，查体合作。
皮肤黏膜：无黄染，无皮疹、出血点。
淋巴结：左锁骨上可触及一枚肿大淋巴结，约 1.5cm×1.0cm，质硬，无压痛，活动度差。
胸部：胸廓对称，左肺呼吸音低，未闻及干湿性啰音。
心脏：心率 78 次/分，律齐，各瓣膜听诊区未闻及杂音。
腹部：腹软，无压痛、反跳痛，肝脾肋下未触及。`,
    auxiliaryExamination: `胸部 CT（2024-03-10）：左肺上叶占位，约 4.5cm×3.8cm，伴纵隔淋巴结转移。
PET-CT（2024-03-12）：左肺上叶高代谢病灶，SUVmax 12.5，伴纵隔淋巴结转移。
病理活检（2024-03-13）：（左肺穿刺）鳞癌，低分化。
血常规：WBC 6.8×10^9/L，Hb 125g/L，PLT 210×10^9/L
肝肾功能：正常
肿瘤标志物：CEA 8.5ng/L↑，SCC 5.2ng/ml↑`,
    experts: [
      { name: '李芳', department: '胸外科', title: '副主任医师' },
      { name: '王建国', department: '放射科', title: '主任医师' },
      { name: '刘晓燕', department: '病理科', title: '主任医师' },
      { name: '张明华', department: '肿瘤科', title: '主任医师' }
    ],
    meetingRecord: `
2024-03-15 14:00-15:30 在 MDT 会诊中心召开多学科会诊。

参加专家：
- 胸外科：李芳 副主任医师
- 放射科：王建国 主任医师
- 病理科：刘晓燕 主任医师
- 肿瘤科：张明华 主任医师

会诊过程：
1. 申请科室汇报病史
2. 病理科汇报：（左肺穿刺）鳞癌，低分化
3. 放射科汇报：PET-CT 显示左肺上叶占位，伴纵隔淋巴结转移
4. 胸外科汇报：患者目前无手术指征
5. 各科专家讨论...
    `,
    consultationReport: `
一、诊断
左肺鳞癌 III 期（cT4N2M0）

二、治疗方案
1. 首选治疗方案：同步放化疗
   - 放疗：根治性放疗，DT 60-66Gy/30-33f
   - 化疗：紫杉醇 + 卡铂方案

2. 备选治疗方案：免疫治疗联合化疗
   - PD-1 抑制剂 + 紫杉醇 + 卡铂

三、随访计划
治疗结束后 4 周复查胸部 CT，之后每 3 个月复查一次。
    `,
    recommendations: [
      '完善基因检测',
      '评估心肺功能',
      '营养支持治疗'
    ],
    recordingUrl: '/recordings/C001_audio.mp3',
    videoUrl: '/recordings/C001_video.mp4',
    recordingDuration: '1:30:25',
    videoDuration: '1:28:15'
  },
  { 
    id: 'Q002', 
    consultationId: 'C002', 
    patientName: '李秀英', 
    patientInpatientNo: 'ZY2024001256',
    age: 52,
    gender: 'female',
    consultationTime: '2024-03-14 10:00-11:00',
    meetingDate: '2024-03-14',
    reviewer: '质控员 A', 
    status: '已审核', 
    score: 4.5,
    mainDiagnosis: '乳腺癌改良根治术后辅助治疗',
    consultationReport: '术后辅助化疗方案：TC 方案（多西他赛 + 环磷酰胺）× 4 周期',
    meetingRecord: '2024-03-14 10:00-11:00 完成多学科会诊，参加专家 5 人',
    experts: [
      { name: '陈伟', department: '乳腺外科', title: '副主任医师' },
      { name: '张明华', department: '肿瘤科', title: '主任医师' }
    ]
  },
  { 
    id: 'Q003', 
    consultationId: 'C003', 
    patientName: '张伟', 
    patientInpatientNo: 'ZY2024001189',
    age: 58,
    gender: 'male',
    consultationTime: '2024-03-13 15:00-16:30',
    meetingDate: '2024-03-13',
    reviewer: '质控员 B', 
    status: '已退回',
    mainDiagnosis: '胃癌晚期',
    consultationReport: '姑息化疗方案',
    meetingRecord: '2024-03-13 15:00-16:30 完成多学科会诊',
    experts: [
      { name: '王建国', department: '胃肠外科', title: '主任医师' },
      { name: '李芳', department: '肿瘤科', title: '副主任医师' }
    ]
  },
]

export default function QualityTasks() {
  const [tasks, setTasks] = useState(mockTasks)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedTask, setSelectedTask] = useState<QualityTask | null>(null)
  const [isReviewMode, setIsReviewMode] = useState(false) // 区分查看模式和审核模式
  const [scores, setScores] = useState<Record<string, number>>({
    document: 0,
    guideline: 0,
    participation: 0,
  })
  const [comment, setComment] = useState('')
  const [form] = Form.useForm()
  const [returnModalVisible, setReturnModalVisible] = useState(false)
  const [returnReason, setReturnReason] = useState('')

  const handleReview = (task: QualityTask) => {
    setSelectedTask(task)
    setIsReviewMode(task.status === '待审核') // 待审核的任务是审核模式，其他是查看模式
    setModalVisible(true)
  }

  const handleSubmit = () => {
    const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0) / 3
    setTasks(tasks.map(t => t.id === selectedTask?.id ? { ...t, status: '已审核' as const, score: totalScore } : t))
    
    // 发送通知给秘书和申请医生
    sendQualityNotification(selectedTask, '通过', `质控审核已通过，综合评分：${totalScore.toFixed(1)}分`)
    
    setModalVisible(false)
    message.success('质控审核完成')
  }

  const handleReturnClick = () => {
    setReturnReason('')
    setReturnModalVisible(true)
  }

  const handleReturn = () => {
    if (!returnReason.trim()) {
      message.error('请填写退回原因')
      return
    }
    setTasks(tasks.map(t => t.id === selectedTask?.id ? { ...t, status: '已退回' as const, returnReason } : t))
    
    // 发送通知给秘书和申请医生
    sendQualityNotification(selectedTask, '退回', `质控审核未通过，退回原因：${returnReason}`)
    
    setReturnModalVisible(false)
    setModalVisible(false)
    message.warning('已退回，申请医生将收到整改通知')
  }

  const sendQualityNotification = async (task: QualityTask | null, result: string, detail: string) => {
    if (!task) return
    
    try {
      // 获取会诊信息以获取申请医生姓名
      const { data: consultation } = await supabase
        .from('consultations')
        .select('apply_doctor')
        .eq('id', task.consultationId)
        .single()

      // 通知 MDT 秘书
      const { data: secretaries } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'MDT 秘书')
        .limit(1)

      if (secretaries && secretaries.length > 0) {
        await sendSystemNotification(
          secretaries[0].id,
          result === '通过' ? 'success' : 'error',
          result === '通过' ? '质控审核通过' : '质控审核退回',
          `患者 ${task.patientName} 的会诊质控审核${result}，${detail}`,
          {
            label: '查看',
            url: '/quality/tasks',
          }
        )
      }

      // 通知申请医生
      const doctorName = consultation?.apply_doctor || task.reviewer
      const { data: doctors } = await supabase
        .from('users')
        .select('id')
        .eq('name', doctorName)
        .limit(1)

      if (doctors && doctors.length > 0) {
        await sendSystemNotification(
          doctors[0].id,
          result === '通过' ? 'success' : 'error',
          result === '通过' ? '质控审核通过' : '质控审核退回',
          `您提交的 ${task.patientName} 会诊申请质控审核${result}，${detail}`,
          {
            label: '查看',
            url: '/consultation/my-applies',
          }
        )
      }
    } catch (notificationError) {
      console.error('发送质控通知失败:', notificationError)
    }
  }

  const columns: ColumnsType<QualityTask> = [
    { title: '任务 ID', dataIndex: 'id' },
    { title: '会诊 ID', dataIndex: 'consultationId', render: t => <Tag>#{t}</Tag> },
    { title: '患者', dataIndex: 'patientName' },
    { 
      title: '会诊时间', 
      dataIndex: 'consultationTime',
      render: (time, record) => (
        <div>
          <div>{time}</div>
          <div className="text-xs text-gray-500">{record.meetingDate}</div>
        </div>
      )
    },
    { title: '审核人', dataIndex: 'reviewer' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (t: string) => (
        <Tag color={t === '待审核' ? 'orange' : t === '已审核' ? 'green' : 'red'}>{t}</Tag>
      )
    },
    {
      title: '评分',
      dataIndex: 'score',
      render: (s?: number) => s ? <Rate disabled defaultValue={s} allowHalf /> : '-'
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button 
            size="small" 
            icon={<FileTextOutlined />}
            onClick={() => handleReview(record)}
          >
            查看
          </Button>
          {record.status === '待审核' && (
            <Button 
              type="primary" 
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleReview(record)}
            >
              审核
            </Button>
          )}
        </Space>
      )
    },
  ]

  return (
    <div className="space-y-4">
      <Title level={4}>质控任务审核</Title>

      <Card>
        <Space className="mb-4">
          <Select placeholder="状态筛选" allowClear style={{ width: 150 }}>
            <Select.Option value="待审核">待审核</Select.Option>
            <Select.Option value="已审核">已审核</Select.Option>
            <Select.Option value="已退回">已退回</Select.Option>
          </Select>
          <Select placeholder="时间段" allowClear style={{ width: 150 }}>
            <Select.Option value="week">本周</Select.Option>
            <Select.Option value="month">本月</Select.Option>
          </Select>
        </Space>

        <Table columns={columns} dataSource={tasks} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined />
            <span>
              {isReviewMode ? '质控审核' : '质控详情'} - {selectedTask?.consultationId}
            </span>
          </Space>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={900}
        footer={isReviewMode ? [
          <Button key="return" danger onClick={handleReturnClick}>
            <CloseOutlined /> 退回
          </Button>,
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            <CheckOutlined /> 审核通过
          </Button>,
        ] : [
          <Button key="close" onClick={() => setModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        <div className="space-y-4">
          {/* 基本信息 */}
          <Card 
            title={<><UserOutlined className="text-blue-600" /> 基本信息</>} 
            size="small"
            className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 shadow-md"
          >
            <Descriptions column={2} size="small">
              <Descriptions.Item label="患者姓名">{selectedTask?.patientName}</Descriptions.Item>
              <Descriptions.Item label="住院号">{selectedTask?.patientInpatientNo}</Descriptions.Item>
              <Descriptions.Item label="年龄">{selectedTask?.age}岁</Descriptions.Item>
              <Descriptions.Item label="性别">{selectedTask?.gender === 'male' ? '男' : selectedTask?.gender === 'female' ? '女' : '-'}</Descriptions.Item>
              <Descriptions.Item label="会诊日期">{selectedTask?.meetingDate}</Descriptions.Item>
              <Descriptions.Item label="会诊时间">{selectedTask?.consultationTime}</Descriptions.Item>
              <Descriptions.Item label="主要诊断" span={2}>{selectedTask?.mainDiagnosis}</Descriptions.Item>
              {selectedTask?.otherDiagnoses && selectedTask.otherDiagnoses.length > 0 && (
                <Descriptions.Item label="其他诊断" span={2}>{selectedTask.otherDiagnoses.join('、')}</Descriptions.Item>
              )}
              <Descriptions.Item label="会诊目的" span={2}>{selectedTask?.consultationPurpose}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 参会专家 */}
          <Card 
            title={<><TeamOutlined className="text-purple-600" /> 参会专家</>} 
            size="small"
            className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 shadow-md"
          >
            <div className="flex flex-wrap gap-2">
              {selectedTask?.experts?.map((e, i) => (
                <Tag key={i} color="cyan" className="text-sm px-3 py-1">
                  <UserOutlined className="mr-1" />
                  {e.name} ({e.department})
                </Tag>
              ))}
            </div>
          </Card>

          {/* 病历资料 - Tabs */}
          <Card 
            title={<><MedicineBoxOutlined className="text-amber-600" /> 患者病历资料</>} 
            size="small"
            className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-md"
          >
            <Tabs 
              defaultActiveKey="1" 
              size="small"
              items={[
                {
                  key: '1',
                  label: '📄 主诉',
                  children: (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                      {selectedTask?.chiefComplaint || '暂无相关记录'}
                    </div>
                  )
                },
                {
                  key: '2',
                  label: '📄 现病史',
                  children: (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                      {selectedTask?.presentIllness || '暂无相关记录'}
                    </div>
                  )
                },
                {
                  key: '3',
                  label: '📄 既往史',
                  children: (
                    <div className="p-4 bg-green-50 border border-green-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                      {selectedTask?.pastHistory || '暂无相关记录'}
                    </div>
                  )
                },
                {
                  key: '4',
                  label: '🩺 体格检查',
                  children: (
                    <div className="p-4 bg-cyan-50 border border-cyan-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                      {selectedTask?.physicalExamination || '暂无相关记录'}
                    </div>
                  )
                },
                {
                  key: '5',
                  label: '🧪 辅助检查',
                  children: (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded text-sm whitespace-pre-line min-h-[200px] max-h-[400px] overflow-y-auto">
                      {selectedTask?.auxiliaryExamination || '暂无相关记录'}
                    </div>
                  )
                },
              ]}
            />
          </Card>

          {/* MDT 会诊记录 */}
          <Card 
            title={<><FileTextOutlined className="text-indigo-600" /> MDT 会诊记录</>} 
            size="small"
            className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 shadow-md"
          >
            {selectedTask?.meetingRecord ? (
              <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed max-h-[600px] overflow-y-auto p-3 bg-white rounded border border-indigo-100">
                {selectedTask.meetingRecord}
              </div>
            ) : (
              <div className="text-gray-500 text-sm py-8 text-center">暂无会诊记录</div>
            )}
          </Card>

          {/* 会诊报告 */}
          <Card 
            title={<><BookOutlined className="text-purple-600" /> MDT 会诊报告</>} 
            size="small"
            className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 shadow-md"
          >
            {selectedTask?.consultationReport ? (
              <div className="whitespace-pre-line text-sm text-gray-700 leading-relaxed max-h-[600px] overflow-y-auto p-3 bg-white rounded border border-purple-100">
                {selectedTask.consultationReport}
              </div>
            ) : (
              <div className="text-gray-500 text-sm py-8 text-center">暂无会诊报告</div>
            )}
          </Card>

          {/* 会诊建议 */}
          <Card 
            title={<><CheckCircleOutlined className="text-orange-600" /> MDT 会诊建议</>} 
            size="small"
            className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 shadow-md"
          >
            {selectedTask?.recommendations && selectedTask.recommendations.length > 0 ? (
              <div className="p-3 bg-white rounded border border-orange-100">
                <ul className="space-y-2">
                  {selectedTask.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-orange-500 mt-1 font-bold">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-gray-500 text-sm py-8 text-center">暂无会诊建议</div>
            )}
          </Card>

          {/* 音视频资料 */}
          {(selectedTask?.recordingUrl || selectedTask?.videoUrl) && (
            <Card 
              title={<><PlayCircleOutlined className="text-red-600" /> MDT 会诊音视频</>} 
              size="small"
              className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 shadow-md"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTask.recordingUrl && (
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <AudioOutlined className="text-green-600" />
                      <Text strong className="text-sm">会诊录音</Text>
                    </div>
                    <audio controls className="w-full mb-2" src={selectedTask.recordingUrl}>
                      您的浏览器不支持音频播放
                    </audio>
                    <div className="text-xs text-gray-600">
                      <Tag icon={<PlayCircleOutlined />} color="blue">时长：{selectedTask.recordingDuration || '未知'}</Tag>
                    </div>
                  </div>
                )}
                {selectedTask.videoUrl && (
                  <div className="p-3 bg-red-50 rounded border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <PlayCircleOutlined className="text-red-600" />
                      <Text strong className="text-sm">会诊录像</Text>
                    </div>
                    <video controls className="w-full rounded mb-2" src={selectedTask.videoUrl}>
                      您的浏览器不支持视频播放
                    </video>
                    <div className="text-xs text-gray-600">
                      <Tag icon={<PlayCircleOutlined />} color="blue">时长：{selectedTask.videoDuration || '未知'}</Tag>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {isReviewMode && (
            <>
              <Divider />

              <Title level={5}>质控评分</Title>
              <Form form={form} layout="vertical">
                <Form.Item label="文书完整性（0-5 分）" tooltip="会诊记录、报告等文书的完整性和规范性">
                  <Space>
                    <Rate
                      value={scores.document}
                      onChange={(v) => setScores({ ...scores, document: v })}
                    />
                    <Text type="secondary">{scores.document}分</Text>
                  </Space>
                </Form.Item>
                <Form.Item label="指南依从性（0-5 分）" tooltip="治疗方案是否符合临床诊疗指南">
                  <Space>
                    <Rate
                      value={scores.guideline}
                      onChange={(v) => setScores({ ...scores, guideline: v })}
                    />
                    <Text type="secondary">{scores.guideline}分</Text>
                  </Space>
                </Form.Item>
                <Form.Item label="专家参与度（0-5 分）" tooltip="各学科专家的参与程度和贡献">
                  <Space>
                    <Rate
                      value={scores.participation}
                      onChange={(v) => setScores({ ...scores, participation: v })}
                    />
                    <Text type="secondary">{scores.participation}分</Text>
                  </Space>
                </Form.Item>
                <Form.Item label="质控意见">
                  <Input.TextArea
                    rows={3}
                    placeholder="请输入质控意见，包括优点、不足及改进建议..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </Form.Item>
              </Form>

              <div className="p-4 bg-blue-50 rounded text-center">
                <Text strong>综合评分：</Text>
                <Text className="text-2xl text-medical-blue">
                  {(Object.values(scores).reduce((sum, s) => sum + s, 0) / 3).toFixed(1)} 分
                </Text>
              </div>
            </>
          )}

          {!isReviewMode && selectedTask?.score && (
            <>
              <Divider />
              <div className="p-4 bg-green-50 rounded">
                <Title level={5}>历史评分</Title>
                <Descriptions column={2} size="small" bordered>
                  <Descriptions.Item label="综合评分">
                    <Rate disabled defaultValue={selectedTask.score} allowHalf />
                    <span className="ml-2 font-bold text-lg">{selectedTask.score.toFixed(1)}分</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="审核人">{selectedTask.reviewer}</Descriptions.Item>
                  <Descriptions.Item label="审核时间" span={2}>2024-03-16 10:30</Descriptions.Item>
                </Descriptions>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* 退回 - 填写退回原因 */}
      <Modal
        title={<><ExclamationCircleOutlined className="text-red-600" /> 退回材料</>}
        open={returnModalVisible}
        onCancel={() => setReturnModalVisible(false)}
        onOk={handleReturn}
        okText="确认退回"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm">
            <Text type="danger">退回后，申请医生将收到整改通知，需要修改后重新提交</Text>
          </div>
          <div className="space-y-2">
            <Text strong className="text-red-600">退回原因（必填）：</Text>
            <Input.TextArea
              rows={4}
              placeholder="例如：会诊记录过于简单，请补充专家讨论详情"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}