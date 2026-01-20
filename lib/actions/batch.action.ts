'use server'

import { IResponse } from "@/types/Types";
import { connectDB } from "../mongoose";
import Batch, { IBatch } from "../models/batch.model";
import { respond } from "../misc";
import BatchConfig, { IBatchConfig } from "../models/batchconfig.model";
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import RMaterial from "../models/rmaterial.mode";
import LineItem from "../models/lineitem.model";

export async function createBatch(data: Partial<IBatch>): Promise<IResponse> {
  try {
    await connectDB();

    let newBatch;

    if (data.isConfig && data.config) {
      const config = await BatchConfig.findById(data.config).lean() as unknown as IBatchConfig;

      if (!config) {
        return respond("Batch configuration not found", true, {}, 404);
      }

      let code = "";

      // ✅ Handle Auto-increment type
      if (config.type === "Auto-increment") {
        // 🔹 Find the last Auto-increment batch across ALL configs for the same org
        const lastAutoBatch = await Batch.findOne({
          org: data.org,
          $or: [
            { configType: "Auto-increment" },
            { configType: { $exists: false } }, // legacy support
          ],
        })
          .sort({ createdAt: -1 })
          .lean() as unknown as IBatch;

        let lastNumber = 0;

        if (lastAutoBatch?.code) {
          // Try to extract only the numeric part (regardless of prefix/suffix)
          const numericMatch = lastAutoBatch.code.match(/\d+/);
          if (numericMatch) {
            lastNumber = parseInt(numericMatch[0], 10) || 0;
          }
        }

        // 🔹 Increment by this config’s increment value
        const nextNumber = lastNumber + (config.increament || 1);

        // 🔹 Pad and construct code
        const padded = String(nextNumber).padStart(config.length, "0");
        code = `${config.prefix || ""}${padded}${config.suffix || ""}`;
      }

      // ✅ Handle Auto-generation type
      else if (config.type === "Auto-generation") {
        const randomString = Array.from({ length: config.length }, () =>
          Math.floor(Math.random() * 10)
        ).join("");

        code = `${config.prefix || ""}${randomString}${config.suffix || ""}`;
      }

      // ✅ Save batch
      newBatch = await Batch.create({
        ...data,
        code,
        configType: config.type,
      });
    } else {
      newBatch = await Batch.create(data);
    }

    return respond("Batch code created successfully", false, newBatch, 201);
  } catch (error) {
    console.error(error);
    return respond("Error occurred while creating batch code", true, {}, 500);
  }
}


export async function updateBatch(data: Partial<IBatch>): Promise<IResponse> {
  try {
    await connectDB();

    // ✅ Find the existing batch
    const existingBatch = await Batch.findById(data._id);
    if (!existingBatch) {
      return respond("Batch not found", true, {}, 404);
    }

    let updatedFields: Partial<IBatch> = { ...data };

    // ✅ If this batch is linked to a configuration, recompute code if needed
    if (data.isConfig && data.config) {
      const config = await BatchConfig.findById(data.config).lean() as unknown as IBatchConfig;

      if (!config) {
        return respond("Batch configuration not found", true, {}, 404);
      }

      let code = "";

      // ✅ Auto-increment type
      if (config.type === "Auto-increment") {
        // Find last batch across all Auto-increment batches in the same org
        const lastAutoBatch = await Batch.findOne({
          org: data.org || existingBatch.org,
          $or: [
            { configType: "Auto-increment" },
            { configType: { $exists: false } },
          ],
        })
          .sort({ createdAt: -1 })
          .lean() as unknown as IBatch;

        let lastNumber = 0;
        if (lastAutoBatch?.code) {
          const numericMatch = lastAutoBatch.code.match(/\d+/);
          if (numericMatch) {
            lastNumber = parseInt(numericMatch[0], 10) || 0;
          }
        }

        const nextNumber = lastNumber + (config.increament || 1);
        const padded = String(nextNumber).padStart(config.length, "0");
        code = `${config.prefix || ""}${padded}${config.suffix || ""}`;
      }

      // ✅ Auto-generation type
      else if (config.type === "Auto-generation") {
        const randomString = Array.from({ length: config.length }, () =>
          Math.floor(Math.random() * 10)
        ).join("");

        code = `${config.prefix || ""}${randomString}${config.suffix || ""}`;
      }

      // ✅ Update code and config type
      updatedFields.code = code;
      updatedFields.configType = config.type;
    }

    // ✅ Perform update
    const updatedBatch = await Batch.findByIdAndUpdate(data._id, updatedFields, { new: true });

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
        .populate('createdBy')
        .populate('org')
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
        .populate('createdBy')
        .populate('org')
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
            .populate("createdBy")
            .populate("org")
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
                    org: orgId
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
            .populate("createdBy")
            .populate("org")
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
            .populate("createdBy")
            .populate("org")
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
                    org: orgId
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
            .populate("createdBy")
            .populate("org")
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