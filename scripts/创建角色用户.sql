-- ========================================
-- MDT 系统用户初始化 SQL 脚本
-- 为每个角色创建至少 3 个用户
-- 所有用户密码都是 123456
-- ========================================

-- ========================================
-- 1. 先插入基础组织数据 (如果还没有)
-- ========================================
INSERT INTO organizations (id, code, name, type, status, created_at, updated_at)
SELECT 'org-root', 'root', '根组织', 'organization', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE id = 'org-root');

INSERT INTO organizations (id, code, name, type, status, created_at, updated_at)
SELECT 'org-mdt', 'mdt', 'MDT 中心', 'department', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE id = 'org-mdt');

INSERT INTO organizations (id, code, name, type, status, created_at, updated_at)
SELECT 'org-oncology', 'oncology', '肿瘤科', 'department', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE id = 'org-oncology');

INSERT INTO organizations (id, code, name, type, status, created_at, updated_at)
SELECT 'org-thoracic', 'thoracic', '胸外科', 'department', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE id = 'org-thoracic');

INSERT INTO organizations (id, code, name, type, status, created_at, updated_at)
SELECT 'org-radiology', 'radiology', '放射科', 'department', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE id = 'org-radiology');

INSERT INTO organizations (id, code, name, type, status, created_at, updated_at)
SELECT 'org-general', 'general', '综合科室', 'department', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE id = 'org-general');

-- ========================================
-- 2. 插入角色数据 (如果还没有)
-- ========================================
INSERT INTO roles (id, code, name, description, status, created_at, updated_at)
SELECT 'role-apply-doctor', 'apply_doctor', '申请医生', '发起会诊申请的医生', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE id = 'role-apply-doctor');

INSERT INTO roles (id, code, name, description, status, created_at, updated_at)
SELECT 'role-director', 'director', '主任医生', '科室主任', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE id = 'role-director');

INSERT INTO roles (id, code, name, description, status, created_at, updated_at)
SELECT 'role-secretary', 'secretary', 'MDT 秘书', 'MDT 中心秘书', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE id = 'role-secretary');

INSERT INTO roles (id, code, name, description, status, created_at, updated_at)
SELECT 'role-expert', 'expert', '会诊专家', '参与会诊的专家', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE id = 'role-expert');

INSERT INTO roles (id, code, name, description, status, created_at, updated_at)
SELECT 'role-quality-controller', 'quality_controller', '质控员', '质量控制人员', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE id = 'role-quality-controller');

INSERT INTO roles (id, code, name, description, status, created_at, updated_at)
SELECT 'role-admin', 'admin', '系统管理员', '系统管理员', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE id = 'role-admin');

INSERT INTO roles (id, code, name, description, status, created_at, updated_at)
SELECT 'role-super-admin', 'super_admin', '超级管理员', '超级管理员', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE id = 'role-super-admin');

-- ========================================
-- 3. 申请医生角色 (apply_doctor) - 3 个用户
-- ========================================
INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-doctor-1', 'doctor1', '123456', '张医生', 'zhang@example.com', '13800138001', 'org-general', '主治医师', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-doctor-1');

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-doctor-2', 'doctor2', '123456', '李医生', 'li@example.com', '13800138002', 'org-general', '副主任医师', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-doctor-2');

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-doctor-3', 'doctor3', '123456', '王医生', 'wang@example.com', '13800138003', 'org-general', '主任医师', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-doctor-3');

INSERT INTO user_roles (user_id, role_id, org_id, created_at)
SELECT ud.id, r.id, 'org-general', now()
FROM users ud, roles r
WHERE ud.id IN ('user-doctor-1', 'user-doctor-2', 'user-doctor-3')
AND r.code = 'apply_doctor'
AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = ud.id AND role_id = r.id);

-- ========================================
-- 4. 主任医生角色 (director) - 3 个用户
-- ========================================
INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-director-1', 'director1', '123456', '周主任', 'zhou@example.com', '13800138030', 'org-oncology', '科主任', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-director-1');

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-director-2', 'director2', '123456', '吴主任', 'wu@example.com', '13800138031', 'org-thoracic', '科主任', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-director-2');

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-director-3', 'director3', '123456', '郑主任', 'zheng@example.com', '13800138032', 'org-general', '科主任', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-director-3');

INSERT INTO user_roles (user_id, role_id, org_id, created_at)
SELECT ud.id, r.id, ud.org_id, now()
FROM users ud, roles r
WHERE ud.id IN ('user-director-1', 'user-director-2', 'user-director-3')
AND r.code = 'director'
AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = ud.id AND role_id = r.id);

-- ========================================
-- 5. MDT 秘书角色 (secretary) - 3 个用户
-- ========================================
INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-secretary-1', 'secretary1', '123456', '秘书 1', 'secretary1@example.com', '13800138040', 'org-mdt', '秘书', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-secretary-1');

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-secretary-2', 'secretary2', '123456', '秘书 2', 'secretary2@example.com', '13800138041', 'org-mdt', '秘书', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-secretary-2');

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-secretary-3', 'secretary3', '123456', '秘书 3', 'secretary3@example.com', '13800138042', 'org-mdt', '秘书', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-secretary-3');

