import { model, models, Schema, Types } from "mongoose";
import { Document } from "mongoose";
import { IProduction } from "./production.model";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";

export interface IProdApproval extends Document {
    _id: string;
    name: string;
    production: string | Types.ObjectId | IProduction;
    status: string;
    notes: string;
    approver: string | Types.ObjectId | IUser;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization;
    updatedAt: string;
    createdAt: string;
}

const ProdApprovalSchema = new Schema<IProdApproval>({
    name: { type: String, required: true },
    production: { type: Schema.Types.ObjectId, ref: 'Production', required: false },
    status: { type: String, required: true },
    notes: String,
    approver: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})


const ProdApproval = models?.ProdApproval || model<IProdApproval>('ProdApproval', ProdApprovalSchema);
export default ProdApproval;