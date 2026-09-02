'use server'

import { IResponse } from "@/types/Types";
import { connectDB } from "../mongoose";
import { respond } from "../misc";
import EType, { IEType } from "../models/etype.model";
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import Equipment from "../models/equipment.model";
import '../models/org.model';
import '../models/user.model';
import '../models/ecategory.model'


async function attachEquipmentCounts(types: IEType[]): Promise<IEType[]> {
  const typeIds = types.map(t => t._id);

  const counts = await Equipment.aggregate([
    { $match: { type: { $in: typeIds } } },
    {
      $group: {
        _id: { type: '$type', status: '$status' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Build a map: typeId -> { Available, 'In Use', Maintenance }
  const countMap = new Map<string, Record<string, number>>();
  for (const c of counts) {
    const idStr = c._id.type.toString();
    const status = c._id.status as string;
    if (!countMap.has(idStr)) {
      countMap.set(idStr, { Available: 0, 'In Use': 0, Maintenance: 0 });
    }
    countMap.get(idStr)![status] = c.count;
  }

  return types.map(type => {
    const idStr = type._id.toString();
    const statusCounts = countMap.get(idStr) ?? { Available: 0, 'In Use': 0, Maintenance: 0 };
    const qAvailable = statusCounts.Available ?? 0;
    const qInUse = statusCounts['In Use'] ?? 0;
    const qMaintenance = statusCounts.Maintenance ?? 0;

    return {
      ...type,
      qAvailable,
      qInUse,
      qMaintenance,
      qTotal: qAvailable + qInUse + qMaintenance,
    };
  });
}

export async function createEType(tp: Partial<IEType>): Promise<IResponse> {
    try {
        await connectDB();
        const newType = await EType.create(tp);
        return respond('Type created successfully', false, newType, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating equipment type', true, {}, 500);
    }
}


export async function getETypes(): Promise<IResponse> {
  try {
    await connectDB();

    const types = await EType.find()
      .populate('createdBy')
      .populate('category')
      .populate('org')
      .lean() as unknown as IEType[];

    const typesWithCounts = await attachEquipmentCounts(types);

    return respond('Types found successfully', false, typesWithCounts, 200);
  } catch (error) {
    console.log(error);
    return respond('Error occured while fetching equipment types', true, {}, 500);
  }
}

export async function getETypesByOrg(orgId: string): Promise<IResponse> {
  try {
    await connectDB();

    const types = await EType.find({ org: orgId })
      .populate('createdBy')
      .populate('category')
      .populate('category')
      .populate('org')
      .lean() as unknown as IEType[];

    const typesWithCounts = await attachEquipmentCounts(types);

    return respond('Types found successfully', false, typesWithCounts, 200);
  } catch (error) {
    console.log(error);
    return respond('Error occured while fetching equipment types', true, {}, 500);
  }
}

export async function getETypesByCategory(categoryId: string): Promise<IResponse> {
  try {
    await connectDB();
    const types = await EType.find({ category: categoryId })
      .populate('createdBy')
      .populate('category')
      .populate('org')
      .lean() as unknown as IEType[];
    return respond('Types found successfully', false, types, 200);
  } catch (error) {
    console.log(error);
    return respond('Error occured while fetching equipment types', true, {}, 500);
  }
}



export async function getETypeById(id: string): Promise<IResponse> {
    try {
        await connectDB();
        const check = await verifyOrgAccess(EType, id, "EType", [{ path: "org" }, { path: "createdBy" }, { path: "category" }]);
        if ("allowed" in check === false) return check;
        const type = check.doc;
        return respond('Type found successfully', false, type, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching equipment type', true, {}, 500);
    }
}


export async function updateEType(tp: Partial<IEType>): Promise<IResponse> {
    try {
        await connectDB();
        const updatedType = await EType.findByIdAndUpdate(tp._id, tp, { new: true });
        return respond('Type updated successfully', false, updatedType, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating equipment type', true, {}, 500);
    }
}


export async function deleteEType(id: string): Promise<IResponse> {
    try {
        await connectDB();
        const deletedType = await EType.deleteOne({ _id: id });
        return respond('Equipment type deleted successfully', false, deletedType, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting equipment type', true, {}, 500);
    }
}