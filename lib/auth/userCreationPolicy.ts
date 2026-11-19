// Server-side rule for who may create user accounts.
//
//  - System-admin org users may create users in any organization.
//  - Everyone else may only create users in their own organization, and only
//    when that organization has `canCreateUsers` switched on — this applies to
//    global admins too. (Editing / deleting users is not affected.)
import { isValidObjectId } from "mongoose";
import { IResponse } from "@/types/Types";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import Organization from "../models/org.model";
import { resolveServerAccess, ServerAccess } from "./serverPermissions";

export const USER_CREATION_DISABLED_MESSAGE =
  "Your organization is not allowed to create user accounts. Contact the platform administrator.";

/**
 * Returns `{ access }` when the caller may create a user in `targetOrgId`
 * (and has one of `permissionOps` on the Users table), otherwise an error response.
 */
export async function authorizeUserCreation(
  targetOrgId: unknown,
  permissionOps: ("CREATE" | "UPDATE")[] = ["CREATE"],
): Promise<{ access: ServerAccess } | { error: IResponse }> {
  const access = await resolveServerAccess();
  if (!access) return { error: respond("Unauthorized access. Please log in.", true, {}, 401) };

  if (!permissionOps.some((op) => access.can("38", op))) {
    return { error: respond("You do not have permission to create users", true, {}, 403) };
  }

  const target = String(targetOrgId ?? "");
  if (!isValidObjectId(target)) return { error: respond("Organization is required", true, {}, 400) };

  if (access.isSystemAdmin) return { access };

  if (target !== String(access.session.org)) {
    return { error: respond("You can only create users in your own organization", true, {}, 403) };
  }

  await connectDB();
  const org = await Organization.findById(target).select("canCreateUsers").lean<{ canCreateUsers?: boolean }>();
  if (!org) return { error: respond("Organization not found", true, {}, 404) };
  // Missing field (older orgs) means the default: allowed.
  if (org.canCreateUsers === false) return { error: respond(USER_CREATION_DISABLED_MESSAGE, true, {}, 403) };

  return { access };
}
