/**
 * AI 患者筛查页面
 * 
 * 展示所有 AI 筛查出的需要 MDT 会诊的患者
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Typography, Space, Tooltip, Result, Button } from 'antd'
import { ThunderboltOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import PatientScreeningAlerts from '../../components/PatientScreeningAlerts'
import { hasPermission } from '../../utils/helpers'

const { Title } = Typography

export default function AIScreening() {
  const navigate = useNavigate()

  // 权限检查
  if (!hasPermission('perm-ai-screening')) {
    return (
      <Result
        status="403"
        title="暂无权限"
        subTitle="抱歉，您没有权限访问AI患者筛查。如需获取权限，请联系系统管理员。"
        extra={<Button type="primary" onClick={() => navigate(-1)}>返回</Button>}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <Space>
          <ThunderboltOutlined style={{ fontSize: 24, color: '#faad14' }} />
          <Title level={4} style={{ margin: 0 }}>AI 患者 MDT 需求筛查</Title>
          <Tooltip 
            title={
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: 8 }}>AI 智能筛查说明</div>
                <div>系统基于患者病情复杂度、治疗难度、预后等因素自动评估 MDT 需求：</div>
                <div style={{ marginTop: 4 }}>• 评分≥80 分：强烈推荐 MDT</div>
                <div>• 60-79 分：推荐 MDT</div>
                <div>• 40-59 分：可考虑 MDT</div>
                <div>• &lt;40 分：不推荐 MDT</div>
                <div style={{ marginTop: 8, fontStyle: 'italic', color: '#999' }}>
                  所有 AI 建议仅供参考，最终决策需由医师判断。
                </div>
              </div>
            }
            placement="right"
          >
            <QuestionCircleOutlined 
              style={{ fontSize: 16, color: '#1890ff', cursor: 'pointer', marginLeft: 8 }} 
            />
          </Tooltip>
        </Space>
      </div>

      {/* 筛查列表 */}
      <Card>
        <PatientScreeningAlerts />
      </Card>
    </div>
  )
}
