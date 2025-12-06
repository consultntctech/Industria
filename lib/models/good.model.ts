import { Document, model, models, Schema, Types } from "mongoose";
import { IOrganization } from "./org.model";
import { IUser } from "./user.model";
import { IProduction } from "./production.model";
import { IBatch } from "./batch.model";
import Package from "./package.model";
import { IProduct } from "./product.model";

export interface IGood extends Document {
    _id: string;
    name: string;
    serialName: string;
    description: string;
    production: string | Types.ObjectId | IProduction;
    product: string | Types.ObjectId | IProduct;
    // unitPrice: number;
    batch: string | Types.ObjectId | IBatch;
    quantity: number;
    quantityLeftToPackage: number;
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
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: false },
    // unitPrice: Number,
    threshold: {type:Number, default:0},
    quantityLeftToPackage: {type:Number, default:0},
    quantity: Number,
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    createdAt: Date,
    updatedAt: Date,
}, { timestamps: true })

GoodSchema.pre('deleteOne', { document: false, query: true }, async function(next) {
    try {
        const goodId = this.getQuery()._id;
        if (!goodId) return next();
        await Package.updateMany({ good: goodId }, {approvalStatus:'Pending'});
        next();
    } catch (error) {
        console.log(error);
        next();
    }
});

const Good = models?.Good || model<IGood>('Good', GoodSchema);
export default Good;