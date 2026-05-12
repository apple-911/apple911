-- public.followup_rules 定义

-- Drop table

-- DROP TABLE public.followup_rules;

CREATE TABLE public.followup_rules (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	disease text NOT NULL,
	stage text NULL,
	treatment_type text NOT NULL,
	"source" text NOT NULL,
	"version" text NULL,
	is_active bool DEFAULT true NULL,
	schedule_template jsonb NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT followup_rules_pkey PRIMARY KEY (id)
);


-- public.meeting_rooms 定义

-- Drop table

-- DROP TABLE public.meeting_rooms;

CREATE TABLE public.meeting_rooms (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"location" text NULL,
	capacity int4 NULL,
	equipment _text NULL,
	status text DEFAULT 'available'::text NULL,
	bookable bool DEFAULT true NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT meeting_rooms_pkey PRIMARY KEY (id)
);


-- public.notifications 定义

-- Drop table

-- DROP TABLE public.notifications;

CREATE TABLE public.notifications (
	id uuid DEFAULT uuid_generate_v4() NOT NULL,
	user_id uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	title varchar(100) NOT NULL,
	message text NOT NULL,
	action_url varchar(500) NULL,
	action_label varchar(50) NULL,
	"read" bool DEFAULT false NULL,
	"timestamp" timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT notifications_pkey PRIMARY KEY (id),
	CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['info'::character varying, 'success'::character varying, 'warning'::character varying, 'error'::character varying])::text[])))
);
CREATE INDEX idx_notifications_read ON public.notifications USING btree (read);
CREATE INDEX idx_notifications_timestamp ON public.notifications USING btree ("timestamp" DESC);
CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Table Policies

CREATE POLICY "Users can view their own notifications" ON public.notifications
 AS PERMISSIVE
 FOR SELECT
 USING (true);
CREATE POLICY "Allow insert notifications for any user" ON public.notifications
 AS PERMISSIVE
 FOR INSERT
 WITH CHECK (true);
CREATE POLICY "Allow update any notifications" ON public.notifications
 AS PERMISSIVE
 FOR UPDATE
 USING (true);
CREATE POLICY "Allow delete any notifications" ON public.notifications
 AS PERMISSIVE
 FOR DELETE
 USING (true);


-- public.quality_metrics 定义

-- Drop table

-- DROP TABLE public.quality_metrics;

CREATE TABLE public.quality_metrics (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	code text NULL,
	description text NULL,
	category text NULL,
	weight numeric(5, 2) NULL,
	target_value numeric(5, 2) NULL,
	calculation_method text NULL,
	is_active bool DEFAULT true NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT quality_metrics_code_key UNIQUE (code),
	CONSTRAINT quality_metrics_pkey PRIMARY KEY (id)
);


-- public.system_logs 定义

-- Drop table

-- DROP TABLE public.system_logs;

CREATE TABLE public.system_logs (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	user_id uuid NULL,
	"action" text NOT NULL,
	"module" text NULL,
	resource_type text NULL,
	resource_id uuid NULL,
	old_value jsonb NULL,
	new_value jsonb NULL,
	ip_address text NULL,
	user_agent text NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT system_logs_pkey PRIMARY KEY (id)
);
CREATE INDEX idx_system_logs_created ON public.system_logs USING btree (created_at DESC);


-- public.user_managers 定义

-- Drop table

-- DROP TABLE public.user_managers;

CREATE TABLE public.user_managers (
	user_id varchar(255) NOT NULL,
	manager_id varchar(255) NOT NULL,
	is_primary bool DEFAULT false NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT user_managers_pkey PRIMARY KEY (user_id, manager_id)
);
CREATE INDEX idx_user_managers_manager ON public.user_managers USING btree (manager_id);
CREATE INDEX idx_user_managers_user ON public.user_managers USING btree (user_id);
ALTER TABLE public.user_managers ENABLE ROW LEVEL SECURITY;


-- public.departments 定义

-- Drop table

-- DROP TABLE public.departments;

CREATE TABLE public.departments (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	code text NULL,
	"name" text NOT NULL,
	parent_id uuid NULL,
	"type" text NULL,
	description text NULL,
	sort_order int4 NULL,
	is_active bool DEFAULT true NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT departments_code_key UNIQUE (code),
	CONSTRAINT departments_pkey PRIMARY KEY (id),
	CONSTRAINT departments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.departments(id)
);

