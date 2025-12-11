import { IOperation } from "@/types/Types";
import { Document, model, models, Schema, Types } from "mongoose";
import User, { IUser } from "./user.model";
import { IOrganization } from "./org.model";

export interface IRole extends Document{
    _id: string;
    name: string;
    permissions:{
        tableid: string;
        operations:IOperation[];
    },
    description: string;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization;
    createdAt: string;
    updatedAt: string;
}

const RoleSchema = new Schema<IRole>({
    name: { type: String, required: true },
    description: String,
    permissions:{
        tableid: { type: String, required: true },
        operations: { type: [{id:String, name:String, title:String, description:String}] },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false }
}, {timestamps:true})

RoleSchema.pre('deleteOne', { document: false, query: true }, async function(next) {
    try {
        const roleId = this.getQuery()._id;
        if (!roleId) return next();
        await User.updateMany({ roles: roleId }, { $pull: { roles: roleId } });
        next();
    } catch (error) {
        console.log(error);
        next();
    }
});

const Role = models?.Role || model<IRole>('Role', RoleSchema);
export default Role;