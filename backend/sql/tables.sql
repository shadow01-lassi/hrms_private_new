CREATE TABLE changelog (
	c_id SERIAL PRIMARY KEY,
	c_version VARCHAR(10),
	c_date DATE,
	c_title TEXT,
	c_description TEXT,
	c_improvements TEXT[],
	c_fixes TEXT[],
	c_patches TEXT[]
);
-- 
-- 
create table role_master (
    rm_id SERIAL PRIMARY KEY,
    rm_name VARCHAR,
    rm_access INTEGER [],
	rm_create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	rm_create_by VARCHAR(30),
	rm_last_update_date TIMESTAMP,
    rm_description TEXT,
	rm_last_update_by VARCHAR(30)
);
-- 
-- 
CREATE TABLE permission_master (
	pm_id SERIAL PRIMARY KEY,
	pm_code VARCHAR(100),
	pm_description TEXT
);
-- 
-- 
CREATE TABLE role_permissions (
    rp_id SERIAL PRIMARY KEY,
    rp_rm_id INTEGER REFERENCES role_master(rm_id),
    rp_pm_id INTEGER REFERENCES permission_master(pm_id)
);
-- 
-- 
CREATE TABLE menu_master (
    mm_id SERIAL PRIMARY KEY,
    mm_name VARCHAR NOT NULL,
    mm_parent_id INTEGER,
    mm_label VARCHAR,
	mm_access_type VARCHAR(5),
    mm_pm_id INTEGER REFERENCES permission_master(pm_id),
    mm_order SMALLINT,
    mm_link VARCHAR(255),
    mm_icon VARCHAR(255)
);
-- 
-- 
CREATE TABLE reason_master (
	rm_id SERIAL PRIMARY KEY,
	rm_reason_title VARCHAR(256),
	rm_reason_description TEXT
);
-- 
-- 
CREATE TABLE company_master (
	cm_id SERIAL PRIMARY KEY,
	cm_name VARCHAR(255) NOT NULL,
	cm_status BOOLEAN DEFAULT true,
	cm_create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	cm_create_by VARCHAR(30),
	cm_last_update_date TIMESTAMP,
	cm_last_update_by VARCHAR(30),
	cm_registration_no VARCHAR(50),
	cm_pan_no VARCHAR(10),
	cm_gstin_no VARCHAR(15),
	cm_logo TEXT,
    cm_go_ahead_flag BOOLEAN,
    cm_is_deactivated BOOLEAN DEFAULT FALSE,
    cm_deactivation_reason_id INTEGER REFERENCES reason_master (rm_id),
    cm_acc_name VARCHAR(100),
    cm_acc_no VARCHAR(100),
    cm_ifsc VARCHAR(20),
    cm_acc_type VARCHAR(20),
    cm_branch_name VARCHAR(100),
    cm_upi_id VARCHAR(100)
);
-- 
-- 
CREATE TYPE subscription_type AS ENUM ('PAID_RECURRING', 'CUSTOM_CONTRACT');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'EXPIRED', 'IN_GRACE', 'SUSPENDED', 'CANCELLED');
-- 
-- 
CREATE TABLE company_subscription (
	cs_id SERIAL PRIMARY KEY,
	cs_cm_id INTEGER REFERENCES company_master (cm_id),
	cs_subscription_type subscription_type,
	cs_approved_by VARCHAR(30),
	cs_free_start_date DATE,
	cs_free_expected_end_date DATE,
	cs_free_actual_end_date DATE,
	cs_start_date DATE DEFAULT CURRENT_DATE,
	cs_expected_end_date DATE,
	cs_actual_end_date DATE,
	cs_grace_start_date DATE,
	cs_grace_end_date DATE,
	cs_total_amt NUMERIC(10,2),
	cs_paid_amt NUMERIC(10,2),
	cs_tax1 NUMERIC(10,2),
	cs_tax1_perc NUMERIC(10,2),
	cs_tax2 NUMERIC(10,2),
	cs_tax2_perc NUMERIC(10,2),
	cs_status subscription_status DEFAULT 'ACTIVE'
);
-- 
-- 
CREATE TABLE department_master (
    dm_id SERIAL PRIMARY KEY,
    dm_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    dm_name VARCHAR(100) NOT NULL,
    dm_code VARCHAR(10) NOT NULL,
    dm_status BOOLEAN DEFAULT TRUE,
    dm_create_by VARCHAR(30),
    dm_create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dm_update_by VARCHAR(30),
    dm_update_date TIMESTAMP,
    CONSTRAINT unique_dm_code_per_company UNIQUE (dm_cm_id, dm_code)
);
-- 
-- 
-- REPLACED position_master WITH DESIGNATION_MASTER AS PER OVERRIDE
CREATE TABLE designation_master (
    dm_id SERIAL PRIMARY KEY,
    dm_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    dm_name VARCHAR(100) NOT NULL,
    dm_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dm_created_by VARCHAR(30),
    dm_update_date TIMESTAMP,
    dm_update_by VARCHAR(30)
);
-- 
-- 
CREATE TABLE leave_type_master (
    ltm_id SERIAL PRIMARY KEY,
    ltm_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    ltm_name VARCHAR(50) NOT NULL,
    ltm_code VARCHAR(10) NOT NULL,
    ltm_is_paid BOOLEAN DEFAULT TRUE,
    ltm_status BOOLEAN DEFAULT TRUE,
    ltm_create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ltm_create_by VARCHAR(30),
    ltm_update_date TIMESTAMP,
    ltm_update_by VARCHAR(30),
    CONSTRAINT unique_ltm_code_per_company UNIQUE (ltm_cm_id, ltm_code)
);
-- 
-- 
CREATE TABLE holiday_master (
    hm_id SERIAL PRIMARY KEY,
    hm_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    hm_date DATE NOT NULL,
    hm_type VARCHAR(50), 
    hm_reason VARCHAR(200),
    hm_is_restricted BOOLEAN DEFAULT FALSE,
    hm_status BOOLEAN DEFAULT TRUE,
    hm_create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hm_create_by VARCHAR(30),
    hm_update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hm_update_by VARCHAR(30)
);
-- 
-- 
CREATE TABLE skill_master (
    sm_id SERIAL PRIMARY KEY,
    sm_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    sm_name VARCHAR(100) NOT NULL,
    sm_category VARCHAR(50),
    sm_status BOOLEAN DEFAULT TRUE,
    sm_create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sm_create_by VARCHAR(30),
    sm_update_date TIMESTAMP,
    sm_update_by VARCHAR(30),
    CONSTRAINT unique_sm_name_per_company UNIQUE (sm_cm_id, sm_name)
);
-- 
-- 
CREATE TABLE performance_review_cycles (
    prc_id SERIAL PRIMARY KEY,
    prc_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    prc_title VARCHAR(100) NOT NULL,
    prc_start_date DATE NOT NULL,
    prc_end_date DATE NOT NULL,
    prc_status VARCHAR(15) DEFAULT 'INITIATED',
    prc_create_by VARCHAR(30),
    prc_create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    prc_update_by VARCHAR(30),
    prc_update_date TIMESTAMP
);
-- 
-- 
CREATE TABLE expense_category_master (
    ecm_id SERIAL PRIMARY KEY,
    ecm_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    ecm_name VARCHAR(100) NOT NULL,
    ecm_status BOOLEAN DEFAULT TRUE,
    ecm_create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ecm_create_by VARCHAR(30),
	ecm_update_date TIMESTAMP,
	ecm_update_by VARCHAR(30)
);

