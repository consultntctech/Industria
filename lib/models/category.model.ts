import { Document, model, models, Schema, Types } from "mongoose";
import { IOrganization } from "./org.model";
import { IUser } from "./user.model";

export interface ICategory extends Document {
    _id: string;
    name: string;
    description: string;
    org: string | Types.ObjectId | IOrganization;
    createdBy: string | Types.ObjectId | IUser;
    createdAt?: Date;
    updatedAt?: Date;
}

const CategorySchema = new Schema<ICategory>({
    name: { type: String, required: true },
    description: String,
    org: { type: Schema.Types.ObjectId, ref: 'Organization', required: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
}, {timestamps:true})
    

const Category = models?.Category || model<ICategory>('Category', CategorySchema);
export default Category;