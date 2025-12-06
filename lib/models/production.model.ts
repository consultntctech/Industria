import { Document, model, models, Types } from "mongoose";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";
import { IProduct } from "./product.model";
import { IBatch } from "./batch.model";
import { IRMaterial } from "./rmaterial.mode";
import { IProdItem } from "./proditem.model";
import { Schema } from "mongoose";
import ProdApproval from "./prodapproval.model";

export interface ProdIngredient{
    materialId: string
    quantity: number;
}

export interface IProduction extends Document {
    _id: string;
    name: string;
    supervisor: string | Types.ObjectId | IUser;
    batch: string | Types.ObjectId | IBatch;
    productToProduce: string | Types.ObjectId | IProduct;
    status:string;
    ingredients: {
        materialId: string | Types.ObjectId | IRMaterial;
        quantity: number;
    }[];
    proditems?: string[] | Types.ObjectId[] | IProdItem[];
    inputQuantity: number;
    outputQuantity?: number;
    xquantity?: number;
    rejQuantity?: number;
    lossQuantity?: number;
    productionCost?: number;
    extraCost: number;
    approvedBy?: string | Types.ObjectId | IUser;
    notes?: string;
    reviewNotes?: string;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization;
    createdAt: string;
    updatedAt: string;
}

const ProductionSchema = new Schema<IProduction>({
    name: { type: String, required: true },
    supervisor: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: false },
    productToProduce: { type: Schema.Types.ObjectId, ref: 'Product', required: false },
    status: { type: String, required: true },
    ingredients: [{
        materialId: { type: Schema.Types.ObjectId, ref: 'RMaterial', required: true },
        quantity: { type: Number, required: true },
    }],
    proditems: [{ type: Schema.Types.ObjectId, ref: 'ProdItem', required: false }],
    inputQuantity: { type: Number, required: true },
    outputQuantity: { type: Number, required: false },
    xquantity: { type: Number, required: false, default: 0 },
    rejQuantity: { type: Number, required: false, default: 0 },
    lossQuantity: { type: Number, required: false, default: 0 },
    productionCost: { type: Number, required: false },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    notes: String,
    reviewNotes: String,
    extraCost: { type: Number, required: false, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})

ProductionSchema.pre('deleteOne', { document: false, query: true }, async function(next) {
    try {
        const prodId = this.getQuery()._id;
        if (!prodId) return next();
        await ProdApproval.deleteOne({ production: prodId });
        next();
    } catch (error) {
        console.log(error);
        next();
    }
});

const Production = models?.Production || model<IProduction>('Production', ProductionSchema);
export default Production;