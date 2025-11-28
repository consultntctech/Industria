import { Document, model, models, Types } from "mongoose";
import { IProduct } from "./product.model";
import { IGood } from "./good.model";
import { IPackage } from "./package.model";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";
import { Schema } from "mongoose";
import { IBatch } from "./batch.model";
import { ICustomer } from "./customer.model";

export interface ILineItem extends Document {
    _id: string;
    name: string;
    serialNumber: string;
    batch: string | Types.ObjectId | IBatch;
    product: string | Types.ObjectId | IProduct;
    good: string | Types.ObjectId | IGood;
    package: string | Types.ObjectId | IPackage;
    soldTo: string | Types.ObjectId | ICustomer;
    status: string;
    price: number;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization;
    createdAt: string;
    updatedAt: string;
}

const LineItemSchema = new Schema<ILineItem>({
    name: { type: String, required: true },
    serialNumber: { type: String, required: false },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: false },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: false },
    good: { type: Schema.Types.ObjectId, ref: 'Good', required: false },
    package: { type: Schema.Types.ObjectId, ref: 'Package', required: false },
    soldTo: { type: Schema.Types.ObjectId, ref: 'Customer', required: false },
    status: { type: String, required: true, default:'Available' },
    price: { type: Number, required: false, default:0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})


const LineItem = models?.LineItem || model<ILineItem>('LineItem', LineItemSchema);
export default LineItem;