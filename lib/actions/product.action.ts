'use server'

import { IResponse, IProductStats } from "@/types/Types";
import Product, { IProduct, IProductWithStock } from "../models/product.model";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import '../models/org.model';
import '../models/supplier.model';
import '../models/category.model';
import { verifyOrgAccess } from "../middleware/verifyOrgAccess";
import LineItem from "../models/lineitem.model";
import RMaterial from "../models/rmaterial.mode";

export async function createProduct(data:Partial<IProduct>):Promise<IResponse>{
    try {
        await connectDB();
        const oldProduct = await Product.findOne({ name: data.name, type:data.type, org: data.org });
        if (oldProduct) {
            return respond('Product already exists', true, {}, 400);
        }
        const product = await Product.create(data);
        return respond('Product created successfully', false, product, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating product', true, {}, 500);
    }
}


export async function getProducts(): Promise<IResponse> {
  try {
    await connectDB();

    const products = await Product.find()
      .populate('category')
      .populate('suppliers')
      .populate('createdBy')
      .populate('org')
      .lean() as unknown as IProduct[];

    const productIds = products.map(p => p._id);

    const [lineItemCounts, rMaterialSums] = await Promise.all([
      LineItem.aggregate([
        { $match: { product: { $in: productIds }, status: 'Available' } },
        { $group: { _id: '$product', count: { $sum: 1 } } }
      ]),
      RMaterial.aggregate([
        { $match: { product: { $in: productIds } } },
        { $group: { _id: '$product', total: { $sum: '$qAccepted' } } }
      ])
    ]);

    const lineItemMap = new Map(lineItemCounts.map(l => [l._id.toString(), l.count]));
    const rMaterialMap = new Map(rMaterialSums.map(r => [r._id.toString(), r.total]));

    const productsWithStock = products.map(product => {
      const idStr = product._id.toString();
      const stock = product.type === 'Finished Good'
        ? (lineItemMap.get(idStr) ?? 0)
        : (rMaterialMap.get(idStr) ?? 0);

      return { ...product, stock };
    });

    return respond('Products found successfully', false, productsWithStock, 200);
  } catch (error) {
    console.log(error);
    return respond('Error occured while fetching products', true, {}, 500);
  }
}

export async function getProductsByOrg(orgId: string): Promise<IResponse> {
  try {
    await connectDB();

    const products = await Product.find({ org: orgId })
      .populate('category')
      .populate('suppliers')
      .populate('createdBy')
      .populate('org')
      .lean() as unknown as IProduct[];

    const productIds = products.map(p => p._id);

    const [lineItemCounts, rMaterialSums] = await Promise.all([
      LineItem.aggregate([
        { $match: { product: { $in: productIds }, status: 'Available' } },
        { $group: { _id: '$product', count: { $sum: 1 } } }
      ]),
      RMaterial.aggregate([
        { $match: { product: { $in: productIds } } },
        { $group: { _id: '$product', total: { $sum: '$qAccepted' } } }
      ])
    ]);

    const lineItemMap = new Map(lineItemCounts.map(l => [l._id.toString(), l.count]));
    const rMaterialMap = new Map(rMaterialSums.map(r => [r._id.toString(), r.total]));

    const productsWithStock = products.map(product => {
      const idStr = product._id.toString();
      const stock = product.type === 'Finished Good'
        ? (lineItemMap.get(idStr) ?? 0)
        : (rMaterialMap.get(idStr) ?? 0);

      return { ...product, stock };
    });

    return respond('Products found successfully', false, productsWithStock, 200);
  } catch (error) {
    console.log(error);
    return respond('Error occured while fetching products', true, {}, 500);
  }
}


export async function updateProduct(data:Partial<IProduct>):Promise<IResponse>{
    try {
        await connectDB();
        const oldProduct = await Product.findOne({ name: data.name, type:data.type, org: data.org });
        // console.log(oldProduct?._id?.toString(), data._id);
        if (oldProduct?._id?.toString() !== data._id) {
            return respond('Product already exists', true, {}, 400);
        }
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

    const check = await verifyOrgAccess(Product, id, "Product", [
      { path: "category" },
      { path: "suppliers" },
      { path: "createdBy" },
      { path: "org" },
    ]);

    if ("allowed" in check === false) return check;

    const product = check.doc;

    const stock = product.type === 'Finished Good'
      ? await LineItem.countDocuments({ product: product._id, status: 'Available' })
      : await RMaterial.aggregate([
          { $match: { product: product._id } },
          { $group: { _id: null, total: { $sum: '$qAccepted' } } }
        ]).then(result => result[0]?.total ?? 0);

    return respond(
      "Production retrieved successfully",
      false,
      { ...(product.toObject ? product.toObject() : product), stock },
      200
    );
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


export async function getProductStatsByOrg(org:string): Promise<IResponse> {
    try {
        await connectDB();

        const products = await Product.aggregate<IProductStats>([
            {
                $match: { org }
            },
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



export async function getAllProductsWithStock(): Promise<IResponse> {
    try {
        await connectDB();

        const products = await Product.aggregate<IProductWithStock>([
            // 🔹 Populate category
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            {
                $unwind: {
                    path: '$category',
                    preserveNullAndEmptyArrays: true,
                },
            },

            // 🔹 Join raw materials
            {
                $lookup: {
                    from: 'rmaterials',
                    localField: '_id',
                    foreignField: 'product',
                    as: 'rawMaterials',
                },
            },

            // 🔹 Join line items
            {
                $lookup: {
                    from: 'lineitems',
                    localField: '_id',
                    foreignField: 'product',
                    as: 'lineItems',
                },
            },

            // 🔹 Calculate stock
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

            // 🔹 Determine out-of-stock
            {
                $addFields: {
                    outOfStock: {
                        $lte: ['$stock', '$threshold'],
                    },
                },
            },

            // 🔹 Final projection
            {
                $project: {
                    rawMaterials: 0,
                    lineItems: 0,
                    'category.createdAt': 0,
                    'category.updatedAt': 0,
                    'category.__v': 0,
                },
            },
        ]);

        return respond(
            'Products fetched successfully',
            false,
            products,
            200
        );
    } catch (error) {
        console.error(error);
        return respond(
            'Error occurred while fetching products',
            true,
            {},
            500
        );
    }
}


export async function getAllProductsWithStockByOrg(org:string): Promise<IResponse> {
    try {
        await connectDB();

        const products = await Product.aggregate<IProductWithStock>([
            {
                $match: {org: org}
            },
            // 🔹 Populate category
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            {
                $unwind: {
                    path: '$category',
                    preserveNullAndEmptyArrays: true,
                },
            },

            // 🔹 Join raw materials
            {
                $lookup: {
                    from: 'rmaterials',
                    localField: '_id',
                    foreignField: 'product',
                    as: 'rawMaterials',
                },
            },

            // 🔹 Join line items
            {
                $lookup: {
                    from: 'lineitems',
                    localField: '_id',
                    foreignField: 'product',
                    as: 'lineItems',
                },
            },

            // 🔹 Calculate stock
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

            // 🔹 Determine out-of-stock
            {
                $addFields: {
                    outOfStock: {
                        $lte: ['$stock', '$threshold'],
                    },
                },
            },

            // 🔹 Final projection
            {
                $project: {
                    rawMaterials: 0,
                    lineItems: 0,
                    'category.createdAt': 0,
                    'category.updatedAt': 0,
                    'category.__v': 0,
                },
            },
        ]);

        return respond(
            'Products fetched successfully',
            false,
            products,
            200
        );
    } catch (error) {
        console.error(error);
        return respond(
            'Error occurred while fetching products',
            true,
            {},
            500
        );
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