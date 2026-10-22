'use server'

import { IResponse } from "@/types/Types";
import ProdType, { IProdType } from "../models/prodtype.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/org.model';
import '../models/supplier.model';
import { Types } from "mongoose";
import ProdItem from "../models/proditem.model";
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import { ISupplier } from "../models/supplier.model";


interface IProdTypeTotals {
    _id: Types.ObjectId;
    stock: number;
    used: number;
    available: number;
}

export async function createProdType(data: Partial<IProdType>): Promise<IResponse> {
  try {
    await connectDB();
    const typeData = {...data, nameLower: data?.name?.toLowerCase(), codeLower: data?.code?.toLowerCase()};
    const [nameExists, codeExists] = await Promise.all([
      ProdType.exists({ nameLower: typeData.nameLower, org: data?.org }),
      ProdType.exists({ codeLower: typeData.codeLower, org: data?.org }),
    ]);
    if (nameExists || codeExists) {
      return respond('A packaging material type with this name or code already exists', true, {}, 400);
    }
    const newProdType = await ProdType.create(typeData);
    return respond('Material type created successfully', false, newProdType, 201);
  } catch (error) {
    console.log(error);
    return respond('Error occured while creating material type', true, {}, 500);
  }
}


export async function getProdTypes(): Promise<IResponse> {
  try {
    await connectDB();

    const prodTypes = await ProdType.find()
      .populate('suppliers')
      .populate('createdBy')
      .populate('org')
      .lean() as unknown as IProdType[];

    // Totals per type, computed from the items that depend on it
    const totals = await ProdItem.aggregate<IProdTypeTotals>([
      { $match: { type: { $ne: null } } },
      {
        $group: {
          _id: '$type',
          stock: { $sum: '$quantity' },
          used: { $sum: '$used' },
          available: { $sum: '$stock' },
        },
      },
    ]);

    const totalsByType = new Map<string, IProdTypeTotals>(
      totals.map((t) => [String(t._id), t])
    );

    const result: IProdType[] = prodTypes.map((prodType) => {
      const t = totalsByType.get(String(prodType._id));
      return {
        ...prodType,
        stock: t?.stock ?? 0,
        used: t?.used ?? 0,
        available: t?.available ?? 0,
      };
    });

    return respond('Packaging material types found successfully', false, result, 200);
  } catch (error) {
    console.log(error);
    return respond('Error occured while fetching packaging material types', true, {}, 500);
  }
}



export async function getProdTypesByOrg(orgId: string): Promise<IResponse> {
  try {
    await connectDB();

    const prodTypes = await ProdType.find({ org: orgId })
      .populate('suppliers')
      .populate('createdBy')
      .populate('org')
      .lean() as unknown as IProdType[];

    // Totals per type, computed from the items that depend on it
    const totals = await ProdItem.aggregate<IProdTypeTotals>([
      { $match: { type: { $ne: null } } },
      {
        $group: {
          _id: '$type',
          stock: { $sum: '$quantity' },
          used: { $sum: '$used' },
          available: { $sum: '$stock' },
        },
      },
    ]);

    const totalsByType = new Map<string, IProdTypeTotals>(
      totals.map((t) => [String(t._id), t])
    );

    const result: IProdType[] = prodTypes.map((prodType) => {
      const t = totalsByType.get(String(prodType._id));
      return {
        ...prodType,
        stock: t?.stock ?? 0,
        used: t?.used ?? 0,
        available: t?.available ?? 0,
      };
    });

    return respond('Packaging material types found successfully', false, result, 200);
  } catch (error) {
    console.log(error);
    return respond('Error occured while fetching packaging material types', true, {}, 500);
  }
}


