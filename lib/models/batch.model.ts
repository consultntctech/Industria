import { model, Schema, Types } from "mongoose";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";
import { IBatchConfig } from "./batchconfig.model";
import { models } from "mongoose";

export interface IBatch extends Document {
    _id: string;
    code: string;
    type: string;
    configType: string;
    isConfig: boolean;
    config: string | Types.ObjectId | IBatchConfig;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization
    createdAt?: string;
    updatedAt?: string;
}

const BatchSchema = new Schema<IBatch>({
    code: String,
    type: String,
    configType: String,
    isConfig: { type: Boolean, required: true },
    config: { type: Schema.Types.ObjectId, ref: 'BatchConfig', required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})


const Batch = models?.Batch || model<IBatch>('Batch', BatchSchema);
export default Batch;