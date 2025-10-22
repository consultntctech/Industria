export interface IResponse {
    message: string;
    error: boolean;
    payload?: object;
    code?: number;
}