import { IOrganization } from "./org.model";
import { model, models, Schema, Types } from "mongoose";
import { IUser } from "./user.model";

export interface ILabourer {
    _id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    note: string;
    org: string | Types.ObjectId | IOrganization;
    creator: string;
    createdBy: string | Types.ObjectId | IUser;
    createdAt: string;
    updatedAt: string;
}

const LabourerSchema = new Schema<ILabourer>({
    name:{type:String, required:true},
    address:{type:String, required:true},
    phone:{type:String, required:true},
    email:{type:String, required:false},
    note:{type:String, required:false},
    org:{type:Schema.Types.ObjectId, ref:'Organization', required:true},
    creator:String,
    createdBy:{type:Schema.Types.ObjectId, ref:'User', required:false},
}, { timestamps: true });


const Labourer = models?.Labourer || model<ILabourer>('Labourer', LabourerSchema);

export default Labourer;