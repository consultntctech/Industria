'use server'

import { IResponse } from "@/types/Types";
import Returns, { IReturns } from "../models/returns.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/user.model'
import '../models/org.model'
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import LineItem from "../models/lineitem.model";

export async function createReturns(data:Partial<IReturns>):Promise<IResponse>{
    try {
        await connectDB();
        const items = data.products as string[];
        if(!items || items.length === 0){
            return respond('No items to return', true, {}, 400);
        }
        const returns = await Returns.create(data);
        await LineItem.updateMany({ _id: { $in: items } }, {soldTo: data.customer, status: 'Returned' });
        const text = (data?.products?.length || []?.length) > 1 ? 'Items' : 'Item';
        return respond(`${text} returned successfully`, false, returns, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while returning items', true, {}, 500);
    }
}

export async function getReturns():Promise<IResponse>{
    try {
        await connectDB();
        const returns = await Returns.find()
        .populate('org')
        .populate('customer')
        .populate({path:'products', populate:[{path:'product'}, {path:'batch'}]})
        .populate('createdBy')
        .lean<IReturns[]>();
        return respond('Returns found successfully', false, returns, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching returns', true, {}, 500);
    }
}

export async function getReturnsByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const returns = await Returns.find({ org: orgId })
        .populate('org')
        .populate('customer')
        .populate({path:'products', populate:[{path:'product'}, {path:'batch'}]})
        .populate('createdBy')
        .lean<IReturns[]>();
        return respond('Returns found successfully', false, returns, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching returns', true, {}, 500);
    }
}


export async function getReturnsByCustomer(customerId:string):Promise<IResponse>{
    try {
        await connectDB();
        const returns = await Returns.find({ customer: customerId })
        .populate('org')
        .populate('customer')
        .populate({path:'products', populate:[{path:'product'}, {path:'batch'}]})
        .populate('createdBy')
        .lean<IReturns[]>();
        return respond('Returns found successfully', false, returns, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching returns', true, {}, 500);
    }
}

export async function getReturnsByProduct(productId:string):Promise<IResponse>{
    try {
        await connectDB();
        const returns = await Returns.find({ products: productId })
        .populate('org')
        .populate('customer')
        .populate({path:'products', populate:[{path:'product'}, {path:'batch'}]})
        .populate('createdBy')
        .lean<IReturns[]>();
        return respond('Returns found successfully', false, returns, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching returns', true, {}, 500);
    }
}

export async function getReturnsByOrgAndCustomer(orgId:string, customerId:string):Promise<IResponse>{
    try {
        await connectDB();
        const returns = await Returns.find({ org: orgId, customer: customerId })
        .populate('org')
        .populate('customer')
        .populate({path:'products', populate:[{path:'product'}, {path:'batch'}]})
        .populate('createdBy')
        .lean<IReturns[]>();
        return respond('Returns found successfully', false, returns, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching returns', true, {}, 500);
    }
}


export async function getTodayReturns(): Promise<IResponse> {
  try {
    await connectDB();

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const sales = await Returns.find({
      createdAt: { $gte: start, $lt: end }
    })
      .populate("customer")
      .populate({path:'products', populate:[{path:'product'}, {path:'batch'}]})
      .populate("createdBy")
      .populate("org")
      .lean<IReturns[]>();

    return respond("Returns found successfully", false, sales, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occurred while fetching returns", true, {}, 500);
  }
}


export async function getTodayReturnsByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        const sales = await Returns.find({ org: orgId, createdAt: { $gte: start, $lt: end } })
        .populate("customer")
        .populate({path:'products', populate:[{path:'product'}, {path:'batch'}]})
        .populate("createdBy")
        .populate("org")
        .lean<IReturns[]>();
        return respond('Returns found successfully', false, sales, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching returns', true, {}, 500);
    }
}



export async function getReturnsByOrgAndProduct(orgId:string, productId:string):Promise<IResponse>{
    try {
        await connectDB();
        const returns = await Returns.find({ org: orgId, products: productId })
        .populate('org')
        .populate('customer')
        .populate({path:'products', populate:[{path:'product'}, {path:'batch'}]})
        .populate('createdBy')
        .lean<IReturns[]>();
        return respond('Returns found successfully', false, returns, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching returns', true, {}, 500);
    }
}


export async function updateReturns(data:Partial<IReturns>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedReturns = await Returns.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Returns updated successfully', false, updatedReturns, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating returns', true, {}, 500);
    }
}

export async function getReturn(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const check = await verifyOrgAccess(Returns, id, "Returns", [
            { path: "customer" },
            { path: "products", populate:[{path:'product'}, {path:'batch'}] },
            { path: "createdBy" },
            { path: "org" },
        ]);
        if ("allowed" in check === false) return check;
        const returns = check.doc;
        return respond('Returns found successfully', false, returns, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching returns', true, {}, 500);
    }
}

export async function deleteReturns(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedReturns = await Returns.deleteOne({ _id: id });
        return respond('Returns deleted successfully', false, deletedReturns, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting returns', true, {}, 500);
    }
}