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
    creator: string;
    config: string | Types.ObjectId | IBatchConfig;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization
    createdAt?: string;
    updatedAt?: string;
}

const BatchSchema = new Schema<IBatch>({
    code: String,
    type: { type: String, default: 'Raw Material' },
    configType: String,
    creator: String,
    isConfig: { type: Boolean, required: true },
    config: { type: Schema.Types.ObjectId, ref: 'BatchConfig', required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})


// Indexes match the filters used by lib/actions (org-scoped lists sorted by date, lookups by parent).
BatchSchema.index({ org: 1, createdAt: -1 });
// Batch codes are unique per organization (see scripts/batch-code-unique-index.mjs).
BatchSchema.index({ org: 1, code: 1 }, { unique: true });

const Batch = models?.Batch || model<IBatch>('Batch', BatchSchema);
export default Batch;