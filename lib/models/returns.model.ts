import { model, models, Schema } from "mongoose";
import { ISales } from "./sales.model";

export interface IReturns extends ISales{
    reason: string;
}


const ReturnsSchema = new Schema<IReturns>({
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: false },
    narration: { type: String, required: false },
    quantity: { type: Number, required: false },
    price: { type: Number, required: false },
    discount: { type: Number, required: false },
    charges: { type: Number, required: false },
    products: { type: [Schema.Types.ObjectId], ref:'LineItem', required: true },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    reason: { type: String, required: true },
}, {timestamps:true})


const Returns = models?.Returns || models?.Return || model<IReturns>('Returns', ReturnsSchema);
export default Returns;