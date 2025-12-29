'use server'

import { IResponse, IProductStats } from "@/types/Types";
import Product, { IProduct } from "../models/product.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/org.model';
import '../models/supplier.model';
import '../models/category.model';
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";

export async function createProduct(data:Partial<IProduct>):Promise<IResponse>{
    try {
        await connectDB();
        const product = await Product.create(data);
        return respond('Product created successfully', false, product, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating product', true, {}, 500);
    }
}

export async function getProducts():Promise<IResponse>{
    try {
        await connectDB();
        const products = await Product.find()
        .populate('category')
        .populate('suppliers')
        .populate('createdBy')
        .populate('org').lean() as unknown as IProduct[];
        return respond('Products found successfully', false, products, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching products', true, {}, 500);
    }
}

export async function getProductsByOrg(orgId:string):Promise<IResponse>{
    try {
        await connectDB();
        const products = await Product.find({ org: orgId })
        .populate('category')
        .populate('suppliers')
        .populate('createdBy')
        .populate('org').lean() as unknown as IProduct[];
        return respond('Products found successfully', false, products, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while fetching products', true, {}, 500);
    }
}


export async function updateProduct(data:Partial<IProduct>):Promise<IResponse>{
    try {
        await connectDB();
        const updatedProduct = await Product.findByIdAndUpdate(data._id, data, { new: true });
        return respond('Product updated successfully', false, updatedProduct, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while updating product', true, {}, 500);
    }
}

export async function getProduct(id: string): Promise<IResponse> {
  try {
    await connectDB();

    const check = await verifyOrgAccess(Product, id, "Product",[
      { path: "category" },
      { path: "suppliers" },
      { path: "createdBy" },
      { path: "org" },
    ]);

    // If not allowed, return the middleware's response directly
    if ("allowed" in check === false) return check;

    // Authorized → you can use check.doc safely, fully typed as Production
    const production = check.doc;

    return respond("Production retrieved successfully", false, production, 200);
  } catch (error) {
    console.error(error);
    return respond("Error occurred retrieving production", true, {}, 500);
  }
}



export async function getProductStats(): Promise<IResponse> {
    try {
        await connectDB();

        const products = await Product.aggregate<IProductStats>([
            // Lookup raw materials
            {
                $lookup: {
                    from: 'rmaterials', // collection name (plural, lowercase)
                    localField: '_id',
                    foreignField: 'product',
                    as: 'rawMaterials',
                },
            },

            // Lookup line items
            {
                $lookup: {
                    from: 'lineitems',
                    localField: '_id',
                    foreignField: 'product',
                    as: 'lineItems',
                },
            },

            // Compute stock based on product type
            {
                $addFields: {
                    stock: {
                        $cond: [
                            { $eq: ['$type', 'Raw Material'] },
                            {
                                $sum: '$rawMaterials.qAccepted',
                            },
                            {
                                $size: {
                                    $filter: {
                                        input: '$lineItems',
                                        as: 'item',
                                        cond: {
                                            $not: {
                                                $in: ['$$item.status', ['Sold', 'Pending']],
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    },
                },
            },

            // Compute outOfStock flag
            {
                $addFields: {
                    outOfStock: {
                        $lte: ['$stock', '$threshold'],
                    },
                },
            },

            // Final shape
            {
                $project: {
                    _id: 0,
                    name: 1,
                    type: 1,
                    threshold: 1,
                    stock: 1,
                    outOfStock: 1,
                },
            },
        ]);

        return respond('Product stats fetched successfully', false, products, 200);
    } catch (error) {
        console.error(error);
        return respond('Error occurred while fetching product stats', true, {}, 500);
    }
}




export async function deleteProduct(id:string):Promise<IResponse>{
    try {
        await connectDB();
        const deletedProduct = await Product.deleteOne({ _id: id });
        return respond('Product deleted successfully', false, deletedProduct, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting product', true, {}, 500);
    }
}