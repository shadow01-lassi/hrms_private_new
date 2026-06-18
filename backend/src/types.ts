export type SessionUserType = {
    id: number;
    company: number;
    cm_id: number;
    email: string;
    name: string;
    role: string;
    access: string;
    clientId: string;
    token: string;
    username: string;
    flat: string;
};

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace -- required: Express augmentation must use namespace
    namespace Express {
        interface Request {
            clientId?: string;
            user?: SessionUserType;
            company?: CompanyMasterType;
        }
    }
}

export type UserType = {
    u_id: number;
    u_name: string;
    u_email: string;
    u_password: string;
};

export type CompanyMasterType = {
    cm_id: number;
    cm_name: string;
    cm_email: string;
    cm_status: boolean;
    cm_logo?: string;
    cm_address?: string;
    cm_mobile?: string;
};

export type AccessObjType = {
    GET: "ra_read";
    POST: "ra_create";
    PUT: "ra_update";
    DELETE: "ra_delete";
};