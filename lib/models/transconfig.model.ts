import {  model, models, Schema, Types } from "mongoose";
import { IOrganization } from "./org.model";
import { IUser } from "./user.model";

export interface CTrans {
    useConfig: boolean,
    length: number
    prefix?: string,
    suffix?: string,
    auto: boolean
}

export interface ITransConfig {
    _id: string;
    salesOrder:CTrans,
    invoice:CTrans,
    createdBy: string | Types.ObjectId | IUser;
    creator: string;
    org: string | Types.ObjectId | IOrganization;
    createdAt: Date;
    updatedAt: Date;
}

const TransConfigSchema = new Schema<ITransConfig>({
    salesOrder:{useConfig:Boolean, length:Number, prefix:String, suffix:String, auto:Boolean},
    invoice:{useConfig:Boolean, length:Number, prefix:String, suffix:String, auto:Boolean},
    creator: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})

const TransConfig = models?.TransConfig || model<ITransConfig>('TransConfig', TransConfigSchema);
export default TransConfig;