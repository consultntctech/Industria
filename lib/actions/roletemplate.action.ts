'use server';

import { IResponse } from "@/types/Types";
import RoleTemplate, { IRoleTemplate } from "../models/roletemplate.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/user.model'
import '../models/org.model'
import '../models/role.model'
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";

export async function createRoleTemplate(data:Partial<IRoleTemplate>):Promise<IResponse>{
    try {
        await connectDB();
        const roleTemplate = await RoleTemplate.create(data);
        return respond('Role template created successfully', false, roleTemplate, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating role template', true, {}, 500);
    }
}

export async function getRoleTemplates():Promise<IResponse>{
    try {
        await connectDB();
        const roleTemplates = await RoleTemplate.find()
        .populate('org')
        .populate('roles')
        .populate('createdBy')
        .lean() as unknown as IRoleTemplate[];
        return respond('Role templates found successfully', false, roleTemplates, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching role templates', true, {}, 500);
    }
}

export async function getRoleTemplatesByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const roleTemplates = await RoleTemplate.find({ org: orgId })
        .populate('org')
        .populate('roles')
        .populate('createdBy')
        .lean() as unknown as IRoleTemplate[];
        return respond('Role templates found successfully', false, roleTemplates, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching role templates', true, {}, 500);
    }
}

export async function updateRoleTemplate(data:Partial<IRoleTemplate>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedRoleTemplate = await RoleTemplate.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Role template updated successfully', false, updatedRoleTemplate, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating role template', true, {}, 500);
    }
}


export async function getRoleTemplate(id: string): Promise<IResponse> {
  try {
    await connectDB();

    const check = await verifyOrgAccess(RoleTemplate, id, "RoleTemplate");

    // If not allowed, return the middleware's response directly
    if ("allowed" in check === false) return check;

    // Authorized → you can use check.doc safely, fully typed as RoleTemplate
    const roleTemplate = check.doc;

    return respond("RoleTemplate retrieved successfully", false, roleTemplate, 200);
  } catch (error) {
    console.error(error);
    return respond("Error occurred retrieving roleTemplate", true, {}, 500);
  }
}

export async function deleteRoleTemplate(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedRoleTemplate = await RoleTemplate.deleteOne({ _id: id });
        return respond('Role template deleted successfully', false, deletedRoleTemplate, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting role template', true, {}, 500);
    }
}