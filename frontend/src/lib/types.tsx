import { LucideProps } from "lucide-react";

export type ManagementSectionType = {
    announcements: {
        totalAnnouncementsThisYear: number;
        totalMeetingsCalledThisYear: number;
    };
    unitsAndUsers: {
        uniqueUsers: number;
        totalUnits: number;
        breakdown: {
            admins: number;
            usersNotLoggedIn: number;
            activeUsers: number;
            pendingVerification: number;
        };
    };
    helpdesk: {
        complaints: {
            personal: {
                total: number;
                highPriority: { pending: number; inProgress: number };
                pending: number;
                inProgress: number;
                resolved: number;
            };
            openArea: {
                total: number;
                highPriority: { pending: number; inProgress: number };
                pending: number;
                inProgress: number;
                resolved: number;
            };
        };
        documentRequests: {
            active: number;
            pending: number;
        };
    };
    amenitiesAndHallBookings: {
        totalAmenities: number;
        totalBookingsThisMonth: number;
        pendingHallBookingRequests: number;
        hallBookingsPendingDetails: {
            id: number;
            hallName: string;
            requestedBy: string;
            date: string;
            status: string;
        }[];
    };
};

export type GatekeeperSectionType = {
    dailyVisitors: {
        totalIn: number;
        stillInside: number;
    };
    staffMembers: {
        totalIn: number;
        stillInside: number;
    };
    alerts: {
        panicAlertsThisMonth: number;
        missingVisitorsThisMonth: number;
    };
}

export type AccountsSectionType = {
    incomeTracker: {
        totalBillsGeneratedThisYear: number;
        totalAmountGenerated: number;
        totalAmountCollected: number;
        totalAmountBalance: number;
        quarterlyData: {
            quarter: string;
            billsCreated: number;
            amountGenerated: number;
            amountCollected: number;
        }[];
    };
    expenseTracker: {
        quarterlyExpenses: {
            quarter: string;
            amount: number;
        }[];
        totalExpensesThisYear: number;
    };
    bankAndCash: {
        totalAmount: number;
        accounts: {
            name: string;
            type: string;
            accountNumber: string | null;
            balance: number;
        }[];
    };
    duesTracker: {
        totalDefaulters: number;
        totalAmountDue: number;
    };
}

export type DashboardDataType = {
    management: ManagementSectionType;
    gatekeeper: GatekeeperSectionType;
    accounts: AccountsSectionType;
}

export type SessionUserType = {
    username: string;
    email: string;
    mobile: string;
    flat: string;
    access: string;
    exp: number;
    iat: number;
    id: number;
    name: string;
    role: number;
};

export type OnboardingUserType = {
    cm_id: number;
    cm_name: string;
    cm_email: string;
    clientId: string;
    username?: string;
};

export type ChangeLogType = {
    c_id: number;
    c_version: string;
    c_date: string;
    c_title: string;
    c_description: string;
    c_improvements: string[];
    c_fixes: string[];
    c_patches: string[];
};

export type StepStatus = "completed" | "current" | "pending" | "verifying";

export type OnboardingStep = {
    stepNumber: number;
    title: string;
    description: string;
    link: string;
    status: StepStatus;
}

export type CRUDType = {
    create: boolean,
    read: boolean,
    update: boolean,
    delete: boolean
}

export type TablePermissions = {
    read?: string;
    create?: string;
    update?: string;
    delete?: string;
    exportExcel?: string;
    exportCsv?: string;
    exportPdf?: string;
    exportEmail?: string;
}

export type RoleType = {
    rm_id: number;
    rm_name: string;
    rm_access: number[];
    rm_description?: string;
};

export type PermissionType = {
    pm_id: number;
    pm_code: string;
    pm_description: string;
};

export type PageConfig = {
    path: string;    // The pattern, e.g., "/dashboard/users/:userId"
    pageId: string;  // The backend ID
    help?: Record<string, unknown>;
    module: string;
    subModule?: string;
    requiredPermission?: string;
};

export type RoleAccessManageType = {
    mm_name: string;
    mm_id: number;
    ra_create: boolean;
    ra_read: boolean;
    ra_update: boolean;
    ra_delete: boolean
}

export type SidebarItemsType = {
    mm_id: number;
    mm_name: string;
    mm_parent_id: number | null;
    mm_label: string;
    mm_icon?: string;
    mm_link?: string;
    mm_order?: number;
    mm_access_type?: string;
    mm_cm_id?: number | null;
    mm_pm_id?: number | null;
};

export type StaticSidebarItemsType = {
    title: string;
    url: string;
    permission: string;
    isActive?: boolean;
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
    items: {
        title: string;
        url: string;
        permission: string;
    }[];
};

export type SidebarItemsTreeType = {
    name: string;
    children: number[];
    id: number,
    parent: number | null
};

