'use server'

import { IResponse } from "@/types/Types";
import ProdItem, { IProdItem } from "../models/proditem.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/org.model';
import '../models/supplier.model';
import '../models/othercurrency.model';
import ProdType from "../models/prodtype.model";
import { Types } from "mongoose";
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";

export async function createProdItem(data: Partial<IProdItem>): Promise<IResponse> {
  try {
    await connectDB();

    if (!data.name) {
      return respond("Name is required to create a production item", true, {}, 400);
    }

    // 1️⃣ Build prefix based on name (first 3 letters)
    const baseName = data.name.trim();
    const prefix =
      baseName.substring(0, 3).charAt(0).toUpperCase() +
      baseName.substring(1, 3).toLowerCase();

    // 2️⃣ Find the last production item that matches this prefix
    const lastItem = (await ProdItem.findOne({
      materialName: { $regex: `^${prefix}-\\d+$`, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .lean()) as unknown as IProdItem | null;

    // 3️⃣ Extract the last number used
    let lastNumber = 0;
    if (lastItem?.materialName) {
      const match = lastItem.materialName.match(/\d+$/);
      if (match) lastNumber = parseInt(match[0], 10) || 0;
    }

    // 4️⃣ Increment to create a new materialName
    const nextNumber = lastNumber + 1;
    const materialName = `${prefix}-${nextNumber}`;

    // 5️⃣ Create new production item
    const newProdItem = await ProdItem.create({
      ...data,
      materialName,
    });

    return respond("Production item created successfully", false, newProdItem, 201);
  } catch (error) {
    console.error("Error creating production item:", error);
    return respond("Error occurred while creating production item", true, {}, 500);
  }
}



export async function getProdItems():Promise<IResponse>{
    try {
        await connectDB();
        const prodItems = await ProdItem.find().
        populate('createdBy').
        populate('storages').
        populate('suppliers').
        populate('original.currency').
        populate('org').lean() as unknown as IProdItem[];
        return respond('Production items found successfully', false, prodItems, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching production items', true, {}, 500);
    }
}

export async function getProdItemsByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const prodItems = await ProdItem.find({ org: orgId }).
        populate('createdBy').
        populate('storages').
        populate('suppliers').
        populate('original.currency').
        populate('type').
        populate('org').lean() as unknown as IProdItem[];
        return respond('Production items found successfully', false, prodItems, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching production items', true, {}, 500);
    }
}

export async function getAvailableProdItems():Promise<IResponse>{
    try {
        await connectDB();
        const prodItems = await ProdItem.find({ $or: [{stock: { $gt: 0 }}, {reusable: true}] }).
        populate('createdBy').
        populate('storages').
        populate('suppliers').
        populate('type').
        populate('original.currency').
        populate('org').lean() as unknown as IProdItem[];
        return respond('Available production items found successfully', false, prodItems, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching available production items', true, {}, 500);
    }
}


export async function getAvailableProdItemsByOrg(orgId: string): Promise<IResponse> {
    try {
        await connectDB();

        // Step 1: find the reusable types for this organization
        const reusableTypes = await ProdType.find({ org: orgId, reusable: true })
            .select('_id')
            .lean() as unknown as { _id: Types.ObjectId }[];

        const reusableTypeIds = reusableTypes.map((t) => t._id);

        // Step 2: items with stock left, or items belonging to a reusable type
        const prodItems = await ProdItem.find({
            org: orgId,
            $or: [
                { stock: { $gt: 0 } },
                { type: { $in: reusableTypeIds } },
            ],
        })
            .populate({ path: 'type', populate: { path: 'suppliers' } })
            .populate('createdBy')
            .populate('storages')
            .populate('suppliers')
            .populate('type')
            .populate('original.currency')
            .populate('org')
            .lean() as unknown as IProdItem[];

        return respond('Available production items found successfully', false, prodItems, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching available production items', true, {}, 500);
    }
}


export async function updateProdItem(data: Partial<IProdItem>): Promise<IResponse> {
  try {
    await connectDB();

    if (!data._id || !Types.ObjectId.isValid(data._id)) {
      return respond('Invalid item id', true, {}, 400);
    }

    const existing = await ProdItem.findById(data._id)
      .select('quantity used stock')
      .lean() as unknown as Pick<IProdItem, 'quantity' | 'used' | 'stock'> | null;

    if (!existing) {
      return respond('Item not found', true, {}, 404);
    }

    // Fields the client must never set directly
    const {
      _id,
      stock: _stock,
      used: _used,
      org: _org,
      createdBy: _createdBy,
      ...fields
    } = data;

    let delta = 0;
    if (fields.quantity !== undefined) {
      const newQuantity = Number(fields.quantity);
      if (!Number.isFinite(newQuantity) || newQuantity < 1) {
        return respond('Quantity must be at least 1', true, {}, 400);
      }
      if (newQuantity < existing.used) {
        return respond(`Quantity cannot be lower than the ${existing.used} already used`, true, {}, 400);
      }
      fields.quantity = newQuantity;
      delta = newQuantity - existing.quantity;
    }

    // The filter pins the quantity we read and makes sure stock cannot go negative,
    // so a package created at the same moment cannot slip through
    const updated = await ProdItem.findOneAndUpdate(
      { _id, quantity: existing.quantity, stock: { $gte: -delta } },
      { $set: fields, $inc: { stock: delta } },
      { new: true }
    );

    if (!updated) {
      return respond('This item changed while you were editing it. Please refresh and try again', true, {}, 409);
    }

    return respond('Item updated successfully', false, updated, 200);
  } catch (error) {
    console.log(error);
    return respond('Error occured while updating item', true, {}, 500);
  }
}

export async function getProdItem(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const check = await verifyOrgAccess(ProdItem, id, "ProdItem", [
            { path: "type" },
            { path: "createdBy" },
            { path: "suppliers" },
            { path: "storages" },
            { path: "org" },
            { path: "type" },
        ]);

        if ("allowed" in check === false) return check;

        const prodItem = check.doc;
        return respond("Production item retrieved successfully", false, prodItem, 200);
    } catch (error) {
        console.log(error);
        return respond("Error occured retrieving production item", true, {}, 500);
    }
}

export async function deleteProdItem(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedProdItem = await ProdItem.deleteOne({ _id: id });
        return respond('Production item deleted successfully', false, deletedProdItem, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting production item', true, {}, 500);
    }
}