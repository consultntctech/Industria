'use server'

import { IResponse } from "@/types/Types";
import Package, { IPackage } from "../models/package.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/org.model';
import '../models/user.model'
import '../models/good.model'
import '../models/batch.model'
import '../models/storage.model'
import '../models/proditem.model'
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import Good from "../models/good.model";
import PackApproval from "../models/packapproval.model";

export async function createPackage(data: Partial<IPackage>): Promise<IResponse> {
  try {
    await connectDB();

    const newPackage = await Package.create(data);
    const good = await Good.findById(data.good);

    if (!good) {
      return respond("Good not found", true, {}, 404);
    }

    // Update good's quantityLeftToPackage
    await Good.findByIdAndUpdate(good._id, {
      $inc: { quantityLeftToPackage: -newPackage.accepted },
    });
    return respond("Package created successfully", false, newPackage, 201);
  } catch (error) {
    console.error("Error creating package:", error);
    return respond("Error occurred while creating package", true, {}, 500);
  }
}


export async function getApprovedPackages():Promise<IResponse>{
    try {
        await connectDB();
        const packages = await Package.find({ approvalStatus: 'Approved', accepted: { $gt: 0 } })
        .populate({path:'good', populate:{path:'batch'}})
        .populate('supervisor')
        .populate('storage')
        .populate('batch')
        .populate('packagingMaterial')
        .populate('createdBy')
        .populate('org').lean() as unknown as IPackage[];
        return respond('Approved packages found successfully', false, packages, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching approved packages', true, {}, 500);
    }
}


export async function getApprovedPackagesByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const packages = await Package.find({ org: orgId, approvalStatus: 'Approved', accepted: { $gt: 0 } })
        .populate({path:'good', populate:{path:'batch'}})
        .populate('supervisor')
        .populate('createdBy')
        .populate('batch')
        .populate('storage')
        .populate('packagingMaterial')
        .populate('org').lean() as unknown as IPackage[];
        return respond('Approved packages found successfully', false, packages, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching approved packages', true, {}, 500);
    }
}



export async function getPackages():Promise<IResponse>{
    try {
        await connectDB();
        const packages = await Package.find()
        .populate({path:'good', populate:{path:'batch'}})
        .populate('supervisor')
        .populate('storage')
        .populate('batch')
        .populate('packagingMaterial')
        .populate('createdBy')
        .populate('org').lean() as unknown as IPackage[];
        return respond('Packages found successfully', false, packages, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching packages', true, {}, 500);
    }
}

export async function getPackagesByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const packages = await Package.find({ org: orgId })
        .populate({path:'good', populate:{path:'batch'}})
        .populate('supervisor')
        .populate('createdBy')
        .populate('batch')
        .populate('storage')
        .populate('packagingMaterial')
        .populate('org').lean() as unknown as IPackage[];
        return respond('Packages found successfully', false, packages, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching packages', true, {}, 500);
    }
}


export async function updatePackage(data: Partial<IPackage>): Promise<IResponse> {
  try {
    await connectDB();

    if (!data._id) {
      return respond("Package ID is required", true, {}, 400);
    }

    const oldPackage = await Package.findById(data._id);
    if (!oldPackage) {
      return respond("Package not found", true, {}, 404);
    }

    const updatedPackage = await Package.findByIdAndUpdate(data._id, data, { new: true });

    const good = await Good.findById(data.good);
    if (!good) {
      return respond("Good not found", true, {}, 404);
    }

    if (typeof data.accepted !== "number") {
      return respond("Accepted quantity is required", true, {}, 400);
    }

    // quantityLeftToPackage = oldAccepted - newAccepted
    const quantityDiff = oldPackage.accepted - data.accepted;

    // Update good quantity in ONE atomic update
    await Promise.all([
      Good.findByIdAndUpdate(good._id, {
        $inc: { quantityLeftToPackage: quantityDiff }
      }),
      PackApproval.findOneAndUpdate({package:data._id}, {status:'Pending'}, { new: true })
    ])

    return respond("Package updated successfully", false, updatedPackage, 200);

  } catch (error) {
    console.log(error);
    return respond("Error occurred while updating package", true, {}, 500);
  }
}


export async function updatePackageV2(data:Partial<IPackage>):Promise<IResponse>{
    try {
        await connectDB();
        const [updatedPackage] = await Promise.all([
          Package.findByIdAndUpdate(data._id, data, { new: true }),
          PackApproval.findOneAndUpdate({package:data._id}, {status:'Pending'}, { new: true })
        ])
        return respond('Package updated successfully', false, updatedPackage, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating package', true, {}, 500);
    }
}


export async function resubmitPackage(id:string):Promise<IResponse>{
    try {
        await connectDB();

        const [updatedPackage] = await Promise.all([
          Package.findByIdAndUpdate(id, {approvalStatus:'Pending'}, { new: true }),
          PackApproval.findOneAndUpdate({package:id}, {status:'Pending'}, { new: true })
        ])
        return respond('Package resubmitted successfully', false, updatedPackage, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while resubmitting package', true, {}, 500);
    }
}


export async function getPackage(id: string): Promise<IResponse> {
  try {
    await connectDB();

    const check = await verifyOrgAccess(Package, id, "Package",[
        { path: "good" },
        { path: "supervisor" },
        { path: "createdBy" },
        { path: "org" },
        { path: "packagingMaterial" },
        { path: "storage" },
        { path: "batch" },
    ]);

    // If not allowed, return the middleware's response directly
    if ("allowed" in check === false) return check;

    // Authorized → you can use check.doc safely, fully typed as Production
    const pack = check.doc;

    return respond("Package retrieved successfully", false, pack, 200);
  } catch (error) {
    console.error(error);
    return respond("Error occurred retrieving package", true, {}, 500);
  }
}

export async function deletePackage(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const pack = await Package.findById(id);
        if(!pack) return respond('Package not found', true, {}, 404);
        await Good.findByIdAndUpdate(pack.good, {$inc:{quantityLeftToPackage:pack.accepted}});
        const deletedPackage = await Package.deleteOne({ _id: id });
        return respond('Package deleted successfully', false, deletedPackage, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting package', true, {}, 500);
    }
}