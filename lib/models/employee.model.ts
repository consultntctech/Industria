import {  model, models, Schema, Types } from "mongoose";
import { IOrganization } from "./org.model";
import { IDepartment } from "./department.model";
import { IUser } from "./user.model";

export interface IEmployee {
    _id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    photo: string;
    department: string | Types.ObjectId  | IDepartment;
    userAccount: string | Types.ObjectId  | IUser;
    description: string;
    creator: string;
    org: string | Types.ObjectId | IOrganization
    createdAt?: Date;
    updatedAt?: Date;
}

const EmployeeSchema = new Schema<IEmployee>({
    name: { type: String, required: true },
    address: { type: String, required: false },
    phone: { type: String, required: false },
    email: { type: String, required: true, unique:true, lowercase:true },
    department: { type: Schema.Types.ObjectId, ref: 'Department', required: false },
    userAccount: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    photo: {type:String, default:'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740&q=80'},
    creator: String,
    description: String,
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})
    

const Employee = models?.Employee || model<IEmployee>('Employee', EmployeeSchema);
export default Employee;