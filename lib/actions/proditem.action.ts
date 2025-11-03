'use server'

import { IResponse } from "@/types/Types";
import ProdItem, { IProdItem } from "../models/proditem.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/org.model';
import '../models/supplier.model';

export async function createProdItem(data: Partial<IProdItem>): Promise<IResponse> {
  try {
    await connectDB();

    const newProdItem = await ProdItem.create(data);
    return respond("Production item created successfully", false, newProdItem, 201);
  } catch (error) {
    console.error(error);
    return respond("Error occurred while creating production item", true, {}, 500);
  }
}


export async function getProdItems():Promise<IResponse>{
    try {
        await connectDB();
        const prodItems = await ProdItem.find();
        return respond('Production items found successfully', false, prodItems, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching production items', true, {}, 500);
    }
}

export async function getProdItemsByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const prodItems = await ProdItem.find({ org: orgId });
        return respond('Production items found successfully', false, prodItems, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching production items', true, {}, 500);
    }
}


export async function updateProdItem(data:Partial<IProdItem>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedProdItem = await ProdItem.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Production item updated successfully', false, updatedProdItem, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating production item', true, {}, 500);
    }
}

export async function getProdItem(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const prodItem = await ProdItem.findById(id);
        return respond("Production item retrieved successfully", false, prodItem, 200);
    } catch (error) {
        console.log(error);
        return respond("Error occured retrieving production item", true, {}, 500);
    }
}

export async function deleteProdItem(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedProdItem = await ProdItem.deleteOne({ _id: id });
        return respond('Production item deleted successfully', false, deletedProdItem, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting production item', true, {}, 500);
    }
}