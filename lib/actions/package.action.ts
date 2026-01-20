'use server'

import { IDailyStats, IPackageStats, IResponse, IWeeklyStats } from "@/types/Types";
import Package, { IPackage } from "../models/package.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/org.model';
import '../models/user.model'
import '../models/good.model'
import '../models/batch.model'
import '../models/storage.model'
import '../models/proditem.model'
import '../models/product.model'
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import Good from "../models/good.model";
import PackApproval from "../models/packapproval.model";
import ProdItem from "../models/proditem.model";
import LineItem from "../models/lineitem.model";
import { getISOWeek, getISOWeekYear } from "@/functions/helpers";

export async function createPackage(data: Partial<IPackage>): Promise<IResponse> {
  const session = await (await connectDB()).startSession();

  try {
    session.startTransaction();

    // 1. Create the Package
    const newPackage = await Package.create([data], { session });
    const pkg = newPackage[0];

    await pkg.populate({
      path: "goods.goodId",
      populate: [
        { path: "batch" },
        { path: "production", populate: { path: "productToProduce" } }
      ]
    });

    // ---------------------------------------------------------
    // 2. Validate ALL goods in array
    // ---------------------------------------------------------
    if (!pkg.goods || pkg.goods.length === 0) {
      await session.abortTransaction();
      return respond("Goods list cannot be empty", true, {}, 400);
    }

    for (const g of pkg.goods) {
      const good = await Good.findById(g.goodId).session(session);

      if (!good) {
        await session.abortTransaction();
        return respond(`Good not found: ${g.goodId}`, true, {}, 404);
      }

      // Decrease quantityLeftToPackage by the amount used in package
      if (g.quantity > good.quantityLeftToPackage) {
        await session.abortTransaction();
        return respond(
          `Not enough quantityLeftToPackage for good: ${good._id}`,
          true,
          {},
          400
        );
      }

      await Good.findByIdAndUpdate(
        good._id,
        { $inc: { quantityLeftToPackage: -g.quantity } },
        { session }
      );
    }

    // ---------------------------------------------------------
    // 3. Update ProdItems (materials used)
    // ---------------------------------------------------------
    if (pkg.packagingMaterial && pkg.packagingMaterial.length > 0) {
      for (const material of pkg.packagingMaterial) {
        const prodItem = await ProdItem.findById(material.materialId).session(session);

        if (!prodItem) {
          await session.abortTransaction();
          return respond(`ProdItem not found: ${material.materialId}`, true, {}, 404);
        }

        const available = prodItem.stock - prodItem.used;

        if (material.quantity > available) {
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

    // -------------------------------------------------
    // 1. Load old package
    // -------------------------------------------------
    const oldPackage = await Package.findById(data._id)
      .lean()
      .session(session) as unknown as IPackage;

    if (!oldPackage) {
      await session.abortTransaction();
      return respond("Package not found", true, {}, 404);
    }

    const oldMaterials = oldPackage.packagingMaterial || [];
    const newMaterials = data.packagingMaterial || [];

    const oldGoods = oldPackage.goods || [];
    const newGoods = data.goods || [];

    // -------------------------------------------------
    // 2. Reverse OLD ProdItem usage
    // -------------------------------------------------
    for (const oldMat of oldMaterials) {
      await ProdItem.findByIdAndUpdate(
        oldMat.materialId,
        { $inc: { used: -oldMat.quantity } },
        { session }
      );
    }

    // -------------------------------------------------
    // 3. Apply NEW ProdItem usage (with stock check)
    // -------------------------------------------------
    for (const newMat of newMaterials) {
      const prodItem = await ProdItem.findById(newMat.materialId).session(session);

      if (!prodItem) {
        await session.abortTransaction();
        return respond(
          `ProdItem not found: ${newMat.materialId}`,
          true,
          {},
          404
        );
      }

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

    // -------------------------------------------------
    // 4. Reverse OLD goods quantityLeftToPackage
    // -------------------------------------------------
    for (const oldG of oldGoods) {
      await Good.findByIdAndUpdate(
        oldG.goodId,
        { $inc: { quantityLeftToPackage: oldG.quantity } },
        { session }
      );
    }

    // -------------------------------------------------
    // 5. Apply NEW goods quantityLeftToPackage
    // -------------------------------------------------
    for (const newG of newGoods) {
      const good = await Good.findById(newG.goodId).session(session);

      if (!good) {
        await session.abortTransaction();
        return respond(`Good not found: ${newG.goodId}`, true, {}, 404);
      }

      if (newG.quantity > good.quantityLeftToPackage) {
        await session.abortTransaction();
        return respond(
          `Not enough quantityLeftToPackage for Good: ${good._id}`,
          true,
          {},
          400
        );
      }

      await Good.findByIdAndUpdate(
        good._id,
        { $inc: { quantityLeftToPackage: -newG.quantity } },
        { session }
      );
    }

    // -------------------------------------------------
    // 6. Update Package (materials + goods + other fields)
    // -------------------------------------------------
    const updatedPackage = await Package.findByIdAndUpdate(
      data._id,
      data,
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return respond(
      "Packaging materials updated successfully",
      false,
      updatedPackage,
      200
    );

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
        .populate({path:'goods', populate:{path:'goodId', populate:[{path:'batch'}, {path:'production', populate:{path:'productToProduce'}}]}})
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
        .populate({path:'goods', populate:{path:'goodId', populate:[{path:'batch'}, {path:'production', populate:{path:'productToProduce'}}]}})
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
        .populate({path:'goods', populate:{path:'goodId', populate:[{path:'batch'}, {path:'product'}, {path:'production', populate:{path:'productToProduce'}}]}})
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
        .populate({path:'goods', populate:{path:'goodId', populate:[{path:'batch'}, {path:'product'}, {path:'production', populate:{path:'productToProduce'}}]}})
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
  const session = await (await connectDB()).startSession();

  try {
    session.startTransaction();

    if (!data._id) {
      await session.abortTransaction();
      return respond("Package ID is required", true, {}, 400);
    }

    // 1. Find OLD package
    const oldPackage = await Package.findById(data._id).session(session);
    if (!oldPackage) {
      await session.abortTransaction();
      return respond("Package not found", true, {}, 404);
    }

    // 2. Reverse OLD materials usage
    const oldMaterials = oldPackage.packagingMaterial || [];

    for (const oldMat of oldMaterials) {
      await ProdItem.findByIdAndUpdate(
        oldMat.materialId,
        { $inc: { used: -oldMat.quantity } },
        { session }
      );
    }

    // 3. Apply NEW materials usage
    const newMaterials = data.packagingMaterial || [];

    for (const newMat of newMaterials) {
      const prodItem = await ProdItem.findById(newMat.materialId).session(session);

      if (!prodItem) {
        await session.abortTransaction();
        return respond(`ProdItem not found: ${newMat.materialId}`, true, {}, 404);
      }

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

    // 4. Update Good.quantityLeftToPackage if accepted changed
    if (typeof data.accepted === "number") {
      const good = await Good.findById(oldPackage.good).session(session);
      if (!good) {
        await session.abortTransaction();
        return respond("Good not found", true, {}, 404);
      }

      const diff = data.accepted - oldPackage.accepted;

      // if accepted increases, ensure good has enough quantity
      if (diff > 0 && diff > good.quantityLeftToPackage) {
        await session.abortTransaction();
        return respond(
          "Not enough quantityLeftToPackage available for this Good",
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

    // 5. Update the Package itself
    const updatedPackage = await Package.findByIdAndUpdate(
      data._id,
      data,
      { new: true, session }
    );

    // 6. Reset approval to pending
    await PackApproval.findOneAndUpdate(
      { package: data._id },
      { status: "Pending" },
      { new: true, session }
    );

    await session.commitTransaction();
    session.endSession();

    return respond("Package updated successfully", false, updatedPackage, 200);

  } catch (error) {
    console.log("Error updating package:", error);

    try {
      await session.abortTransaction();
    } catch {}

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
        { path: "goods", populate:{path:'goodId', populate:[{path:'batch'}, {path:'product'}, {path:'production', populate:{path:'productToProduce'}}]} },
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

export async function getLastSixMonthsPackages(): Promise<IResponse> {
    try {
        await connectDB();

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const packages = await Package.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                    quantity: { $ne: null }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    quantity: { $sum: "$quantity" }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            },
            {
                $project: {
                    _id: 0,
                    month: {
                        $dateToString: {
                            format: "%b",
                            date: {
                                $dateFromParts: {
                                    year: "$_id.year",
                                    month: "$_id.month",
                                    day: 1
                                }
                            }
                        }
                    },
                    quantity: 1
                }
            }
        ]);

        return respond(
            'Packages found successfully',
            false,
            packages,
            200
        );
    } catch (error) {
        console.error(error);
        return respond(
            'Error occurred while fetching packages',
            true,
            {},
            500
        );
    }
}


export async function getLastSixMonthsPackagesByOrg(org:string): Promise<IResponse> {
    try {
        await connectDB();

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const packages = await Package.aggregate([
            {
                $match: {
                    org,
                    createdAt: { $gte: sixMonthsAgo },
                    quantity: { $ne: null }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    quantity: { $sum: "$quantity" }
                }
            },
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            },
            {
                $project: {
                    _id: 0,
                    month: {
                        $dateToString: {
                            format: "%b",
                            date: {
                                $dateFromParts: {
                                    year: "$_id.year",
                                    month: "$_id.month",
                                    day: 1
                                }
                            }
                        }
                    },
                    quantity: 1
                }
            }
        ]);

        return respond(
            'Packages found successfully',
            false,
            packages,
            200
        );
    } catch (error) {
        console.error(error);
        return respond(
            'Error occurred while fetching packages',
            true,
            {},
            500
        );
    }
}




export async function getPackageStats(
  type: "quantity" | "price" = "quantity"
): Promise<IResponse> {
  try {
    await connectDB();

    const now = new Date();

    /* ======================================================
       DATE RANGES
    ====================================================== */

    const last7DaysStart = new Date(now);
    last7DaysStart.setDate(now.getDate() - 6);
    last7DaysStart.setHours(0, 0, 0, 0);

    const last7WeeksStart = new Date(now);
    last7WeeksStart.setDate(now.getDate() - 49);

    /* ======================================================
       1️⃣ PACKAGES WITH ALL LINE ITEMS = PENDING
    ====================================================== */

    const pendingPackagesAgg = await LineItem.aggregate([
      {
        $group: {
          _id: "$package",
          statuses: { $addToSet: "$status" },

          // 👇 status-aware price calculation
          totalPrice: {
            $sum: {
              $cond: [
                { $in: ["$status", ["Available", "Returned"]] },
                "$price",
                0
              ]
            }
          }
        }
      },
      {
        // At least one Available or Returned item
        $match: {
          statuses: { $in: ["Available", "Returned"] }
        }
      },
      {
        $group: {
          _id: null,
          value:
            type === "quantity"
              ? { $sum: 1 }            // count packages
              : { $sum: "$totalPrice" } // sum market value only
        }
      }
    ]);



    const pack =
      pendingPackagesAgg.length > 0 ? pendingPackagesAgg[0].value : 0;

    /* ======================================================
       2️⃣ DAILY PACKAGES (LAST 7 DAYS — ZERO FILLED)
    ====================================================== */

    const dailyAgg = await Package.aggregate([
      {
        $match: {
          createdAt: { $gte: last7DaysStart }
        }
      },
      {
        $lookup: {
          from: "lineitems",
          localField: "_id",
          foreignField: "package",
          as: "items"
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            dayOfWeek: { $dayOfWeek: "$createdAt" }
          },
          quantity:
            type === "quantity"
              ? { $sum: 1 }
              : { $sum: { $sum: "$items.price" } }
        }
      }
    ]);

    // Build last 7 days reference
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const daily: IDailyStats[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(last7DaysStart);
      d.setDate(d.getDate() + i);

      const dayName = dayNames[d.getDay()];
      const dateKey = d.toISOString().slice(0, 10);

      const found = dailyAgg.find(x => x._id.date === dateKey);

      daily.push({
        day: dayName,
        quantity: found ? found.quantity : 0
      });
    }

    /* ======================================================
       3️⃣ WEEKLY PACKAGES (LAST 7 WEEKS — ZERO FILLED)
    ====================================================== */

    const weeklyAgg = await Package.aggregate([
      {
        $match: {
          createdAt: { $gte: last7WeeksStart }
        }
      },
      {
        $lookup: {
          from: "lineitems",
          localField: "_id",
          foreignField: "package",
          as: "items"
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$createdAt" },
            week: { $isoWeek: "$createdAt" }
          },

          quantity:
            type === "quantity"
              ? { $addToSet: "$_id" } // unique packages
              : {
                  $sum: {
                    $cond: [
                      { $ne: ["$items.status", "Pending"] },
                      "$items.price",
                      0
                    ]
                  }
                }
        }
      },
      {
        // normalize quantity count
        $project: {
          quantity:
            type === "quantity"
              ? { $size: "$quantity" }
              : "$quantity"
        }
      }
    ]);


    // Build last 7 weeks reference
    const weekly: IWeeklyStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);

      const year = getISOWeekYear(d);
      const week = getISOWeek(d);
      const key = `W${week} ${year}`;

      const found = weeklyAgg.find(
        x => x._id.week === week && x._id.year === year
      );

      weekly.push({
        week: key,
        quantity: found ? found.quantity : 0
      });
    }

    /* ======================================================
       FINAL PAYLOAD
    ====================================================== */

    const payload: IPackageStats = {
      pack,
      daily,
      weekly
    };

    return respond(
      "Package stats fetched successfully",
      false,
      payload,
      200
    );
  } catch (error) {
    console.error(error);
    return respond(
      "Error occurred while fetching package stats",
      true,
      {},
      500
    );
  }
}


export async function getPackageStatsByOrg(
  org: string,
  type: "quantity" | "price" = "quantity"
): Promise<IResponse> {
  try {
    await connectDB();

    const now = new Date();

    /* ======================================================
       DATE RANGES
    ====================================================== */

    const last7DaysStart = new Date(now);
    last7DaysStart.setDate(now.getDate() - 6);
    last7DaysStart.setHours(0, 0, 0, 0);

    const last7WeeksStart = new Date(now);
    last7WeeksStart.setDate(now.getDate() - 49);

    /* ======================================================
       1️⃣ PACKAGES WITH ALL LINE ITEMS = PENDING
    ====================================================== */

    const pendingPackagesAgg = await LineItem.aggregate([
      {
        $group: {
          _id: "$package",
          statuses: { $addToSet: "$status" },

          // 👇 status-aware price calculation
          totalPrice: {
            $sum: {
              $cond: [
                { $in: ["$status", ["Available", "Returned"]] },
                "$price",
                0
              ]
            }
          }
        }
      },
      {
        // At least one Available or Returned item
        $match: {
          statuses: { $in: ["Available", "Returned"] },
          org
        }
      },
      {
        $group: {
          _id: null,
          value:
            type === "quantity"
              ? { $sum: 1 }            // count packages
              : { $sum: "$totalPrice" } // sum market value only
        }
      }
    ]);



    const pack =
      pendingPackagesAgg.length > 0 ? pendingPackagesAgg[0].value : 0;

    /* ======================================================
       2️⃣ DAILY PACKAGES (LAST 7 DAYS — ZERO FILLED)
    ====================================================== */

    const dailyAgg = await Package.aggregate([
      {
        $match: {
          createdAt: { $gte: last7DaysStart },
          org
        }
      },
      {
        $lookup: {
          from: "lineitems",
          localField: "_id",
          foreignField: "package",
          as: "items"
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            dayOfWeek: { $dayOfWeek: "$createdAt" }
          },
          quantity:
            type === "quantity"
              ? { $sum: 1 }
              : { $sum: { $sum: "$items.price" } }
        }
      }
    ]);

    // Build last 7 days reference
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const daily: IDailyStats[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(last7DaysStart);
      d.setDate(d.getDate() + i);

      const dayName = dayNames[d.getDay()];
      const dateKey = d.toISOString().slice(0, 10);

      const found = dailyAgg.find(x => x._id.date === dateKey);

      daily.push({
        day: dayName,
        quantity: found ? found.quantity : 0
      });
    }

    /* ======================================================
       3️⃣ WEEKLY PACKAGES (LAST 7 WEEKS — ZERO FILLED)
    ====================================================== */

    const weeklyAgg = await Package.aggregate([
      {
        $match: {
          createdAt: { $gte: last7WeeksStart }, org
        }
      },
      {
        $lookup: {
          from: "lineitems",
          localField: "_id",
          foreignField: "package",
          as: "items"
        }
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$createdAt" },
            week: { $isoWeek: "$createdAt" }
          },

          quantity:
            type === "quantity"
              ? { $addToSet: "$_id" } // unique packages
              : {
                  $sum: {
                    $cond: [
                      { $ne: ["$items.status", "Pending"] },
                      "$items.price",
                      0
                    ]
                  }
                }
        }
      },
      {
        // normalize quantity count
        $project: {
          quantity:
            type === "quantity"
              ? { $size: "$quantity" }
              : "$quantity"
        }
      }
    ]);


    // Build last 7 weeks reference
    const weekly: IWeeklyStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);

      const year = getISOWeekYear(d);
      const week = getISOWeek(d);
      const key = `W${week} ${year}`;

      const found = weeklyAgg.find(
        x => x._id.week === week && x._id.year === year
      );

      weekly.push({
        week: key,
        quantity: found ? found.quantity : 0
      });
    }

    /* ======================================================
       FINAL PAYLOAD
    ====================================================== */

    const payload: IPackageStats = {
      pack,
      daily,
      weekly
    };

    return respond(
      "Package stats fetched successfully",
      false,
      payload,
      200
    );
  } catch (error) {
    console.error(error);
    return respond(
      "Error occurred while fetching package stats",
      true,
      {},
      500
    );
  }
}



