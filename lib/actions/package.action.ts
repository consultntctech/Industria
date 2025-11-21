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
import ProdItem from "../models/proditem.model";

export async function createPackage(data: Partial<IPackage>): Promise<IResponse> {
  const session = await (await connectDB()).startSession();

  try {
    session.startTransaction();

    // 1. Create the Package
    const newPackage = await Package.create([data], { session });
    const pkg = newPackage[0];

    // 2. Validate Good
    const good = await Good.findById(data.good).session(session);
    if (!good) {
      await session.abortTransaction();
      return respond("Good not found", true, {}, 404);
    }

    // 3. Update Good quantityLeftToPackage
    await Good.findByIdAndUpdate(
      good._id,
      { $inc: { quantityLeftToPackage: -pkg.accepted } },
      { session }
    );

    // 4. Update ProdItems (materials used)
    if (pkg.packagingMaterial && pkg.packagingMaterial.length > 0) {
      for (const material of pkg.packagingMaterial) {
        const prodItem = await ProdItem.findById(material.materialId).session(session);

        if (!prodItem) {
          await session.abortTransaction();
          return respond(`ProdItem not found: ${material.materialId}`, true, {}, 404);
        }

        // Safety: prevent used > stock
        if (material.quantity > prodItem.stock - prodItem.used) {
          await session.abortTransaction();
          return respond(
            `Not enough stock for material ${prodItem.name}`,
            true,
            {},
            400
          );
        }

        // Update used count
        await ProdItem.findByIdAndUpdate(
          prodItem._id,
          { $inc: { used: material.quantity } },
          { session }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    return respond("Package created successfully", false, pkg, 201);

  } catch (error) {
    console.error("Error creating package:", error);

    try {
      await session.abortTransaction();
    } catch {}

    return respond("Error occurred while creating package", true, {}, 500);
  }
}


export async function updatePackagingMaterials(
  data: Partial<IPackage>
): Promise<IResponse> {
  const session = await (await connectDB()).startSession();

  try {
    session.startTransaction();

    // 1. Find old package
    const oldPackage = await Package.findById(data._id)
      .lean()
      .session(session) as unknown as IPackage;

    if (!oldPackage) {
      await session.abortTransaction();
      return respond("Package not found", true, {}, 404);
    }

    const oldMaterials = oldPackage.packagingMaterial || [];
    const newMaterials = data.packagingMaterial || [];

    // --------------------------------------------
    // 2. Reverse OLD ProdItem usage
    // --------------------------------------------
    for (const oldMat of oldMaterials) {
      await ProdItem.findByIdAndUpdate(
        oldMat.materialId,
        { $inc: { used: -oldMat.quantity } },
        { session }
      );
    }

    // --------------------------------------------
    // 3. Apply NEW ProdItem usage
    //    (We check that stock is sufficient before applying)
    // --------------------------------------------
    for (const newMat of newMaterials) {
      const prodItem = await ProdItem.findById(newMat.materialId).session(
        session
      );

      if (!prodItem) {
        await session.abortTransaction();
        return respond(
          `ProdItem not found: ${newMat.materialId}`,
          true,
          {},
          404
        );
      }

      // Safety: prevent using more than available
      const available = prodItem.stock - prodItem.used;
      if (newMat.quantity > available) {
        await session.abortTransaction();
        return respond(
          `Not enough stock for material: ${prodItem.name}`,
          true,
          {},
          400
        );
      }

      await ProdItem.findByIdAndUpdate(
        newMat.materialId,
        { $inc: { used: newMat.quantity } },
        { session }
      );
    }

    // --------------------------------------------
    // 4. Update Good quantityLeftToPackage 
    //    ONLY IF accepted is updated
    // --------------------------------------------
    if (data.accepted !== undefined) {
      const good = await Good.findById(oldPackage.good).session(session);
      if (!good) {
        await session.abortTransaction();
        return respond("Good not found", true, {}, 404);
      }

      const diff = data.accepted - oldPackage.accepted;

      // Prevent increasing beyond available
      if (diff > 0 && diff > good.quantityLeftToPackage) {
        await session.abortTransaction();
        return respond(
          "Not enough quantityLeftToPackage remaining for this Good",
          true,
          {},
          400
        );
      }

      await Good.findByIdAndUpdate(
        good._id,
        { $inc: { quantityLeftToPackage: -diff } },
        { session }
      );
    }

    // --------------------------------------------
    // 5. Update Package itself (other fields allowed)
    // --------------------------------------------
    const updatedPackage = await Package.findByIdAndUpdate(
      data._id,
      data,
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return respond("Packaging materials updated successfully", false, updatedPackage, 200);

  } catch (error) {
    console.error("Error updating packaging materials:", error);

    try {
      await session.abortTransaction();
    } catch {}

    return respond("Error occurred while updating package", true, {}, 500);
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
        .populate({
          path:'packagingMaterial',
          populate:{
            path:'materialId'
          }
        })
        .populate('createdBy')
        .populate('approvedBy')
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
        .populate('approvedBy')
        .populate('batch')
        .populate('storage')
        .populate({
          path:'packagingMaterial',
          populate:{
            path:'materialId'
          }
        })
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
        .populate({
          path:'packagingMaterial',
          populate:{
            path:'materialId'
          }
        })
        .populate('createdBy')
        .populate('approvedBy')
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
        .populate('approvedBy')
        .populate('batch')
        .populate('storage')
        .populate({
          path:'packagingMaterial',
          populate:{
            path:'materialId'
          }
        })
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
        { path: "good", populate:{path:'batch'} },
        { path: "supervisor" },
        { path: "createdBy" },
        { path: "org" },
        { path: "packagingMaterial", populate: { path: "materialId" } },
        { path: "storage" },
        { path: "batch" },
        { path: "approvedBy" },
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



export async function deletePackage(id: string): Promise<IResponse> {
  const session = await (await connectDB()).startSession();

  try {
    session.startTransaction();

    // 1. Find package
    const pack = await Package.findById(id).session(session);
    if (!pack) {
      await session.abortTransaction();
      return respond("Package not found", true, {}, 404);
    }

    // --------------------------------------------
    // 2. Return used ProdItem quantities
    // --------------------------------------------
    if (pack.packagingMaterial && pack.packagingMaterial.length > 0) {
      for (const material of pack.packagingMaterial) {
        await ProdItem.findByIdAndUpdate(
          material.materialId,
          { $inc: { used: -material.quantity } },
          { session }
        );
      }
    }

    // --------------------------------------------
    // 3. Return Good quantityLeftToPackage
    // --------------------------------------------
    await Good.findByIdAndUpdate(
      pack.good,
      { $inc: { quantityLeftToPackage: pack.accepted } },
      { session }
    );

    // --------------------------------------------
    // 4. Delete the package
    // --------------------------------------------
    const deletedPackage = await Package.deleteOne({ _id: id }).session(
      session
    );

    await session.commitTransaction();
    session.endSession();

    return respond(
      "Package deleted successfully",
      false,
      deletedPackage,
      200
    );
  } catch (error) {
    console.error("Error deleting package:", error);

    try {
      await session.abortTransaction();
    } catch {}

    return respond("Error occurred while deleting package", true, {}, 500);
  }
}
