import { Document, model, models, Schema, Types } from "mongoose";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";
import { ICategory } from "./category.model";
import { ISupplier } from "./supplier.model";
import ProdApproval from "./prodapproval.model";

export interface IProduct extends Document {
    _id: string;
    name: string;
    uom?: string;
    threshold: number;
    category: string | Types.ObjectId | ICategory;
    suppliers?: string[] | Types.ObjectId[] | ISupplier[];
    type: string;
    description: string;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization;
    createdAt?: Date;
    updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>({
    name: { type: String, required: true },
    uom: { type: String, required: false },
    threshold: { type: Number, required: true, default: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    suppliers: { type: [Schema.Types.ObjectId], ref: 'Supplier', required: false },
    type: { type: String, required: true },
    description: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})


ProductSchema.pre('deleteOne', { document: false, query: true }, async function(next) {
    try {
        const prodId = this.getQuery()._id;
        if (!prodId) return next();

        await ProdApproval.deleteMany({ production: prodId });
        next();
    } catch (error) {
        console.log(error);
    }
});


const Product = models?.Product || model<IProduct>('Product', ProductSchema);
export default Product;