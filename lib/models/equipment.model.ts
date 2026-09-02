import {  model, models, Schema, Types } from "mongoose";
import { IOrganization } from "./org.model";
import { IUser } from "./user.model";
import { IEType } from "./etype.model";
import { IStorage } from "./storage.model";
import { IOriginalPrice } from "@/types/Types";

export interface IEquipment {
    _id: string;
    name: string;
    type: string | Types.ObjectId | IEType;
    brand: string;
    model: string;
    price: number;
    original: IOriginalPrice;
    serialNumber: string;
    tag: string;
    location: string | Types.ObjectId | IStorage;
    status: 'Available' | 'In Use' | 'Maintenance';
    description: string;
    creator: string;
    purchaseDate: string;
    org: string | Types.ObjectId | IOrganization;
    createdBy: string | Types.ObjectId | IUser;
    createdAt: Date;
    updatedAt: Date;
}

const EquipmentSchema = new Schema<IEquipment>({
    name: { type: String, required: true },
    type: { type: Schema.Types.ObjectId, ref: 'EType', required: false },
    brand: String,
    model: String,
    serialNumber: String,
    tag: String,
    price: { type: Number, default: 0 },
    location: { type: Schema.Types.ObjectId, ref: 'Storage', required: false },
    status: { type: String, enum: ['Available', 'In Use', 'Maintenance'], default: 'Available' },
    original: {type:{amount:Number, rate:Number, currency:{type: Schema.Types.ObjectId, ref: 'OtherCurrency'}}, required: false},
    description: String,
    creator: String,
    purchaseDate: String,
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
}, {timestamps:true})
    

const Equipment = models?.Equipment || model<IEquipment>('Equipment', EquipmentSchema);
export default Equipment;