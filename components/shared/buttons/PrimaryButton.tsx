'use client'
import LoadingDots from '@/components/misc/LoadingDots';
import { Settings } from '@/config/Settings';
import React, { ComponentProps } from 'react'

type PrimaryButtonProps = {
    text:string;
    loading?:boolean
} & ComponentProps<'button'>

const PrimaryButton = ({text, loading, className, ...props}: PrimaryButtonProps) => {
  return (
    <button
    disabled={loading}
    style={{backgroundColor:loading? Settings().tertiaryColour:Settings().primaryColour}}
    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = Settings().tertiaryColour)}
    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = Settings().primaryColour)} 
    className={`${className} cursor-pointer text-white font-semibold rounded p-1`} {...props} >
      <LoadingDots loading={loading} text={text} />
    </button>
  )
}

export default PrimaryButton