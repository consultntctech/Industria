import { models, Schema, Types } from "mongoose";
import { IRole } from "./role.model";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";
import { model } from "mongoose";

export interface IRoleTemplate extends Document {
    _id: string;
    name: string;
    description: string;
    roles: string[] | Types.ObjectId[] | IRole[];
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization;
    createdAt: string;
    updatedAt: string;
}

const RoleTemplateSchema = new Schema<IRoleTemplate>({
    name: { type: String, required: true },
    description: String,
    roles: { type: [Schema.Types.ObjectId], ref: 'Role', required: false, default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false }
}, {timestamps:true})

const RoleTemplate = models?.RoleTemplate || model<IRoleTemplate>('RoleTemplate', RoleTemplateSchema);
export default RoleTemplate;