'use server'

import {  IResponse } from "@/types/Types";
import Production, { IGoodInProduction, IProduction, ProdIngredient } from "../models/production.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import RMaterial, { IRMaterial } from "../models/rmaterial.mode";
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import '../models/user.model'
import '../models/product.model'
import '../models/batch.model'
import '../models/othercurrency.model'
import '../models/labourer.model'
import '../models/employee.model'
import Alert, { IAlert } from "../models/alert.model";

import mongoose, { ClientSession, Types } from 'mongoose';

import Product from "../models/product.model";
import Good, { IGood } from "../models/good.model";

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
  weight?: number;
}


interface IGoodLean {
  _id: Types.ObjectId;
  name: string;
  raw: number;
  threshold: number;
}

const toIdString = (id: string | Types.ObjectId | IGood): string =>
  typeof id === "string"
    ? id
    : id instanceof Types.ObjectId
      ? id.toString()
      : id._id.toString();

const normalizeGoods = (goods: IGoodInProduction[] = []) =>
  goods.map(g => ({
    materialId: toIdString(g.materialId),
    quantity: g.quantity,
    weight: g.weight || 0
}));



const buildUsageMap = (
  items: { materialId: string | Types.ObjectId | { _id: string }; quantity: number }[] = []
): Map<string, number> => {
  const usage = new Map<string, number>();
  for (const item of items) {
    if (!item.materialId || item.quantity <= 0) continue;
    const key = toIdString(item.materialId as string | Types.ObjectId | IGood);
    usage.set(key, (usage.get(key) ?? 0) + item.quantity);
  }
  return usage;
};


type ItemInput = {
  materialId: string | Types.ObjectId | { _id: string | Types.ObjectId };
  quantity: number;
  weight?: number;
};
type Item = { materialId: string; quantity: number; weight: number };
type AlertMeta = { createdBy?: unknown; org?: unknown };


