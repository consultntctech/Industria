'use server'

import { IResponse } from "@/types/Types";
import Sales, { ISales } from "../models/sales.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import LineItem, { ILineItem } from "../models/lineitem.model";
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import Alert, { IAlert } from "../models/alert.model";
import mongoose, { Types } from "mongoose";
import Product from "../models/product.model";


interface ILineItemLean {
  _id: Types.ObjectId;
  product?: Types.ObjectId;
}

interface IProductLean {
  _id: Types.ObjectId;
  threshold: number;
}

interface IProductSalesAgg {
  _id: Types.ObjectId; // productId
  totalSold: number;
}

function normalizeLineItemId(
  value: string | Types.ObjectId | ILineItem
): Types.ObjectId {
  if (typeof value === "string") {
    return new Types.ObjectId(value);
  }

  if (value instanceof Types.ObjectId) {
    return value;
  }

  // populated ILineItem
  return new Types.ObjectId(value._id);
}



export async function createSales(
  data: Partial<ISales>
): Promise<IResponse> {
  try {
    await connectDB();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1️⃣ Create sales record
      const newSales = await Sales.create([data], { session });

      const itemIds: Types.ObjectId[] =
        (data.products ?? []).map(normalizeLineItemId);


      if (!itemIds.length) {
        await session.commitTransaction();
        session.endSession();
        return respond("Products sold successfully", false, newSales[0], 201);
      }

      // 2️⃣ Fetch line items (lean)
      const lineItems = await LineItem.find(
        { _id: { $in: itemIds } },
        { product: 1 }
      ).session(session).lean<ILineItemLean[]>();

      // 3️⃣ Update line items as sold
      await LineItem.updateMany(
        { _id: { $in: itemIds } },
        { soldTo: data.customer, status: "Sold" },
        { session }
      );

      // 4️⃣ Group sold counts per product
      const soldCountMap = new Map<string, number>();
      const productIds = new Set<string>();

      for (const item of lineItems) {
        if (!item.product) continue;

        const productId = item.product.toString();
        productIds.add(productId);
        soldCountMap.set(
          productId,
          (soldCountMap.get(productId) ?? 0) + 1
        );
      }

      if (!productIds.size) {
        await session.commitTransaction();
        session.endSession();
        return respond("Products sold successfully", false, newSales[0], 201);
      }

      // 5️⃣ Fetch product thresholds
      const products = await Product.find(
        { _id: { $in: [...productIds].map(id => new Types.ObjectId(id)) } },
        { threshold: 1 }
      ).session(session).lean<IProductLean[]>();

      const productThresholdMap = new Map<string, number>();
      for (const p of products) {
        productThresholdMap.set(p._id.toString(), p.threshold);
      }

      // 6️⃣ Aggregate remaining line items per product
      const remainingAgg = await LineItem.aggregate<IProductSalesAgg>([
        {
          $match: {
            product: {
              $in: [...productIds].map(id => new Types.ObjectId(id))
            },
            status: { $ne: "Sold" }
          }
        },
        {
          $group: {
            _id: "$product",
            totalSold: { $sum: 1 }
          }
        }
      ]).session(session);

      // 7️⃣ Build alerts
      const alerts: Partial<IAlert>[] = [];

      for (const row of remainingAgg) {
        const remaining = row.totalSold;
        const threshold =
          productThresholdMap.get(row._id.toString()) ?? 0;

        if (remaining <= threshold) {
          alerts.push({
            title: "Product Stock Critical",
            body: `Remaining items for this product have reached the threshold (${remaining}).`,
            type: "error",
            item: row._id,
            itemModel: "Product",
            createdBy: data.createdBy,
            org: data.org
          });
        } else if (remaining <= threshold + 5) {
          alerts.push({
            title: "Product Stock Warning",
            body: `Remaining items for this product are running low (${remaining}).`,
            type: "warning",
            item: row._id,
            itemModel: "Product",
            createdBy: data.createdBy,
            org: data.org
          });
        }
      }

      if (alerts.length) {
        await Alert.insertMany(alerts, { session });
      }

      // 8️⃣ Commit
      await session.commitTransaction();
      session.endSession();

      return respond("Products sold successfully", false, newSales[0], 201);

    } catch (err) {
      await session.abortTransaction();
      session.endSession();

      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Transaction aborted:", message);
      return respond(message, true, {}, 500);
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Outer error:", message);
    return respond("Error occured while creating sales", true, {}, 500);
  }
}


export async function getSales():Promise<IResponse>{
    try {
        await connectDB();
        const sales = await Sales.find().
        populate('customer').
        populate({path:'products', populate:[{path:'product'}, {path:'batch'}]}).
        populate('createdBy').
        populate('org').lean() as unknown as ISales[];
        return respond('Sales found successfully', false, sales, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching sales', true, {}, 500);
    }
}

export async function getSalesByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const sales = await Sales.find({ org: orgId }).
        populate('customer').
        populate({path:'products', populate:[{path:'product'}, {path:'batch'}]}).
        populate('createdBy').
        populate('org').lean() as unknown as ISales[];
        return respond('Sales found successfully', false, sales, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching sales', true, {}, 500);
    }
}

