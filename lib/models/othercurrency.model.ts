import { model, models, Schema, Types } from "mongoose";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";

export interface IOtherCurrency {
    _id: string;
    name: string;
    symbol: string;
    rate: number;
    note: string;
    creator: string
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization;
    createdAt: Date;
    updatedAt: Date;
}

const OtherCurrencySchema = new Schema<IOtherCurrency>({
    name: { type: String, required: false, default: 'Default'},
    symbol: { type: String, required: true },
    note: String,
    rate: { type: Number, required: true },
    creator: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})


const OtherCurrency = models?.OtherCurrency || model<IOtherCurrency>('OtherCurrency', OtherCurrencySchema);
export default OtherCurrency;