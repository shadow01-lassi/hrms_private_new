import { CACHE_PREFIX } from "../constants";

/**
 * Automatically prepends CACHE_PREFIX to all string-returning functions in the object.
 */
const applyPrefix = (obj: any): any => {
    for (const key in obj) {
        if (typeof obj[key] === "function") {
            const originalFn = obj[key];
            obj[key] = (...args: any[]) => `${CACHE_PREFIX}${originalFn(...args)}`;
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
            applyPrefix(obj[key]);
        }
    }
    return obj;
};

export const CacheKeys = applyPrefix({
    // 🌍 Global
    global: {
        countries: () => `global:master:countries`,
        currencies: () => `global:master:currencies`,
        finYear: {
            all: () => `global:master:fin_year:all`,
            one: (id: number) => `global:master:fin_year:${id}`,
        },
        style: (hostname: string) => `global:style:${hostname}`,
        permissions: () => `global:permissions:all`,
        permission: (id: number) => `global:permissions:${id}`,
        userLookup: (identifier: string) => `global:user:lookup:${identifier}`,
        changeLog: () => `global:change_log:all`,
        sidebar: (roleId: number, access: string) => `global:sidebar:${roleId}:${access}`,
        roles: {
            all: () => `global:master:roles:all`,
            one: (id: number) => `global:master:roles:${id}`,
        },
        accountMasterLinkage: {
            all: () => `global:master:account_master_linkage:all`,
            one: (tableName: string) => `global:master:account_master_linkage:${tableName}`,
        },
        banks: {
            all: () => `global:master:banks:all`,
            branches: (bankId: string) => `global:master:banks:branches:${bankId}`,
            ifsc: (code: string) => `global:master:banks:ifsc:${code}`,
        },
    },

    // 🏢 Company-scoped
    company: {
        details: {
            one: (companyId: number) => `company:${companyId}:details`,
        },

        user: (companyId: number, userId: number) =>
            `company:${companyId}:master:user:${userId}`,

        auth: {
            user: (companyId: number, userId: number, email: string) =>
                `company:${companyId}:auth:user:${userId}:${email}`,
        },

        groupMaster: {
            all: (companyId: number) =>
                `company:${companyId}:master:group_master:all`,

            one: (companyId: number, id: number) =>
                `company:${companyId}:master:group_master:${id}`,
        },

        accountMaster: {
            all: (companyId: number, type?: string) =>
                `company:${companyId}:master:account_master:all:${type || "all"}`,

            one: (companyId: number, id: number) =>
                `company:${companyId}:master:account_master:${id}`,
        },

        subAccountMaster: {
            all: (companyId: number) =>
                `company:${companyId}:master:sub_account_master:all`,

            one: (companyId: number, id: number) =>
                `company:${companyId}:master:sub_account_master:${id}`,
        },

        bookMaster: {
            all: (companyId: number) =>
                `company:${companyId}:master:book_master:all`,

            byType: (companyId: number, type: string) =>
                `company:${companyId}:master:book_master:type:${type}`,

            one: (companyId: number, id: number) =>
                `company:${companyId}:master:book_master:${id}`,
        },

        transactions: {
            all: (companyId: number, book: string, from?: string, to?: string, fy?: string) =>
                `company:${companyId}:transactions:${book}:${fy || "all"}:${from || "all"}:${to || "all"}`,

            one: (companyId: number, book: string, voucher: number, fy?: string) =>
                `company:${companyId}:transactions:${book}:one:${voucher}:${fy || "all"}`,

            jv: (companyId: number, from?: string, to?: string, fy?: string) =>
                `company:${companyId}:transactions:jv:${fy || "all"}:${from || "all"}:${to || "all"}`,

            note: (companyId: number, type: string, from?: string, to?: string, fy?: string) =>
                `company:${companyId}:transactions:note:${type}:${fy || "all"}:${from || "all"}:${to || "all"}`,
        },

        transactionBooks: {
            brbp: (companyId: number) => `company:${companyId}:txn_books:brbp`,
            jv: (companyId: number) => `company:${companyId}:txn_books:jv`,
            dncn: (companyId: number) => `company:${companyId}:txn_books:dncn`,
        },

        accountsList: (companyId: number) => `company:${companyId}:txn_accounts_list`,

        bookBalance: (companyId: number, book: string) => `company:${companyId}:book_balance:${book}`,

        flatArea: {
            all: (companyId: number) =>
                `company:${companyId}:master:flat_area:all`,

            one: (companyId: number, flatId: string) =>
                `company:${companyId}:master:flat_area:${flatId}`,
        },

        flats: {
            all: (companyId: number) =>
                `company:${companyId}:master:flats:all`,

            exceptParking: (companyId: number) =>
                `company:${companyId}:master:flats:except_parking`,

            parking: (companyId: number) =>
                `company:${companyId}:master:flats:parking`,
        },

        donationType: {
            all: (companyId: number) =>
                `company:${companyId}:master:donation_type:all`,

            one: (companyId: number, id: number) =>
                `company:${companyId}:master:donation_type:${id}`,
        },

        flatOwner: {
            all: (companyId: number) =>
                `company:${companyId}:master:flat_owner:all`,

            one: (companyId: number, flat: string) =>
                `company:${companyId}:master:flat_owner:${flat}`,

            details: (companyId: number, flat: string, owner_name1: string) =>
                `company:${companyId}:master:flat_owner:details:${flat}:${owner_name1}`,

            accounts: (companyId: number) =>
                `company:${companyId}:master:flat_owner:accounts`,
        },

        rental: {
            all: (companyId: number) =>
                `company:${companyId}:master:rental:all`,

            one: (companyId: number, flat: string) =>
                `company:${companyId}:master:rental:${flat}`,
        },

        parking: {
            all: (companyId: number) =>
                `company:${companyId}:master:parking:all`,

            one: (companyId: number, flat: string) =>
                `company:${companyId}:master:parking:${flat}`,
        },

        bookingPurpose: {
            all: (companyId: number) =>
                `company:${companyId}:master:booking_purpose:all`,

            one: (companyId: number, id: number) =>
                `company:${companyId}:master:booking_purpose:${id}`,
        },

        docTypes: {
            all: (companyId: number) =>
                `company:${companyId}:master:doc_types:all`,

            one: (companyId: number, id: number) =>
                `company:${companyId}:master:doc_types:${id}`,
        },

        docRequests: {
            adminAll: (companyId: number) =>
                `company:${companyId}:helpdesk:doc_requests:admin:all`,

            userAll: (companyId: number, userId: string, flatNo: string) =>
                `company:${companyId}:helpdesk:doc_requests:user:${userId}:${flatNo}`,
        },

        flatBankLoan: {
            all: (companyId: number) =>
                `company:${companyId}:master:flat_bank_loan:all`,

            one: (companyId: number, flat: string) =>
                `company:${companyId}:master:flat_bank_loan:${flat}`,
        },

        flatNomination: {
            all: (companyId: number) =>
                `company:${companyId}:master:flat_nomination:all`,

            one: (companyId: number, flat: string) =>
                `company:${companyId}:master:flat_nomination:${flat}`,
        },

        familyDetails: {
            all: (companyId: number) =>
                `company:${companyId}:master:family_details:all`,

            one: (companyId: number, flat: string) =>
                `company:${companyId}:master:family_details:${flat}`,
        },

        myUnit: {
            details: (companyId: number, flat: string) => `company:${companyId}:my_unit:details:${flat}`,
            members: (companyId: number, flat: string) => `company:${companyId}:my_unit:members:${flat}`,
        },

        meetings: {
            all: (companyId: number) => `company:${companyId}:meetings:all`,
            one: (companyId: number, id: number) => `company:${companyId}:meetings:${id}`,
        },

        notices: {
            all: (companyId: number) => `company:${companyId}:notices:all`,
            one: (companyId: number, id: number) => `company:${companyId}:notices:${id}`,
        },

        hall: {
            all: (companyId: number) => `company:${companyId}:hall:all`,
            one: (companyId: number, id: number) => `company:${companyId}:hall:${id}`,
        },

        directory: {
            emergency: (companyId: number) => `company:${companyId}:directory:emergency`,
            allContacts: (companyId: number, type?: string) => `company:${companyId}:directory:all_contacts:${type || "all"}`,
        },

        requests: {
            all: (companyId: number) => `company:${companyId}:requests:all`,
            byFlat: (companyId: number, flat: string) => `company:${companyId}:requests:flat:${flat}`,
        },

        complaints: {
            all: (companyId: number) => `company:${companyId}:complaints:all`,
            one: (companyId: number, id: number) => `company:${companyId}:complaints:${id}`,
        },

        bookings: {
            upcoming: (companyId: number) => `company:${companyId}:bookings:upcoming`,
            enquiries: (companyId: number) => `company:${companyId}:bookings:enquiries`,
            enquiry: (companyId: number, date: string) => `company:${companyId}:bookings:enquiry:${date}`,
            history: (companyId: number, from?: string, to?: string) => `company:${companyId}:bookings:history:${from || "all"}:${to || "all"}`,
            one: (companyId: number, id: number) => `company:${companyId}:bookings:one:${id}`,
        },

        billing: {
            currentBill: (companyId: number, flat: string) => `company:${companyId}:billing:current:${flat}`,
            latestBillStatus: (companyId: number, flat: string) => `company:${companyId}:billing:latest_status:${flat}`,
            expenses: (companyId: number, fy: string) => `company:${companyId}:billing:expenses:${fy}`,
            expensesPerQtr: (companyId: number, fy: string, qtr: string) => `company:${companyId}:billing:expenses_qtr:${fy}:${qtr}`,
            pastBills: (companyId: number, flat: string, start?: string, end?: string) => `company:${companyId}:billing:past:${flat}:${start || "all"}:${end || "all"}`,
            maintenanceSetup: (companyId: number) => `company:${companyId}:billing:setup`,
        },

        payments: {
            all: (companyId: number, flat: string, from?: string, to?: string) => `company:${companyId}:payments:all:${flat || "all"}:${from || "all"}:${to || "all"}`,
            one: (companyId: number, id: number) => `company:${companyId}:payments:one:${id}`,
        },

        societyStaff: {
            all: (companyId: number) => `company:${companyId}:society_staff:all`,
            one: (companyId: number, id: number) => `company:${companyId}:society_staff:${id}`,
        },

        userHome: {
            one: (companyId: number, flat: string) => `company:${companyId}:user:home:${flat}`,
        },

        permissions: {
            check: (companyId: number, userId: number, permissionCode: string) =>
                `company:${companyId}:user:${userId}:permission:${permissionCode}`,
        },

        buzaar: {
            dashboard: (companyId: number) => `company:${companyId}:buzaar:dashboard`,
            vendors: (companyId: number) => `company:${companyId}:buzaar:vendors`,
        },

        byEmail: (companyId: number, email: string) => `company:master:email:${email}`,

        gatekeeper: {
            expected: (companyId: number) => `company:${companyId}:gatekeeper:expected`,
            entries: (companyId: number, status: string) => `company:${companyId}:gatekeeper:entries:${status}`,
            homeSummary: (companyId: number, flatNo: string) => `company:${companyId}:gatekeeper:home_summary:${flatNo}`,
        },

        notifications: {
            allUsers: (companyId: number) => `company:${companyId}:notifications:all_users`,
            flatUsers: (companyId: number, flatNo: string) => `company:${companyId}:notifications:flat:${flatNo}:users`,
            userWebSubscriptions: (companyId: number, userId: number) => `company:${companyId}:notifications:user:${userId}:web_subs`,
            userNativeTokens: (companyId: number, userId: number) => `company:${companyId}:notifications:user:${userId}:native_tokens`,
        },

        dashboard: {
            management: (companyId: number, fy: string) => `company:${companyId}:dashboard:management:${fy}`,
            accounts: (companyId: number, fy: string) => `company:${companyId}:dashboard:accounts:${fy}`,
            gatekeeper: (companyId: number, fy: string) => `company:${companyId}:dashboard:gatekeeper:${fy}`,
        },
    },
});

