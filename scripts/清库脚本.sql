-- =====================================================
-- MDT 系统数据库清库脚本
-- 说明：清空业务流程数据，保留基础数据和系统支撑数据
-- 创建时间：2026-05-13
-- =====================================================

-- =====================================================
-- 第一部分：清空业务流程和审批记录
-- =====================================================

-- 清空审核历史记录（audit_history）
TRUNCATE TABLE audit_history CASCADE;

-- 清空会诊专家关联表（consultation_experts）
TRUNCATE TABLE consultation_experts CASCADE;

-- 清空会诊申请记录（consultations）
TRUNCATE TABLE consultations CASCADE;

-- 清空会议安排（meeting_schedules）
TRUNCATE TABLE meeting_schedules CASCADE;

-- =====================================================
-- 第二部分：保留医疗检查数据（不清空）
-- =====================================================
-- 保留以下表的数据：
-- - imaging_exams - 影像检查
-- - lab_tests - 实验室检查
-- - pathology_reports - 病理报告
-- - other_exams - 其他检查
-- - medical_records - 病历记录

-- =====================================================
-- 第三部分：保留随访管理数据（不清空）
-- =====================================================
-- 保留以下表的数据：
-- - followup_tasks - 随访任务
-- - followup_plans - 随访计划
-- - followup_rule_items - 随访规则项
-- - followup_rules - 随访规则

-- =====================================================
-- 第四部分：清空通知和日志
-- =====================================================

-- 清空通知（notifications）
TRUNCATE TABLE notifications CASCADE;

-- 清空系统日志（system_logs）
TRUNCATE TABLE system_logs CASCADE;

-- =====================================================
-- 第五部分：清空质量指标
-- =====================================================

-- 清空质量指标（quality_metrics）
TRUNCATE TABLE quality_metrics CASCADE;

-- =====================================================
-- 第六部分：清空会议房间（可选）
-- =====================================================

-- 如果需要保留会议房间配置，请注释掉下面这行
-- TRUNCATE TABLE meeting_rooms CASCADE;

-- =====================================================
-- 保留的表（不清空）
-- =====================================================
-- 1. 患者表（patients）- 保留
-- 2. 专家表（experts）- 保留
-- 3. 用户表（users）- 保留
-- 4. 角色表（roles）- 保留
-- 5. 权限表（permissions）- 保留
-- 6. 组织机构表（organizations）- 保留
-- 7. 科室表（departments）- 保留
-- 8. 用户管理关系表（user_managers）- 保留
-- 9. 码表类型（code_types）- 保留
-- 10. 码值定义（code_items）- 保留
-- 11. 患者用户表（patient_users）- 保留

-- =====================================================
-- 验证清库结果
-- =====================================================

-- 查询已清空表的记录数（应该为0）
SELECT 
    'audit_history' AS table_name, COUNT(*) AS record_count FROM audit_history
UNION ALL
SELECT 'consultation_experts', COUNT(*) FROM consultation_experts
UNION ALL
SELECT 'consultations', COUNT(*) FROM consultations
UNION ALL
SELECT 'meeting_schedules', COUNT(*) FROM meeting_schedules
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'system_logs', COUNT(*) FROM system_logs
UNION ALL
SELECT 'quality_metrics', COUNT(*) FROM quality_metrics
ORDER BY table_name;

-- =====================================================
-- 查询保留表的记录数（用于对比）
-- =====================================================

SELECT 
    'patients' AS table_name, COUNT(*) AS record_count FROM patients
UNION ALL
SELECT 'experts', COUNT(*) FROM experts
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'roles', COUNT(*) FROM roles
UNION ALL
SELECT 'permissions', COUNT(*) FROM permissions
UNION ALL
SELECT 'organizations', COUNT(*) FROM organizations
UNION ALL
SELECT 'departments', COUNT(*) FROM departments
UNION ALL
SELECT 'user_managers', COUNT(*) FROM user_managers
UNION ALL
SELECT 'followup_tasks', COUNT(*) FROM followup_tasks
UNION ALL
SELECT 'followup_plans', COUNT(*) FROM followup_plans
UNION ALL
SELECT 'followup_rule_items', COUNT(*) FROM followup_rule_items
UNION ALL
SELECT 'followup_rules', COUNT(*) FROM followup_rules
UNION ALL
SELECT 'imaging_exams', COUNT(*) FROM imaging_exams
UNION ALL
SELECT 'lab_tests', COUNT(*) FROM lab_tests
UNION ALL
SELECT 'pathology_reports', COUNT(*) FROM pathology_reports
UNION ALL
SELECT 'other_exams', COUNT(*) FROM other_exams
UNION ALL
SELECT 'medical_records', COUNT(*) FROM medical_records
ORDER BY table_name;

-- =====================================================
-- 清库完成提示
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '数据库清库完成！';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '已清空的表：';
    RAISE NOTICE '  - 业务流程：consultations, consultation_experts, meeting_schedules, audit_history';
    RAISE NOTICE '  - 通知日志：notifications, system_logs';
    RAISE NOTICE '  - 质量指标：quality_metrics';
    RAISE NOTICE '保留的表：';
    RAISE NOTICE '  - 基础数据：patients, experts';
    RAISE NOTICE '  - 系统支撑：users, roles, permissions, organizations, departments';
    RAISE NOTICE '  - 用户关系：user_managers';
    RAISE NOTICE '  - 码表数据：code_types, code_items';
    RAISE NOTICE '  - 医疗检查：imaging_exams, lab_tests, pathology_reports, other_exams, medical_records';
    RAISE NOTICE '  - 随访管理：followup_plans, followup_tasks, followup_rules, followup_rule_items';
    RAISE NOTICE '=====================================================';
END $$;
