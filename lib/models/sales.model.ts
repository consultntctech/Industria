import { Document, models, Schema, Types } from "mongoose";
import { ICustomer } from "./customer.model";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";
import { ILineItem } from "./lineitem.model";
import { model } from "mongoose";

export interface ISales extends Document {
    _id: string;
    customer: string | Types.ObjectId | ICustomer;
    narration: string;
    quantity: number;
    price: number;
    discount: number;
    charges: number;
    products: string[] | Types.ObjectId[] | ILineItem[];
    org: string | Types.ObjectId | IOrganization;
    createdBy: string | Types.ObjectId | IUser;
    createdAt: string;
    updatedAt: string;
}

const SalesSchema = new Schema<ISales>({
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: false },
    narration: { type: String, required: false },
    quantity: { type: Number, required: false },
    price: { type: Number, required: false },
    discount: { type: Number, required: false },
    charges: { type: Number, required: false },
    products: { type: [Schema.Types.ObjectId], ref:'LineItem', required: true },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
}, {timestamps:true})


const Sales = models?.Sales || model<ISales>('Sales', SalesSchema);
export default Sales;