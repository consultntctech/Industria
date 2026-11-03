'use server'

import { IResponse } from "@/types/Types";
import { generateTransactionNumber, getRequiredLength, IExistingNumber, respond } from "../misc";
import TransConfig, { ITransConfig } from "../models/transconfig.model";
import { connectDB } from "../mongoose";
import Sales, { ISales } from "../models/sales.model";
import Order, { IOrder } from "../models/order.model";

export async function createTransConfig(data:Partial<ITransConfig>){
    try {
        await connectDB();
        const config = await TransConfig.create(data);
        return respond('Transaction configuration set', false, config, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating transaction configuration', true, {}, 500);
    }
}


export async function updateTransConfig(
    data: Partial<ITransConfig>
) {
    try {
        await connectDB();

        if (!data._id) {
            return respond("Transaction configuration ID is required",true,{},400);
        }

        const currentConfig = await TransConfig.findById(data._id).lean() as unknown as ITransConfig;

        if (!currentConfig) {
            return respond("Transaction configuration not found", true, {}, 404 );
        }

        if (data.invoice) {
            const sales = await Sales.find(
                { org: currentConfig.org },
                { "invoice.code": 1, "invoice.auto": 1 }
            ).lean() as unknown as ISales[];

            const existingNumbers: IExistingNumber[] = sales
                .filter((sale) => sale.invoice?.code)
                .map((sale) => ({
                    code: sale.invoice.code,
                    auto: sale.invoice.auto
                }));

            const requiredLength = getRequiredLength(
                currentConfig.invoice,
                existingNumbers
            );

            if (data.invoice.length < requiredLength) {
                return respond(`Invoice length cannot be less than ${requiredLength}`, true, { requiredLength },400);
            }
        }

        if (data.salesOrder) {
            const orders = await Order.find(
                { org: currentConfig.org },
                { "salesOrder.code": 1, "salesOrder.auto": 1 }
            ).lean() as unknown as IOrder[];

            const existingNumbers: IExistingNumber[] = orders
                .filter((order) => order?.salesOrder?.code)
                .map((order) => ({
                    code: order?.salesOrder?.code,
                    auto: order?.salesOrder?.auto
                }));

            const requiredLength = getRequiredLength(
                currentConfig.salesOrder,
                existingNumbers
            );

            if (data.salesOrder.length < requiredLength) {
                return respond(`Sales order length cannot be less than ${requiredLength}`, true, { requiredLength }, 400);
            }
        }

        const updatedConfig = await TransConfig.findByIdAndUpdate(
            data._id,
            data,
            { new: true, runValidators: true }
        );

        return respond("Transaction configuration updated", false, updatedConfig, 200 );
    } catch (error) {
        console.error(error);

        return respond("Error occurred while updating transaction configuration", true, {}, 500 );
    }
}


export async function getTransConfig(orgId: string):Promise<IResponse>{
    try {
        await connectDB();
        
        const config = await TransConfig.findOne({org:orgId});
        return respond('Configuration fetched successfully', false, config, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching transaction configuration', true, {}, 500)
    }
}


export async function getInvoice(orgId: string) {
    try {
        await connectDB();

        const config = await TransConfig.findOne({ org: orgId }).lean() as unknown as ITransConfig;

        if (!config) {
            return respond("Transaction configuration not found", true, {},404);
        }

        const existingSales = await Sales.find(
            { org: orgId },
            { "invoice.code": 1, "invoice.auto": 1 }
        ).lean();

        const existingNumbers: IExistingNumber[] = existingSales
            .filter((sale) => sale?.invoice?.code)
            .map((sale) => ({
                code: sale?.invoice.code,
                auto: sale?.invoice.auto
            }));

        const result = await generateTransactionNumber(
            config.invoice,
            existingNumbers
        );

        return respond("Invoice generated successfully", false, result, 200 );
    } catch (error) {
        console.error(error);

        return respond("Error occurred while fetching invoice", true,{}, 500 );
    }
}



export async function getSalesOrder(orgId: string) {
    try {
        await connectDB();

        const config = await TransConfig.findOne({ org: orgId }).lean() as unknown as ITransConfig;

        if (!config) {
            return respond("Transaction configuration not found",true,{},404);
        }

        const existingOrders = await Order.find(
            { org: orgId },
            { "salesOrder.code": 1, "salesOrder.auto": 1 }
        ).lean() as unknown as IOrder[];

        const existingNumbers: IExistingNumber[] = existingOrders
            .filter((order) => order?.salesOrder?.code)
            .map((order) => ({
                code: order?.salesOrder?.code,
                auto: order?.salesOrder?.auto
            }));

        const result = await generateTransactionNumber(
            config.salesOrder,
            existingNumbers
        );

        return respond("Sales order number generated successfully", false, result, 200 );
    } catch (error) {
        console.error(error);

        return respond("Error occurred while fetching sales order number", true, {}, 500 );
    }
}