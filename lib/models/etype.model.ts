import {  model, models, Schema, Types } from "mongoose";
import { IOrganization } from "./org.model";
import { IUser } from "./user.model";
import { IECategory } from "./ecategory.model";

export interface IEType {
    _id: string;
    name: string;
    category: string | Types.ObjectId | IECategory;
    qTotal: number;
    qMaintenance: number;
    qAvailable: number;
    qInUse: number;
    description: string;
    creator: string;
    org: string | Types.ObjectId | IOrganization;
    createdBy: string | Types.ObjectId | IUser;
    createdAt: Date;
    updatedAt: Date;
}

const ETypeSchema = new Schema<IEType>({
    name: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'ECategory', required: false },
    qTotal: { type: Number, default: 0 },
    qMaintenance: { type: Number, default: 0 },
    qAvailable: { type: Number, default: 0 },
    qInUse: { type: Number, default: 0 },
    description: String,
    creator: String,
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
}, {timestamps:true})
    

const EType = models?.EType || model<IEType>('EType', ETypeSchema);
export default EType;