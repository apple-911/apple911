-- 添加 operator_type 字段到 audit_history 表
ALTER TABLE audit_history 
ADD COLUMN IF NOT EXISTS operator_type TEXT DEFAULT 'pending';

-- 创建索引（可选，根据查询需求）
CREATE INDEX IF NOT EXISTS idx_audit_history_operator_type 
ON audit_history(operator_type);

-- 验证添加结果
SELECT '=== 字段添加完成 ===' AS result;

-- 查询表结构确认
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'audit_history' 
ORDER BY ordinal_position;
