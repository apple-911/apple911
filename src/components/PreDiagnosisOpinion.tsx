/**
 * 会诊预诊断意见组件
 * 
 * 在会诊前展示 AI 生成的预诊断意见，帮助医师准备会诊
 */

import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Progress, 
  List, 
  Collapse, 
  Button,
  Divider,
  Space,
  Descriptions,
  Alert,
  Badge,
  Spin,
  message,
  Modal,
  Tooltip
} from 'antd'
import {
  MedicineBoxOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  BookOutlined,
  DownloadOutlined,
  ReloadOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons'
import type { AIPreDiagnosisOpinion } from '../services/integration/ai/aiPreDiagnosisService'
import aiPreDiagnosisService from '../services/integration/ai/aiPreDiagnosisService'

const { Title, Text, Paragraph } = Typography
const { Panel } = Collapse

interface PreDiagnosisOpinionProps {
  consultationId: string
  patientId: string
  requestingDepartment: string
  consultingDepartments: string[]
  onConfirmDiagnosis?: (diagnosis: string) => void
  onAddComment?: (comment: string) => void
  autoRefresh?: boolean
  refreshInterval?: number // 分钟
}

export default function PreDiagnosisOpinion({
  consultationId,
  patientId,
  requestingDepartment,
  consultingDepartments,
  onConfirmDiagnosis,
  onAddComment,
  autoRefresh = true,
  refreshInterval = 15
}: PreDiagnosisOpinionProps) {
  const [loading, setLoading] = useState(true)
  const [opinion, setOpinion] = useState<AIPreDiagnosisOpinion | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [exportVisible, setExportVisible] = useState(false)

  // 加载预诊断意见
  const loadOpinion = async () => {
    setLoading(true)
    try {
      const data = await aiPreDiagnosisService.generatePreDiagnosis({
        consultationId,
        patientId,
        requestingDepartment,
        consultingDepartments,
        patientInfo: {
          // 这些信息应该从会诊申请中获取
          age: 65,
          gender: '男',
          chiefComplaint: '反复咳嗽、咳痰 3 个月，加重 1 周',
          historyOfPresentIllness: '...',
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
      setOpinion(data)
    } catch (error) {
      console.error('加载预诊断意见失败:', error)
      message.error('加载预诊断意见失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOpinion()
    
    // 自动刷新
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadOpinion()
      }, refreshInterval * 60 * 1000)
      
      return () => clearInterval(interval)
    }
  }, [consultationId, autoRefresh, refreshInterval])

  // 获取置信度颜色
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return '#52c41a'
    if (confidence >= 60) return '#faad14'
    return '#ff4d4f'
  }

  // 获取证据级别颜色
  const getEvidenceLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      'I': 'green',
      'II': 'blue',
      'III': 'orange',
      'IV': 'gold',
      'V': 'default'
    }
    return colors[level] || 'default'
  }

  // 导出报告
  const handleExport = async (format: 'pdf' | 'word' | 'html') => {
    try {
      const result = await aiPreDiagnosisService.exportPreDiagnosisReport({
        consultationId,
        format,
        includeEvidence: true,
        includeImages: true
      })
      
      // 下载文件
      window.open(result.downloadUrl)
      message.success('报告导出成功')
      setExportVisible(false)
    } catch (error) {
      message.error('报告导出失败')
    }
  }

  // 渲染综合建议卡片
  const renderIntegratedRecommendations = () => {
    if (!opinion?.integratedRecommendations) return null

    const { mostLikelyDiagnosis, treatmentStrategy, priorityIssues, mdctCollaboration } = opinion.integratedRecommendations

    return (
      <Card 
        title={<><ThunderboltOutlined /> 综合建议</>} 
        size="small"
        style={{ marginBottom: 16 }}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card type="inner" title="最可能的诊断" size="small">
              <div style={{ marginBottom: 12 }}>
                <Title level={4} style={{ marginBottom: 8 }}>
                  {mostLikelyDiagnosis.diagnosis}
                  <Tag color={getConfidenceColor(mostLikelyDiagnosis.confidence)} style={{ marginLeft: 8 }}>
                    置信度 {mostLikelyDiagnosis.confidence}%
                  </Tag>
                </Title>
                {mostLikelyDiagnosis.staging && (
                  <Text type="secondary">分期：{mostLikelyDiagnosis.staging}</Text>
                )}
              </div>
              
              <Text type="secondary">诊断依据：</Text>
              <List
                size="small"
                dataSource={mostLikelyDiagnosis.basis}
                renderItem={(item, index) => (
                  <List.Item>
                    <Text>{index + 1}. {item}</Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col span={12}>
            <Card type="inner" title="推荐治疗策略" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="治疗目标">
                  <Tag color="blue">
                    {treatmentStrategy.approach === 'curative' ? '根治性' : 
                     treatmentStrategy.approach === 'palliative' ? '姑息性' :
                     treatmentStrategy.approach === 'neoadjuvant' ? '新辅助' : '辅助'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="治疗顺序">
                  <Space>
                    {treatmentStrategy.sequence.map((step, index) => (
                      <Tag key={index}>{step}</Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="时间规划">
                  {treatmentStrategy.timeline}
                </Descriptions.Item>
              </Descriptions>

              <Divider style={{ margin: '12px 0' }} />
              
              <Text type="secondary">治疗目标：</Text>
              <List
                size="small"
                dataSource={treatmentStrategy.goals}
                renderItem={(item, index) => (
                  <List.Item>
                    <Text>{index + 1}. {item}</Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col span={24}>
            <Card type="inner" title="需优先解决的问题" size="small">
              <List
                dataSource={priorityIssues}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Badge status={
                            item.urgency === 'immediate' ? 'processing' :
                            item.urgency === 'urgent' ? 'error' :
                            item.urgency === 'important' ? 'warning' : 'success'
                          } />
                          <Text strong>{item.issue}</Text>
                          <Tag color={
                            item.urgency === 'immediate' ? 'red' :
                            item.urgency === 'urgent' ? 'orange' :
                            item.urgency === 'important' ? 'blue' : 'default'
                          }>
                            {item.urgency === 'immediate' ? '立即' :
                             item.urgency === 'urgent' ? '紧急' :
                             item.urgency === 'important' ? '重要' : '常规'}
                          </Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <Text type="secondary">理由：{item.rationale}</Text>
                          <br />
                          <Text type="success">建议：{item.suggestedAction}</Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col span={24}>
            <Card type="inner" title="多学科协作建议" size="small">
              <Descriptions column={2} size="small">
                <Descriptions.Item label="牵头科室">
                  <Tag color="purple">{mdctCollaboration.leadDepartment}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="协作科室">
                  <Space>
                    {mdctCollaboration.supportingDepartments.map((dept, index) => (
                      <Tag key={index}>{dept}</Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              </Descriptions>

              <Divider style={{ margin: '12px 0' }} />
              
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Text type="secondary">协作要点：</Text>
                  <List
                    size="small"
                    dataSource={mdctCollaboration.coordinationPoints}
                    renderItem={(item, index) => (
                      <List.Item>
                        <Text>{index + 1}. {item}</Text>
                      </List.Item>
                    )}
                  />
                </Col>
                <Col span={12}>
                  <Text type="secondary">潜在冲突：</Text>
                  <List
                    size="small"
                    dataSource={mdctCollaboration.potentialConflicts}
                    renderItem={(item, index) => (
                      <List.Item>
                        <Text type="warning">{index + 1}. {item}</Text>
                      </List.Item>
                    )}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Card>
    )
  }

  // 渲染会诊科室意见
  const renderDepartmentOpinions = () => {
    if (!opinion?.consultingDepartments) return null

    const filteredOpinions = selectedDepartment === 'all' 
      ? opinion.consultingDepartments 
      : opinion.consultingDepartments.filter(d => d.department === selectedDepartment)

    return (
      <Card 
        title={<><MedicineBoxOutlined /> 会诊科室意见</>} 
        size="small"
        style={{ marginBottom: 16 }}
        extra={
          <Space>
            <Tag.CheckableTag
              checked={selectedDepartment === 'all'}
              onChange={() => setSelectedDepartment('all')}
            >
              全部
            </Tag.CheckableTag>
            {opinion.consultingDepartments.map(d => (
              <Tag.CheckableTag
                key={d.department}
                checked={selectedDepartment === d.department}
                onChange={() => setSelectedDepartment(d.department)}
              >
                {d.department}
              </Tag.CheckableTag>
            ))}
          </Space>
        }
      >
        {filteredOpinions.map((deptOpinion, index) => (
          <Collapse key={index} style={{ marginBottom: 12 }}>
            <Panel 
              header={
                <Space>
                  <Text strong>{deptOpinion.department}</Text>
                  <Tag color={getConfidenceColor(90)}>
                    置信度 90%
                  </Tag>
                </Space>
              }
              key={index}
            >
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Card type="inner" title="诊断分析" size="small">
                    <Paragraph>
                      <Text type="secondary">评估：</Text>
                      {deptOpinion.opinion.diagnosisAnalysis.assessment}
                    </Paragraph>

                    <Divider style={{ margin: '12px 0' }} />

                    <Text type="secondary">鉴别诊断：</Text>
                    <List
                      size="small"
                      dataSource={deptOpinion.opinion.diagnosisAnalysis.differentialDiagnosis}
                      renderItem={(item, idx) => (
                        <List.Item>
                          <List.Item.Meta
                            title={
                              <Space>
                                <Text strong>{item.diagnosis}</Text>
                                <Tag color={getConfidenceColor(item.probability)}>
                                  {item.probability}%
                                </Tag>
                                <Tag>{item.icd10}</Tag>
                              </Space>
                            }
                            description={
                              <div>
                                <Text type="secondary">理由：{item.reasoning}</Text>
                                <br />
                                <Text type="success">支持证据：{item.supportingEvidence.join('、')}</Text>
                                {item.contradictingEvidence.length > 0 && (
                                  <>
                                    <br />
                                    <Text type="danger">反对证据：{item.contradictingEvidence.join('、')}</Text>
                                  </>
                                )}
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />

                    <Divider style={{ margin: '12px 0' }} />

                    <Row gutter={16}>
                      <Col span={12}>
                        <Text type="secondary">关键发现：</Text>
                        <List
                          size="small"
                          dataSource={deptOpinion.opinion.diagnosisAnalysis.keyFindings}
                          renderItem={(item, idx) => (
                            <List.Item>
                              <Space>
                                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                <Text>{item}</Text>
                              </Space>
                            </List.Item>
                          )}
                        />
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">缺失信息：</Text>
                        <List
                          size="small"
                          dataSource={deptOpinion.opinion.diagnosisAnalysis.missingInformation}
                          renderItem={(item, idx) => (
                            <List.Item>
                              <Space>
                                <WarningOutlined style={{ color: '#faad14' }} />
                                <Text>{item}</Text>
                              </Space>
                            </List.Item>
                          )}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>

                <Col span={24}>
                  <Card type="inner" title="治疗建议" size="small">
                    <Paragraph>
                      <Text type="secondary">主要推荐：</Text>
                      <Text strong>{deptOpinion.opinion.treatmentRecommendations.primaryRecommendation}</Text>
                    </Paragraph>

                    {deptOpinion.opinion.treatmentRecommendations.alternatives.length > 0 && (
                      <Paragraph>
                        <Text type="secondary">替代方案：</Text>
                        {deptOpinion.opinion.treatmentRecommendations.alternatives.join('、')}
                      </Paragraph>
                    )}

                    {deptOpinion.opinion.treatmentRecommendations.contraindications.length > 0 && (
                      <Alert
                        type="warning"
                        message="禁忌证"
                        description={deptOpinion.opinion.treatmentRecommendations.contraindications.join('、')}
                        style={{ marginTop: 8 }}
                      />
                    )}

                    <Divider style={{ margin: '12px 0' }} />

                    <Descriptions column={2} size="small">
                      <Descriptions.Item label="证据级别">
                        <Tag color={getEvidenceLevelColor(deptOpinion.opinion.treatmentRecommendations.evidenceLevel)}>
                          {deptOpinion.opinion.treatmentRecommendations.evidenceLevel}级
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="指南">
                        {deptOpinion.opinion.treatmentRecommendations.guideline}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </Col>

                <Col span={24}>
                  <Card type="inner" title="检查建议" size="small">
                    <List
                      dataSource={deptOpinion.opinion.examRecommendations}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <Badge 
                                status={
                                  item.priority === 'urgent' ? 'error' :
                                  item.priority === 'important' ? 'warning' : 'success'
                                }
                              />
                            }
                            title={
                              <Space>
                                <Tag>{
                                  item.examType === 'lab' ? '实验室检查' :
                                  item.examType === 'imaging' ? '影像学检查' :
                                  item.examType === 'pathology' ? '病理检查' :
                                  item.examType === 'function' ? '功能检查' : '基因检测'
                                }</Tag>
                                <Text strong>{item.examName}</Text>
                                <Tag color={
                                  item.priority === 'urgent' ? 'red' :
                                  item.priority === 'important' ? 'orange' : 'default'
                                }>
                                  {item.priority === 'urgent' ? '紧急' :
                                   item.priority === 'important' ? '重要' : '可选'}
                                </Tag>
                              </Space>
                            }
                            description={
                              <div>
                                <Text type="secondary">目的：{item.purpose}</Text>
                                <br />
                                <Text type="success">预期发现：{item.expectedFindings}</Text>
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>

                <Col span={24}>
                  <Card type="inner" title="专科评估" size="small">
                    <Row gutter={16}>
                      <Col span={8}>
                        <Text type="secondary">评估要点：</Text>
                        <List
                          size="small"
                          dataSource={deptOpinion.opinion.specialtyAssessment.keyPoints}
                          renderItem={(item, idx) => (
                            <List.Item>
                              <Text>{idx + 1}. {item}</Text>
                            </List.Item>
                          )}
                        />
                      </Col>
                      <Col span={8}>
                        <Text type="warning">关注点：</Text>
                        <List
                          size="small"
                          dataSource={deptOpinion.opinion.specialtyAssessment.concerns}
                          renderItem={(item, idx) => (
                            <List.Item>
                              <Text>{idx + 1}. {item}</Text>
                            </List.Item>
                          )}
                        />
                      </Col>
                      <Col span={8}>
                        <Text type="success">机会点：</Text>
                        <List
                          size="small"
                          dataSource={deptOpinion.opinion.specialtyAssessment.opportunities}
                          renderItem={(item, idx) => (
                            <List.Item>
                              <Text>{idx + 1}. {item}</Text>
                            </List.Item>
                          )}
                        />
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </Panel>
          </Collapse>
        ))}
      </Card>
    )
  }

  // 渲染会诊讨论要点
  const renderDiscussionPoints = () => {
    if (!opinion?.discussionPoints) return null

    return (
      <Card 
        title={<><QuestionCircleOutlined /> 会诊讨论要点</>} 
        size="small"
        style={{ marginBottom: 16 }}
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card type="inner" title="关键问题" size="small">
              <List
                dataSource={opinion.discussionPoints.keyQuestions}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag color={
                            item.importance === 'critical' ? 'red' :
                            item.importance === 'important' ? 'orange' : 'default'
                          }>
                            {item.importance === 'critical' ? '关键' :
                             item.importance === 'important' ? '重要' : '可选'}
                          </Tag>
                          <Tag>{
                            item.category === 'diagnosis' ? '诊断' :
                            item.category === 'treatment' ? '治疗' :
                            item.category === 'prognosis' ? '预后' : '支持治疗'
                          }</Tag>
                          <Text strong>{item.question}</Text>
                        </Space>
                      }
                      description={item.background}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col span={24}>
            <Card type="inner" title="潜在争议点" size="small">
              <List
                dataSource={opinion.discussionPoints.potentialControversies}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<Text strong>{item.topic}</Text>}
                      description={
                        <div>
                          {item.differentViewpoints.map((viewpoint, idx) => (
                            <div key={idx} style={{ marginBottom: 8 }}>
                              <Tag>{viewpoint.perspective}</Tag>
                              <Text type="secondary">{viewpoint.rationale}</Text>
                              <br />
                              <Text type="success">证据：{viewpoint.evidence}</Text>
                            </div>
                          ))}
                          <Divider style={{ margin: '8px 0' }} />
                          <Text type="secondary">建议解决方案：{item.suggestedResolution}</Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col span={24}>
            <Card type="inner" title="决策难点" size="small">
              <List
                dataSource={opinion.discussionPoints.decisionChallenges}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<Text strong>{item.challenge}</Text>}
                      description={
                        <div>
                          <Text type="secondary">影响因素：{item.factors.join('、')}</Text>
                          <br />
                          <Text type="warning">权衡：{item.tradeOffs.join('、')}</Text>
                          <br />
                          <Text type="success">推荐方法：{item.recommendedApproach}</Text>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    )
  }

  // 渲染循证医学证据
  const renderEvidence = () => {
    if (!opinion?.evidence) return null

    return (
      <Card 
        title={<><BookOutlined /> 循证医学证据</>} 
        size="small"
        style={{ marginBottom: 16 }}
      >
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card type="inner" title="相关指南" size="small">
              <List
                dataSource={opinion.evidence.guidelines}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{item.title}</Text>
                          <Tag>{item.organization}</Tag>
                          <Tag>{item.year}</Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <Text type="secondary">相关性：{item.relevance}%</Text>
                          <br />
                          <Text type="success">关键推荐：{item.keyRecommendations.join('、')}</Text>
                          {item.url && (
                            <>
                              <br />
                              <a href={item.url} target="_blank" rel="noopener noreferrer">
                                查看指南
                              </a>
                            </>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col span={12}>
            <Card type="inner" title="关键研究" size="small">
              <List
                dataSource={opinion.evidence.keyStudies}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{item.title}</Text>
                          <Tag>{item.journal}</Tag>
                          <Tag>{item.year}</Tag>
                        </Space>
                      }
                      description={
                        <div>
                          <Text type="secondary">发现：{item.findings}</Text>
                          <br />
                          <Text type="success">相关性：{item.relevance}</Text>
                          {item.doi && (
                            <>
                              <br />
                              <Text type="secondary">DOI: {item.doi}</Text>
                            </>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    )
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Spin size="large" tip="正在生成 AI 预诊断意见..." />
      </div>
    )
  }

  if (!opinion) {
    return (
      <Alert
        type="warning"
        message="未生成预诊断意见"
        description="AI 未能生成预诊断意见，请提供更多临床信息或手动进行会诊"
        showIcon
      />
    )
  }

  return (
    <div>
      {/* 顶部信息栏 */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col span={16}>
            <Space>
              <Title level={5} style={{ margin: 0 }}>
                AI 预诊断意见
              </Title>
              <Tag color="blue">
                整体置信度：{opinion.confidence.overall}%
              </Tag>
              <Tag color={getConfidenceColor(opinion.confidence.overall)}>
                {opinion.confidence.overall >= 80 ? '高' : 
                 opinion.confidence.overall >= 60 ? '中' : '低'}
              </Tag>
            </Space>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <Space>
              <Tooltip title="刷新">
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={loadOpinion}
                  size="small"
                />
              </Tooltip>
              <Tooltip title="导出报告">
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => setExportVisible(true)}
                  size="small"
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>
        
        <Alert
          type="info"
          message="重要提示"
          description={
            <span>
              本意见由 AI 生成，仅供参考，不能替代医师的专业判断。
              最终诊断和治疗方案需经 MDT 会诊讨论确定。
            </span>
          }
          style={{ marginTop: 12 }}
          showIcon
        />
      </Card>

      {/* 综合建议 */}
      {renderIntegratedRecommendations()}

      {/* 会诊科室意见 */}
      {renderDepartmentOpinions()}

      {/* 会诊讨论要点 */}
      {renderDiscussionPoints()}

      {/* 循证医学证据 */}
      {renderEvidence()}

      {/* 导出报告弹窗 */}
      <Modal
        title="导出预诊断报告"
        visible={exportVisible}
        onCancel={() => setExportVisible(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button 
            block 
            size="large"
            onClick={() => handleExport('pdf')}
            icon={<FileTextOutlined />}
          >
            导出为 PDF
          </Button>
          <Button 
            block 
            size="large"
            onClick={() => handleExport('word')}
            icon={<FileTextOutlined />}
          >
            导出为 Word
          </Button>
          <Button 
            block 
            size="large"
            onClick={() => handleExport('html')}
            icon={<FileTextOutlined />}
          >
            导出为 HTML
          </Button>
        </Space>
      </Modal>
    </div>
  )
}
