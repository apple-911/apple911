import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xtdngyyqtjnetwyfhfqk.supabase.co'
const supabaseKey = 'sb_publishable_O_UMtO38XA0Q0cqPPS8mpg_Hf5l3-po'
const supabase = createClient(supabaseUrl, supabaseKey)

async function showExpertsSummary() {
  console.log('👨‍⚕️ 专家数据概览\n')
  
  const { data: experts } = await supabase
    .from('experts')
    .select('*')
    .order('name')
  
  console.log(`📊 专家总数：${experts?.length || 0}`)
  console.log(`📋 科室数量：${new Set(experts?.map(e => e.department)).size}`)
  console.log(`✅ 空闲状态：${experts?.filter(e => e.status === '空闲').length}`)
  console.log(`🔵 忙碌状态：${experts?.filter(e => e.status === '忙碌').length}`)
  console.log(`⚫ 离线状态：${experts?.filter(e => e.status === '离线').length}`)
  
  console.log('\n📋 专家列表（带评分和会诊数）:')
  experts?.forEach((e, index) => {
    const rating = e.rating ? `${e.rating}⭐` : '无评分'
    const count = e.consultation_count || 0
    console.log(`${index + 1}. ${e.name} - ${e.department} - ${e.title}`)
    console.log(`   状态：${e.status} | 会诊：${count}次 | 评分：${rating}`)
    console.log(`   专长：${e.specialty}`)
    console.log(`   可约日期：${e.available_days?.join('、') || '未设置'}`)
    console.log('')
  })
}

showExpertsSummary().catch(console.error)