export async function createProduction(
  data: Partial<IProduction>
): Promise<IResponse> {
  let session: ClientSession | null = null;

  try {
    await connectDB();

    session = await mongoose.startSession();
    session.startTransaction();

    // 1. Create production
    const [newProduction] = await Production.create([data], { session });

    // 2. Build usage maps for both lists
    const materialUsageMap = buildUsageMap(data.ingredients as IIngredientInput[]);
    const goodUsageMap = buildUsageMap(data.goods);

    if (!materialUsageMap.size && !goodUsageMap.size) {
      await session.commitTransaction();
      return respond("Production created successfully", false, newProduction, 201);
    }

    const alerts: Partial<IAlert>[] = [];

    // ───────────── Raw materials (ingredients) ─────────────
    if (materialUsageMap.size) {
      const materialIds = [...materialUsageMap.keys()].map(id => new Types.ObjectId(id));

      // 3. Fetch raw materials
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

      // 4. Validate stock and prepare bulk updates
      const materialOps: {
        updateOne: {
          filter: { _id: Types.ObjectId; qAccepted: { $gte: number } };
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

        materialOps.push({
          updateOne: {
            // the $gte guard protects against concurrent updates
            filter: { _id: new Types.ObjectId(materialId), qAccepted: { $gte: quantityUsed } },
            update: { $inc: { qAccepted: -quantityUsed } }
          }
        });

        material.qAccepted -= quantityUsed; // local copy for alerts
      }

      const materialResult = await RMaterial.bulkWrite(materialOps, { session });
      if (materialResult.matchedCount !== materialOps.length) {
        throw new Error("Raw material stock changed while creating production. Please retry.");
      }

      // 5. Fetch product thresholds
      const products = await Product.find(
        { _id: { $in: [...productIds].map(id => new Types.ObjectId(id)) } },
        { threshold: 1 }
      ).session(session).lean<IProductLean[]>();

      const productThresholdMap = new Map<string, number>();
      for (const p of products) {
        productThresholdMap.set(p._id.toString(), p.threshold);
      }

      // 6. Aggregate remaining qAccepted per product
      const productStockAgg = await RMaterial.aggregate<IProductStockAgg>([
        {
          $match: {
            product: { $in: [...productIds].map(id => new Types.ObjectId(id)) }
          }
        },
        { $group: { _id: "$product", totalRemaining: { $sum: "$qAccepted" } } }
      ]).session(session);

      // 7a. Product-level alerts
      for (const row of productStockAgg) {
        const remaining = row.totalRemaining;
        const threshold = productThresholdMap.get(row._id.toString()) ?? 0;

        if (remaining <= threshold) {
          alerts.push({
            title: "Product Stock Critical",
            body: `Total remaining raw materials have reached the threshold (${remaining}).`,
            type: "error",
            item: new Types.ObjectId(row._id.toString()),
            itemModel: "Product",
            createdBy: data.createdBy,
            org: data.org
          });
        } else if (remaining <= threshold + 5) {
          alerts.push({
            title: "Product Stock Warning",
            body: `Total remaining raw materials are low (${remaining}).`,
            type: "warning",
            item: new Types.ObjectId(row._id.toString()),
            itemModel: "Product",
            createdBy: data.createdBy,
            org: data.org
          });
        }
      }

      // 7b. Raw-material-level alerts
      for (const material of rawMaterials) {
        const threshold = material.product
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
    }

    // ───────────── Goods ─────────────
    if (goodUsageMap.size) {
      const goodIds = [...goodUsageMap.keys()].map(id => new Types.ObjectId(id));

      const goodDocs = await Good.find(
        { _id: { $in: goodIds } },
        { name: 1, raw: 1, threshold: 1 }
      ).session(session).lean<IGoodLean[]>();

      const goodMap = new Map<string, IGoodLean>(
        goodDocs.map(g => [g._id.toString(), g])
      );

      const goodOps: {
        updateOne: {
          filter: { _id: Types.ObjectId; raw: { $gte: number } };
          update: { $inc: { raw: number } };
        };
      }[] = [];

      for (const [goodId, quantityUsed] of goodUsageMap.entries()) {
        const good = goodMap.get(goodId);
        if (!good) {
          throw new Error(`Good not found: ${goodId}`);
        }

        if (good.raw < quantityUsed) {
          throw new Error(
            `Insufficient raw stock for ${good.name}. Available: ${good.raw}, Required: ${quantityUsed}`
          );
        }

        goodOps.push({
          updateOne: {
            filter: { _id: new Types.ObjectId(goodId), raw: { $gte: quantityUsed } },
            update: { $inc: { raw: -quantityUsed } }
          }
        });

        good.raw -= quantityUsed; // local copy for alerts
      }

      const goodResult = await Good.bulkWrite(goodOps, { session });
      if (goodResult.matchedCount !== goodOps.length) {
        throw new Error("Raw stock of a good changed while creating production. Please retry.");
      }

      for (const good of goodDocs) {
        const threshold = good.threshold ?? 0;

        if (good.raw <= threshold) {
          alerts.push({
            title: "Processed Goods Stock Critical",
            body: `${good.name} has reached its raw threshold (${good.raw}).`,
            type: "error",
            item: good._id,
            itemModel: "Good",
            createdBy: data.createdBy,
            org: data.org
          });
        } else if (good.raw <= threshold + 5) {
          alerts.push({
            title: "Processed Goods Stock Warning",
            body: `${good.name} is running low on raw stock (${good.raw}).`,
            type: "warning",
            item: good._id,
            itemModel: "Good",
            createdBy: data.createdBy,
            org: data.org
          });
        }
      }
    }

    // 8. Insert all alerts, then commit
    if (alerts.length) {
      await Alert.insertMany(alerts, { session });
    }

    await session.commitTransaction();

    return respond("Production created successfully", false, newProduction, 201);

  } catch (err) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Create production aborted:", message);
    return respond(message, true, {}, 500);
  } finally {
    await session?.endSession();
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
          quantity: i.quantity,
          weight: i.weight || 0
      }));


      const newIngredients: ProdIngredient[] =
        (data.ingredients ?? []).map((i: IProductionIngredientInput) => ({
          materialId:
            typeof i.materialId === "string"
              ? i.materialId
              : i.materialId instanceof Types.ObjectId
                ? i.materialId.toString()
                : i.materialId._id.toString(),
          quantity: i.quantity,
          weight: i.weight || 0
      }));


      // 3️⃣ Build lookup maps
      const oldMap = new Map<string, { quantity: number; weight: number }>(
        oldIngredients.map(i => [i.materialId, { quantity: i.quantity, weight: i.weight }])
      );
      const newMap = new Map<string, { quantity: number; weight: number }>(
        newIngredients.map(i => [i.materialId, { quantity: i.quantity, weight: i.weight }])
      );

      // 4️⃣ Compute net changes
      const allIds = new Set([...oldMap.keys(), ...newMap.keys()]);
      const netChanges = new Map<string, number>(); // quantity diffs only — drives stock adjustment
      let hasAnyChange = false;

      for (const id of allIds) {
        const oldVal = oldMap.get(id) ?? { quantity: 0, weight: 0 };
        const newVal = newMap.get(id) ?? { quantity: 0, weight: 0 };

        const qtyDiff = newVal.quantity - oldVal.quantity;
        if (qtyDiff !== 0) {
          netChanges.set(id, qtyDiff);
          hasAnyChange = true;
        }
        if (newVal.weight !== oldVal.weight) {
          hasAnyChange = true; // weight-only change still counts as a real change
        }
      }

      if (!hasAnyChange) {
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
        { 
          ...data, 
          ingredients: newIngredients.map(ing => ({
            ...ing,
            weight: ing.weight
          }))
        },
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




export async function updateProductionGoods(
  data: Partial<IProduction>
): Promise<IResponse> {
  let session: mongoose.ClientSession | null = null;

  try {
    await connectDB();

    const productionId = data._id;
    if (!productionId) {
      return respond("Missing production ID", true, {}, 400);
    }

    session = await mongoose.startSession();
    session.startTransaction();

    // 1. Fetch existing production
    const existingProduction = await Production.findById(productionId).session(session);

    if (!existingProduction) {
      await session.abortTransaction();
      return respond("Production not found", true, {}, 404);
    }

    // 2. Normalize goods
    const oldGoods = normalizeGoods(existingProduction.goods);
    const newGoods = normalizeGoods(data.goods);

    // 3. Lookup maps
    const oldMap = new Map(oldGoods.map(g => [g.materialId, g]));
    const newMap = new Map(newGoods.map(g => [g.materialId, g]));

    // 4. Compute net changes (quantity diffs drive the stock adjustment)
    const allIds = new Set([...oldMap.keys(), ...newMap.keys()]);
    const netChanges = new Map<string, number>();
    let hasAnyChange = false;

    for (const id of allIds) {
      const oldVal = oldMap.get(id) ?? { quantity: 0, weight: 0 };
      const newVal = newMap.get(id) ?? { quantity: 0, weight: 0 };

      const qtyDiff = newVal.quantity - oldVal.quantity;
      if (qtyDiff !== 0) {
        netChanges.set(id, qtyDiff);
        hasAnyChange = true;
      }
      if (newVal.weight !== oldVal.weight) {
        hasAnyChange = true;
      }
    }

    if (!hasAnyChange) {
      await session.commitTransaction();
      return respond("No changes detected", false, existingProduction, 200);
    }

    // 5. Fetch goods affected by quantity changes
    const goodIds = [...netChanges.keys()].map(id => new Types.ObjectId(id));

    const goodDocs = await Good.find(
      { _id: { $in: goodIds } },
      { name: 1, raw: 1, threshold: 1 }
    ).session(session).lean<IGoodLean[]>();

    const goodMap = new Map<string, IGoodLean>(
      goodDocs.map(g => [g._id.toString(), g])
    );

    // 6. Validate stock and prepare updates
    const bulkOps: {
      updateOne: {
        filter: { _id: Types.ObjectId; raw?: { $gte: number } };
        update: { $inc: { raw: number } };
      };
    }[] = [];

    for (const [goodId, diff] of netChanges.entries()) {
      const good = goodMap.get(goodId);
      if (!good) {
        throw new Error(`Good not found: ${goodId}`);
      }

  

      if (diff > 0 && good.raw < diff) {
        throw new Error(
          `Insufficient raw stock for ${good.name}. Available: ${good.raw}, Required: ${diff}`
        );
      }

      bulkOps.push({
        updateOne: {
          // the raw >= diff guard protects against concurrent updates
          filter: {
            _id: new Types.ObjectId(goodId),
            ...(diff > 0 ? { raw: { $gte: diff } } : {})
          },
          update: { $inc: { raw: -diff } }
        }
      });

      good.raw -= diff; // update local copy for alerts
    }

    const bulkResult = await Good.bulkWrite(bulkOps, { session });
    if (bulkResult.matchedCount !== bulkOps.length) {
      throw new Error("Raw stock changed while updating. Please retry.");
    }

    // 7. Alerts (only for goods whose raw stock went down)
    const alerts: Partial<IAlert>[] = [];

    for (const good of goodDocs) {
      const diff = netChanges.get(good._id.toString()) ?? 0;
      if (diff <= 0) continue;

      const threshold = good.threshold ?? 0;

      if (good.raw <= threshold) {
        alerts.push({
          title: "Processed Goods Stock Critical",
          body: `${good.name} has reached its raw threshold (${good.raw}).`,
          type: "error",
          item: good._id,
          itemModel: "Good",
          createdBy: data.createdBy,
          org: data.org
        });
      } else if (good.raw <= threshold + 5) {
        alerts.push({
          title: "Processed Goods Stock Warning",
          body: `${good.name} is running low on raw stock (${good.raw}).`,
          type: "warning",
          item: good._id,
          itemModel: "Good",
          createdBy: data.createdBy,
          org: data.org
        });
      }
    }

    if (alerts.length) {
      await Alert.insertMany(alerts, { session });
    }

    // 8. Update production (leave ingredients alone so a stale payload can't overwrite them)
    const { ingredients: _ignored, ...rest } = data;

    const updatedProduction = await Production.findByIdAndUpdate(
      productionId,
      { ...rest, goods: newGoods },
      { new: true, session }
    );

    await session.commitTransaction();

    return respond("Production goods updated successfully", false, updatedProduction, 200);

  } catch (err) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Goods update aborted:", message);
    return respond(message, true, {}, 500);
  } finally {
    await session?.endSession();
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


export async function updateProductionV2(data: Partial<IProduction>): Promise<IResponse> {
    try {
        await connectDB();

        const oldProduction = await Production.findById(data._id).select('status').lean() as { status: string } | null;

        const updatedProduction = await Production.findByIdAndUpdate(data._id, data, { new: true });

        if (
            updatedProduction &&
            oldProduction &&
            oldProduction.status !== 'Approved' &&
            updatedProduction.status === 'Approved'
        ) {
            await Alert.create({
                title: 'Production Approved',
                body: `Production ${updatedProduction.name} has been approved.`,
                type: 'success',
                item: updatedProduction._id,
                itemModel: 'Production',
                receiver: updatedProduction.createdBy,
                createdBy: updatedProduction.createdBy,
                org: updatedProduction.org,
            });
        }

        return respond('Production updated successfully', false, updatedProduction, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating production', true, {}, 500);
    }
}







// Normalizes ids to strings and merges duplicate materialIds so the maps below can't silently drop rows
function normalizeItems(items?: ItemInput[]): Item[] {
  const merged = new Map<string, Item>();
  for (const i of items ?? []) {
    const id =
      typeof i.materialId === "string"
        ? i.materialId
        : i.materialId instanceof Types.ObjectId
          ? i.materialId.toString()
          : i.materialId._id.toString();

    const prev = merged.get(id);
    merged.set(id, {
      materialId: id,
      quantity: (prev?.quantity ?? 0) + i.quantity,
      weight: (prev?.weight ?? 0) + (i.weight || 0),
    });
  }
  return [...merged.values()];
}

// Quantity diffs drive stock changes. Weight changes only count as "changed".
function diffItems(oldItems: Item[], newItems: Item[]) {
  const oldMap = new Map(oldItems.map(i => [i.materialId, i]));
  const newMap = new Map(newItems.map(i => [i.materialId, i]));
  const qtyChanges = new Map<string, number>();
  let changed = false;

  for (const id of new Set([...oldMap.keys(), ...newMap.keys()])) {
    const o = oldMap.get(id) ?? { quantity: 0, weight: 0 };
    const n = newMap.get(id) ?? { quantity: 0, weight: 0 };
    const qtyDiff = n.quantity - o.quantity;
    if (qtyDiff !== 0) {
      qtyChanges.set(id, qtyDiff);
      changed = true;
    }
    if (n.weight !== o.weight) changed = true;
  }
  return { qtyChanges, changed };
}

function levelAlert(
  remaining: number,
  threshold: number,
  labels: { critical: [string, string]; warning: [string, string] },
  item: unknown,
  itemModel: string,
  meta: AlertMeta
): Partial<IAlert> | null {
  if (remaining <= threshold) {
    return { title: labels.critical[0], body: labels.critical[1], type: "error", item, itemModel, ...meta } as Partial<IAlert>;
  }
  if (remaining <= threshold + 5) {
    return { title: labels.warning[0], body: labels.warning[1], type: "warning", item, itemModel, ...meta } as Partial<IAlert>;
  }
  return null;
}

async function applyIngredientStock(
  changes: Map<string, number>,
  session: ClientSession,
  meta: AlertMeta
): Promise<Partial<IAlert>[]> {
  if (changes.size === 0) return [];

  const materials = await RMaterial.find(
    { _id: { $in: [...changes.keys()].map(id => new Types.ObjectId(id)) } },
    { materialName: 1, qAccepted: 1, product: 1 }
  ).session(session).lean<IRawMaterialLean[]>();

  const matMap = new Map(materials.map(m => [m._id.toString(), m]));
  const productIds = new Set<string>();
  const ops: any[] = [];

  for (const [id, diff] of changes) {
    const mat = matMap.get(id);
    if (!mat) throw new Error(`Raw material not found: ${id}`);

    if (diff > 0 && mat.qAccepted < diff) {
      throw new Error(
        `Insufficient stock for ${mat.materialName}. Available: ${mat.qAccepted}, Required: ${diff}`
      );
    }

    ops.push({
      updateOne: {
        // the $gte guard protects against concurrent updates
        filter: { _id: new Types.ObjectId(id), ...(diff > 0 ? { qAccepted: { $gte: diff } } : {}) },
        update: { $inc: { qAccepted: -diff } },
      },
    });

    mat.qAccepted -= diff; // local copy for alerts
    if (diff > 0 && mat.product) productIds.add(mat.product.toString());
  }

  const res = await RMaterial.bulkWrite(ops, { session });
  if (res.matchedCount !== ops.length) {
    throw new Error("Raw material stock changed while updating. Please retry.");
  }

  const alerts: Partial<IAlert>[] = [];
  const productObjIds = [...productIds].map(id => new Types.ObjectId(id));

  const products = productObjIds.length
    ? await Product.find({ _id: { $in: productObjIds } }, { threshold: 1 })
        .session(session).lean<IProductLean[]>()
    : [];
  const thresholdMap = new Map(products.map(p => [p._id.toString(), p.threshold]));

  // Product level alerts
  if (productObjIds.length) {
    const agg = await RMaterial.aggregate<IProductStockAgg>([
      { $match: { product: { $in: productObjIds } } },
      { $group: { _id: "$product", totalRemaining: { $sum: "$qAccepted" } } },
    ]).session(session);

    for (const row of agg) {
      const threshold = thresholdMap.get(row._id.toString()) ?? 0;
      const a = levelAlert(
        row.totalRemaining,
        threshold,
        {
          critical: ["Product Stock Critical", `Total remaining raw materials have reached the threshold (${row.totalRemaining}).`],
          warning: ["Product Stock Warning", `Total remaining raw materials are low (${row.totalRemaining}).`],
        },
        row._id, "Product", meta
      );
      if (a) alerts.push(a);
    }
  }

  // Raw material level alerts (only those whose stock went down)
  for (const mat of materials) {
    if ((changes.get(mat._id.toString()) ?? 0) <= 0) continue;
    const threshold = mat.product ? thresholdMap.get(mat.product.toString()) ?? 0 : 0;
    const a = levelAlert(
      mat.qAccepted,
      threshold,
      {
        critical: ["Raw Material Stock Critical", `${mat.materialName} has reached its threshold (${mat.qAccepted}).`],
        warning: ["Raw Material Stock Warning", `${mat.materialName} is running low (${mat.qAccepted}).`],
      },
      mat._id, "RMaterial", meta
    );
    if (a) alerts.push(a);
  }

  return alerts;
}

async function applyGoodStock(
  changes: Map<string, number>,
  session: ClientSession,
  meta: AlertMeta
): Promise<Partial<IAlert>[]> {
  if (changes.size === 0) return [];

  const goods = await Good.find(
    { _id: { $in: [...changes.keys()].map(id => new Types.ObjectId(id)) } },
    { name: 1, raw: 1, threshold: 1 }
  ).session(session).lean<IGoodLean[]>();

  const goodMap = new Map(goods.map(g => [g._id.toString(), g]));
  const ops: any[] = [];

  for (const [id, diff] of changes) {
    const good = goodMap.get(id);
    if (!good) throw new Error(`Good not found: ${id}`);

    if (diff > 0 && good.raw < diff) {
      throw new Error(
        `Insufficient raw stock for ${good.name}. Available: ${good.raw}, Required: ${diff}`
      );
    }

    ops.push({
      updateOne: {
        filter: { _id: new Types.ObjectId(id), ...(diff > 0 ? { raw: { $gte: diff } } : {}) },
        update: { $inc: { raw: -diff } },
      },
    });

    good.raw -= diff;
  }

  const res = await Good.bulkWrite(ops, { session });
  if (res.matchedCount !== ops.length) {
    throw new Error("Raw stock changed while updating. Please retry.");
  }

  const alerts: Partial<IAlert>[] = [];
  for (const good of goods) {
    if ((changes.get(good._id.toString()) ?? 0) <= 0) continue;
    const a = levelAlert(
      good.raw,
      good.threshold ?? 0,
      {
        critical: ["Processed Goods Stock Critical", `${good.name} has reached its raw threshold (${good.raw}).`],
        warning: ["Processed Goods Stock Warning", `${good.name} is running low on raw stock (${good.raw}).`],
      },
      good._id, "Good", meta
    );
    if (a) alerts.push(a);
  }
  return alerts;
}

export async function updateProduction(data: Partial<IProduction>): Promise<IResponse> {
  let session: ClientSession | null = null;

  try {
    await connectDB();

    if (!data._id) return respond("Missing production ID", true, {}, 400);

    session = await mongoose.startSession();
    session.startTransaction();

    const existing = await Production.findById(data._id).session(session);
    if (!existing) {
      await session.abortTransaction();
      return respond("Production not found", true, {}, 404);
    }

    const oldStatus = existing.status;
    const meta: AlertMeta = {
      createdBy: data.createdBy ?? existing.createdBy,
      org: data.org ?? existing.org,
    };

    // Split off the sections that need special handling. Everything else is a plain update.
    const { _id, ingredients, goods, ...rest } = data;
    const update: Record<string, unknown> = { ...rest };
    const alerts: Partial<IAlert>[] = [];

    // Ingredients (only if the caller sent them)
    if (ingredients !== undefined) {
      const oldItems = normalizeItems(existing.ingredients);
      const newItems = normalizeItems(ingredients);
      const { qtyChanges } = diffItems(oldItems, newItems);

      alerts.push(...(await applyIngredientStock(qtyChanges, session, meta)));
      update.ingredients = newItems;
    }

    // Goods (only if the caller sent them)
    if (goods !== undefined) {
      const oldItems = normalizeItems(existing.goods);
      const newItems = normalizeItems(goods);
      const { qtyChanges } = diffItems(oldItems, newItems);

      alerts.push(...(await applyGoodStock(qtyChanges, session, meta)));
      update.goods = newItems;
    }

    // Everything else, including labourerAllocations, costs, notes and status
    const updated = await Production.findByIdAndUpdate(
      _id,
      { $set: update },
      { new: true, session }
    );

    // Approval alert
    if (updated && oldStatus !== "Approved" && updated.status === "Approved") {
      alerts.push({
        title: "Production Approved",
        body: `Production ${updated.name} has been approved.`,
        type: "success",
        item: updated._id,
        itemModel: "Production",
        receiver: updated.createdBy,
        createdBy: updated.createdBy,
        org: updated.org,
      } as Partial<IAlert>);
    }

    if (alerts.length) await Alert.insertMany(alerts, { session });

    await session.commitTransaction();
    return respond("Production updated successfully", false, updated, 200);
  } catch (err) {
    if (session?.inTransaction()) await session.abortTransaction();
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Production update aborted:", message);
    return respond(message, true, {}, 500);
  } finally {
    await session?.endSession();
  }
}




export async function getProduction(id: string): Promise<IResponse> {
  try {
    await connectDB();

    const check = await verifyOrgAccess(
      Production, id, "Production",
      [
        { path: "productToProduce" },
        { path: "supervisors" },
        { path: "employees", populate: { path: "department" } },
        { path: "labourerAllocations.labourer" },
        { path: "labourers" },
        { path: "original.currency" },
        { path: "createdBy" },
        { path: "batch" },
        // {path: 'proditems'},
        {path: 'ingredients', populate: {path:'materialId', populate:[{path:'batch'}, {path:'product'}]}},
        {path: 'goods', populate: {path:'materialId', populate:[{path:'batch'}, {path:'product'}, {path:'production'}]}}
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


export async function getLastSixMonthsProductionsByOrg(org:string): Promise<IResponse> {
    try {
        await connectDB();

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const productions = await Production.aggregate([
            {
                $match: {
                    org,
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


export async function getProductionStatsByOrg(org:string): Promise<IResponse> {
  try {
    await connectDB();

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const result = await Production.aggregate([
      {
        $match: {
          org: new Types.ObjectId(org),
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
  let session: ClientSession | null = null;

  try {
    await connectDB();

    session = await mongoose.startSession();
    session.startTransaction();

    // 1. Fetch the production to be deleted
    const production = await Production.findById(id).session(session);
    if (!production) {
      await session.abortTransaction();
      return respond("Production not found", true, {}, 404);
    }

    // 2. Restore raw materials' qAccepted
    const materialUsageMap = buildUsageMap(production.ingredients as IIngredientInput[]);

    if (materialUsageMap.size) {
      const materialIds = [...materialUsageMap.keys()].map(mid => new Types.ObjectId(mid));

      const existing = await RMaterial.find(
        { _id: { $in: materialIds } },
        { _id: 1 }
      ).session(session).lean<{ _id: Types.ObjectId }[]>();

      const existingIds = new Set(existing.map(m => m._id.toString()));
      for (const mid of materialUsageMap.keys()) {
        if (!existingIds.has(mid)) {
          throw new Error(`Raw material not found: ${mid}`);
        }
      }

      await RMaterial.bulkWrite(
        [...materialUsageMap.entries()].map(([mid, qty]) => ({
          updateOne: {
            filter: { _id: new Types.ObjectId(mid) },
            update: { $inc: { qAccepted: qty } }
          }
        })),
        { session }
      );
    }

    // 3. Restore goods' raw stock
    const goodUsageMap = buildUsageMap(production.goods);

    if (goodUsageMap.size) {
      const goodIds = [...goodUsageMap.keys()].map(gid => new Types.ObjectId(gid));

      const existing = await Good.find(
        { _id: { $in: goodIds } },
        { _id: 1 }
      ).session(session).lean<{ _id: Types.ObjectId }[]>();

      const existingIds = new Set(existing.map(g => g._id.toString()));
      for (const gid of goodUsageMap.keys()) {
        if (!existingIds.has(gid)) {
          throw new Error(`Good not found: ${gid}`);
        }
      }

      await Good.bulkWrite(
        [...goodUsageMap.entries()].map(([gid, qty]) => ({
          updateOne: {
            filter: { _id: new Types.ObjectId(gid) },
            update: { $inc: { raw: qty } }
          }
        })),
        { session }
      );
    }

    // 4. Delete the production
    const deletedProduction = await Production.deleteOne({ _id: id }, { session });

    // 5. Commit
    await session.commitTransaction();

    return respond("Production deleted successfully", false, deletedProduction, 200);

  } catch (err) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Delete production aborted:", message);
    return respond(message, true, {}, 500);
  } finally {
    await session?.endSession();
  }
}