-- 添加多个测试用户用于登录选择
-- 每个角色至少 3 个用户
-- 所有用户密码都是 123456

-- ========================================
-- 1. 申请医生角色 (apply_doctor) - 3 个用户
-- ========================================

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
VALUES 
('user-doctor-1', 'doctor1', '123456', '张医生', 'zhang@example.com', '13800138001', 'org-general', '主治医师', '', 'active', now(), now()),
('user-doctor-2', 'doctor2', '123456', '李医生', 'li@example.com', '13800138002', 'org-general', '副主任医师', '', 'active', now(), now()),
('user-doctor-3', 'doctor3', '123456', '王医生', 'wang@example.com', '13800138003', 'org-general', '主任医师', '', 'active', now(), now());

INSERT INTO user_roles (user_id, role_id, org_id, created_at)
SELECT ud.id, r.id, 'org-general', now()
FROM users ud, roles r
WHERE ud.id IN ('user-doctor-1', 'user-doctor-2', 'user-doctor-3')
AND r.code = 'apply_doctor';

-- ========================================
-- 2. 主任医生角色 (director) - 3 个用户
-- ========================================

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
VALUES 
('user-director-1', 'director1', '123456', '周主任', 'zhou@example.com', '13800138030', 'org-oncology', '科主任', '', 'active', now(), now()),
('user-director-2', 'director2', '123456', '吴主任', 'wu@example.com', '13800138031', 'org-thoracic', '科主任', '', 'active', now(), now()),
('user-director-3', 'director3', '123456', '郑主任', 'zheng@example.com', '13800138032', 'org-general', '科主任', '', 'active', now(), now());

INSERT INTO user_roles (user_id, role_id, org_id, created_at)
SELECT ud.id, r.id, ud.org_id, now()
FROM users ud, roles r
WHERE ud.id IN ('user-director-1', 'user-director-2', 'user-director-3')
AND r.code = 'director';

-- ========================================
-- 3. MDT 秘书角色 (secretary) - 3 个用户
-- ========================================

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
VALUES 
('user-secretary-1', 'secretary1', '123456', '秘书 1', 'secretary1@example.com', '13800138040', 'org-mdt', '秘书', '', 'active', now(), now()),
('user-secretary-2', 'secretary2', '123456', '秘书 2', 'secretary2@example.com', '13800138041', 'org-mdt', '秘书', '', 'active', now(), now()),
('user-secretary-3', 'secretary3', '123456', '秘书 3', 'secretary3@example.com', '13800138042', 'org-mdt', '秘书', '', 'active', now(), now());

INSERT INTO user_roles (user_id, role_id, org_id, created_at)
SELECT ud.id, r.id, 'org-mdt', now()
FROM users ud, roles r
WHERE ud.id IN ('user-secretary-1', 'user-secretary-2', 'user-secretary-3')
AND r.code = 'secretary';

-- ========================================
-- 4. 会诊专家角色 (expert) - 3 个用户
-- ========================================

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
VALUES 
('user-expert', 'expert', '123456', '陈专家', 'chen@example.com', '13800138050', 'org-oncology', '主任医师', '', 'active', now(), now()),
('user-expert-2', 'expert2', '123456', '刘专家', 'liu@example.com', '13800138051', 'org-thoracic', '副主任医师', '', 'active', now(), now()),
('user-expert-3', 'expert3', '123456', '赵专家', 'zhao@example.com', '13800138052', 'org-radiology', '主任医师', '', 'active', now(), now());

INSERT INTO user_roles (user_id, role_id, org_id, created_at)
SELECT ud.id, r.id, ud.org_id, now()
FROM users ud, roles r
WHERE ud.id IN ('user-expert', 'user-expert-2', 'user-expert-3')
AND r.code = 'expert';

INSERT INTO experts (user_id, name, department, title, specialty, phone, status)
VALUES 
('user-expert', '陈专家', '肿瘤科', '主任医师', '肿瘤治疗', '13800138050', 'active'),
('user-expert-2', '刘专家', '胸外科', '副主任医师', '胸部肿瘤', '13800138051', 'active'),
('user-expert-3', '赵专家', '放射科', '主任医师', '影像诊断', '13800138052', 'active');

-- ========================================
-- 5. 质控员角色 (quality_controller) - 3 个用户
-- ========================================

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
VALUES 
('user-qa-1', 'qa1', '123456', '质控 1', 'qa1@example.com', '13800138060', 'org-mdt', '质控员', '', 'active', now(), now()),
('user-qa-2', 'qa2', '123456', '质控 2', 'qa2@example.com', '13800138061', 'org-mdt', '质控员', '', 'active', now(), now()),
('user-qa-3', 'qa3', '123456', '质控 3', 'qa3@example.com', '13800138062', 'org-mdt', '质控员', '', 'active', now(), now());

INSERT INTO user_roles (user_id, role_id, org_id, created_at)
SELECT ud.id, r.id, 'org-mdt', now()
FROM users ud, roles r
WHERE ud.id IN ('user-qa-1', 'user-qa-2', 'user-qa-3')
AND r.code = 'quality_controller';

-- ========================================
-- 6. 系统管理员角色 (admin) - 3 个用户
-- ========================================

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
VALUES 
('user-admin-1', 'admin1', '123456', '管理员 1', 'admin1@example.com', '13800138070', 'org-root', '系统管理员', '', 'active', now(), now()),
('user-admin-2', 'admin2', '123456', '管理员 2', 'admin2@example.com', '13800138071', 'org-root', '系统管理员', '', 'active', now(), now()),
('user-admin-3', 'admin3', '123456', '管理员 3', 'admin3@example.com', '13800138072', 'org-root', '系统管理员', '', 'active', now(), now());

INSERT INTO user_roles (user_id, role_id, org_id, created_at)
SELECT ud.id, r.id, 'org-root', now()
FROM users ud, roles r
WHERE ud.id IN ('user-admin-1', 'user-admin-2', 'user-admin-3')
AND r.code = 'admin';

-- ========================================
-- 7. 超级管理员角色 (super_admin) - 3 个用户
-- ========================================

INSERT INTO users (id, username, password, name, email, phone, org_id, position, avatar, status, created_at, updated_at)
VALUES 
('user-superadmin-1', 'superadmin1', '123456', '超级管理员 1', 'superadmin1@example.com', '13800138080', 'org-root', '超级管理员', '', 'active', now(), now()),
('user-superadmin-2', 'superadmin2', '123456', '超级管理员 2', 'superadmin2@example.com', '13800138081', 'org-root', '超级管理员', '', 'active', now(), now()),
('user-superadmin-3', 'superadmin3', '123456', '超级管理员 3', 'superadmin3@example.com', '13800138082', 'org-root', '超级管理员', '', 'active', now(), now());

INSERT INTO user_roles (user_id, role_id, org_id, created_at)
SELECT ud.id, r.id, 'org-root', now()
FROM users ud, roles r
WHERE ud.id IN ('user-superadmin-1', 'user-superadmin-2', 'user-superadmin-3')
AND r.code = 'super_admin';

-- ========================================
-- 验证添加的用户
-- ========================================
SELECT u.id, u.username, u.name, o.name as org_name, r.code as role_code
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
LEFT JOIN organizations o ON u.org_id = o.id
WHERE u.status = 'active'
ORDER BY r.code, u.name;
