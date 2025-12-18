'use server';

import { IResponse, ITransactCount, ITransactMontly } from "@/types/Types";
import { respond } from "../misc";
import Returns from "../models/returns.model";
import Sales from "../models/sales.model";
import Order from "../models/order.model";
import { connectDB } from "../mongoose";


export async function getMonthlyTransactionSummary(
    month?: number, // 1–12
    year?: number,
    type: "quantity" | "price" = "quantity"
): Promise<IResponse> {
    try {
        await connectDB();

        const now = new Date();
        const selectedMonth = month ?? now.getMonth() + 1;
        const selectedYear = year ?? now.getFullYear();

        const startDate = new Date(selectedYear, selectedMonth - 1, 1);
        const endDate = new Date(selectedYear, selectedMonth, 1);
        const today = new Date();

        const valueField = `$${type}`;

        /* -------------------- ORDERS -------------------- */
        const orderResult = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    pending: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "Pending"] },
                                valueField,
                                0
                            ]
                        }
                    },
                    fulfilled: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "Fulfilled"] },
                                valueField,
                                0
                            ]
                        }
                    },
                    delayed: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $ne: ["$status", "Fulfilled"] },
                                        { $lt: ["$deadline", today] }
                                    ]
                                },
                                valueField,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        /* -------------------- SALES -------------------- */
        const salesResult = await Sales.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: valueField }
                }
            }
        ]);

        /* -------------------- RETURNS -------------------- */
        const returnResult = await Returns.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: valueField }
                }
            }
        ]);

        const response: ITransactMontly = {
            sales: salesResult[0]?.total ?? 0,
            order: {
                pending: orderResult[0]?.pending ?? 0,
                fulfilled: orderResult[0]?.fulfilled ?? 0,
                delayed: orderResult[0]?.delayed ?? 0
            },
            return: returnResult[0]?.total ?? 0
        };

        return respond(
            "Monthly transaction summary fetched successfully",
            false,
            response,
            200
        );
    } catch (error) {
        console.error(error);
        return respond(
            "Error occurred while fetching monthly transaction summary",
            true,
            {},
            500
        );
    }
}


export async function getMonthlyTransactionCounts(): Promise<IResponse> {
    try {
        await connectDB();

        const today = new Date();

        /* ---------- SHARED MONTH PROJECTION ---------- */
        const monthProject = {
            _id: 0,
            month: {
                $dateToString: {
                    format: "%b %Y",
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
        };

        /* ---------- SALES ---------- */
        const sales = await Sales.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    quantity: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $project: monthProject }
        ]);

        /* ---------- RETURNS ---------- */
        const returns = await Returns.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    quantity: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $project: monthProject }
        ]);

        /* ---------- ORDERS: PENDING ---------- */
        const pendingOrders = await Order.aggregate([
            { $match: { status: "Pending" } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    quantity: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $project: monthProject }
        ]);

        /* ---------- ORDERS: FULFILLED ---------- */
        const fulfilledOrders = await Order.aggregate([
            { $match: { status: "Fulfilled" } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    quantity: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $project: monthProject }
        ]);

        /* ---------- ORDERS: DELAYED ---------- */
        const delayedOrders = await Order.aggregate([
            {
                $match: {
                    status: { $ne: "Fulfilled" },
                    deadline: { $exists: true, $ne: null },
                    $expr: {
                        $lt: [
                            { $dateFromString: { dateString: "$deadline" } },
                            today
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    quantity: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $project: monthProject }
        ]);

        /* ---------- FINAL PAYLOAD ---------- */
        const payload: ITransactCount = {
            sales,
            return: returns,
            order: {
                pending: pendingOrders,
                fulfilled: fulfilledOrders,
                delayed: delayedOrders
            }
        };

        return respond(
            "Monthly transaction counts fetched successfully",
            false,
            payload,
            200
        );
    } catch (error) {
        console.error(error);
        return respond(
            "Error occurred while fetching monthly transaction counts",
            true,
            {},
            500
        );
    }
}
