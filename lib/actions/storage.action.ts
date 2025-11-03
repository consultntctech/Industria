'use server'

import { IResponse } from "@/types/Types";
import Storage, { IStorage } from "../models/storage.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/user.model'
import '../models/org.model'
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";

export async function createStorage(data:Partial<IStorage>):Promise<IResponse>{
    try {
        await connectDB();
        const storage = await Storage.create(data);
        return respond('Storage created successfully', false, storage, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating storage', true, {}, 500);
    }
}

export async function getStorages():Promise<IResponse>{
    try {
        await connectDB();
        const storages = await Storage.find();
        return respond('Storages found successfully', false, storages, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching storages', true, {}, 500);
    }
}

export async function getStoragesByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const storages = await Storage.find({ org: orgId });
        return respond('Storages found successfully', false, storages, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching storages', true, {}, 500);
    }
}


export async function updateStorage(data:Partial<IStorage>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedStorage = await Storage.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Storage updated successfully', false, updatedStorage, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating storage', true, {}, 500);
    }
}

export async function getStorage(id: string): Promise<IResponse> {
  try {
    await connectDB();

    const check = await verifyOrgAccess(Storage, id, "Storage");

    // If not allowed, return the middleware's response directly
    if ("allowed" in check === false) return check;

    // Authorized → you can use check.doc safely, fully typed as Storage
    const storage = check.doc;

    return respond("Storage retrieved successfully", false, storage, 200);
  } catch (error) {
    console.error(error);
    return respond("Error occurred retrieving storage", true, {}, 500);
  }
}

export async function deleteStorage(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedStorage = await Storage.deleteOne({ _id: id });
        return respond('Storage deleted successfully', false, deletedStorage, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting storage', true, {}, 500);
    }
}