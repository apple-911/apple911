import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Button, Tag, Space, Modal, message, List, Avatar, Typography, Empty, Select, DatePicker, Drawer, Input, Descriptions, Tabs, Badge } from 'antd'
import { CheckOutlined, CloseOutlined, CalendarOutlined, ExclamationCircleOutlined, UserOutlined, MedicineBoxOutlined, FileTextOutlined, UploadOutlined, DatabaseOutlined, PictureOutlined, FilePdfOutlined, EyeOutlined } from '@ant-design/icons'
import { mockConsultations } from '../../mocks/data'
import type { Consultation, UploadedFile } from '../../stores/consultationStore'
import PatientInfo from '../../components/PatientInfo'
import MaterialUpload from '../../components/MaterialUpload'

const { Title, Text } = Typography
const { TextArea } = Input

type ApplicationSource = 'doctor' | 'patient'

interface ExtendedConsultation extends Consultation {
  source?: ApplicationSource
  sourceDetail?: string
  age?: number
  gender?: 'male' | 'female'
  otherDiagnoses?: string[]
  consultationPurpose?: string
  applyDate?: string
}

export default function PendingReview() {
  const [data] = useState<ExtendedConsultation[]>([
    {
      id: 'C001',
      patientId: 'P001',
      patientName: '王建国',
      patientInpatientNo: 'ZY2024001234',
      age: 65,
      gender: 'male',
      type: '院内',
      applyTime: '2024-03-15 09:30',
      applyDate: '2024-03-15',
      expectTime: '2024-03-20 14:00',
      status: '待科室审核',
      urgency: '紧急',
      department: '肿瘤科',
      applyDoctor: '张明华',
      experts: [
        { id: '1', name: '李芳', department: '胸外科', title: '副主任医师', status: '空闲', specialty: '胸部肿瘤' },
        { id: '3', name: '王建国', department: '放射科', title: '主任医师', status: '空闲', specialty: '放射治疗' },
        { id: '4', name: '刘晓燕', department: '病理科', title: '主任医师', status: '空闲', specialty: '病理诊断' }
      ],
      mainDiagnosis: '左肺鳞癌 III 期',
      otherDiagnoses: ['高血压 2 级', '2 型糖尿病'],
      consultationPurpose: '明确分期及后续治疗方案',
      source: 'doctor',
      sourceDetail: '肿瘤科张明华医生申请',
      medicalRecords: {
        chiefComplaint: '咳嗽、咳痰 3 个月，加重伴痰中带血 2 周',
        presentIllness: '患者 3 个月前无明显诱因出现咳嗽、咳痰，为阵发性刺激性干咳，偶有少量白色粘痰。2 周前症状加重，出现痰中带血。',
        pastHistory: '高血压病史 5 年，规律服药',
        physicalExamination: 'T 36.5℃ P 82 次/分 R 18 次/分 BP 135/85mmHg',
        auxiliaryExamination: '胸部 CT 示：左肺上叶占位性病变',
        initialDiagnosis: '左肺鳞癌 III 期',
        treatmentPlan: '拟行新辅助化疗后手术'
      },
      uploadedFiles: [
        {
          id: 'F001',
          fileName: '入院记录.pdf',
          fileType: '病历',
          fileSize: 524288,
          uploadTime: '2024-03-15 09:00',
          uploadUrl: '/files/001.pdf',
          fromHIS: true
        },
        {
          id: 'F002',
          fileName: '胸部 CT 报告.pdf',
          fileType: '检查报告',
          fileSize: 1048576,
          uploadTime: '2024-03-15 09:05',
          uploadUrl: '/files/002.pdf',
          fromHIS: true
        },
        {
          id: 'F003',
          fileName: '病理活检报告.pdf',
          fileType: '病理报告',
          fileSize: 768000,
          uploadTime: '2024-03-15 09:10',
          uploadUrl: '/files/003.pdf',
          fromHIS: false
        },
        {
          id: 'F004',
          fileName: '肿瘤标志物检查结果.pdf',
          fileType: '检验报告',
          fileSize: 512000,
          uploadTime: '2024-03-15 09:15',
          uploadUrl: '/files/004.pdf',
          fromHIS: true
        }
      ],
      hisDataSynced: true,
      hisSyncTime: '2024-03-15 08:55'
    },
    {
      id: 'C006',
      patientId: 'P006',
      patientName: '李秀英',
      patientInpatientNo: 'ZY2024001256',
      age: 52,
      gender: 'female',
      type: '远程',
      applyTime: '2024-03-15 14:20',
      applyDate: '2024-03-15',
      expectTime: '2024-03-22 10:00',
      status: '待科室审核',
      urgency: '普通',
      department: '乳腺外科',
      applyDoctor: '陈伟',
      experts: [
        { id: '2', name: '李芳', department: '胸外科', title: '副主任医师', status: '空闲', specialty: '胸部肿瘤' },
        { id: '5', name: '陈伟', department: '肿瘤科', title: '副主任医师', status: '忙碌', specialty: '乳腺肿瘤' }
      ],
      mainDiagnosis: '乳腺癌改良根治术后辅助治疗',
      otherDiagnoses: ['骨质疏松症'],
      consultationPurpose: '制定术后辅助化疗方案',
      source: 'doctor',
      sourceDetail: '乳腺外科陈伟医生申请',
      medicalRecords: {
        chiefComplaint: '乳腺癌术后 1 个月，要求辅助治疗',
        presentIllness: '患者 1 个月前因"右乳癌"行改良根治术，术后恢复良好。',
        pastHistory: '骨质疏松症病史 3 年',
        physicalExamination: 'T 36.3℃ P 76 次/分 R 16 次/分 BP 120/75mmHg',
        auxiliaryExamination: '术后病理：右乳浸润性导管癌，pT2N1M0',
        initialDiagnosis: '右乳癌术后 pT2N1M0 IIB 期',
        treatmentPlan: '拟行辅助化疗 + 内分泌治疗'
      },
      uploadedFiles: [
        {
          id: 'F006',
          fileName: '手术记录.pdf',
          fileType: '病历',
          fileSize: 614400,
          uploadTime: '2024-03-15 14:00',
          uploadUrl: '/files/006.pdf',
          fromHIS: true
        },
        {
          id: 'F007',
          fileName: '术后病理报告.pdf',
          fileType: '病理报告',
          fileSize: 921600,
          uploadTime: '2024-03-15 14:05',
          uploadUrl: '/files/007.pdf',
          fromHIS: true
        }
      ],
      hisDataSynced: true,
      hisSyncTime: '2024-03-15 13:55'
    },
    {
      id: 'C007',
      patientId: 'P007',
      patientName: '张建国',
      patientInpatientNo: 'M123456789',
      age: 58,
      gender: 'male',
      type: '远程',
      applyTime: '2024-03-16 10:15',
      applyDate: '2024-03-16',
      expectTime: '2024-03-25 14:30',
      status: '待科室审核',
      urgency: '普通',
      department: '肿瘤科',
      applyDoctor: '张建国（患者自行申请）',
      experts: [
        { id: '1', name: '张明华', department: '肿瘤科', title: '主任医师', status: '空闲', specialty: '肿瘤内科' },
        { id: '6', name: '赵红梅', department: '呼吸科', title: '主任医师', status: '空闲', specialty: '呼吸系统疾病' }
      ],
      mainDiagnosis: '肺癌术后复查',
      consultationPurpose: '术后复查及康复指导',
      source: 'patient',
      sourceDetail: '患者张建国通过患者端申请'
    },
    {
      id: 'C008',
      patientId: 'P008',
      patientName: '刘芳',
      patientInpatientNo: 'ZY2024001356',
      age: 71,
      gender: 'female',
      type: '院内',
      applyTime: '2024-03-16 16:45',
      applyDate: '2024-03-16',
      expectTime: '2024-03-19 09:00',
      status: '待科室审核',
      urgency: '特急',
      department: '消化内科',
      applyDoctor: '王建国',
      experts: [
        { id: '1', name: '张明华', department: '肿瘤科', title: '主任医师', status: '空闲', specialty: '肿瘤内科' },
        { id: '2', name: '李芳', department: '胸外科', title: '副主任医师', status: '空闲', specialty: '胸部肿瘤' },
        { id: '8', name: '周丽萍', department: '营养科', title: '副主任医师', status: '空闲', specialty: '临床营养' }
      ],
      mainDiagnosis: '胃癌晚期伴多发转移',
      otherDiagnoses: ['贫血', '低蛋白血症', '腹腔积液'],
      consultationPurpose: '姑息治疗方案及营养支持',
      source: 'doctor',
      sourceDetail: '消化内科王建国医生申请'
    },
    {
      id: 'C009',
      patientId: 'P009',
      patientName: '陈刚',
      patientInpatientNo: 'ZY2024001402',
      type: '远程',
      applyTime: '2024-03-17 08:30',
      expectTime: '2024-03-23 15:00',
      status: '待科室审核',
      urgency: '普通',
      department: '泌尿外科',
      applyDoctor: '陈刚（患者自行申请）',
      experts: [
        { id: '1', name: '张明华', department: '肿瘤科', title: '主任医师', status: '空闲', specialty: '肿瘤内科' },
        { id: '7', name: '孙志强', department: '放疗科', title: '副主任医师', status: '离线', specialty: '放射治疗' }
      ],
      mainDiagnosis: '前列腺癌去势抵抗性',
      source: 'patient',
      sourceDetail: '患者陈刚通过患者端申请'
    },
    {
      id: 'C010',
      patientId: 'P010',
      patientName: '杨志强',
      patientInpatientNo: 'ZY2024001478',
      type: '院内',
      applyTime: '2024-03-17 11:20',
      expectTime: '2024-03-21 10:00',
      status: '待科室审核',
      urgency: '紧急',
      department: '神经外科',
      applyDoctor: '刘志远',
      experts: [
        { id: '1', name: '张明华', department: '肿瘤科', title: '主任医师', status: '空闲', specialty: '肿瘤内科' },
        { id: '3', name: '王建国', department: '放射科', title: '主任医师', status: '空闲', specialty: '放射治疗' },
        { id: '4', name: '刘晓燕', department: '病理科', title: '主任医师', status: '空闲', specialty: '病理诊断' }
      ],
      mainDiagnosis: '胶质母细胞瘤术后复发',
      source: 'doctor',
      sourceDetail: '神经外科刘志远医生申请'
    }
  ])
  const [schedulingConsultation, setSchedulingConsultation] = useState<ExtendedConsultation | null>(null)
  const [patientDrawerVisible, setPatientDrawerVisible] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState<string>('')
  const [selectedPatientName, setSelectedPatientName] = useState<string>('')
  const [selectedPatientInpatientNo, setSelectedPatientInpatientNo] = useState<string>('')
  const navigate = useNavigate()

  const getSourceBadge = (source: ApplicationSource | undefined) => {
    if (source === 'patient') {
      return (
        <Tag icon={<UserOutlined />} color="success">
          患者申请
        </Tag>
      )
    }
    return (
      <Tag icon={<MedicineBoxOutlined />} color="processing">
        医生申请
      </Tag>
    )
  }

  const handleApprove = (consultation: ExtendedConsultation) => {
    const newData = data.filter(d => d.id !== consultation.id)
    message.success(`已通过 ${consultation.patientName} 的会诊申请（${getSourceLabel(consultation.source)}）`)
  }

  const handleReject = (consultation: ExtendedConsultation) => {
    Modal.confirm({
      title: '选择处理方式',
      content: (
        <div>
          <p>确定要处理 {consultation.patientName} 的会诊申请吗？</p>
          <p className="text-gray-500 mt-2">申请来源：{getSourceLabel(consultation.source)}</p>
        </div>
      ),
      icon: <ExclamationCircleOutlined />,
      okText: '拒绝申请',
      cancelText: '退回补充材料',
      onOk: () => {
        Modal.confirm({
          title: '确认拒绝',
          content: `确定要拒绝 ${consultation.patientName} 的会诊申请吗？\n\n申请来源：${getSourceLabel(consultation.source)}`,
          onOk: () => {
            message.success('已拒绝申请')
          }
        })
      },
      onCancel: () => {
        showRejectWithReasonModal(consultation)
      }
    })
  }

  const showRejectWithReasonModal = (consultation: ExtendedConsultation) => {
    let rejectReason = ''
    
    Modal.confirm({
      title: '退回补充材料',
      content: (
        <div>
          <p className="mb-2">请说明需要补充的材料：</p>
          <TextArea
            rows={4}
            placeholder="例如：请补充患者近期影像学检查报告（CT/MRI）、病理报告、实验室检查结果等..."
            onChange={(e) => rejectReason = e.target.value}
            autoFocus
          />
        </div>
      ),
      okText: '确认退回',
      cancelText: '取消',
      onOk: () => {
        if (!rejectReason.trim()) {
          message.warning('请填写退回原因')
          return false // 阻止关闭
        }
        message.success(`已退回申请，已通知医生补充材料：${rejectReason}`)
      }
    })
  }

  const handleSchedule = (consultation: ExtendedConsultation) => {
    setSchedulingConsultation(consultation)
    Modal.confirm({
      title: '快速排期',
      content: (
        <div>
          <p>为 {consultation.patientName} 选择会诊时间：</p>
          <DatePicker showTime className="!w-full mt-2" />
        </div>
      ),
      onOk: () => {
        message.success('已排期，将通知专家')
        navigate('/consultation/schedule')
      }
    })
  }

  const getSourceLabel = (source: ApplicationSource | undefined) => {
    return source === 'patient' ? '患者申请' : '医生申请'
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case '紧急': return 'red'
      case '特急': return 'orange'
      default: return 'default'
    }
  }

  const showPatientInfo = (patientId: string, patientName: string, patientInpatientNo: string) => {
    setSelectedPatientId(patientId)
    setSelectedPatientName(patientName)
    setSelectedPatientInpatientNo(patientInpatientNo)
    setPatientDrawerVisible(true)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center" style={{ background: 'var(--xiehe-green-bg)' }}>
          <div className="text-2xl font-bold" style={{ color: 'var(--xiehe-green)' }}>{data.length}</div>
          <div className="text-xs text-gray-500 mt-1">待审核总数</div>
        </Card>
        <Card className="text-center" style={{ background: '#e6f7ff' }}>
          <div className="text-2xl font-bold" style={{ color: '#1890ff' }}>
            {data.filter(d => d.source === 'doctor').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">医生申请</div>
        </Card>
        <Card className="text-center" style={{ background: '#f6ffed' }}>
          <div className="text-2xl font-bold" style={{ color: '#52c41a' }}>
            {data.filter(d => d.source === 'patient').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">患者申请</div>
        </Card>
        <Card className="text-center" style={{ background: '#fff7e6' }}>
          <div className="text-2xl font-bold" style={{ color: '#fa8c16' }}>
            {data.filter(d => d.urgency === '紧急' || d.urgency === '特急').length}
          </div>
          <div className="text-xs text-gray-500 mt-1">紧急申请</div>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <Title level={4} className="!mb-0">待审核列表</Title>
        <Space>
          <Text>共 {data.length} 条待审</Text>
          <Select placeholder="排序" style={{ width: 150 }} defaultValue="all">
            <Select.Option value="all">全部来源</Select.Option>
            <Select.Option value="doctor">仅医生申请</Select.Option>
            <Select.Option value="patient">仅患者申请</Select.Option>
          </Select>
          <Select placeholder="排序" style={{ width: 120 }} defaultValue="urgency">
            <Select.Option value="urgency">按紧急程度</Select.Option>
            <Select.Option value="time">按申请时间</Select.Option>
          </Select>
        </Space>
      </div>

      {data.length === 0 ? (
        <Card>
          <Empty description="暂无待审核申请" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.map(consultation => (
            <Card
              key={consultation.id}
              className="hover:shadow-lg transition-shadow"
              title={
                <Space>
                  <Avatar icon={<ExclamationCircleOutlined />} className="!bg-orange-500" size="small" />
                  <div>
                    <div className="font-medium text-sm">
                      {consultation.patientName} {consultation.age ? `${consultation.age}岁` : ''} {consultation.gender === 'male' ? '男' : consultation.gender === 'female' ? '女' : ''}
                    </div>
                    <div className="text-xs text-gray-500">{consultation.patientInpatientNo}</div>
                  </div>
                  <Tag color={getUrgencyColor(consultation.urgency)}>{consultation.urgency}</Tag>
                  {getSourceBadge(consultation.source)}
                </Space>
              }
              extra={
                <Tag color={consultation.type === '院内' ? 'blue' : 'green'}>{consultation.type}</Tag>
              }
              size="small"
            >
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <Text type="secondary">申请科室：</Text>
                    <Text>{consultation.department}</Text>
                  </div>
                  <div>
                    <Text type="secondary">申请医生：</Text>
                    <Text>{consultation.applyDoctor}</Text>
                  </div>
                  <div>
                    <Text type="secondary">申请时间：</Text>
                    <Text>{consultation.applyTime}</Text>
                  </div>
                  <div>
                    <Text type="secondary">期望时间：</Text>
                    <Text>{consultation.expectTime}</Text>
                  </div>
                  <div className="col-span-2">
                    <Text type="secondary">来源：</Text>
                    <Text>{consultation.sourceDetail}</Text>
                  </div>
                </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="mb-2">
                  <Text strong>主要诊断：</Text>
                  <Text>{consultation.mainDiagnosis}</Text>
                </div>
                {consultation.otherDiagnoses && consultation.otherDiagnoses.length > 0 && (
                  <div className="mb-2">
                    <Text strong>其他诊断：</Text>
                    <Text className="text-xs text-gray-600">{consultation.otherDiagnoses.join('、')}</Text>
                  </div>
                )}
                {consultation.consultationPurpose && (
                  <div className="mb-2">
                    <Text strong>会诊目的：</Text>
                    <Text>{consultation.consultationPurpose}</Text>
                  </div>
                )}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="mb-2">
                  <Text strong>邀请专家：</Text>
                </div>
                <Space wrap>
                  {consultation.experts.map(e => (
                    <Tag key={e.id} color="blue">
                      {e.name}
                      <br />
                      <span className="text-xs">{e.department}</span>
                    </Tag>
                  ))}
                </Space>
              </div>
                <div className="flex justify-between items-center mt-4">
                  <Button onClick={() => showPatientInfo(consultation.patientId, consultation.patientName, consultation.patientInpatientNo)}>
                    <UserOutlined className="mr-1" />
                    查看患者信息
                  </Button>
                  <Space>
                    <Button danger icon={<CloseOutlined />} onClick={() => handleReject(consultation)}>
                      拒绝
                    </Button>
                    <Button icon={<CalendarOutlined />} onClick={() => handleSchedule(consultation)}>
                      修改排期
                    </Button>
                    <Button type="primary" icon={<CheckOutlined />} className="!bg-green-500 !border-green-500" onClick={() => handleApprove(consultation)}>
                      通过
                    </Button>
                  </Space>
                </div>
            </Card>
          ))}
        </div>
      )}

      <Drawer
        title="患者详细信息"
        placement="right"
        width={1200}
        open={patientDrawerVisible}
        onClose={() => setPatientDrawerVisible(false)}
      >
        {selectedPatientId && (() => {
          // 查找当前选中的会诊申请
          const selectedConsultation = data.find(c => c.patientId === selectedPatientId)
          
          return (
            <div className="space-y-4">
              {/* 患者基本信息 */}
              <PatientInfo
                patientId={selectedPatientId}
                patientName={selectedPatientName}
                patientInpatientNo={selectedPatientInpatientNo}
                compact={false}
              />

              {/* 病历资料 */}
              {selectedConsultation?.medicalRecords && (
                <Card 
                  size="small" 
                  title={
                    <Space>
                      <FileTextOutlined />
                      <span>病历资料</span>
                      {selectedConsultation.hisDataSynced && (
                        <Tag color="green" icon={<DatabaseOutlined />}>
                          HIS 已同步
                        </Tag>
                      )}
                    </Space>
                  }
                  className="bg-green-50 border-green-200"
                >
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="主诉" span={2}>
                      <div className="whitespace-pre-wrap text-sm">{selectedConsultation.medicalRecords.chiefComplaint || '-'}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="现病史" span={2}>
                      <div className="whitespace-pre-wrap text-sm">{selectedConsultation.medicalRecords.presentIllness || '-'}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="既往史" span={2}>
                      <div className="whitespace-pre-wrap text-sm">{selectedConsultation.medicalRecords.pastHistory || '-'}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="体格检查" span={2}>
                      <div className="whitespace-pre-wrap text-sm">{selectedConsultation.medicalRecords.physicalExamination || '-'}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="辅助检查" span={2}>
                      <div className="whitespace-pre-wrap text-sm">{selectedConsultation.medicalRecords.auxiliaryExamination || '-'}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="初步诊断" span={2}>
                      <div className="whitespace-pre-wrap text-sm font-medium text-blue-600">{selectedConsultation.medicalRecords.initialDiagnosis || '-'}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="治疗方案" span={2}>
                      <div className="whitespace-pre-wrap text-sm">{selectedConsultation.medicalRecords.treatmentPlan || '-'}</div>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}

              {/* 附件材料 */}
              {selectedConsultation?.uploadedFiles && selectedConsultation.uploadedFiles.length > 0 && (
                <Card 
                  size="small" 
                  title={
                    <Space>
                      <UploadOutlined />
                      <span>附件材料（共 {selectedConsultation.uploadedFiles.length} 份）</span>
                    </Space>
                  }
                >
                  <Tabs
                    size="small"
                    type="card"
                    items={(() => {
                      const filesByType = selectedConsultation.uploadedFiles?.reduce((acc, file) => {
                        if (!acc[file.fileType]) {
                          acc[file.fileType] = []
                        }
                        acc[file.fileType].push(file)
                        return acc
                      }, {} as Record<string, typeof selectedConsultation.uploadedFiles>) || {}

                      return Object.keys(filesByType).map(type => ({
                        key: type,
                        label: (
                          <Space>
                            <span>{type}</span>
                            <Badge count={filesByType[type].length} size="small" />
                          </Space>
                        ),
                        children: (
                          <List
                            dataSource={filesByType[type]}
                            renderItem={(file) => (
                              <List.Item
                                actions={[
                                  <Space key="actions">
                                    <Button 
                                      type="link" 
                                      size="small" 
                                      icon={<EyeOutlined />}
                                      onClick={() => window.open(file.uploadUrl, '_blank')}
                                    >
                                      查看
                                    </Button>
                                    <Button 
                                      type="link" 
                                      size="small" 
                                      icon={<UploadOutlined />}
                                      onClick={() => {
                                        const link = document.createElement('a')
                                        link.href = file.uploadUrl
                                        link.download = file.fileName
                                        link.click()
                                      }}
                                    >
                                      下载
                                    </Button>
                                  </Space>
                                ]}
                              >
                                <List.Item.Meta
                                  avatar={
                                    <Avatar 
                                      icon={
                                        file.fileType.includes('影像') || file.fileType.includes('图片') ? 
                                          <PictureOutlined /> : 
                                          file.fileType.includes('病理') || file.fileName.endsWith('.pdf') ? 
                                            <FilePdfOutlined /> : 
                                            <FileTextOutlined />
                                      }
                                      size={40}
                                      style={{ backgroundColor: file.fromHIS ? '#52c41a' : '#1890ff' }}
                                    />
                                  }
                                  title={
                                    <Space>
                                      <Text strong>{file.fileName}</Text>
                                      {file.fromHIS && (
                                        <Tag color="green" icon={<DatabaseOutlined />}>HIS</Tag>
                                      )}
                                      <Tag color="default">{(file.fileSize / 1024).toFixed(1)} KB</Tag>
                                    </Space>
                                  }
                                  description={
                                    <div className="text-xs text-gray-500">
                                      上传时间：{new Date(file.uploadTime).toLocaleString()}
                                    </div>
                                  }
                                />
                              </List.Item>
                            )}
                          />
                        )
                      }))
                    })()}
                  />
                </Card>
              )}
            </div>
          )
        })()}
      </Drawer>
    </div>
  )
}
