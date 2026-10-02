import { Document, model, models, Schema, Types } from "mongoose";
import { IOrganization } from "./org.model";
import { IUser } from "./user.model";
import { IProduction } from "./production.model";
import { IBatch } from "./batch.model";
import Package from "./package.model";
import { IProduct } from "./product.model";
import Alert from "./alert.model";
import LineItem from "./lineitem.model";

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
    canBeRaw: boolean;
    raw: number;
    org: string | Types.ObjectId | IOrganization;
    creator: string;
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
    canBeRaw: {type:Boolean, default:false},
    threshold: {type:Number, default:0},
    quantityLeftToPackage: {type:Number, default:0},
    quantity: Number,
    raw: {type:Number, default:0},
    creator: String,
    batch: { type: Schema.Types.ObjectId, ref: 'Batch', required: false },
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    createdAt: Date,
    updatedAt: Date,
}, { timestamps: true })

type Id = string | Types.ObjectId;

GoodSchema.pre('deleteOne', { document: false, query: true }, async function (next) {
    try {
        const good = await this.model.findOne(this.getQuery()).select('_id');
        if (!good) return next();

        await Promise.all([
            Package.deleteMany({ 'goods.goodId': good._id }),
            cascadeFromGoods([good._id]),
        ]);
        next();
    } catch (error) {
        next(error as Error);
    }
});


async function cascadeFromGoods(ids: Id[]) {
    if (!ids.length) return;
    await Promise.all([
        Alert.deleteMany({ item: { $in: ids }, itemModel: 'Good' }), // only if you use this
        LineItem.deleteMany({ good: { $in: ids } }), // fires the LineItem deleteMany hook, then sales and returns
    ]);
}

GoodSchema.pre('deleteMany', async function (next) {
    try {
        const goods = await this.model.find(this.getQuery()).select('_id');
        await cascadeFromGoods(goods.map(g => g._id));
        next();
    } catch (error) {
        next(error as Error);
    }
});

const Good = models?.Good || model<IGood>('Good', GoodSchema);
export default Good;