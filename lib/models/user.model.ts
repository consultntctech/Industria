import { Document, model, models, Schema, Types } from "mongoose";
import { IOrganization } from "./org.model";
import { IRole } from "./role.model";

export interface IUser extends Document {
    _id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    photo: string;
    hasRequestedUpdate?: boolean;
    password:string;
    roles: string[] | Types.ObjectId[] | IRole[];
    description: string;
    org: string | Types.ObjectId | IOrganization
    createdAt?: Date;
    updatedAt?: Date;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    address: { type: String, required: false },
    phone: { type: String, required: false },
    hasRequestedUpdate: { type: Boolean, default: false },
    email: { type: String, required: true, unique:true },
    photo: {type:String, default:'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80'},
    password: String,
    roles: { type: [Schema.Types.ObjectId], ref: 'Role', required: false, default: [] },
    description: String,
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})
    

const User = models?.User || model<IUser>('User', UserSchema);
export default User;