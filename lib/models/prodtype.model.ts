import { ISupplier } from "./supplier.model";
import { model, models, Schema, Types } from "mongoose";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";

export interface IProdType {
    _id: string;
    name: string;
    nameLower: string;
    code: string;
    codeLower: string;
    category: string;
    subcategory: string,
    uom: string,
    threshold: number,
    stock: number,
    used: number,
    available: number,
    reusable: boolean,
    suppliers: string[] | Types.ObjectId[] | ISupplier[],
    creator: string,
    description: string,
    createdBy: string | Types.ObjectId | IUser,
    org: string | Types.ObjectId | IOrganization,
    createdAt: Date,
    updatedAt: Date,
}


const ProdTypeSchema = new Schema<IProdType>({
    name: { type: String, required: true },
    nameLower: { type: String, required: true },
    code: { type: String, required: true },
    codeLower: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: false },
    uom: { type: String, required: false, default:'units' },
    threshold: { type: Number, required: false, default:0 },
    stock: { type: Number, required: false },
    used: { type: Number, required: false, default:0 },
    available: { type: Number, required: false, default:0 },
    reusable: { type: Boolean, required: false },
    suppliers: { type: [Schema.Types.ObjectId], ref: 'Supplier', required: false },
    creator: String,
    description: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})

const ProdType = models?.ProdType || model<IProdType>('ProdType', ProdTypeSchema);
export default ProdType;