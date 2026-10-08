import { Document, model, models, Types } from "mongoose";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";
import { IProduct } from "./product.model";
import { IBatch } from "./batch.model";
import { IRMaterial } from "./rmaterial.mode";
import { IProdItem } from "./proditem.model";
import { Schema } from "mongoose";
import ProdApproval from "./prodapproval.model";
import { IOriginalPrice } from "@/types/Types";
import { ILabourer } from './labourer.model';
import Alert from "./alert.model";
import { IEmployee } from "./employee.model";
import Package from "./package.model";
import Good, { IGood } from "./good.model";

export interface ProdIngredient{
    materialId: string
    quantity: number;
    weight: number;
}

export interface IIngredientInProduction {
    materialId: string | Types.ObjectId | IRMaterial;
    quantity: number;
    weight: number;
}

export interface IGoodInProduction {
    materialId: string | Types.ObjectId | IGood;
    quantity: number;
    weight: number;
}

export interface IProdLabourerAllocation {
    labourer: string | Types.ObjectId | ILabourer;
    hoursWorked: number;
    cost: number;
    isOverridden: boolean;
}

export interface IProduction extends Document {
    _id: string;
    name: string;
    supervisor: string | Types.ObjectId | IEmployee;
    supervisors: string[] | Types.ObjectId[] | IEmployee[];
    employees: string[] | Types.ObjectId[] | IEmployee[];
    // labourers: string[] | Types.ObjectId[] | ILabourer[];
    labourerAllocations: IProdLabourerAllocation[];
    batch: string | Types.ObjectId | IBatch;
    productToProduce: string | Types.ObjectId | IProduct;
    status:string;
    ingredients: IIngredientInProduction[];
    goods: IGoodInProduction[];
    proditems?: string[] | Types.ObjectId[] | IProdItem[];
    original:IOriginalPrice;
    inputQuantity: number;
    outputQuantity?: number;
    xquantity?: number;
    rejQuantity?: number;
    lossQuantity?: number;
    productionCost?: number;
    extraCost: number;
    labourCost?: number;
    pCost: number;
    approvedBy?: string | Types.ObjectId | IUser;
    notes?: string;
    reviewNotes?: string;
    creator: string;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization;
    createdAt: string;
    updatedAt: string;
}

const ProductionSchema = new Schema<IProduction>({
    name: { type: String, required: true },
    supervisor: { type: Schema.Types.ObjectId, ref: 'Employee', required: false },
    supervisors: [{ type: Schema.Types.ObjectId, ref: 'Employee', required: false }],
    employees: [{ type: Schema.Types.ObjectId, ref: 'Employee', required: false }],
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: false },
    productToProduce: { type: Schema.Types.ObjectId, ref: 'Product', required: false },
    status: { type: String, required: true },
    ingredients: [{
        materialId: { type: Schema.Types.ObjectId, ref: 'RMaterial', required: true },
        quantity: { type: Number, required: true },
        weight: { type: Number, required: false },
    }],
    goods: [{
        materialId: { type: Schema.Types.ObjectId, ref: 'Good', required: true },
        quantity: { type: Number, required: true },
        weight: { type: Number, required: false },
    }],
    proditems: [{ type: Schema.Types.ObjectId, ref: 'ProdItem', required: false }],
    original: {type:{amount:Number, rate:Number, currency:{type: Schema.Types.ObjectId, ref: 'OtherCurrency'}}, required: false},
    inputQuantity: { type: Number, required: true },
    outputQuantity: { type: Number, required: false },
    xquantity: { type: Number, required: false, default: 0 },
    rejQuantity: { type: Number, required: false, default: 0 },
    lossQuantity: { type: Number, required: false, default: 0 },
    // labourers: [{ type: Schema.Types.ObjectId, ref: 'Labourer', required: false }],
    labourerAllocations: [{
        labourer: { type: Schema.Types.ObjectId, ref: 'Labourer', required: true },
        hoursWorked: { type: Number, required: false },
        cost: { type: Number, required: false },
        isOverridden: { type: Boolean, required: false, default: false },
    }],
    productionCost: { type: Number, required: false },
    labourCost: { type: Number, required: false, default: 0 },
    pCost: { type: Number, required: false, default: 0 },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    notes: String,
    reviewNotes: String,
    creator: String,
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


ProductionSchema.pre('save', async function(next) {
    // console.log('pre-save firing, isNew:', this.isNew);
    this.$locals.wasNew = this.isNew;
    next();
});

ProductionSchema.post('save', async function(doc, next) {
    // console.log('post-save firing, wasNew:', this.$locals.wasNew);
    try {
        if(this.$locals.wasNew){
            await Alert.create({
                title: 'Production Created',
                body: `Production ${doc.name} has been created successfully.`,
                type: 'info',
                item: doc._id,
                itemModel: 'Production',
                receiver: doc.createdBy,
                org: doc.org,
                createdBy: doc.createdBy,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
            });
        }
    } catch (error) {
        next(error as Error);
    }
});


ProductionSchema.pre('deleteOne', { document: false, query: true }, async function (next) {
    try {
        const prod = await this.model.findOne(this.getQuery()).select('_id');
        if (!prod) return next();

        const prodId = prod._id;
        await Promise.all([
            Alert.deleteMany({ item: prodId, itemModel: 'Production' }),
            Package.deleteMany({ production: prodId }), // Package hook removes its line items
            Good.deleteMany({ production: prodId }),    // Good hook (below) removes its line items
            ProdApproval.deleteMany({ production: prodId }),
        ]);
        next();
    } catch (error) {
        next(error as Error);
    }
});

const Production = models?.Production || model<IProduction>('Production', ProductionSchema);
export default Production;