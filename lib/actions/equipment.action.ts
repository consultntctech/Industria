'use server'

import { IResponse } from "@/types/Types";
import { connectDB } from "../mongoose";
import { respond } from "../misc";
import Equipment, { IEquipment } from "../models/equipment.model";
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import '../models/org.model';
import '../models/user.model';
import '../models/etype.model';
import '../models/storage.model';
import '../models/ecategory.model';
import { Types } from 'mongoose';
import { EquipmentStatus, IAllTimeAggregateResult, IAllTimeStatusCount, IEquipmentStatsPayload, IGroupedEquipmentAggregateResult, IGroupedEquipmentCount, IMonthlyAggregateResult, IMonthlyStatusCount } from "@/types/EquipmentTypes";

export async function createEquipment(eq:Partial<IEquipment>):Promise<IResponse>{
    try {
        await connectDB();
        const newEq = await Equipment.create(eq);
        return respond('Equipment created successfully', false, newEq, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating equipment', true, {}, 500);
    }
}

export async function getEquipments():Promise<IResponse>{
    try {
        await connectDB();
        const eqs = await Equipment.find()
        .populate('createdBy')
        .populate({path:'type', populate:{path:'category'}})
        .populate('location')
        .populate('original.currency')
        .populate('org').lean() as unknown as IEquipment[];
        return respond('Equipments found successfully', false, eqs, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching equipments', true, {}, 500);
    }
}

export async function getEquipmentsByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const eqs = await Equipment.find({ org: orgId })
        .populate('createdBy')
        .populate({path:'type', populate:{path:'category'}})
        .populate('location')
        .populate('original.currency')
        .populate('org').lean() as unknown as IEquipment[];
        return respond('Equipments found successfully', false, eqs, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching equipments', true, {}, 500);
    }
}

export async function getEquipmentsByType(typeId:string):Promise<IResponse>{
    try {
        await connectDB();
        const eqs = await Equipment.find({ type: typeId })
        .populate('createdBy')
        .populate({path:'type', populate:{path:'category'}})
        .populate('location')
        .populate('original.currency')
        .populate('org').lean() as unknown as IEquipment[];
        return respond('Equipments found successfully', false, eqs, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching equipments', true, {}, 500);
    }
}


export async function getEquipmentById(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const check = await verifyOrgAccess(Equipment, id, "Equipment",
          [{ path: "org"}, { path: "createdBy"}, {path:'type'}, {path:'location'}, {path:'original.currency'}]);
        if('allowed' in check === false) return check;
        const eq = check.doc;
        return respond('Equipment found successfully', false, eq, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching equipment', true, {}, 500);
    }
}

export async function updateEquipment(eq:Partial<IEquipment>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedEq = await Equipment.findByIdAndUpdate(eq._id, eq, { new: true });
        return respond('Equipment updated successfully', false, updatedEq, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating equipment', true, {}, 500);
    }
}

export async function deleteEquipment(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedEq = await Equipment.deleteOne({ _id: id });
        return respond('Equipment deleted successfully', false, deletedEq, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting equipment', true, {}, 500);
    }
}


function getLastNMonths(n: number): { year: number; month: number; label: string }[] {
  const months: { year: number; month: number; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1, // 1-indexed to match MongoDB's $month
      label: d.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
    });
  }
  return months;
}

