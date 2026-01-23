"use server";
import { IResponse, ISession, ISessionRole, OperationName } from "@/types/Types";
import { connectDB } from "../mongoose";
import {
  comparePassword,
  encryptPassword,
  respond,
  sendWelcomeEmail,
} from "../misc";
import User, { IUser } from "../models/user.model";
import { generatePassword } from "@/functions/helpers";
import Organization from "../models/org.model";
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import "../models/role.model";
import Forgot from "../models/forgot.model";
import { createSession, destroySession } from "../session";
import { IRole } from "../models/role.model";


function isRole(obj: unknown): obj is IRole {
  return !!obj && typeof obj === 'object' && 'permissions' in obj;
}


export async function createUser(data: Partial<IUser>): Promise<IResponse> {
  try {
    await connectDB();
    const user = await User.findOne({ email: data.email?.toLowerCase() });
    if (user) {
      return respond("User already exists", true, {}, 400);
    }
    const password = generatePassword(8);
    const hashedPassword = await encryptPassword(password);
    const userData: Partial<IUser> = {
      ...data,
      email: data?.email?.toLowerCase(),
      password: hashedPassword,
    };
    const [newUser, org] = await Promise.all([
      User.create(userData),
      Organization.findById(data.org),
    ]);
    await sendWelcomeEmail({
      to: data.email!,
      companyName: "Industra",
      companyInitials: "Industra",
      companyLogo:
        org?.logo ||
        "https://thumbs.dreamstime.com/b/real-estate-logo-home-house-simple-design-vector-icons-135196436.jpg",
      userName: data.name!,
      userEmail: data.email!,
      password: password,
      appUrl: "https://industra-app.vercel.app/",
      supportEmail:
        org?.email || "CCHelpDesk@consultntctech.com"?.toLowerCase(),
    });
    return respond("User created successfully", false, newUser, 201);
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
    const updatedUser = await User.findByIdAndUpdate(data._id, data, {
      new: true,
    });
    return respond("User updated successfully", false, updatedUser, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occured while updating user", true, {}, 500);
  }
}

export async function updateUserV2(data: Partial<IUser>): Promise<IResponse> {
  try {
    await connectDB();
    const user = await User.findByIdAndUpdate(data._id, data, {
      new: true,
    }).populate("roles");
    
      const sessionRoles: ISessionRole[] = (user?.roles ?? [])
      .filter(isRole) // filter only populated IRole objects
      .flatMap((role: IRole) =>
          role.permissions
          ? [
              {
                  tableid: role.permissions.tableid,
                  operations: role.permissions.operations.map(
                  (op: { name: string }) => ({ name: op.name })
                  ),
              },
              ]
          : []
      );

      // 4️⃣ Create session payload
      const sessionData: ISession = {
        _id: user._id.toString(),
        name: user.name,
        photo: user?.photo,
        email: user.email,
        org: user.org.toString(),
        roles: sessionRoles,
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
    const check = await verifyOrgAccess(User, id, "User", [{ path: "org" }]);
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

    // 1️⃣ Find user by email and populate roles
    const user = await User.findOne({
      email: data.email?.toLowerCase(),
    }).populate("roles");

    if (!user) {
      return respond("Invalid credentials", true, {}, 400);
    }

    // 2️⃣ Verify password
    const isMatch = await comparePassword(data.password!, user.password);
    if (!isMatch) {
      return respond("Invalid credentials", true, {}, 400);
    }

    const sessionRoles: ISessionRole[] = (user?.roles ?? [])
    .filter(isRole) // filter only populated IRole objects
    .flatMap((role: IRole) =>
        role.permissions
        ? [
            {
                tableid: role.permissions.tableid,
                operations: role.permissions.operations.map(
                (op: { name: string }) => ({ name: op.name })
                ),
            },
            ]
        : []
    );

    // 4️⃣ Create session payload
    const sessionData: ISession = {
      _id: user._id.toString(),
      name: user.name,
      photo: user?.photo,
      email: user.email,
      org: user.org.toString(),
      roles: sessionRoles,
    };

    // 5️⃣ Return session-ready data
    return respond("Logged in successfully", false, sessionData, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occurred while logging in user", true, {}, 500);
  }
}

export async function updateUserRoles(id: string): Promise<IResponse> {
  try {
    await connectDB();

    const user = (await User.findById(id).populate("roles").lean()) as unknown as IUser;

    if (!user) {
      await destroySession();
      return respond("User not found", true, {}, 404);
    }

    if (!user.hasRequestedUpdate) {
      return respond("User has not requested update", true, {}, 400);
    }

    // 🔑 Flatten permissions safely without `any`
    const sessionRoles: ISessionRole[] = (user.roles ?? [])
    .filter(isRole)
    .flatMap((role: IRole) =>
        role.permissions
        ? [
            {
                tableid: role.permissions.tableid,
                operations: role.permissions.operations
                .map((op: { name: string }) => {
                    // ✅ Only include valid OperationName values
                    if (['READ', 'CREATE', 'UPDATE', 'DELETE', 'APPROVE'].includes(op.name)) {
                    return { name: op.name as OperationName };
                    }
                    return null; // skip invalid
                })
                .filter((o): o is { name: OperationName } => o !== null),
            },
            ]
        : []
    );


    // ✅ Safe session payload
    const sessionData: ISession = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      photo: user.photo,
      org: user.org.toString(),
      roles: sessionRoles,
    };

    await createSession(sessionData);

    // Update flag
    await User.findByIdAndUpdate(
      user._id,
      { hasRequestedUpdate: false },
      { new: true }
    );

    return respond("Permissions updated", false, sessionData, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occurred while updating user", true, {}, 500);
  }
}