export async function getSalesByCustomer(customerId:string):Promise<IResponse>{
    try {
        await connectDB();
        const sales = await Sales.find({ customer: customerId }).
        populate('customer').
        populate({path:'products', populate:[{path:'product'}, {path:'batch'}]}).
        populate('createdBy').
        populate('org').lean() as unknown as ISales[];
        return respond('Sales found successfully', false, sales, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching sales', true, {}, 500);
    }
}

export async function getSalesByProduct(productId:string):Promise<IResponse>{
    try {
        await connectDB();
        const sales = await Sales.find({ products: productId }).
        populate('customer').
        populate({path:'products', populate:[{path:'product'}, {path:'batch'}]}).
        populate('createdBy').
        populate('org').lean() as unknown as ISales[];
        return respond('Sales found successfully', false, sales, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching sales', true, {}, 500);
    }
}


export async function getTodaySales(): Promise<IResponse> {
  try {
    await connectDB();

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const sales = await Sales.find({
      createdAt: { $gte: start, $lt: end }
    })
      .populate("customer")
      .populate({path:'products', populate:[{path:'product'}, {path:'batch'}]})
      .populate("createdBy")
      .populate("org")
      .lean<ISales[]>();

    return respond("Sales found successfully", false, sales, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occurred while fetching sales", true, {}, 500);
  }
}


export async function getTodaySalesByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        const sales = await Sales.find({ org: orgId, createdAt: { $gte: start, $lt: end } })
        .populate("customer")
        .populate({path:'products', populate:[{path:'product'}, {path:'batch'}]})
        .populate("createdBy")
        .populate("org")
        .lean<ISales[]>();
        return respond('Sales found successfully', false, sales, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching sales', true, {}, 500);
    }
}

export async function getSale(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const check = await verifyOrgAccess(Sales, id, "Sales", [
            { path: "customer" },
            { path: "products", populate:[{path:'product'}, {path:'batch'}] },
            { path: "createdBy" },
            { path: "org" },
        ]);
        if ("allowed" in check === false) return check;
        const sales = check.doc;
        return respond('Sales found successfully', false, sales, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching sales', true, {}, 500);
    }
}


export async function updateSales(data:Partial<ISales>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedSales = await Sales.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Sales updated successfully', false, updatedSales, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating sales', true, {}, 500);
    }
}


export async function getLastSixMonthsSales(): Promise<IResponse> {
    try {
        await connectDB();

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const sales = await Sales.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
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

        return respond(
            'Sales found successfully',
            false,
            sales,
            200
        );
    } catch (error) {
        console.error(error);
        return respond(
            'Error occurred while fetching sales',
            true,
            {},
            500
        );
    }
}


export async function getLastSixMonthsSalesByOrg(org:string): Promise<IResponse> {
    try {
        await connectDB();

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const sales = await Sales.aggregate([
            {
                $match: {
                    org,
                    createdAt: { $gte: sixMonthsAgo },
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

        return respond(
            'Sales found successfully',
            false,
            sales,
            200
        );
    } catch (error) {
        console.error(error);
        return respond(
            'Error occurred while fetching sales',
            true,
            {},
            500
        );
    }
}




export async function getSalesGroupedByMonth(): Promise<IResponse> {
    try {
        await connectDB();

        const sales = await Sales.aggregate([
            {
                $match: {
                    price: { $ne: null }
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

        return respond('Sales fetched successfully', false, sales, 200);
    } catch (error) {
        console.error(error);
        return respond('Error occurred while fetching sales', true, {}, 500);
    }
}


export async function getSalesGroupedByMonthByOrg(org:string): Promise<IResponse> {
    try {
        await connectDB();

        const sales = await Sales.aggregate([
            {
                $match: {
                    org,
                    price: { $ne: null }
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

        return respond('Sales fetched successfully', false, sales, 200);
    } catch (error) {
        console.error(error);
        return respond('Error occurred while fetching sales', true, {}, 500);
    }
}


export async function getSalesQuantityGroupedByMonth(): Promise<IResponse> {
    try {
        await connectDB();

        const sales = await Sales.aggregate([
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

        return respond('Sales quantity fetched successfully', false, sales, 200);
    } catch (error) {
        console.error(error);
        return respond('Error occurred while fetching sales quantity', true, {}, 500);
    }
}


export async function getSalesQuantityGroupedByMonthByOrg(org:string): Promise<IResponse> {
    try {
        await connectDB();

        const sales = await Sales.aggregate([
            {
                $match: {
                    org,
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

        return respond('Sales quantity fetched successfully', false, sales, 200);
    } catch (error) {
        console.error(error);
        return respond('Error occurred while fetching sales quantity', true, {}, 500);
    }
}



export async function deleteSales(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedSales = await Sales.deleteOne({ _id: id });
        return respond('Sales removed successfully', false, deletedSales, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while removing sales', true, {}, 500);
    }
}