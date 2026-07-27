'use server'

import { IResponse } from "@/types/Types";
import OtherCurrency, { IOtherCurrency } from "../models/othercurrency.model";
import { connectDB } from "../mongoose";
import { respond } from "../misc";
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";


export async function createOtherCurrency(data:Partial<IOtherCurrency>):Promise<IResponse>{
    try {
        await connectDB();
        const currency = await OtherCurrency.create(data);
        return respond('Currency created successfully', false, currency, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating currency', true, {}, 500);
    }
}


export async function getOtherCurrencies():Promise<IResponse>{
    try {
        await connectDB();
        const currencies = await OtherCurrency.find();
        return respond('Currencies found successfully', false, currencies, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching currencies', true, {}, 500);
    }
}

export async function getOtherCurrencyByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const currencies = await OtherCurrency.find({ org: orgId });
        return respond('Currencies found successfully', false, currencies, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching currencies', true, {}, 500);
    }
}


export async function updateOtherCurrency(data:Partial<IOtherCurrency>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedCurrency = await OtherCurrency.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Currency updated successfully', false, updatedCurrency, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating currency', true, {}, 500);
    }
}

export async function getOtherCurrency(id: string): Promise<IResponse> {
  try {
    await connectDB();

    const check = await verifyOrgAccess(OtherCurrency, id, "Currency");

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

export async function deleteOtherCurrency(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedCurrency = await OtherCurrency.deleteOne({ _id: id });
        return respond('Currency deleted successfully', false, deletedCurrency, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting currency', true, {}, 500);
    }
}