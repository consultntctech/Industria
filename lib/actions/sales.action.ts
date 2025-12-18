'use server'

import { IResponse } from "@/types/Types";
import Sales, { ISales } from "../models/sales.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import LineItem from "../models/lineitem.model";
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";

export async function createSales(data:Partial<ISales>):Promise<IResponse>{
    try {
        await connectDB();
        const newSales = await Sales.create(data);
        const items = data.products as string[];
        await LineItem.updateMany({ _id: { $in: items } }, {soldTo: data.customer, status:'Sold' });
        return respond('Products sold successfully', false, newSales, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating sales', true, {}, 500);
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