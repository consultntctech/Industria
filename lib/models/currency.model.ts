import { Document, model, models, Schema, Types } from "mongoose";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";

export interface ICurrency extends Document {
    _id: string;
    symbol: string;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization;
    createdAt: Date;
    updatedAt: Date;
}

const CurrencySchema = new Schema<ICurrency>({
    symbol: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})


const Currency = models?.Currency || model<ICurrency>('Currency', CurrencySchema);
export default Currency;