import { Request, Response } from "express";
import * as comp_dao from "../dao/company.dao";

export const getUserCompany = async (request: Request, response: Response): Promise<void> => {
    const { username } = request.body;

    const results = await comp_dao.fetchAllCompanies(username);
    if (results) {
        response.status(200).json({ type: "success", message: "Role fetched successfully", data: results });
    }
    else {
        throw new Error("Some error occured while fetching role");
    }
};

export const getOneCompany = async (request: Request, response: Response): Promise<void> => {
    const { companyId } = request.query;
    const results = await comp_dao.getCompanyByIdDAO(Number(companyId));
    if (results) {
        response.status(200).json({ type: "success", message: "Role fetched successfully", data: results });
    }
    else {
        throw new Error("Some error occured while fetching role");
    }
}
export const getCompanyForSetup = async (request: Request, res: Response): Promise<void> => {
    const { company } = request.body;
    
    if (!company) {
        res.status(401).json({ type: "error", message: "Unauthorized!" });
        return;
    }

    const result = await comp_dao.getCompanyByIdDAO(Number(company));
    if (result) {
        res.status(200).json({ type: "success", data: result });
    } else {
        res.status(404).json({ type: "error", message: "Company not found" });
    }
};

export const updateCompanyFromSetup = async (request: Request, res: Response): Promise<void> => {
    const { company } = request.body;
    
    if (!company) {
        res.status(401).json({ type: "error", message: "Unauthorized!" });
        return;
    }

    const {
        cm_name,
        cm_registration_no,
        cm_pan_no,
        cm_gstin_no,
        cm_logo,
        account_holder_name,
        account_number,
        ifsc,
        account_type,
        bank_name,
        upi_id
    } = request.body;

    try {
        const result = await comp_dao.updateCompanyRegistrationDetailsDAO(
            Number(company),
            cm_name,
            cm_registration_no,
            cm_pan_no,
            cm_gstin_no,
            cm_logo,
            account_holder_name,
            account_number,
            ifsc,
            account_type,
            bank_name,
            upi_id
        );

        if (result) {
            res.status(200).json({ type: "success", message: "Settings updated successfully!", data: result });
        } else {
            res.status(500).json({ type: "error", message: "Failed to update settings" });
        }
    } catch (error: any) {
        console.error("Error updating company setup:", error);
        res.status(500).json({ type: "error", message: "Database update failed" });
    }
};

export const getAllCompanyMaster = async (request: Request, response: Response): Promise<void> => {
    const results = await comp_dao.getAllCompanyMasterDAO();
    response.status(200).json({ type: "success", message: "Companies fetched successfully", data: results });
};

export const getCompanyMasterById = async (request: Request, response: Response): Promise<void> => {
    const { id } = request.params;
    const result = await comp_dao.getCompanyMasterByIdDAO(Number(id));
    if (result) {
        response.status(200).json({ type: "success", message: "Company fetched successfully", data: result });
    } else {
        response.status(404).json({ type: "error", message: "Company not found" });
    }
};

export const createCompanyMaster = async (request: Request, response: Response): Promise<void> => {
    const { cm_name } = request.body;
    if (!cm_name) {
        response.status(400).json({ type: "error", message: "Company name is required" });
        return;
    }
    const createdBy = request.user?.username || request.body.username || 'admin';
    const result = await comp_dao.createCompanyMasterDAO(request.body, createdBy);
    if (result) {
        response.status(201).json({ type: "success", message: "Company created successfully", data: result });
    } else {
        response.status(500).json({ type: "error", message: "Failed to create company" });
    }
};

export const updateCompanyMaster = async (request: Request, response: Response): Promise<void> => {
    const { id } = request.params;
    const { cm_name } = request.body;
    if (!cm_name) {
        response.status(400).json({ type: "error", message: "Company name is required" });
        return;
    }
    const updatedBy = request.user?.username || request.body.username || 'admin';
    const result = await comp_dao.updateCompanyMasterDAO(Number(id), request.body, updatedBy);
    if (result) {
        response.status(200).json({ type: "success", message: "Company updated successfully", data: result });
    } else {
        response.status(500).json({ type: "error", message: "Failed to update company" });
    }
};

export const deactivateCompanyMaster = async (request: Request, response: Response): Promise<void> => {
    const { id } = request.params;
    const updatedBy = request.user?.username || request.body.username || 'admin';
    const result = await comp_dao.deactivateCompanyMasterDAO(Number(id), updatedBy);
    if (result) {
        response.status(200).json({ type: "success", message: "Company deactivated successfully", data: result });
    } else {
        response.status(500).json({ type: "error", message: "Failed to deactivate company" });
    }
};

export const getCompanyMasterDropdown = async (request: Request, response: Response): Promise<void> => {
    const results = await comp_dao.getCompanyMasterDropdownDAO();
    response.status(200).json({ type: "success", message: "Company dropdown fetched successfully", data: results });
};

