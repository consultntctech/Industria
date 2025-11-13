import { Document, model, models, Schema, Types } from "mongoose";
import { IOrganization } from "./org.model";
import { IUser } from "./user.model";
import { IProduction } from "./production.model";

export interface IGood extends Document {
    _id: string;
    name: string;
    serialName: string;
    description: string;
    production: string | Types.ObjectId | IProduction;
    unitPrice: number;
    quantity: number;
    threshold: number;
    org: string | Types.ObjectId | IOrganization;
    createdBy: string | Types.ObjectId | IUser;
    createdAt: string;
    updatedAt: string;
}

const GoodSchema = new Schema<IGood>({
    name: String,
    serialName: String,
    description: String,
    production: { type: Schema.Types.ObjectId, ref: 'Production', required: false },
    unitPrice: Number,
    threshold: {type:Number, default:0},
    quantity: Number,
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    createdAt: Date,
    updatedAt: Date,
}, { timestamps: true })


const Good = models?.Good || model<IGood>('Good', GoodSchema);
export default Good;