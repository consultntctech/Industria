'use server'

import { IResponse } from "@/types/Types";
import ProdItem, { IProdItem } from "../models/proditem.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/org.model';
import '../models/supplier.model';

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
        populate('suppliers').
        populate('createdBy').
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
        populate('suppliers').
        populate('createdBy').
        populate('org').lean() as unknown as IProdItem[];
        return respond('Production items found successfully', false, prodItems, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching production items', true, {}, 500);
    }
}


export async function updateProdItem(data:Partial<IProdItem>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedProdItem = await ProdItem.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Production item updated successfully', false, updatedProdItem, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating production item', true, {}, 500);
    }
}

export async function getProdItem(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const prodItem = await ProdItem.findById(id);
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