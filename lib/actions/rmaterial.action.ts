'use server'

import { IResponse } from "@/types/Types";
import RMaterial, { IRMaterial } from "../models/rmaterial.mode";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/org.model';
import '../models/supplier.model';
import '../models/batch.model';
import '../models/othercurrency.model';
import '../models/storage.model';
import Product, { IProduct } from "../models/product.model";
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import Production from "../models/production.model";
import {Types} from "mongoose";

export async function createRMaterial(data: Partial<IRMaterial>): Promise<IResponse> {
  try {
    await connectDB();

    if (!data.product) {
      return respond("Product ID is required", true, {}, 400);
    }

    const product = await Product.findById(data.product).lean() as unknown as IProduct;
    if (!product) {
      return respond("Product not found", true, {}, 404);
    }

    // Get product prefix (first 3 letters, capitalized)
    const prefix = product?.name.substring(0, 3).charAt(0).toUpperCase() + 
                   product?.name.substring(1, 3).toLowerCase();

    // Find last raw material under this product
    const lastRM = await RMaterial.findOne({ product: product._id })
      .sort({ createdAt: -1 })
      .lean() as unknown as IRMaterial;

    let lastNumber = 0;
    if (lastRM?.materialName) {
      const numericMatch = lastRM.materialName.match(/\d+$/);
      if (numericMatch) lastNumber = parseInt(numericMatch[0], 10) || 0;
    }

    // Increment by 1 for next material
    const nextNumber = lastNumber + 1;
    const materialName = `${prefix}-${nextNumber}`;

    // Create new material with inherited name
    const newMaterial = await RMaterial.create({
      ...data,
      materialName,
    });

    return respond("Raw Material created successfully", false, newMaterial, 201);
  } catch (error) {
    console.error(error);
    return respond("Error occurred while creating Raw Material", true, {}, 500);
  }
}


