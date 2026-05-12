-- ==============================================
-- 修复类型不匹配问题
-- users.id 是 text 类型，但某些关联字段是 uuid 类型
-- 需要将以下字段从 uuid 改为 text/varchar
-- ==============================================

-- 1. 修改 notifications.user_id 从 uuid 改为 text
ALTER TABLE notifications ALTER COLUMN user_id TYPE TEXT;

-- 2. 修改 system_logs.user_id 从 uuid 改为 text
ALTER TABLE system_logs ALTER COLUMN user_id TYPE TEXT;

-- 3. 修改 system_logs.resource_id 从 uuid 改为 text
ALTER TABLE system_logs ALTER COLUMN resource_id TYPE TEXT;

-- 4. 修改 experts.user_id 从 uuid 改为 text
ALTER TABLE experts ALTER COLUMN user_id TYPE TEXT;

-- 5. 修改 consultations.apply_doctor_id 从 uuid 改为 text
ALTER TABLE consultations ALTER COLUMN apply_doctor_id TYPE TEXT;

-- 6. 修改 audit_history.operator_id 从 uuid 改为 text
ALTER TABLE audit_history ALTER COLUMN operator_id TYPE TEXT;

-- 7. 修改 case_favorites.user_id 从 uuid 改为 text
ALTER TABLE case_favorites ALTER COLUMN user_id TYPE TEXT;

-- ==============================================
-- 验证修复结果
-- ==============================================
SELECT '=== 类型修复完成 ===' AS result;

-- 验证 notifications 表
SELECT 
    'notifications.user_id' AS field,
    data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications' AND column_name = 'user_id';

-- 验证 system_logs 表
SELECT 
    'system_logs.user_id' AS field,
    data_type 
FROM information_schema.columns 
WHERE table_name = 'system_logs' AND column_name = 'user_id';

-- 验证 experts 表
SELECT 
    'experts.user_id' AS field,
    data_type 
FROM information_schema.columns 
WHERE table_name = 'experts' AND column_name = 'user_id';

-- 验证 users 表（确认参照表类型）
SELECT 
    'users.id' AS field,
    data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'id';
