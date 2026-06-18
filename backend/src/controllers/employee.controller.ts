import { Request, Response } from "express";
import * as emp_dao from "../dao/employee.dao";
import bcrypt from "bcryptjs";
import { pool } from "../lib/db";

export const getAllEmployees = async (request: Request, response: Response): Promise<void> => {
    const results = await emp_dao.getAllEmployeesDAO();
    response.status(200).json({ type: "success", message: "Employees fetched successfully", data: results });
};

export const getEmployeeById = async (request: Request, response: Response): Promise<void> => {
    const { id } = request.params;
    const result = await emp_dao.getEmployeeByIdDAO(Number(id));
    if (result) {
        response.status(200).json({ type: "success", message: "Employee fetched successfully", data: result });
    } else {
        response.status(404).json({ type: "error", message: "Employee not found" });
    }
};

export const createEmployee = async (request: Request, response: Response): Promise<void> => {
    const { em_cm_id, em_employee_id, em_first_name, em_last_name, em_date_of_birth, em_mobile, em_work_email, em_hire_date } = request.body;
    
    if (!em_cm_id || !em_employee_id || !em_first_name || !em_last_name || !em_date_of_birth || !em_mobile || !em_work_email || !em_hire_date) {
        response.status(400).json({ type: "error", message: "Required fields are missing" });
        return;
    }

    const createdBy = request.user?.username || request.body.username || 'admin';
    const result = await emp_dao.createEmployeeDAO(request.body, createdBy);
    if (result) {
        response.status(201).json({ type: "success", message: "Employee created successfully", data: result });
    } else {
        response.status(500).json({ type: "error", message: "Failed to create employee" });
    }
};

export const updateEmployee = async (request: Request, response: Response): Promise<void> => {
    const { id } = request.params;
    const { em_cm_id, em_employee_id, em_first_name, em_last_name, em_date_of_birth, em_mobile, em_work_email, em_hire_date } = request.body;

    if (!em_cm_id || !em_employee_id || !em_first_name || !em_last_name || !em_date_of_birth || !em_mobile || !em_work_email || !em_hire_date) {
        response.status(400).json({ type: "error", message: "Required fields are missing" });
        return;
    }

    const updatedBy = request.user?.username || request.body.username || 'admin';
    const result = await emp_dao.updateEmployeeDAO(Number(id), request.body, updatedBy);
    if (result) {
        response.status(200).json({ type: "success", message: "Employee updated successfully", data: result });
    } else {
        response.status(500).json({ type: "error", message: "Failed to update employee" });
    }
};

export const updateEmployeeStatus = async (request: Request, response: Response): Promise<void> => {
    const { id } = request.params;
    const { em_status } = request.body;
    
    if (em_status === undefined) {
        response.status(400).json({ type: "error", message: "Status is required" });
        return;
    }

    const updatedBy = request.user?.username || request.body.username || 'admin';
    const result = await emp_dao.updateEmployeeStatusDAO(Number(id), Boolean(em_status), updatedBy);
    if (result) {
        response.status(200).json({ type: "success", message: "Employee status updated successfully", data: result });
    } else {
        response.status(500).json({ type: "error", message: "Failed to update employee status" });
    }
};

export const quickCreateEmployee = async (request: Request, response: Response): Promise<void> => {
    const {
        em_cm_id,
        em_employee_id,
        em_first_name,
        em_last_name,
        em_date_of_birth,
        em_mobile,
        em_work_email,
        em_hire_date,
        em_designation,
        em_status,
        el_username,
        el_password,
        el_role
    } = request.body;

    if (
        !em_cm_id ||
        !em_employee_id ||
        !em_first_name ||
        !em_last_name ||
        !em_date_of_birth ||
        !em_mobile ||
        !em_work_email ||
        !em_hire_date ||
        !el_username ||
        !el_password ||
        !el_role
    ) {
        response.status(400).json({ type: "error", message: "Required fields are missing" });
        return;
    }

    try {
        // 1. Check for duplicate username in employee_login
        const checkUser = await pool.query(
            "SELECT 1 FROM employee_login WHERE el_cm_id = $1 AND el_username = $2 LIMIT 1",
            [em_cm_id, el_username]
        );
        if (checkUser.rows.length > 0) {
            response.status(400).json({ type: "error", message: "Username already exists in this company" });
            return;
        }

        // 2. Check for duplicate employee ID in employee_master
        const checkEmpId = await pool.query(
            "SELECT 1 FROM employee_master WHERE em_cm_id = $1 AND em_employee_id = $2 LIMIT 1",
            [em_cm_id, em_employee_id]
        );
        if (checkEmpId.rows.length > 0) {
            response.status(400).json({ type: "error", message: "Employee ID already exists in this company" });
            return;
        }

        // 3. Check for duplicate work email in employee_master
        const checkEmail = await pool.query(
            "SELECT 1 FROM employee_master WHERE em_cm_id = $1 AND em_work_email = $2 LIMIT 1",
            [em_cm_id, em_work_email]
        );
        if (checkEmail.rows.length > 0) {
            response.status(400).json({ type: "error", message: "Work Email already exists in this company" });
            return;
        }

        // 4. Hash the password
        const salt = await bcrypt.genSalt(10);
        const el_password_hash = await bcrypt.hash(el_password, salt);

        const createdBy = request.user?.username || request.body.username || 'admin';

        // 5. Call DAO to execute the transaction
        const result = await emp_dao.quickCreateEmployeeDAO({
            em_cm_id: Number(em_cm_id),
            em_employee_id: String(em_employee_id),
            em_first_name: String(em_first_name),
            em_last_name: String(em_last_name),
            em_date_of_birth: String(em_date_of_birth),
            em_mobile: String(em_mobile),
            em_work_email: String(em_work_email),
            em_hire_date: String(em_hire_date),
            em_designation: em_designation ? String(em_designation) : undefined,
            em_status: em_status !== undefined ? Boolean(em_status) : true,
            el_username: String(el_username),
            el_password_hash,
            el_role: Number(el_role)
        }, createdBy);

        if (result) {
            response.status(201).json({ type: "success", message: "Employee Quick Setup completed successfully", data: result });
        } else {
            response.status(500).json({ type: "error", message: "Failed to perform quick setup" });
        }
    } catch (error: any) {
        console.error("Error in quickCreateEmployee controller:", error);
        response.status(500).json({ type: "error", message: "Internal Server Error" });
    }
};
