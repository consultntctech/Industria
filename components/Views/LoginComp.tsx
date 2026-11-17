'use client'
import { LogoMark } from '../brand/Logo'
import React, { useRef, useState } from 'react'
import TextInput from '../shared/inputs/TextInput'
import Link from 'next/link'
import { IUser } from '@/lib/models/user.model'
import { useRouter, useSearchParams } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { loginUser } from '@/lib/actions/user.action'
import LoginButton from '../shared/buttons/LoginButton'
import { queryClient } from '@/lib/queryClient'

const LoginComp = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<IUser>>({});

    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();
    const signedOut = useSearchParams().get('signedOut');

    const handleOnchange = (e:React.ChangeEvent<HTMLInputElement>)=>{
        setData((pre)=>({
            ...pre, [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        try {
            const res = await loginUser(data);
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                // The session cookie is set by the server inside loginUser.
                // Drop anything cached for the anonymous / previous user.
                await queryClient.resetQueries();
                formRef.current?.reset();
                router.replace('/dashboard');
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while logging in', {variant:'error'});
        }finally{
            setLoading(false);
        }
    }

  return (
    <div className='auth-bg flex size-full items-center justify-center min-h-[100vh] p-4' >
        <form ref={formRef} onSubmit={handleSubmit} className="formBox py-8 px-8 flex gap-6 flex-col items-center rounded-3xl w-full max-w-md">
            <div className="flex flex-col gap-2 items-center">
                <LogoMark size={72} />
                <span className='title'>Welcome to Industra</span>
                <span className='greyText' >Sign in to manage your manufacturing operations</span>
            </div>

            {
                signedOut === 'elsewhere' &&
                <div role="status" className="w-full rounded-lg border border-amber-400 bg-amber-50/20 px-3 py-2 text-sm text-amber-900">
                    You were signed out because your account was signed in on another browser or device.
                </div>
            }

            <div className="flex flex-col items-center w-full gap-4">
                <div className="flex flex-col w-full gap-1">
                    <span className="smallText">Enter your email address</span>
                    <TextInput onChange={handleOnchange} name='email' placeholder="Email" type="email" className="w-full" />
                </div>

                <div className="flex flex-col w-full gap-1">
                    <span className="smallText">Enter your password</span>
                    <TextInput onChange={handleOnchange} name='password' placeholder="Password" type="password" className="w-full" />
                </div>
            </div>

            <div className="flex flex-col gap-4 items-center w-full">
                <LoginButton loading={loading} text={loading?'loading':'Login'} type="submit" className="w-full"/>
                <Link href='/forgot' className='greyText'>Forgot your password?</Link>
            </div>
        </form>
    </div>
  )
}

export default LoginComp