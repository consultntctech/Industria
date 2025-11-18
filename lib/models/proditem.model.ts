import { Document, model, models, Schema, Types } from "mongoose";
import { ISupplier } from "./supplier.model";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";
import Production from "./production.model";
import Package from "./package.model";

export interface IProdItem extends Document {
    _id: string;
    materialName: string;
    name: string;
    quantity: number;
    price: number;
    reusable: boolean;
    suppliers: string[] | Types.ObjectId[] | ISupplier[];
    description: string;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization
    createdAt: string;
    updatedAt: string;
}


const ProdItemSchema = new Schema<IProdItem>({
    materialName: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: false },
    reusable: { type: Boolean, required: false },
    suppliers: { type: [Schema.Types.ObjectId], ref: 'Supplier', required: false },
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