export type MenuItemType = {
    mm_id: number;
    mm_name: string;
    mm_parent_id: number | null;
    mm_icon?: string;
    mm_label: string;
    mm_link?: string;
    mm_order?: number;
    mm_access_type?: string;
    mm_cm_id?: number | null;
    mm_pm_id?: number | null;
    children?: MenuItemType[];
}

export type Blogs = {
    id: number,
    title: string,
    description: string;
    cover_image: string;
    content: string;
    slug: string;
    created_at: string;
    updated_at: string;
    comments_enabled: string;
    category_id: number;
    category_name: string;
    subcategory_id: number;
    subcategory_name: string;
    comment_count: string;
    reaction_count: string;
    like_count: number;
    view_count: number;
}

export type DraftBlogs = {
    id: number,
    title: string,
    description: string,
    created_at: string,
    updated_at: string,
    subcategory_id: number
}

export type DeletedBlogs = {
    id: number,
    title: string,
    description: string,
    created_at: string,
    updated_at: string
    comment_count: string,
    reaction_count: string,
}

export type Category = {
    id: number,
    name: string
}

export interface SubCategory extends Category {
    category_id: number
}

export type Comment = {
    id: number;
    username: string;
    created_at: string;
    content: string;
}

export type ReactionData = {
    label: string;
    value: number;
}

export type User = {
    id: number;
    username: string;
    email: string;
    joined_at: string;
}

export type DeletedUser = {
    user_id: number,
    username: string;
    email: string;
    deleted_at: string;
    id: number
}

export type HallMasterType = {
    hm_cm_id: number;
    hm_id: number;
    hm_name: string;
    hm_image?: string | null;
    hm_capacity: number;
    hm_price: number;
    hm_status: boolean;
    hm_create_date: string;
    hm_create_by: string;
    hm_last_update_date: string | null;
    hm_last_update_by: number | null;
};

// types/reports.ts
export interface Report {
    qr_id: number;
    qr_name: string;
    qr_desc: string;
    qr_sql_query: string;
    parameters: ReportParameter[];
}

export interface ReportParameter {
    label: string;
    dataType: string;
    lovQuery?: string;
    isRequired: boolean;
    options?: any[]; // Options for select inputs
}

export interface ReportData {
    columns: string[];
    rows: any[];
    totalCount?: number;
}

export interface ReportRequest {
    reportId: number;
    params: Record<string, any>;
    page?: number;
    pageSize?: number;
    search?: string;
}

export type RequestType = {
    r_cm_id: number;
    r_id: number;
    r_type: string;
    r_description: string;
    r_status: string;
    r_admin_comment: string;
    r_flat_no: string;
    flat_no: string;
    r_create_date: string;
    r_create_by: string;
    r_last_edited_by: string;
    r_last_edited_at: string;
}

// ========================================
// ACCOUNTS TYPES
// ========================================
export type CompanyMasterShortType = {
    cm_id: number;
    cm_name: string;
    cm_abrevation: string;
    cm_mobile: string;
    cm_alt_mobile: string;
    cm_email: string;
    cm_pan: string;
    cm_gstin: string;
    cm_registration_no: string;
    cm_logo: string;
    cm_address: string;
    cm_description: string;
    cm_go_ahead_flag: boolean;
    cm_is_deactivated: boolean;
    cm_deactivation_reason_id: number;
    deactivation_reason: string;
    deactivation_description: string;

    // Subscription fields
    cs_id?: number;
    cs_subscription_type?: string;
    cs_status?: string;
    cs_start_date?: string;
    cs_expected_end_date?: string;
    cs_actual_end_date?: string;
    cs_free_start_date?: string;
    cs_free_expected_end_date?: string;
    cs_grace_start_date?: string;
    cs_grace_end_date?: string;
    cs_total_amt?: number;
    cs_paid_amt?: number;
};

export type TableType = {
    table_name: string;
    print_name: string;
}

export type TableSchemaType = {
    column_name: string;
    constraint_name: string;
    constraint_type: string;
    data_type: string;
    is_nullable: string;
};

export type AccountMasterLinkageType = {
    am_display_name: string;
    am_description: string;
};

export type GroupMasterType = {
    gm_id: number;
    gm_name: string;
    gm_parent_name: string | null;
    gm_type: string;
    gm_status: boolean;
};

export type AccountMasterType = {
    am_id: number;
    am_name: string;
    am_gm_id: number;
    am_status: boolean;
};

export type AccountMasterDisplayType = {
    am_cm_id: number;
    am_id: number;
    am_name: string;
    am_gm_id: number;
    am_group: string;
    am_status: boolean;
    gm_type: string;
    gm_parent_name: string | null;
    am_client_control: string;
    am_link_to: string;
    am_link_key: string;
    am_link_value: string;
};

export type SubAccountFormDropdownType = {
    key: string;
    value: string;
    type: string;
};