-- ============================================================================
-- 2. MAIN IDENTITY BUCKETS (People & Deep Structural Profiles)
-- ============================================================================

-- MERGED EMPLOYEE MASTER LIVING BY CORE COMPLIANCE AND EXPANDED PARAMETERS
CREATE TABLE employee_master (
    em_id SERIAL PRIMARY KEY,
    em_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    em_employee_id VARCHAR(20) NOT NULL, -- Core identifier string card
    em_code VARCHAR(20),
    em_first_name VARCHAR(100) NOT NULL,
    em_last_name VARCHAR(100) NOT NULL,
    em_name VARCHAR(200), -- Consolidated complete string reference if required by API maps
    em_fname VARCHAR(100), -- Father name
    em_mname VARCHAR(100), -- Mother name
    em_lname VARCHAR(100),
    em_gender VARCHAR(10), -- Dynamic sizing adjustment
    em_date_of_birth DATE NOT NULL,
    em_birth_date DATE, -- Maintained mapping redundancy check safety parameters
    em_mobile VARCHAR(15) NOT NULL,
    em_landline VARCHAR(20),
    em_subscribe_mobile VARCHAR(15),
    em_work_email VARCHAR(100) NOT NULL,
    em_email VARCHAR(100),
    em_personal_email VARCHAR(100),
    em_address_line1 VARCHAR(150),
    em_address_line2 VARCHAR(150),
    em_address_line3 VARCHAR(150),
    em_local_state_id INTEGER,
    em_local_city VARCHAR(100),
    em_permanent_state_id INTEGER,
    em_permanent_city VARCHAR(100),
    em_contact_person VARCHAR(100),
    em_contact_no VARCHAR(15),
    em_area VARCHAR(100),
    em_hire_date DATE NOT NULL,
    em_join_date DATE,
    em_designation INTEGER REFERENCES designation_master(dm_id),
    em_company INTEGER REFERENCES company_master(cm_id),
    em_marital_status VARCHAR(80),
    em_spouse_name VARCHAR(80),
    em_blood_group VARCHAR(5),
    em_qualification VARCHAR(200),
    em_skills VARCHAR(500),
    em_notice_period VARCHAR(50),
    em_reporting_to VARCHAR(100),
    em_deactivation_date DATE,
    em_termination_date DATE,
    em_termination_reason VARCHAR(200),
    em_pro_employee INTEGER, -- Professional role mapping level flag
    em_status BOOLEAN DEFAULT TRUE,
    em_created_by VARCHAR(30), -- Overridden to VARCHAR(30) per explicit layout directive
    em_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    em_update_by VARCHAR(30), -- Overridden to VARCHAR(30)
    em_update_date TIMESTAMP,
    CONSTRAINT unique_em_id_string_per_company UNIQUE (em_cm_id, em_employee_id),
    CONSTRAINT unique_em_work_email_per_company UNIQUE (em_cm_id, em_work_email)
);

