'use server'

import { IResponse, ISessionRole, OperationName } from "@/types/Types";
import Role, { IRole } from "../models/role.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/user.model'
import '../models/org.model'
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import User, { IUser } from "../models/user.model";

function isRole(obj: unknown): obj is IRole {
  return !!obj && typeof obj === 'object' && 'permissions' in obj;
}

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
        await User.updateMany({roles:data._id}, {hasRequestedUpdate:true});
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


export async function getUserPermissions(userId: string): Promise<IResponse> {
  try {
    await connectDB();
    const user = await User.findById(userId).select('roles').populate('roles').lean() as unknown as IUser | null;
    if (!user) return respond('User not found', true, [], 404);

    const roles: ISessionRole[] = (user.roles ?? [])
      .filter(isRole)
      .flatMap((role: IRole) =>
        role.permissions
          ? [{
              tableid: role.permissions.tableid,
              operations: role.permissions.operations
                .map((op: { name: string }) =>
                  ['READ','CREATE','UPDATE','DELETE','APPROVE'].includes(op.name)
                    ? { name: op.name as OperationName }
                    : null
                )
                .filter((o): o is { name: OperationName } => o !== null),
            }]
          : []
      );

    await User.findByIdAndUpdate(userId, { hasRequestedUpdate: false }); // <-- reset here

    return respond('Permissions fetched successfully', false, roles, 200);
  } catch (error) {
    console.log(error);
    return respond('Error occured while fetching permissions', true, [], 500);
  }
}

export async function checkRolesUpdated(userId: string): Promise<IResponse> {
  try {
    await connectDB();
    const user = await User.findById(userId).select('hasRequestedUpdate').lean() as unknown as { hasRequestedUpdate: boolean } | null;
    return respond('ok', false, { dirty: !!user?.hasRequestedUpdate }, 200);
  } catch (error) {
    console.log(error);
    return respond('Error occured checking role status', true, {}, 500);
  }
}