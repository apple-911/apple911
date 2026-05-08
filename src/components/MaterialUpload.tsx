import { useState } from 'react'
import { Card, Upload, Button, Table, Space, Tag, message, Modal, Progress, Tabs, Input, Alert, Spin } from 'antd'
import {
  UploadOutlined,
  DeleteOutlined,
  FileTextOutlined,
  PictureOutlined,
  FilePdfOutlined,
  DatabaseOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import type { UploadFile } from 'antd'
import type { UploadedFile } from '../stores/consultationStore'
import { Patient } from '../stores/consultationStore'
import type { UploadProps } from 'antd'

const { TextArea } = Input
const { Dragger } = Upload

interface MaterialUploadProps {
  patient: Patient | null
  uploadedFiles?: UploadedFile[]
  medicalRecords?: any
  onFilesChange?: (files: UploadedFile[]) => void
  onMedicalRecordsChange?: (records: any) => void
  hisDataSynced?: boolean
  onHISDataSync?: () => Promise<void>
}

export default function MaterialUpload({
  patient,
  uploadedFiles = [],
  medicalRecords = {},
  onFilesChange,
  onMedicalRecordsChange,
  hisDataSynced = false,
  onHISDataSync
}: MaterialUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>(uploadedFiles.map(f => ({
    uid: f.id,
    name: f.fileName,
    status: 'done',
    url: f.uploadUrl
  })))

  // HIS 数据同步
  const handleHISDataSync = async () => {
    if (!patient) {
      message.warning('请先选择患者')
      return
    }

    try {
      await onHISDataSync?.()
      message.success('HIS 数据同步成功！')
    } catch (error) {
      message.error('HIS 数据同步失败，请重试')
    }
  }

  // 文件上传处理
  const handleUploadChange = ({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setFileList(newFileList)
  }

  const handleRemove = (file: UploadFile) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除文件 "${file.name}" 吗？`,
      onOk: () => {
        const newFiles = uploadedFiles.filter(f => f.id !== file.uid)
        onFilesChange?.(newFiles)
        setFileList(fileList.filter(f => f.uid !== file.uid))
        message.success('文件已删除')
      }
    })
  }

  // 根据文件名判断文件类型
  const getFileType = (fileName: string): UploadedFile['fileType'] => {
    const lowerName = fileName.toLowerCase()
    if (lowerName.includes('病理') || lowerName.includes('biopsy') || lowerName.includes('pathology')) {
      return '病理报告'
    }
    if (lowerName.includes('ct') || lowerName.includes('mri') || lowerName.includes('x 光') || lowerName.includes('影像')) {
      return '影像资料'
    }
    if (lowerName.includes('检验') || lowerName.includes('lab') || lowerName.includes('blood')) {
      return '检验报告'
    }
    if (lowerName.includes('检查') || lowerName.includes('report')) {
      return '检查报告'
    }
    if (lowerName.includes('病历') || lowerName.includes('medical') || lowerName.includes('record')) {
      return '病历'
    }
    return '其他'
  }

  // 获取文件图标
  const getFileIcon = (fileName: string) => {
    const lowerName = fileName.toLowerCase()
    if (lowerName.endsWith('.pdf')) return <FilePdfOutlined className="text-red-500" />
    if (['.jpg', '.jpeg', '.png', '.gif', '.bmp'].some(ext => lowerName.endsWith(ext))) {
      return <PictureOutlined className="text-blue-500" />
    }
    return <FileTextOutlined className="text-gray-500" />
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    onChange: handleUploadChange,
    customRequest: async (options: any) => {
      const { file, onSuccess, onError } = options
      try {
        // 模拟文件上传
        await new Promise(resolve => setTimeout(resolve, 1000))
        onSuccess?.(file)
        return true
      } catch (error) {
        onError?.(error)
        return false
      }
    },
    onRemove: handleRemove,
    accept: '.pdf,.jpg,.jpeg,.png,.gif,.bmp,.doc,.docx,.xls,.xlsx',
    maxCount: 20,
    beforeUpload: (file: UploadFile) => {
      const isLt50M = (file.size || 0) / 1024 / 1024 < 50
      if (!isLt50M) {
        message.error('文件大小不能超过 50MB！')
        return false
      }
      return true
    }
  }

  const filesByType = uploadedFiles.reduce((acc, file) => {
    if (!acc[file.fileType]) {
      acc[file.fileType] = []
    }
    acc[file.fileType].push(file)
    return acc
  }, {} as Record<string, UploadedFile[]>)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* 病历资料录入 */}
      <Card size="small" title={<Space><FileTextOutlined />病历资料录入</Space>}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">主诉</label>
            <TextArea
              rows={2}
              value={medicalRecords?.chiefComplaint || ''}
              onChange={(e) => onMedicalRecordsChange?.({ ...medicalRecords, chiefComplaint: e.target.value })}
              placeholder="患者主要症状或体征 + 持续时间"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">现病史</label>
            <TextArea
              rows={4}
              value={medicalRecords?.presentIllness || ''}
              onChange={(e) => onMedicalRecordsChange?.({ ...medicalRecords, presentIllness: e.target.value })}
              placeholder="详细描述疾病发生、发展、演变过程"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">既往史</label>
            <TextArea
              rows={3}
              value={medicalRecords?.pastHistory || ''}
              onChange={(e) => onMedicalRecordsChange?.({ ...medicalRecords, pastHistory: e.target.value })}
              placeholder="既往健康状况、疾病史、手术史等"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">体格检查</label>
            <TextArea
              rows={3}
              value={medicalRecords?.physicalExamination || ''}
              onChange={(e) => onMedicalRecordsChange?.({ ...medicalRecords, physicalExamination: e.target.value })}
              placeholder="生命体征、系统查体等"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">辅助检查</label>
            <TextArea
              rows={3}
              value={medicalRecords?.auxiliaryExamination || ''}
              onChange={(e) => onMedicalRecordsChange?.({ ...medicalRecords, auxiliaryExamination: e.target.value })}
              placeholder="实验室检查、影像学检查等结果"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">初步诊断</label>
            <TextArea
              rows={2}
              value={medicalRecords?.initialDiagnosis || ''}
              onChange={(e) => onMedicalRecordsChange?.({ ...medicalRecords, initialDiagnosis: e.target.value })}
              placeholder="初步临床诊断"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">治疗方案</label>
            <TextArea
              rows={3}
              value={medicalRecords?.treatmentPlan || ''}
              onChange={(e) => onMedicalRecordsChange?.({ ...medicalRecords, treatmentPlan: e.target.value })}
              placeholder="已采取或计划的治疗方案"
            />
          </div>
        </div>
      </Card>

      {/* 文件上传 */}
      <Card size="small" title={<Space><UploadOutlined />上传附件材料</Space>}>
        <Dragger {...uploadProps} disabled={uploading}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined className="text-blue-500" />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持 PDF、图片、Word、Excel 等格式，单个文件不超过 50MB，最多上传 20 个文件
          </p>
        </Dragger>

        {uploadedFiles.length > 0 && (
          <div className="mt-4">
            <Tabs
              type="card"
              size="small"
              items={Object.keys(filesByType).map(type => ({
                key: type,
                label: (
                  <Space>
                    <span>{type}</span>
                    <Tag color="blue">{filesByType[type].length}</Tag>
                  </Space>
                ),
                children: (
                  <Table
                    columns={[
                      {
                        title: '文件名',
                        dataIndex: 'fileName',
                        key: 'fileName',
                        render: (text: string, record: UploadedFile) => (
                          <Space>
                            {getFileIcon(text)}
                            <span>{text}</span>
                            {record.fromHIS && (
                              <Tag color="green" icon={<DatabaseOutlined />}>HIS</Tag>
                            )}
                          </Space>
                        )
                      },
                      {
                        title: '文件大小',
                        dataIndex: 'fileSize',
                        key: 'fileSize',
                        render: (bytes: number) => formatFileSize(bytes)
                      },
                      {
                        title: '上传时间',
                        dataIndex: 'uploadTime',
                        key: 'uploadTime',
                        render: (time: string) => new Date(time).toLocaleString()
                      },
                      {
                        title: '操作',
                        key: 'action',
                        width: 100,
                        render: (_: any, record: UploadedFile) => (
                          <Space>
                            <Button
                              type="link"
                              size="small"
                              icon={<DeleteOutlined />}
                              danger
                              onClick={() => handleRemove({ uid: record.id, name: record.fileName } as UploadFile)}
                            >
                              删除
                            </Button>
                          </Space>
                        )
                      }
                    ]}
                    dataSource={filesByType[type]}
                    rowKey="id"
                    size="small"
                    pagination={false}
                  />
                )
              }))}
            />
          </div>
        )}
      </Card>
    </div>
  )
}
