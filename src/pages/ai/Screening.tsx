/**
 * AI 患者筛查页面
 * 
 * 展示所有 AI 筛查出的需要 MDT 会诊的患者
 */

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Typography, Space, Tooltip } from 'antd'
import { ThunderboltOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import PatientScreeningAlerts from '../../components/PatientScreeningAlerts'

const { Title } = Typography

export default function AIScreening() {
  const navigate = useNavigate()

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
