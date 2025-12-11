'use server'

import { IResponse } from "@/types/Types";
import Role, { IRole } from "../models/role.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/user.model'
import '../models/org.model'
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";

export async function createRole(data:Partial<IRole>):Promise<IResponse>{
    try {
        await connectDB();
        const role = await Role.create(data);
        return respond('Role created successfully', false, role, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating role', true, {}, 500);
    }
}

export async function getRoles():Promise<IResponse>{
    try {
        await connectDB();
        const roles = await Role.find()
        .populate('org')
        .populate('createdBy')
        .lean() as unknown as IRole[];
        return respond('Roles found successfully', false, roles, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching roles', true, {}, 500);
    }
}

export async function getRolesByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const roles = await Role.find({ org: orgId })
        .populate('org')
        .populate('createdBy')
        .lean() as unknown as IRole[];
        return respond('Roles found successfully', false, roles, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching roles', true, {}, 500);
    }
}


export async function updateRole(data:Partial<IRole>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedRole = await Role.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Role updated successfully', false, updatedRole, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating role', true, {}, 500);
    }
}

export async function getRole(id: string): Promise<IResponse> {
  try {
    await connectDB();

    const check = await verifyOrgAccess(Role, id, "Role");

    // If not allowed, return the middleware's response directly
    if ("allowed" in check === false) return check;

    // Authorized → you can use check.doc safely, fully typed as Role
    const role = check.doc;

    return respond("Role retrieved successfully", false, role, 200);
  } catch (error) {
    console.error(error);
    return respond("Error occurred retrieving role", true, {}, 500);
  }
}

export async function deleteRole(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedRole = await Role.deleteOne({ _id: id });
        return respond('Role deleted successfully', false, deletedRole, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting role', true, {}, 500);
    }
}