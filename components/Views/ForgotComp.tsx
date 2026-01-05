'use client'
import Image from 'next/image'
import React, { useRef, useState } from 'react'
import TextInput from '../shared/inputs/TextInput'
import Link from 'next/link'
import { enqueueSnackbar } from 'notistack'
import LoginButton from '../shared/buttons/LoginButton'
import { createForgot } from '@/lib/actions/forgot.action'
import { Alert } from '@mui/material'

const ForgotComp = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const formRef = useRef<HTMLFormElement>(null);

    

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const res = await createForgot(email);
            // console.log(res)
            enqueueSnackbar(res.message, {variant:res.error?'error':'success'});
            if(!res.error){
                formRef.current?.reset();
                setMessage('Password reset email sent.');
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while sending reset request', {variant:'error'});
            setMessage('');
        }finally{
            setLoading(false);
        }
    }

  return (
    <div className='flex size-full items-center justify-center h-[100vh]' >
        <form ref={formRef} onSubmit={handleSubmit} className="formBox py-6 px-8 flex gap-6 flex-col items-center rounded-3xl">
            <div className="flex flex-col gap-2 items-center">
                <Image src="/images/bird-colorful-gradient-design-vector_343694-2506.jpg" alt="logo" width={100} height={100} />
                <span className='title'>Forgot Password</span>
                <span className='greyText' >Enter your email address to reset your password</span>
            </div>

            <div className="flex flex-col items-center w-full gap-4">
                <div className="flex flex-col w-full gap-1">
                    <span className="smallText">Enter your email address</span>
                    <TextInput required onChange={(e)=>setEmail(e.target.value)} name='email' placeholder="Email" type="email" className="w-full" />
                </div>
                {
                    message &&
                    <Alert variant='standard' severity="success">{message}</Alert>
                }
            </div>

            <div className="flex flex-col gap-4 items-center w-full">
                <LoginButton loading={loading} text={loading?'loading':'Submit'} type="submit" className="w-full"/>
                <Link href='/' className='greyText'>Go back to login</Link>
            </div>
        </form>
    </div>
  )
}

export default ForgotComp