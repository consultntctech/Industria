'use client'
import LoadingDots from '@/components/misc/LoadingDots';
import { useSettings } from '@/config/useSettings';
import React, { ComponentProps } from 'react'

type PrimaryButtonProps = {
    text:string;
    loading?:boolean
} & ComponentProps<'button'>

const PrimaryButton = ({text, loading, className, ...props}: PrimaryButtonProps) => {
  const {tertiaryColour, primaryColour, isSuccess} = useSettings();
  if(!isSuccess) return null;
  return (
    <button
    disabled={loading}
    style={{backgroundColor:loading? tertiaryColour:primaryColour}}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = tertiaryColour)}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = primaryColour)} 
    className={`${className} cursor-pointer text-white font-semibold rounded p-1`} {...props} >
      <LoadingDots loading={loading} text={text} />
    </button>
  )
}

export default PrimaryButton