export type SubAccountMasterType = {
    sam_id: number;
    sam_code: string;
    sam_name: string;
    sam_address_l1: string;
    sam_address_l2: string;
    sam_address_l3: string;
    sam_city: string;
    sam_state: string;
    sam_country: string;
    sam_pincode: string;
    sam_pan_no: string;
    sam_mobile: string;
    sam_mobile2: string;
    sam_am_id: number;
    sam_status: boolean;
    am_name: string;
};

export type BookMasterType = {
    bm_id: number;
    bm_book_code: string;
    bm_book_name: string;
    bm_am_id: number;
    bm_book_type: string;
};

export type BookMasterDisplayType = {
    bm_id: number;
    bm_book_code: string;
    bm_book_name: string;
    bm_account: number;
    bm_book_type: string;
};

export type BankCashEntryFormType = {
    date: string;
    effectiveDate: string;
    book: string;
    bookBalance: string;
    rows: {
        account: string;
        subAccount: string;
        paymentType: string;
        paymentDetail: string;
        amount: number;
        drCr: string;
        naration: string;
    }[]
};

export type JVEntryFormType = {
    date: string;
    effectiveDate: string;
    book: string;
    bookBalance: string;
    rows: {
        account: string;
        accountName?: string;
        subAccount?: string;
        subAccountName?: string;
        paymentType: string;
        paymentDetail: string;
        debit: number;
        credit: number;
        naration: string;
    }[]
};

export type BankCashEntriesDisplayType = {
    txn_id: number;
    txn_month: string;
    txn_date: string;
    txn_effective_date: string;
    txn_type: string;
    txn_voucher_no: number;
    txn_book_code: string;
    txn_am_id: number;
    am_name: string;
    receipt: number;
    payment: number;
    running_balance: number;
    reco?: boolean;
    recoDate?: string;
};

export type FinYearType = {
    fy_id: number;
    fy_code: string;
    fy_start_date: string;
    fy_end_date: string;
    fy_remarks: string;
};

export type ExpenseOverviewType = {
    fiscal_year: string;
    quarter: string;
    total_billed: number;
    total_other_debits: number;
    total_collection: number;
    total_investment_made: number;
    total_investments_withdrawn: number;
    total_expenses: number;
}

export type QuarterlyExpenseType = {
    out_fy_id: string;
    out_qtr: string;
    out_txn_date: string;
    out_am_id: number;
    out_am_name: string;
    out_naration: string;
    out_total_expenses: number;
};

export type TransactionsTableType = {
    txn_id: number;
    txn_type: string;
    txn_date: string;
    txn_effective_date: string;
    txn_voucher_no: number;
    txn_line_no: number;
    txn_am_id: number;
    txn_sam_id: number | null;
    txn_payment_type: string;
    txn_chq_no: string;
    txn_amount: number;
    txn_drcr_flag: string;
    txn_naration: string;
    txn_bill_ref: string;
    txn_fy_id: string;
    txn_book_code: string;
    txn_reco: boolean;
    txn_reco_date: string | null;
};

export type LinkedDataItem = {
    key: string;
    value: string;
};

export type TransactionsType = {
    book: string;
    date: string;
    effectiveDate: string;
    rows: {
        lineNo: number;
        drCr: string;
        amount: number;
        account: string;
        accountName: string;
        naration: string;
        subAccount: string;
        subAccountName: string;
        accountType: string;
        paymentType: string;
        paymentDetail: string;
    }[]
};

export type JVTransactionType = {
    book: string;
    date: string;
    effectiveDate: string;
    rows: {
        lineNo: number;
        amount: number;
        account: string;
        accountName: string;
        subAccount: string;
        subAccountName: string;
        naration: string;
        debit: string;
        credit: string;
        paymentDetail: string;
    }[]
};

export type DNCNTransactionType = {
    book: string;
    date: string;
    effectiveDate: string;
    debitCreditAcc: string;
    debitCreditSubAcc: string;
    debitCreditSubAccName: string;
    rows: {
        lineNo: number;
        drCr: string;
        amount: string;
        account: string;
        accountName: string;
        naration: string;
        subAccount: string;
        subAccountName: string;
        paymentDetail: string;
    }[]
};

export type AccountLedgerType = {
    txn_date: string;
    txn_type: string;
    txn_voucher_no: number;
    txn_line_no: number;
    txn_naration: string;
    dr_amount: number;
    cr_amount: number;
    running_balance: number;
};

export type RowsType = {
    account: string;
    subAccount: string;
    paymentType: string;
    paymentDetail: string;
    amount: number;
    drCr: string;
    naration: string;
};

// ==============
// OTHER TYPES
// ==============

export type FlatAreaMaster = {
    fam_wing: string;
    fam_flat_no: string; // flatNo
    fam_flat_type: string; // flatType
    fam_flat_area_gross: number; // flatAreaGross
    fam_flat_area_net: number; // flatAreaNet
    fam_flat_area_type: string; // flatAreaType
    fam_create_by?: string;
}

