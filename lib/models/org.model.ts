import { Document, model, models, Schema } from "mongoose";
import User from "./user.model";
import Labourer from "./labourer.model";
import Employee from "./employee.model";
import { IUser } from "./user.model";
import { Types } from "mongoose";

export interface IOrganization extends Document {
    _id: string;
    name: string;
    address: string;
    phone: string;
    appName:string;
    email: string;
    website: string;
    logo: string;
    pcolor: string;
    scolor: string;
    tcolor: string;
    description: string;
    hasAgreedTerms: boolean;
    termsAcceptedAt: Date;
    createdBy: string | Types.ObjectId | IUser;
    termsVersion: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export const OrganizationSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    appName: String,
    email: { type: String, required: true },
    hasAgreedTerms: { type: Boolean, default: false },
    termsAcceptedAt: { type: Date },
    termsVersion: String,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    website: String,
    logo: {type:String, default:'https://thumbs.dreamstime.com/b/real-estate-logo-home-house-simple-design-vector-icons-135196436.jpg'},
    pcolor: String,
    scolor: String,
    tcolor: String,
    description: String,
}, {timestamps:true})
    

OrganizationSchema.pre('deleteOne', { document: false, query: true }, async function(next) {
    try {
        const orgId = this.getQuery()._id;
        await Promise.all([
            User.deleteMany({ org: orgId }),
            Labourer.deleteMany({ org: orgId }),
            Employee.deleteMany({ org: orgId }),
        ]);
        next();
    } catch (error) {
        console.log(error);
    }
});

const Organization = models?.Organization || model('Organization', OrganizationSchema);
export default Organization;