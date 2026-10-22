import { Document, model, models, Schema, Types } from "mongoose";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";
import Production from "./production.model";
import Package from "./package.model";
import { IOriginalPrice } from "@/types/Types";
import { IStorage } from "./storage.model";
import { IProdType } from "./prodtype.model";
import { ISupplier } from "./supplier.model";

export interface IProdItem extends Document {
    _id: string;
    materialName: string;
    name: string;
    quantity: number;
    price: number;
    dateReceived: Date,
    unitPrice: number;
    original: IOriginalPrice;
    qStatus: string;
    stock: number;
    used: number;
    type: string | Types.ObjectId | IProdType;
    suppliers: string[] | Types.ObjectId[] | ISupplier[];
    storages: string[] | Types.ObjectId[] | IStorage[];
    description: string;
    creator: string;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization
    createdAt: string;
    updatedAt: string;
}


const ProdItemSchema = new Schema<IProdItem>({
    materialName: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    dateReceived: {type: Date},
    unitPrice: { type: Number, required: false },
    qStatus: { type: String, required: false, default:'Pass' },
    original: {type:{amount:Number, rate:Number, currency:{type: Schema.Types.ObjectId, ref: 'OtherCurrency'}}, required: false},
    stock: { type: Number, required: false },
    used: { type: Number, required: false, default:0 },
    type: { type: Schema.Types.ObjectId, ref: 'ProdType', required: false },
    storages: [{ type: Schema.Types.ObjectId, ref: 'Storage', default: [] }],
    suppliers: [{ type: Schema.Types.ObjectId, ref: 'Supplier', default: [] }],
    price: { type: Number, required: false },
    creator: String,
    description: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})


ProdItemSchema.pre('deleteOne', { document: false, query: true }, async function(next) {
    try {
        const prodItemId = this.getQuery()._id;
        if (!prodItemId) return next();

        await Promise.all([
            Production.updateMany({ proditems: prodItemId }, { $pull: { proditems: prodItemId } }),
            Package.updateMany({ packagingMaterial: prodItemId }, { $pull: { packagingMaterial: prodItemId } }),
        ])
        next();
    } catch (error) {
        console.log(error);
    }
});

const ProdItem = models?.ProdItem || model<IProdItem>('ProdItem', ProdItemSchema);
export default ProdItem;