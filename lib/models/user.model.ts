import { Document, model, models, Schema, Types } from "mongoose";
import { IOrganization } from "./org.model";

export interface IUser extends Document {
    _id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    photo: string;
    password:string;
    roles: string[];
    description: string;
    org: string | Types.ObjectId | IOrganization
    createdAt?: Date;
    updatedAt?: Date;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    address: { type: String, required: false },
    phone: { type: String, required: false },
    email: { type: String, required: true, unique:true },
    photo: {type:String, default:'https://cdn-icons-png.flaticon.com/512/9187/9187604.png'},
    password: String,
    roles: [String],
    description: String,
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})
    

const User = models?.User || model<IUser>('User', UserSchema);
export default User;