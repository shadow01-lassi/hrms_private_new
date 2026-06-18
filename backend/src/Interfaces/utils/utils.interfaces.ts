export interface InterfaceSendMail {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export interface InterfaceJwtPayload {
    id: number;
    name: string;
    email: string;
    role: string;
    iat: string;
    expires: string;
}

export interface IError extends Error {
    statusCode: any;
    status: any;
    message: any;
    stack?: any;
    isOperational: boolean;
    name: string;
}
