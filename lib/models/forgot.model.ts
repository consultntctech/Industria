import { model, models, Schema } from "mongoose";

export interface IForgot {
    _id: string;
    email: string;
    token: string;
    createdAt: string;
    updatedAt: string;
}

const ForgotSchema = new Schema<IForgot>({
    email: { type: String, required: true },
    token: { type: String, required: true },
}, {timestamps:true})

const Forgot = models?.Forgot || model<IForgot>('Forgot', ForgotSchema);
export default Forgot;