INSERT INTO user_roles (user_id, role_id, org_id, created_at)
SELECT ud.id, r.id, 'org-mdt', now()
FROM users ud, roles r
WHERE ud.id IN ('user-secretary-1', 'user-secretary-2', 'user-secretary-3')
AND r.code = 'secretary'
AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = ud.id AND role_id = r.id);

-- ========================================
-- 6. 会诊专家角色 (expert) - 3 个用户
-- ========================================
INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-expert', 'expert', '123456', '陈专家', 'chen@example.com', '13800138050', 'org-oncology', '主任医师', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-expert');

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-expert-2', 'expert2', '123456', '刘专家', 'liu@example.com', '13800138051', 'org-thoracic', '副主任医师', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-expert-2');

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-expert-3', 'expert3', '123456', '赵专家', 'zhao@example.com', '13800138052', 'org-radiology', '主任医师', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-expert-3');

INSERT INTO user_roles (user_id, role_id, org_id, created_at)
SELECT ud.id, r.id, ud.org_id, now()
FROM users ud, roles r
WHERE ud.id IN ('user-expert', 'user-expert-2', 'user-expert-3')
AND r.code = 'expert'
AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = ud.id AND role_id = r.id);

-- 插入专家表数据
INSERT INTO experts (user_id, name, department, title, specialty, phone, status, created_at)
SELECT 'user-expert', '陈专家', '肿瘤科', '主任医师', '肿瘤治疗', '13800138050', 'active', now()
WHERE NOT EXISTS (SELECT 1 FROM experts WHERE user_id = 'user-expert');

INSERT INTO experts (user_id, name, department, title, specialty, phone, status, created_at)
SELECT 'user-expert-2', '刘专家', '胸外科', '副主任医师', '胸部肿瘤', '13800138051', 'active', now()
WHERE NOT EXISTS (SELECT 1 FROM experts WHERE user_id = 'user-expert-2');

INSERT INTO experts (user_id, name, department, title, specialty, phone, status, created_at)
SELECT 'user-expert-3', '赵专家', '放射科', '主任医师', '影像诊断', '13800138052', 'active', now()
WHERE NOT EXISTS (SELECT 1 FROM experts WHERE user_id = 'user-expert-3');

-- ========================================
-- 7. 质控员角色 (quality_controller) - 3 个用户
-- ========================================
INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-qa-1', 'qa1', '123456', '质控 1', 'qa1@example.com', '13800138060', 'org-mdt', '质控员', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-qa-1');

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-qa-2', 'qa2', '123456', '质控 2', 'qa2@example.com', '13800138061', 'org-mdt', '质控员', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-qa-2');

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-qa-3', 'qa3', '123456', '质控 3', 'qa3@example.com', '13800138062', 'org-mdt', '质控员', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-qa-3');

INSERT INTO user_roles (user_id, role_id, org_id, created_at)
SELECT ud.id, r.id, 'org-mdt', now()
FROM users ud, roles r
WHERE ud.id IN ('user-qa-1', 'user-qa-2', 'user-qa-3')
AND r.code = 'quality_controller'
AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = ud.id AND role_id = r.id);

-- ========================================
-- 8. 系统管理员角色 (admin) - 3 个用户
-- ========================================
INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-admin-1', 'admin1', '123456', '管理员 1', 'admin1@example.com', '13800138070', 'org-root', '系统管理员', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-admin-1');

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-admin-2', 'admin2', '123456', '管理员 2', 'admin2@example.com', '13800138071', 'org-root', '系统管理员', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-admin-2');

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-admin-3', 'admin3', '123456', '管理员 3', 'admin3@example.com', '13800138072', 'org-root', '系统管理员', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-admin-3');

INSERT INTO user_roles (user_id, role_id, org_id, created_at)
SELECT ud.id, r.id, 'org-root', now()
FROM users ud, roles r
WHERE ud.id IN ('user-admin-1', 'user-admin-2', 'user-admin-3')
AND r.code = 'admin'
AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = ud.id AND role_id = r.id);

-- ========================================
-- 9. 超级管理员角色 (super_admin) - 3 个用户
-- ========================================
INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-superadmin-1', 'superadmin1', '123456', '超级管理员 1', 'superadmin1@example.com', '13800138080', 'org-root', '超级管理员', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-superadmin-1');

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-superadmin-2', 'superadmin2', '123456', '超级管理员 2', 'superadmin2@example.com', '13800138081', 'org-root', '超级管理员', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-superadmin-2');

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
SELECT 'user-superadmin-3', 'superadmin3', '123456', '超级管理员 3', 'superadmin3@example.com', '13800138082', 'org-root', '超级管理员', '', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 'user-superadmin-3');

INSERT INTO user_roles (user_id, role_id, org_id, created_at)
SELECT ud.id, r.id, 'org-root', now()
FROM users ud, roles r
WHERE ud.id IN ('user-superadmin-1', 'user-superadmin-2', 'user-superadmin-3')
AND r.code = 'super_admin'
AND NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = ud.id AND role_id = r.id);

-- ========================================
-- 验证添加的用户
-- ========================================
SELECT 
    u.id, 
    u.username, 
    u.name, 
    o.name as org_name, 
    r.name as role_name,
    r.code as role_code
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
LEFT JOIN organizations o ON u.org_id = o.id
WHERE u.status = 'active'
ORDER BY r.code, u.name;
