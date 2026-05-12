-- 创建码表类型表
CREATE TABLE IF NOT EXISTS sys_code_types (
  id VARCHAR(50) PRIMARY KEY NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建码表数据表
CREATE TABLE IF NOT EXISTS sys_codes (
  id SERIAL PRIMARY KEY,
  type_id VARCHAR(50) NOT NULL REFERENCES sys_code_types(id),
  code VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(50),
  icon VARCHAR(50),
  sort_order INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(type_id, code)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_sys_codes_type_id ON sys_codes(type_id);
CREATE INDEX IF NOT EXISTS idx_sys_codes_code ON sys_codes(code);

-- 插入码表类型
INSERT INTO sys_code_types (id, name, description, sort_order) VALUES
('consultation_status', '会诊状态', '会诊流程中的各种状态', 1),
('urgency_level', '紧急程度', '会诊申请的紧急程度', 2),
('role_type', '角色类型', '系统角色定义', 3),
('permission_type', '权限类型', '系统权限定义', 4),
('process_node', '流程节点', '会诊流程节点定义', 5),
('report_status', '报告状态', '会诊报告状态', 6),
('user_status', '用户状态', '用户账户状态', 7),
('expert_status', '专家状态', '专家在线状态', 8),
('quality_status', '质控状态', '质控任务状态', 9),
('followup_status', '随访状态', '随访任务状态', 10),
('material_status', '材料状态', '会诊材料状态', 11),
('audit_result', '审核结果', '审核操作结果', 12)
ON CONFLICT DO NOTHING;

-- 插入会诊状态码表
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order) VALUES
('consultation_status', 'doctor_submit', '医生提交', '申请医生提交会诊申请', 'blue', 1),
('consultation_status', 'director_pending', '待主任审核', '等待科室主任审核', 'orange', 2),
('consultation_status', 'director_approved', '主任通过', '主任审核通过', 'green', 3),
('consultation_status', 'director_rejected', '主任驳回', '主任审核驳回', 'red', 4),
('consultation_status', 'secretary_pending', '待秘书审核', '等待MDT秘书审核', 'orange', 5),
('consultation_status', 'secretary_approved', '秘书通过', '秘书审核通过', 'green', 6),
('consultation_status', 'pending_supplement', '待补正', '等待补充材料', 'orange', 7),
('consultation_status', 'material_rejected', '退回修改', '材料被退回修改', 'red', 8),
('consultation_status', 'expert_invited', '专家邀请', '已发送专家邀请', 'blue', 9),
('consultation_status', 'expert_confirmed', '专家确认', '专家已确认参会', 'green', 10),
('consultation_status', 'scheduled', '已排期', '会诊已安排时间', 'blue', 11),
('consultation_status', 'in_progress', '会诊中', '会诊正在进行', 'processing', 12),
('consultation_status', 'completed', '已完成', '会诊已完成', 'success', 13),
('consultation_status', 'archived', '已归档', '会诊已归档', 'gray', 14),
('consultation_status', 'cancelled', '已取消', '会诊已取消', 'red', 15),
('consultation_status', 'rejected', '已拒绝', '会诊被拒绝', 'red', 16),
('consultation_status', 'pending_meeting', '待会诊', '等待会诊开始', 'orange', 17)
ON CONFLICT DO NOTHING;

-- 插入紧急程度码表
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order) VALUES
('urgency_level', 'normal', '普通', '普通会诊申请', 'default', 1),
('urgency_level', 'urgent', '紧急', '紧急会诊申请', 'red', 2),
('urgency_level', 'critical', '特急', '特急会诊申请', 'red', 3)
ON CONFLICT DO NOTHING;

-- 插入角色类型码表
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order) VALUES
('role_type', 'apply_doctor', '申请医生', '发起会诊申请的医生', 'blue', 1),
('role_type', 'director', '主任医生', '科室主任', 'orange', 2),
('role_type', 'secretary', 'MDT秘书', 'MDT中心秘书', 'green', 3),
('role_type', 'expert', '会诊专家', '参与会诊的专家', 'purple', 4),
('role_type', 'quality_controller', '质控员', '质量控制人员', 'red', 5),
('role_type', 'admin', '系统管理员', '系统管理员', 'cyan', 6),
('role_type', 'super_admin', '超级管理员', '超级管理员', 'gold', 7)
ON CONFLICT DO NOTHING;

-- 插入流程节点码表
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order) VALUES
('process_node', 'apply', '申请提交', '医生提交会诊申请', 'blue', 1),
('process_node', 'department_audit', '科室审核', '主任医生审核', 'orange', 2),
('process_node', 'secretary_audit', '秘书审核', 'MDT秘书审核', 'orange', 3),
('process_node', 'material_submit', '材料提交', '提交会诊材料', 'blue', 4),
('process_node', 'expert_invite', '专家邀请', '邀请专家参会', 'purple', 5),
('process_node', 'schedule', '排期安排', '安排会诊时间', 'blue', 6),
('process_node', 'meeting', '会诊实施', '进行会诊', 'green', 7),
('process_node', 'report', '报告编写', '编写会诊报告', 'blue', 8),
('process_node', 'followup', '随访跟踪', '患者随访', 'cyan', 9),
('process_node', 'archive', '归档', '会诊归档', 'gray', 10)
ON CONFLICT DO NOTHING;