-- Table Policies

CREATE POLICY "Allow public read access to departments" ON public.departments
 AS PERMISSIVE
 FOR SELECT
 USING (true);


-- public.experts 定义

-- Drop table

-- DROP TABLE public.experts;

CREATE TABLE public.experts (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	user_id uuid NULL,
	"name" text NOT NULL,
	department_id uuid NULL,
	department text NOT NULL,
	title text NOT NULL,
	specialty text NULL,
	status text NOT NULL,
	avatar text NULL,
	consultation_count int4 DEFAULT 0 NULL,
	rating numeric(3, 2) NULL,
	available_days _text NULL,
	max_consultations_per_day int4 NULL,
	created_at timestamptz DEFAULT now() NULL,
	phone text NULL,
	CONSTRAINT experts_pkey PRIMARY KEY (id),
	CONSTRAINT experts_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);
CREATE INDEX idx_experts_department ON public.experts USING btree (department_id);

-- Table Policies

CREATE POLICY "Allow public read access to experts" ON public.experts
 AS PERMISSIVE
 FOR SELECT
 USING (true);


-- public.followup_rule_items 定义

-- Drop table

-- DROP TABLE public.followup_rule_items;

CREATE TABLE public.followup_rule_items (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	rule_id uuid NULL,
	"sequence" int4 NOT NULL,
	timing text NOT NULL,
	timing_days int4 NOT NULL,
	"content" _text NULL,
	examinations _text NULL,
	"method" text NOT NULL,
	CONSTRAINT followup_rule_items_pkey PRIMARY KEY (id),
	CONSTRAINT followup_rule_items_rule_id_sequence_key UNIQUE (rule_id, sequence),
	CONSTRAINT followup_rule_items_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES public.followup_rules(id) ON DELETE CASCADE
);


-- public.organizations 定义

-- Drop table

-- DROP TABLE public.organizations;

CREATE TABLE public.organizations (
	id text NOT NULL,
	"name" text NOT NULL,
	code text NULL,
	parent_id text NULL,
	"type" text DEFAULT 'department'::text NULL,
	description text NULL,
	status text DEFAULT 'active'::text NULL,
	sort_order int4 DEFAULT 0 NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT organizations_code_key UNIQUE (code),
	CONSTRAINT organizations_pkey PRIMARY KEY (id),
	CONSTRAINT organizations_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.organizations(id)
);
CREATE INDEX idx_organizations_parent_id ON public.organizations USING btree (parent_id);
CREATE INDEX idx_organizations_status ON public.organizations USING btree (status);
CREATE INDEX idx_organizations_type ON public.organizations USING btree (type);


-- public.patients 定义

-- Drop table

-- DROP TABLE public.patients;

CREATE TABLE public.patients (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	gender text NOT NULL,
	age int4 NOT NULL,
	birth_date date NULL,
	inpatient_no text NOT NULL,
	outpatient_no text NULL,
	id_card text NULL,
	phone text NULL,
	address text NULL,
	department_id uuid NULL,
	department text NULL,
	doctor_id uuid NULL,
	doctor text NULL,
	admission_time date NULL,
	discharge_time date NULL,
	main_diagnosis text NULL,
	diagnosis_code text NULL,
	tnm_stage text NULL,
	allergies _text NULL,
	history _text NULL,
	insurance_type text NULL,
	economic_status text NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	imaging_exams text NULL,
	ai_evaluation text NULL,
	ai_mdt_suggestion text NULL,
	last_consultation_time timestamptz NULL,
	bed_no text NULL,
	nursing_level text NULL,
	weight numeric NULL,
	height numeric NULL,
	ecog_score int4 NULL,
	physical_exam text NULL,
	initial_diagnosis text NULL,
	treatment_plan text NULL,
	chief_complaint text NULL,
	present_illness text NULL,
	past_history text NULL,
	auxiliary_examination text NULL,
	CONSTRAINT patients_inpatient_no_key UNIQUE (inpatient_no),
	CONSTRAINT patients_pkey PRIMARY KEY (id),
	CONSTRAINT patients_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);
CREATE INDEX idx_patients_inpatient_no ON public.patients USING btree (inpatient_no);
CREATE INDEX idx_patients_name ON public.patients USING btree (name);


