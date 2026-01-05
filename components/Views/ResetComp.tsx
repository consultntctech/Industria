'use client'
import Image from 'next/image'
import React, { useRef, useState } from 'react'
import TextInput from '../shared/inputs/TextInput'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { enqueueSnackbar } from 'notistack'
import { changePasswordByEmail } from '@/lib/actions/user.action'
import LoginButton from '../shared/buttons/LoginButton'
import { validatePasswordReset } from '@/functions/helpers'
// import { getForgotByToken } from '@/lib/actions/forgot.action'
// import { IForgot } from '@/lib/models/forgot.model'
import { useFetchUserReset } from '@/hooks/fetch/useFetchUsers'

type PasswordProps = {
    password: string;
    password1: string;
}

const ResetComp = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<PasswordProps>({ password: '', password1: '' });

    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    const {forgot} = useFetchUserReset();

    const handleOnchange = (e:React.ChangeEvent<HTMLInputElement>)=>{
        setData((pre)=>({
            ...pre, [e.target.name]: e.target.value
        }))
    }
;

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        try {
            if(!forgot){
                enqueueSnackbar('No request received for this operation', {variant:'error'});
                return;
            }
            const valid = validatePasswordReset(data?.password, data?.password1);
            if(valid.error){
                enqueueSnackbar(valid.message, {variant:'error'});
                return;
            }
            
            const resetRes = await changePasswordByEmail(forgot?.email, data.password);
            enqueueSnackbar(resetRes.message, {variant:resetRes.error?'error':'success'});
            if(!resetRes.error){
                formRef.current?.reset();
                router.replace('/');
            }
        } catch (error) {
            console.log(error);
            enqueueSnackbar('Error occured while resetting password', {variant:'error'});
        }finally{
            setLoading(false);
        }
    }

  return (
    <div className='flex size-full items-center justify-center h-[100vh]' >
        <form ref={formRef} onSubmit={handleSubmit} className="formBox py-6 px-8 flex gap-6 flex-col items-center rounded-3xl">
            <div className="flex flex-col gap-2 items-center">
                <Image src="/images/bird-colorful-gradient-design-vector_343694-2506.jpg" alt="logo" width={100} height={100} />
                <span className='title'>Reset your Industra password</span>
                <span className='greyText' >Create a new password to access your Industra account</span>
            </div>

            <div className="flex flex-col items-center w-full gap-4">
                <div className="flex flex-col w-full gap-1">
                    <span className="smallText">Enter new password</span>
                    <TextInput min={8} onChange={handleOnchange} required name='password' placeholder="New password" type="password" className="w-full" />
                </div>

                <div className="flex flex-col w-full gap-1">
                    <span className="smallText">Confirm new password</span>
                    <TextInput min={8} onChange={handleOnchange} required name='password1' placeholder="Confirm password" type="password" className="w-full" />
                </div>
            </div>

            <div className="flex flex-col gap-4 items-center w-full">
                <LoginButton loading={loading} text={loading?'loading':'Reset'} type="submit" className="w-full"/>
                <Link href='/forgot' className='greyText'>Go back to login</Link>
            </div>
        </form>
    </div>
  )
}

export default ResetComp