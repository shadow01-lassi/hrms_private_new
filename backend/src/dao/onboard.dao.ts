import { pool } from "../lib/db";

export const getOnboardingProgressDAO = async (cm_id: number) => {
    const queries = {
        // Step 2: Basic Details (Registration No is a good flag)
        step2: `SELECT cm_registration_no FROM company_master WHERE cm_id = $1`,

        // Step 3: Wings & Units (Entries in flat_area_master)
        step3: `SELECT COUNT(*) FROM flat_area_master WHERE fam_cm_id = $1`,

        // Step 4: Committee Members (Users with AD access)
        step4: `SELECT COUNT(*) FROM public.employee_login el JOIN public.employee_master em ON el.el_em_id = em.em_id WHERE em.em_cm_id = $1 AND el.el_role = 1`,

        // Step 5: Billing Setup (Entries in maintenance_setup)
        step5: `SELECT COUNT(*) FROM maintenance_setup WHERE ms_cm_id = $1`,

        // Step 6: Import Residents (Entries in company_flat_owners)
        step6: `SELECT COUNT(*) FROM company_flat_owners WHERE cfo_cm_id = $1`,

        // Step 7: Amenities (Entries in hall_master)
        step7: `SELECT COUNT(*) FROM amenity_master WHERE am_cm_id = $1`,

        // Ste 8: Applied for verification?
        step8: `SELECT cm_go_ahead_flag FROM company_master WHERE cm_id = $1;`
    };

    const [s2, s3, s4, s5, s6, s7, s8] = await Promise.all([
        pool.query(queries.step2, [cm_id]),
        pool.query(queries.step3, [cm_id]),
        pool.query(queries.step4, [cm_id]),
        pool.query(queries.step5, [cm_id]),
        pool.query(queries.step6, [cm_id]),
        pool.query(queries.step7, [cm_id]),
        pool.query(queries.step8, [cm_id])
    ]);

    console.log(s2, s3, s4, s5, s6, s7, s8);

    const isStep2Done = !!s2.rows[0]?.cm_registration_no;
    const isStep3Done = parseInt(s3.rows[0]?.count || "0") > 0;
    const isStep4Done = parseInt(s4.rows[0]?.count || "0") > 0;
    const isStep5Done = parseInt(s5.rows[0]?.count || "0") > 0;
    const isStep6Done = parseInt(s6.rows[0]?.count || "0") > 0;
    const isStep7Done = parseInt(s7.rows[0]?.count || "0") > 0;
    const isStep8Done = s8.rows[0]?.cm_go_ahead_flag === true;
    const isStep8Verifying = s8.rows[0]?.cm_go_ahead_flag === false;

    const rawSteps = [
        { step: 1, isDone: true, isVerifying: false },
        { step: 2, isDone: isStep2Done, isVerifying: false },
        { step: 3, isDone: isStep3Done, isVerifying: false },
        { step: 4, isDone: isStep4Done, isVerifying: false },
        { step: 5, isDone: isStep5Done, isVerifying: false },
        { step: 6, isDone: isStep6Done, isVerifying: false },
        { step: 7, isDone: isStep7Done, isVerifying: false },
        { step: 8, isDone: isStep8Done, isVerifying: isStep8Verifying }
    ];

    let currentStepFound = false;
    return rawSteps.map((s) => {
        if (s.isDone) return { stepNumber: s.step, status: "completed" as const };
        if (s.isVerifying) return { stepNumber: s.step, status: "verifying" as const };

        // If not done and not verifying, it's either current or pending
        if (!currentStepFound) {
            currentStepFound = true;
            return { stepNumber: s.step, status: "current" as const };
        }

        return { stepNumber: s.step, status: "pending" as const };
    });
};

export const getCompanyDAO = async (cm_id: number) => {
    const query = `
        SELECT 
            cm_id, 
            cm_name, 
            cm_email 
        FROM company_master 
        WHERE cm_id = $1;
    `;
    const { rows } = await pool.query(query, [cm_id]);
    return rows[0] || null;
};
