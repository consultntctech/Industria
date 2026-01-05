'use server'

import { IResetPayload, IResponse } from "@/types/Types";
import { connectDB } from "../mongoose";
import Forgot, { IForgot } from "../models/forgot.model";
import { createResetToken, decryptReset } from "../reset";
import { respond, sendPasswordResetEmail } from "../misc";
import { hasPassedOneHour } from "@/functions/dates";
import User from "../models/user.model";


export async function createForgot(email:string):Promise<IResponse>{
    try {
        await connectDB();
        const existingForgot = await Forgot.findOne({email});
        if(existingForgot){
            await Forgot.deleteOne({email});
        }
        const user = await User.findOne({email});
        if(!user){
            return respond('Invalid request parameters', true, {}, 404);
        }
        const cookieData: IResetPayload = {
            email, expires:''
        }
        const cookie = await createResetToken(cookieData);
        // console.log('Cookie: ', cookie)
        if(!cookie){
            return respond('Error occured while creating forgot', true, {}, 500);
        }
        const data:Partial<IForgot> = {
            email, token: cookie
        }

        const forgot = await Forgot.create(data);
        await sendPasswordResetEmail(email, cookie);
        return respond('Password reset request sent. If your email address is correct, check your mail for directions', false, forgot, 201);
    } catch (error) {
        console.log(error);
        return respond('Error occured while creating forgot', true, {}, 500);
    }
}



export async function getForgotByToken(token:string):Promise<IResponse>{
    try {
        await connectDB();
        const forgot = await Forgot.findOne({token});
        if(!forgot){
            return respond('Ivalid request parameters', true, {}, 404);
        }
        const tokenPayload = await decryptReset(forgot.token) as IResetPayload;
        if(!tokenPayload){
            return respond('Invalid or expired token', true, {}, 404);
        }

        const past = await hasPassedOneHour(new Date(tokenPayload.expires));
        if(past){
            await Forgot.deleteOne({token});
            return respond('Invalid or expired token', true, {}, 404);
        }

        const user = await User.findOne({email:tokenPayload.email});
        if(!user){
            return respond('Invalid or expired token', true, {}, 404);
        }
        await Forgot.deleteOne({token});
        return respond('Forgot request valid', false, forgot, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured validating token', true, {}, 500);
    }
}


export async function deleteForgot(email:string):Promise<IResponse>{
    try {
        await connectDB();
        const forgot = await Forgot.findOne({email});
        if(!forgot){
            return respond('Invalid request parameters', true, {}, 404);
        }
        await Forgot.deleteOne({email});
        return respond('Forgot deleted successfully', false, {}, 200);
    } catch (error) {
        console.log(error);
        return respond('Error occured while deleting forgot', true, {}, 500);
    }
}