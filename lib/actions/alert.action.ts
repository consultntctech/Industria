'use server'

import { IResponse } from "@/types/Types";
import Alert, { IAlert } from "../models/alert.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/user.model'
import '../models/org.model'
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";

export async function createAlert(data:Partial<IAlert>):Promise<IResponse>{
    try {
        await connectDB();
        const alert = await Alert.create(data);
        return respond('Alert created successfully', false, alert, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating alert', true, {}, 500);
    }
}

export async function getAlerts():Promise<IResponse>{
    try {
        await connectDB();
        const alerts = await Alert.find()
        .populate('item')
        .populate('org')
        .populate('createdBy')
        .lean() as unknown as IAlert[];
        return respond('Alerts found successfully', false, alerts, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching alerts', true, {}, 500);
    }
}

export async function getAlertsByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const alerts = await Alert.find({ org: orgId })
        .populate('item')
        .populate('org')
        .populate('createdBy')
        .lean() as unknown as IAlert[];
        return respond('Alerts found successfully', false, alerts, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching alerts', true, {}, 500);
    }
}


export async function updateAlert(data:Partial<IAlert>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedAlert = await Alert.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Alert updated successfully', false, updatedAlert, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating alert', true, {}, 500);
    }
}

export async function getAlert(id: string): Promise<IResponse> {
  try {
    await connectDB();

    const check = await verifyOrgAccess(Alert, id, "Alert", [
        { path: "item" },
        { path: "org" },
        { path: "createdBy" },
    ]);

    // If not allowed, return the middleware's response directly
    if ("allowed" in check === false) return check;

    // Authorized → you can use check.doc safely, fully typed as Alert
    const alert = check.doc;

    return respond("Alert retrieved successfully", false, alert, 200);
  } catch (error) {
    console.error(error);
    return respond("Error occurred retrieving alert", true, {}, 500);
  }
}

export async function deleteAlert(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedAlert = await Alert.deleteOne({ _id: id });
        return respond('Alert deleted successfully', false, deletedAlert, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting alert', true, {}, 500);
    }
}