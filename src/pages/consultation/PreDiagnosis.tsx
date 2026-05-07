/**
 * 会诊预诊断页面
 * 
 * 在会诊前展示 AI 生成的预诊断意见
 */

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Button, Space, Typography, message, Alert, Row, Col } from 'antd'
import { ArrowLeftOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons'
import PreDiagnosisOpinion from '../../components/PreDiagnosisOpinion'
import aiPreDiagnosisService from '../../services/integration/ai/aiPreDiagnosisService'

const { Title } = Typography

export default function ConsultationPreDiagnosis() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [consultationInfo, setConsultationInfo] = useState<any>(null)

  // 加载会诊信息
  useEffect(() => {
    loadConsultationInfo()
  }, [id])

  const loadConsultationInfo = async () => {
    setLoading(true)
    try {
      // TODO: 从后端加载会诊信息
      // 这里使用模拟数据
      setConsultationInfo({
        id,
        patientId: 'P001',
        requestingDepartment: '呼吸内科',
        consultingDepartments: ['胸外科', '肿瘤内科', '放疗科', '影像科'],
        status: 'pending'
      })
    } catch (error) {
      console.error('加载会诊信息失败:', error)
      message.error('加载会诊信息失败')
    } finally {
      setLoading(false)
    }
  }

  // 生成预诊断
  const handleGeneratePreDiagnosis = async () => {
    if (!consultationInfo) return
    
    try {
      await aiPreDiagnosisService.generatePreDiagnosis({
        consultationId: id!,
        patientId: consultationInfo.patientId,
        requestingDepartment: consultationInfo.requestingDepartment,
        consultingDepartments: consultationInfo.consultingDepartments,
        patientInfo: {
          age: 65,
          gender: '男',
          chiefComplaint: '反复咳嗽、咳痰 3 个月，加重 1 周',
          historyOfPresentIllness: '患者 3 个月前无明显诱因出现咳嗽、咳痰...',
          pastHistory: ['高血压', '2 型糖尿病'],
          currentMedications: ['硝苯地平', '二甲双胍'],
          allergies: ['青霉素']
        },
        clinicalData: {
          labResults: {},
          imagingResults: [],
          pathologyResults: []
        }
      })
      message.success('预诊断意见生成成功！')
      loadConsultationInfo()
    } catch (error) {
      console.error('生成预诊断失败:', error)
      message.error('生成预诊断失败')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '400px' }}>
        <div className="text-center">
          <div className="text-lg mb-2">正在加载会诊信息...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 顶部导航栏 */}
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col span={16}>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/consultation/my-meetings')}
              >
                返回我的待参会
              </Button>
              <Title level={4} style={{ margin: 0 }}>
                会诊预诊断 - #{id}
              </Title>
            </Space>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                type="primary"
                onClick={handleGeneratePreDiagnosis}
                disabled={!consultationInfo}
              >
                重新生成预诊断
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* AI 预诊断意见 */}
      {consultationInfo && (
        <PreDiagnosisOpinion
          consultationId={id!}
          patientId={consultationInfo.patientId}
          requestingDepartment={consultationInfo.requestingDepartment}
          consultingDepartments={consultationInfo.consultingDepartments}
          autoRefresh={true}
          refreshInterval={15}
        />
      )}

      {/* 使用说明 */}
      <Card title="使用说明" size="small">
        <Alert
          type="info"
          message={
            <div>
              <p><strong>AI 预诊断功能说明：</strong></p>
              <ul>
                <li>AI 预诊断意见在会诊申请提交后自动生成</li>
                <li>为每个会诊科室提供独立的诊断意见和治疗建议</li>
                <li>包含综合建议、会诊讨论要点和循证医学证据</li>
                <li>意见仅供参考，最终诊断需经 MDT 会诊讨论确定</li>
                <li>支持导出 PDF、Word、HTML 格式报告</li>
              </ul>
              <p><strong>使用建议：</strong></p>
              <ul>
                <li>会诊医师应在会诊前查看本科室的预诊断意见</li>
                <li>重点关注 AI 提出的关键问题和潜在争议点</li>
                <li>结合临床经验对 AI 建议进行判断</li>
                <li>在会诊讨论时可参考 AI 提供的循证医学证据</li>
              </ul>
            </div>
          }
          showIcon
        />
      </Card>
    </div>
  )
}
