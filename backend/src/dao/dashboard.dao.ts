import { pool } from "../lib/db";

export const getDashboardDataDao = async (company: number) => {
    // OLD DEPRECATED DAO
    const usersQuery = `SELECT * FROM public.employee_login WHERE el_active = true`;
    const result = await pool.query(usersQuery);
    return result.rows;
};

// =============================================
// MANAGEMENT SECTION
// =============================================
export const getDashboardManagementDataDao = async (company: number) => {
    const announcementsQuery = `
        SELECT
            (SELECT COUNT(*) FROM society_notices
             WHERE sn_cm_id = $1
               AND sn_notice_date >= (CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 4
                                           THEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, 4, 1)
                                           ELSE make_date((EXTRACT(YEAR FROM CURRENT_DATE) - 1)::int, 4, 1) END)
            ) AS total_announcements,
            (SELECT COUNT(*) FROM society_meetings
             WHERE sm_cm_id = $1
               AND sm_meeting_date >= (CASE WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 4
                                            THEN make_date(EXTRACT(YEAR FROM CURRENT_DATE)::int, 4, 1)
                                            ELSE make_date((EXTRACT(YEAR FROM CURRENT_DATE) - 1)::int, 4, 1) END)
            ) AS total_meetings;
    `;

    const unitsQuery = `SELECT COUNT(DISTINCT fam_flat_no) AS total_units FROM flat_area_master WHERE fam_cm_id = $1;`;

    const usersQuery = `
        SELECT
            COUNT(DISTINCT el_id) AS unique_users,
            COUNT(DISTINCT CASE WHEN el_role = 1 THEN el_id END) AS admins,
            COUNT(DISTINCT CASE WHEN el_last_logged_in IS NULL THEN el_id END) AS not_logged_in,
            COUNT(DISTINCT CASE WHEN el_last_logged_in IS NOT NULL AND el_active = true THEN el_id END) AS active_users,
            COUNT(DISTINCT CASE WHEN el_active = false THEN el_id END) AS pending_verification
        FROM public.employee_login;
    `;

    const complaintsQuery = `
        SELECT
            c_type,
            c_priority,
            c_status,
            COUNT(*) AS cnt
        FROM complaints
        WHERE c_cm_id = $1
        GROUP BY c_type, c_priority, c_status;
    `;

    const docRequestsQuery = `
        SELECT
            COUNT(CASE WHEN dr_status IN ('processing', 'approved', 'ready') THEN 1 END) AS active,
            COUNT(CASE WHEN dr_status = 'pending' THEN 1 END) AS pending
        FROM doc_requests
        WHERE dr_cm_id = $1 AND dr_deleted::boolean = false;
    `;

    const amenitiesCountQuery = `SELECT COUNT(*) AS total FROM amenity_master WHERE am_cm_id = $1 AND am_status::boolean = true;`;

    const bookingsThisMonthQuery = `
        SELECT COUNT(*) AS total
        FROM booking_master
        WHERE bm_cm_id = $1
          AND date_trunc('month', bm_program_date) = date_trunc('month', CURRENT_DATE);
    `;

    const pendingHallBookingsQuery = `
        SELECT be_id, hm_name, be_flat_no || ' - ' || be_name AS requested_by, be_date::text AS date, 'Pending Acceptance' AS status
        FROM booking_enquiry
        LEFT JOIN hall_master ON be_hm_id = hm_id AND be_cm_id = hm_cm_id
        WHERE be_cm_id = $1 AND be_status::text NOT IN ('true', 't', 'Accepted', 'Booked')
        ORDER BY be_date ASC
        LIMIT 5;
    `;

    const [
        announcementsRes,
        unitsRes,
        usersRes,
        complaintsRes,
        docRequestsRes,
        amenitiesCountRes,
        bookingsThisMonthRes,
        pendingHallBookingsRes
    ] = await Promise.all([
        pool.query(announcementsQuery, [company]),
        pool.query(unitsQuery, [company]),
        pool.query(usersQuery, [company]),
        pool.query(complaintsQuery, [company]),
        pool.query(docRequestsQuery, [company]),
        pool.query(amenitiesCountQuery, [company]),
        pool.query(bookingsThisMonthQuery, [company]),
        pool.query(pendingHallBookingsQuery, [company])
    ]);

    const personalComplaints = { total: 0, highPriority: { pending: 0, inProgress: 0 }, pending: 0, inProgress: 0, resolved: 0 };
    const openAreaComplaints = { total: 0, highPriority: { pending: 0, inProgress: 0 }, pending: 0, inProgress: 0, resolved: 0 };

    for (const row of complaintsRes.rows) {
        const count = parseInt(row.cnt);
        const target = row.c_type === "P" ? personalComplaints : openAreaComplaints;
        target.total += count;

        if (row.c_status === "pending") target.pending += count;
        if (row.c_status === "in-progress") target.inProgress += count;
        if (row.c_status === "resolved") target.resolved += count;

        if (row.c_priority === "high") {
            if (row.c_status === "pending") target.highPriority.pending += count;
            if (row.c_status === "in-progress") target.highPriority.inProgress += count;
        }
    }

    return {
        announcements: {
            totalAnnouncementsThisYear: parseInt(announcementsRes.rows[0]?.total_announcements || "0"),
            totalMeetingsCalledThisYear: parseInt(announcementsRes.rows[0]?.total_meetings || "0"),
        },
        unitsAndUsers: {
            totalUnits: parseInt(unitsRes.rows[0]?.total_units || "0"),
            uniqueUsers: parseInt(usersRes.rows[0]?.unique_users || "0"),
            breakdown: {
                admins: parseInt(usersRes.rows[0]?.admins || "0"),
                usersNotLoggedIn: parseInt(usersRes.rows[0]?.not_logged_in || "0"),
                activeUsers: parseInt(usersRes.rows[0]?.active_users || "0"),
                pendingVerification: parseInt(usersRes.rows[0]?.pending_verification || "0"),
            }
        },
        helpdesk: {
            complaints: {
                personal: personalComplaints,
                openArea: openAreaComplaints,
            },
            documentRequests: {
                active: parseInt(docRequestsRes.rows[0]?.active || "0"),
                pending: parseInt(docRequestsRes.rows[0]?.pending || "0"),
            },
        },
        amenitiesAndHallBookings: {
            totalAmenities: parseInt(amenitiesCountRes.rows[0]?.total || "0"),
            totalBookingsThisMonth: parseInt(bookingsThisMonthRes.rows[0]?.total || "0"),
            pendingHallBookingRequests: pendingHallBookingsRes.rows.length,
            hallBookingsPendingDetails: pendingHallBookingsRes.rows.map((r: any) => ({
                id: r.be_id,
                hallName: r.hm_name || "Unknown Hall",
                requestedBy: r.requested_by,
                date: r.date,
                status: r.status,
            })),
        },
    };
};