-- public.permissions 定义

-- Drop table

-- DROP TABLE public.permissions;

CREATE TABLE public.permissions (
	id text NOT NULL,
	code text NOT NULL,
	"name" text NOT NULL,
	description text NULL,
	"module" text NULL,
	parent_id text NULL,
	sort_order int4 DEFAULT 0 NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT permissions_code_key UNIQUE (code),
	CONSTRAINT permissions_pkey PRIMARY KEY (id),
	CONSTRAINT permissions_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.permissions(id)
);
CREATE INDEX idx_permissions_module ON public.permissions USING btree (module);
CREATE INDEX idx_permissions_parent_id ON public.permissions USING btree (parent_id);


-- public.roles 定义

-- Drop table

-- DROP TABLE public.roles;

CREATE TABLE public.roles (
	id text NOT NULL,
	"name" text NOT NULL,
	code text NOT NULL,
	description text NULL,
	org_required bool DEFAULT false NULL,
	restricted_org_id text NULL,
	status text DEFAULT 'active'::text NULL,
	sort_order int4 DEFAULT 0 NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT roles_code_key UNIQUE (code),
	CONSTRAINT roles_pkey PRIMARY KEY (id),
	CONSTRAINT roles_restricted_org_id_fkey FOREIGN KEY (restricted_org_id) REFERENCES public.organizations(id)
);
CREATE INDEX idx_roles_restricted_org_id ON public.roles USING btree (restricted_org_id);
CREATE INDEX idx_roles_status ON public.roles USING btree (status);


-- public.users 定义

-- Drop table

-- DROP TABLE public.users;

CREATE TABLE public.users (
	id text NOT NULL,
	username text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	email text NULL,
	phone text NULL,
	org_id text NULL,
	"position" text NULL,
	avatar text NULL,
	status text DEFAULT 'active'::text NULL,
	last_login timestamptz NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT users_pkey PRIMARY KEY (id),
	CONSTRAINT users_username_key UNIQUE (username),
	CONSTRAINT users_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id)
);
CREATE INDEX idx_users_org_id ON public.users USING btree (org_id);
CREATE INDEX idx_users_status ON public.users USING btree (status);
CREATE INDEX idx_users_username ON public.users USING btree (username);


-- public.consultations 定义

-- Drop table

-- DROP TABLE public.consultations;

CREATE TABLE public.consultations (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	consultation_no text NULL,
	patient_id uuid NULL,
	patient_name text NOT NULL,
	patient_inpatient_no text NULL,
	"type" text NOT NULL,
	category text NULL,
	status text NOT NULL,
	urgency text NOT NULL,
	department_id uuid NULL,
	department text NOT NULL,
	apply_doctor_id uuid NULL,
	apply_doctor text NOT NULL,
	main_diagnosis text NULL,
	apply_time timestamptz DEFAULT now() NULL,
	expect_time timestamptz NULL,
	meeting_date date NULL,
	meeting_time text NULL,
	meeting_room_id uuid NULL,
	"location" text NULL,
	conclusion_summary text NULL,
	conclusion_recommendations _text NULL,
	treatment_plan text NULL,
	material_status text NULL,
	submit_time timestamptz NULL,
	meeting_record text NULL,
	consultation_report text NULL,
	recording_url text NULL,
	video_url text NULL,
	his_data_synced bool DEFAULT false NULL,
	his_sync_time timestamptz NULL,
	reject_reason text NULL,
	ai_assessment_result jsonb NULL,
	screening_level text NULL,
	"source" text DEFAULT 'doctor'::text NULL,
	patient_apply_record_id uuid NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	consultation_code text NULL,
	summary text NULL,
	expert_ids _text NULL,
	medical_records jsonb NULL,
	uploaded_files jsonb NULL,
	director_id varchar(255) NULL,
	secretary_id varchar(255) NULL,
	CONSTRAINT consultations_consultation_no_key UNIQUE (consultation_no),
	CONSTRAINT consultations_pkey PRIMARY KEY (id),
	CONSTRAINT consultations_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
	CONSTRAINT consultations_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE INDEX idx_consultations_apply_time ON public.consultations USING btree (apply_time DESC);
CREATE INDEX idx_consultations_code ON public.consultations USING btree (consultation_code);
CREATE INDEX idx_consultations_director_id ON public.consultations USING btree (director_id);
CREATE INDEX idx_consultations_patient ON public.consultations USING btree (patient_id);
CREATE INDEX idx_consultations_secretary_id ON public.consultations USING btree (secretary_id);
CREATE INDEX idx_consultations_status ON public.consultations USING btree (status);


-- public.followup_plans 定义

-- Drop table

-- DROP TABLE public.followup_plans;

CREATE TABLE public.followup_plans (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	consultation_id uuid NULL,
	patient_id uuid NULL,
	patient_name text DEFAULT 'unknown'::text NOT NULL,
	rule_id uuid NULL,
	start_date date DEFAULT now() NOT NULL,
	end_date date DEFAULT now() NOT NULL,
	next_followup_date date DEFAULT now() NOT NULL,
	purpose text DEFAULT '常规随访'::text NOT NULL,
	status text NOT NULL,
	doctor_id uuid NULL,
	doctor text DEFAULT 'system'::text NOT NULL,
	notes text NULL,
	last_followup_result text NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	"type" text NULL,
	plan_date timestamptz NULL,
	note text NULL,
	CONSTRAINT followup_plans_pkey PRIMARY KEY (id),
	CONSTRAINT followup_plans_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id),
	CONSTRAINT followup_plans_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id),
	CONSTRAINT followup_plans_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES public.followup_rules(id)
);
CREATE INDEX idx_followup_plans_patient ON public.followup_plans USING btree (patient_id);
CREATE INDEX idx_followup_plans_status ON public.followup_plans USING btree (status);


