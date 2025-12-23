'use server'

import {  IResponse } from "@/types/Types";
import Production, { IProduction, ProdIngredient } from "../models/production.model";
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

export async function updateProductionIngredients(
  data: Partial<IProduction>
): Promise<IResponse> {
  try {
    await connectDB();

    const productionId = data._id;
    if (!productionId) {
      return respond("Missing production ID", true, {}, 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1️⃣ Fetch the current production
      const existingProduction = await Production.findById(productionId).session(session);
      if (!existingProduction) {
        await session.abortTransaction();
        session.endSession();
        return respond("Production not found", true, {}, 404);
      }

      // 2️⃣ Simplify: we only care about old and new ingredients as { materialId: string, quantity: number }
     const oldIngredients: ProdIngredient[] = existingProduction.ingredients.map((i:ProdIngredient) => ({
      materialId: i.materialId.toString(),
      quantity: i.quantity,
    }));


      const newIngredients:ProdIngredient[] = (data.ingredients || []).map((i) => ({
        materialId: i.materialId.toString(),
        quantity: i.quantity,
      }));

      // 3️⃣ Build quick-lookup maps
      const oldMap = new Map(oldIngredients.map((i:ProdIngredient) => [i.materialId, i.quantity]));
      const newMap = new Map(newIngredients.map((i) => [i.materialId, i.quantity]));

      // 4️⃣ Compute net changes (new - old)
      const allIds = new Set([...oldMap.keys(), ...newMap.keys()]);
      const netChanges = new Map<string, number>();

      for (const id of allIds) {
        const oldQty = oldMap.get(id) ?? 0;
        const newQty = newMap.get(id as string) ?? 0;
        const diff = newQty - oldQty;
        if (diff !== 0) netChanges.set(id, diff);
      }

      // 5️⃣ Validate sufficient stock before reductions
      for (const [materialId, diff] of netChanges.entries()) {
        if (diff > 0) {
          const material = await RMaterial.findById(materialId).session(session);
          if (!material) {
            throw new Error(`Raw material not found: ${materialId}`);
          }
          if (material.qAccepted < diff) {
            throw new Error(
              `Insufficient stock for ${material.materialName}. Available: ${material.qAccepted}, Required: ${diff}`
            );
          }
        }
      }

      // 6️⃣ Apply stock updates
      for (const [materialId, diff] of netChanges.entries()) {
        // Positive diff = more material used → decrease qAccepted
        // Negative diff = less material used or removed → increase qAccepted
        await RMaterial.findByIdAndUpdate(
          materialId,
          { $inc: { qAccepted: -diff } },
          { session }
        );
      }

      // 7️⃣ Update the production document
      const newData ={
        ...data,
        ingredients: newIngredients,
      }
      const updatedProduction = await Production.findByIdAndUpdate(
        productionId,
        newData,
        { new: true, session }
      );

      await session.commitTransaction();
      session.endSession();

      return respond("Production updated successfully", false, updatedProduction, 200);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error("Transaction aborted:", (err as Error).message);
      return respond((err as Error).message, true, {}, 500);
    }
  } catch (error) {
    console.error("Database connection or outer error:", (error as Error).message);
    return respond("Error occurred while updating production", true, {}, 500);
  }
}


export async function getProductions():Promise<IResponse>{
    try {
        await connectDB();
        const productions = await Production.find()
        .populate('productToProduce')
        .populate('batch')
        .populate('createdBy')
        .populate('org')
        return respond('Productions found successfully', false, productions, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching productions', true, {}, 500);
    }
}

export async function getProductionsByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const productions = await Production.find({ org: orgId })
        .populate('productToProduce')
        .populate('batch')
        .populate('createdBy')
        .populate('org')
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
        // {path: 'proditems'},
        {path: 'ingredients', populate: {path:'materialId', populate:[{path:'batch'}, {path:'product'}]}}
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

export async function getLastSixMonthsProductions(): Promise<IResponse> {
    try {
        await connectDB();

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const productions = await Production.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                    outputQuantity: { $ne: null }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    quantity: { $sum: "$outputQuantity" }
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
            'Productions found successfully',
            false,
            productions,
            200
        );
    } catch (error) {
        console.error(error);
        return respond(
            'Error occurred while fetching productions',
            true,
            {},
            500
        );
    }
}




export async function getProductionStats(): Promise<IResponse> {
  try {
    await connectDB();

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const result = await Production.aggregate([
      {
        $match: {
          status: "Approved",
          createdAt: { $gte: start, $lte: now },
        },
      },
      {
        $facet: {
          /* ================= TOTAL STATS ================= */
          totals: [
            {
              $group: {
                _id: null,
                totalInput: {
                  $sum: { $sum: "$ingredients.quantity" },
                },
                totalOutput: {
                  $sum: { $ifNull: ["$outputQuantity", 0] },
                },
                totalLoss: {
                  $sum: { $ifNull: ["$lossQuantity", 0] },
                },
              },
            },
          ],

          /* ================= MONTHLY TREND ================= */
          monthly: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                input: {
                  $sum: { $sum: "$ingredients.quantity" },
                },
                output: {
                  $sum: { $ifNull: ["$outputQuantity", 0] },
                },
                xOutput: {
                  $sum: { $ifNull: ["$xquantity", 0] },
                },
              },
            },
            {
              $project: {
                _id: 0,
                year: "$_id.year",
                month: "$_id.month",
                efficiencyPercent: {
                  $cond: [
                    { $eq: ["$input", 0] },
                    0,
                    {
                      $round: [
                        {
                          $multiply: [
                            { $divide: ["$output", "$input"] },
                            100,
                          ],
                        },
                        2,
                      ],
                    },
                  ],
                },
                xEfficiencyPercent: {
                  $cond: [
                    { $eq: ["$input", 0] },
                    0,
                    {
                      $round: [
                        {
                          $multiply: [
                            { $divide: ["$xOutput", "$input"] },
                            100,
                          ],
                        },
                        2,
                      ],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
    ]);

    /* ================= NORMALIZE MONTHS ================= */

    const totals = result[0]?.totals[0] ?? {
      totalInput: 0,
      totalOutput: 0,
      totalLoss: 0,
    };

    const monthlyMap = new Map<string, any>();

    for (const m of result[0]?.monthly ?? []) {
      monthlyMap.set(`${m.year}-${m.month}`, m);
    }

    const outputTrend = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

      outputTrend.push({
        month: date.toLocaleString("en-US", {
          month: "short",
          year: "numeric",
        }),
        efficiencyPercent: monthlyMap.get(key)?.efficiencyPercent ?? 0,
        xEfficiencyPercent: monthlyMap.get(key)?.xEfficiencyPercent ?? 0,
      });
    }

    /* ================= FINAL PAYLOAD ================= */

    const input = totals.totalInput ?? 0;
    const output = totals.totalOutput ?? 0;
    const loss = totals.totalLoss ?? 0;

    const payload = {
      input,
      output,
      lossPercent:
        input === 0 ? 0 : Number(((loss / input) * 100).toFixed(2)),
      efficiencyPercent:
        input === 0 ? 0 : Number(((output / input) * 100).toFixed(2)),
      outputTrend,
    };

    return respond(
      "Production statistics calculated successfully",
      false,
      payload,
      200
    );
  } catch (error) {
    console.error(error);
    return respond(
      "Error occurred while calculating production statistics",
      true,
      {},
      500
    );
  }
}





export async function deleteProduction(id: string): Promise<IResponse> {
  try {
    await connectDB();

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1️⃣ Fetch the production to be deleted
      const production = await Production.findById(id).session(session);
      if (!production) {
        await session.abortTransaction();
        session.endSession();
        return respond("Production not found", true, {}, 404);
      }

      // 2️⃣ Restore raw materials’ qAccepted
      for (const ing of production.ingredients) {
        const materialId = ing.materialId.toString();
        const quantityUsed = Number(ing.quantity) || 0;

        if (quantityUsed > 0) {
          const material = await RMaterial.findById(materialId).session(session);
          if (!material) {
            throw new Error(`Raw material not found: ${materialId}`);
          }

          // Restore the used quantity
          await RMaterial.findByIdAndUpdate(
            materialId,
            { $inc: { qAccepted: quantityUsed } },
            { session }
          );
        }
      }

      // 3️⃣ Delete the production
      const deletedProduction = await Production.deleteOne({ _id: id }, { session });

      // 4️⃣ Commit transaction
      await session.commitTransaction();
      session.endSession();

      return respond("Production deleted successfully", false, deletedProduction, 200);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error("Transaction aborted:", (err as Error).message);
      return respond((err as Error).message, true, {}, 500);
    }
  } catch (error) {
    console.error("Database connection or outer error:", (error as Error).message);
    return respond("Error occurred while deleting production", true, {}, 500);
  }
}
