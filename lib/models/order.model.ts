import { Document, model, Schema, Types } from "mongoose";
import { ICustomer } from "./customer.model";
import { IProduct } from "./product.model";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";
import { models } from "mongoose";
import { IOriginalPrice } from "@/types/Types";

export interface IOrder extends Document {
    _id: string;
    customer: string | Types.ObjectId | ICustomer;
    products: { product: string | Types.ObjectId | IProduct, quantity: number }[];
    quantity: number;
    price: number;
    deadline: string;
    fulfilledAt: string;
    instruction: string;
    creator: string;
    description: string;
    status: string;
    deadlineAlertSent: boolean;
    original: IOriginalPrice;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization;
    createdAt: string;
    updatedAt: string;
}

const OrderSchema = new Schema<IOrder>({
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    products: [{ product:{type: Schema.Types.ObjectId, ref: 'Product', required: true}, quantity: Number }],
    quantity: { type: Number, required: false, default: 1 },
    price: { type: Number, required: false, default: 0 },
    deadline: { type: String, required: false },
    instruction: String,
    creator: String,
    fulfilledAt: { type: String, required: false },
    description: { type: String, required: false },
    status: { type: String, required: true, default: 'Pending' },
    deadlineAlertSent: {type:Boolean, required:false, default:false},
    original: {type:{amount:Number, rate:Number, currency:{type: Schema.Types.ObjectId, ref: 'OtherCurrency'}}, required: false},
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
}, {timestamps:true})


OrderSchema.pre('save', function (next) {
    if (this.isModified('deadline') || (this.isModified('status') && this.status === 'Pending')) {
        this.deadlineAlertSent = false;
    }
    next();
});

const Order = models?.Order || model<IOrder>('Order', OrderSchema);
export default Order;


// export interface IOrder extends Document {
//     _id: string;
//     customer: string | Types.ObjectId | ICustomer;
//     product: string | Types.ObjectId | IProduct;
//     quantity: number;
//     price: number;
//     deadline: string;
//     fulfilledAt: string;
//     instruction: string;
//     creator: string;
//     description: string;
//     status: string;
//     createdBy: string | Types.ObjectId | IUser;
//     org: string | Types.ObjectId | IOrganization;
//     createdAt: string;
//     updatedAt: string;
// }