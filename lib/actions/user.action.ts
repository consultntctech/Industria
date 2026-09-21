"use server";
import { IResponse, ISession } from "@/types/Types";
import { connectDB } from "../mongoose";
import {
  comparePassword,
  DepartmentRef,
  encryptPassword,
  respond,
  RoleRef,
  sendWelcomeEmail,
  toIdString,
  toIdStrings,
} from "../misc";
import User, { IUser } from "../models/user.model";
import { generatePassword } from "@/functions/helpers";
import Organization from "../models/org.model";
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import "../models/role.model";
import Forgot from "../models/forgot.model";
import Department, { IDepartment } from "../models/department.model";
import { Types } from "mongoose";
import Employee from "../models/employee.model";
// import { createSession, destroySession } from "../session";
// import { IRole } from "../models/role.model";


// function isRole(obj: unknown): obj is IRole {
//   return !!obj && typeof obj === 'object' && 'permissions' in obj;
// }




export async function applyDepartmentRoleSwap(data: Partial<IUser>): Promise<void> {
  // No department change requested -> nothing to do.
  if (data.department === undefined) return;

  const existingUser = await User.findById(data._id).lean<IUser>();
  if (!existingUser) return;

  const oldDeptId = toIdString(existingUser.department as DepartmentRef | undefined);
  const newDeptId = toIdString(data.department as DepartmentRef);

  // Same department as before -> nothing to do.
  if (oldDeptId && newDeptId && oldDeptId === newDeptId) return;

  const [oldDept, newDept] = await Promise.all([
    oldDeptId ? Department.findById(oldDeptId).lean<IDepartment>() : null,
    newDeptId ? Department.findById(newDeptId).lean<IDepartment>() : null,
  ]);

  const oldDeptRoleIds = new Set(toIdStrings(oldDept?.roles as RoleRef[] | undefined));
  const newDeptRoleIds = toIdStrings(newDept?.roles as RoleRef[] | undefined);
  const currentRoleIds = toIdStrings(existingUser.roles as RoleRef[] | undefined);
  const directRoleIds = currentRoleIds.filter((id) => !oldDeptRoleIds.has(id));
  const mergedRoleIds = Array.from(new Set([...directRoleIds, ...newDeptRoleIds]));

  data.roles = mergedRoleIds.map((id) => new Types.ObjectId(id));
}



export async function createUser(data: Partial<IUser>): Promise<IResponse> {
  let createdUserId: string | undefined;
  let employeeId: string | undefined;

  try {
    await connectDB();

    const existing = await User.findOne({ email: data.email?.toLowerCase() });
    if (existing) {
      return respond("User already exists", true, {}, 400);
    }

    const department = await Department.findById(data.department);
    if (!department) return respond("Department not found", true, {}, 400);

    const password = generatePassword(8);
    const hashedPassword = await encryptPassword(password);

    const userData: Partial<IUser> = {
      ...data,
      email: data?.email?.toLowerCase(),
      password: hashedPassword,
      roles: department.roles,
    };

    const [newUser, org] = await Promise.all([
      User.create(userData),
      Organization.findById(data.org),
    ]);

    createdUserId = newUser._id.toString();
    const exEmployee = await Employee.findOne({ email: data.email?.toLowerCase() });
    if(!exEmployee){
      const employee = await Employee.create({
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        photo: data.photo,
        department: department._id,
        userAccount: newUser._id,
        description: data.description,
        creator: data.creator,
        org: data.org,
      });
      employeeId = employee._id.toString();
    }

    try {
      await sendWelcomeEmail({
        to: data.email!,
        companyName: "Industra",
        companyInitials: "Industra",
        companyLogo:
          org?.logo ||
          "https://thumbs.dreamstime.com/b/real-estate-logo-home-house-simple-design-vector-icons-135196436.jpg",
        userName: data.name!,
        userEmail: data.email!,
        password,
        appUrl: "https://industra-app.vercel.app/",
        supportEmail: org?.email || 'akwaaba@sesatechafrica.com',
      });
      
    } catch (emailError) {
      // Compensating action: undo the user creation since the email leg failed
      console.log("Welcome email failed, rolling back user creation:", emailError);
      await Promise.all([
        User.deleteOne({ _id: createdUserId }),
        Employee.deleteOne({ _id: employeeId })
      ]);
      return respond(
        "Failed to send email. Error occured while creating user",
        true,
        {},
        500
      );
    }

    return respond(
      "User created successfully. Have the user check their inbox/spam folder for the welcome email",
      false,
      newUser,
      201
    );
  } catch (error) {
    console.log(error);
    return respond("Error occured while creating user", true, {}, 500);
  }
}

