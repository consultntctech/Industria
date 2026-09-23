'use server'

import { IResponse } from "@/types/Types";
import Category, { ICategory } from "../models/category.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/org.model';
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import { IOrganization } from "../models/org.model";

export async function createCategory(cat:Partial<ICategory>):Promise<IResponse>{
    try {
        await connectDB();
        const newData = {
            ...cat,
            lowerName: cat?.name?.trim()?.toLowerCase(),
            org: cat?.org?.toString()
        };
        // console.log('Org ID: ', newData.org)
        const oldCat = await Category.findOne({ lowerName: newData?.lowerName, org: newData?.org });
        if (oldCat) {
            return respond('Category already exists', true, {}, 400);
        }
        const newCat = await Category.create(newData);
        return respond('Category created successfully', false, newCat, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating category', true, {}, 500);
    }
}

export async function getCategories():Promise<IResponse>{
    try {
        await connectDB();
        const cats = await Category.find()
        .populate('createdBy')
        .populate('org').lean() as unknown as ICategory[];
        return respond('Categories found successfully', false, cats, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching categories', true, {}, 500);
    }
}

export async function getCategoriesByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const cats = await Category.find({ org: orgId })
        .populate('createdBy')
        .populate('org').lean() as unknown as ICategory[];
        return respond('Categories found successfully', false, cats, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching categories', true, {}, 500);
    }
}

export async function getCategoryById(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const check = await verifyOrgAccess(Category, id, "Category",[{ path: "org"}, { path: "createdBy"}]);
        if('allowed' in check === false) return check;
        const cat = check.doc;
        return respond('Category found successfully', false, cat, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching category', true, {}, 500);
    }
}

export async function updateCategory(cat:Partial<ICategory>):Promise<IResponse>{
    try {
        await connectDB();
        const org =  cat?.org as IOrganization;
        const newData = {
            ...cat,
            lowerName: cat?.name?.trim()?.toLowerCase(),
            org: org?._id
        }
        // console.log('Org ID: ', newData.org)
        const oldCategory = await Category.findOne({lowerName: newData.lowerName, org: newData.org});
        if (oldCategory && (oldCategory?._id?.toString() !== cat._id)) {
            return respond('Category already exists', true, {}, 400);
        }
        const updatedCat = await Category.findByIdAndUpdate(newData._id, newData, { new: true });
        return respond('Category updated successfully', false, updatedCat, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating category', true, {}, 500);
    }
}

export async function deleteCategory(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedCat = await Category.deleteOne({ _id: id });
        return respond('Category deleted successfully', false, deletedCat, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting category', true, {}, 500);
    }
}