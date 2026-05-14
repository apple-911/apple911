INSERT INTO public.user_managers
(user_id, manager_id, is_primary, created_at)
VALUES('', '', false, now());
INSERT INTO public.user_roles
(id, user_id, role_id, org_id, created_at)
VALUES(nextval('user_roles_id_seq'::regclass), '', '', '', now());
INSERT INTO public.users
(id, username, "password", "name", email, phone, org_id, "position", avatar, status, last_login, created_at, updated_at)
VALUES('', '', '', '', '', '', '', '', '', 'active'::text, '', now(), now());