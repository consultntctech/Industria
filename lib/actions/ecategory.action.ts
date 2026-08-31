'use server'

import { IResponse } from "@/types/Types";
import ECategory, { IECategory } from "../models/ecategory.model";
import { connectDB } from "../mongoose";
import { respond } from "../misc";
import '../models/org.model';
import '../models/user.model';
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";

export async function createECategory(cat:Partial<IECategory>):Promise<IResponse>{
    try {
        await connectDB();
        const newCat = await ECategory.create(cat);
        return respond('Category created successfully', false, newCat, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating category', true, {}, 500);
    }
}

export async function getECategories():Promise<IResponse>{
    try {
        await connectDB();
        const cats = await ECategory.find()
        .populate('createdBy')
        .populate('org').lean() as unknown as IECategory[];
        return respond('Categories found successfully', false, cats, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching categories', true, {}, 500);
    }
}

export async function getECategoriesByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const cats = await ECategory.find({ org: orgId })
        .populate('createdBy')
        .populate('org').lean() as unknown as IECategory[];
        return respond('Categories found successfully', false, cats, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching categories', true, {}, 500);
    }
}

export async function getECategoryById(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const check = await verifyOrgAccess(ECategory, id, "ECategory",[{ path: "org"}, { path: "createdBy"}]);
        if('allowed' in check === false) return check;
        const cat = check.doc;
        return respond('Category found successfully', false, cat, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching category', true, {}, 500);
    }
}

export async function updateECategory(cat:Partial<IECategory>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedCat = await ECategory.findByIdAndUpdate(cat._id, cat, { new: true });
        return respond('Category updated successfully', false, updatedCat, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating category', true, {}, 500);
    }
}

export async function deleteECategory(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedCat = await ECategory.deleteOne({ _id: id });
        return respond('Category deleted successfully', false, deletedCat, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting category', true, {}, 500);
    }
}