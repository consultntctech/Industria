import { Document, models, Types } from "mongoose";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";
import { model } from "mongoose";
import { Schema } from "mongoose";

export interface IAlert extends Document {
    _id: string;
    title: string;
    body: string;
    type: 'success' | 'error' | 'warning' | 'info';
    item: Types.ObjectId | string;
    itemModel: string;
    receiver: string | Types.ObjectId | IUser;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization;
    createdAt: string;
    updatedAt: string;
}

const AlertSchema = new Schema<IAlert>({
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, required: true },
    item: { type: Schema.Types.ObjectId, refPath: 'itemModel', required: false },
    itemModel: { type: String, required: false },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})

const Alert = models?.Alert || model<IAlert>('Alert', AlertSchema);
export default Alert;