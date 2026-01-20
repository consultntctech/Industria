import Card from "@/components/misc/Card";
import { IRole } from "@/lib/models/role.model";
import { Types } from "mongoose";
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
    roles: string[] | Types.ObjectId[] | IRole[];
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
    sales?: {
        quantity: number;
        amount: number;
    };
    orders?: {
        quantity: number;
        amount: number;
    };
    returns?: {
        quantity: number;
        amount: number;
    };
    production?: {
        quantity: number;
        amount: number;
    };
    packaging?: {
        quantity: number;
        amount: number;
    };
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

export interface IGlobalFinance{
    sales: IMonthlyStats[];
    orders: IMonthlyStats[];
    returns: IMonthlyStats[];
    production: IMonthlyStats[];
    packaging: IMonthlyStats[];
}

export interface IOrderAndSalesStats{
    month:string;
    sales: number;
    orders: number;
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

export interface IDailyStats{
    day:string;
    quantity: number;
}

export interface IWeeklyStats{
    week:string;
    quantity: number;
}

export interface IPackageStats{
    pack:number,
    daily:IDailyStats[],
    weekly:IWeeklyStats[],
}

export type QuanityOrPrice = "quantity" | "price";

export interface IPackagedProducts{
    product:string,
    quantity:number,
}


export interface IProductionStats{
    input: number;
    output: number;
    lossPercent: number; //lossQuantity/inputQuantity * 100  round to 2 decimal places
    efficiencyPercent: number; //outputQuantity/inputQuantity * 100  round to 2 decimal places
    outputTrend:{
        month: string;
        efficiencyPercent: number; //outputQuantity/inputQuantity * 100  round to 2 decimal places
        xEfficiencyPercent: number; //xQuantity/inputQuantity * 100  round to 2 decimal places
    }[];
}



export interface IProductStats{
    name: string;
    type: IProductType
    threshold: number;
    stock: number;
    outOfStock: number;
}


export type IProductType = 'Raw Material' | 'Finished Good'


export interface IProductCardData{
    name: string;
    stock: string;
    threshold: string;
}


export interface IDashboardStats{
    rawMaterials: number;
    productionOutput: number;
    rejectedPercent: number; //1 decimal place
    ordersInProgress: number; //status: Pending
    sales: number;
    returns: number;
    ordersFulfilled: number;
    ordersDelayed: number;
    rawMaterialsValue: number;
    inventory: {month: string; rawMaterial:number, finishedGood:number}[];
    rejection: {week:string, rawMaterial:number, production:number}[];
    production:{day:string, quantity:number}[]
    orderFulfillmentStatus: number; //1 decimal place
}


export interface IResetPayload{
    email: string;
    expires: Date | string;
}


export type OperationName =
  | 'READ'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE';



export interface IDashStats{
    rawMaterials:IGroupedQuantity[];

    lineitems:IGroupedQuantity[]
}

export interface IGroupedQuantity {
  product: string;
  quantity: number;
}


export interface ITablePermision {
    tableId: string;
    operation?: OperationName
}