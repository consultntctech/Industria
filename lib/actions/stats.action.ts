'use server';

import { IDashboardStats, IGlobalFinance, IMonthlyStats, IOrderAndSalesStats, IResponse, IStats, ITransactCount, ITransactMontly } from "@/types/Types";
import { respond } from "../misc";
import Returns, { IReturns } from "../models/returns.model";
import Sales, { ISales } from "../models/sales.model";
import Order, { IOrder } from "../models/order.model";
import { connectDB } from "../mongoose";
import { Model } from "mongoose";
import Production, { IProduction } from "../models/production.model";
import Package, { IPackage } from "../models/package.model";
import RMaterial from "../models/rmaterial.mode";
import LineItem from "../models/lineitem.model";
import { getLast7Days, getLast7Months, getLast7Weeks } from "@/functions/dates";

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



export async function getDashboardStats(): Promise<IResponse> {
    try {
        await connectDB();

        /* ================= RAW MATERIALS ================= */
        const rawMaterialAgg = await RMaterial.aggregate<{
            totalAccepted: number;
            totalValue: number;
        }>([
            { $match: { qAccepted: { $gt: 0 } } },
            {
                $group: {
                    _id: null,
                    totalAccepted: { $sum: '$qAccepted' },
                    totalValue: { $sum: '$price' },
                },
            },
        ]);

        const rawMaterials = rawMaterialAgg[0]?.totalAccepted ?? 0;
        const rawMaterialsValue = rawMaterialAgg[0]?.totalValue ?? 0;

        /* ================= APPROVED PRODUCTIONS ================= */
        const approvedProductions = await Production.find(
            { status: 'Approved' },
            { ingredients: 1, rejQuantity: 1 }
        ).lean<{
            ingredients?: { quantity: number }[];
            rejQuantity?: number;
        }[]>();

        let totalInputQty = 0;
        let totalRejectedQty = 0;

        approvedProductions.forEach(p => {
            const inputQty =
                p.ingredients?.reduce<number>(
                    (acc, cur) => acc + cur.quantity,
                    0
                ) ?? 0;

            totalInputQty += inputQty;
            totalRejectedQty += p.rejQuantity ?? 0;
        });

        const rejectedPercent =
            totalInputQty > 0
                ? Number(((totalRejectedQty / totalInputQty) * 100).toFixed(1))
                : 0;

        /* ================= LINE ITEMS OUTPUT ================= */
        const productionOutput = await LineItem.countDocuments({
            status: { $in: ['Available', 'Returned'] },
        });

        /* ================= ORDERS ================= */
        const [
            ordersInProgress,
            ordersFulfilled,
            ordersDelayed,
            totalOrders,
            fulfilledThisMonth,
        ] = await Promise.all([
            Order.countDocuments({ status: 'Pending' }),
            Order.countDocuments({ status: 'Fulfilled' }),
            Order.countDocuments({
                status: { $ne: 'Fulfilled' },
                deadline: { $lt: new Date().toISOString() },
            }),
            Order.countDocuments({}),
            Order.countDocuments({
                status: 'Fulfilled',
                fulfilledAt: {
                    $gte: new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        1
                    ).toISOString(),
                },
            }),
        ]);

        const orderFulfillmentStatus =
            totalOrders > 0
                ? Number(((fulfilledThisMonth / totalOrders) * 100).toFixed(1))
                : 0;

        /* ================= SALES & RETURNS ================= */
        const salesAgg = await Sales.aggregate<{ _id: null; total: number }>([
            { $group: { _id: null, total: { $sum: '$price' } } },
        ]);

        const returnsAgg = await Returns.aggregate<{ _id: null; total: number }>([
            { $group: { _id: null, total: { $sum: '$price' } } },
        ]);

        const sales = salesAgg[0]?.total ?? 0;
        const returns = returnsAgg[0]?.total ?? 0;

        /* ================= INVENTORY (LAST 7 MONTHS) ================= */
        const months = getLast7Months();

        const rawInv = await RMaterial.aggregate<{ _id: string; value: number }>([
            {
                $project: {
                    key: {
                        $concat: [
                            { $toString: { $year: '$dateReceived' } },
                            '-',
                            { $toString: { $month: '$dateReceived' } },
                        ],
                    },
                    qReceived: 1,
                },
            },
            { $group: { _id: '$key', value: { $sum: '$qReceived' } } },
        ]);

        const finishedInv = await LineItem.aggregate<{ _id: string; value: number }>([
            { $match: { status: { $ne: 'Pending' } } },
            {
                $project: {
                    key: {
                        $concat: [
                            { $toString: { $year: '$createdAt' } },
                            '-',
                            { $toString: { $month: '$createdAt' } },
                        ],
                    },
                },
            },
            { $group: { _id: '$key', value: { $sum: 1 } } },
        ]);

        const inventory = months.map(m => ({
            month: m.label,
            rawMaterial: rawInv.find(r => r._id === m.key)?.value ?? 0,
            finishedGood: finishedInv.find(f => f._id === m.key)?.value ?? 0,
        }));

        /* ================= REJECTION (LAST 7 WEEKS) ================= */
        const weeks = getLast7Weeks();

        const rawRej = await RMaterial.aggregate<{
            _id: string;
            value: number;
        }>([
            {
                $project: {
                    week: {
                        $concat: [
                            { $toString: { $isoWeekYear: '$dateReceived' } },
                            'W',
                            { $toString: { $isoWeek: '$dateReceived' } },
                        ],
                    },
                    qRejected: 1,
                },
            },
            {
                $group: {
                    _id: '$week',
                    value: { $sum: '$qRejected' },
                },
            },
        ]);


        const prodRej = await Production.aggregate<{
            _id: string;
            value: number;
        }>([
            { $match: { status: 'Approved' } },
            {
                $project: {
                    week: {
                        $concat: [
                            { $toString: { $isoWeekYear: '$createdAt' } },
                            'W',
                            { $toString: { $isoWeek: '$createdAt' } },
                        ],
                    },
                    rejQuantity: 1,
                },
            },
            {
                $group: {
                    _id: '$week',
                    value: { $sum: '$rejQuantity' },
                },
            },
        ]);


        const rejection = weeks.map(w => ({
            week: w,
            rawMaterial: rawRej.find(r => r._id === w)?.value ?? 0,
            production: prodRej.find(p => p._id === w)?.value ?? 0,
        }));


        /* ================= PRODUCTION (LAST 7 DAYS) ================= */
        // const days = getLast7Days();
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);


        const prodDays = await Production.aggregate<{
            _id: string;
            value: number;
        }>([
            {
                $match: {
                    status: 'Approved',
                    updatedAt: {
                        $gte: sevenDaysAgo,
                        $lte: today,
                    },
                },
            },
            {
                $project: {
                    day: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$updatedAt',
                        },
                    },
                    outputQuantity: 1,
                },
            },
            {
                $group: {
                    _id: '$day',
                    value: { $sum: '$outputQuantity' },
                },
            },
        ]);

        const days = getLast7Days(); // ['Sun', 'Mon', ...]
        const dayKeys: string[] = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dayKeys.push(d.toISOString().slice(0, 10)); // YYYY-MM-DD
        }


        const production = dayKeys.map((key, idx) => ({
            day: days[idx],
            quantity: prodDays.find(p => p._id === key)?.value ?? 0,
        }));


        /* ================= FINAL PAYLOAD ================= */
        const payload: IDashboardStats = {
            rawMaterials,
            productionOutput,
            rejectedPercent,
            ordersInProgress,
            sales,
            returns,
            ordersFulfilled,
            ordersDelayed,
            rawMaterialsValue,
            inventory,
            rejection,
            production,
            orderFulfillmentStatus,
        };

        return respond('Dashboard stats fetched successfully', false, payload, 200);
    } catch (error) {
        console.error(error);
        return respond('Error fetching dashboard stats', true, {}, 500);
    }
}


