'use server';

import { isValidObjectId } from "mongoose";
import { IResponse } from "@/types/Types";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import { getSession } from "../session";
import User from "../models/user.model";
import OtherCurrency from "../models/othercurrency.model";

/** The signed-in user's preferred entry currency id (or null). */
export async function getMyCurrencyPreference(): Promise<IResponse> {
  try {
    const session = await getSession();
    if (!session) return respond("Unauthorized access. Please log in.", true, {}, 401);
    await connectDB();
    const user = await User.findById(session._id).select("preferredCurrency").lean<{ preferredCurrency?: unknown }>();
    const id = user?.preferredCurrency ? String(user.preferredCurrency) : null;
    return respond("Preference found", false, { currency: id }, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occured while fetching preference", true, {}, 500);
  }
}

/**
 * Save the signed-in user's entry currency. The user is taken from the session
 * (never from the client) and the currency must belong to the user's own org.
 */
export async function setMyCurrencyPreference(currencyId: string | null): Promise<IResponse> {
  try {
    const session = await getSession();
    if (!session) return respond("Unauthorized access. Please log in.", true, {}, 401);
    await connectDB();

    if (currencyId) {
      if (!isValidObjectId(currencyId)) return respond("Invalid currency", true, {}, 400);
      const exists = await OtherCurrency.exists({ _id: currencyId, org: session.org });
      if (!exists) return respond("Currency not found in your organization", true, {}, 404);
    }

    await User.updateOne({ _id: session._id }, { preferredCurrency: currencyId || null });
    return respond("Currency updated", false, { currency: currencyId || null }, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occured while saving preference", true, {}, 500);
  }
}
