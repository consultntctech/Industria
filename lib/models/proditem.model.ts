import { Document, model, models, Schema, Types } from "mongoose";
import { ISupplier } from "./supplier.model";
import { IUser } from "./user.model";
import { IOrganization } from "./org.model";
import Production from "./production.model";

export interface IProdItem extends Document {
    _id: string;
    name: string;
    quantity: number;
    price: number;
    suppliers: string[] | Types.ObjectId[] | ISupplier[];
    description: string;
    createdBy: string | Types.ObjectId | IUser;
    org: string | Types.ObjectId | IOrganization
    createdAt?: Date;
    updatedAt?: Date;
}


const ProdItemSchema = new Schema<IProdItem>({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: false },
    suppliers: { type: [Schema.Types.ObjectId], ref: 'Supplier', required: false },
    description: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
}, {timestamps:true})


ProdItemSchema.pre('deleteOne', { document: false, query: true }, async function(next) {
    try {
        const prodItemId = this.getQuery()._id;
        if (!prodItemId) return next();

        await Production.updateMany({ proditems: prodItemId }, { $pull: { proditems: prodItemId } });
        next();
    } catch (error) {
        console.log(error);
    }
});

const ProdItem = models?.ProdItem || model<IProdItem>('ProdItem', ProdItemSchema);
export default ProdItem;