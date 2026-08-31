import {  model, models, Schema, Types } from "mongoose";
import { IOrganization } from "./org.model";
import { IUser } from "./user.model";

export interface IECategory {
    _id: string;
    name: string;
    description: string;
    creator: string;
    org: string | Types.ObjectId | IOrganization;
    createdBy: string | Types.ObjectId | IUser;
    createdAt: Date;
    updatedAt: Date;
}

const ECategorySchema = new Schema<IECategory>({
    name: { type: String, required: true },
    description: String,
    creator: String,
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
}, {timestamps:true})
    

const ECategory = models?.ECategory || model<IECategory>('ECategory', ECategorySchema);
export default ECategory;