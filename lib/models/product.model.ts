import { Document, model, models, Schema, Types } from "mongoose";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";
import { ICategory } from "./category.model";
import { ISupplier } from "./supplier.model";
import Order from "./order.model";

export interface IProductWithStock extends IProduct {
    stock: number;
    outOfStock: boolean;
}

export interface IProduct extends Document {
    _id: string;
    name: string;
    lowerName: string;
    uom?: string;
    threshold: number;
    category: string | Types.ObjectId | ICategory;
    suppliers?: string[] | Types.ObjectId[] | ISupplier[];
    type: string;
    stock: number;
    description: string;
    creator: string;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization;
    createdAt?: Date;
    updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    lowerName: { type: String, lowercase:true },
    uom: { type: String, required: false },
    threshold: { type: Number, required: true, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    suppliers: { type: [Schema.Types.ObjectId], ref: 'Supplier', required: false },
    type: { type: String, required: true, default:'Raw Material' },
    description: String,
    creator: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})


type Id = string | Types.ObjectId;

async function cascadeFromProducts(ids: Id[]) {
    if (!ids.length) return;
    await Order.deleteMany({ 'products.product': { $in: ids } });
}

// Product.deleteOne({...})
ProductSchema.pre('deleteOne', { document: false, query: true }, async function (next) {
    try {
        const prod = await this.model.findOne(this.getQuery()).select('_id');
        if (prod) await cascadeFromProducts([prod._id]);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// doc.deleteOne()
ProductSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
    try {
        await cascadeFromProducts([this._id]);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Product.deleteMany({...})
ProductSchema.pre('deleteMany', async function (next) {
    try {
        const prods = await this.model.find(this.getQuery()).select('_id');
        await cascadeFromProducts(prods.map(p => p._id));
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Product.findOneAndDelete / findByIdAndDelete
ProductSchema.pre('findOneAndDelete', async function (next) {
    try {
        const prod = await this.model.findOne(this.getQuery()).select('_id');
        if (prod) await cascadeFromProducts([prod._id]);
        next();
    } catch (error) {
        next(error as Error);
    }
});


const Product = models?.Product || model<IProduct>('Product', ProductSchema);
export default Product;