'use server'

import { IResponse } from "@/types/Types";
import { connectDB } from "../mongoose";
import Batch, { IBatch } from "../models/batch.model";
import { respond } from "../misc";
import BatchConfig, { IBatchConfig } from "../models/batchconfig.model";
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import RMaterial from "../models/rmaterial.mode";
import LineItem from "../models/lineitem.model";
import mongoose from "mongoose";
import Good from "../models/good.model";
import { getSession } from "../session";
import { randomInt } from "crypto";

const BATCH_TYPES = ["Raw Material", "Production", "Packaging", "Packaging Material"] as const;

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const idOf = (v: unknown): string | undefined => {
  if (!v) return undefined;
  if (typeof v === "string") return v;
  const obj = v as { _id?: unknown };
  return obj._id ? String(obj._id) : String(v);
};

async function codeExists(org: unknown, code: string, excludeId?: string): Promise<boolean> {
  const filter: Record<string, unknown> = { org, code };
  if (excludeId) filter._id = { $ne: excludeId };
  return !!(await Batch.exists(filter));
}

// Builds the next unique code for a configuration within an org.
// Auto-increment continues from the highest number already used with this
// prefix/suffix (not just the newest batch), so manual codes and other
// configs can't throw the sequence off.
async function generateBatchCode(config: IBatchConfig, org: unknown): Promise<string> {
  const prefix = config.prefix || "";
  const suffix = config.suffix || "";
  const length = Math.max(1, Number(config.length) || 1);

  if (config.type === "Auto-increment") {
    const step = Math.max(1, Number(config.increament) || 1);
    const pattern = new RegExp(`^${escapeRegex(prefix)}(\\d+)${escapeRegex(suffix)}$`);
    const existing = await Batch.find({ org, code: { $regex: pattern } }).select("code").lean<{ code: string }[]>();

    let max = 0;
    for (const b of existing) {
      const n = parseInt(b.code.match(pattern)?.[1] ?? "0", 10);
      if (n > max) max = n;
    }

    let next = max + step;
    let code = `${prefix}${String(next).padStart(length, "0")}${suffix}`;
    while (await codeExists(org, code)) {
      next += step;
      code = `${prefix}${String(next).padStart(length, "0")}${suffix}`;
    }
    return code;
  }

  if (config.type === "Auto-generation") {
    for (let attempt = 0; attempt < 20; attempt++) {
      const digits = Array.from({ length }, () => randomInt(10)).join("");
      const code = `${prefix}${digits}${suffix}`;
      if (!(await codeExists(org, code))) return code;
    }
    throw new Error("Could not generate a unique batch code. Increase the configuration length.");
  }

  throw new Error(`Unsupported batch configuration type: ${config.type}`);
}

async function loadConfig(configId: string, org: unknown): Promise<IBatchConfig | null> {
  const config = await BatchConfig.findById(configId).lean<IBatchConfig>();
  if (!config) return null;
  if (config.org && org && String(config.org) !== String(org)) return null;
  return config;
}

export async function createBatch(data: Partial<IBatch>): Promise<IResponse> {
  try {
    await connectDB();
    const user = await getSession();
    if (!user) return respond("Unauthorized access. Please log in.", true, {}, 401);

    const org = data.org || user.org;
    const type = data.type || "Raw Material";
    if (!BATCH_TYPES.includes(type as (typeof BATCH_TYPES)[number])) {
      return respond(`Invalid batch type: ${type}`, true, {}, 400);
    }

    const base = {
      type,
      org,
      createdBy: data.createdBy,
      creator: data.creator,
    };

    if (data.isConfig) {
      const configId = idOf(data.config);
      if (!configId) return respond("Select a batch configuration", true, {}, 400);
      const config = await loadConfig(configId, org);
      if (!config) return respond("Batch configuration not found", true, {}, 404);

      const code = await generateBatchCode(config, org);
      const newBatch = await Batch.create({ ...base, isConfig: true, config: configId, configType: config.type, code });
      return respond("Batch code created successfully", false, newBatch, 201);
    }

    const code = (data.code || "").trim();
    if (!code) return respond("Batch code is required", true, {}, 400);
    if (await codeExists(org, code)) return respond(`Batch code ${code} already exists`, true, {}, 409);

    const newBatch = await Batch.create({ ...base, isConfig: false, code });
    return respond("Batch code created successfully", false, newBatch, 201);
  } catch (error) {
    console.error(error);
    return respond("Error occurred while creating batch code", true, {}, 500);
  }
}


