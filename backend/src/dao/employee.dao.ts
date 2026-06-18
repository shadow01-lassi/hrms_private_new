import { pool } from "../lib/db";

export const getAllEmployeesDAO = async () => {
    const query = `
        SELECT
          em.em_id,
          em.em_cm_id,
          em.em_employee_id,
          em.em_code,
          em.em_first_name,
          em.em_last_name,
          CONCAT(em.em_first_name, ' ', em.em_last_name) AS employee_name,
          em.em_gender,
          em.em_date_of_birth,
          em.em_mobile,
          em.em_work_email,
          em.em_email,
          em.em_personal_email,
          em.em_address_line1,
          em.em_address_line2,
          em.em_address_line3,
          em.em_hire_date,
          em.em_join_date,
          em.em_designation,
          em.em_company,
          em.em_status,
          em.em_created_by,
          em.em_created_at,
          em.em_last_editted_by,
          em.em_last_editted_at,
          cm.cm_name AS company_name
        FROM employee_master em
        LEFT JOIN company_master cm ON cm.cm_id = em.em_cm_id
        ORDER BY em.em_id DESC;
    `;
    const { rows } = await pool.query(query);
    return rows || [];
};

export const getEmployeeByIdDAO = async (id: number) => {
    const query = `
        SELECT
          em.*,
          CONCAT(em.em_first_name, ' ', em.em_last_name) AS employee_name,
          cm.cm_name AS company_name
        FROM employee_master em
        LEFT JOIN company_master cm ON cm.cm_id = em.em_cm_id
        WHERE em.em_id = $1;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows ? rows[0] : null;
};

export const createEmployeeDAO = async (data: {
    em_cm_id: number;
    em_employee_id: string;
    em_first_name: string;
    em_last_name: string;
    em_gender: string;
    em_date_of_birth: string;
    em_mobile: string;
    em_work_email: string;
    em_hire_date: string;
    em_personal_email?: string;
    em_address_line1?: string;
    em_address_line2?: string;
    em_address_line3?: string;
    em_join_date?: string;
    em_designation?: string;
    em_status?: boolean;
}, createdBy: string) => {
    const query = `
        INSERT INTO employee_master (
          em_cm_id,
          em_employee_id,
          em_code,
          em_first_name,
          em_last_name,
          em_name,
          em_gender,
          em_date_of_birth,
          em_mobile,
          em_work_email,
          em_personal_email,
          em_address_line1,
          em_address_line2,
          em_address_line3,
          em_hire_date,
          em_join_date,
          em_designation,
          em_company,
          em_status,
          em_created_by,
          em_created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, COALESCE($19, true), $20, NOW())
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [
        data.em_cm_id,
        data.em_employee_id,
        data.em_employee_id, // em_code
        data.em_first_name,
        data.em_last_name,
        data.em_first_name + " " + data.em_last_name, // em_name
        data.em_gender || null,
        data.em_date_of_birth || null,
        data.em_mobile,
        data.em_work_email,
        data.em_personal_email || null,
        data.em_address_line1 || null,
        data.em_address_line2 || null,
        data.em_address_line3 || null,
        data.em_hire_date,
        data.em_join_date || null,
        data.em_designation || null,
        data.em_cm_id.toString(), // em_company
        data.em_status !== undefined ? data.em_status : true,
        createdBy
    ]);
    return rows ? rows[0] : null;
};

