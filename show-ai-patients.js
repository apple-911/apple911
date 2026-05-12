import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xtdngyyqtjnetwyfhfqk.supabase.co'
const supabaseKey = 'sb_publishable_O_UMtO38XA0Q0cqPPS8mpg_Hf5l3-po'
const supabase = createClient(supabaseUrl, supabaseKey)

async function showPatientsWithAI() {
  console.log('🤖 有 AI 评估的患者示例（前 10 个）:\n')
  
  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .not('ai_evaluation', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10)
  
  patients?.forEach((p, index) => {
    console.log(`${index + 1}. ${p.name} (${p.inpatient_no}) - ${p.main_diagnosis}`)
    console.log(`   过敏史：${p.allergies?.join('、') || '无'}`)
    console.log(`   既往史：${p.history?.join('、') || '无'}`)
    console.log(`   影像学：${p.imaging_exams || '无'}`)
    console.log(`   🤖 AI 评估：${p.ai_evaluation}`)
    console.log(`   💡 MDT 建议：${p.ai_mdt_suggestion}`)
    console.log('')
  })
}

showPatientsWithAI().catch(console.error)