export type ParkingMasterType = {
    pm_cm_id: number,
    pm_id: number,
    pm_flat_no: string,
    pm_parking_no: string,
    pm_parking_type: string,
    pm_parking_category: number,
    pm_vehicle_type: number,
    pm_vehicle_number: string,
    pm_parking_avail_rent: boolean,
    pm_create_date: string,
    pm_create_by: string,
    pm_last_update_date: string,
    pm_last_update_by: string,
}

export type VehicleFormType = {
    id: string | number;
    vehicletype: "2 Wheeler" | "4 Wheeler";
    vehicleno: string;
    parkingtype: "Self" | "Open";
    parkingno: string;
    availrent: "Y" | "N";
    parkingcategory: "2" | "4";
};

export type FlatListType = {
    fam_flat_no: string;
};

export type MemberMasterTableType = {
    cfo_flat_no: string;
    cfo_owner_name1: string;
    cfo_mobile1: string;
    cfo_rented_yn: 'Yes' | 'No';
};

export type FlatOwnerType = {
    cfo_pets_yn: boolean;
    cfo_cm_id: number;
    cfo_email: string;
    cfo_flat_no: string;
    cfo_owner_name1: string;
    cfo_owner_name2: string;
    cfo_owner_name3: string;
    cfo_owner_name4: string;
    cfo_owner_name5: string;
    cfo_landline_no: string;
    cfo_intercome_no: string;
    cfo_mobile1: string;
    cfo_mobile2: string;
    cfo_mobile3: string;
    cfo_mobile4: string;
    cfo_mobile5: string;
    cfo_q1: string;
    cfo_q2: string;
    cfo_q3: string;
    cfo_q4: string;
    cfo_q5: string;
    cfo_nomination_done: boolean;
    cfo_flat_purchase_date: string | null;
    cfo_flat_sell_date: string | null;
    cfo_bank_loan_yn: boolean;
    cfo_rented_yn: boolean;
    cfo_rented_details_yn: boolean;
    cfo_g1: string;
    cfo_g2: string;
    cfo_g3: string;
    cfo_g4: string;
    cfo_g5: string;
    cfo_parking_yn: boolean;
    cfo_flat_agreement_submited_yn: boolean;
    cfo_parking_agreement_submitted_yn: boolean;
    cfo_voting1: boolean;
    cfo_voting2: boolean;
    cfo_voting3: boolean;
    cfo_voting4: boolean;
    cfo_voting5: boolean;
    cfo_share_certificate_issued: boolean;
    cfo_share_certificate_issue_date: string | null;
};

export type RentalRegisterTableType = {
    fr_flat_no: string;
    fr_rental_name1: string;
    fr_mobile1: string;
    fr_rent_start_date: string;
    fr_rent_end_date: string;
};

export type RentalRegisterType = {
    fr_cm_id: number;
    fr_flat_no: string;
    fr_rent_start_date: string;
    fr_rent_end_date: string | null;
    fr_rental_name1: string;
    fr_rental_name2: string;
    fr_rental_name3: string;
    fr_rental_name4: string;
    fr_rental_name5: string;
    fr_landline_no: string;
    fr_mobile1: string;
    fr_mobile2: string;
    fr_mobile3: string;
    fr_mobile4: string;
    fr_mobile5: string;
    fr_g1: string;
    fr_g2: string;
    fr_g3: string;
    fr_g4: string;
    fr_g5: string;
    fr_q1: string;
    fr_q2: string;
    fr_q3: string;
    fr_q4: string;
    fr_q5: string;
    fr_agreement_copy_submitted: boolean;
};

export type ErrorLog = {
    el_id: number;
    el_username: string;
    el_platform: string;
    el_function_name: string;
    el_error_name: string;
    el_error_message: string;
    el_error_stack: string;
    el_http_method: string;
    el_endpoint: string;
    el_status_code: number;
    el_request_body: string;
    el_request_params: string;
    el_request_query: string;
    el_environment: string;
    el_server_instance: string;
    el_severity: string;
    el_created_at: string;
    total_count?: string;
};

export type flat_bank_loans = {
    fbl_cm_id: number;
    fbl_flat_no: string;
    fbl_bank_loan_noc_by: 'builder' | 'society';
    fbl_bank_loan_bank_name: string;
    fbl_bank_loan_amt: number;
    fbl_bank_loan_tenure: number;
    fbl_bank_loan_start_date: Date;
    fbl_bank_loan_expected_end_date: Date;
    fbl_bank_loan_actual_completion_date: Date;
    fbl_bank_noc_received_copy: boolean;
    fbl_bank_noc_received_date: Date;
    fbl_create_date: string;
    fbl_create_by: string;
    fbl_last_update_date: string;
    fbl_last_update_by: string;
};

export type BookingPurposeType = {
    bpm_id: number;
    bpm_purpose: string;
};

export type DocTypeMasterType = {
    dt_id: number;
    dt_cm_id: number;
    dt_name: string;
    dt_charge: number;
    dt_proof_req: boolean;
    dt_proof1_type: string | null;
    dt_proof2_type: string | null;
    dt_proof3_type: string | null;
    dt_rules: string | null;
};

