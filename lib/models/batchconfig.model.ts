import { Document, model, models, Schema, Types } from "mongoose";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";

export interface IBatchConfig extends Document {
    _id: string;
    prefix: string;
    suffix: string;
    length: number;
    type: string;
    mode: string;
    increament: number;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization
    createdAt?: string;
    updatedAt?: string;
}

const BatchConfigSchema = new Schema<IBatchConfig>({
    prefix: String,
    suffix: String,
    length: { type: Number, required: true },
    type: { type: String, required: true },
    mode: { type: String, required: true, default:'Custom' },
    increament: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})


const BatchConfig = models?.BatchConfig || model<IBatchConfig>('BatchConfig', BatchConfigSchema);
export default BatchConfig;