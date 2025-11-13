'use server';

import Good, { IGood } from "../models/good.model";
import { IResponse } from "@/types/Types";
import { connectDB } from "../mongoose";
import { respond } from "../misc";
import '../models/org.model';
import '../models/product.model';
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import Production from "../models/production.model";


export async function createGood(data: Partial<IGood>): Promise<IResponse> {
  try {
    await connectDB();

    if (!data.name) {
      return respond("Name is required to create finished goods", true, {}, 400);
    }

    // 1️⃣ Build prefix based on name (first 3 letters)
    const baseName = data.name.trim();
    const prefix =
      baseName.substring(0, 3).charAt(0).toUpperCase() +
      baseName.substring(1, 3).toLowerCase();

    // 2️⃣ Find the last production item that matches this prefix
    const lastItem = (await Good.findOne({
      materialName: { $regex: `^${prefix}-\\d+$`, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .lean()) as unknown as IGood | null;

    // 3️⃣ Extract the last number used
    let lastNumber = 0;
    if (lastItem?.serialName) {
      const match = lastItem.serialName.match(/\d+$/);
      if (match) lastNumber = parseInt(match[0], 10) || 0;
    }

    // 4️⃣ Increment to create a new serialName
    const nextNumber = lastNumber + 1;
    const serialName = `${prefix}-${nextNumber}`;

    // 5️⃣ Create new production item
    const newGood = await Good.create({
      ...data,
      serialName,
    });

    return respond("Production item created successfully", false, newGood, 201);
  } catch (error) {
    console.error("Error creating production item:", error);
    return respond("Error occurred while creating production item", true, {}, 500);
  }
}


export async function getGoods():Promise<IResponse>{
    try {
        await connectDB();
        const goods = await Good.find().
        populate({
            path: 'production',
            populate: {
                path:'productToProduce'
            }
        }).
        populate('createdBy').
        populate('org').lean() as unknown as IGood[];
        return respond('Finished goods found successfully', false, goods, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching finished goods', true, {}, 500);
    }
}


export async function getGoodsByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const goods = await Good.find({ org: orgId }).
        populate({
            path: 'production',
            populate: {
                path:'productToProduce'
            }
        }).
        populate('createdBy').
        populate('org').lean() as unknown as IGood[];
        return respond('Finished goods found successfully', false, goods, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching finished goods', true, {}, 500);
    }
}


export async function updateGood(data:Partial<IGood>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedGood = await Good.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Finished good updated successfully', false, updatedGood, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating finished good', true, {}, 500);
    }
}

export async function getGood(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const check = await verifyOrgAccess(Good, id, "Good", [
            { path: "product" },
            { path: "createdBy" },
            { path: "org" },
        ]);
        if ("allowed" in check === false) return check;
        const good = check.doc;

        return respond("Finished good retrieved successfully", false, good, 200);
    } catch (error) {
        console.log(error);
        return respond("Error occured retrieving finished good", true, {}, 500);
    }
}

export async function deleteGood(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const good = await Good.findById(id);
        const [deletedGood] = await Promise.all([
            Good.deleteOne({ _id: id }),
            Production.findByIdAndUpdate(good?._production, {status:'In Progress'}, {new:true})
        ])
        return respond('Finished good deleted successfully', false, deletedGood, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting finished good', true, {}, 500);
    }
}