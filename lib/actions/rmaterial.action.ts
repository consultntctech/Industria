'use server'

import { IResponse } from "@/types/Types";
import RMaterial, { IRMaterial } from "../models/rmaterial.mode";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/org.model';
import '../models/supplier.model';
import '../models/batch.model';
import Product, { IProduct } from "../models/product.model";

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
        const materials = await RMaterial.find();
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


export async function getRMaterialsByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const materials = await RMaterial.find({ org: orgId });
        return respond('Raw Materials found successfully', false, materials, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching Raw Materials', true, {}, 500);
    }
}


export async function updateRMaterial(data:Partial<IRMaterial>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedMaterial = await RMaterial.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Raw Material updated successfully', false, updatedMaterial, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating Raw Material', true, {}, 500);
    }
}

export async function getRMaterial(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const material = await RMaterial.findById(id);
        return respond("Raw Material retrieved successfully", false, material, 200);
    } catch (error) {
        console.log(error);
        return respond("Error occured retrieving Raw Material", true, {}, 500);
    }
}

export async function deleteRMaterial(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedMaterial = await RMaterial.deleteOne({ _id: id });
        return respond('Raw Material deleted successfully', false, deletedMaterial, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting Raw Material', true, {}, 500);
    }
}