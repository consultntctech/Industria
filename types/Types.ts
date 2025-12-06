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

export interface IIngredient {
    materialId: string;
    qUsed: number;
}

export interface IQSelector {
    materialId: string;
    quantity: number;
}


export interface IQGSelector {
    goodId: string;
    quantity: number;
}


export interface ISoldItem {
    id: string;
    name: string;
    quantity: number;
}


export interface IStats {
    totalSales?: number;
    totalSalesAmount?: number;
    totalOrders?: number;
    totalOrdersAmount?: number;
    totalReturns?: number;
    totalReturnsAmount?: number;
    totalProductions?: number;
    totalProductionsAmount?: number;
    totalPackaging?: number;
    totalPackagingAmount?: number;
}