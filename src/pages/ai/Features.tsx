/**
 * AI 功能汇总页面
 * 
 * 展示所有 AI 功能的入口和统计信息
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Typography, Statistic, Progress, Tag, Space, Button, Alert } from 'antd'
import {
  ThunderboltOutlined,
  RobotOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

export default function AIFeatures() {
  const navigate = useNavigate()

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <Space>
          <ThunderboltOutlined style={{ fontSize: 24, color: '#faad14' }} />
          <Title level={4} style={{ margin: 0 }}>AI 智能功能</Title>
        </Space>
      </div>

      {/* 重要提示 */}
      <Alert
        type="info"
        message={
          <div>
            <Text strong>AI 功能说明：</Text>
            <Paragraph style={{ margin: '8px 0 0 0' }}>
              本系统集成 AI 技术辅助 MDT 诊疗全流程，包括患者智能筛查、会诊预诊断等功能。
              所有 AI 建议仅供参考，最终诊疗决策需经医师专业判断和 MDT 会诊讨论确定。
            </Paragraph>
          </div>
        }
        showIcon
        icon={<RobotOutlined />}
      />

      {/* AI 功能卡片 */}
      <Row gutter={[16, 16]}>
        {/* 患者筛查 */}
        <Col span={12}>
          <Card
            hoverable
            className="cursor-pointer transition-all hover:shadow-lg"
            onClick={() => navigate('/ai/screening')}
            cover={
              <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <RobotOutlined style={{ fontSize: 80, color: '#1890ff' }} />
              </div>
            }
          >
            <Card.Meta
              title={
                <Space>
                  <Text strong style={{ fontSize: 18 }}>AI 患者筛查预警</Text>
                  <Tag color="blue">热门</Tag>
                </Space>
              }
              description={
                <div className="mt-4">
                  <Paragraph type="secondary">
                    智能识别真正需要 MDT 的患者，避免医疗资源浪费。基于疾病复杂度、治疗难度、预后评估等多维度综合评分。
                  </Paragraph>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between items-center">
                      <Text type="secondary">筛查准确率</Text>
                      <Text strong>87.5%</Text>
                    </div>
                    <Progress percent={87.5} strokeColor="#1890ff" showInfo={false} />
                    
                    <div className="flex justify-between items-center mt-2">
                      <Text type="secondary">敏感度</Text>
                      <Text strong>94.4%</Text>
                    </div>
                    <Progress percent={94.4} strokeColor="#52c41a" showInfo={false} />
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <Space>
                      <Tag color="green">
                        <CheckCircleOutlined /> 减少无效会诊
                      </Tag>
                      <Tag color="orange">
                        <WarningOutlined /> 智能预警
                      </Tag>
                    </Space>
                    <Button type="link" icon={<ArrowRightOutlined />}>
                      进入
                    </Button>
                  </div>
                </div>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* 使用指南 */}
      <Card title="使用指南" size="small">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card type="inner" title="患者筛查使用流程" size="small">
              <ol style={{ paddingLeft: 20, margin: 0 }}>
                <li>患者入院时自动触发 AI 筛查</li>
                <li>AI 评估 MDT 必要性并生成评分</li>
                <li>评分≥60 分生成预警推送至医师</li>
                <li>医师审核预警，决定是否安排 MDT</li>
                <li>可在患者 360 视图查看实时评估</li>
              </ol>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 统计数据 */}
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="累计筛查患者"
              value={1250}
              suffix="人次"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="MDT 建议率"
              value={18.5}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Statistic
              title="平均会诊时间缩短"
              value={25}
              suffix="%"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
