'use server'

import { IResponse } from "@/types/Types";
import Labourer, { ILabourer } from "../models/labourer.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/org.model';
import '../models/user.model'
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";

export async function createLabourer(data: Partial<ILabourer>): Promise<IResponse> {
  try {
    await connectDB();
    const labourer = await Labourer.create(data);
    return respond('Labourer created successfully', false, labourer, 201);
  } catch (error) {
    console.log(error);
    return respond('Error occured while creating labourer', true, {}, 500);
  }
}

export async function getLabourers(): Promise<IResponse> {
  try {
    await connectDB();
    const labourers = await Labourer.find()
    .populate('org')
    .populate('createdBy')
    .lean() as unknown as ILabourer[];
    return respond('Labourers found successfully', false, labourers, 200);
  } catch (error) {
    console.log(error);
    return respond('Error occured while fetching labourers', true, {}, 500);
  }
}

export async function getLabourersByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const labourers = await Labourer.find({ org: orgId })
        .populate('org')
        .populate('createdBy')
        .lean() as unknown as ILabourer[];
        return respond('Labourers found successfully', false, labourers, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching labourers', true, {}, 500);
    }
}


export async function updateLabourer(data:Partial<ILabourer>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedLabourer = await Labourer.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Labourer updated successfully', false, updatedLabourer, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating labourer', true, {}, 500);
    }
}

export async function getLabourer(id: string): Promise<IResponse> {
  try {
    await connectDB();
    const check = await verifyOrgAccess(Labourer, id, "Labourer");

    // If not allowed, return the middleware's response directly
    if ("allowed" in check === false) return check;

    // Authorized → you can use check.doc safely, fully typed as Production
    const labourer = check.doc;

    return respond("Labourer retrieved successfully", false, labourer, 200);
  } catch (error) {
    console.error(error);
    return respond("Error occurred retrieving labourer", true, {}, 500);
  }
}

export async function deleteLabourer(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedLabourer = await Labourer.deleteOne({ _id: id });
        return respond('Labourer deleted successfully', false, deletedLabourer, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting labourer', true, {}, 500);
    }
}