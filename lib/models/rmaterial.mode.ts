import { Document, model, models, Schema, Types } from "mongoose";
import { IOrganization } from "./org.model";
import { IUser } from "./user.model";
import { IProduct } from "./product.model";
import { ISupplier } from "./supplier.model";
import { IBatch } from "./batch.model";

export interface IRMaterial extends Document {
    _id: string;
    materialName: string;
    product: string | Types.ObjectId | IProduct;
    supplier: string | Types.ObjectId | ISupplier;
    batch: string | Types.ObjectId | IBatch;
    qStatus: string;
    dateReceived: Date;
    qReceived: number;
    qRejected: number;
    qAccepted: number;
    note: string;
    unitPrice:number;
    charges: number;
    discount: number;
    price: number;
    yield: number;
    reason: string;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization
    createdAt?: Date;
    updatedAt?: Date;
}

const RMaterialSchema = new Schema<IRMaterial>({
    materialName: { type: String, required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: false },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: false },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: false },
    qStatus: { type: String, required: true },
    dateReceived: { type: Date, required: true },
    qReceived: { type: Number, required: true },
    qRejected: { type: Number, required: false },
    qAccepted: { type: Number, required: true },
    note: String,
    unitPrice: { type: Number, required: false },
    charges: { type: Number, required: false },
    discount: { type: Number, required: false },
    price: { type: Number, required: true },
    yield: { type: Number, required: false },
    reason: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})


const RMaterial = models?.RMaterial || model<IRMaterial>('RMaterial', RMaterialSchema);

export default RMaterial;