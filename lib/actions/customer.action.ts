'use server'

import { IResponse } from "@/types/Types";
import Customer, { ICustomer } from "../models/customer.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/org.model';
import '../models/user.model'
import '../models/product.model';
import '../models/lineitem.model';
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import Sales, { ISales } from "../models/sales.model";
import Order, { IOrder } from "../models/order.model";
import Returns, { IReturns } from "../models/returns.model";
import { ICustomerStats } from "@/types/OtherTypes";

export async function createCustomer(data: Partial<ICustomer>): Promise<IResponse> {
  try {
    await connectDB();
    const customer = await Customer.create(data);
    return respond('Customer created successfully', false, customer, 201);
  } catch (error) {
    console.log(error);
    return respond('Error occured while creating customer', true, {}, 500);
  }
}

export async function getCustomers(): Promise<IResponse> {
  try {
    await connectDB();
    const customers = await Customer.find()
    .populate('org')
    .populate('createdBy')
    .lean() as unknown as ICustomer[];
    return respond('Customers found successfully', false, customers, 200);
  } catch (error) {
    console.log(error);
    return respond('Error occured while fetching customers', true, {}, 500);
  }
}

export async function getCustomersByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const customers = await Customer.find({ org: orgId })
        .populate('org')
        .populate('createdBy')
        .lean() as unknown as ICustomer[];
        return respond('Customers found successfully', false, customers, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching customers', true, {}, 500);
    }
}


export async function updateCustomer(data:Partial<ICustomer>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedCustomer = await Customer.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Customer updated successfully', false, updatedCustomer, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating customer', true, {}, 500);
    }
}

export async function getCustomer(id: string): Promise<IResponse> {
  try {
    await connectDB();
    const check = await verifyOrgAccess(Customer, id, "Customer");

    // If not allowed, return the middleware's response directly
    if ("allowed" in check === false) return check;

    // Authorized → you can use check.doc safely, fully typed as Production
    const customer = check.doc;

    return respond("Customer retrieved successfully", false, customer, 200);
  } catch (error) {
    console.error(error);
    return respond("Error occurred retrieving customer", true, {}, 500);
  }
}


export async function getCustomerItems(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const [sales, orders, returns] = await Promise.all([
          Sales.find({ customer: id }).populate({path:'products', populate:{path:'product'}}).populate('createdBy') as unknown as ISales[],
          Order.find({ customer: id, status:'Fulfilled' }).populate({path:'products', populate:{path:'product'}}).populate('createdBy') as unknown as IOrder[],
          Returns.find({ customer: id }).populate({path:'products', populate:{path:'product'}}).populate('createdBy') as unknown as IReturns[],
        ]);
        const data:ICustomerStats = {
          sales: sales?.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime()),
          orders: orders?.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime()),
          returns: returns?.sort((a, b) => new Date(b?.createdAt!).getTime() - new Date(a?.createdAt!).getTime()),
        }
        return respond('Customer found successfully', false, data, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching customer', true, {}, 500);
    }
}


export async function deleteCustomer(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedCustomer = await Customer.deleteOne({ _id: id });
        return respond('Customer deleted successfully', false, deletedCustomer, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting customer', true, {}, 500);
    }
}