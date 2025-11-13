'use server'

import { IResponse } from "@/types/Types";
import ProdApproval, { IProdApproval } from "../models/prodapproval.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/org.model';
import '../models/user.model'
import '../models/production.model'
import '../models/product.model'
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";

export async function createProdApproval(data: Partial<IProdApproval>): Promise<IResponse> {
  try {
    await connectDB();
    const approval = await ProdApproval.findOne({ production: data.production });
    if (approval) {
        const updatedApproval = await ProdApproval.findByIdAndUpdate(approval._id, data, { new: true });
        return respond("Approval request sent successfully", false, updatedApproval, 200);
    }
    const newApproval = await ProdApproval.create(data);
    return respond("Approval request sent successfully", false, newApproval, 201);
  } catch (error) {
    console.error("Error sending approval request:", error);
    return respond("Error occurred while sending approval request", true, {}, 500);
  }
}

export async function getProdApprovals():Promise<IResponse>{
    try {
        await connectDB();
        const prodApprovals = await ProdApproval.find()
        .populate({path:'production', populate:{path:'productToProduce'}})
        .populate('createdBy')
        .populate('approver')
        .populate('org') as unknown as IProdApproval[];
        return respond('Production approvals found successfully', false, prodApprovals, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching Production approvals', true, {}, 500);
    }
}


export async function getProdApprovalsByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const prodApprovals = await ProdApproval.find({ org: orgId })
        .populate({path:'production', populate:{path:'productToProduce'}})
        .populate('createdBy')
        .populate('approver')
        .populate('org') as unknown as IProdApproval[];
        return respond('Production approvals found successfully', false, prodApprovals, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching Production approvals', true, {}, 500);
    }
}


export async function updateProdApproval(data:Partial<IProdApproval>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedProdApproval = await ProdApproval.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Production approval updated successfully', false, updatedProdApproval, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating Production approval', true, {}, 500);
    }
}

export async function getProdApproval(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const check = await verifyOrgAccess(ProdApproval, id, "ProdApproval",
            [
                { path: "production" },
                { path: "createdBy" },
                { path: "approver" },
                { path: "org" },
            ]);
        
        if ("allowed" in check === false) return check;
        const prodApproval = check.doc;
        return respond("Production approval retrieved successfully", false, prodApproval, 200);
    } catch (error) {
        console.log(error);
        return respond("Error occured retrieving Production approval", true, {}, 500);
    }
}

export async function deleteProdApproval(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedProdApproval = await ProdApproval.deleteOne({ _id: id });
        return respond('Production approval deleted successfully', false, deletedProdApproval, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting Production approval', true, {}, 500);
    }
}