export async function getUsers(): Promise<IResponse> {
  try {
    await connectDB();
    const users = (await User.find()
      .populate("org")
      .populate("department")
      .populate("roles")
      .lean()) as unknown as IUser[];
    return respond("Users found successfully", false, users, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occured while fetching users", true, {}, 500);
  }
}

export async function getUsersByOrg(orgId: string): Promise<IResponse> {
  try {
    await connectDB();
    const users = (await User.find({ org: orgId })
      .populate("org")
      .populate("department")
      .populate("roles")
      .lean()) as unknown as IUser[];
    return respond("Users found successfully", false, users, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occured while fetching users", true, {}, 500);
  }
}


export async function getUsersByDepartment(departmentId: string): Promise<IResponse> {
  try {
    await connectDB();
    const users = (await User.find({ department: departmentId })
      .populate("org")
      .populate("department")
      .populate("roles")
      .lean()) as unknown as IUser[];
    return respond("Users found successfully", false, users, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occured while fetching users", true, {}, 500);
  }
}


export async function updateAllUsers(
  data: Partial<IUser>[],
): Promise<IResponse> {
  try {
    await connectDB();
    const users = await User.updateMany({}, data);
    return respond("Users found successfully", false, users, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occured while fetching users", true, {}, 500);
  }
}

export async function updateUser(data: Partial<IUser>): Promise<IResponse> {
  try {
    await connectDB();
    await applyDepartmentRoleSwap(data);
    const empData = {
      name: data.name,
      address: data.address,
      phone: data.phone,
      email: data.email,
      photo: data.photo,
      department: data.department,
      userAccount: data._id,
      description: data.description,
      creator: data.creator,
      org: data.org,
    }
    const [updatedUser] = await Promise.all([
      User.findByIdAndUpdate(data._id, data, {new: true,}),
      Employee.findOneAndUpdate({email:data.email?.toLowerCase()}, empData, {new: true,}),
    ]);
    return respond("User updated successfully", false, updatedUser, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occured while updating user", true, {}, 500);
  }
}

export async function updateUserV2(data: Partial<IUser>): Promise<IResponse> {
  try {
    await connectDB();
    await applyDepartmentRoleSwap(data);
    const empData = {
      name: data.name,
      address: data.address,
      phone: data.phone,
      email: data.email,
      photo: data.photo,
      department: data.department,
      userAccount: data._id,
      description: data.description,
      creator: data.creator,
      org: data.org,
    }
    const [user] = await Promise.all([
      User.findByIdAndUpdate(data._id, data, { new: true }),
      Employee.findOneAndUpdate({email:data.email?.toLowerCase()}, empData, { new: true }),
    ]);

    const sessionData: ISession = {
      _id: user._id.toString(),
      name: user.name,
      photo: user?.photo,
      email: user.email,
      org: user.org.toString(),
    };

    return respond("User updated successfully", false, sessionData, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occured while updating user", true, {}, 500);
  }
}

export async function AssignRolesToUsers(
  userIds: string[],
  roleIds: string[],
): Promise<IResponse> {
  try {
    await connectDB();

    const updatedUser = await User.updateMany(
      { _id: { $in: userIds } },
      { $addToSet: { roles: { $each: roleIds } }, hasRequestedUpdate: true },
    );

    return respond("Roles assigned successfully", false, updatedUser, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occurred while assigning roles", true, {}, 500);
  }
}

export async function getUser(id: string): Promise<IResponse> {
  try {
    await connectDB();
    const check = await verifyOrgAccess(User, id, "User", [{ path: "org" }, { path: "department" }, { path: "roles" }]);
    if ("allowed" in check === false) return check;
    const user = check.doc;
    return respond("User retrieved successfully", false, user, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occured retrieving user", true, {}, 500);
  }
}

export async function deleteUser(id: string): Promise<IResponse> {
  try {
    await connectDB();
    const deletedUser = await User.deleteOne({ _id: id });
    return respond("User deleted successfully", false, deletedUser, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occured while deleting user", true, {}, 500);
  }
}

export async function changePassword(data: Partial<IUser>): Promise<IResponse> {
  try {
    await connectDB();
    if (!data?.password) {
      return respond("Password is required", true, {}, 400);
    }
    const hashedPassword = await encryptPassword(data?.password);
    const updatedUser = await User.findByIdAndUpdate(
      data._id,
      { password: hashedPassword },
      { new: true },
    );
    const userData: Partial<IUser> = {
      ...updatedUser,
      password: "",
    };
    return respond("Password changed successfully", false, userData, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occured while changing password", true, {}, 500);
  }
}

export async function changePasswordByEmail(
  email: string,
  newPassword: string,
): Promise<IResponse> {
  try {
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return respond("No user found with that email", true, {}, 400);
    }
    const hashedPassword = await encryptPassword(newPassword);
    await User.findByIdAndUpdate(
      user._id,
      { password: hashedPassword },
      { new: true },
    );
    await Forgot.deleteOne({ email });

    return respond(
      "Password changed successfully. Use the new password to login.",
      false,
      {},
      200,
    );
  } catch (error) {
    // console.log(error);
    return respond("Error occured while changing password", true, {}, 500);
  }
}

export async function loginUser(data: Partial<IUser>): Promise<IResponse> {
  try {
    await connectDB();
    const user = await User.findOne({ email: data.email?.toLowerCase() });
    if (!user) return respond("Invalid credentials", true, {}, 400);

    const isMatch = await comparePassword(data.password!, user.password);
    if (!isMatch) return respond("Invalid credentials", true, {}, 400);

    const sessionData: ISession = {
      _id: user._id.toString(),
      name: user.name,
      photo: user?.photo,
      email: user.email,
      org: user.org.toString(),
    };

    return respond("Logged in successfully", false, sessionData, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occurred while logging in user", true, {}, 500);
  }
}

// export async function updateUserRoles(id: string): Promise<IResponse> {
//   try {
//     await connectDB();

//     const user = (await User.findById(id).populate("roles").lean()) as unknown as IUser;

//     if (!user) {
//       await destroySession();
//       return respond("User not found", true, {}, 404);
//     }

//     if (!user.hasRequestedUpdate) {
//       return respond("User has not requested update", true, {}, 400);
//     }

//     // 🔑 Flatten permissions safely without `any`
//     const sessionRoles: ISessionRole[] = (user.roles ?? [])
//     .filter(isRole)
//     .flatMap((role: IRole) =>
//         role.permissions
//         ? [
//             {
//                 tableid: role.permissions.tableid,
//                 operations: role.permissions.operations
//                 .map((op: { name: string }) => {
//                     // ✅ Only include valid OperationName values
//                     if (['READ', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE'].includes(op.name)) {
//                     return { name: op.name as OperationName };
//                     }
//                     return null; // skip invalid
//                 })
//                 .filter((o): o is { name: OperationName } => o !== null),
//             },
//             ]
//         : []
//     );


//     // ✅ Safe session payload
//     const sessionData: ISession = {
//       _id: user._id.toString(),
//       name: user.name,
//       email: user.email,
//       photo: user.photo,
//       org: user.org.toString(),
//       roles: sessionRoles,
//     };

//     await createSession(sessionData);

//     // Update flag
//     await User.findByIdAndUpdate(
//       user._id,
//       { hasRequestedUpdate: false },
//       { new: true }
//     );

//     return respond("Permissions updated", false, sessionData, 200);
//   } catch (error) {
//     console.log(error);
//     return respond("Error occurred while updating user", true, {}, 500);
//   }
// }