export type DocRequestType = {
    dr_id: number;
    dr_cm_id: number;
    dr_dt_id: number;
    dt_name: string;
    dt_charge: number;
    dt_proof_required: boolean;
    dr_flat_no: string;
    dr_reason: string;
    dr_proof_files: string[];
    dr_status: 'pending' | 'processing' | 'approved' | 'rejected' | 'ready' | 'closed';
    dr_created_by: string;
    dr_created_at: string;
    dr_processed_by: string | null;
    dr_processed_at: string | null;
    dr_admin_remark: string | null;
    dr_decision: 'accepted' | 'rejected' | null;
    dr_decision_at: string | null;
    dr_document_url: string | null;
    dr_document_issued_at: string | null;
    dr_is_chargeable: boolean;
    dr_amount: number | null;
    dr_payment_status: 'not_required' | 'pending' | 'paid';
    dr_bill_ref_no: string | null;
    dr_payment_mode: string | null;
    dr_payment_marked_by: string | null;
    dr_payment_marked_at: string | null;
    dr_parent_request_id: number | null;
    dr_retry_count: number;
    dr_document_valid_till: string | null;
    dr_priority: string;
    dr_deleted: boolean;
    dr_last_edited_by: string | null;
    dr_last_edited_at: string | null;
};

export type BookingEnquiryResponseType = {
    hm_id: number;
    hm_name: string;
    b_slot: string;
    availability: string
}

export type BookingEnquiryDisplayType = {
    be_id: number;
    be_name: string;
    be_mobile: string;
    be_email: string;
    be_program_date: string;
    be_client_name: string;
    be_client_mobile: string;
    be_client_email: string;
    bpm_purpose: string
    be_purpose_remarks: string
    be_date: string;
    be_status: boolean;
};

export type BookingHistoryDetailType = {
    bm_id: number;
    bm_date: string;
    bm_program_date: string;
    bm_hm_id: number;
    bm_slot: string;
    slot: string;
    hm_name: string;
    bm_flat_no: string;
    bm_name: string;
    bm_mobile: string;
    bm_bpm_id: number;
    bm_amt: number;
    bm_create_date: string;
    bm_create_by: string;
    bm_last_update_date: string;
    bm_last_update_by: string;
};

export type FlatBankLoanType = {
    fbl_cm_id: string
    fbl_flat_no: string;
    fbl_bank_loan_noc_by: "builder" | "society";
    fbl_bank_loan_bank_name: string;
    fbl_bank_loan_amt: number;
    fbl_bank_loan_tenure: number;
    fbl_bank_loan_start_date: string;
    fbl_bank_loan_expected_end_date: string;
    fbl_bank_loan_actual_completion_date: string;
    fbl_bank_noc_received_copy: boolean;
    fbl_bank_noc_received_date: string;
};

export type FlatNominationType = {
    fn_flat_no: string;
    fn_cm_id: string;
    fn_nomination_date: string;

    fn_nominee_name1: string;
    fn_nominee1_relation: string;
    fn_nominee1_per_share: number;
    fn_nominee1_minor: boolean;

    fn_nominee_name2: string;
    fn_nominee2_relation: string;
    fn_nominee2_per_share: number;
    fn_nominee2_minor: boolean;

    fn_nominee_name3: string;
    fn_nominee3_relation: string;
    fn_nominee3_per_share: number;
    fn_nominee3_minor: boolean;

    fn_nomination_witness1: string;
    fn_nomination_witness2: string;

    fn_dr_certificate_issued: boolean;
    fn_name_of_doctor: string;

    fn_nomination_approve_meeting_dt: string;
    fn_approver_committee_member_name: string;
    fn_approver_committee_member_name2: string;
    fn_approver_committee_member_name3: string;

    fn_nomination_valid: boolean;
    fn_nomination_closure_date: string;
    fn_nomination_closure_reason: string;

    fn_guardian_details: string;
};

export type MaintenanceSetupType = {
    ms_id: number;
    ms_cm_id: number;
    ms_bill_period: number;
    ms_parking_chg_4w_self: number;
    ms_parking_chg_2w_self: number;
    ms_parking_chg_4w_open: number;
    ms_parking_chg_2w_open: number;
    ms_gst_chg_yn: boolean;
    ms_gst_percentage: number;
    ms_interest_perc: number;
    ms_start_date: Date;
    ms_end_date: Date;
    ms_member_control_ac: number;
    ms_bill_book: string;
    am_name: string;
    bm_book_name: string;
    create_date: string;
    update_date: string;
    ms_create_by: string;
    ms_last_update_by: string;
};

export type BillingSetupType = {
    bs_id: number;
    bs_cm_id: number;
    bs_bill_item: string;
    bs_bill_item_perc_amt: string;
    bs_bill_item_value: number;
    bs_am_id: number;
    bs_bill_item_start_date: string;
    bs_bill_item_end_date: string | null;
    bs_create_date: string;
    bs_create_by: string;
    bs_bill_item_status: boolean;
    bs_last_update_date: string;
    bs_last_update_by: string;
};

