'use server'

import { IResponse } from "@/types/Types";
import PackApproval, { IPackApproval } from "../models/packapproval.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/org.model';
import '../models/user.model'
import '../models/production.model'
import '../models/package.model'
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";

export async function createPackApproval(data: Partial<IPackApproval>): Promise<IResponse> {
  try {
    await connectDB();
    const approval = await PackApproval.findOne({ package: data.package });
    if (approval) {
        const updatedApproval = await PackApproval.findByIdAndUpdate(approval._id, data, { new: true });
        return respond("Approval request sent successfully", false, updatedApproval, 200);
    }
    const newApproval = await PackApproval.create(data);
    return respond("Approval request sent successfully", false, newApproval, 201);
  } catch (error) {
    console.error("Error sending approval request:", error);
    return respond("Error occurred while sending approval request", true, {}, 500);
  }
}

export async function getPackApprovals():Promise<IResponse>{
    try {
        await connectDB();
        const packApprovals = await PackApproval.find()
        .populate({path:'package', populate:[{path:'good'}, {path:'batch'}]})
        .populate('createdBy')
        .populate('approver')
        .populate('org') as unknown as IPackApproval[];
        return respond('Package approvals found successfully', false, packApprovals, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching Package approvals', true, {}, 500);
    }
}


export async function getPackApprovalsByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const packApprovals = await PackApproval.find({ org: orgId })
        .populate({path:'package', populate:[{path:'good'}, {path:'batch'}]})
        .populate('createdBy')
        .populate('approver')
        .populate('org') as unknown as IPackApproval[];
        return respond('Package approvals found successfully', false, packApprovals, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching Package approvals', true, {}, 500);
    }
}


export async function updatePackApproval(data:Partial<IPackApproval>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedPackApproval = await PackApproval.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Package approval updated successfully', false, updatedPackApproval, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating package approval', true, {}, 500);
    }
}

export async function getPackApproval(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const check = await verifyOrgAccess(PackApproval, id, "PackApproval",
            [
                { path: "package", populate: [{ path: "good" }, {path:"batch"}] },
                { path: "createdBy" },
                { path: "approver" },
                { path: "org" },
            ]);
        
        if ("allowed" in check === false) return check;
        const prodApproval = check.doc;
        return respond("Package approval retrieved successfully", false, prodApproval, 200);
    } catch (error) {
        console.log(error);
        return respond("Error occured retrieving Package approval", true, {}, 500);
    }
}

export async function deletePackApproval(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedPackApproval = await PackApproval.deleteOne({ _id: id });
        return respond('Package approval deleted successfully', false, deletedPackApproval, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting Package approval', true, {}, 500);
    }
}