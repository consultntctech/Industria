'use server'

import { IResponse } from "@/types/Types";
import Organization, { IOrganization } from "../models/org.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import { getSession } from "../session";
import Currency, { ICurrency } from "../models/currency.model";
import OtherCurrency from "../models/othercurrency.model";
import TransConfig from "../models/transconfig.model";
import { systemAdminOrgId } from "@/Data/constants";
import { isValidObjectId } from "mongoose";

/**
 * Strip fields that the org create/edit forms must never write:
 *  - Terms acceptance is only changed by acceptOrgTerms (the org's own admin
 *    accepting) and requestTermsReacceptance (system admin). Otherwise saving a
 *    form could mark the policy accepted, or undo a re-acceptance request.
 *  - Only the platform (system admin) org decides whether an organization may
 *    create users, and the system admin org itself can always create users.
 */
async function sanitizeOrgPayload(org: Partial<IOrganization>, targetId?: string): Promise<void> {
    const terms = org as Partial<IOrganization> & { termsAcceptedBy?: unknown };
    delete terms.hasAgreedTerms;
    delete terms.termsAcceptedAt;
    delete terms.termsVersion;
    delete terms.termsAcceptedBy;

    const session = await getSession();
    const callerIsSystemAdmin = String(session?.org) === systemAdminOrgId;
    if (!callerIsSystemAdmin || (targetId && String(targetId) === systemAdminOrgId)) {
        delete org.canCreateUsers;
    } else if (org.canCreateUsers !== undefined) {
        org.canCreateUsers = Boolean(org.canCreateUsers);
    }
}
// import { verifyOrgAccess } from "../middleware/verifyOrgAccess";

export async function createOrg(org:Partial<IOrganization>, currency:Partial<ICurrency>):Promise<IResponse>{
    try {
        await connectDB();
        await sanitizeOrgPayload(org);
        const newOrg = await Organization.create(org);
        const otherCurrency = {
            name: currency.name,
            symbol: currency.symbol,
            rate: 1,
            type: 'default',
            note: '',
            creator: currency.creator,
            org: newOrg._id,
        };
        const config = {
            salesOrder:{ useConfig:true, length:4, auto: true },
            invoice:{ useConfig:true, length:5, auto:true},
            org: newOrg._id,
            creator: currency?.creator ?? ''
        } 
        await Promise.all([
            Currency.create({...currency, org: newOrg._id}),
            OtherCurrency.create(otherCurrency),
            TransConfig.create(config)
        ]);
        return respond('Organization created successfully', false, newOrg, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating organization', true, {}, 500);
    }
}

export async function getOrgs():Promise<IResponse>{
    try {
        await connectDB();
        const orgs = await Organization.find();
        return respond('Organizations found successfully', false, orgs, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching organizations', true, {}, 500);
    }
}

export async function getOrg(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const orgIds = ['68f8c19d786ede7566b3432c'];
        const [user, org] = await Promise.all([
            getSession(),
            Organization.findById(id)
        ])
        if(!user){
            return respond("You're not authenticated", true, {}, 422);
        }
        if(!org){
            return respond('Organization not found', true, {}, 404);
        }
        if(!orgIds.includes(String(user?.org))){
            return respond("You don't have access to this organization", true, {}, 403);
        }
        
        return respond('Organization found successfully', false, org, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching organization', true, {}, 500);
    }
}


export async function getOrgById(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const org = await Organization.findById(id);
        return respond('Organization found successfully', false, org, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching organization', true, {}, 500);
    }
}

export async function updateOrg(org:Partial<IOrganization>):Promise<IResponse>{
    try {
        await connectDB();
        await sanitizeOrgPayload(org, org._id);
        const updatedOrg = await Organization.findByIdAndUpdate(org._id, org, { new: true });
        return respond('Organization updated successfully', false, updatedOrg, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating organization', true, {}, 500);
    }
}

export async function acceptOrgTerms(orgId: string): Promise<IResponse> {
  try {
    const session = await getSession();
    if (!session) return respond('You must be signed in', true, {}, 401);
    if (String(session.org) !== String(orgId)) return respond('Not allowed', true, {}, 403);

    await connectDB();
    await Organization.updateOne(
      { _id: orgId },
      {
        hasAgreedTerms: true,
        termsAcceptedAt: new Date(),
        termsAcceptedBy: session._id,
        termsVersion: '1.0',
      }
    );
    return respond('Policy accepted. You can find this policy in the footer of the application', false, {}, 200);
  } catch (error) {
    console.log(error);
    return respond('Error occured while saving your consent', true, {}, 500);
  }
}

/**
 * System admins only: clear an organization's policy acceptance so its admins
 * are asked to accept the (updated) privacy policy again.
 */
export async function requestTermsReacceptance(orgId: string): Promise<IResponse> {
  try {
    const session = await getSession();
    if (!session) return respond('You must be signed in', true, {}, 401);
    if (String(session.org) !== systemAdminOrgId) return respond('Only system administrators can do this', true, {}, 403);
    if (!isValidObjectId(orgId)) return respond('Invalid organization', true, {}, 400);

    await connectDB();
    const res = await Organization.updateOne({ _id: orgId }, { hasAgreedTerms: false });
    if (!res.matchedCount) return respond('Organization not found', true, {}, 404);
    return respond("The organization's admins will be asked to accept the updated policy", false, {}, 200);
  } catch (error) {
    console.log(error);
    return respond('Error occured while requesting policy acceptance', true, {}, 500);
  }
}



export async function deleteOrg(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedOrg = await Organization.deleteOne({ _id: id });
        return respond('Organization deleted successfully', false, deletedOrg, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting organization', true, {}, 500);
    }
}