-- public.followup_tasks 定义

-- Drop table

-- DROP TABLE public.followup_tasks;

CREATE TABLE public.followup_tasks (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	plan_id uuid NULL,
	"sequence" int4 NOT NULL,
	scheduled_date date NOT NULL,
	"content" _text NULL,
	examinations _text NULL,
	"method" text NOT NULL,
	status text NOT NULL,
	actual_date date NULL,
	"result" text NULL,
	notes text NULL,
	executor_id uuid NULL,
	reminder_sent bool DEFAULT false NULL,
	reminder_time timestamptz NULL,
	created_at timestamptz DEFAULT now() NULL,
	completed_at timestamptz NULL,
	CONSTRAINT followup_tasks_pkey PRIMARY KEY (id),
	CONSTRAINT followup_tasks_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.followup_plans(id) ON DELETE CASCADE
);
CREATE INDEX idx_followup_tasks_plan ON public.followup_tasks USING btree (plan_id);


-- public.imaging_exams 定义

-- Drop table

-- DROP TABLE public.imaging_exams;

CREATE TABLE public.imaging_exams (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	patient_id uuid NULL,
	consultation_id uuid NULL,
	"type" text NOT NULL,
	exam_date date NOT NULL,
	exam_body text NOT NULL,
	findings text NOT NULL,
	impression text NOT NULL,
	report_doctor text NULL,
	report_url text NULL,
	image_url text NULL,
	dicom_study_uid text NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT imaging_exams_pkey PRIMARY KEY (id),
	CONSTRAINT imaging_exams_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id),
	CONSTRAINT imaging_exams_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE INDEX idx_imaging_exams_patient ON public.imaging_exams USING btree (patient_id);


-- public.lab_tests 定义

-- Drop table

-- DROP TABLE public.lab_tests;

CREATE TABLE public.lab_tests (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	patient_id uuid NULL,
	consultation_id uuid NULL,
	test_name text NOT NULL,
	test_date date NOT NULL,
	test_item text NOT NULL,
	"result" text NOT NULL,
	unit text NOT NULL,
	reference_range text NOT NULL,
	flag text NULL,
	report_url text NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT lab_tests_pkey PRIMARY KEY (id),
	CONSTRAINT lab_tests_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id),
	CONSTRAINT lab_tests_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE INDEX idx_lab_tests_patient ON public.lab_tests USING btree (patient_id);


-- public.medical_records 定义

-- Drop table

-- DROP TABLE public.medical_records;

