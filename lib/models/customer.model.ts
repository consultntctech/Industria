import { Document, model, models, Schema, Types } from "mongoose";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";

export interface ICustomer extends Document {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    person: string;
    description?: string;
    isActive: boolean;
    org: string | Types.ObjectId | IOrganization;
    createdBy: string | Types.ObjectId | IUser;
    createdAt: string;
    updatedAt: string;
}

const CustomerSchema = new Schema<ICustomer>({
    name: String,
    email: String,
    phone: String,
    address: String,
    description: String,
    person: String,
    isActive: { type: Boolean, required: true },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    createdAt: Date,
    updatedAt: Date,
}, { timestamps: true })


const Customer = models?.Customer || model<ICustomer>('Customer', CustomerSchema);
export default Customer;