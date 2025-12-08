'use server'

import { IResponse } from "@/types/Types";
import Organization, { IOrganization } from "../models/org.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import { getSession } from "../session";
// import { verifyOrgAccess } from "../middleware/verifyOrgAccess";

export async function createOrg(org:Partial<IOrganization>):Promise<IResponse>{
    try {
        await connectDB();
        const newOrg = await Organization.create(org);
        return respond('Organization created successfully', false, newOrg, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating organization', true, {}, 500);
    }
}

export async function getOrgs():Promise<IResponse>{
    try {
        await connectDB();
        const orgs = await Organization.find();
        return respond('Organizations found successfully', false, orgs, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching organizations', true, {}, 500);
    }
}

export async function getOrg(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const orgIds = ['68f8c19d786ede7566b3432c'];
        const [user, org] = await Promise.all([
            getSession(),
            Organization.findById(id)
        ])
        if(!user){
            return respond("You're not authenticated", true, {}, 422);
        }
        if(!org){
            return respond('Organization not found', true, {}, 404);
        }
        if(!orgIds.includes(String(user.org))){
            return respond("You don't have access to this organization", true, {}, 403);
        }
        
        return respond('Organization found successfully', false, org, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching organization', true, {}, 500);
    }
}


export async function getOrgById(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const org = await Organization.findById(id);
        return respond('Organization found successfully', false, org, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching organization', true, {}, 500);
    }
}

export async function updateOrg(org:Partial<IOrganization>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedOrg = await Organization.findByIdAndUpdate(org._id, org, { new: true });
        return respond('Organization updated successfully', false, updatedOrg, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating organization', true, {}, 500);
    }
}

export async function deleteOrg(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedOrg = await Organization.deleteOne({ _id: id });
        return respond('Organization deleted successfully', false, deletedOrg, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting organization', true, {}, 500);
    }
}