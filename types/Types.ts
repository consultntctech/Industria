export interface IResponse {
    message: string;
    error: boolean;
    payload?: object;
    code?: number;
}

export interface ISession {
    _id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    photo: string;
    password:string;
    roles: string[];
    description: string;
    org: string
    expires?: Date;
}