import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Tabs, Descriptions, Tag, Space, Typography, Button, List, Badge, Modal, Input, message, Divider, Avatar, Timeline, Rate } from 'antd'
import { ArrowLeftOutlined, PrinterOutlined, DownloadOutlined, StarOutlined, StarFilled, UserOutlined, TeamOutlined, FileTextOutlined, MedicineBoxOutlined, CheckCircleOutlined, ClockCircleOutlined, MessageOutlined, LikeOutlined, EyeOutlined, ShareAltOutlined } from '@ant-design/icons'
import { mockMedicalCases, type MedicalCase } from '../../mocks/caseData'
import { useCaseLibraryStore } from '../../stores/caseLibraryStore'
import SmartRecommendation from '../../components/SmartRecommendation'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

interface Comment {
  id: string
  userId: string
  userName: string
  userRole: string
  content: string
  createdAt: string
  likes: number
}

export default function CaseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const caseData = mockMedicalCases.find((c) => c.id === id)
  
  const { addFavorite, removeFavorite, isFavorite, updateFavoriteNotes, addLearningProgress, addRecentView } = useCaseLibraryStore()
  const favorited = isFavorite(id || '')
  
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c1',
      userId: 'u1',
      userName: '张教授',
      userRole: '肿瘤内科',
      content: '这个病例的MDT讨论非常充分，多学科协作治疗方案制定合理，值得学习。',
      createdAt: '2025-05-10 14:30',
      likes: 5,
    },
    {
      id: 'c2',
      userId: 'u2',
      userName: '李主任',
      userRole: '胸外科',
      content: '手术方案选择得当，术后辅助治疗也很规范。建议关注长期随访数据。',
      createdAt: '2025-05-12 09:15',
      likes: 3,
    },
  ])
  const [commentVisible, setCommentVisible] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [notesVisible, setNotesVisible] = useState(false)
  const [favoriteNotes, setFavoriteNotes] = useState('')
  const [similarCases, setSimilarCases] = useState<any[]>([])
  
  useEffect(() => {
    if (id) {
      addRecentView(id)
      addLearningProgress(id, 60, '浏览病案详情')
    }
  }, [id])
  
  if (!caseData) {
    return (
      <div className="text-center py-20">
        <Title level={4}>病案不存在</Title>
        <Button onClick={() => navigate('/case-library/search')}>返回检索</Button>
      </div>
    )
  }

  const handleToggleFavorite = () => {
    if (favorited) {
      removeFavorite(id || '')
      message.success('已取消收藏')
    } else {
      addFavorite(
        id || '',
        caseData.caseTitle,
        caseData.diagnosis.primary,
        caseData.diagnosis.department,
        caseData.mdtInfo.meetingDate
      )
      message.success('收藏成功')
    }
  }

  const handleSaveNotes = () => {
    updateFavoriteNotes(id || '', favoriteNotes)
    setNotesVisible(false)
    message.success('笔记已保存')
  }

  const handleAddComment = () => {
    if (!newComment.trim()) {
      message.warning('请输入评论内容')
      return
    }
    
    const comment: Comment = {
      id: `c${Date.now()}`,
      userId: 'current',
      userName: '当前用户',
      userRole: '申请医生',
      content: newComment,
      createdAt: new Date().toLocaleString('zh-CN'),
      likes: 0,
    }
    
    setComments([comment, ...comments])
    setNewComment('')
    setCommentVisible(false)
    message.success('评论发布成功')
  }

  const tabItems = [
    {
      key: 'basic',
      label: (
        <span>
          <UserOutlined /> 基本信息
        </span>
      ),
      children: (
        <Card 
          title="基本信息" 
          size="small"
          className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200"
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="病案ID">{caseData.id}</Descriptions.Item>
            <Descriptions.Item label="会诊ID">{caseData.consultationId}</Descriptions.Item>
            <Descriptions.Item label="患者姓名">{caseData.patientInfo.name}</Descriptions.Item>
            <Descriptions.Item label="性别">{caseData.patientInfo.gender}</Descriptions.Item>
            <Descriptions.Item label="年龄">{caseData.patientInfo.age}岁</Descriptions.Item>
            <Descriptions.Item label="住院号">{caseData.patientInfo.inpatientNo}</Descriptions.Item>
            <Descriptions.Item label="申请科室" span={2}>{caseData.patientInfo.department}</Descriptions.Item>
            <Descriptions.Item label="主要诊断" span={2}>
              <Tag color="red">{caseData.diagnosis.primary}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="ICD-10编码">{caseData.diagnosis.icd10}</Descriptions.Item>
            <Descriptions.Item label="TNM分期">{caseData.diagnosis.tnmStage || '-'}</Descriptions.Item>
            {caseData.diagnosis.secondary.length > 0 && (
              <Descriptions.Item label="其他诊断" span={2}>
                <Space>
                  {caseData.diagnosis.secondary.map((d, i) => (
                    <Tag key={i}>{d}</Tag>
                  ))}
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      ),
    },
    {
      key: 'record',
      label: (
        <span>
          <MedicineBoxOutlined /> 病历资料
        </span>
      ),
      children: (
        <Card title="病历资料" size="small">
          <Tabs
            defaultActiveKey="1"
            size="small"
            items={[
              {
                key: '1',
                label: '主诉',
                children: (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded text-sm whitespace-pre-line min-h-[100px]">
                    {caseData.medicalRecord.chiefComplaint}
                  </div>
                ),
              },
              {
                key: '2',
                label: '现病史',
                children: (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded text-sm whitespace-pre-line min-h-[150px]">
                    {caseData.medicalRecord.presentIllness}
                  </div>
                ),
              },
              {
                key: '3',
                label: '既往史',
                children: (
                  <div className="p-4 bg-green-50 border border-green-200 rounded text-sm whitespace-pre-line min-h-[100px]">
                    {caseData.medicalRecord.pastHistory}
                  </div>
                ),
              },
              {
                key: '4',
                label: '体格检查',
                children: (
                  <div className="p-4 bg-cyan-50 border border-cyan-200 rounded text-sm whitespace-pre-line min-h-[100px]">
                    {caseData.medicalRecord.physicalExam}
                  </div>
                ),
              },
              {
                key: '5',
                label: '辅助检查',
                children: (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded text-sm whitespace-pre-line min-h-[150px]">
                    {caseData.medicalRecord.auxiliaryExam}
                  </div>
                ),
              },
            ]}
          />
        </Card>
      ),
    },
    {
      key: 'mdt',
      label: (
        <span>
          <TeamOutlined /> MDT会诊记录
        </span>
      ),
      children: (
        <div className="space-y-4">
          <Card 
            title="会诊信息" 
            size="small"
            className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200"
          >
            <Descriptions column={2} size="small">
              <Descriptions.Item label="会诊日期">{caseData.mdtInfo.meetingDate}</Descriptions.Item>
              <Descriptions.Item label="会诊地点">{caseData.mdtInfo.location}</Descriptions.Item>
              <Descriptions.Item label="最终方案" span={2}>
                <Tag color="green" className="text-base px-3 py-1">
                  {caseData.mdtInfo.conclusion}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="参会专家及意见" size="small">
            <List
              itemLayout="horizontal"
              dataSource={caseData.mdtInfo.experts}
              renderItem={(expert) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<UserOutlined className="text-2xl text-blue-600" />}
                    title={
                      <Space>
                        <Text strong>{expert.name}</Text>
                        <Tag color="blue">{expert.department}</Tag>
                        <Text type="secondary">{expert.title}</Text>
                      </Space>
                    }
                    description={expert.opinion}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card title="讨论记录" size="small">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded text-sm whitespace-pre-line">
              {caseData.mdtInfo.discussion}
            </div>
          </Card>
        </div>
      ),
    },
    {
      key: 'treatment',
      label: (
        <span>
          <FileTextOutlined /> 治疗方案
        </span>
      ),
      children: (
        <div className="space-y-4">
          <Card 
            title="首选方案" 
            size="small"
            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200"
          >
            <Paragraph className="text-base">{caseData.treatmentPlan.primary}</Paragraph>
          </Card>

          {caseData.treatmentPlan.alternative && (
            <Card title="备选方案" size="small">
              <Paragraph>{caseData.treatmentPlan.alternative}</Paragraph>
            </Card>
          )}

          <Card title="用药方案" size="small">
            <Space wrap>
              {caseData.treatmentPlan.medications.map((med, i) => (
                <Tag key={i} color="cyan" className="text-base px-3 py-1">
                  {med}
                </Tag>
              ))}
            </Space>
          </Card>

          {caseData.treatmentPlan.surgery && (
            <Card title="手术方案" size="small">
              <Paragraph>{caseData.treatmentPlan.surgery}</Paragraph>
            </Card>
          )}

          {caseData.treatmentPlan.radiotherapy && (
            <Card title="放疗方案" size="small">
              <Paragraph>{caseData.treatmentPlan.radiotherapy}</Paragraph>
            </Card>
          )}
        </div>
      ),
    },
    {
      key: 'followup',
      label: (
        <span>
          <ClockCircleOutlined /> 随访记录
        </span>
      ),
      children: (
        <div className="space-y-4">
          <Card size="small">
            <Descriptions>
              <Descriptions.Item label="随访状态">
                <Badge
                  status={
                    caseData.followUp.status === '已完成' ? 'success' :
                    caseData.followUp.status === '进行中' ? 'processing' : 'default'
                  }
                  text={caseData.followUp.status}
                />
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="随访记录" size="small">
            <Timeline>
              {caseData.followUp.records.map((record, index) => (
                <Timeline.Item key={index} color="blue">
                  <div className="flex justify-between items-start">
                    <div>
                      <Text strong>{record.date}</Text>
                      <div className="mt-1">
                        <Tag color="green">{record.result}</Tag>
                        <Tag>{record.survivalStatus}</Tag>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">{record.notes}</div>
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </div>
      ),
    },
    {
      key: 'quality',
      label: (
        <span>
          <CheckCircleOutlined /> 质控信息
        </span>
      ),
      children: (
        <Card 
          title="质控审核信息" 
          size="small"
          className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200"
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="质控评分">
              <Badge
                count={caseData.qualityControl.score}
                style={{
                  backgroundColor: caseData.qualityControl.score >= 95 ? '#52c41a' : '#faad14',
                  fontSize: '20px',
                  height: '32px',
                  lineHeight: '32px',
                }}
              />
            </Descriptions.Item>
            <Descriptions.Item label="审核人">{caseData.qualityControl.reviewer}</Descriptions.Item>
            <Descriptions.Item label="审核日期">{caseData.qualityControl.reviewDate}</Descriptions.Item>
            <Descriptions.Item label="审核意见" span={2}>
              {caseData.qualityControl.comments}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      ),
    },
    {
      key: 'similar',
      label: (
        <span>
          <ShareAltOutlined /> 相似病例
        </span>
      ),
      children: caseData ? (
        <SmartRecommendation
          currentCase={caseData}
          allCases={mockMedicalCases}
          limit={3}
          title="智能推荐相似病例"
        />
      ) : null,
    },
    {
      key: 'comments',
      label: (
        <span>
          <MessageOutlined /> 讨论区
        </span>
      ),
      children: (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <Text strong>专家讨论 ({comments.length})</Text>
            <Button type="primary" icon={<MessageOutlined />} onClick={() => setCommentVisible(true)}>
              发表评论
            </Button>
          </div>

          <List
            itemLayout="vertical"
            dataSource={comments}
            renderItem={(comment) => (
              <List.Item key={comment.id}>
                <List.Item.Meta
                  avatar={<Avatar style={{ backgroundColor: '#045126' }}>{comment.userName[0]}</Avatar>}
                  title={
                    <Space>
                      <Text strong>{comment.userName}</Text>
                      <Tag color="blue">{comment.userRole}</Tag>
                      <Text type="secondary" className="text-xs">{comment.createdAt}</Text>
                    </Space>
                  }
                  description={comment.content}
                />
                <div className="mt-2 flex gap-4">
                  <Space>
                    <LikeOutlined />
                    <Text type="secondary">{comment.likes}</Text>
                  </Space>
                </div>
              </List.Item>
            )}
          />

          <Modal
            title="发表评论"
            open={commentVisible}
            onCancel={() => setCommentVisible(false)}
            onOk={handleAddComment}
            okText="发布"
            cancelText="取消"
          >
            <Input.TextArea
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="请输入您的评论..."
            />
          </Modal>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/case-library/search')}>
            返回
          </Button>
          <Title level={4} className="mb-0">病案详情 - {caseData.id}</Title>
        </Space>
        <Space>
          <Button 
            icon={favorited ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />} 
            onClick={handleToggleFavorite}
            type={favorited ? 'primary' : 'default'}
          >
            {favorited ? '已收藏' : '收藏'}
          </Button>
          <Button icon={<PrinterOutlined />}>打印</Button>
          <Button type="primary" icon={<DownloadOutlined />}>导出</Button>
        </Space>
      </div>

      <div className="mb-4">
        <Space size={[0, 8]} wrap>
          {caseData.tags.includes('典型病例') && <Tag color="gold" icon={<StarOutlined />}>典型病例</Tag>}
          {caseData.tags.includes('疑难病例') && <Tag color="red">疑难病例</Tag>}
          {caseData.tags.includes('教学示范') && <Tag color="green">教学示范</Tag>}
          {caseData.tags.includes('科研价值') && <Tag color="purple">科研价值</Tag>}
        </Space>
      </div>

      <Tabs defaultActiveKey="basic" items={tabItems} size="large" />

      <Modal
        title="收藏笔记"
        open={notesVisible}
        onOk={handleSaveNotes}
        onCancel={() => setNotesVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        <Input.TextArea
          rows={4}
          value={favoriteNotes}
          onChange={(e) => setFavoriteNotes(e.target.value)}
          placeholder="添加您的学习笔记..."
        />
      </Modal>
    </div>
  )
}
