import {  model, models, Schema, Types } from "mongoose";
import { IOrganization } from "./org.model";
import { IUser } from "./user.model";
import EType from "./etype.model";
import Equipment from "./equipment.model";

export interface IECategory {
    _id: string;
    name: string;
    description: string;
    creator: string;
    org: string | Types.ObjectId | IOrganization;
    createdBy: string | Types.ObjectId | IUser;
    createdAt: Date;
    updatedAt: Date;
}

const ECategorySchema = new Schema<IECategory>({
    name: { type: String, required: true },
    description: String,
    creator: String,
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
}, {timestamps:true})
    

ECategorySchema.pre('deleteOne', { document: false, query: true }, async function(next) {
    try {
        const ecategoryId = this.getQuery()._id;
       const etypes = await EType.find({ category: ecategoryId }).select('_id').lean();
       const typeIds = etypes.map((type) => type._id);
       await Equipment.deleteMany({ type: { $in: typeIds } });
       await EType.deleteMany({ category: ecategoryId });
        next();
    } catch (error) {
        console.log(error);
        next(error as Error);
    }
});

const ECategory = models?.ECategory || model<IECategory>('ECategory', ECategorySchema);
export default ECategory;