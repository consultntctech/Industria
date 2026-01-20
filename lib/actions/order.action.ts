'use server';

import { IOrderStats, IResponse } from "@/types/Types";
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
        const orders = await Order.find()
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
        const orders = await Order.find({ org: orgId })
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


export async function getOrder(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const check = await verifyOrgAccess(Order, id, "Order", [
            { path: "customer" },
            { path: "product" },
            { path: "createdBy" },
            { path: "org" },
        ]);
        if ("allowed" in check === false) return check;
        const order = check.doc;
        return respond('Order found successfully', false, order, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching order', true, {}, 500);
    }
}


export async function getOrdersGroupedByMonth(): Promise<IResponse> {
    try {
        await connectDB();

        const now = new Date();

        // First day of month, 5 months ago (inclusive)
        const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        // Last moment of current month
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const orders = await Order.aggregate([
            {
                $match: {
                    price: { $ne: null },
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    quantity: { $sum: "$price" }
                }
            }
        ]);

        /* ======================================================
           BUILD LAST 6 MONTHS + FILL MISSING WITH 0
        ====================================================== */

        const result: { month: string; quantity: number }[] = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = date.getFullYear();
            const monthNumber = date.getMonth() + 1;

            const match = orders.find(
                o => o._id.year === year && o._id.month === monthNumber
            );

            result.push({
                month: `${date.toLocaleString("en-US", { month: "short" })} ${year}`,
                quantity: match ? match.quantity : 0
            });
        }

        return respond("Orders fetched successfully", false, result, 200);
    } catch (error) {
        console.error(error);
        return respond("Error occurred while fetching orders", true, {}, 500);
    }
}


export async function getOrdersByOrgGroupedByMonth(org:string): Promise<IResponse> {
    try {
        await connectDB();

        const now = new Date();

        // First day of month, 5 months ago (inclusive)
        const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        // Last moment of current month
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const orders = await Order.aggregate([
            {
                $match: {
                    price: { $ne: null }, org,
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    quantity: { $sum: "$price" }
                }
            }
        ]);

        /* ======================================================
           BUILD LAST 6 MONTHS + FILL MISSING WITH 0
        ====================================================== */

        const result: { month: string; quantity: number }[] = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = date.getFullYear();
            const monthNumber = date.getMonth() + 1;

            const match = orders.find(
                o => o._id.year === year && o._id.month === monthNumber
            );

            result.push({
                month: `${date.toLocaleString("en-US", { month: "short" })} ${year}`,
                quantity: match ? match.quantity : 0
            });
        }

        return respond("Orders fetched successfully", false, result, 200);
    } catch (error) {
        console.error(error);
        return respond("Error occurred while fetching orders", true, {}, 500);
    }
}



export async function getOrdersQuantityGroupedByMonth(): Promise<IResponse> {
    try {
        await connectDB();

        const orders = await Order.aggregate([
            {
                $match: {
                    quantity: { $ne: null }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    quantity: { $sum: "$quantity" }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            },
            {
                $project: {
                    _id: 0,
                    month: {
                        $dateToString: {
                            format: "%b",
                            date: {
                                $dateFromParts: {
                                    year: "$_id.year",
                                    month: "$_id.month",
                                    day: 1
                                }
                            }
                        }
                    },
                    quantity: 1
                }
            }
        ]);

        return respond('Orders quantity fetched successfully', false, orders, 200);
    } catch (error) {
        console.error(error);
        return respond('Error occurred while fetching orders quantity', true, {}, 500);
    }
}


export async function getOrdersByOrgQuantityGroupedByMonth(org:string): Promise<IResponse> {
    try {
        await connectDB();

        const orders = await Order.aggregate([
            {
                $match: {
                    quantity: { $ne: null }, org
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    quantity: { $sum: "$quantity" }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            },
            {
                $project: {
                    _id: 0,
                    month: {
                        $dateToString: {
                            format: "%b",
                            date: {
                                $dateFromParts: {
                                    year: "$_id.year",
                                    month: "$_id.month",
                                    day: 1
                                }
                            }
                        }
                    },
                    quantity: 1
                }
            }
        ]);

        return respond('Orders quantity fetched successfully', false, orders, 200);
    } catch (error) {
        console.error(error);
        return respond('Error occurred while fetching orders quantity', true, {}, 500);
    }
}


export const getOrderStats = async (): Promise<IResponse> => {
    try {
        await connectDB();

        const today = new Date();

        const [pending, fulfilled, delayed] = await Promise.all([
            // Pending orders
            Order.countDocuments({ status: 'Pending' }),

            // Fulfilled orders
            Order.countDocuments({ status: 'Fulfilled' }),

            // Delayed orders (deadline < today AND not fulfilled)
            Order.countDocuments({
                status: { $ne: 'Fulfilled' },
                deadline: { $exists: true, $ne: null },
                $expr: {
                    $lt: [
                        {
                            $dateFromString: {
                                dateString: "$deadline"
                            }
                        },
                        today
                    ]
                }
            })
        ]);

        const orderStats: IOrderStats = {
            pending,
            fulfilled,
            delayed
        };

        return respond(
            'Order stats fetched successfully',
            false,
            orderStats,
            200
        );
    } catch (error) {
        console.error(error);
        return respond(
            'Error occurred while fetching order stats',
            true,
            {},
            500
        );
    }
};


export const getOrderStatsByOrg = async (org:string): Promise<IResponse> => {
    try {
        await connectDB();

        const today = new Date();

        const [pending, fulfilled, delayed] = await Promise.all([
            // Pending orders
            Order.countDocuments({ status: 'Pending', org }),

            // Fulfilled orders
            Order.countDocuments({ status: 'Fulfilled', org }),

            // Delayed orders (deadline < today AND not fulfilled)
            Order.countDocuments({
                org,
                status: { $ne: 'Fulfilled' },
                deadline: { $exists: true, $ne: null },
                $expr: {
                    $lt: [
                        {
                            $dateFromString: {
                                dateString: "$deadline"
                            }
                        },
                        today
                    ]
                }
            })
        ]);

        const orderStats: IOrderStats = {
            pending,
            fulfilled,
            delayed
        };

        return respond(
            'Order stats fetched successfully',
            false,
            orderStats,
            200
        );
    } catch (error) {
        console.error(error);
        return respond(
            'Error occurred while fetching order stats',
            true,
            {},
            500
        );
    }
};




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