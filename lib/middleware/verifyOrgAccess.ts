'use server'
import { Model, Document, PopulateOptions } from "mongoose";
import { respond } from "../misc";
import { getSession } from "../session";
import { ISession } from "@/types/Types";

interface HasOrg extends Document {
  org: string | object;
}

export async function verifyOrgAccess<T extends HasOrg>(
  model: Model<T>,
  id: string,
  modelName = "Resource",
  populate?:  PopulateOptions | (string | PopulateOptions)[]
): Promise<
  | { allowed: true; user: ISession; doc: T }
  | ReturnType<typeof respond>
> {
  // 1️⃣ Ensure user is logged in
  const user = await getSession();
  if (!user) {
    return respond("Unauthorized access. Please log in.", true, {}, 401);
  }

  // 2️⃣ Fetch the document, optionally with population
  let query = model.findById(id);
  if (populate) query = query.populate(populate);
  const doc = await query.exec();

  if (!doc) {
    return respond(`${modelName} not found`, true, {}, 404);
  }

  // 3️⃣ Check organization match
  const userOrgId = String(user.org);
  const docOrgId = String(doc.org);

  if (userOrgId !== docOrgId) {
    return respond(`Forbidden: You do not have access to this ${modelName}`, true, {}, 403);
  }

  // ✅ Access granted
  return { allowed: true, user, doc };
}