// =============================================
// ACCOUNTS SECTION
// =============================================
export const getDashboardAccountsDataDao = async (company: number, fy: string) => {
    // Only fetch the total count of bills
    const totalBillsQuery = `
        SELECT COUNT(*) AS total_bills 
        FROM bill_master 
        WHERE bm_cm_id = $1 
          AND bm_start_date >= (SELECT fy_start_date FROM fin_year WHERE fy_code = $2 LIMIT 1)
          AND bm_start_date <= (SELECT fy_end_date FROM fin_year WHERE fy_code = $2 LIMIT 1);
    `;

    const financialSummaryQuery = `SELECT * FROM fn_get_bill_period_financial_summary($1, $2);`;

    const bankCashQuery = `
        SELECT
            bm.bm_book_code AS book_code,
            am.am_name AS name,
            CASE WHEN LOWER(gm.gm_name) LIKE '%cash%' THEN 'cash' ELSE 'bank' END AS type,
            am.am_link_value AS account_number,
            COALESCE(
                SUM(CASE WHEN t.txn_drcr_flag = 'D' THEN t.txn_amount ELSE -t.txn_amount END), 0
            ) AS balance
        FROM book_master bm
        JOIN account_master am ON bm.bm_am_id = am.am_id AND am.am_cm_id = bm.bm_cm_id
        JOIN group_master gm ON am.am_gm_id = gm.gm_id AND gm.gm_cm_id = bm.bm_cm_id
        LEFT JOIN transactions t ON t.txn_am_id = bm.bm_am_id
            AND t.txn_cm_id = bm.bm_cm_id
            AND t.txn_fy_id = $2
        WHERE bm.bm_cm_id = $1
          AND am.am_status::boolean = true
          AND (LOWER(gm.gm_name) LIKE '%bank%' OR LOWER(gm.gm_name) LIKE '%cash%')
        GROUP BY bm.bm_book_code, am.am_name, gm.gm_name, am.am_link_value
        ORDER BY balance DESC;
    `;

    const duesQuery = `
        WITH outstanding AS (
            SELECT
                txn_sam_id::VARCHAR AS flat_no,
                SUM((CASE WHEN txn_drcr_flag = 'D' THEN 1 ELSE -1 END) * txn_amount) AS os_amt
            FROM transactions
            WHERE txn_cm_id = $1
              AND txn_am_id = (
                  SELECT ms_member_control_ac FROM maintenance_setup
                  WHERE ms_cm_id = $1 AND ms_end_date IS NULL LIMIT 1
              )
            GROUP BY txn_sam_id
            HAVING SUM((CASE WHEN txn_drcr_flag = 'D' THEN 1 ELSE -1 END) * txn_amount) > 0
        )
        SELECT
            COUNT(DISTINCT flat_no) AS total_defaulters,
            COALESCE(SUM(os_amt), 0) AS total_due
        FROM outstanding;
    `;

    const [
        totalBillsRes,
        financialSummaryRes,
        bankCashRes,
        duesRes
    ] = await Promise.all([
        pool.query(totalBillsQuery, [company, fy]),
        pool.query(financialSummaryQuery, [company, fy]),
        pool.query(bankCashQuery, [company, fy]),
        pool.query(duesQuery, [company])
    ]);

    let totalAmountGenerated = 0;
    let totalAmountCollected = 0;
    let totalExpenses = 0;

    const periodicData = financialSummaryRes.rows.map((r: any) => {
        const billed = parseFloat(r.total_billed || "0");
        const collected = parseFloat(r.total_collections || "0");
        const expense = parseFloat(r.total_expenses || "0");

        totalAmountGenerated += billed;
        totalAmountCollected += collected;
        totalExpenses += expense;

        return {
            quarter: r.period_name, // Using period_name as 'quarter' for frontend consistency
            billsCreated: parseInt(r.bills_count || "0"),
            amountGenerated: billed,
            amountCollected: collected,
        };
    });

    const periodicExpenses = financialSummaryRes.rows.map((r: any) => ({
        quarter: r.period_name,
        amount: parseFloat(r.total_expenses || "0")
    }));

    const bankCashTotal = bankCashRes.rows.reduce((sum: number, r: any) => sum + parseFloat(r.balance || "0"), 0);

    return {
        incomeTracker: {
            totalBillsGeneratedThisYear: parseInt(totalBillsRes.rows[0]?.total_bills || "0"),
            totalAmountGenerated: totalAmountGenerated,
            totalAmountCollected: totalAmountCollected,
            totalAmountBalance: totalAmountGenerated - totalAmountCollected,
            quarterlyData: periodicData,
        },
        expenseTracker: {
            quarterlyExpenses: periodicExpenses,
            totalExpensesThisYear: totalExpenses,
        },
        financialSummary: financialSummaryRes.rows.map((r: any) => ({
            quarter: r.period_name,
            totalBilled: parseFloat(r.total_billed || "0"),
            totalOtherDebits: parseFloat(r.total_other_debits || "0"),
            totalCollections: parseFloat(r.total_collections || "0"),
            totalInvestmentsMade: parseFloat(r.total_investments_made || "0"),
            totalInvestmentsWithdrawn: parseFloat(r.total_investments_withdrawn || "0"),
            totalExpenses: parseFloat(r.total_expenses || "0"),
            billsCount: parseInt(r.bills_count || "0"),
        })),
        bankAndCash: {
            totalAmount: bankCashTotal,
            accounts: bankCashRes.rows.map((r: any) => ({
                name: r.name,
                type: r.type,
                accountNumber: r.account_number,
                balance: parseFloat(r.balance || "0"),
            })),
        },
        duesTracker: {
            totalDefaulters: parseInt(duesRes.rows[0]?.total_defaulters || "0"),
            totalAmountDue: parseFloat(duesRes.rows[0]?.total_due || "0"),
        },
    };
};

