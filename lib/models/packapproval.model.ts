import { model, models, Schema, Types } from "mongoose";
import { Document } from "mongoose";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";
import { IPackage } from "./package.model";

export interface IPackApproval extends Document {
    _id: string;
    name: string;
    package: string | Types.ObjectId | IPackage;
    status: string;
    notes: string;
    approver: string | Types.ObjectId | IUser;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization;
    updatedAt: string;
    createdAt: string;
}

const PackApprovalSchema = new Schema<IPackApproval>({
    name: { type: String, required: true },
    package: { type: Schema.Types.ObjectId, ref: 'Package', required: false },
    status: { type: String, required: true, default:'Pending' },
    notes: String,
    approver: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})


const PackApproval = models?.PackApproval || model<IPackApproval>('PackApproval', PackApprovalSchema);
export default PackApproval;