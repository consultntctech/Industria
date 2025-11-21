'use client'
import LoadingDots from '@/components/misc/LoadingDots';
import { useSettings } from '@/config/useSettings';
import React, { ComponentProps } from 'react'

type SecondaryButtonProps = {
    text:string;
    loading?:boolean
} & ComponentProps<'button'>

const SecondaryButton = ({text, loading, className, ...props}: SecondaryButtonProps) => {
  const {tertiaryColour, secondaryColour, isSuccess} = useSettings();
  if(!isSuccess || !secondaryColour || !tertiaryColour) return null;
  return (
    <button
        disabled={loading}
        style={{backgroundColor:loading? tertiaryColour:secondaryColour}}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = tertiaryColour)}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = secondaryColour)} 
        className={`${className} cursor-pointer text-white font-semibold rounded p-1`} {...props} >
        <LoadingDots loading={loading} text={text} />
    </button>
  )
}

export default SecondaryButton