// =============================================
// GATEKEEPER SECTION
// =============================================
export const getDashboardGatekeeperDataDao = async (company: number) => {
    const dailyVisitorsQuery = `
        SELECT
            COUNT(*) AS total_in,
            COUNT(CASE WHEN gel_checkout_time IS NULL THEN 1 END) AS still_inside
        FROM gate_entry_log
        WHERE gel_cm_id = $1
          AND gel_category != 'staff'
          AND DATE(gel_checkin_time) = CURRENT_DATE;
    `;

    const staffMembersQuery = `
        SELECT
            COUNT(*) AS total_in,
            COUNT(CASE WHEN gel_checkout_time IS NULL THEN 1 END) AS still_inside
        FROM gate_entry_log
        WHERE gel_cm_id = $1
          AND gel_category = 'staff'
          AND DATE(gel_checkin_time) = CURRENT_DATE;
    `;

    const panicAlertsQuery = `
        SELECT COUNT(*) AS cnt
        FROM security_sos_reports
        WHERE ssr_created_at >= date_trunc('month', CURRENT_DATE);
    `;

    const missingVisitorsQuery = `
        SELECT COUNT(*) AS cnt
        FROM gate_entry_log
        WHERE gel_cm_id = $1
          AND gel_checkout_time IS NULL
          AND DATE(gel_checkin_time) < CURRENT_DATE;
    `;

    const [
        dailyVisitorsRes,
        staffMembersRes,
        panicAlertsRes,
        missingVisitorsRes
    ] = await Promise.all([
        pool.query(dailyVisitorsQuery, [company]),
        pool.query(staffMembersQuery, [company]),
        pool.query(panicAlertsQuery),
        pool.query(missingVisitorsQuery, [company])
    ]);

    return {
        dailyVisitors: {
            totalIn: parseInt(dailyVisitorsRes.rows[0]?.total_in || "0"),
            stillInside: parseInt(dailyVisitorsRes.rows[0]?.still_inside || "0"),
        },
        staffMembers: {
            totalIn: parseInt(staffMembersRes.rows[0]?.total_in || "0"),
            stillInside: parseInt(staffMembersRes.rows[0]?.still_inside || "0"),
        },
        alerts: {
            panicAlertsThisMonth: parseInt(panicAlertsRes.rows[0]?.cnt || "0"),
            missingVisitors: parseInt(missingVisitorsRes.rows[0]?.cnt || "0"),
        },
    };
};

