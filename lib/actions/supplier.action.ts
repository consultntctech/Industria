'use server'
import { connectDB } from '../mongoose';
import Supplier, { ISupplier } from '../models/supplier.model';
import { IResponse } from '@/types/Types';
import { respond } from '../misc';
import '../models/supplier.model';
import Product from '../models/product.model';
import { verifyOrgAccess } from '../middleware/verifyOrgAccess';


export async function createSupplier(data:Partial<ISupplier>):Promise<IResponse>{
    try {
        await connectDB();
        const supplier = await Supplier.create(data);
        return respond('Supplier created successfully', false, supplier, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating supplier', true, {}, 500);
    }
}

export async function getSuppliers():Promise<IResponse>{
    try {
        await connectDB();
        const suppliers = await Supplier.find()
        .populate('createdBy')
        .populate('org').lean() as unknown as ISupplier[];
        return respond('Suppliers found successfully', false, suppliers, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching suppliers', true, {}, 500);
    }
}

export const getProductSuppliers = async(id:string):Promise<IResponse>=>{
    try {
        await connectDB();
        const product = await Product.findById(id).populate('suppliers');
        const suppliers = product.suppliers as ISupplier[];
        return respond('Suppliers found successfully', false, suppliers, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching suppliers', true, {}, 500);
    }
}


export const getProductSuppliersByOrg = async( org:string, _id:string):Promise<IResponse>=>{
    try {
        await connectDB();
        const product = await Product.findOne({ _id, org }).populate('suppliers');
        const suppliers = product.suppliers as ISupplier[];
        return respond('Suppliers found successfully', false, suppliers, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching suppliers', true, {}, 500);
    }
}

export async function getSuppliersByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const suppliers = await Supplier.find({ org: orgId })
        .populate('createdBy')
        .populate('org').lean() as unknown as ISupplier[];
        return respond('Suppliers found successfully', false, suppliers, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching suppliers', true, {}, 500);
    }
}


export async function updateSupplier(data:Partial<ISupplier>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedSupplier = await Supplier.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Supplier updated successfully', false, updatedSupplier, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating supplier', true, {}, 500);
    }
}

export async function getSupplier(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const check = await verifyOrgAccess(Supplier, id, "Supplier",[
            { path: "createdBy" },
            { path: "org" },
        ])
        if('allowed' in check === false) return check;
        const supplier = check.doc;
        
        return respond("Supplier retrieved successfully", false, supplier, 200);
    } catch (error) {
        console.log(error);
        return respond("Error occured retrieving supplier", true, {}, 500);
    }
}

export async function deleteSupplier(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedSupplier = await Supplier.deleteOne({ _id: id });
        return respond('Supplier deleted successfully', false, deletedSupplier, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting supplier', true, {}, 500);
    }
}