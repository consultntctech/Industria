'use server'

import { resetKey } from "@/Data/constants";
import { IResetPayload } from "@/types/Types";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";


const duration = 60 * 60 * 1000; // 1 hour

export async function encryptReset(payload:IResetPayload){
    return new SignJWT(JSON.parse(JSON.stringify(payload)))
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(resetKey);
}


export async function decryptReset(token:string|undefined = ''){
    try {
        const {payload} = await jwtVerify(token, resetKey, {
            algorithms: ['HS256'],
        })
        if(payload) return payload as unknown as IResetPayload
    } catch (error) {
        console.log('Failed to verify reset token')
    }
}


export async function createResetToken(data:IResetPayload): Promise<string | null>{
    try {
        const expires = new Date(Date.now() + duration);
        const token = await encryptReset({...data, expires});
        const cookieStore = await cookies();
        cookieStore.set('reset', token, {
            path: '/',
            httpOnly: true,
            expires,
            sameSite: 'lax',
            secure:true
        });
        return token;
    } catch (error) {
        console.log('Failed to create reset token');
        console.log(error);
        return null;
    }
}


export async function updateResetToken(){
    try {
        const token = (await cookies()).get('reset')?.value;
        const payload = await decryptReset(token);
        if(!token || !payload) return null

        const expires = new Date(Date.now() + duration);
        const cookieStore = await cookies();
        cookieStore.set('reset', token, {
            path: '/',
            httpOnly: true,
            expires,
            sameSite: 'lax',
            secure:true
        })
    } catch (error) {
        console.log(error);
        console.log('Failed to update reset token');
    }
}


export async function getResetToken():Promise<IResetPayload|null>{
    try {
        const token = (await cookies()).get('reset')?.value;
        if(!token) return null;
        const payload = await decryptReset(token) as unknown as IResetPayload;
        return payload;
    } catch (error) {
        console.log(error);
        console.log('Failed to get reset token');
        return null;
    }
}


export async function destroyResetToken(){
    try {
        const cookieStore = await cookies();
        cookieStore.delete('reset')
    } catch (error) {
        console.log(error);
        console.log('Failed to destroy reset token');
    }
}