export const getHRMSDashboardCountsDAO = async () => {
    const totalCompaniesQuery = `SELECT COUNT(*)::int AS count FROM company_master`;
    const activeCompaniesQuery = `SELECT COUNT(*)::int AS count FROM company_master WHERE cm_status = true`;
    const totalEmployeesQuery = `SELECT COUNT(*)::int AS count FROM employee_master`;
    const activeEmployeesQuery = `SELECT COUNT(*)::int AS count FROM employee_master WHERE em_status = true`;
    const totalEmployeeLoginAccountsQuery = `SELECT COUNT(*)::int AS count FROM employee_login`;
    const activeEmployeeLoginAccountsQuery = `SELECT COUNT(*)::int AS count FROM employee_login WHERE el_active = true`;

    const [
        totalCompaniesRes,
        activeCompaniesRes,
        totalEmployeesRes,
        activeEmployeesRes,
        totalEmployeeLoginAccountsRes,
        activeEmployeeLoginAccountsRes
    ] = await Promise.all([
        pool.query(totalCompaniesQuery),
        pool.query(activeCompaniesQuery),
        pool.query(totalEmployeesQuery),
        pool.query(activeEmployeesQuery),
        pool.query(totalEmployeeLoginAccountsQuery),
        pool.query(activeEmployeeLoginAccountsQuery)
    ]);

    return {
        totalCompanies: totalCompaniesRes.rows[0]?.count || 0,
        activeCompanies: activeCompaniesRes.rows[0]?.count || 0,
        totalEmployees: totalEmployeesRes.rows[0]?.count || 0,
        activeEmployees: activeEmployeesRes.rows[0]?.count || 0,
        totalEmployeeLoginAccounts: totalEmployeeLoginAccountsRes.rows[0]?.count || 0,
        activeEmployeeLoginAccounts: activeEmployeeLoginAccountsRes.rows[0]?.count || 0
    };
};

