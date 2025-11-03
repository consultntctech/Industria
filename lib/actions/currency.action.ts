'use server';

import { IResponse } from "@/types/Types";
import Currency, { ICurrency } from "../models/currency.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";

export async function createCurrency(data:Partial<ICurrency>):Promise<IResponse>{
    try {
        await connectDB();
        const currency = await Currency.findOne({ org: data.org });
        let opp;
        if(currency){
           opp =  await Currency.findByIdAndUpdate(currency._id, data, { new: true });
        }else{
           opp  = await Currency.create(data);
        }
        return respond('Currency created successfully', false, opp, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating currency', true, {}, 500);
    }
}


export async function getCurrencies():Promise<IResponse>{
    try {
        await connectDB();
        const currencies = await Currency.find();
        return respond('Currencies found successfully', false, currencies, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching currencies', true, {}, 500);
    }
}

export async function getCurrencyByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const currencies = await Currency.findOne({ org: orgId });
        return respond('Currencies found successfully', false, currencies, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching currencies', true, {}, 500);
    }
}


export async function updateCurrency(data:Partial<ICurrency>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedCurrency = await Currency.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Currency updated successfully', false, updatedCurrency, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating currency', true, {}, 500);
    }
}

export async function getCurrency(id: string): Promise<IResponse> {
  try {
    await connectDB();

    const check = await verifyOrgAccess(Currency, id, "Currency");

    // If not allowed, return the middleware's response directly
    if ("allowed" in check === false) return check;

    // Authorized → you can use check.doc safely, fully typed as Currency
    const currency = check.doc;

    return respond("Currency retrieved successfully", false, currency, 200);
  } catch (error) {
    console.error(error);
    return respond("Error occurred retrieving currency", true, {}, 500);
  }
}

export async function deleteCurrency(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedCurrency = await Currency.deleteOne({ _id: id });
        return respond('Currency deleted successfully', false, deletedCurrency, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting currency', true, {}, 500);
    }
}