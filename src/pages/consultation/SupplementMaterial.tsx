import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, Button, Space, Typography, Alert, Spin, Modal, message, Steps, Divider, Tag } from 'antd'
import { ArrowLeftOutlined, FileTextOutlined, CheckCircleOutlined, ExclamationCircleOutlined, DatabaseOutlined } from '@ant-design/icons'
import type { Consultation, UploadedFile } from '../../stores/consultationStore'
import MaterialUpload from '../../components/MaterialUpload'
import PatientInfo from '../../components/PatientInfo'
import { mockPatients } from '../../mocks/data'

const { Title, Text } = Typography

export default function SupplementMaterial() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [consultation, setConsultation] = useState<Consultation | null>(null)
  const [rejectReason, setRejectReason] = useState<string>('')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [medicalRecords, setMedicalRecords] = useState<any>({})
  const [hisDataSynced, setHisDataSynced] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // 模拟加载会诊信息
    setTimeout(() => {
      const mockConsultation: Consultation = {
        id: id || 'C001',
        patientId: 'P001',
        patientName: '王建国',
        patientInpatientNo: 'ZY2024001234',
        type: '院内',
        applyTime: '2024-03-15 09:30',
        expectTime: '2024-03-20 14:00',
        status: '已拒绝',
        urgency: '紧急',
        department: '肿瘤科',
        applyDoctor: '张明华',
        experts: [],
        mainDiagnosis: '左肺鳞癌 III 期',
        materialStatus: '已退回',
        rejectReason: '材料不完整，请补充以下资料：\n1. 患者近期胸部 CT 增强扫描报告\n2. 病理免疫组化结果\n3. 肿瘤标志物检查结果\n4. 既往治疗记录（手术记录、化疗方案等）',
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
            fileName: '初步诊断证明.pdf',
            fileType: '病历',
            fileSize: 256000,
            uploadTime: '2024-03-15 09:05',
            uploadUrl: '/files/002.pdf',
            fromHIS: false
          }
        ],
        hisDataSynced: true,
        hisSyncTime: '2024-03-15 08:55'
      }
      setConsultation(mockConsultation)
      setRejectReason(mockConsultation.rejectReason || '')
      setUploadedFiles(mockConsultation.uploadedFiles || [])
      setHisDataSynced(mockConsultation.hisDataSynced || false)
      setLoading(false)
    }, 500)
  }, [id])

  const handleHISDataSync = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const syncedRecords = {
        chiefComplaint: consultation?.mainDiagnosis || '',
        presentIllness: `患者因"${consultation?.mainDiagnosis}"入院，详细病史...`,
        pastHistory: '高血压病史 5 年，规律服药',
        auxiliaryExamination: '影像学检查：CT 显示左肺占位性病变',
        hisSyncTime: new Date().toISOString()
      }
      
      setMedicalRecords(syncedRecords)
      setHisDataSynced(true)
      
      const hisFiles: UploadedFile[] = [
        {
          id: 'HIS001',
          fileName: '入院记录.pdf',
          fileType: '病历',
          fileSize: 524288,
          uploadTime: new Date().toISOString(),
          uploadUrl: '/his/records/001.pdf',
          fromHIS: true
        },
        {
          id: 'HIS002',
          fileName: 'CT 检查报告.pdf',
          fileType: '检查报告',
          fileSize: 1048576,
          uploadTime: new Date().toISOString(),
          uploadUrl: '/his/reports/ct001.pdf',
          fromHIS: true
        },
        {
          id: 'HIS003',
          fileName: '病理报告.pdf',
          fileType: '病理报告',
          fileSize: 768000,
          uploadTime: new Date().toISOString(),
          uploadUrl: '/his/reports/path001.pdf',
          fromHIS: true
        }
      ]
      
      setUploadedFiles(prev => {
        const existingIds = new Set(prev.map(f => f.id))
        const newFiles = hisFiles.filter(f => !existingIds.has(f.id))
        return [...prev, ...newFiles]
      })
      
      message.success('HIS 数据同步成功！已获取新的病历资料')
    } catch (error) {
      message.error('HIS 数据同步失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    if (uploadedFiles.length === 0) {
      Modal.confirm({
        title: '未上传材料',
        content: '您还没有上传任何材料，确定要提交吗？',
        onOk: submitSupplement
      })
      return
    }
    submitSupplement()
  }

  const submitSupplement = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    Modal.success({
      title: '补充材料已提交',
      content: '您的补充材料已成功提交，秘书将重新审核您的申请。',
      onOk: () => navigate('/consultation/my-applies')
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="text-center py-12">
        <Text type="secondary">未找到会诊申请信息</Text>
      </div>
    )
  }

  const patient = mockPatients.find(p => p.id === consultation.patientId) || null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            返回
          </Button>
          <Title level={4} className="!mb-0">补充材料</Title>
        </Space>
      </div>

      {/* 退回原因提示 */}
      <Alert
        type="warning"
        message={
          <Space>
            <ExclamationCircleOutlined className="text-orange-500" />
            <Text strong>您的申请被退回，需要补充材料</Text>
          </Space>
        }
        description={
          <div className="mt-2">
            <Text strong>退回原因：</Text>
            <div className="whitespace-pre-wrap mt-1">{rejectReason}</div>
          </div>
        }
        showIcon
        className="mb-4"
      />

      {/* 进度提示 */}
      <Card size="small">
        <Steps
          current={1}
          size="small"
          items={[
            {
              title: '提交申请',
              status: 'finish',
              icon: <CheckCircleOutlined />
            },
            {
              title: '补充材料',
              status: 'process',
              icon: <FileTextOutlined />
            },
            {
              title: '秘书审核',
              status: 'wait',
              icon: <FileTextOutlined />
            },
            {
              title: '主任确认',
              status: 'wait',
              icon: <CheckCircleOutlined />
            }
          ]}
        />
      </Card>

      {/* 患者信息 */}
      <Card
        size="small"
        title={
          <Space>
            <FileTextOutlined />
            <span>患者信息</span>
          </Space>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <Text type="secondary">姓名：</Text>
            <Text strong>{consultation.patientName}</Text>
          </div>
          <div>
            <Text type="secondary">住院号：</Text>
            <Text>{consultation.patientInpatientNo}</Text>
          </div>
          <div>
            <Text type="secondary">申请科室：</Text>
            <Text>{consultation.department}</Text>
          </div>
          <div>
            <Text type="secondary">申请医生：</Text>
            <Text>{consultation.applyDoctor}</Text>
          </div>
          <div className="col-span-2">
            <Text type="secondary">主要诊断：</Text>
            <Text type="danger">{consultation.mainDiagnosis}</Text>
          </div>
        </div>
        {patient && (
          <div className="mt-3">
            <Button
              type="link"
              onClick={() => {}}
              icon={<FileTextOutlined />}
            >
              查看完整患者信息
            </Button>
          </div>
        )}
      </Card>

      {/* 已提交的材料 */}
      {consultation.uploadedFiles && consultation.uploadedFiles.length > 0 && (
        <Card
          size="small"
          title={
            <Space>
              <FileTextOutlined />
              <span>已提交的材料</span>
            </Space>
          }
        >
          <div className="space-y-2">
            {consultation.uploadedFiles.map(file => (
              <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <Space>
                  <FileTextOutlined className={file.fromHIS ? 'text-green-600' : 'text-blue-600'} />
                  <Text>{file.fileName}</Text>
                  {file.fromHIS && (
                    <Tag color="green">HIS</Tag>
                  )}
                </Space>
                <Text type="secondary">
                  {new Date(file.uploadTime).toLocaleString()}
                </Text>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 材料上传 */}
      <Card
        title={
          <Space>
            <span>补充材料</span>
            <Button
              type="primary"
              icon={<DatabaseOutlined />}
              onClick={handleHISDataSync}
              loading={loading}
              size="small"
            >
              {hisDataSynced ? '已同步 HIS' : '从 HIS 同步'}
            </Button>
          </Space>
        }
      >
        <MaterialUpload
          patient={patient}
          uploadedFiles={uploadedFiles}
          medicalRecords={medicalRecords}
          onFilesChange={setUploadedFiles}
          onMedicalRecordsChange={setMedicalRecords}
          hisDataSynced={hisDataSynced}
          onHISDataSync={handleHISDataSync}
        />
      </Card>

      {/* 提交按钮 */}
      <div className="flex justify-center gap-4 pt-4">
        <Button size="large" onClick={() => navigate(-1)}>
          暂不提交
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<CheckCircleOutlined />}
          onClick={handleSubmit}
          disabled={uploadedFiles.length === 0 && !hisDataSynced}
        >
          提交补充材料
        </Button>
      </div>
    </div>
  )
}
