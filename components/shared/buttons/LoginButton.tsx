'use client'
import LoadingDots from '@/components/misc/LoadingDots';
import  { ComponentProps } from 'react'

type LoginButtonProps = {
    text:string;
    loading?:boolean
} & ComponentProps<'button'>

const LoginButton = ({text, loading, className, ...props}: LoginButtonProps) => {
  return (
    <button
    disabled={loading}
    className={`${className} ${loading ? 'bg-[#005fa3] cursor-default' : 'bg-[#0076D1] hover:bg-[#005fa3]'} cursor-pointer text-white font-semibold rounded p-1`} {...props} >
      <LoadingDots loading={loading} text={text} />
    </button>
  )
}

export default LoginButton