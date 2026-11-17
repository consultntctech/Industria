import { Document, models, Schema, Types } from "mongoose";
import { ICustomer } from "./customer.model";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";
import { ILineItem } from "./lineitem.model";
import { model } from "mongoose";
import { IOriginalPrice } from "@/types/Types";
import { IOrder } from "./order.model";

export interface ISales extends Document {
    _id: string;
    customer: string | Types.ObjectId | ICustomer;
    narration: string;
    quantity: number;
    price: number;
    discount: number;
    charges: number;
    invoice: {
        code: string;
        auto: boolean
    };
    port: string;
    shipping: string;
    container: string;
    billOfLanding: string;
    creator: string;
    order : string | Types.ObjectId | IOrder;
    ordered: boolean;
    original: IOriginalPrice;
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
    discount: { type: Number, required: false, default:0 },
    charges: { type: Number, required: false, default:0 },
    creator: String,
    invoice: {code:{type:String, unique:true}, auto: Boolean},
    port: String,
    shipping: String,
    container: String,
    billOfLanding: String,
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: false },
    ordered: { type: Boolean, required: false, default: false },
    original: {type:{amount:Number, rate:Number, currency:{type: Schema.Types.ObjectId, ref: 'OtherCurrency'}}, required: false},
    products: { type: [Schema.Types.ObjectId], ref:'LineItem', required: true },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
}, {timestamps:true})


// Indexes match the filters used by lib/actions (org-scoped lists sorted by date, lookups by parent).
SalesSchema.index({ org: 1, createdAt: -1 });
SalesSchema.index({ org: 1, customer: 1 });
SalesSchema.index({ order: 1 });

const Sales = models?.Sales || model<ISales>('Sales', SalesSchema);
export default Sales;