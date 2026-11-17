// Server-side permission resolution. Never trust permissions sent from the
// browser: anything that gates data on the server resolves roles here, from
// the database, for the user in the signed session cookie.
import { Types } from "mongoose";
import { globalAdminTableId, systemAdminOrgId } from "@/Data/constants";
import { ISession, ISessionRole, OperationName } from "@/types/Types";
import { connectDB } from "../mongoose";
import { getSession } from "../session";
import User from "../models/user.model";
import "../models/role.model";

type PopulatedRole = {
  permissions?: { tableid: string; operations: { name: string }[] };
};

export type ServerAccess = {
  session: ISession;
  isSystemAdmin: boolean;
  isGlobalAdmin: boolean;
  roles: ISessionRole[];
  can: (tableId: string, operation?: OperationName) => boolean;
};

export async function resolveServerAccess(): Promise<ServerAccess | null> {
  const session = await getSession();
  if (!session?._id || !Types.ObjectId.isValid(session._id)) return null;

  await connectDB();
  const user = await User.findById(session._id)
    .select("roles org")
    .populate({ path: "roles", select: "permissions" })
    .lean<{ roles?: PopulatedRole[]; org?: Types.ObjectId }>();

  if (!user) return null;

  // The org in the cookie must still match the user's org in the database.
  if (user.org && String(user.org) !== String(session.org)) return null;

  const roles: ISessionRole[] = (user.roles ?? [])
    .filter((r): r is Required<PopulatedRole> => !!r?.permissions)
    .map((r) => ({
      tableid: r.permissions.tableid,
      operations: (r.permissions.operations ?? []).map((o) => ({ name: o.name as OperationName })),
    }));

  const isSystemAdmin = String(session.org) === systemAdminOrgId;
  const isGlobalAdmin = roles.some((r) => r.tableid === globalAdminTableId);

  const can = (tableId: string, operation: OperationName = "READ") =>
    isSystemAdmin ||
    isGlobalAdmin ||
    roles.some((r) => r.tableid === tableId && r.operations.some((o) => o.name === operation));

  return { session, isSystemAdmin, isGlobalAdmin, roles, can };
}
