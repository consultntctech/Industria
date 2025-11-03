'use server'

import { IResponse } from "@/types/Types";
import Category, { ICategory } from "../models/category.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/org.model';

export async function createCategory(cat:Partial<ICategory>):Promise<IResponse>{
    try {
        await connectDB();
        const newCat = await Category.create(cat);
        return respond('Category created successfully', false, newCat, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating category', true, {}, 500);
    }
}

export async function getCategories():Promise<IResponse>{
    try {
        await connectDB();
        const cats = await Category.find();
        return respond('Categories found successfully', false, cats, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching categories', true, {}, 500);
    }
}

export async function getCategoriesByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const cats = await Category.find({ org: orgId });
        return respond('Categories found successfully', false, cats, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching categories', true, {}, 500);
    }
}

export async function getCategoryById(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const cat = await Category.findById(id);
        return respond('Category found successfully', false, cat, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching category', true, {}, 500);
    }
}

export async function updateCategory(cat:Partial<ICategory>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedCat = await Category.findByIdAndUpdate(cat._id, cat, { new: true });
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