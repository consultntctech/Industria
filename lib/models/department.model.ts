import { IEmployee } from "./employee.model";
import { IOrganization } from "./org.model";
import { IRole } from "./role.model";
import { IUser } from "./user.model";
import { model, models, Schema, Types } from "mongoose";

export interface IDepartment {
    _id: string;
    name: string;
    head: string | Types.ObjectId | IEmployee;
    headName: string;
    description: string;
    roles: string[] | Types.ObjectId[] | IRole[];
    creator: string;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization;
    createdAt: Date;
    updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>({
    name: { type: String, required: true },
    head: { type: Schema.Types.ObjectId, ref: 'Employee', required: false },
    roles: { type: [Schema.Types.ObjectId], ref: 'Role', required: false, default: [] },
    headName: String,
    description: String,
    creator: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
}, {timestamps:true})
    

const Department = models?.Department || model<IDepartment>('Department', DepartmentSchema);
export default Department;