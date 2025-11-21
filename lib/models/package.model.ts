import { Document, model, models, Schema, Types } from "mongoose";
import { IUser } from "./user.model";
import { IGood } from "./good.model";
import { IBatch } from "./batch.model";
import { IStorage } from "./storage.model";
import { IOrganization } from "./org.model";
import { IProdItem } from "./proditem.model";
import PackApproval from "./packapproval.model";

export interface IProdItemQuantity {
    materialId: string | Types.ObjectId | IProdItem;
    quantity: number;
}

export interface IPackage extends Document {
    _id: string;
    name: string;
    supervisor: string | Types.ObjectId | IUser;
    packagingType: string;
    packagingMaterial: IProdItemQuantity[];
    good: string | Types.ObjectId | IGood;
    useProdBatch: boolean;
    batch: string | Types.ObjectId | IBatch;
    quantity: number;
    rejected: number;
    accepted: number;
    weight: string;
    qStatus: string;
    sold: number;
    comment: string;
    approvalStatus: string;
    approvedBy: string | Types.ObjectId | IUser;
    storage: string | Types.ObjectId | IStorage;
    cost: number;
    description: string;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization;
    createdAt: string;
    updatedAt: string;
}

export interface IProdItemPopulate extends IProdItem {
    quantity: number;
    materialId: string | Types.ObjectId | IProdItem;
}

const PackageSchema = new Schema<IPackage>({
    name: { type: String, required: true },
    supervisor: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    packagingType: { type: String, required: true },
    packagingMaterial: [{
        materialId: { type: Schema.Types.ObjectId, ref: 'ProdItem', required: false },
        quantity: { type: Number, required: false, default: 1 },
    }],
    good: { type: Schema.Types.ObjectId, ref: 'Good', required: true },
    useProdBatch: { type: Boolean, required: false },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: false },
    quantity: { type: Number, required: true },
    rejected: { type: Number, required: false, default: 0 },
    accepted: { type: Number, required: false, default: 0 },
    sold: { type: Number, required: false, default: 0 },
    weight: { type: String, required: false },
    qStatus: { type: String, required: false, default:'Pass' },
    comment: { type: String, required: false },
    approvalStatus: { type: String, required: false, default:'Pending' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    storage: { type: Schema.Types.ObjectId, ref: 'Storage', required: false },
    cost: { type: Number, required: false },
    description: { type: String, required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, { timestamps: true })


PackageSchema.pre('deleteOne', { document: false, query: true }, async function(next) {
    try {
        const packId = this.getQuery()._id;
        if (!packId) return next();

        await PackApproval.deleteMany({ package: packId });
        next();
    } catch (error) {
        console.log(error);
    }
});

const Package = models?.Package || model<IPackage>('Package', PackageSchema);
export default Package;