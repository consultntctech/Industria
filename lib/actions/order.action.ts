'use server';

import { IResponse } from "@/types/Types";
import Order, { IOrder } from "../models/order.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/org.model';
import '../models/user.model'
import '../models/product.model'
import '../models/customer.model'
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";


export async function createOrder(data:Partial<IOrder>):Promise<IResponse>{
    try {
        await connectDB();
        const order = await Order.create(data);
        return respond('Order created successfully', false, order, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating order', true, {}, 500);
    }
}

export async function updateOrder(data:Partial<IOrder>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedOrder = await Order.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Order updated successfully', false, updatedOrder, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating order', true, {}, 500);
    }
}

export async function getOrders():Promise<IResponse>{
    try {
        await connectDB();
        const orders = await Order.find();
        return respond('Orders found successfully', false, orders, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching orders', true, {}, 500);
    }
}

export async function getTodayOrders():Promise<IResponse>{
    try {
        await connectDB();
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const orders = await Order.find({
            createdAt: { $gte: start, $lt: end }
        })
        .populate('customer')
        .populate('product')
        .populate('createdBy')
        .populate('org')
        .lean<IOrder[]>();
        return respond('Orders found successfully', false, orders, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching orders', true, {}, 500);
    }
}


export async function getTodayOrdersByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        const orders = await Order.find({ org: orgId, createdAt: { $gte: start, $lt: end } })
        .populate('customer')
        .populate('product')
        .populate('createdBy')
        .populate('org')
        .lean<IOrder[]>();
        return respond('Orders found successfully', false, orders, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching orders', true, {}, 500);
    }
}


export async function getOrdersByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const orders = await Order.find({ org: orgId });
        return respond('Orders found successfully', false, orders, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching orders', true, {}, 500);
    }
}


export async function getOrder(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const check = await verifyOrgAccess(Order, id, "Order");
        if ("allowed" in check === false) return check;
        const order = check.doc;
        return respond('Order found successfully', false, order, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching order', true, {}, 500);
    }
}

export async function deleteOrder(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const order = await Order.findById(id);
        if (!order) {
            return respond('Order not found', true, {}, 404);
        }
        const deletedOrder = await Order.deleteOne({ _id: id });
        return respond('Order deleted successfully', false, deletedOrder, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting order', true, {}, 500);
    }
}