'use server'

import {jwtVerify, SignJWT} from 'jose'
import { ISession } from '@/types/Types';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';


const key = new TextEncoder().encode(process.env.JWT_SECRET!);
const duration = 7 * 24 * 60 * 60 * 1000;

export async function encryptSession (payload:ISession){
    return new SignJWT(JSON.parse(JSON.stringify(payload)))
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function decryptSession (token:string|undefined = ''){
    try {
        const {payload} = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        })
        if(payload) return payload
    } catch (error) {
        // console.log(error);
        console.log('Failed to verify session')
    }
}


export async function createSession(data:ISession){
    const expires = new Date(Date.now() + duration);
    const session = await encryptSession({...data, expires});
    const cookieStore = await cookies();
    cookieStore.set('session', session, {
        path: '/',
        httpOnly: true,
        expires,
        sameSite: 'lax',
        secure:true
    });
}


export async function updateSession(){
    const session = (await cookies()).get('session')?.value;
    const payload = await decryptSession(session);
    if(!session || !payload) return null

    const expires = new Date(Date.now() + duration);
    const cookieStore = await cookies();
    cookieStore.set('session', session, {
        path: '/',
        httpOnly: true,
        expires,
        sameSite: 'lax',
        secure:true
    })
}

export async function getSession():Promise<ISession|null>{
    const session = (await cookies()).get('session')?.value;
    if(!session) return null;
    const payload = await decryptSession(session) as unknown as ISession;
    return payload;
}

export async function destroySession(){
    const cookieStore = await cookies();
    cookieStore.delete('session')
    redirect('/')
}