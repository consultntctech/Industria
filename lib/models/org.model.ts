import { Document, model, models, Schema } from "mongoose";
import User from "./user.model";

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
    createdAt?: Date;
    updatedAt?: Date;
}

export const OrganizationSchema = new Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    appName: String,
    email: { type: String, required: true },
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
        await User.deleteMany({ org: orgId });
        next();
    } catch (error) {
        console.log(error);
    }
});

const Organization = models?.Organization || model('Organization', OrganizationSchema);
export default Organization;