CREATE TABLE public.medical_records (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	patient_id uuid NULL,
	consultation_id uuid NULL,
	chief_complaint text NULL,
	present_illness text NULL,
	past_history text NULL,
	physical_examination text NULL,
	auxiliary_examination text NULL,
	initial_diagnosis text NULL,
	treatment_plan text NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT medical_records_pkey PRIMARY KEY (id),
	CONSTRAINT medical_records_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id),
	CONSTRAINT medical_records_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);


-- public.meeting_schedules 定义

-- Drop table

-- DROP TABLE public.meeting_schedules;

CREATE TABLE public.meeting_schedules (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	room_id uuid NULL,
	consultation_id uuid NULL,
	"date" date NOT NULL,
	time_slot text NOT NULL,
	status text DEFAULT 'booked'::text NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT meeting_schedules_pkey PRIMARY KEY (id),
	CONSTRAINT meeting_schedules_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id),
	CONSTRAINT meeting_schedules_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.meeting_rooms(id) ON DELETE CASCADE
);


-- public.other_exams 定义

-- Drop table

-- DROP TABLE public.other_exams;

CREATE TABLE public.other_exams (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	patient_id uuid NULL,
	consultation_id uuid NULL,
	exam_type text NOT NULL,
	exam_date date NOT NULL,
	findings text NOT NULL,
	conclusion text NOT NULL,
	report_url text NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT other_exams_pkey PRIMARY KEY (id),
	CONSTRAINT other_exams_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id),
	CONSTRAINT other_exams_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);


-- public.pathology_reports 定义

-- Drop table

-- DROP TABLE public.pathology_reports;

CREATE TABLE public.pathology_reports (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	patient_id uuid NULL,
	consultation_id uuid NULL,
	report_date date NOT NULL,
	sample_type text NOT NULL,
	sample_site text NOT NULL,
	microscopic_findings text NOT NULL,
	pathological_diagnosis text NOT NULL,
	immunohistochemistry text NULL,
	molecular_test text NULL,
	report_doctor text NULL,
	report_url text NULL,
	slide_image_url text NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT pathology_reports_pkey PRIMARY KEY (id),
	CONSTRAINT pathology_reports_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id),
	CONSTRAINT pathology_reports_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE INDEX idx_pathology_reports_patient ON public.pathology_reports USING btree (patient_id);


-- public.patient_users 定义

-- Drop table

-- DROP TABLE public.patient_users;

CREATE TABLE public.patient_users (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	phone text NOT NULL,
	"password" text NULL,
	wechat_openid text NULL,
	wechat_unionid text NULL,
	patient_id uuid NULL,
	"name" text NOT NULL,
	gender text NULL,
	age int4 NULL,
	birth_date date NULL,
	id_card text NULL,
	medical_card_no text NULL,
	insurance_no text NULL,
	insurance_type text NULL,
	emergency_contact text NULL,
	emergency_phone text NULL,
	emergency_relation text NULL,
	status text DEFAULT 'active'::text NULL,
	last_login_time timestamptz NULL,
	last_login_ip text NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT patient_users_phone_key UNIQUE (phone),
	CONSTRAINT patient_users_pkey PRIMARY KEY (id),
	CONSTRAINT patient_users_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id)
);
CREATE INDEX idx_patient_users_phone ON public.patient_users USING btree (phone);
ALTER TABLE public.patient_users ENABLE ROW LEVEL SECURITY;


-- public.quality_tasks 定义

-- Drop table

-- DROP TABLE public.quality_tasks;

CREATE TABLE public.quality_tasks (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	consultation_id uuid NULL,
	patient_name text NOT NULL,
	department_id uuid NULL,
	department text NOT NULL,
	meeting_date date NOT NULL,
	material_score int4 NULL,
	process_score int4 NULL,
	total_score numeric(5, 2) NULL,
	status text NOT NULL,
	reviewer_id uuid NULL,
	review_time timestamptz NULL,
	review_comments text NULL,
	rectification_deadline date NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT quality_tasks_pkey PRIMARY KEY (id),
	CONSTRAINT quality_tasks_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id),
	CONSTRAINT quality_tasks_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);
CREATE INDEX idx_quality_tasks_consultation ON public.quality_tasks USING btree (consultation_id);


-- public.role_permissions 定义

-- Drop table

-- DROP TABLE public.role_permissions;

CREATE TABLE public.role_permissions (
	role_id text NOT NULL,
	permission_id text NOT NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id),
	CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE,
	CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE
);
CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions USING btree (permission_id);
CREATE INDEX idx_role_permissions_role_id ON public.role_permissions USING btree (role_id);