CREATE TABLE employee_kyc (
    ek_id SERIAL PRIMARY KEY,
    ek_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    ek_em_id INTEGER REFERENCES employee_master(em_id) NOT NULL,
    ek_display_pic VARCHAR(500),
    ek_proof_document1_type VARCHAR(50),
    ek_proof_document1_number VARCHAR(50),
    ek_prrof_document1_file VARCHAR(500), -- Maintained original naming blueprint safety matching
    ek_proof_document2_type VARCHAR(50),
    ek_proof_document2_number VARCHAR(50),
    ek_prrof_document2_file VARCHAR(500),
    ek_proof_document3_type VARCHAR(50),
    ek_proof_document3_number VARCHAR(50),
    ek_prrof_document3_file VARCHAR(500),
    ek_created_by VARCHAR(30), -- Overridden to VARCHAR(30)
    ek_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ek_update_by VARCHAR(30), -- Overridden to VARCHAR(30)
    ek_update_at TIMESTAMP
);

CREATE TABLE employee_login (
    el_id SERIAL PRIMARY KEY,
    el_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    el_em_id INTEGER REFERENCES employee_master(em_id) UNIQUE NOT NULL,
    el_username VARCHAR(50) NOT NULL,
    el_name VARCHAR(200),
    el_password VARCHAR(255) NOT NULL,
    el_role INTEGER NOT NULL, -- Integer structural level map preserved matching boss's rule configurations
    el_active BOOLEAN DEFAULT TRUE,
    el_last_logged_in VARCHAR(100),
    CONSTRAINT unique_login_username_per_company UNIQUE (el_cm_id, el_username)
);

-- ============================================================================
-- 3. TRANSACTIONAL / PAYROLL & COMPLIANCE ACTIVITIES
-- ============================================================================