export async function getProdType(id: string): Promise<IResponse> {
  try {
    await connectDB();

    const check = await verifyOrgAccess(ProdType, id, "ProdType", [
      { path: "suppliers" },
      { path: "createdBy" },
    ]);

    if ("allowed" in check === false) return check;

    // check.doc may be a Mongoose document or a plain object depending on verifyOrgAccess
    const raw = check.doc as unknown as IProdType & { toObject?: () => IProdType };
    const baseType: IProdType = typeof raw.toObject === "function" ? raw.toObject() : raw;

    const [totals] = await ProdItem.aggregate<IProdTypeTotals>([
      { $match: { type: new Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          stock: { $sum: "$quantity" },
          used: { $sum: "$used" },
          available: { $sum: "$stock" },
        },
      },
    ]);

    const prodType: IProdType = {
      ...baseType,
      stock: totals?.stock ?? 0,
      used: totals?.used ?? 0,
      available: totals?.available ?? 0,
    };

    return respond("Packaging material type retrieved successfully", false, prodType, 200);
  } catch (error) {
    console.log(error);
    return respond("Error occured retrieving packaging material type", true, {}, 500);
  }
}



export async function getProdTyppesSuppliers(id:string): Promise<IResponse>{
    try {
        await connectDB();
        const prodType = await ProdType.findById(id)
        .populate('suppliers')
        .lean() as unknown as IProdType;
        const suppliers = prodType?.suppliers as ISupplier[];
        return respond('Packaging material types found successfully', false, suppliers, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching packaging material types', true, {}, 500);
    }
}



export async function updateProdType(data: Partial<IProdType>): Promise<IResponse> {
  try {
    await connectDB();

    if (!data._id || !Types.ObjectId.isValid(data._id)) {
      return respond('Invalid material type id', true, {}, 400);
    }

    const existing = await ProdType.findById(data._id)
      .select('org')
      .lean() as unknown as Pick<IProdType, 'org'> | null;

    if (!existing) {
      return respond('Material type not found', true, {}, 404);
    }

    // Strip fields the client must not change
    const {
      _id,
      org: _org,
      stock: _stock,
      used: _used,
      available: _available,
      createdBy: _createdBy,
      ...fields
    } = data;

    const update: Partial<IProdType> = { ...fields };

    if (fields.name !== undefined) {
      update.name = fields.name.trim();
      update.nameLower = update.name.toLowerCase();
    }
    if (fields.code !== undefined) {
      update.code = fields.code.trim();
      update.codeLower = update.code.toLowerCase();
    }

    const conditions: Record<string, string>[] = [];
    if (update.nameLower) conditions.push({ nameLower: update.nameLower });
    if (update.codeLower) conditions.push({ codeLower: update.codeLower });

    if (conditions.length > 0) {
      const duplicate = await ProdType.exists({
        org: existing.org,
        _id: { $ne: _id },
        $or: conditions,
      });
      if (duplicate) {
        return respond('A material type with this name or code already exists', true, {}, 409);
      }
    }

    const updatedProdType = await ProdType.findByIdAndUpdate(_id, update, { new: true });
    if (!updatedProdType) {
      return respond('Material type not found', true, {}, 404);
    }

    return respond('Material type updated successfully', false, updatedProdType, 200);
  } catch (error) {
    // The unique index catches the race the check above cannot
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
      return respond('A material type with this name or code already exists', true, {}, 409);
    }
    console.log(error);
    return respond('Error occured while updating material type', true, {}, 500);
  }
}


export async function deleteProdType(id: string): Promise<IResponse> {
  try {
    await connectDB();

    if (!Types.ObjectId.isValid(id)) {
      return respond('Invalid material type id', true, {}, 400);
    }

    // Same ownership check used in getProdType
    const check = await verifyOrgAccess(ProdType, id, "ProdType", []);
    if ("allowed" in check === false) return check;

    const inProdItem = await ProdItem.exists({ type: id });
    if (inProdItem) {
      return respond('Cannot delete this material type because it is used in packaging material items', true, {}, 409);
    }

    const deletedProdType = await ProdType.deleteOne({ _id: id });
    if (deletedProdType.deletedCount === 0) {
      return respond('Material type not found', true, {}, 404);
    }

    return respond('Material type deleted successfully', false, {}, 200);
  } catch (error) {
    console.log(error);
    return respond('Error occured while deleting material type', true, {}, 500);
  }
}