export async function getRMaterials():Promise<IResponse>{
    try {
        await connectDB();
        const materials = await RMaterial.find()
        .populate('product')
        .populate('suppliers')
        .populate('storages')
        .populate('batch')
        .populate('original.currency')
        .populate('createdBy')
        .populate('org') as unknown as IRMaterial[];
        return respond('Raw Materials found successfully', false, materials, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching Raw Materials', true, {}, 500);
    }
}


export async function getAvailableRMaterialsByBatch(batchId:string):Promise<IResponse>{
    try {
        await connectDB();
        const materials = await RMaterial.find({ batch: batchId, qAccepted: { $gt: 0 } })
        .populate('product', 'name')
        .populate('batch', 'code')
        .lean() as unknown as IRMaterial[];
        console.log('Raw Materials: ', materials.length);
        return respond('Raw Materials found successfully', false, materials, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching Raw Materials', true, {}, 500);
    }
}


export async function getAvailableRMaterialsByBatchByOrg(org:string, batchId:string):Promise<IResponse>{
    try {
        await connectDB();
        const materials = await RMaterial.find({org, batch: batchId, qAccepted: { $gt: 0 } })
        .populate('product', 'name')
        .populate('batch', 'code')
        .lean() as unknown as IRMaterial[];
        console.log('Raw Materials: ', materials.length);
        return respond('Raw Materials found successfully', false, materials, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching Raw Materials', true, {}, 500);
    }
}


export async function getRMaterialsByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const materials = await RMaterial.find({ org: orgId })
        .populate('product')
        .populate('suppliers')
        .populate('storages')
        .populate('batch')
        .populate('original.currency')
        .populate('createdBy')
        .populate('org') as unknown as IRMaterial[];
        return respond('Raw Materials found successfully', false, materials, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching Raw Materials', true, {}, 500);
    }
}


export async function getRawMaterialsBySupplier(supplierId:string):Promise<IResponse>{
    try {
        await connectDB();
        const materials = await RMaterial.find({ supplier: supplierId })
        .populate('product')
        .populate('suppliers')
        .populate('storages')
        .populate('batch')
        .populate('createdBy')
        .populate('org') as unknown as IRMaterial[];
        return respond('Raw Materials found successfully', false, materials, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching Raw Materials', true, {}, 500);
    }
}


export async function getRawMaterialsBySupplierByOrg(org:string, supplierId:string):Promise<IResponse>{
    try {
        await connectDB();
        const materials = await RMaterial.find({org, supplier: supplierId })
        .populate('product')
        .populate('suppliers')
        .populate('storages')
        .populate('batch')
        .populate('createdBy')
        .populate('org') as unknown as IRMaterial[];
        return respond('Raw Materials found successfully', false, materials, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching Raw Materials', true, {}, 500);
    }
}


export async function updateRMaterial(data: Partial<IRMaterial>): Promise<IResponse> {
    try {
        await connectDB();

        if (!data._id || !Types.ObjectId.isValid(data._id)) {
            return respond('Invalid raw material id', true, {}, 400);
        }

        const existing = await RMaterial.findById(data._id)
            .select('qReceived qRejected qAccepted')
            .lean() as unknown as Pick<IRMaterial, 'qReceived' | 'qRejected' | 'qAccepted'> | null;

        if (!existing) {
            return respond('Raw material not found', true, {}, 404);
        }

        // Fields the client must never set directly
        const {
            _id,
            qAccepted: _qAccepted,
            org: _org,
            createdBy: _createdBy,
            creator: _creator,
            ...fields
        } = data;

        const oldReceived = existing.qReceived ?? 0;
        const oldRejected = existing.qRejected ?? 0;

        // Form values arrive as strings, so convert them
        const newReceived = fields.qReceived !== undefined ? Number(fields.qReceived) : oldReceived;
        const newRejected = fields.qRejected !== undefined ? Number(fields.qRejected) : oldRejected;

        if (!Number.isFinite(newReceived) || !Number.isFinite(newRejected) || newReceived < 0 || newRejected < 0) {
            return respond('Quantities must be valid positive numbers', true, {}, 400);
        }
        if (newRejected > newReceived) {
            return respond('Rejected quantity cannot be more than the quantity received', true, {}, 400);
        }

        fields.qReceived = newReceived;
        fields.qRejected = newRejected;

        // What production has already taken out of this material
        const consumed = (oldReceived - oldRejected) - existing.qAccepted;
        const newAccepted = newReceived - newRejected - consumed;

        if (newAccepted < 0) {
            return respond(
                `Received minus rejected cannot be lower than the ${consumed} already used in production`,
                true,
                {},
                400
            );
        }

        // The filter pins the stock we read, so a production created at the same
        // moment cannot be overwritten
        const updatedMaterial = await RMaterial.findOneAndUpdate(
            { _id, qAccepted: existing.qAccepted },
            { $set: { ...fields, qAccepted: newAccepted } },
            { new: true }
        );

        if (!updatedMaterial) {
            return respond('This material changed while you were editing it. Please refresh and try again', true, {}, 409);
        }

        return respond('Raw Material updated successfully', false, updatedMaterial, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating Raw Material', true, {}, 500);
    }
}

// export async function updateMaterialSuppliers():Promise<IResponse>{
//     try {
//         await connectDB();
//         const rms = await RMaterial.find() as unknown as IRMaterial[];
//         for(const rm of rms){
//             await RMaterial.updateOne({_id: rm._id}, { suppliers: [rm.supplier?.toString()] });
//         }
//         return respond('Raw Material updated successfully', false, rms, 200);
//     } catch (error) {
//         console.log(error);
//         return respond('Error occured while updating Raw Material', true, {}, 500);
//     }
// }

export async function getRMaterial(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const check = await verifyOrgAccess(RMaterial, id, "Raw Material",[
            { path: "product" },
            { path: "suppliers" },
            { path: "batch" },
            { path: "createdBy" },
            { path: "org" },
        ]);

        if ("allowed" in check === false) return check;

        const material = check.doc;

        return respond("Raw Material retrieved successfully", false, material, 200);
    } catch (error) {
        console.log(error);
        return respond("Error occured retrieving Raw Material", true, {}, 500);
    }
}

export async function deleteRMaterial(id: string): Promise<IResponse> {
    try {
        await connectDB();

        const inUse = await Production.exists({ 'ingredients.materialId': id });
        if (inUse) {
            return respond(
                'Cannot delete this raw material because it is used in one or more productions',
                true,
                {},
                409
            );
        }

        const deletedMaterial = await RMaterial.deleteOne({ _id: id });
        if (deletedMaterial.deletedCount === 0) {
            return respond('Raw Material not found', true, {}, 404);
        }

        return respond('Raw Material deleted successfully', false, deletedMaterial, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting Raw Material', true, {}, 500);
    }
}