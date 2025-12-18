import Card from "@/components/misc/Card";
import { ComponentProps, ReactNode } from "react";

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

export interface IOperation {
    id: string;
    name: string;
    title: string;
    description?: string
}

export interface ITable {
    id: string;
    name: string;
    description: string;
}

export interface IMonthlyStats {
    month: string;
    quantity: number;
}


export interface CardProps extends ComponentProps<typeof Card>{
    title: string;
    titleIcon: ReactNode;
    centerText: string;
    bottomText: string;
};


export interface ITransactMontly{
    sales: number;
    order: IOrderStats
    return: number;
}

export interface IOrderStats{
    pending: number;
    fulfilled: number;
    delayed: number;
}

export interface IYearMonth{
    year: number;
    month: string;
    id: number;
}


export interface ITransactCount{
    sales: IMonthlyStats[];
    order: {
        pending:IMonthlyStats[];
        fulfilled:IMonthlyStats[];
        delayed:IMonthlyStats[];
    };
    return: IMonthlyStats[];
}