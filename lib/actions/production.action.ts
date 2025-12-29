'use server'

import {  IResponse } from "@/types/Types";
import Production, { IProduction, ProdIngredient } from "../models/production.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import RMaterial, { IRMaterial } from "../models/rmaterial.mode";
import mongoose from "mongoose";
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import '../models/user.model'
import '../models/product.model'
import '../models/batch.model'
import Alert, { IAlert } from "../models/alert.model";


import { ClientSession, Types } from 'mongoose';
import Product from "../models/product.model";

interface IIngredientInput {
  materialId: Types.ObjectId;
  quantity: number;
}

interface IRawMaterialLean {
  _id: Types.ObjectId;
  materialName: string;
  qAccepted: number;
  product?: Types.ObjectId;
}

interface IProductLean {
  _id: Types.ObjectId;
  threshold: number;
}

interface IProductStockAgg {
  _id: Types.ObjectId;
  totalRemaining: number;
}

interface IProductionIngredientInput {
  materialId: string | Types.ObjectId | IRMaterial;
  quantity: number;
}


export async function createProduction(
  data: Partial<IProduction>
): Promise<IResponse> {
  try {
    await connectDB();

    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1️⃣ Create production
      const [newProduction] = await Production.create([data], { session });

      const ingredients: IIngredientInput[] = (data.ingredients ?? []) as IIngredientInput[];

      if (!ingredients.length) {
        await session.commitTransaction();
        session.endSession();
        return respond("Production created successfully", false, newProduction, 201);
      }

      // 2️⃣ Map material usage
      const materialUsageMap = new Map<string, number>();

      for (const ing of ingredients) {
        if (!ing.materialId || ing.quantity <= 0) continue;

        const key = ing.materialId.toString();
        materialUsageMap.set(key, (materialUsageMap.get(key) ?? 0) + ing.quantity);
      }

      const materialIds = [...materialUsageMap.keys()].map(
        id => new Types.ObjectId(id)
      );

      // 3️⃣ Fetch raw materials
      const rawMaterials = await RMaterial.find(
        { _id: { $in: materialIds } },
        { materialName: 1, qAccepted: 1, product: 1 }
      ).session(session).lean<IRawMaterialLean[]>();

      const rawMaterialMap = new Map<string, IRawMaterialLean>();
      const productIds = new Set<string>();

      for (const mat of rawMaterials) {
        rawMaterialMap.set(mat._id.toString(), mat);
        if (mat.product) productIds.add(mat.product.toString());
      }

      // 4️⃣ Validate stock & prepare bulk updates
      const bulkOps: {
        updateOne: {
          filter: { _id: Types.ObjectId };
          update: { $inc: { qAccepted: number } };
        };
      }[] = [];

      for (const [materialId, quantityUsed] of materialUsageMap.entries()) {
        const material = rawMaterialMap.get(materialId);

        if (!material) {
          throw new Error(`Raw material not found: ${materialId}`);
        }

        if (material.qAccepted < quantityUsed) {
          throw new Error(
            `Insufficient stock for ${material.materialName}. Available: ${material.qAccepted}, Required: ${quantityUsed}`
          );
        }

        bulkOps.push({
          updateOne: {
            filter: { _id: new Types.ObjectId(materialId) },
            update: { $inc: { qAccepted: -quantityUsed } }
          }
        });

        // Update local copy for alerts
        material.qAccepted -= quantityUsed;
      }

      if (bulkOps.length) {
        await RMaterial.bulkWrite(bulkOps, { session });
      }

      // 5️⃣ Fetch products (thresholds)
      const products = await Product.find(
        { _id: { $in: [...productIds].map(id => new Types.ObjectId(id)) } },
        { threshold: 1 }
      ).session(session).lean<IProductLean[]>();

      const productThresholdMap = new Map<string, number>();
      for (const p of products) {
        productThresholdMap.set(p._id.toString(), p.threshold);
      }

      // 6️⃣ Aggregate remaining qAccepted per product
      const productStockAgg = await RMaterial.aggregate<IProductStockAgg>([
        {
          $match: {
            product: {
              $in: [...productIds].map(id => new Types.ObjectId(id))
            }
          }
        },
        {
          $group: {
            _id: "$product",
            totalRemaining: { $sum: "$qAccepted" }
          }
        }
      ]).session(session);

      const productRemainingMap = new Map<string, number>();
      for (const row of productStockAgg) {
        productRemainingMap.set(row._id.toString(), row.totalRemaining);
      }

      // 7️⃣ Build alerts
      const alerts: Partial<IAlert>[] = [];

      // 🔔 Product-level alerts
      for (const [productId, remaining] of productRemainingMap.entries()) {
        const threshold = productThresholdMap.get(productId) ?? 0;

        if (remaining <= threshold) {
          alerts.push({
            title: "Product Stock Critical",
            body: `Total remaining raw materials have reached the threshold (${remaining}).`,
            type: "error",
            item: new Types.ObjectId(productId),
            itemModel: "Product",
            createdBy: data.createdBy,
            org: data.org
          });
        } else if (remaining <= threshold + 5) {
          alerts.push({
            title: "Product Stock Warning",
            body: `Total remaining raw materials are low (${remaining}).`,
            type: "warning",
            item: new Types.ObjectId(productId),
            itemModel: "Product",
            createdBy: data.createdBy,
            org: data.org
          });
        }
      }

      // 🔔 Raw-material-level alerts
      for (const material of rawMaterials) {
        const threshold =
          material.product
            ? productThresholdMap.get(material.product.toString()) ?? 0
            : 0;

        if (material.qAccepted <= threshold) {
          alerts.push({
            title: "Raw Material Stock Critical",
            body: `${material.materialName} has reached its threshold (${material.qAccepted}).`,
            type: "error",
            item: material._id,
            itemModel: "RMaterial",
            createdBy: data.createdBy,
            org: data.org
          });
        } else if (material.qAccepted <= threshold + 5) {
          alerts.push({
            title: "Raw Material Stock Warning",
            body: `${material.materialName} is running low (${material.qAccepted}).`,
            type: "warning",
            item: material._id,
            itemModel: "RMaterial",
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

      return respond("Production created successfully", false, newProduction, 201);

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
      // 1️⃣ Fetch existing production
      const existingProduction = await Production.findById(productionId)
        .session(session);

      if (!existingProduction) {
        await session.abortTransaction();
        session.endSession();
        return respond("Production not found", true, {}, 404);
      }

      // 2️⃣ Normalize ingredients
      const oldIngredients: ProdIngredient[] =
        existingProduction.ingredients.map((i: IProductionIngredientInput) => ({
          materialId:
            typeof i.materialId === "string"
              ? i.materialId
              : i.materialId instanceof Types.ObjectId
                ? i.materialId.toString()
                : i.materialId._id.toString(),
          quantity: i.quantity
      }));


      const newIngredients: ProdIngredient[] =
        (data.ingredients ?? []).map((i: IProductionIngredientInput) => ({
          materialId:
            typeof i.materialId === "string"
              ? i.materialId
              : i.materialId instanceof Types.ObjectId
                ? i.materialId.toString()
                : i.materialId._id.toString(),
          quantity: i.quantity
      }));


      // 3️⃣ Build lookup maps
      const oldMap = new Map<string, number>(
        oldIngredients.map(i => [i.materialId, i.quantity])
      );
      const newMap = new Map<string, number>(
        newIngredients.map(i => [i.materialId, i.quantity])
      );

      // 4️⃣ Compute net changes
      const allIds = new Set([...oldMap.keys(), ...newMap.keys()]);
      const netChanges = new Map<string, number>();

      for (const id of allIds) {
        const oldQty = oldMap.get(id) ?? 0;
        const newQty = newMap.get(id) ?? 0;
        const diff = newQty - oldQty;
        if (diff !== 0) netChanges.set(id, diff);
      }

      if (!netChanges.size) {
        await session.commitTransaction();
        session.endSession();
        return respond("No changes detected", false, existingProduction, 200);
      }

      const materialIds = [...netChanges.keys()].map(
        id => new Types.ObjectId(id)
      );

      // 5️⃣ Fetch raw materials
      const rawMaterials = await RMaterial.find(
        { _id: { $in: materialIds } },
        { materialName: 1, qAccepted: 1, product: 1 }
      ).session(session).lean<IRawMaterialLean[]>();

      const rawMaterialMap = new Map<string, IRawMaterialLean>();
      const productIds = new Set<string>();

      for (const mat of rawMaterials) {
        rawMaterialMap.set(mat._id.toString(), mat);
        if (mat.product) productIds.add(mat.product.toString());
      }

      // 6️⃣ Validate stock & prepare updates
      const bulkOps: {
        updateOne: {
          filter: { _id: Types.ObjectId };
          update: { $inc: { qAccepted: number } };
        };
      }[] = [];

      for (const [materialId, diff] of netChanges.entries()) {
        const material = rawMaterialMap.get(materialId);
        if (!material) {
          throw new Error(`Raw material not found: ${materialId}`);
        }

        if (diff > 0 && material.qAccepted < diff) {
          throw new Error(
            `Insufficient stock for ${material.materialName}. Available: ${material.qAccepted}, Required: ${diff}`
          );
        }

        bulkOps.push({
          updateOne: {
            filter: { _id: new Types.ObjectId(materialId) },
            update: { $inc: { qAccepted: -diff } }
          }
        });

        // update local copy
        material.qAccepted -= diff;
      }

      await RMaterial.bulkWrite(bulkOps, { session });

      // 7️⃣ Fetch product thresholds
      const products = await Product.find(
        { _id: { $in: [...productIds].map(id => new Types.ObjectId(id)) } },
        { threshold: 1 }
      ).session(session).lean<IProductLean[]>();

      const productThresholdMap = new Map<string, number>();
      for (const p of products) {
        productThresholdMap.set(p._id.toString(), p.threshold);
      }

      // 8️⃣ Aggregate remaining stock per product
      const productStockAgg = await RMaterial.aggregate<IProductStockAgg>([
        {
          $match: {
            product: {
              $in: [...productIds].map(id => new Types.ObjectId(id))
            }
          }
        },
        {
          $group: {
            _id: "$product",
            totalRemaining: { $sum: "$qAccepted" }
          }
        }
      ]).session(session);

      const alerts: Partial<IAlert>[] = [];

      // 🔔 Product-level alerts
      for (const row of productStockAgg) {
        const remaining = row.totalRemaining;
        const threshold = productThresholdMap.get(row._id.toString()) ?? 0;

        if (remaining <= threshold) {
          alerts.push({
            title: "Product Stock Critical",
            body: `Total remaining raw materials have reached the threshold (${remaining}).`,
            type: "error",
            item: row._id,
            itemModel: "Product",
            createdBy: data.createdBy,
            org: data.org
          });
        } else if (remaining <= threshold + 5) {
          alerts.push({
            title: "Product Stock Warning",
            body: `Total remaining raw materials are low (${remaining}).`,
            type: "warning",
            item: row._id,
            itemModel: "Product",
            createdBy: data.createdBy,
            org: data.org
          });
        }
      }

      // 🔔 Raw-material-level alerts
      for (const material of rawMaterials) {
        const threshold =
          material.product
            ? productThresholdMap.get(material.product.toString()) ?? 0
            : 0;

        if (material.qAccepted <= threshold) {
          alerts.push({
            title: "Raw Material Stock Critical",
            body: `${material.materialName} has reached its threshold (${material.qAccepted}).`,
            type: "error",
            item: material._id,
            itemModel: "RMaterial",
            createdBy: data.createdBy,
            org: data.org
          });
        } else if (material.qAccepted <= threshold + 5) {
          alerts.push({
            title: "Raw Material Stock Warning",
            body: `${material.materialName} is running low (${material.qAccepted}).`,
            type: "warning",
            item: material._id,
            itemModel: "RMaterial",
            createdBy: data.createdBy,
            org: data.org
          });
        }
      }

      if (alerts.length) {
        await Alert.insertMany(alerts, { session });
      }

      // 9️⃣ Update production
      const updatedProduction = await Production.findByIdAndUpdate(
        productionId,
        { ...data, ingredients: newIngredients },
        { new: true, session }
      );

      await session.commitTransaction();
      session.endSession();

      return respond("Production updated successfully", false, updatedProduction, 200);

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