-- 插入报告状态码表
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order) VALUES
('report_status', 'draft', '草稿', '报告草稿', 'default', 1),
('report_status', 'pending_sign', '待签名', '等待签名', 'orange', 2),
('report_status', 'signed', '已签名', '已完成签名', 'green', 3),
('report_status', 'archived', '已归档', '报告已归档', 'gray', 4)
ON CONFLICT DO NOTHING;

-- 插入用户状态码表
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order) VALUES
('user_status', 'active', '启用', '用户账户正常', 'green', 1),
('user_status', 'inactive', '禁用', '用户账户禁用', 'red', 2)
ON CONFLICT DO NOTHING;

-- 插入专家状态码表
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order) VALUES
('expert_status', 'online', '在线', '专家在线', 'green', 1),
('expert_status', 'busy', '忙碌', '专家忙碌', 'orange', 2),
('expert_status', 'offline', '离线', '专家离线', 'gray', 3)
ON CONFLICT DO NOTHING;

-- 插入质控状态码表
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order) VALUES
('quality_status', 'pending', '待检查', '等待质控检查', 'orange', 1),
('quality_status', 'processing', '处理中', '质控处理中', 'blue', 2),
('quality_status', 'resolved', '已解决', '质控问题已解决', 'green', 3)
ON CONFLICT DO NOTHING;

-- 插入随访状态码表
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order) VALUES
('followup_status', 'pending', '待执行', '等待执行随访', 'orange', 1),
('followup_status', 'in_progress', '进行中', '随访进行中', 'blue', 2),
('followup_status', 'completed', '已完成', '随访已完成', 'green', 3)
ON CONFLICT DO NOTHING;

-- 插入材料状态码表
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order) VALUES
('material_status', 'pending', '待提交', '等待提交材料', 'orange', 1),
('material_status', 'submitted', '已提交', '材料已提交', 'blue', 2),
('material_status', 'approved', '审核通过', '材料审核通过', 'green', 3),
('material_status', 'rejected', '已退回', '材料被退回', 'red', 4)
ON CONFLICT DO NOTHING;

-- 插入审核结果码表
INSERT INTO sys_codes (type_id, code, name, description, color, sort_order) VALUES
('audit_result', 'approved', '通过', '审核通过', 'green', 1),
('audit_result', 'rejected', '拒绝', '审核拒绝', 'red', 2)
ON CONFLICT DO NOTHING;

-- 插入权限类型码表
INSERT INTO sys_codes (type_id, code, name, description, sort_order) VALUES
('permission_type', 'perm-consultation-apply', '会诊申请', '申请会诊权限', 1),
('permission_type', 'perm-consultation-detail', '会诊详情', '查看会诊详情', 2),
('permission_type', 'perm-consultation-review', '会诊审核', '审核会诊申请', 3),
('permission_type', 'perm-consultation-schedule', '排期管理', '管理会诊排期', 4),
('permission_type', 'perm-consultation-confirm', '会诊确认', '确认会诊', 5),
('permission_type', 'perm-consultation-track', '会诊跟踪', '跟踪会诊进度', 6),
('permission_type', 'perm-consultation-material', '材料管理', '管理会诊材料', 7),
('permission_type', 'perm-patient-list', '患者列表', '查看患者列表', 8),
('permission_type', 'perm-patient-360', '患者360', '查看患者360视图', 9),
('permission_type', 'perm-report-list', '报告列表', '查看报告列表', 10),
('permission_type', 'perm-report-edit', '报告编辑', '编辑会诊报告', 11),
('permission_type', 'perm-followup-list', '随访管理', '管理随访任务', 12),
('permission_type', 'perm-quality-dashboard', '质控仪表板', '查看质控仪表板', 13),
('permission_type', 'perm-record-library', '病案库', '查看病案库', 14),
('permission_type', 'perm-ai-screening', 'AI筛查', '使用AI筛查', 15),
('permission_type', 'perm-admin-orgs', '组织管理', '管理组织机构', 16),
('permission_type', 'perm-admin-users', '用户管理', '管理用户', 17),
('permission_type', 'perm-admin-roles', '角色管理', '管理角色权限', 18),
('permission_type', 'perm-admin-codes', '码表管理', '管理系统码表', 19)
ON CONFLICT DO NOTHING;

-- 更新updated_at字段的触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sys_code_types_updated_at ON sys_code_types;
CREATE TRIGGER trigger_sys_code_types_updated_at
BEFORE UPDATE ON sys_code_types
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_sys_codes_updated_at ON sys_codes;
CREATE TRIGGER trigger_sys_codes_updated_at
BEFORE UPDATE ON sys_codes
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

SELECT '码表初始化完成' AS result;