'use server';

import { IResponse } from "@/types/Types";
import Department, { IDepartment } from "../models/department.model";
import { respond, RoleRef, toIdStrings } from "../misc";
import { connectDB } from "../mongoose";
import '../models/user.model'
import '../models/org.model'
import '../models/role.model'
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import Role from "../models/role.model";
import User, { IUser } from "../models/user.model";
import { Types } from "mongoose";

export async function createDepartment(data:Partial<IDepartment>):Promise<IResponse>{
    try {
        await connectDB();
        const department = await Department.create(data);
        return respond('Department created successfully', false, department, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating department', true, {}, 500);
    }
}

export async function getDepartments():Promise<IResponse>{
    try {
        await connectDB();
        const departments = await Department.find()
        .populate('org')
        .populate('head')
        .populate('createdBy')
        .lean() as unknown as IDepartment[];
        return respond('Departments found successfully', false, departments, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching departments', true, {}, 500);
    }
}


export async function removeUserFromDepartment(departmentId: string, userId: string): Promise<IResponse> {
  try {
    await connectDB();

    const department = await Department.findById(departmentId).lean<IDepartment>();
    if (!department) return respond("Department not found", true, [], 404);

    const user = await User.findById(userId).lean<IUser>();
    if (!user) return respond("User not found", true, [], 404);

    const deptRoleIdSet = new Set(toIdStrings(department.roles as RoleRef[] | undefined));
    const currentRoleIds = toIdStrings(user.roles as RoleRef[] | undefined);

    // Keep only roles NOT in the department's role set (directly assigned roles).
    const remainingRoleIds = currentRoleIds.filter(
      (roleId) => !deptRoleIdSet.has(roleId)
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        department: null,
        roles: remainingRoleIds.map((roleId) => new Types.ObjectId(roleId)),
      },
      { new: true }
    );

    return respond("User removed successfully", false, updatedUser, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occured while removing user from department", true, [], 500);
  }
}


export async function getDepartmentsByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const departments = await Department.find({ org: orgId })
        .populate('org')
        .populate('head')
        .populate('createdBy')
        .lean() as unknown as IDepartment[];
        return respond('Departments found successfully', false, departments, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching departments', true, {}, 500);
    }
}


export async function assignRolesToDepartments(
  departmentIds: string[],
  roleIds: string[]
): Promise<IResponse> {
  try {
    await connectDB();

    const departments = await Department.find({ _id: { $in: departmentIds } });
    if (departments.length === 0) return respond("Departments not found", true, [], 404);

    const roles = await Role.find({ _id: { $in: roleIds } });
    if (roles.length === 0) return respond("Roles not found", true, [], 404);

    const roleObjectIds = roles.map((role) => role._id);

    await Promise.all([
      Department.updateMany(
        { _id: { $in: departmentIds } },
        { $addToSet: { roles: { $each: roleObjectIds } } }
      ),
      User.updateMany(
        { department: { $in: departmentIds } },
        { $addToSet: { roles: { $each: roleObjectIds } } }
      ),
    ]);

    return respond("Roles assigned successfully", false, roles, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occured while assigning roles to departments", true, [], 500);
  }
}


export async function removeRolesFromDepartment (departmentId: string, roleIds: string[]): Promise<IResponse> {
    try {
        await connectDB();
        const department = await Department.findById(departmentId);
        if (!department) return respond('Department not found', true, [], 404);

        const roles = await Role.find({ _id: { $in: roleIds } });
        if (!roles) return respond('Roles not found', true, [], 404);

        await Promise.all([
            Department.findByIdAndUpdate(departmentId, { roles: roles.map((role) => role._id) }),
            User.updateMany({ department: departmentId }, { $pull: { roles: { $in: roles.map((role) => role._id) } } }),
        ]);
        return respond('Roles removed successfully', false, roles, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while removing roles from department', true, [], 500);
    }
}


export async function updateDepartment(data:Partial<IDepartment>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedDepartment = await Department.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Department updated successfully', false, updatedDepartment, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating department', true, {}, 500);
    }
}

export async function getDepartment(id: string): Promise<IResponse> {
  try {
    await connectDB();

    const check = await verifyOrgAccess(Department, id, "Department", [{ path: "org" }, { path: "createdBy" }, { path: "head" }, { path: "roles" }]);

    // If not allowed, return the middleware's response directly
    if ("allowed" in check === false) return check;

    // Authorized → you can use check.doc safely, fully typed as Department
    const department = check.doc;

    return respond("Department retrieved successfully", false, department, 200);
  } catch (error) {
    console.error(error);
    return respond("Error occurred retrieving department", true, {}, 500);
  }
}

export async function deleteDepartment(id: string): Promise<IResponse> {
  try {
    await connectDB();

    const department = await Department.findById(id).lean<IDepartment>();
    if (!department) {
      return respond("Department not found", true, {}, 404);
    }

    const deptRoleIdSet = new Set(toIdStrings(department.roles as RoleRef[] | undefined));

    const usersInDept = await User.find({ department: id }).lean<IUser[]>();

    if (usersInDept.length > 0) {
      const bulkOps = usersInDept.map((user) => {
        const currentRoleIds = toIdStrings(user.roles as RoleRef[] | undefined);

        const remainingRoleIds = currentRoleIds.filter(
          (roleId) => !deptRoleIdSet.has(roleId)
        );

        return {
          updateOne: {
            filter: { _id: user._id },
            update: {
              $set: {
                roles: remainingRoleIds.map((roleId) => new Types.ObjectId(roleId)),
              },
              $unset: { department: "" },
            },
          },
        };
      });

      await User.bulkWrite(bulkOps);
    }

    const deletedDepartment = await Department.deleteOne({ _id: id });
    return respond("Department deleted successfully", false, deletedDepartment, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occured while deleting department", true, {}, 500);
  }
}