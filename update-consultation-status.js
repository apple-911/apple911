import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xtdngyyqtjnetwyfhfqk.supabase.co'
const supabaseKey = 'sb_publishable_O_UMtO38XA0Q0cqPPS8mpg_Hf5l3-po'
const supabase = createClient(supabaseUrl, supabaseKey)

async function updateExistingConsultations() {
  console.log('🔄 更新现有会诊申请的状态...\n')
  
  // 查询所有会诊申请
  const { data: consultations } = await supabase
    .from('consultations')
    .select('*')
  
  console.log(`找到 ${consultations?.length || 0} 条会诊申请\n`)
  
  for (const consultation of consultations || []) {
    let newStatus = consultation.status
    
    // 状态映射
    switch (consultation.status) {
      case '待科室审核':
        newStatus = '医生提交'
        break
      case '待秘书审核':
        newStatus = '秘书审核'
        break
      case '已拒绝':
        newStatus = '主任驳回'
        break
    }
    
    if (newStatus !== consultation.status) {
      console.log(`更新会诊 ${consultation.id}: ${consultation.status} -> ${newStatus}`)
      
      await supabase
        .from('consultations')
        .update({ status: newStatus })
        .eq('id', consultation.id)
    }
  }
  
  console.log('\n✅ 状态更新完成！\n')
  
  // 验证更新结果
  const { data: updatedConsultations } = await supabase
    .from('consultations')
    .select('status')
  
  const statusCount = {}
  updatedConsultations?.forEach(c => {
    statusCount[c.status] = (statusCount[c.status] || 0) + 1
  })
  
  console.log('当前状态分布：')
  Object.entries(statusCount).forEach(([status, count]) => {
    console.log(`  - ${status}: ${count} 条`)
  })
  
  console.log('\n📋 完整的会诊流程状态：')
  console.log('  1. 医生提交 → 2. 待主任审核 → 3. 主任驳回 (终止)')
  console.log('                          ↓')
  console.log('                    4. 秘书审核 → 5. 待补正')
  console.log('                          ↓')
  console.log('                    6. 待排期 → 7. 待专家确认 → 8. 待会诊')
  console.log('                          ↓')
  console.log('                    9. 会诊中 → 10. 会诊结束')
  console.log('                          ↓')
  console.log('                    11. 待质检审核 → 12. 待归档 → 13. 已归档')
}

updateExistingConsultations().catch(console.error)
