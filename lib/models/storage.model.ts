import { model, models, Schema, Types } from "mongoose";
import { Document } from "mongoose";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";

export interface IStorage extends Document {
    _id: string;
    name: string;
    location?: string;
    description?: string;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization;
    createdAt: string;
    updatedAt: string;
}

const StorageSchema = new Schema<IStorage>({
    name: { type: String, required: true },
    location: { type: String, required: false },
    description: { type: String, required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})


const Storage = models?.Storage || model<IStorage>('Storage', StorageSchema);
export default Storage;