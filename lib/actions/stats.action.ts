'use server';

import { IGlobalFinance, IMonthlyStats, IOrderAndSalesStats, IResponse, IStats, ITransactCount, ITransactMontly } from "@/types/Types";
import { respond } from "../misc";
import Returns, { IReturns } from "../models/returns.model";
import Sales, { ISales } from "../models/sales.model";
import Order, { IOrder } from "../models/order.model";
import { connectDB } from "../mongoose";
import { Model } from "mongoose";
import Production, { IProduction } from "../models/production.model";
import Package, { IPackage } from "../models/package.model";

type CollectionKey = keyof IStats;

interface CollectionConfig<T> {
  model: Model<T>;
  amountFields: (keyof T)[];
}

const collectionsMap: {
  sales: CollectionConfig<ISales>;
  orders: CollectionConfig<IOrder>;
  returns: CollectionConfig<IReturns>;
  production: CollectionConfig<IProduction>;
  packaging: CollectionConfig<IPackage>;
} = {
  sales: { model: Sales, amountFields: ['price'] },
  orders: { model: Order, amountFields: ['price'] },
  returns: { model: Returns, amountFields: ['price'] },
  production: { model: Production, amountFields: ['productionCost', 'extraCost'] },
  packaging: { model: Package, amountFields: ['cost'] },
};


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

        // Build month boundaries in LOCAL time
        const startDate = new Date(selectedYear, selectedMonth - 1, 1, 0, 0, 0, 0);
        const endDate = new Date(selectedYear, selectedMonth, 1, 0, 0, 0, 0);

        // Convert to UTC for MongoDB query
        const startUTC = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000);
        const endUTC = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000);

        const valueField = `$${type}`;

        /* -------------------- ORDERS -------------------- */
        const orderResult = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startUTC, $lt: endUTC }
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
                                        { $lt: ["$deadline", new Date()] }
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
                    createdAt: { $gte: startUTC, $lt: endUTC }
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
                    createdAt: { $gte: startUTC, $lt: endUTC }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: valueField } // sums $price if type = "price"
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
        const now = new Date();

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

        /* ======================================================
           FILL MISSING MONTHS (LAST 6 MONTHS)
        ====================================================== */

        const fillMonths = (data: { month: string; quantity: number }[]) => {
            const result: { month: string; quantity: number }[] = [];

            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const label = `${date.toLocaleString("en-US", { month: "short" })} ${date.getFullYear()}`;

                const found = data.find(d => d.month === label);

                result.push({
                    month: label,
                    quantity: found ? found.quantity : 0
                });
            }

            return result;
        };

        /* ---------- FINAL PAYLOAD ---------- */
        const payload: ITransactCount = {
            sales: fillMonths(sales),
            return: fillMonths(returns),
            order: {
                pending: fillMonths(pendingOrders),
                fulfilled: fillMonths(fulfilledOrders),
                delayed: fillMonths(delayedOrders)
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



export async function getOrderAndSalesStats(): Promise<IResponse> {
    try {
        await connectDB();

        const now = new Date();

        // First day of month, 5 months ago
        const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        // End of current month
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const [ordersAgg, salesAgg] = await Promise.all([
            Order.aggregate([
                {
                    $match: {
                        price: { $ne: null },
                        createdAt: { $gte: startDate, $lte: endDate }
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
            ]),
            Sales.aggregate([
                {
                    $match: {
                        price: { $ne: null },
                        createdAt: { $gte: startDate, $lte: endDate }
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
            ])
        ]);

        /* ======================================================
           BUILD LAST 6 MONTHS + FILL MISSING WITH 0
        ====================================================== */

        const result: IOrderAndSalesStats[] = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = date.getFullYear();
            const monthNumber = date.getMonth() + 1;

            const orderMatch = ordersAgg.find(
                o => o._id.year === year && o._id.month === monthNumber
            );

            const salesMatch = salesAgg.find(
                s => s._id.year === year && s._id.month === monthNumber
            );

            result.push({
                month: `${date.toLocaleString("en-US", { month: "short" })} ${year}`,
                orders: orderMatch ? orderMatch.quantity : 0,
                sales: salesMatch ? salesMatch.quantity : 0
            });
        }

        return respond(
            "Order and sales stats fetched successfully",
            false,
            result,
            200
        );
    } catch (error) {
        console.error(error);
        return respond(
            "Error occurred while fetching order and sales stats",
            true,
            {},
            500
        );
    }
}








export async function getStats(): Promise<IResponse> {
  try {
    await connectDB();

    const result: IStats = {};

    for (const key of Object.keys(collectionsMap) as CollectionKey[]) {
      const { model, amountFields } = collectionsMap[key];

      const agg = await model.aggregate([
        {
          $group: {
            _id: null,
            quantity: { $sum: 1 },
            amount: {
              $sum:
                amountFields.length === 1
                  ? `$${amountFields[0]}`
                  : { $add: amountFields.map(f => `$${f}`) },
            },
          },
        },
      ]);

      result[key] = agg.length > 0 ? { quantity: agg[0].quantity, amount: agg[0].amount } : { quantity: 0, amount: 0 };
    }

    return respond('Stats fetched successfully', false, result, 200);
  } catch (error) {
    console.log(error);
    return respond('Error fetching stats', true, {}, 500);
  }
}




export async function getGlobalFinanceStats(): Promise<IResponse> {
    try {
        await connectDB();

        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        /* ======================================================
           AGGREGATION FUNCTION HELPER
        ====================================================== */
        const aggregateMonthly = async (
            model: any,
            field: string
        ): Promise<IMonthlyStats[]> => {
            const data = await model.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startDate, $lte: endDate },
                        [field]: { $ne: null }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        quantity: { $sum: `$${field}` }
                    }
                }
            ]);

            const result: IMonthlyStats[] = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const year = date.getFullYear();
                const monthNumber = date.getMonth() + 1;

                const match = data.find(
                    (d: any) => d._id.year === year && d._id.month === monthNumber
                );

                result.push({
                    month: `${date.toLocaleString("en-US", { month: "short" })} ${year}`,
                    quantity: match ? match.quantity : 0
                });
            }

            return result;
        };

        /* ======================================================
           FETCH ALL COLLECTIONS
        ====================================================== */
        const [sales, orders, returns, production, packaging] = await Promise.all([
            aggregateMonthly(Sales, "price"),
            aggregateMonthly(Order, "price"),
            aggregateMonthly(Returns, "price"),
            aggregateMonthly(Production, "outputQuantity"),
            aggregateMonthly(Package, "quantity")
        ]);

        const globalFinance: IGlobalFinance = {
            sales,
            orders,
            returns,
            production,
            packaging
        };

        return respond("Global finance stats fetched successfully", false, globalFinance, 200);
    } catch (error) {
        console.error(error);
        return respond("Error occurred while fetching global finance stats", true, {}, 500);
    }
}