CREATE TABLE employee_payroll (
    ep_id SERIAL PRIMARY KEY,
    ep_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    ep_em_id INTEGER REFERENCES employee_master(em_id) UNIQUE NOT NULL,
    ep_salary NUMERIC(12,2) NOT NULL,
    ep_increment_salary NUMERIC(12,2),
    ep_increment_status NUMERIC(2,0),
    ep_consider_in_payrool NUMERIC(1,0),
    ep_consider_in_mobile_attendance NUMERIC(1,0),
    ep_epf_no VARCHAR(50),
    ep_ta_percentage NUMERIC(5,2),
    ep_ta_amount NUMERIC(10,2),
    ep_da_percentage NUMERIC(5,2),
    ep_da_amount NUMERIC(10,2),
    ep_hra_percentage NUMERIC(5,2),
    ep_hra_amount NUMERIC(10,2),
    ep_yearly_leaves INTEGER DEFAULT 0,
    ep_unpaid_leaves INTEGER DEFAULT 0,
    ep_paid_leaves INTEGER DEFAULT 0,
    ep_epf_status INTEGER,
    ep_increment_amount INTEGER,
    ep_bank_name VARCHAR(100),
    ep_acc_name VARCHAR(100),
    ep_acc_no VARCHAR(100),
    ep_ifsc VARCHAR(20),
    ep_acc_type VARCHAR(20),
    ep_branch_name VARCHAR(100)
);

CREATE TABLE employee_leave_applications (
    ela_id SERIAL PRIMARY KEY,
    ela_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    ela_em_id INTEGER REFERENCES employee_master(em_id) NOT NULL,
    ela_leave_type VARCHAR(50) NOT NULL,
    ela_status VARCHAR(20) DEFAULT 'PENDING',
    ela_start_date DATE NOT NULL,
    ela_end_date DATE NOT NULL,
    ela_total_days INTEGER NOT NULL,
    ela_approved_date TIMESTAMP,
    ela_approved_by INTEGER REFERENCES employee_master(em_id),
    ela_paid_leave_count INTEGER DEFAULT 0,
    ela_unpaid_leave_count INTEGER DEFAULT 0,
    ela_leave_reason TEXT,
    ela_created_by VARCHAR(30),
    ela_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ela_update_by VARCHAR(30),
    ela_update_at TIMESTAMP
);

CREATE TABLE leave_balances (
    lb_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    lb_em_id INTEGER REFERENCES employee_master(em_id) NOT NULL,
    lb_ltm_id INTEGER REFERENCES leave_type_master(ltm_id) NOT NULL,
    lb_year INTEGER NOT NULL,
    lb_allocated NUMERIC(4,1) NOT NULL,
    lb_used NUMERIC(4,1) DEFAULT 0.0,
    lb_create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lb_create_by VARCHAR(30),
    lb_update_date TIMESTAMP,
    lb_update_by VARCHAR(30),
    PRIMARY KEY (lb_em_id, lb_ltm_id, lb_year)
);