export async function getPackagedProductStats(
  type: "quantity" | "price" = "quantity"
): Promise<IResponse> {
  try {
    await connectDB();

    const valueField =
      type === "quantity"
        ? { $sum: 1 }
        : { $sum: "$price" };

    const stats = await LineItem.aggregate([
      {
        $match: {
          status: { $in: ["Available", "Returned"] },
          package: { $ne: null },
          product: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            package: "$package",
            product: "$product",
          },
          price: { $sum: "$price" },
        },
      },
      {
        $group: {
          _id: "$_id.product",
          quantity: valueField,
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          product: "$product.name",
          quantity: 1,
        },
      },
    ]);

    return respond("Packaged product stats fetched successfully", false, stats, 200);
  } catch (error) {
    console.error(error);
    return respond("Error occurred while fetching packaged product stats", true, [], 500);
  }
}


export async function getPackagedProductStatsByOrg(
  org: string,
  type: "quantity" | "price" = "quantity"
): Promise<IResponse> {
  try {
    await connectDB();

    const valueField =
      type === "quantity"
        ? { $sum: 1 }
        : { $sum: "$price" };

    const stats = await LineItem.aggregate([
      {
        $match: {
          status: { $in: ["Available", "Returned"] },
          package: { $ne: null },
          product: { $ne: null },
          org
        },
      },
      {
        $group: {
          _id: {
            package: "$package",
            product: "$product",
          },
          price: { $sum: "$price" },
        },
      },
      {
        $group: {
          _id: "$_id.product",
          quantity: valueField,
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          product: "$product.name",
          quantity: 1,
        },
      },
    ]);

    return respond("Packaged product stats fetched successfully", false, stats, 200);
  } catch (error) {
    console.error(error);
    return respond("Error occurred while fetching packaged product stats", true, [], 500);
  }
}