-- public.user_roles 定义

-- Drop table

-- DROP TABLE public.user_roles;

CREATE TABLE public.user_roles (
	id serial4 NOT NULL,
	user_id text NULL,
	role_id text NULL,
	org_id text NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT user_roles_pkey PRIMARY KEY (id),
	CONSTRAINT user_roles_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
	CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE,
	CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_user_roles_org_id ON public.user_roles USING btree (org_id);
CREATE INDEX idx_user_roles_role_id ON public.user_roles USING btree (role_id);
CREATE UNIQUE INDEX idx_user_roles_unique ON public.user_roles USING btree (user_id, role_id, COALESCE(org_id, 'NULL'::text));
CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


-- public.audit_history 定义

-- Drop table

-- DROP TABLE public.audit_history;

CREATE TABLE public.audit_history (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	consultation_id uuid NULL,
	node text DEFAULT 'default'::text NOT NULL,
	operator_id uuid NULL,
	"operator" text DEFAULT 'system'::text NOT NULL,
	operator_role text DEFAULT 'system'::text NOT NULL,
	"time" timestamptz DEFAULT now() NOT NULL,
	"result" text DEFAULT 'pending'::text NOT NULL,
	opinion text NULL,
	reject_reason text NULL,
	next_node text NULL,
	created_at timestamptz DEFAULT now() NULL,
	"comment" text NULL,
	CONSTRAINT audit_history_pkey PRIMARY KEY (id),
	CONSTRAINT audit_history_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id) ON DELETE CASCADE
);
CREATE INDEX idx_audit_history_consultation ON public.audit_history USING btree (consultation_id);


-- public.case_library 定义

-- Drop table

-- DROP TABLE public.case_library;

CREATE TABLE public.case_library (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	consultation_id uuid NULL,
	case_no text NULL,
	case_title text NOT NULL,
	primary_diagnosis text NOT NULL,
	icd10 text NULL,
	secondary_diagnoses _text NULL,
	tnm_stage text NULL,
	disease_type text NULL,
	tags _text NULL,
	is_typical bool DEFAULT false NULL,
	is_favorite bool DEFAULT false NULL,
	favorite_count int4 DEFAULT 0 NULL,
	view_count int4 DEFAULT 0 NULL,
	download_count int4 DEFAULT 0 NULL,
	learning_count int4 DEFAULT 0 NULL,
	quality_score numeric(5, 2) NULL,
	reviewer_id uuid NULL,
	review_date date NULL,
	review_comments text NULL,
	visibility text DEFAULT 'public'::text NULL,
	owner_id uuid NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT case_library_case_no_key UNIQUE (case_no),
	CONSTRAINT case_library_pkey PRIMARY KEY (id),
	CONSTRAINT case_library_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id)
);
CREATE INDEX idx_case_library_consultation ON public.case_library USING btree (consultation_id);


-- public.consultation_experts 定义

-- Drop table

-- DROP TABLE public.consultation_experts;

CREATE TABLE public.consultation_experts (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	consultation_id uuid NULL,
	expert_id uuid NULL,
	"role" text NULL,
	opinion text NULL,
	status text DEFAULT 'invited'::text NULL,
	confirm_time timestamptz NULL,
	attendance_status text NULL,
	signature text NULL,
	created_at timestamptz DEFAULT now() NULL,
	expert_name text NULL,
	expert_role text NULL,
	expert_department text NULL,
	invite_time timestamptz DEFAULT now() NULL,
	response_time timestamptz NULL,
	response_reason text NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT consultation_experts_consultation_id_expert_id_key UNIQUE (consultation_id, expert_id),
	CONSTRAINT consultation_experts_pkey PRIMARY KEY (id),
	CONSTRAINT consultation_experts_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id) ON DELETE CASCADE,
	CONSTRAINT consultation_experts_expert_id_fkey FOREIGN KEY (expert_id) REFERENCES public.experts(id)
);
CREATE INDEX idx_consultation_experts_consultation ON public.consultation_experts USING btree (consultation_id);
CREATE INDEX idx_consultation_experts_consultation_id ON public.consultation_experts USING btree (consultation_id);
CREATE INDEX idx_consultation_experts_expert_id ON public.consultation_experts USING btree (expert_id);
CREATE INDEX idx_consultation_experts_status ON public.consultation_experts USING btree (status);