export async function updateBatch(data: Partial<IBatch>): Promise<IResponse> {
  try {
    await connectDB();
    if (!data._id) return respond("Batch not found", true, {}, 404);

    const check = await verifyOrgAccess(Batch, data._id, "Batch");
    if ("allowed" in check === false) return check;
    const existing = check.doc as unknown as IBatch;
    const org = existing.org;

    const update: Partial<IBatch> = {};

    if (data.type !== undefined) {
      if (!BATCH_TYPES.includes(data.type as (typeof BATCH_TYPES)[number])) {
        return respond(`Invalid batch type: ${data.type}`, true, {}, 400);
      }
      update.type = data.type;
    }

    const isConfig = data.isConfig ?? existing.isConfig;

    if (isConfig) {
      const configId = idOf(data.config) || idOf(existing.config);
      if (!configId) return respond("Select a batch configuration", true, {}, 400);

      // Keep the existing code unless the batch is newly switched to a
      // configuration or moved to a different one. Batch codes are used for
      // traceability, so editing other fields must not change them.
      const configChanged = !existing.isConfig || configId !== idOf(existing.config);
      if (configChanged) {
        const config = await loadConfig(configId, org);
        if (!config) return respond("Batch configuration not found", true, {}, 404);
        update.code = await generateBatchCode(config, org);
        update.configType = config.type;
      }
      update.isConfig = true;
      update.config = configId;
    } else {
      const code = (data.code ?? existing.code ?? "").trim();
      if (!code) return respond("Batch code is required", true, {}, 400);
      if (code !== existing.code && (await codeExists(org, code, data._id))) {
        return respond(`Batch code ${code} already exists`, true, {}, 409);
      }
      update.code = code;
      update.isConfig = false;
    }

    const updatedBatch = await Batch.findByIdAndUpdate(data._id, update, { new: true });
    return respond("Batch code updated successfully", false, updatedBatch, 200);
  } catch (error) {
    console.error(error);
    return respond("Error occurred while updating batch code", true, {}, 500);
  }
}





export async function getBatches():Promise<IResponse>{
    try {
        await connectDB();
        const batches = await Batch.find()
        .populate('createdBy', 'name email photo')
        .populate('org', 'name logo')
        .populate('config').lean() as unknown as IBatch[];
        return respond('Batches found successfully', false, batches, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching batches', true, {}, 500);
    }
}


export async function getBatchesByOrg(orgId:string):Promise<IResponse>{
  try {
    await connectDB();
        const batches = await Batch.find({ org: orgId })
        .populate('createdBy', 'name email photo')
        .populate('org', 'name logo')
        .populate('config').lean() as unknown as IBatch[];
        return respond('Batches found successfully', false, batches, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching batches', true, {}, 500);
    }
}

export async function getBatchesWithGoods(): Promise<IResponse> {
    try {
        await connectDB();

        // 1️⃣ Get all batch IDs where qAccepted > 0
        const acceptedBatches = await RMaterial.aggregate([
            {
                $match: {
                    qAccepted: { $gt: 0 }
                }
            },
            {
                $group: {
                    _id: "$batch"
                }
            }
        ]);

        const batchIds = acceptedBatches.map(b => b._id);

        // If nothing found, return empty
        if (batchIds.length === 0) {
            return respond("No batches with accepted goods found", false, [], 200);
        }

        // 2️⃣ Fetch the batch documents and populate
        const batches = await Batch.find({ _id: { $in: batchIds } })
            .populate("createdBy", "name email photo")
            .populate("org", "name logo")
            .populate("config")
            .lean<IBatch[]>();

        return respond("Batches found successfully", false, batches, 200);

    } catch (error) {
        console.log(error);
        return respond("Error occurred while fetching batches with goods", true, {}, 500);
    }
}




export async function getBatchesWithGoodsByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();

        // 1️⃣ Get all batch IDs where qAccepted > 0
        const acceptedBatches = await RMaterial.aggregate([
            {
                $match: {
                    qAccepted: { $gt: 0 },
                    org: new mongoose.Types.ObjectId(orgId)
                }
            },
            {
                $group: {
                    _id: "$batch"
                }
            }
        ]);
        // console.log('Aceepted goods: ', acceptedBatches)
        const batchIds = acceptedBatches.map(b => b._id);
        // console.log('Batch: ', batchIds)
        // If nothing found, return empty
        if (batchIds.length === 0) {
            return respond("No batches with accepted goods found", false, [], 200);
        }

        // 2️⃣ Fetch the batch documents and populate
        const batches = await Batch.find({ _id: { $in: batchIds } })
            .populate("createdBy", "name email photo")
            .populate("org", "name logo")
            .populate("config")
            .lean<IBatch[]>();

        return respond("Batches found successfully", false, batches, 200);

    } catch (error) {
        console.log(error);
        return respond("Error occurred while fetching batches with goods", true, {}, 500);
    }
}


export async function getBatchesWithFinishedGoodsByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();

        // 1️⃣ Get all batch IDs where qAccepted > 0
        const acceptedBatches = await Good.aggregate([
            {
                $match: {
                    raw: { $gt: 0 },
                    org: new mongoose.Types.ObjectId(orgId)
                }
            },
            {
                $group: {
                    _id: "$batch"
                }
            }
        ]);
        // console.log('Aceepted goods: ', acceptedBatches)
        const batchIds = acceptedBatches.map(b => b._id);
        // console.log('Batch: ', batchIds)
        // If nothing found, return empty
        if (batchIds.length === 0) {
            return respond("No batches with accepted goods found", false, [], 200);
        }

        // 2️⃣ Fetch the batch documents and populate
        const batches = await Batch.find({ _id: { $in: batchIds } })
            .populate("createdBy", "name email photo")
            .populate("org", "name logo")
            .populate("config")
            .lean<IBatch[]>();

        return respond("Batches found successfully", false, batches, 200);

    } catch (error) {
        console.log(error);
        return respond("Error occurred while fetching batches with goods", true, {}, 500);
    }
}


export async function getBatchesWithLineItems(): Promise<IResponse> {
    try {
        await connectDB();

        // 1️⃣ Get all batch IDs that have available line items
        const batchesWithItems = await LineItem.aggregate([
            {
                $match: {
                    status: "Available"
                }
            },
            {
                $group: {
                    _id: "$batch"
                }
            }
        ]);

        const batchIds = batchesWithItems.map(b => b._id);

        if (batchIds.length === 0) {
            return respond("No batches with available line items found", false, [], 200);
        }

        // 2️⃣ Fetch & populate batch docs
        const batches = await Batch.find({ _id: { $in: batchIds } })
            .populate("createdBy", "name email photo")
            .populate("org", "name logo")
            .populate("config")
            .lean<IBatch[]>();

        return respond("Batches found successfully", false, batches, 200);

    } catch (error) {
        console.log(error);
        return respond("Error occurred while fetching batches with line items", true, {}, 500);
    }
}


export async function getBatchesWithLineItemsByOrg(orgId: string): Promise<IResponse> {
    try {
        await connectDB();

        // 1️⃣ Get all batch IDs that have available line items AND belong to the org
        const batchesWithItems = await LineItem.aggregate([
            {
                $match: {
                    status: "Available",
                    org: new mongoose.Types.ObjectId(orgId)
                }
            },
            {
                $group: {
                    _id: "$batch"
                }
            }
        ]);

        const batchIds = batchesWithItems.map(b => b._id);

        if (batchIds.length === 0) {
            return respond("No batches with available line items found for this organization", false, [], 200);
        }

        // 2️⃣ Fetch & populate batch docs
        const batches = await Batch.find({ _id: { $in: batchIds } })
            .populate("createdBy", "name email photo")
            .populate("org", "name logo")
            .populate("config")
            .lean<IBatch[]>();

        return respond("Batches found successfully", false, batches, 200);

    } catch (error) {
        console.log(error);
        return respond("Error occurred while fetching batches with line items by org", true, {}, 500);
    }
}



export async function getBatch(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const check = await verifyOrgAccess(Batch, id, 'Batch', [{ path: 'config' }]);
        if('allowed' in check === false) return check;
        const batch = check.doc;
        return respond("Batch retrieved successfully", false, batch, 200);
    } catch (error) {
        console.log(error);
        return respond("Error occured retrieving batch", true, {}, 500);
    }
}

export async function deleteBatch(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedBatch = await Batch.deleteOne({ _id: id });
        return respond('Batch code deleted successfully', false, deletedBatch, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting batch code', true, {}, 500);
    }
}