export async function getEquipmentStats(limit: number = 6): Promise<IResponse> {
  try {
    await connectDB();

    const safeLimit = Math.max(1, Math.min(limit, 100));

    // ---------- Monthly status counts + price (last N months) ----------
    const monthBuckets = getLastNMonths(safeLimit);
    const startDate = new Date(monthBuckets[0].year, monthBuckets[0].month - 1, 1);

    const monthlyAgg = await Equipment.aggregate<IMonthlyAggregateResult>([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            status: '$status',
          },
          count: { $sum: 1 },
          price: { $sum: { $ifNull: ['$price', 0] } },
        },
      },
    ]);

    const monthlyMap = new Map<string, Partial<Record<EquipmentStatus, { count: number; price: number }>>>();
    for (const entry of monthlyAgg) {
      const key = `${entry._id.year}-${entry._id.month}`;
      if (!monthlyMap.has(key)) monthlyMap.set(key, {});
      monthlyMap.get(key)![entry._id.status] = { count: entry.count, price: entry.price };
    }

    const statuses: EquipmentStatus[] = ['Available', 'In Use', 'Maintenance'];
    const monthly: IMonthlyStatusCount = {
      Available: [],
      'In Use': [],
      Maintenance: [],
    };

    for (const { year, month, label } of monthBuckets) {
      const bucket = monthlyMap.get(`${year}-${month}`) ?? {};
      for (const status of statuses) {
        const entry = bucket[status] ?? { count: 0, price: 0 };
        monthly[status].push({
          month: label,
          count: entry.count,
          price: entry.price,
        });
      }
    }

    // ---------- All-time status counts + price ----------
    const allTimeAggPromise = Equipment.aggregate<IAllTimeAggregateResult>([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          price: { $sum: { $ifNull: ['$price', 0] } },
        },
      },
    ]);

    // ---------- Grouped counts + price (category and type, both) ----------
    const categoryAggPromise = Equipment.aggregate<IGroupedEquipmentAggregateResult>([
      { $match: { type: { $ne: null } } },
      {
        $lookup: {
          from: 'etypes',
          localField: 'type',
          foreignField: '_id',
          as: 'typeDoc',
        },
      },
      { $unwind: '$typeDoc' },
      { $match: { 'typeDoc.category': { $ne: null } } },
      {
        $group: {
          _id: '$typeDoc.category',
          count: { $sum: 1 },
          price: { $sum: { $ifNull: ['$price', 0] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: safeLimit },
      {
        $lookup: {
          from: 'ecategories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDoc',
        },
      },
      { $unwind: '$categoryDoc' },
      { $project: { _id: 0, id: '$_id', name: '$categoryDoc.name', count: 1, price: 1 } },
    ]);

    const typeAggPromise = Equipment.aggregate<IGroupedEquipmentAggregateResult>([
      { $match: { type: { $ne: null } } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          price: { $sum: { $ifNull: ['$price', 0] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: safeLimit },
      {
        $lookup: {
          from: 'etypes',
          localField: '_id',
          foreignField: '_id',
          as: 'typeDoc',
        },
      },
      { $unwind: '$typeDoc' },
      { $project: { _id: 0, id: '$_id', name: '$typeDoc.name', count: 1, price: 1 } },
    ]);

    const [allTimeAgg, categoryAgg, typeAgg] = await Promise.all([
      allTimeAggPromise,
      categoryAggPromise,
      typeAggPromise,
    ]);

    const allTime: IAllTimeStatusCount = {
      Available: { count: 0, price: 0 },
      'In Use': { count: 0, price: 0 },
      Maintenance: { count: 0, price: 0 },
    };
    for (const entry of allTimeAgg) {
      allTime[entry._id] = { count: entry.count, price: entry.price };
    }

    const groupedByCategory: IGroupedEquipmentCount[] = categoryAgg.map((g) => ({
      id: g.id.toString(),
      name: g.name,
      count: g.count,
      price: g.price,
    }));

    const groupedByType: IGroupedEquipmentCount[] = typeAgg.map((g) => ({
      id: g.id.toString(),
      name: g.name,
      count: g.count,
      price: g.price,
    }));

    const payload: IEquipmentStatsPayload = {
      monthly,
      allTime,
      groupedByCategory,
      groupedByType,
    };

    return respond('Equipment stats retrieved successfully', false, payload, 200);
  } catch (error) {
    console.log(error);
    return respond('Error occured while fetching equipment stats', true, {}, 500);
  }
}

export async function getEquipmentStatsByOrg(orgId: string, limit: number = 6): Promise<IResponse> {
  try {
    await connectDB();

    const safeLimit = Math.max(1, Math.min(limit, 100));
    const orgObjectId = new Types.ObjectId(orgId);

    // ---------- Monthly status counts + price (last N months) ----------
    const monthBuckets = getLastNMonths(safeLimit);
    const startDate = new Date(monthBuckets[0].year, monthBuckets[0].month - 1, 1);

    const monthlyAgg = await Equipment.aggregate<IMonthlyAggregateResult>([
      { $match: { org: orgObjectId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            status: '$status',
          },
          count: { $sum: 1 },
          price: { $sum: { $ifNull: ['$price', 0] } },
        },
      },
    ]);

    const monthlyMap = new Map<string, Partial<Record<EquipmentStatus, { count: number; price: number }>>>();
    for (const entry of monthlyAgg) {
      const key = `${entry._id.year}-${entry._id.month}`;
      if (!monthlyMap.has(key)) monthlyMap.set(key, {});
      monthlyMap.get(key)![entry._id.status] = { count: entry.count, price: entry.price };
    }

    const statuses: EquipmentStatus[] = ['Available', 'In Use', 'Maintenance'];
    const monthly: IMonthlyStatusCount = {
      Available: [],
      'In Use': [],
      Maintenance: [],
    };

    for (const { year, month, label } of monthBuckets) {
      const bucket = monthlyMap.get(`${year}-${month}`) ?? {};
      for (const status of statuses) {
        const entry = bucket[status] ?? { count: 0, price: 0 };
        monthly[status].push({
          month: label,
          count: entry.count,
          price: entry.price,
        });
      }
    }

    // ---------- All-time status counts + price ----------
    const allTimeAggPromise = Equipment.aggregate<IAllTimeAggregateResult>([
      { $match: { org: orgObjectId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          price: { $sum: { $ifNull: ['$price', 0] } },
        },
      },
    ]);

    // ---------- Grouped counts + price (category and type, both) ----------
    const categoryAggPromise = Equipment.aggregate<IGroupedEquipmentAggregateResult>([
      { $match: { org: orgObjectId, type: { $ne: null } } },
      {
        $lookup: {
          from: 'etypes',
          localField: 'type',
          foreignField: '_id',
          as: 'typeDoc',
        },
      },
      { $unwind: '$typeDoc' },
      { $match: { 'typeDoc.category': { $ne: null } } },
      {
        $group: {
          _id: '$typeDoc.category',
          count: { $sum: 1 },
          price: { $sum: { $ifNull: ['$price', 0] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: safeLimit },
      {
        $lookup: {
          from: 'ecategories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryDoc',
        },
      },
      { $unwind: '$categoryDoc' },
      { $project: { _id: 0, id: '$_id', name: '$categoryDoc.name', count: 1, price: 1 } },
    ]);

    const typeAggPromise = Equipment.aggregate<IGroupedEquipmentAggregateResult>([
      { $match: { org: orgObjectId, type: { $ne: null } } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          price: { $sum: { $ifNull: ['$price', 0] } },
        },
      },
      { $sort: { count: -1 } },
      { $limit: safeLimit },
      {
        $lookup: {
          from: 'etypes',
          localField: '_id',
          foreignField: '_id',
          as: 'typeDoc',
        },
      },
      { $unwind: '$typeDoc' },
      { $project: { _id: 0, id: '$_id', name: '$typeDoc.name', count: 1, price: 1 } },
    ]);

    const [allTimeAgg, categoryAgg, typeAgg] = await Promise.all([
      allTimeAggPromise,
      categoryAggPromise,
      typeAggPromise,
    ]);

    const allTime: IAllTimeStatusCount = {
      Available: { count: 0, price: 0 },
      'In Use': { count: 0, price: 0 },
      Maintenance: { count: 0, price: 0 },
    };
    for (const entry of allTimeAgg) {
      allTime[entry._id] = { count: entry.count, price: entry.price };
    }

    const groupedByCategory: IGroupedEquipmentCount[] = categoryAgg.map((g) => ({
      id: g.id.toString(),
      name: g.name,
      count: g.count,
      price: g.price,
    }));

    const groupedByType: IGroupedEquipmentCount[] = typeAgg.map((g) => ({
      id: g.id.toString(),
      name: g.name,
      count: g.count,
      price: g.price,
    }));

    const payload: IEquipmentStatsPayload = {
      monthly,
      allTime,
      groupedByCategory,
      groupedByType,
    };

    return respond('Equipment stats retrieved successfully', false, payload, 200);
  } catch (error) {
    console.log(error);
    return respond('Error occured while fetching equipment stats', true, {}, 500);
  }
}