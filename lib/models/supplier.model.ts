import { Document, model, models, Schema, Types } from "mongoose";
import { IOrganization } from "./org.model";
import { IUser } from "./user.model";
import Product from "./product.model";

export interface ISupplier extends Document {
    _id: string;
    name: string;
    person: string;
    address: string;
    phone: string;
    email: string;
    description: string;
    isActive: boolean;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization
    createdAt?: Date;
    updatedAt?: Date;
}

const SupplierSchema = new Schema<ISupplier>({
    name: { type: String, required: true },
    address: { type: String, required: false },
    phone: { type: String, required: false },
    email: String,
    person: String,
    isActive: {type:Boolean, default:true},
    description: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})
    

SupplierSchema.pre('deleteOne', { document: false, query: true }, async function(next) {
    try {
        const supplierId = this.getQuery()._id;
        if (!supplierId) return next();

        await Product.updateMany({ suppliers: supplierId }, { $pull: { suppliers: supplierId } });
        next();
    } catch (error) {
        console.log(error);
    }
});

const Supplier = models?.Supplier || model<ISupplier>('Supplier', SupplierSchema);
export default Supplier;