export type CommentType = {
    id: string;
    content: string;
    author: User;
    createdAt: string;
    isStaff: boolean;
}

export type MemberComplaintType = {
    id: number;
    title: string;
    description: string;
    category: string;
    sub_category: string;
    type: "P" | "C";
    status: "pending" | "in-progress" | "resolved" | "rejected";
    priority: "low" | "medium" | "high";
    createdBy: string;
    flatNo?: string;
    visitDate?: string;
    visitTime?: string;
    images?: string[];
    teamAssignedBy?: string;
    teamAssignedAt?: string;
    solvedBy?: string;
    solvedAt?: string;
    billGeneratedBy?: string;
    billGeneratedAt?: string;
    createdAt: string;
    updatedAt: string;
    assignedTo: string;
    assignedTeamComment: string;
    assignedTeamCommentAt: string;
};

export interface ComplaintLogType {
    cl_id: number;
    cl_cm_id: number;
    cl_c_id: number;
    cl_log_type: "assignment" | "comment" | "status_change" | "registration";
    cl_user_type: "admin" | "member";
    cl_user_id: string; // username
    cl_comment?: string;
    cl_old_status?: string;
    cl_new_status?: string;
    cl_assigned_to?: string;
    cl_created_at: string;
}

export type PreviewBillType = {
    bill_no: string;
    flat_no: string;
    owner_name: string;
    ownership: string;
    flat_area: string;
    parking: string;
    gen_main_chg: number;
    sink_fund: number;
    repair_fund: number;
    paint_fund: number;
    non_occupancy_chg: number;
    water_chg: number;
    electrical_chg: number;
    plumbing_chg: number;
    insurance_chg: number;
    parking_chg: number;
    non_agri_tax: number;
    sub_total: number;
    interest: number;
    arrers: number;
    gst: number;
    total: number;
};

export type WhatsappTemplateType = {
    wt_id: string;
    wt_template_name: string;
    wt_header: string;
    wt_body: string;
    wt_placeholder_count: string;
    wt_wte_id: number;
    wt_status: boolean;
    wte_name: string;
};

export type MemberFamilyDetailType = {
    mfd_id: number;
    mfd_cm_id: number;
    mfd_flat_no: string;
    mfd_name: string;
    mfd_gender: string;
    mfd_mobile: string;
    mfd_qualification: string;
    mfd_status: boolean;
    mfd_create_date: string;
    mfd_create_by: string;
    mfd_update_date: string;
    mfd_update_by: string;
};

export type MemberParkingDetailType = {
    pm_cm_id: number;
    pm_id: number;
    pm_flat_no: string;
    pm_parking_no: string;
    pm_parking_type: string;
    pm_parking_category: number;
    pm_vehicle_type: number;
    pm_vehicle_number: string;
    pm_parking_avail_rent: boolean;
    pm_create_date: string;
    pm_create_by: string;
    pm_last_update_date: string;
    pm_last_update_by: string;
    pm_status: boolean;
};

export type MemberNominationDetailType = {
    fn_cm_id: number;
    fn_flat_no: string;
    fn_nomination_date: string;
    fn_nominee_name1: string;
    fn_nominee1_relation: string;
    fn_nominee1_per_share: number;
    fn_nominee1_minor: boolean | null;
    fn_nominee_name2: string;
    fn_nominee2_relation: string | null;
    fn_nominee2_per_share: number | null;
    fn_nominee2_minor: boolean | null;
    fn_nominee_name3: string;
    fn_nominee3_relation: string;
    fn_nominee3_per_share: number | null;
    fn_nominee3_minor: boolean | null;
    fn_nomination_witness1: string;
    fn_nomination_witness2: string;
    fn_dr_certificate_issued: boolean;
    fn_name_of_doctor: string;
    fn_nomination_approve_meeting_dt: string;
    fn_approver_committee_member_name: string;
    fn_approver_committee_member_name2: string;
    fn_approver_committee_member_name3: string;
    fn_nomination_valid: boolean;
    fn_nomination_closure_date: string;
    fn_nomination_closure_reason: string;
    fn_guardian_details: string | null;
    fn_create_date: string;
    fn_create_by: string;
    fn_last_update_date: string | null;
    fn_last_update_by: string | null;
};

export interface MemberDetailsFullType extends FlatOwnerType {
    fam_flat_type: string;
    fam_flat_area_gross: string;
    fam_flat_area_net: string;
    fam_flat_area_type: string;
    cfo_status: boolean;
    cfo_primary_mobile: number;
    family_details: MemberFamilyDetailType[];
    parking_details: MemberParkingDetailType[];
    bank_loan_details: any[]; // Define specific type if needed
    nomination_details: MemberNominationDetailType[];
    rental_details: any[]; // Define specific type if needed
}