-- public.patient_apply_records 定义

-- Drop table

-- DROP TABLE public.patient_apply_records;

CREATE TABLE public.patient_apply_records (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	apply_no text NULL,
	patient_user_id uuid NULL,
	patient_name text NOT NULL,
	patient_gender text NULL,
	patient_age int4 NULL,
	patient_phone text NOT NULL,
	medical_card_no text NULL,
	target_hospital text NOT NULL,
	target_department text NOT NULL,
	consultation_type text NOT NULL,
	chief_complaint text NOT NULL,
	present_illness text NOT NULL,
	past_history text NULL,
	initial_diagnosis text NOT NULL,
	diagnosis_hospital text NULL,
	status text NOT NULL,
	review_opinion text NULL,
	reject_reason text NULL,
	reviewer_id uuid NULL,
	review_time timestamptz NULL,
	consultation_id uuid NULL,
	converted_time timestamptz NULL,
	converted_by uuid NULL,
	created_at timestamptz DEFAULT now() NULL,
	updated_at timestamptz DEFAULT now() NULL,
	CONSTRAINT patient_apply_records_apply_no_key UNIQUE (apply_no),
	CONSTRAINT patient_apply_records_pkey PRIMARY KEY (id),
	CONSTRAINT patient_apply_records_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id),
	CONSTRAINT patient_apply_records_patient_user_id_fkey FOREIGN KEY (patient_user_id) REFERENCES public.patient_users(id)
);
CREATE INDEX idx_patient_apply_patient ON public.patient_apply_records USING btree (patient_user_id);
CREATE INDEX idx_patient_apply_status ON public.patient_apply_records USING btree (status);


-- public.patient_uploaded_files 定义

-- Drop table

-- DROP TABLE public.patient_uploaded_files;

CREATE TABLE public.patient_uploaded_files (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	patient_user_id uuid NULL,
	apply_record_id uuid NULL,
	consultation_id uuid NULL,
	file_name text NOT NULL,
	file_type text NOT NULL,
	file_size int8 NOT NULL,
	file_category text NULL,
	storage_url text NOT NULL,
	thumbnail_url text NULL,
	preview_url text NULL,
	from_his bool DEFAULT false NULL,
	upload_source text NULL,
	upload_time timestamptz DEFAULT now() NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT patient_uploaded_files_pkey PRIMARY KEY (id),
	CONSTRAINT patient_uploaded_files_apply_record_id_fkey FOREIGN KEY (apply_record_id) REFERENCES public.patient_apply_records(id),
	CONSTRAINT patient_uploaded_files_consultation_id_fkey FOREIGN KEY (consultation_id) REFERENCES public.consultations(id),
	CONSTRAINT patient_uploaded_files_patient_user_id_fkey FOREIGN KEY (patient_user_id) REFERENCES public.patient_users(id)
);


-- public.case_favorites 定义

-- Drop table

-- DROP TABLE public.case_favorites;

CREATE TABLE public.case_favorites (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	case_id uuid NULL,
	user_id uuid NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT case_favorites_case_id_user_id_key UNIQUE (case_id, user_id),
	CONSTRAINT case_favorites_pkey PRIMARY KEY (id),
	CONSTRAINT case_favorites_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.case_library(id) ON DELETE CASCADE
);


-- public.patient_apply_audit 定义

-- Drop table

-- DROP TABLE public.patient_apply_audit;

CREATE TABLE public.patient_apply_audit (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	apply_record_id uuid NULL,
	node text NOT NULL,
	operator_id uuid NULL,
	"operator" text NOT NULL,
	operator_role text NOT NULL,
	"result" text NOT NULL,
	opinion text NULL,
	reject_reason text NULL,
	supplement_items _text NULL,
	audit_time timestamptz DEFAULT now() NULL,
	created_at timestamptz DEFAULT now() NULL,
	CONSTRAINT patient_apply_audit_pkey PRIMARY KEY (id),
	CONSTRAINT patient_apply_audit_apply_record_id_fkey FOREIGN KEY (apply_record_id) REFERENCES public.patient_apply_records(id) ON DELETE CASCADE
);