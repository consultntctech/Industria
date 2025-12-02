import { Document, model, Schema, Types } from "mongoose";
import { ICustomer } from "./customer.model";
import { IProduct } from "./product.model";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";
import { models } from "mongoose";

export interface IOrder extends Document {
    _id: string;
    customer: string | Types.ObjectId | ICustomer;
    product: string | Types.ObjectId | IProduct;
    quantity: number;
    price: number;
    deadline: string;
    fulfilledAt: string;
    description: string;
    status: string;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization;
    createdAt: string;
    updatedAt: string;
}

const OrderSchema = new Schema<IOrder>({
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: false, default: 1 },
    price: { type: Number, required: false, default: 0 },
    deadline: { type: String, required: false },
    fulfilledAt: { type: String, required: false },
    description: { type: String, required: false },
    status: { type: String, required: true, default: 'Pending' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
}, {timestamps:true})

const Order = models?.Order || model<IOrder>('Order', OrderSchema);
export default Order;