export type WhatsappEventType = {
    we_id: string;
    we_name: string;
    we_event: string;
    we_wt_id: string;
    we_status: boolean;
    wt_template_name: string;
};

export type PollOptionType = {
    po_id: number;
    po_option_text: string;
    po_position: number;
    vote_count: number;
    is_voted: boolean;
};

export type PollType = {
    p_id: number;
    p_question: string;
    p_allow_multiple_answers: boolean;
    p_created_at: string;
    p_expires_at: string | null;
    p_created_by: string;
    creator_name: string;
    options: PollOptionType[];
    total_votes: number;
};

export type SuggestionCommentType = {
    sc_id: number;
    sc_s_id: number;
    sc_cm_id: number;
    sc_flat_no: string;
    sc_comment: string;
    sc_create_by: string;
    sc_create_date: string;
    ul_name: string;
}

export type SuggestionType = {
    s_id: number;
    s_cm_id: number;
    s_flat_no: string;
    s_question: string;
    s_close_date: string;
    s_create_by: string;
    s_create_date: string;
    ul_name: string;
    comment_count: number;
    upvote_count: number;
    downvote_count: number;
    v_upvote: boolean,
    v_downvote: boolean
}

export type BillCharge = {
    bill_no?: string;
    flat_no: string;
    owner_name: string;
    ownership: string;
    flat_area: number;
    parking: string;
    charge_type: string;
    charge_amount: number;
    open_4w_count: number;
    self_4w_count: number;
    open_2w_count: number;
    self_2w_count: number;
    arrers: number;
    interest: number;
    gst: number;
    billing_period: number;
    row_total: number;
}

export type BillingSetupData = {
    bs_id?: number;
    bs_bill_item: string;
    bs_bill_item_perc_amt: "P" | "A";
    bs_bill_item_value: number;
    bs_start_date: Date | string;
    bs_end_date?: Date | string | null;
    bs_am_id: number;
    bs_remarks: string;
    bs_perc_calc_over: string;
    bs_gst_yn?: boolean;
    bs_gst_perc?: number;
};

export type AmenityFormData = {
    am_id: number;
    am_name: string;
    am_description: string;
    am_max_capacity: number;
    am_status: boolean;
    am_image?: string | null;
    slots: AmenitySlot[];
};

export type AmenitySlot = {
    as_day_of_week: number; // 1-7 (Monday-Sunday)
    as_start_time: string;
    as_end_time: string;
    as_hourly_rate: number;
};

export type DayConfig = {
    id: number;
    name: string;
    shortName: string;
    selected: boolean;
};

export type SocietyStaffType = {
    ss_id?: number;
    ss_name: string;
    ss_phone: string;
    ss_email: string;
    ss_type: string;
    ss_address: string;
    ss_agency: string;
};

export type MemberFamilyDetailsType = {
    mfd_id: number;
    mfd_cm_id: number;
    mfd_flat_no: string;
    mfd_name: string;
    mfd_gender: string;
    mfd_mobile: string;
    mfd_qualification: string;
    mfd_status: boolean;
    mfd_create_date: string;
    mfd_create_by: string;
    mfd_update_date: string;
    mfd_update_by: string;
};

export type BillChargeItemType = {
    bill_head: string;
    bill_value: string; // Cast as string in SQL
    order_id: number;
}

export type FlatBillPreviewType = {
    flat_no: string;
    owner_name: string;
    gross_flat_area: number;
    net_flat_area: number;
    parking_yn: 'Y' | 'N';
    owner_tenant: 'O' | 'T';
    charges_breakdown: BillChargeItemType[];
    arrears: number;
    current_total: number;
    final_total: number;
    open_4w_count?: number;
    self_4w_count?: number;
    open_2w_count?: number;
    self_2w_count?: number;
}

export type BillMasterType = {
    owner_name: string;
    bm_cm_id: number;
    bm_bill_no: string;
    bm_flat_no: string;
    bm_start_date: string; // Date string
    bm_end_date: string; // Date string
    bm_due_date: string; // Date string
    bm_owner_tennant: string; // 'O' or 'T' (or 'Y'/'N' based on SQL comment? SQL says 'Y|N' for owner_tennant? Wait. Schema comment says -- Y|N. But usually Owner/Tenant is O/T. I'll stick to string.)
    bm_parking_yn: string; // 'Y' | 'N'
    bm_flat_area: number | string; // Numeric
    bm_bill_sub_total: number;
    bm_bill_gst: number;
    bm_bill_arrers: number;
    bm_bill_total: number;
    bm_bill_posted: boolean;
    bm_create_by: string;
    bm_create_date: string;
    bm_last_update_by?: string;
    bm_last_update_date?: string;
    open_4w_count?: number;
    self_4w_count?: number;
    open_2w_count?: number;
    self_2w_count?: number;
};

export type BillDetailItemType = {
    bd_cm_id: number;
    bd_bill_no: string;
    bd_flat_no: string;
    bd_bill_item: string;
    bd_bill_amount: number;
    bs_am_id?: number;
};

