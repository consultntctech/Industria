'use server'

import { IResponse } from "@/types/Types";
import Production, { IProduction } from "../models/production.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import RMaterial from "../models/rmaterial.mode";
import mongoose from "mongoose";
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import '../models/user.model'
import '../models/product.model'
import '../models/batch.model'

export async function createProduction(data: Partial<IProduction>): Promise<IResponse> {
  try {
    await connectDB();

    // Start a MongoDB session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1️⃣ Create the production record
      const [newProduction] = await Production.create([data], { session });

      // 2️⃣ Deduct ingredient quantities from raw materials
      for (const ingredient of data.ingredients || []) {
        const materialId = ingredient.materialId;
        const quantityUsed = Number(ingredient.quantity) || 0;

        if (!materialId || quantityUsed <= 0) continue;

        const material = await RMaterial.findById(materialId).session(session);

        if (!material) {
          throw new Error(`Raw material not found: ${materialId}`);
        }

        // Ensure we don’t go below zero
        if (material.qAccepted < quantityUsed) {
          throw new Error(
            `Insufficient stock for ${material.materialName}. Available: ${material.qAccepted}, Required: ${quantityUsed}`
          );
        }

        // Update qAccepted (reduce by quantity used)
        await RMaterial.findByIdAndUpdate(
          materialId,
          { $inc: { qAccepted: -quantityUsed } },
          { session }
        );
      }

      // 3️⃣ Commit the transaction if all updates succeed
      await session.commitTransaction();
      session.endSession();

      return respond("Production created successfully", false, newProduction, 201);

    } catch (err: any) {
      // Roll back all changes if an error occurs
      await session.abortTransaction();
      session.endSession();
      console.error("Transaction aborted:", err.message);
      return respond(err.message || "Error occurred while creating production", true, {}, 500);
    }

  } catch (error: any) {
    console.error("Database connection or outer error:", error.message);
    return respond("Error occurred while creating production", true, {}, 500);
  }
}

export async function getProductions():Promise<IResponse>{
    try {
        await connectDB();
        const productions = await Production.find();
        return respond('Productions found successfully', false, productions, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching productions', true, {}, 500);
    }
}

export async function getProductionsByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const productions = await Production.find({ org: orgId });
        return respond('Productions found successfully', false, productions, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching productions', true, {}, 500);
    }
}


export async function updateProduction(data:Partial<IProduction>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedProduction = await Production.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Production updated successfully', false, updatedProduction, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating production', true, {}, 500);
    }
}

export async function getProduction(id: string): Promise<IResponse> {
  try {
    await connectDB();

    const check = await verifyOrgAccess(
      Production, id, "Production",
      [
        { path: "productToProduce" },
        { path: "supervisor" },
        { path: "createdBy" },
        { path: "batch" },
        // { path: "ingredients.materialId", select: "materialName qAccepted" }
      ]
    );

    // If not allowed, return the middleware's response directly
    if ("allowed" in check === false) return check;
    // Authorized → you can use check.doc safely, fully typed as Production
    const production = check.doc;

    return respond("Production retrieved successfully", false, production, 200);
  } catch (error) {
    console.error(error);
    return respond("Error occurred retrieving production", true, {}, 500);
  }
}

export async function deleteProduction(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedProduction = await Production.deleteOne({ _id: id });
        return respond('Production deleted successfully', false, deletedProduction, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting production', true, {}, 500);
    }
}