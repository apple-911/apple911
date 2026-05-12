import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xtdngyyqtjnetwyfhfqk.supabase.co'
const supabaseKey = 'sb_publishable_O_UMtO38XA0Q0cqPPS8mpg_Hf5l3-po'
const supabase = createClient(supabaseUrl, supabaseKey)

async function showPatientData() {
  console.log('📋 展示患者数据示例（前 5 个）:\n')
  
  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  
  patients?.forEach((p, index) => {
    console.log(`${index + 1}. ${p.name} (${p.inpatient_no})`)
    console.log(`   诊断：${p.main_diagnosis}`)
    console.log(`   过敏史：${p.allergies?.join('、') || '无'}`)
    console.log(`   既往史：${p.history?.join('、') || '无'}`)
    console.log(`   影像学检查：${p.imaging_exams || '无'}`)
    console.log(`   AI 评估：${p.ai_evaluation || '待评估'}`)
    console.log(`   AI MDT 建议：${p.ai_mdt_suggestion || '待评估'}`)
    console.log('')
  })
  
  console.log('📊 数据统计:')
  const { count: total } = await supabase.from('patients').select('*', { count: 'exact', head: true })
  const { count: withAI } = await supabase.from('patients').select('*', { count: 'exact', head: true }).not('ai_evaluation', 'is', null)
  
  console.log(`   总患者数：${total}`)
  console.log(`   有 AI 评估：${withAI}`)
  console.log(`   待 AI 评估：${total - withAI}`)
}

showPatientData().catch(console.error)
