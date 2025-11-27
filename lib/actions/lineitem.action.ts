'use server'

import { IResponse } from "@/types/Types";
import LineItem, { ILineItem } from "../models/lineitem.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/org.model';
import '../models/user.model'
import '../models/product.model'
import '../models/batch.model'
import '../models/good.model'
import '../models/package.model'
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";

interface LineItemQuery {
  product: string;
  status: string;
  batch?: string;
}

export async function createLineItems (data:Partial<ILineItem>[]):Promise<IResponse>{
    try {
        await connectDB();
        const lineItems = await LineItem.insertMany(data);
        return respond('Line items created successfully', false, lineItems, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating line items', true, {}, 500);
    }
}

export async function updateLineItem (data: Partial<ILineItem>): Promise<IResponse> {
    try {
        await connectDB();
        const updatedLineItem = await LineItem.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Line item updated successfully', false, updatedLineItem, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating line item', true, {}, 500);
    }
}

export async function getLineItems (): Promise<IResponse> {
    try {
        await connectDB();
        const lineItems = await LineItem.find().
        populate('product').
        populate('good').
        populate('package').
        populate('createdBy').
        populate('org').lean() as unknown as ILineItem[];
        return respond('Line items found successfully', false, lineItems, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching line items', true, {}, 500);
    }
}


export async function getAvailableLineItemsByProduct(
  productId: string,
  batchId?: string,
  limit?: number
): Promise<IResponse> {
  try {
    await connectDB();

    const query: LineItemQuery = {
      product: productId,
      status: "Available",
    };

    if (batchId) {
      query.batch = batchId;
    }

    let mongooseQuery = LineItem.find(query)
      .populate("product")
      .populate("good")
      .populate('batch')
      .populate("package")
      .populate("createdBy")
      .populate("org");

    if (limit && limit > 0) {
      mongooseQuery = mongooseQuery.limit(limit);
    }

    const lineItems = await mongooseQuery.lean() as unknown as ILineItem[];

    return respond("Line items found successfully", false, lineItems, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occurred while fetching line items", true, {}, 500);
  }
}
export async function getLineItemsByProduct (productId: string): Promise<IResponse> {
    try {
        await connectDB();
        const lineItems = await LineItem.find({ product: productId }).
        populate('product').
        populate('good').
        populate('package').
        populate('createdBy').
        populate('org').lean() as unknown as ILineItem[];
        return respond('Line items found successfully', false, lineItems, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching line items', true, {}, 500);
    }
}


export async function getLineItemsByPackage (packageId: string): Promise<IResponse> {
    try {
        await connectDB();
        const lineItems = await LineItem.find({ package: packageId })
        .populate('product')
        .populate('good')
        .populate('package')
        .populate('createdBy')
        .populate('batch')
        .populate('org').lean() as unknown as ILineItem[];
        return respond('Line items found successfully', false, lineItems, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching line items', true, {}, 500);
    }
}


export async function getLineItemsByOrg (org: string): Promise<IResponse> {
    try {
        await connectDB();
        const lineItems = await LineItem.find({ org: org })
        .populate('product')
        .populate('good')
        .populate('package')
        .populate('createdBy')
        .populate('batch')
        .populate('org').lean() as unknown as ILineItem[];
        return respond('Line items found successfully', false, lineItems, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching line items', true, {}, 500);
    }
}


export async function getLineItem (id: string): Promise<IResponse> {
    try {
        await connectDB();
        const check = await verifyOrgAccess(LineItem, id, "LineItem", [
            { path: "product" },
            { path: "good" },
            { path: "batch" },
            { path: "package" },
            { path: "createdBy" },
            { path: "org" },
        ]);
        if ("allowed" in check === false) return check;
        const lineItem = check.doc;
        return respond("Line item retrieved successfully", false, lineItem, 200);
    } catch (error) {
        console.log(error);
        return respond("Error occured retrieving line item", true, {}, 500);
    }
}

export async function deleteLineItem (id: string): Promise<IResponse> {
    try {
        await connectDB();
        const lineItem = await LineItem.findById(id);
        if (!lineItem) {
            return respond("Line item not found", true, {}, 404);
        }
        const deletedLineItem = await LineItem.deleteOne({ _id: id });
        return respond("Line item deleted successfully", false, deletedLineItem, 200);
    } catch (error) {
        console.log(error);
        return respond("Error occured while deleting line item", true, {}, 500);
    }
}