export const updateEmployeeDAO = async (id: number, data: {
    em_cm_id: number;
    em_employee_id: string;
    em_first_name: string;
    em_last_name: string;
    em_gender: string;
    em_date_of_birth: string;
    em_mobile: string;
    em_work_email: string;
    em_hire_date: string;
    em_personal_email?: string;
    em_address_line1?: string;
    em_address_line2?: string;
    em_address_line3?: string;
    em_join_date?: string;
    em_designation?: string;
    em_status?: boolean;
}, updatedBy: string) => {
    const query = `
        UPDATE employee_master
        SET
          em_cm_id = $1,
          em_employee_id = $2,
          em_code = COALESCE($3, em_code),
          em_first_name = $4,
          em_last_name = $5,
          em_name = $6,
          em_gender = $7,
          em_date_of_birth = $8,
          em_mobile = $9,
          em_work_email = $10,
          em_personal_email = $11,
          em_address_line1 = $12,
          em_address_line2 = $13,
          em_address_line3 = $14,
          em_hire_date = $15,
          em_join_date = $16,
          em_designation = $17,
          em_company = $18,
          em_status = $19,
          em_last_editted_by = $20,
          em_last_editted_at = NOW()
        WHERE em_id = $21
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [
        data.em_cm_id,
        data.em_employee_id,
        data.em_employee_id, // em_code
        data.em_first_name,
        data.em_last_name,
        data.em_first_name + " " + data.em_last_name, // em_name
        data.em_gender || null,
        data.em_date_of_birth || null,
        data.em_mobile,
        data.em_work_email,
        data.em_personal_email || null,
        data.em_address_line1 || null,
        data.em_address_line2 || null,
        data.em_address_line3 || null,
        data.em_hire_date,
        data.em_join_date || null,
        data.em_designation || null,
        data.em_cm_id.toString(), // em_company
        data.em_status !== undefined ? data.em_status : true,
        updatedBy,
        id
    ]);
    return rows ? rows[0] : null;
};

export const updateEmployeeStatusDAO = async (id: number, status: boolean, updatedBy: string) => {
    const query = `
        UPDATE employee_master
        SET
          em_status = $1,
          em_last_editted_by = $2,
          em_last_editted_at = NOW()
        WHERE em_id = $3
        RETURNING *;
    `;
    const { rows } = await pool.query(query, [status, updatedBy, id]);
    return rows ? rows[0] : null;
};

export const quickCreateEmployeeDAO = async (data: {
    em_cm_id: number;
    em_employee_id: string;
    em_first_name: string;
    em_last_name: string;
    em_date_of_birth: string;
    em_mobile: string;
    em_work_email: string;
    em_hire_date: string;
    em_designation?: string;
    em_status?: boolean;
    el_username: string;
    el_password_hash: string;
    el_role: number;
}, createdBy: string) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // 1. Insert into employee_master
        const empQuery = `
            INSERT INTO employee_master (
              em_cm_id,
              em_employee_id,
              em_code,
              em_first_name,
              em_last_name,
              em_name,
              em_gender,
              em_date_of_birth,
              em_mobile,
              em_work_email,
              em_hire_date,
              em_join_date,
              em_designation,
              em_company,
              em_status,
              em_created_by,
              em_created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, COALESCE($15, true), $16, NOW())
            RETURNING *;
        `;
        const empName = `${data.em_first_name} ${data.em_last_name}`;
        const empResult = await client.query(empQuery, [
            data.em_cm_id,
            data.em_employee_id,
            data.em_employee_id, // em_code
            data.em_first_name,
            data.em_last_name,
            empName,
            null, // em_gender
            data.em_date_of_birth,
            data.em_mobile,
            data.em_work_email,
            data.em_hire_date,
            data.em_hire_date, // em_join_date same as hire_date
            data.em_designation || null,
            data.em_cm_id.toString(), // em_company (string representation like full details)
            data.em_status !== undefined ? data.em_status : true,
            createdBy
        ]);

        const newEmp = empResult.rows[0];

        // 2. Insert into employee_login
        const loginQuery = `
            INSERT INTO employee_login (
              el_cm_id,
              el_em_id,
              el_username,
              el_name,
              el_password,
              el_role,
              el_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;
        const loginResult = await client.query(loginQuery, [
            data.em_cm_id,
            newEmp.em_id,
            data.el_username,
            empName,
            data.el_password_hash,
            data.el_role,
            data.em_status !== undefined ? data.em_status : true
        ]);

        await client.query("COMMIT");
        return {
            employee: newEmp,
            login: loginResult.rows[0]
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

