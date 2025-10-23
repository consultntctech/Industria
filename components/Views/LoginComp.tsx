'use client'
import Image from 'next/image'
import React, { useRef, useState } from 'react'
import TextInput from '../shared/inputs/TextInput'
import Link from 'next/link'
import { IUser } from '@/lib/models/user.model'
import { useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { loginUser } from '@/lib/actions/user.action'
import { ISession } from '@/types/Types'
import { createSession } from '@/lib/session'
import LoginButton from '../shared/buttons/LoginButton'

const LoginComp = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Partial<IUser>>({});

    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

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
                const session = res.payload as ISession;
                await createSession(session);
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
    <div className='flex size-full items-center justify-center h-[100vh]' >
        <form ref={formRef} onSubmit={handleSubmit} className="formBox py-6 px-8 flex gap-6 flex-col items-center rounded-3xl">
            <div className="flex flex-col gap-2 items-center">
                <Image src="/images/bird-colorful-gradient-design-vector_343694-2506.jpg" alt="logo" width={100} height={100} />
                <span className='title'>Welcome to Industria</span>
                <span className='greyText' >Sign in to manage your manufacturing operations</span>
            </div>

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