CREATE TABLE attendance_logs (
    al_id BIGSERIAL PRIMARY KEY,
    al_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    al_em_id INTEGER REFERENCES employee_master(em_id) NOT NULL,
    al_date DATE NOT NULL,
    al_clock_in TIMESTAMP WITH TIME ZONE,
    al_clock_out TIMESTAMP WITH TIME ZONE,
    al_total_hours NUMERIC(4,2),
    al_status VARCHAR(20) DEFAULT 'PRESENT',
    al_create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    al_create_by VARCHAR(30),
    al_update_date TIMESTAMP,
    al_update_by VARCHAR(30),
    CONSTRAINT unique_attendance_per_emp_day UNIQUE (al_em_id, al_date)
);
-- 
-- 
CREATE TABLE salary_master (
    sm_id SERIAL PRIMARY KEY,
    sm_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    sm_em_id INTEGER REFERENCES employee_master(em_id) NOT NULL,
    sm_pay_month INTEGER NOT NULL,
    sm_pay_year INTEGER NOT NULL,
    sm_gross_salary NUMERIC(10,2),
    sm_tds_deducted NUMERIC(10,2),
    sm_other_deductions NUMERIC(10,2),
    sm_net_salary NUMERIC(10,2),
    sm_actual_paid_amount NUMERIC(10,2),
    sm_paid_date TIMESTAMP,
    sm_payment_status VARCHAR(20),
    sm_created_by VARCHAR(30),
    sm_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sm_updated_by VARCHAR(30),
    sm_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_salary_per_emp_period UNIQUE (sm_em_id, sm_pay_month, sm_pay_year)
);
-- 
-- 
CREATE TABLE salary_details (
    sd_sm_id INTEGER REFERENCES salary_master(sm_id) ON DELETE CASCADE,
    sd_component VARCHAR(50) NOT NULL, -- e.g., 'Unpaid Leave', 'Fines', 'Allowance'
    sd_amount NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (sd_sm_id, sd_component)
);
-- 
-- 
CREATE TABLE employee_expenses (
    ee_id SERIAL PRIMARY KEY,
    ee_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    ee_em_id INTEGER REFERENCES employee_master(em_id) NOT NULL,
    ee_ecm_id INTEGER REFERENCES expense_category_master(ecm_id) NOT NULL,
    ee_amt NUMERIC(10,2) NOT NULL,
    ee_desc VARCHAR(100),
    ee_proof VARCHAR(500),
    ee_status VARCHAR(20) DEFAULT 'PENDING',
    ee_payment_status VARCHAR(1) DEFAULT 'U', -- P=Paid | U=Unpaid
    ee_solved_remarks TEXT,
    ee_paid BOOLEAN DEFAULT FALSE,
    ee_pmt_mode VARCHAR(20),
    e_pmt_ref_no VARCHAR(50),
    ee_jv_posted VARCHAR(1) DEFAULT 'N', -- Y|N
    ee_pmt_posted VARCHAR(1) DEFAULT 'N', -- Y|N
    ee_created_by VARCHAR(30),
    ee_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ee_update_by VARCHAR(30),
    ee_update_at TIMESTAMP
);
-- 
-- 
CREATE TABLE employee_advances_deductions (
    ead_id SERIAL PRIMARY KEY,
    ead_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    ead_em_id INTEGER REFERENCES employee_master(em_id) NOT NULL,
    ead_type VARCHAR(1), -- A=ADVANCE | R=Reimbursement  | F=Deduction/Fine
    ead_amt NUMERIC(10,2) NOT NULL,
    ead_description VARCHAR(100),
    ead_status VARCHAR(20),
    ead_payment_status VARCHAR(1) DEFAULT 'U', -- P=Paid | U=Unpaid
    ead_pmt_type VARCHAR(20),
    ead_pmt_ref_no VARCHAR(50),
    ead_date DATE,
    ead_posted_yn VARCHAR(1) DEFAULT 'N',
    ead_solved_remarks TEXT,
    ead_pmt_date DATE,
    ead_created_by VARCHAR(30), -- Overridden to VARCHAR(30)
    ead_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ead_update_by VARCHAR(30), -- Overridden to VARCHAR(30)
    ead_update_date TIMESTAMP
);
-- 
-- 
CREATE TABLE employee_reviews (
    erw_id SERIAL PRIMARY KEY,
    erw_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    erw_em_id INTEGER REFERENCES employee_master(em_id) NOT NULL,
    erw_prc_id INTEGER REFERENCES performance_review_cycles(prc_id) NOT NULL,
    erw_reviewer_em_id INTEGER REFERENCES employee_master(em_id) NOT NULL,
    erw_self_rating NUMERIC(3,2),
    erw_manager_rating NUMERIC(3,2),
    erw_final_rating NUMERIC(3,2),
    erw_review_comments TEXT,
    erw_create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    erw_create_by VARCHAR(30),
    erw_update_date TIMESTAMP,
    erw_update_by VARCHAR(30)
);
-- 
-- 
CREATE TABLE employee_skills (
    esk_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    esk_em_id INTEGER REFERENCES employee_master(em_id) NOT NULL,
    esk_sm_id INTEGER REFERENCES skill_master(sm_id) NOT NULL,
    esk_proficiency_level VARCHAR(20) NOT NULL, -- BEGINNER | INTERMEDIATE | EXPERT
    esk_create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    esk_create_by VARCHAR(30),
    esk_update_date TIMESTAMP,
    esk_update_by VARCHAR(30),
    PRIMARY KEY (esk_em_id, esk_sm_id)
);
-- 
-- 
CREATE TABLE document_master (
    dmst_id SERIAL PRIMARY KEY,
    dmst_cm_id INTEGER REFERENCES company_master(cm_id) NOT NULL,
    dmst_em_id INTEGER REFERENCES employee_master(em_id) NOT NULL,
    dmst_doc_type VARCHAR(50) NOT NULL,
    dmst_doc_name VARCHAR(200) NOT NULL,
    dmst_file_path VARCHAR(500) NOT NULL,
    dmst_uploaded_date DATE DEFAULT CURRENT_DATE,
    dmst_status BOOLEAN DEFAULT TRUE,
    dmst_create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dmst_create_by VARCHAR(30),
    pt_last_update_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pt_last_update_by VARCHAR(30)
);
-- 
-- 