export async function deletePackage(id: string): Promise<IResponse> {
  const session = await (await connectDB()).startSession();

  try {
    session.startTransaction();

    // --------------------------------------------
    // 1. Find package
    // --------------------------------------------
    const pack = await Package.findById(id).session(session);
    if (!pack) {
      await session.abortTransaction();
      return respond("Package not found", true, {}, 404);
    }

    // Cannot delete if any sold LineItems reference this package
    const litems = await LineItem.find({ package: id, status: { $in: ["Sold", "Returned"]} })
      .session(session);

    if (litems.length > 0) {
      await session.abortTransaction();
      return respond(
        "You cannot delete this package. Package has sold items",
        true,
        {},
        400
      );
    }

    // --------------------------------------------
    // 2. Return used ProdItem quantities
    // --------------------------------------------
    if (pack.packagingMaterial && pack.packagingMaterial.length > 0) {
      for (const mat of pack.packagingMaterial) {
        await ProdItem.findByIdAndUpdate(
          mat.materialId,
          { $inc: { used: -mat.quantity } },
          { session }
        );
      }
    }

    // --------------------------------------------
    // 3. Return Good.quantityLeftToPackage
    // --------------------------------------------
    await Good.findByIdAndUpdate(
      pack.good,
      { $inc: { quantityLeftToPackage: pack.accepted } },
      { session }
    );

    // --------------------------------------------
    // 4. Delete the package itself
    // --------------------------------------------
    const deletedPackage = await Package.deleteOne({ _id: id }).session(session);

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

