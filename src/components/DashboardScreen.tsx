import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Statistic, Progress, Table, Tag, Space, Typography, Badge } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import { Column } from '@ant-design/plots'

const { Title, Text } = Typography

interface DashboardData {
  totalConsultations: number
  ongoingConsultations: number
  pendingReview: number
  completedToday: number
  departmentStats: { name: string; value: number }[]
  expertWorkload: { name: string; value: number }[]
  qualityScore: number
  recentConsultations: any[]
}

export default function DashboardScreen() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    // 模拟加载数据
    const timer = setTimeout(() => {
      setData({
        totalConsultations: 1247,
        ongoingConsultations: 8,
        pendingReview: 23,
        completedToday: 15,
        departmentStats: [
          { name: '肿瘤科', value: 320, color: '#045126' },
          { name: '胸外科', value: 280, color: '#0d7a3d' },
          { name: '放疗科', value: 245, color: '#1890ff' },
          { name: '病理科', value: 198, color: '#40a9ff' },
          { name: '影像科', value: 204, color: '#722ed1' },
        ],
        expertWorkload: [
          { name: '张明华', value: 45, color: '#045126' },
          { name: '李建国', value: 38, color: '#0d7a3d' },
          { name: '王芳', value: 42, color: '#1890ff' },
          { name: '刘伟', value: 35, color: '#40a9ff' },
          { name: '陈静', value: 40, color: '#722ed1' },
        ],
        qualityScore: 94.5,
        recentConsultations: [
          {
            id: 'C001',
            patient: '李**',
            department: '肿瘤科',
            status: '进行中',
            startTime: '14:00',
            experts: 5,
          },
          {
            id: 'C002',
            patient: '王**',
            department: '胸外科',
            status: '待开始',
            startTime: '15:30',
            experts: 4,
          },
          {
            id: 'C003',
            patient: '张**',
            department: '放疗科',
            status: '进行中',
            startTime: '14:30',
            experts: 6,
          },
          {
            id: 'C004',
            patient: '刘**',
            department: '肿瘤科',
            status: '待审核',
            startTime: '-',
            experts: 0,
          },
        ],
      })
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <Row gutter={16}>
          {[1, 2, 3, 4].map((i) => (
            <Col span={6} key={i}>
              <Card>
                <div className="h-20 bg-gray-100 animate-pulse rounded" />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 顶部统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card 
            className="hover:shadow-lg transition-shadow duration-300"
            bodyStyle={{ padding: '20px' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">总会诊数</div>
                <div className="text-3xl font-bold" style={{ color: 'var(--xiehe-green)' }}>
                  {data.totalConsultations.toLocaleString()}
                </div>
                <div className="mt-3 flex items-center gap-1 text-sm">
                  <span className="text-red-500 flex items-center">
                    <ArrowUpOutlined className="mr-1" /> 12.5%
                  </span>
                  <span className="text-gray-400">较上月</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #045126 0%, #0d7a3d 100%)' }}>
                <TeamOutlined className="text-2xl text-white" />
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card 
            className="hover:shadow-lg transition-shadow duration-300"
            bodyStyle={{ padding: '20px' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">正在进行</div>
                <div className="text-3xl font-bold" style={{ color: '#faad14' }}>
                  {data.ongoingConsultations}
                </div>
                <div className="mt-3">
                  <Badge color="processing" text={<span className="text-sm">实时数据更新中</span>} />
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)' }}>
                <ClockCircleOutlined className="text-2xl text-white" />
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card 
            className="hover:shadow-lg transition-shadow duration-300"
            bodyStyle={{ padding: '20px' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">待审核</div>
                <div className="text-3xl font-bold" style={{ color: '#fa8c16' }}>
                  {data.pendingReview}
                </div>
                <div className="mt-3 text-sm text-gray-400">
                  需要及时处理
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fa8c16 0%, #ffc069 100%)' }}>
                <BarChartOutlined className="text-2xl text-white" />
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card 
            className="hover:shadow-lg transition-shadow duration-300"
            bodyStyle={{ padding: '20px' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="text-sm text-gray-500 mb-1">今日完成</div>
                <div className="text-3xl font-bold" style={{ color: '#52c41a' }}>
                  {data.completedToday}
                </div>
                <div className="mt-3 flex items-center gap-1 text-sm">
                  <span className="text-green-500 flex items-center">
                    <ArrowUpOutlined className="mr-1" /> 8.2%
                  </span>
                  <span className="text-gray-400">较昨日</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)' }}>
                <CheckCircleOutlined className="text-2xl text-white" />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 质控分数 */}
      <Row gutter={[16, 16]}>
        {/* 左侧：质量评分仪表盘 */}
        <Col span={6}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #045126, #0d7a3d)' }}></div>
                <span className="font-semibold">MDT 质量评分</span>
              </div>
            }
            headStyle={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}
            extra={<Text type="secondary" className="text-xs">实时评估</Text>}
            className="h-full"
          >
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative">
                <Progress
                  type="dashboard"
                  percent={data.qualityScore}
                  strokeColor={{
                    '0%': '#045126',
                    '100%': '#0d7a3d',
                  }}
                  format={(percent) => (
                    <div className="text-center">
                      <div className="text-5xl font-extrabold" style={{ color: '#045126' }}>
                        {percent}
                      </div>
                      <div className="text-sm text-gray-500 mt-2 font-medium">综合得分</div>
                    </div>
                  )}
                  strokeWidth={8}
                  width={160}
                  height={140}
                />
              </div>
              
              <div className="mt-4 w-full">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative overflow-hidden text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-shadow duration-300">
                    <div className="absolute -right-3 -top-3 w-10 h-10 bg-green-200 rounded-full opacity-20"></div>
                    <div className="text-2xl font-extrabold relative" style={{ color: '#045126' }}>A+</div>
                    <div className="text-xs text-gray-600 mt-1 relative">等级</div>
                  </div>
                  <div className="relative overflow-hidden text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-shadow duration-300">
                    <div className="absolute -right-3 -top-3 w-10 h-10 bg-blue-200 rounded-full opacity-20"></div>
                    <div className="text-2xl font-extrabold relative" style={{ color: '#1890ff' }}>TOP 5%</div>
                    <div className="text-xs text-gray-600 mt-1 relative">排名</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 w-full px-2">
                <div className="text-center">
                  <div className="text-xs text-gray-500 mb-1">质量等级</div>
                  <div className="flex justify-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-8 h-2 rounded-full ${
                          level <= 5 
                            ? 'bg-gradient-to-r from-green-500 to-green-400' 
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 mt-2">连续 5 个月保持 A+ 等级</div>
                </div>
              </div>
            </div>
          </Card>
        </Col>
        
        {/* 中间：核心指标 */}
        <Col span={10}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #045126, #0d7a3d)' }}></div>
                <span className="font-semibold">核心质控指标</span>
              </div>
            }
            headStyle={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}
            className="h-full"
          >
            <div className="space-y-5">
              {/* 指标 1 */}
              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-600 shadow-sm"></div>
                    <Text className="text-sm font-medium text-gray-700">报告完整率</Text>
                  </div>
                  <div className="text-right">
                    <Text strong className="text-xl" style={{ color: '#045126' }}>98.5%</Text>
                    <div className="text-xs text-green-600 flex items-center justify-end gap-1">
                      <ArrowUpOutlined className="font-bold" /> 2.3%
                    </div>
                  </div>
                </div>
                <Progress 
                  percent={98.5} 
                  strokeColor={{
                    '0%': '#045126',
                    '100%': '#0d7a3d',
                  }}
                  showInfo={false}
                  size="small"
                  strokeLinecap="round"
                  stroke_width={8}
                />
              </div>
              
              {/* 指标 2 */}
              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm"></div>
                    <Text className="text-sm font-medium text-gray-700">会诊及时率</Text>
                  </div>
                  <div className="text-right">
                    <Text strong className="text-xl" style={{ color: '#0d7a3d' }}>96.2%</Text>
                    <div className="text-xs text-green-600 flex items-center justify-end gap-1">
                      <ArrowUpOutlined className="font-bold" /> 1.8%
                    </div>
                  </div>
                </div>
                <Progress 
                  percent={96.2} 
                  strokeColor={{
                    '0%': '#0d7a3d',
                    '100%': '#1890ff',
                  }}
                  showInfo={false}
                  size="small"
                  strokeLinecap="round"
                  stroke_width={8}
                />
              </div>
              
              {/* 指标 3 */}
              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm"></div>
                    <Text className="text-sm font-medium text-gray-700">专家出勤率</Text>
                  </div>
                  <div className="text-right">
                    <Text strong className="text-xl" style={{ color: '#1890ff' }}>99.1%</Text>
                    <div className="text-xs text-blue-600 flex items-center justify-end gap-1">
                      <ArrowUpOutlined className="font-bold" /> 0.5%
                    </div>
                  </div>
                </div>
                <Progress 
                  percent={99.1} 
                  strokeColor={{
                    '0%': '#1890ff',
                    '100%': '#40a9ff',
                  }}
                  showInfo={false}
                  size="small"
                  strokeLinecap="round"
                  stroke_width={8}
                />
              </div>
              
              {/* 指标 4 */}
              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm"></div>
                    <Text className="text-sm font-medium text-gray-700">患者满意度</Text>
                  </div>
                  <div className="text-right">
                    <Text strong className="text-xl" style={{ color: '#40a9ff' }}>4.8</Text>
                    <div className="text-xs text-cyan-600 flex items-center justify-end gap-1">
                      <ArrowUpOutlined className="font-bold" /> 0.2
                    </div>
                  </div>
                </div>
                <Progress 
                  percent={96} 
                  strokeColor={{
                    '0%': '#40a9ff',
                    '100%': '#69c0ff',
                  }}
                  showInfo={false}
                  size="small"
                  strokeLinecap="round"
                  stroke_width={8}
                />
              </div>

              {/* 指标 5 */}
              <div className="group">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm"></div>
                    <Text className="text-sm font-medium text-gray-700">方案执行率</Text>
                  </div>
                  <div className="text-right">
                    <Text strong className="text-xl" style={{ color: '#722ed1' }}>94.7%</Text>
                    <div className="text-xs text-purple-600 flex items-center justify-end gap-1">
                      <ArrowUpOutlined className="font-bold" /> 3.1%
                    </div>
                  </div>
                </div>
                <Progress 
                  percent={94.7} 
                  strokeColor={{
                    '0%': '#722ed1',
                    '100%': '#9254de',
                  }}
                  showInfo={false}
                  size="small"
                  strokeLinecap="round"
                  stroke_width={8}
                />
              </div>
            </div>
          </Card>
        </Col>
        
        {/* 右侧：统计数据 */}
        <Col span={8}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #722ed1, #b37feb)' }}></div>
                <span className="font-semibold">质控统计</span>
              </div>
            }
            headStyle={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}
            className="h-full"
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-2xl border border-green-200 hover:shadow-md transition-shadow duration-300">
                  <div className="absolute -right-2 -top-2 w-16 h-16 bg-green-200 rounded-full opacity-20"></div>
                  <div className="flex items-center gap-2 mb-2 relative">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #045126 0%, #0d7a3d 100%)' }}>
                      <CheckCircleOutlined className="text-white text-lg" />
                    </div>
                    <Text className="text-xs text-gray-600 font-medium">优秀案例</Text>
                  </div>
                  <div className="text-3xl font-bold relative" style={{ color: '#045126' }}>156</div>
                  <div className="text-xs text-green-600 mt-2 flex items-center gap-1 relative">
                    <ArrowUpOutlined /> 12 例本月
                  </div>
                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-2xl border border-orange-200 hover:shadow-md transition-shadow duration-300">
                  <div className="absolute -right-2 -top-2 w-16 h-16 bg-orange-200 rounded-full opacity-20"></div>
                  <div className="flex items-center gap-2 mb-2 relative">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fa8c16 0%, #ffc069 100%)' }}>
                      <ClockCircleOutlined className="text-white text-lg" />
                    </div>
                    <Text className="text-xs text-gray-600 font-medium">待改进</Text>
                  </div>
                  <div className="text-3xl font-bold relative" style={{ color: '#fa8c16' }}>12</div>
                  <div className="text-xs text-orange-600 mt-2 flex items-center gap-1 relative">
                    <ArrowDownOutlined /> 3 例上月
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200 hover:shadow-md transition-shadow duration-300">
                  <div className="absolute -right-2 -top-2 w-16 h-16 bg-blue-200 rounded-full opacity-20"></div>
                  <div className="flex items-center gap-2 mb-2 relative">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)' }}>
                      <TeamOutlined className="text-white text-lg" />
                    </div>
                    <Text className="text-xs text-gray-600 font-medium">参与专家</Text>
                  </div>
                  <div className="flex items-end gap-2 relative">
                    <div>
                      <div className="text-3xl font-bold" style={{ color: '#1890ff' }}>487</div>
                      <div className="text-sm text-blue-600">人</div>
                    </div>
                    <div className="text-xs text-blue-600 mb-1 ml-auto flex items-center gap-1">
                      <ArrowUpOutlined /> 23 人本月
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-2xl border border-purple-200 hover:shadow-md transition-shadow duration-300">
                  <div className="absolute -right-2 -top-2 w-16 h-16 bg-purple-200 rounded-full opacity-20"></div>
                  <div className="flex items-center gap-2 mb-2 relative">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)' }}>
                      <BarChartOutlined className="text-white text-lg" />
                    </div>
                    <Text className="text-xs text-gray-600 font-medium">整体合格率</Text>
                  </div>
                  <div className="flex items-end gap-2 relative">
                    <div>
                      <div className="text-3xl font-bold" style={{ color: '#722ed1' }}>98.2%</div>
                      <div className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                        <ArrowUpOutlined /> 1.2%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-dashed">
                <div className="flex justify-between items-center text-sm py-2">
                  <Text type="secondary" className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    本月会诊总数
                  </Text>
                  <Text strong className="text-base" style={{ color: '#045126' }}>1,247 例</Text>
                </div>
                <div className="flex justify-between items-center text-sm py-2">
                  <Text type="secondary" className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    平均响应时间
                  </Text>
                  <Text strong className="text-base" style={{ color: '#1890ff' }}>2.3 小时</Text>
                </div>
                <div className="flex justify-between items-center text-sm py-2">
                  <Text type="secondary" className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                    专家平均工作量
                  </Text>
                  <Text strong className="text-base" style={{ color: '#722ed1' }}>45.2 次/人</Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 图表和列表 */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #0d7a3d, #1890ff)' }}></div>
                <span className="font-semibold">科室会诊量 TOP5</span>
              </div>
            }
            headStyle={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}
            bodyStyle={{ paddingTop: '16px' }}
            extra={
              <Text type="secondary" className="text-xs">
                本月累计 <Text strong style={{ color: '#0d7a3d' }}>{data.departmentStats.reduce((sum, item) => sum + item.value, 0)} 例</Text>
              </Text>
            }
          >
            <div className="flex items-end justify-between h-[280px] px-4 pb-4 pt-2" style={{ background: 'linear-gradient(180deg, rgba(13, 122, 61, 0.02) 0%, rgba(255, 255, 255, 0) 100%)' }}>
              {data.departmentStats.map((item, index) => {
                const maxValue = Math.max(...data.departmentStats.map(d => d.value))
                const height = (item.value / maxValue) * 220
                const colors = ['#045126', '#0d7a3d', '#1890ff', '#40a9ff', '#722ed1']
                const total = data.departmentStats.reduce((sum, d) => sum + d.value, 0)
                const percentage = ((item.value / total) * 100).toFixed(1)
                return (
                  <div key={item.name} className="flex flex-col items-center flex-1 h-full justify-end group">
                    <div className="text-xs font-medium text-gray-500 mb-1">{item.value}</div>
                    <div 
                      className="w-8 rounded-t-md transition-all duration-300 group-hover:shadow-lg cursor-pointer relative"
                      style={{ 
                        height: `${height}px`, 
                        background: `linear-gradient(180deg, ${colors[index]} 0%, ${colors[index]}dd 100%)`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg border border-gray-200 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        <div className="font-semibold" style={{ color: colors[index] }}>{item.name}</div>
                        <div>会诊数: {item.value} 例</div>
                        <div>占比: {percentage}%</div>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-gray-600 mt-2 truncate w-12 text-center">{item.name}</div>
                  </div>
                )
              })}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #1890ff, #40a9ff)' }}></div>
                <span className="font-semibold">专家工作量 TOP5</span>
              </div>
            }
            headStyle={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}
            bodyStyle={{ paddingTop: '16px' }}
            extra={
              <Text type="secondary" className="text-xs">
                人均 <Text strong style={{ color: '#1890ff' }}>{Math.round(data.expertWorkload.reduce((sum, item) => sum + item.value, 0) / data.expertWorkload.length)} 次</Text>
              </Text>
            }
          >
            <div className="flex items-end justify-between h-[280px] px-4 pb-4 pt-2" style={{ background: 'linear-gradient(180deg, rgba(24, 144, 255, 0.02) 0%, rgba(255, 255, 255, 0) 100%)' }}>
              {data.expertWorkload.map((item, index) => {
                const maxValue = Math.max(...data.expertWorkload.map(d => d.value))
                const height = (item.value / maxValue) * 220
                const colors = ['#045126', '#0d7a3d', '#1890ff', '#40a9ff', '#722ed1']
                const total = data.expertWorkload.reduce((sum, d) => sum + d.value, 0)
                const percentage = ((item.value / total) * 100).toFixed(1)
                const avg = Math.round(total / data.expertWorkload.length)
                const vsAvg = item.value > avg ? `高于平均 ${item.value - avg} 次` : `低于平均 ${avg - item.value} 次`
                return (
                  <div key={item.name} className="flex flex-col items-center flex-1 h-full justify-end group">
                    <div className="text-xs font-medium text-gray-500 mb-1">{item.value}</div>
                    <div 
                      className="w-8 rounded-t-md transition-all duration-300 group-hover:shadow-lg cursor-pointer relative"
                      style={{ 
                        height: `${height}px`, 
                        background: `linear-gradient(180deg, ${colors[index]} 0%, ${colors[index]}dd 100%)`,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-lg border border-gray-200 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        <div className="font-semibold" style={{ color: colors[index] }}>{item.name}</div>
                        <div>会诊数: {item.value} 次</div>
                        <div>占比: {percentage}%</div>
                        <div>{vsAvg}</div>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-gray-600 mt-2 truncate w-12 text-center">{item.name}</div>
                  </div>
                )
              })}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 实时会诊列表 */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title={
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #1890ff, #40a9ff)' }}></div>
                <span className="font-semibold">实时会诊动态</span>
              </div>
            }
            headStyle={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '12px' }}
            extra={
              <Space>
                <Badge color="processing" text={<span className="text-xs">实时更新</span>} />
                <Text type="secondary" className="text-xs">共 {data.recentConsultations.length} 条</Text>
              </Space>
            }
          >
            <Table
              dataSource={data.recentConsultations}
              rowKey="id"
              pagination={false}
              size="small"
              rowClassName={(record) => {
                if (record.status === '进行中') return 'bg-blue-50 hover:bg-blue-100'
                if (record.status === '待开始') return 'bg-orange-50 hover:bg-orange-100'
                return 'hover:bg-gray-50'
              }}
              columns={[
                {
                  title: '会诊 ID',
                  dataIndex: 'id',
                  key: 'id',
                  width: 90,
                  render: (text: string) => (
                    <Text strong className="font-mono" style={{ color: '#1890ff' }}>{text}</Text>
                  ),
                },
                {
                  title: '患者',
                  dataIndex: 'patient',
                  key: 'patient',
                  width: 100,
                  render: (text: string) => (
                    <Text className="font-medium">{text}</Text>
                  ),
                },
                {
                  title: '申请科室',
                  dataIndex: 'department',
                  key: 'department',
                  width: 110,
                  render: (text: string) => (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <Text>{text}</Text>
                    </div>
                  ),
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  width: 100,
                  render: (status: string) => {
                    const config: Record<string, { color: string; icon: string }> = {
                      '进行中': { color: 'processing', icon: '⏱' },
                      '待开始': { color: 'warning', icon: '⏰' },
                      '待审核': { color: 'default', icon: '📋' },
                    }
                    const { color, icon } = config[status] || { color: 'default', icon: '📄' }
                    return (
                      <Tag color={color} className="flex items-center gap-1 w-fit px-2">
                        <span>{icon}</span>
                        <span>{status}</span>
                      </Tag>
                    )
                  },
                },
                {
                  title: '开始时间',
                  dataIndex: 'startTime',
                  key: 'startTime',
                  width: 100,
                  render: (text: string) => (
                    <Text type={text === '-' ? 'secondary' : undefined} className="font-mono">
                      {text === '-' ? '待定' : text}
                    </Text>
                  ),
                },
                {
                  title: '参会专家',
                  dataIndex: 'experts',
                  key: 'experts',
                  width: 130,
                  render: (count: number) => {
                    if (count === 0) {
                      return <Text type="secondary" className="text-xs">-</Text>
                    }
                    return (
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[...Array(Math.min(count, 3))].map((_, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-xs text-white font-medium"
                              style={{ fontSize: '10px' }}
                            >
                              {String.fromCharCode(65 + i)}
                            </div>
                          ))}
                          {count > 3 && (
                            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600 font-medium">
                              +{count - 3}
                            </div>
                          )}
                        </div>
                        <Text className="text-sm">{count} 人</Text>
                      </div>
                    )
                  },
                },
                {
                  title: '操作',
                  key: 'action',
                  width: 90,
                  render: (_: any, record: any) => (
                    <Space size="small">
                      <a 
                        className="text-xs" 
                        style={{ color: '#1890ff' }}
                        onClick={() => navigate(`/consultation/detail/${record.id}`)}
                      >查看</a>
                      {record.status === '进行中' && (
                        <a 
                          className="text-xs" 
                          style={{ color: '#045126' }}
                          onClick={() => navigate(`/consultation/room/${record.id}`)}
                        >进入</a>
                      )}
                    </Space>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}