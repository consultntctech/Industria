import Image from 'next/image'
import React from 'react'
import TextInput from '../shared/inputs/TextInput'
import PrimaryButton from '../shared/buttons/PrimaryButton'
import Link from 'next/link'

const LoginComp = () => {
  return (
    <div className='flex size-full items-center justify-center h-[100vh]' >
        <form className="formBox py-6 px-8 flex gap-6 flex-col items-center rounded-3xl">
            <div className="flex flex-col gap-2 items-center">
                <Image src="/images/bird-colorful-gradient-design-vector_343694-2506.jpg" alt="logo" width={100} height={100} />
                <span className='title'>Welcome to Industria</span>
                <span className='greyText' >Sing in to manage your manufacturing operations</span>
            </div>

            <div className="flex flex-col items-center w-full gap-4">
                <div className="flex flex-col w-full gap-1">
                    <span className="smallText">Enter your email address</span>
                    <TextInput placeholder="Email" type="email" className="w-full" />
                </div>

                <div className="flex flex-col w-full gap-1">
                    <span className="smallText">Enter your password</span>
                    <TextInput placeholder="Password" type="password" className="w-full" />
                </div>
            </div>

            <div className="flex flex-col gap-4 items-center w-full">
                <PrimaryButton text="Login" className="w-full"/>
                <Link href='/forgot' className='greyText'>Forgot your password?</Link>
            </div>
        </form>
    </div>
  )
}

export default LoginComp