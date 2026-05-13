const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxvY2FsaG9zdCIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjkwMDAwMDAwLCJleHAiOjE5MDAwMDAwMDB9.local-anon-key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function initMeetingRooms() {
  console.log('开始初始化会诊地点码表...')
  
  const meetingRooms = [
    { type_id: 'meeting_room', code: 'room1', name: 'MDT会诊中心一号会议室', description: 'MDT会诊中心一号会议室', sort_order: 1, status: 'active' },
    { type_id: 'meeting_room', code: 'room2', name: 'MDT会诊中心二号会议室', description: 'MDT会诊中心二号会议室', sort_order: 2, status: 'active' },
    { type_id: 'meeting_room', code: 'room3', name: '远程会诊室', description: '远程视频会诊专用会议室', sort_order: 3, status: 'active' },
    { type_id: 'meeting_room', code: 'room4', name: 'VIP会诊室', description: 'VIP患者专用会诊室', sort_order: 4, status: 'active' },
  ]
  
  for (const room of meetingRooms) {
    const { data, error } = await supabase
      .from('sys_codes')
      .upsert(room, { onConflict: 'type_id,code' })
    
    if (error) {
      console.error(`插入 ${room.name} 失败:`, error.message)
    } else {
      console.log(`插入 ${room.name} 成功`)
    }
  }
  
  const { data: typeData, error: typeError } = await supabase
    .from('sys_code_types')
    .upsert({ id: 'meeting_room', name: '会诊地点', description: '可配置的会诊地点列表', sort_order: 13, status: 'active' }, { onConflict: 'id' })
  
  if (typeError) {
    console.error('插入码表类型失败:', typeError.message)
  } else {
    console.log('插入码表类型成功')
  }
  
  console.log('初始化完成!')
}

initMeetingRooms()