export type BillReceiptType = {
    txn_date: string;
    txn_voucher_no: string;
    txn_amount: number;
    txn_naration: string;
    txn_payment_type: string;
    txn_chq_no: string;
}

export type BillWithDetailsType = BillMasterType & {
    bill_details: BillDetailItemType[];
    bill_receipts: BillReceiptType[];
};

export type UserLoginType = {
    ul_id: number;
    ul_email: string;
    ul_mobile: string;
    ul_username: string;
    ul_role: number;
    ul_access_type: string;
    ul_cm_id: number;
    ul_status: boolean;
    ul_password_prefix: string;
};

export type VendorMasterFormType = {
    vm_id: string;
    vm_company_name: string;
    vm_address: string;
    vm_email: string;
    vm_mobile: string;
    vm_landline?: string;
    vm_contact_person: string;
    vm_service_center_address?: string;
    vm_service_center_mobile?: string;
    vm_service_center_landline?: string;
    vm_pan_number: string;
    vm_cst?: string;
    vm_vat?: string;
    vm_service_tax?: string;
    vm_aadhar?: string;
    vm_gstin: string;
};

export type SocialPostType = {
    sp_id: number;
    sp_username: string;
    sp_caption: string;
    sp_media_urls: string[];
    sp_created_at: string;
    likes_count: number;
    comments_count: number;
    is_liked?: boolean;
};

export type SocialCommentType = {
    sc_id: number;
    sc_post_id: number;
    sc_username: string;
    sc_content: string;
    sc_created_at: string;
};

export type IStaff = {
    id: number;
    name: string;
    mobile: string;
    photoUrl: string | null;
    category: string;
    status: boolean;
    autoApprove: boolean;
    qrToken: string | null;
    qrGeneratedAt: string | null;
    qrActive: boolean;
    flats?: string[];
};

export type IStaffAttendance = {
    id: number;
    date: string;
    present: boolean;
    createdAt: string;
    updatedAt: string;
};

export type ParkingCategoryType = {
    pcm_id: number;
    pcm_cm_id: number;
    pcm_vehicle_type: string;
    pcm_name: string;
    pcm_description: string;
    pcm_rate: string | number;
    pcm_start_date: string;
    pcm_end_date: string | null;
    pcm_is_active: boolean;
};

// Types
export type FolderType = {
    dfm_id: number;
    dfm_name: string;
    dfm_scope: string;
    dfm_parent_id: number | null;
    dfm_created_at: string;
    dfm_created_by: string;
}

export type DocumentType = {
    dm_id: number;
    dm_name: string;
    dm_file_type: string;
    dm_file_size: number;
    dm_created_at: string;
    dm_created_by: string;
    dm_user_type: string;
    dm_flat_no: string | null;
    dm_file_path: string; // S3 url/key
}

export type BreadcrumbType = {
    id: number | null;
    name: string;
};

export type CompanyMasterType = {
    cm_id: number;
    cm_code?: string;
    cm_name: string;
    cm_status: boolean;
    cm_registration_no?: string | null;
    cm_pan_no?: string | null;
    cm_gstin_no?: string | null;
    cm_logo?: string | null;
    cm_go_ahead_flag?: boolean;
    cm_is_deactivated?: boolean;
    cm_deactivation_reason_id?: number | null;
    cm_create_date: string;
    cm_create_by: string;
    cm_update_date?: string | null;
    cm_update_by?: string | null;
    cm_last_update_date?: string | null;
    cm_last_update_by?: string | null;
    cm_acc_name?: string | null;
    cm_acc_no?: string | null;
    cm_ifsc?: string | null;
    cm_acc_type?: string | null;
    cm_branch_name?: string | null;
    cm_upi_id?: string | null;
};

export type EmployeeMasterType = {
    em_id: number;
    em_cm_id: number;
    em_employee_id: string;
    em_code: string;
    em_first_name: string;
    em_last_name: string;
    em_name: string;
    em_gender: string;
    em_date_of_birth: string;
    em_mobile: string;
    em_work_email: string;
    em_email?: string | null;
    em_personal_email?: string | null;
    em_address_line1?: string | null;
    em_address_line2?: string | null;
    em_address_line3?: string | null;
    em_hire_date: string;
    em_join_date?: string | null;
    em_designation?: string | null;
    em_company?: string | null;
    em_status: boolean;
    em_created_by: string;
    em_created_at: string;
    em_last_editted_by?: string | null;
    em_last_editted_at?: string | null;
    em_update_by?: string | null;
    em_update_date?: string | null;
    company_name?: string;
    employee_name?: string;
};

export type HRMSDashboardCountsType = {
    totalCompanies: number;
    activeCompanies: number;
    totalEmployees: number;
    activeEmployees: number;
    totalEmployeeLoginAccounts: number;
    activeEmployeeLoginAccounts: number;
};